/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  RecordingState,
  RecordedSession,
  RecordedSample,
} from '../types/sensor';
import { useWebSocket } from './WebSocketContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'gf_sessions';
const MAX_SESSIONS = 50;

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── CSV serializer ───────────────────────────────────────────────────────────

function sessionToCSV(session: RecordedSession): string {
  const headers = [
    'timestamp', 'seq_offset',
    'flex_thumb', 'flex_index', 'flex_middle', 'flex_ring', 'flex_pinky',
    'imu_accelX', 'imu_accelY', 'imu_accelZ',
    'imu_gyroX', 'imu_gyroY', 'imu_gyroZ',
    'imu_pitch', 'imu_roll', 'imu_yaw',
    'label',
  ].join(',');

  const rows = session.samples.map((s, i) => [
    s.t,
    i,
    s.flex.thumb, s.flex.index, s.flex.middle, s.flex.ring, s.flex.pinky,
    s.imu.accelX.toFixed(4), s.imu.accelY.toFixed(4), s.imu.accelZ.toFixed(4),
    s.imu.gyroX.toFixed(3), s.imu.gyroY.toFixed(3), s.imu.gyroZ.toFixed(3),
    s.imu.pitch.toFixed(2), s.imu.roll.toFixed(2), s.imu.yaw.toFixed(2),
    `"${session.label}"`,
  ].join(','));

  return [headers, ...rows].join('\n');
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function persistSessions(sessions: RecordedSession[]) {
  // Store metadata only (no samples) to avoid localStorage quota
  const meta = sessions.map(s => ({ ...s, samples: [] }));
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(meta));
  } catch { /* quota exceeded — ignore */ }
}

// ─── Context types ────────────────────────────────────────────────────────────

interface SessionRecorderContextValue {
  recordingState: RecordingState;
  activeLabel: string;
  setActiveLabel: (label: string) => void;
  elapsedMs: number;
  sampleCount: number;
  liveSamples: RecordedSample[];   // last 60 for spark preview
  sessions: RecordedSession[];
  startRecording: () => void;
  stopRecording: () => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  exportSessionCSV: (session: RecordedSession) => void;
  exportSessionJSON: (session: RecordedSession) => void;
  exportAllCSV: () => void;
}

const SessionRecorderContext = createContext<SessionRecorderContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SessionRecorderProvider({ children }: { children: React.ReactNode }) {
  const { latestPacket } = useWebSocket();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [activeLabel, setActiveLabel] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sampleCount, setSampleCount] = useState(0);
  const [liveSamples, setLiveSamples] = useState<RecordedSample[]>([]);
  const [sessions, setSessions] = useState<RecordedSession[]>([]);

  const samplesRef = useRef<RecordedSample[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Ingest packets while recording ───────────────────────────────────────
  useEffect(() => {
    if (recordingState !== 'recording' || !latestPacket) return;

    const sample: RecordedSample = {
      t: latestPacket.timestamp,
      flex: latestPacket.flex,
      imu: latestPacket.imu,
    };

    samplesRef.current.push(sample);
    setSampleCount(samplesRef.current.length);
    setLiveSamples(prev => [...prev, sample].slice(-60));
  }, [latestPacket, recordingState]);

  // ── Elapsed timer ────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Start / stop ─────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    samplesRef.current = [];
    setSampleCount(0);
    setLiveSamples([]);
    setElapsedMs(0);
    startTimeRef.current = Date.now();
    setRecordingState('recording');
    startTimer();
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    stopTimer();
    setRecordingState('idle');

    const endedAt = Date.now();
    const durationMs = endedAt - startTimeRef.current;
    const samples = [...samplesRef.current];

    if (samples.length === 0) return;

    const avgRate = samples.length / (durationMs / 1000);
    const session: RecordedSession = {
      id: generateId(),
      label: activeLabel.trim() || 'unlabeled',
      startedAt: startTimeRef.current,
      endedAt,
      durationMs,
      sampleCount: samples.length,
      samples,
      packetRate: Math.round(avgRate),
    };

    setSessions(prev => {
      const next = [session, ...prev].slice(0, MAX_SESSIONS);
      persistSessions(next);
      return next;
    });
    setElapsedMs(durationMs);
  }, [stopTimer, activeLabel]);

  // ── Session management ───────────────────────────────────────────────────
  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      persistSessions(next);
      return next;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  // ── Export ───────────────────────────────────────────────────────────────
  const exportSessionCSV = useCallback((session: RecordedSession) => {
    const csv = sessionToCSV(session);
    const slug = session.label.replace(/\s+/g, '_').toLowerCase();
    downloadBlob(csv, `gloveflow_${slug}_${session.startedAt}.csv`, 'text/csv');
  }, []);

  const exportSessionJSON = useCallback((session: RecordedSession) => {
    const json = JSON.stringify(session, null, 2);
    const slug = session.label.replace(/\s+/g, '_').toLowerCase();
    downloadBlob(json, `gloveflow_${slug}_${session.startedAt}.json`, 'application/json');
  }, []);

  const exportAllCSV = useCallback(() => {
    if (sessions.length === 0) return;
    const allCSV = sessions
      .map(s => sessionToCSV(s))
      .join('\n\n');
    downloadBlob(allCSV, `gloveflow_all_sessions_${Date.now()}.csv`, 'text/csv');
  }, [sessions]);

  return (
    <SessionRecorderContext.Provider value={{
      recordingState, activeLabel, setActiveLabel,
      elapsedMs, sampleCount, liveSamples,
      sessions,
      startRecording, stopRecording,
      deleteSession, clearAllSessions,
      exportSessionCSV, exportSessionJSON, exportAllCSV,
    }}>
      {children}
    </SessionRecorderContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSessionRecorder(): SessionRecorderContextValue {
  const ctx = useContext(SessionRecorderContext);
  if (!ctx) throw new Error('useSessionRecorder must be used inside <SessionRecorderProvider>');
  return ctx;
}

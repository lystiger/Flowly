import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  CalibrationProfile,
  CalibrationSnapshot,
  CapturePhase,
  FingerKey,
  NormalizedFrame,
} from '../types/sensor';
import { useWebSocket } from './WebSocketContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_COUNT = 30;       // packets averaged per capture
const STORAGE_KEY = 'gf_calibration_profiles';
const FINGERS: FingerKey[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

function emptyProfile(name: string): CalibrationProfile {
  return { name, createdAt: Date.now(), open: null, closed: null };
}

function averageSnapshots(samples: CalibrationSnapshot[]): CalibrationSnapshot {
  const sums: Record<string, number> = { thumb: 0, index: 0, middle: 0, ring: 0, pinky: 0 };
  for (const s of samples) FINGERS.forEach(f => { sums[f] += s[f]; });
  return Object.fromEntries(
    FINGERS.map(f => [f, Math.round(sums[f] / samples.length)])
  ) as unknown as CalibrationSnapshot;
}

function computeNormalized(
  raw: CalibrationSnapshot,
  open: CalibrationSnapshot,
  closed: CalibrationSnapshot
): NormalizedFrame {
  const entries = FINGERS.map(f => {
    const range = closed[f] - open[f];
    if (range === 0) return [f, 0] as const;
    return [f, Math.min(1, Math.max(0, (raw[f] - open[f]) / range))] as const;
  });
  return {
    thumb:  entries[0][1],
    index:  entries[1][1],
    middle: entries[2][1],
    ring:   entries[3][1],
    pinky:  entries[4][1],
  } satisfies NormalizedFrame;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalibrationContextValue {
  profile: CalibrationProfile;
  profileList: string[];
  openPhase: CapturePhase;
  closedPhase: CapturePhase;
  openProgress: number;   // 0–1
  closedProgress: number; // 0–1
  normalizedLive: NormalizedFrame | null;
  captureOpen: () => void;
  captureClosed: () => void;
  resetCapture: (pose: 'open' | 'closed') => void;
  saveProfile: () => void;
  loadProfile: (name: string) => void;
  deleteProfile: (name: string) => void;
  renameProfile: (name: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CalibrationContext = createContext<CalibrationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CalibrationProvider({ children }: { children: React.ReactNode }) {
  const { latestPacket } = useWebSocket();

  const [profile, setProfile] = useState<CalibrationProfile>(emptyProfile('Default'));
  const [profileList, setProfileList] = useState<string[]>([]);

  const [openPhase, setOpenPhase] = useState<CapturePhase>('idle');
  const [closedPhase, setClosedPhase] = useState<CapturePhase>('idle');
  const [openProgress, setOpenProgress] = useState(0);
  const [closedProgress, setClosedProgress] = useState(0);

  const openSamplesRef = useRef<CalibrationSnapshot[]>([]);
  const closedSamplesRef = useRef<CalibrationSnapshot[]>([]);

  // ── Persist / load profiles ───────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: CalibrationProfile[] = JSON.parse(raw);
        setProfileList(stored.map(p => p.name));
      }
    } catch { /* ignore */ }
  }, []);

  const persistProfiles = useCallback((profiles: CalibrationProfile[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    setProfileList(profiles.map(p => p.name));
  }, []);

  const saveProfile = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: CalibrationProfile[] = raw ? JSON.parse(raw) : [];
      const idx = existing.findIndex(p => p.name === profile.name);
      const updated = [...existing];
      if (idx >= 0) updated[idx] = profile;
      else updated.push(profile);
      persistProfiles(updated);
    } catch { /* ignore */ }
  }, [profile, persistProfiles]);

  const loadProfile = useCallback((name: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const existing: CalibrationProfile[] = JSON.parse(raw);
      const found = existing.find(p => p.name === name);
      if (found) {
        setProfile(found);
        setOpenPhase(found.open ? 'done' : 'idle');
        setClosedPhase(found.closed ? 'done' : 'idle');
        setOpenProgress(found.open ? 1 : 0);
        setClosedProgress(found.closed ? 1 : 0);
      }
    } catch { /* ignore */ }
  }, []);

  const deleteProfile = useCallback((name: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: CalibrationProfile[] = raw ? JSON.parse(raw) : [];
      persistProfiles(existing.filter(p => p.name !== name));
    } catch { /* ignore */ }
  }, [persistProfiles]);

  const renameProfile = useCallback((name: string) => {
    setProfile(prev => ({ ...prev, name }));
  }, []);

  // ── Sampling via latest packet ────────────────────────────────────────────
  useEffect(() => {
    if (!latestPacket) return;
    const snap = latestPacket.flex as CalibrationSnapshot;

    if (openPhase === 'sampling') {
      openSamplesRef.current.push(snap);
      const progress = openSamplesRef.current.length / SAMPLE_COUNT;
      setOpenProgress(progress);
      if (openSamplesRef.current.length >= SAMPLE_COUNT) {
        const avg = averageSnapshots(openSamplesRef.current);
        setProfile(prev => ({ ...prev, open: avg }));
        setOpenPhase('done');
        setOpenProgress(1);
      }
    }

    if (closedPhase === 'sampling') {
      closedSamplesRef.current.push(snap);
      const progress = closedSamplesRef.current.length / SAMPLE_COUNT;
      setClosedProgress(progress);
      if (closedSamplesRef.current.length >= SAMPLE_COUNT) {
        const avg = averageSnapshots(closedSamplesRef.current);
        setProfile(prev => ({ ...prev, closed: avg }));
        setClosedPhase('done');
        setClosedProgress(1);
      }
    }
  }, [latestPacket, openPhase, closedPhase]);

  // ── Normalized live frame ────────────────────────────────────────────────
  const normalizedLive: NormalizedFrame | null =
    latestPacket && profile.open && profile.closed
      ? computeNormalized(latestPacket.flex as CalibrationSnapshot, profile.open, profile.closed)
      : null;

  // ── Capture triggers ─────────────────────────────────────────────────────
  const captureOpen = useCallback(() => {
    openSamplesRef.current = [];
    setOpenPhase('sampling');
    setOpenProgress(0);
  }, []);

  const captureClosed = useCallback(() => {
    closedSamplesRef.current = [];
    setClosedPhase('sampling');
    setClosedProgress(0);
  }, []);

  const resetCapture = useCallback((pose: 'open' | 'closed') => {
    if (pose === 'open') {
      openSamplesRef.current = [];
      setOpenPhase('idle');
      setOpenProgress(0);
      setProfile(prev => ({ ...prev, open: null }));
    } else {
      closedSamplesRef.current = [];
      setClosedPhase('idle');
      setClosedProgress(0);
      setProfile(prev => ({ ...prev, closed: null }));
    }
  }, []);

  return (
    <CalibrationContext.Provider value={{
      profile, profileList,
      openPhase, closedPhase,
      openProgress, closedProgress,
      normalizedLive,
      captureOpen, captureClosed, resetCapture,
      saveProfile, loadProfile, deleteProfile, renameProfile,
    }}>
      {children}
    </CalibrationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCalibration(): CalibrationContextValue {
  const ctx = useContext(CalibrationContext);
  if (!ctx) throw new Error('useCalibration must be used inside <CalibrationProvider>');
  return ctx;
}

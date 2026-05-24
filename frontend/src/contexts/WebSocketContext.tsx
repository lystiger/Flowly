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
  ConnectionState,
  FlowEvent,
  FlowEventKind,
  FlowHealthState,
  LatencyPoint,
  SensorPacket,
  ThroughputPoint,
} from '../types/sensor';
import { generateMockPacket } from '../utils/sensorGenerator';

interface WebSocketContextValue {
  connection: ConnectionState;
  latestPacket: SensorPacket | null;
  history: SensorPacket[];
  flowHealth: FlowHealthState;
  useMock: boolean;
  toggleMock: () => void;
}

const HISTORY_LIMIT = 120;
const MOCK_INTERVAL_MS = 33;
const LATENCY_HISTORY_MAX = 300;
const THROUGHPUT_HISTORY_MAX = 60;
const EVENT_LOG_MAX = 100;

let eventIdCounter = 0;

function makeEvent(kind: FlowEventKind, detail: string): FlowEvent {
  return { id: ++eventIdCounter, t: Date.now(), kind, detail };
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [latestPacket, setLatestPacket] = useState<SensorPacket | null>(null);
  const [history, setHistory] = useState<SensorPacket[]>([]);
  const [useMock, setUseMock] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'disconnected',
    latencyMs: 0,
    packetRate: 0,
    droppedPackets: 0,
    totalPackets: 0,
    lastPacketAt: null,
  });
  const [flowHealth, setFlowHealth] = useState<FlowHealthState>({
    latencyHistory: [],
    throughputHistory: [],
    parseErrors: 0,
    events: [],
    jitterMs: 0,
  });

  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const packetCountRef = useRef(0);
  const latencyBufferRef = useRef<number[]>([]);

  const pushEvent = useCallback((kind: FlowEventKind, detail: string) => {
    const event = makeEvent(kind, detail);
    setFlowHealth(prev => ({
      ...prev,
      events: [event, ...prev.events].slice(0, EVENT_LOG_MAX),
    }));
  }, []);

  const ingestPacket = useCallback((packet: SensorPacket, latencyMs: number) => {
    packetCountRef.current += 1;

    if (latencyMs > 40) {
      pushEvent('spike', `Latency spike: ${latencyMs}ms`);
    }

    latencyBufferRef.current = [...latencyBufferRef.current.slice(-9), latencyMs];
    const jitterMs = stddev(latencyBufferRef.current);
    const latencyPoint: LatencyPoint = { t: packet.timestamp, latencyMs };

    setLatestPacket(packet);
    setHistory(prev => {
      const next = [...prev, packet];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setConnection(prev => ({
      ...prev,
      latencyMs,
      totalPackets: prev.totalPackets + 1,
      lastPacketAt: packet.timestamp,
    }));
    setFlowHealth(prev => ({
      ...prev,
      jitterMs,
      latencyHistory: [...prev.latencyHistory, latencyPoint].slice(-LATENCY_HISTORY_MAX),
    }));
  }, [pushEvent]);

  const flushThroughput = useCallback(() => {
    const rate = packetCountRef.current;
    packetCountRef.current = 0;
    const throughputPoint: ThroughputPoint = { t: Date.now(), packetsPerSec: rate };
    setConnection(prev => ({ ...prev, packetRate: rate }));
    setFlowHealth(prev => ({
      ...prev,
      throughputHistory: [...prev.throughputHistory, throughputPoint].slice(-THROUGHPUT_HISTORY_MAX),
    }));
  }, []);

  const startMock = useCallback(() => {
    setConnection({
      status: 'connected',
      latencyMs: 0,
      packetRate: 0,
      droppedPackets: 0,
      totalPackets: 0,
      lastPacketAt: null,
    });
    setHistory([]);
    setLatestPacket(null);
    packetCountRef.current = 0;
    latencyBufferRef.current = [];
    setFlowHealth({
      latencyHistory: [],
      throughputHistory: [],
      parseErrors: 0,
      events: [makeEvent('reconnect', 'Mock pipeline started')],
      jitterMs: 0,
    });

    mockTimerRef.current = setInterval(() => {
      const packet = generateMockPacket();
      const latencyMs = Math.round(Math.random() < 0.04 ? 45 + Math.random() * 70 : 2 + Math.random() * 9);

      if (Math.random() < 0.008) {
        setConnection(prev => ({ ...prev, droppedPackets: prev.droppedPackets + 1 }));
        pushEvent('drop', `Seq gap detected at #${packet.sequenceId}`);
        return;
      }

      if (Math.random() < 0.004) {
        setFlowHealth(prev => ({ ...prev, parseErrors: prev.parseErrors + 1 }));
        pushEvent('parse_error', 'Malformed JSON frame');
        return;
      }

      ingestPacket(packet, latencyMs);
    }, MOCK_INTERVAL_MS);

    rateTimerRef.current = setInterval(flushThroughput, 1000);
  }, [flushThroughput, ingestPacket, pushEvent]);

  const stopMock = useCallback(() => {
    if (mockTimerRef.current) clearInterval(mockTimerRef.current);
    if (rateTimerRef.current) clearInterval(rateTimerRef.current);
    mockTimerRef.current = null;
    rateTimerRef.current = null;
    setConnection(prev => ({ ...prev, status: 'disconnected', packetRate: 0 }));
  }, []);

  const startRealWS = useCallback(() => {
    setConnection(prev => ({ ...prev, status: 'reconnecting' }));
    const ws = new WebSocket('ws://localhost:8000/ws/sensor');

    ws.onopen = () => {
      setConnection(prev => ({ ...prev, status: 'connected' }));
      pushEvent('reconnect', 'WebSocket connected');
      rateTimerRef.current = setInterval(flushThroughput, 1000);
    };

    ws.onmessage = (event) => {
      const receivedAt = Date.now();
      try {
        const packet: SensorPacket = JSON.parse(event.data);
        ingestPacket(packet, Math.max(0, receivedAt - packet.timestamp));
      } catch {
        setConnection(prev => ({ ...prev, droppedPackets: prev.droppedPackets + 1 }));
        setFlowHealth(prev => ({ ...prev, parseErrors: prev.parseErrors + 1 }));
        pushEvent('parse_error', 'Failed to parse incoming frame');
      }
    };

    ws.onerror = () => {
      setConnection(prev => ({ ...prev, status: 'error' }));
      pushEvent('drop', 'WebSocket error event');
    };

    ws.onclose = () => {
      setConnection(prev => ({ ...prev, status: 'disconnected' }));
      if (rateTimerRef.current) clearInterval(rateTimerRef.current);
      rateTimerRef.current = null;
    };

    return ws;
  }, [flushThroughput, ingestPacket, pushEvent]);

  useEffect(() => {
    if (useMock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startMock();
      return () => stopMock();
    }

    const ws = startRealWS();
    return () => {
      ws.close();
      if (rateTimerRef.current) clearInterval(rateTimerRef.current);
      rateTimerRef.current = null;
    };
  }, [useMock, startMock, stopMock, startRealWS]);

  const toggleMock = useCallback(() => setUseMock(v => !v), []);

  return (
    <WebSocketContext.Provider value={{
      connection,
      latestPacket,
      history,
      flowHealth,
      useMock,
      toggleMock,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
  return ctx;
}

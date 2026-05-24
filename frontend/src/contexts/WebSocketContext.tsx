import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { SensorPacket, ConnectionState } from '../types/sensor';
import { generateMockPacket } from '../utils/sensorGenerator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface WebSocketContextValue {
  connection: ConnectionState;
  latestPacket: SensorPacket | null;
  history: SensorPacket[];           // rolling window, last N packets
  useMock: boolean;
  toggleMock: () => void;
}

const HISTORY_LIMIT = 120; // ~4 seconds at 30Hz
const MOCK_INTERVAL_MS = 33; // ~30Hz

// ─── Context ─────────────────────────────────────────────────────────────────

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

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

  const mockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const packetCountRef = useRef(0);
  const rateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Packet ingestion ──────────────────────────────────────────────────────
  const ingestPacket = useCallback((packet: SensorPacket) => {
    packetCountRef.current += 1;

    setLatestPacket(packet);
    setHistory(prev => {
      const next = [...prev, packet];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setConnection(prev => ({
      ...prev,
      totalPackets: prev.totalPackets + 1,
      lastPacketAt: packet.timestamp,
    }));
  }, []);

  // ── Mock pipeline ─────────────────────────────────────────────────────────
  const startMock = useCallback(() => {
    setConnection({
      status: 'connected',
      latencyMs: 0,
      packetRate: 0,
      droppedPackets: 0,
      totalPackets: 0,
      lastPacketAt: null,
    });

    mockTimerRef.current = setInterval(() => {
      const packet = generateMockPacket();
      // Simulate occasional latency spike
      const fakeLatency = Math.round(Math.random() < 0.05 ? 40 + Math.random() * 60 : 2 + Math.random() * 8);
      setConnection(prev => ({ ...prev, latencyMs: fakeLatency }));
      ingestPacket(packet);
    }, MOCK_INTERVAL_MS);

    // Packet rate counter — updates every second
    rateTimerRef.current = setInterval(() => {
      const rate = packetCountRef.current;
      packetCountRef.current = 0;
      setConnection(prev => ({ ...prev, packetRate: rate }));
    }, 1000);
  }, [ingestPacket]);

  const stopMock = useCallback(() => {
    if (mockTimerRef.current) clearInterval(mockTimerRef.current);
    if (rateTimerRef.current) clearInterval(rateTimerRef.current);
    setConnection(prev => ({ ...prev, status: 'disconnected', packetRate: 0 }));
  }, []);

  // ── Real WebSocket (swap-in point) ────────────────────────────────────────
  // When useMock=false, connect to ws://localhost:8000/ws/sensor
  // and call ingestPacket(JSON.parse(event.data)) on each message.
  // This block is intentionally stubbed — do not delete it.
  const startRealWS = useCallback(() => {
    setConnection(prev => ({ ...prev, status: 'reconnecting' }));
    const ws = new WebSocket('ws://localhost:8000/ws/sensor');
    ws.onopen = () => setConnection(prev => ({ ...prev, status: 'connected' }));
    ws.onmessage = (e) => {
      try {
        const packet: SensorPacket = JSON.parse(e.data);
        ingestPacket(packet);
      } catch {
        setConnection(prev => ({ ...prev, droppedPackets: prev.droppedPackets + 1 }));
      }
    };
    ws.onerror = () => setConnection(prev => ({ ...prev, status: 'error' }));
    ws.onclose = () => setConnection(prev => ({ ...prev, status: 'disconnected' }));
    return ws;
  }, [ingestPacket]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (useMock) {
      startMock();
      return () => stopMock();
    } else {
      const ws = startRealWS();
      return () => ws.close();
    }
  }, [useMock, startMock, stopMock, startRealWS]);

  const toggleMock = useCallback(() => setUseMock(v => !v), []);

  return (
    <WebSocketContext.Provider value={{ connection, latestPacket, history, useMock, toggleMock }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWebSocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
  return ctx;
}

import { useWebSocket } from '../../contexts/WebSocketContext';
import { StatusBadge } from '../ui/StatusBadge';
import { MetricChip } from '../ui/MetricChip';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export function TopStatusBar() {
  const { connection, useMock, toggleMock } = useWebSocket();
  const { status, latencyMs, packetRate, droppedPackets, totalPackets } = connection;

  const latencyVariant = latencyMs > 50 ? 'error' : latencyMs > 20 ? 'warning' : 'normal';
  const dropVariant = droppedPackets > 10 ? 'error' : droppedPackets > 0 ? 'warning' : 'normal';

  return (
    <header className="flex items-center gap-6 h-12 px-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
      {/* Connection status */}
      <StatusBadge status={status} />

      <div className="w-px h-4 bg-zinc-800" />

      {/* Metrics row */}
      <div className="flex items-center gap-5">
        <MetricChip label="Packet Rate" value={packetRate} unit="Hz" />
        <MetricChip label="Latency" value={latencyMs} unit="ms" variant={latencyVariant} />
        <MetricChip label="Dropped" value={droppedPackets} variant={dropVariant} />
        <MetricChip label="Total Rx" value={totalPackets.toLocaleString()} />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Mock toggle */}
      <button
        onClick={toggleMock}
        className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {useMock
          ? <ToggleRight size={14} className="text-cyan-500" />
          : <ToggleLeft size={14} />
        }
        {useMock ? 'Mock' : 'Live'}
      </button>

      {/* Build tag */}
      <span className="text-[9px] font-mono text-zinc-700 tracking-widest">v0.1.0-alpha</span>
    </header>
  );
}

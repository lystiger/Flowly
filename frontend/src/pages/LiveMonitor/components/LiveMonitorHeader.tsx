import { MetricChip } from '../../../components/ui/MetricChip';
import { useWebSocket } from '../../../contexts/WebSocketContext';

export function LiveMonitorHeader() {
  const { latestPacket, history, connection } = useWebSocket();

  const seqId = latestPacket?.sequenceId ?? '--';
  const lastPacketAge = connection.lastPacketAt
    ? `${Date.now() - connection.lastPacketAt}ms ago`
    : 'never';

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/40 bg-zinc-900/30 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.2em] uppercase">
          Live Stream
        </h1>
        <div className="h-3 w-px bg-zinc-800" />
        <p className="text-[9px] font-mono text-zinc-500 uppercase">
          Observability Terminal
        </p>
      </div>
      <div className="flex items-center gap-4">
        <MetricChip label="Sequence" value={seqId} />
        <MetricChip label="Latency" value={lastPacketAge} />
        <MetricChip label="Cache" value={history.length} unit="pkts" />
      </div>
    </div>
  );
}

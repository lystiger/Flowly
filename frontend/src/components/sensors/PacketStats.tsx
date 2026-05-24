import { useWebSocket } from '../../contexts/WebSocketContext';
import { Activity, Hash, Zap } from 'lucide-react';
import clsx from 'clsx';

export function PacketStats() {
  const { connection, latestPacket } = useWebSocket();
  const { totalPackets, droppedPackets, packetRate } = connection;

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-zinc-500" />
        <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
          Packet Stats
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-[9px] font-mono text-zinc-600 uppercase">Sequence ID</div>
          <div className="flex items-baseline gap-1.5">
            <Hash size={12} className="text-zinc-700" />
            <span className="text-sm font-mono font-bold text-zinc-200">
              {latestPacket?.sequenceId ?? '--'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[9px] font-mono text-zinc-600 uppercase">Rate</div>
          <div className="flex items-baseline gap-1.5">
            <Zap size={12} className="text-cyan-600" />
            <span className="text-sm font-mono font-bold text-zinc-200">{packetRate}</span>
            <span className="text-[9px] font-mono text-zinc-600 uppercase">Hz</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[9px] font-mono text-zinc-600 uppercase">Total Rx</div>
          <div className="text-sm font-mono font-bold text-zinc-400">
            {totalPackets.toLocaleString()}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[9px] font-mono text-zinc-600 uppercase">Dropped</div>
          <div className={clsx(
            "text-sm font-mono font-bold",
            droppedPackets > 0 ? "text-rose-500" : "text-zinc-600"
          )}>
            {droppedPackets}
          </div>
        </div>
      </div>
    </div>
  );
}

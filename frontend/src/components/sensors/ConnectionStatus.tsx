import { useWebSocket } from '../../contexts/WebSocketContext';
import { Wifi, Clock, Database } from 'lucide-react';
import clsx from 'clsx';

export function ConnectionStatus() {
  const { connection, history, useMock } = useWebSocket();
  const { status, latencyMs, lastPacketAt } = connection;

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-emerald-500';
      case 'reconnecting': return 'bg-amber-500 anim-pulse';
      case 'error': return 'bg-rose-500';
      default: return 'bg-zinc-600';
    }
  };

  const lastSeen = lastPacketAt 
    ? `${((Date.now() - lastPacketAt) / 1000).toFixed(1)}s` 
    : 'never';

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-zinc-500" />
          <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            Connection
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50">
          <div className={clsx("w-1.5 h-1.5 rounded-full", getStatusColor())} />
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter">
            {status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-zinc-600" />
            <span className="text-[9px] font-mono text-zinc-500 uppercase">Latency</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={clsx(
              "text-xs font-mono font-bold",
              latencyMs > 50 ? "text-rose-400" : "text-emerald-400"
            )}>
              {latencyMs}
            </span>
            <span className="text-[8px] font-mono text-zinc-600 uppercase">ms</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={12} className="text-zinc-600" />
            <span className="text-[9px] font-mono text-zinc-500 uppercase">History</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-mono font-bold text-zinc-300">
              {history.length}
            </span>
            <span className="text-[8px] font-mono text-zinc-600 uppercase">pkts</span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800/50 flex items-center justify-between">
          <span className="text-[9px] font-mono text-zinc-600 uppercase">Mode</span>
          <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase">
            {useMock ? 'Mock Engine' : 'Live WebSocket'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-zinc-600 uppercase">Last Seen</span>
          <span className="text-[10px] font-mono text-zinc-400 uppercase">
            {lastSeen} ago
          </span>
        </div>
      </div>
    </div>
  );
}

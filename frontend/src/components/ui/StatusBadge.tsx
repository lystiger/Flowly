import type { ConnectionStatus } from '../../types/sensor';

export interface StatusBadgeProps {
  status: ConnectionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = 'bg-zinc-500/10 text-zinc-400 border-zinc-700/50';
  let indicatorClass = 'bg-zinc-500';

  if (status === 'connected') {
    colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    indicatorClass = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
  } else if (status === 'reconnecting') {
    colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    indicatorClass = 'bg-yellow-500 animate-pulse';
  } else if (status === 'error') {
    colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
    indicatorClass = 'bg-red-500';
  }

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-widest ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${indicatorClass}`} />
      {status}
    </div>
  );
}

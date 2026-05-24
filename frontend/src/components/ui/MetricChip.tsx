export interface MetricChipProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'normal' | 'warning' | 'error' | 'success';
}

export function MetricChip({ label, value, unit, variant = 'normal' }: MetricChipProps) {
  let colorClass = 'text-zinc-300';
  if (variant === 'warning') colorClass = 'text-yellow-400';
  if (variant === 'error') colorClass = 'text-red-400';
  if (variant === 'success') colorClass = 'text-emerald-400';

  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
        {label}
      </span>
      <span className={`text-sm font-mono font-medium ${colorClass}`}>
        {value}
        {unit && <span className="text-[10px] text-zinc-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

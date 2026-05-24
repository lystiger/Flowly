import clsx from 'clsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export type KPIStatus = 'ok' | 'warn' | 'danger' | 'neutral';

const STATUS_STYLES: Record<KPIStatus, {
  border: string;
  label: string;
  valueColor: string;
  dot: string;
  sparkColor: string;
}> = {
  ok:      { border: 'border-zinc-800',        label: 'OK',    valueColor: 'text-emerald-400', dot: 'bg-emerald-400', sparkColor: '#34d399' },
  warn:    { border: 'border-amber-500/30',    label: 'WARN',  valueColor: 'text-amber-400',   dot: 'bg-amber-400 animate-pulse', sparkColor: '#fbbf24' },
  danger:  { border: 'border-red-500/30',      label: 'ALERT', valueColor: 'text-red-400',     dot: 'bg-red-500 animate-pulse', sparkColor: '#f87171' },
  neutral: { border: 'border-zinc-800',        label: '',      valueColor: 'text-zinc-200',    dot: 'bg-zinc-600', sparkColor: '#52525b' },
};

interface SparkPoint { v: number; }

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  status: KPIStatus;
  sparkData?: SparkPoint[];
}

export function KPICard({ label, value, unit, subtext, status, sparkData }: KPICardProps) {
  const s = STATUS_STYLES[status];

  return (
    <div className={clsx(
      'flex flex-col gap-2 p-4 bg-zinc-900/60 border rounded-lg min-w-0',
      s.border
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 truncate">
          {label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
          {s.label && (
            <span className={clsx('text-[9px] font-mono font-semibold tracking-widest', s.valueColor)}>
              {s.label}
            </span>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end gap-1">
        <span className={clsx('text-2xl font-mono font-bold tabular-nums leading-none', s.valueColor)}>
          {value}
        </span>
        {unit && (
          <span className="text-[11px] font-mono text-zinc-600 mb-0.5">{unit}</span>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && sparkData.length > 2 && (
        <div className="h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={s.sparkColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <span className="text-[9px] font-mono text-zinc-600 truncate">{subtext}</span>
      )}
    </div>
  );
}

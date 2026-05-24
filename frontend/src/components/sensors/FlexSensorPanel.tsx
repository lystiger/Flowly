import clsx from 'clsx';
import type { FlexSensorFrame } from '../../types/sensor';

const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
type Finger = typeof FINGERS[number];

const ADC_MIN = 0;
const ADC_MAX = 4095;

function normalize(value: number): number {
  return Math.min(1, Math.max(0, (value - ADC_MIN) / (ADC_MAX - ADC_MIN)));
}

function getBarColor(norm: number): string {
  if (norm < 0.3) return 'bg-cyan-500';
  if (norm < 0.7) return 'bg-amber-500';
  return 'bg-rose-500';
}

interface FingerBarProps {
  finger: Finger;
  value: number;
}

function FingerBar({ finger, value }: FingerBarProps) {
  const norm = normalize(value);
  const pct = Math.round(norm * 100);

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span className="w-12 text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-right shrink-0">
        {finger}
      </span>

      {/* Bar track */}
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-none', getBarColor(norm))}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Raw ADC value */}
      <span className="w-12 text-[11px] font-mono tabular-nums text-zinc-300 text-right shrink-0">
        {value.toString().padStart(4, '0')}
      </span>

      {/* Normalized */}
      <span className="w-9 text-[10px] font-mono tabular-nums text-zinc-600 text-right shrink-0">
        {(norm * 100).toFixed(0)}%
      </span>
    </div>
  );
}

interface FlexSensorPanelProps {
  frame: FlexSensorFrame | null;
}

export function FlexSensorPanel({ frame }: FlexSensorPanelProps) {
  return (
    <section className="flex flex-col gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Flex Sensors — ADC Raw
        </h2>
        <span className="text-[9px] font-mono text-zinc-700">0 – 4095</span>
      </div>

      {frame === null ? (
        <div className="flex items-center justify-center h-28 text-zinc-700 text-xs font-mono">
          Waiting for data…
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {FINGERS.map(f => (
            <FingerBar key={f} finger={f} value={frame[f]} />
          ))}
        </div>
      )}
    </section>
  );
}

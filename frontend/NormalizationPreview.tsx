import { useState } from 'react';
import clsx from 'clsx';
import type { FingerKey, CalibrationSnapshot, NormalizedFrame } from '../../types/sensor';

const FINGERS: FingerKey[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

// ─── Per-finger manual override ───────────────────────────────────────────────

interface MinMaxOverrideProps {
  finger: FingerKey;
  min: number;
  max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}

function MinMaxOverride({ finger, min, max, onMinChange, onMaxChange }: MinMaxOverrideProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-[10px] font-mono uppercase tracking-widest text-zinc-600 text-right shrink-0">
        {finger}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-mono text-zinc-700 w-6">min</span>
        <input
          type="number"
          min={0} max={4095}
          value={min}
          onChange={e => onMinChange(Number(e.target.value))}
          className="w-16 h-6 bg-zinc-900 border border-zinc-700 rounded px-1.5 text-[10px] font-mono text-zinc-300 tabular-nums focus:outline-none focus:border-cyan-600 transition-colors"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] font-mono text-zinc-700 w-6">max</span>
        <input
          type="number"
          min={0} max={4095}
          value={max}
          onChange={e => onMaxChange(Number(e.target.value))}
          className="w-16 h-6 bg-zinc-900 border border-zinc-700 rounded px-1.5 text-[10px] font-mono text-zinc-300 tabular-nums focus:outline-none focus:border-cyan-600 transition-colors"
        />
      </div>
    </div>
  );
}

// ─── Normalized bar ───────────────────────────────────────────────────────────

interface NormBarProps {
  finger: FingerKey;
  value: number | null; // 0–1
}

function NormBar({ finger, value }: NormBarProps) {
  const pct = value !== null ? Math.round(value * 100) : null;
  const barColor =
    value === null ? 'bg-zinc-800' :
    value < 0.33   ? 'bg-cyan-500' :
    value < 0.66   ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[10px] font-mono uppercase tracking-widest text-zinc-500 text-right shrink-0">
        {finger}
      </span>
      <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-none', barColor)}
          style={{ width: pct !== null ? `${pct}%` : '0%' }}
        />
      </div>
      <span className="w-10 text-[11px] font-mono tabular-nums text-right shrink-0 text-zinc-400">
        {pct !== null ? `${pct}%` : '--'}
      </span>
      <span className="w-12 text-[11px] font-mono tabular-nums text-right shrink-0 text-zinc-600">
        {value !== null ? value.toFixed(3) : '-.---'}
      </span>
    </div>
  );
}

// ─── NormalizationPreview ────────────────────────────────────────────────────

interface NormalizationPreviewProps {
  open: CalibrationSnapshot | null;
  closed: CalibrationSnapshot | null;
  normalizedLive: NormalizedFrame | null;
  onUpdateSnapshot: (pose: 'open' | 'closed', finger: FingerKey, value: number) => void;
}

export function NormalizationPreview({
  open, closed, normalizedLive, onUpdateSnapshot
}: NormalizationPreviewProps) {
  const [showOverrides, setShowOverrides] = useState(false);
  const isReady = open !== null && closed !== null;

  return (
    <section className="flex flex-col gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Normalized Preview — Live
          </h2>
          <p className="text-[9px] font-mono text-zinc-700 mt-0.5">
            {isReady
              ? 'Real-time normalization from captured snapshots'
              : 'Capture both poses to enable normalization'}
          </p>
        </div>
        {isReady && (
          <button
            onClick={() => setShowOverrides(v => !v)}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 rounded px-2 h-6 transition-colors"
          >
            {showOverrides ? 'Hide Overrides' : 'Manual Override'}
          </button>
        )}
      </div>

      {/* Not ready state */}
      {!isReady && (
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-700 py-4 justify-center">
          <span className={clsx('w-2 h-2 rounded-full shrink-0', open ? 'bg-emerald-500' : 'bg-zinc-700')} />
          Open
          <span className="mx-2 text-zinc-800">·</span>
          <span className={clsx('w-2 h-2 rounded-full shrink-0', closed ? 'bg-emerald-500' : 'bg-zinc-700')} />
          Closed
          <span className="ml-3 text-zinc-700">— capture both to activate</span>
        </div>
      )}

      {/* Bars */}
      {isReady && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-0.5">
            <span className="w-12" />
            <span className="flex-1 text-[9px] font-mono uppercase tracking-widest text-zinc-700">Normalized</span>
            <span className="w-10 text-[9px] font-mono uppercase tracking-widest text-zinc-700 text-right">%</span>
            <span className="w-12 text-[9px] font-mono uppercase tracking-widest text-zinc-700 text-right">Float</span>
          </div>
          {FINGERS.map(f => (
            <NormBar key={f} finger={f} value={normalizedLive?.[f] ?? null} />
          ))}
        </div>
      )}

      {/* Manual overrides */}
      {isReady && showOverrides && (
        <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
          <p className="text-[9px] font-mono text-zinc-700 mb-1">
            Override min/max ADC values per finger. Affects normalization immediately.
          </p>
          {FINGERS.map(f => (
            <MinMaxOverride
              key={f}
              finger={f}
              min={open![f]}
              max={closed![f]}
              onMinChange={v => onUpdateSnapshot('open', f, v)}
              onMaxChange={v => onUpdateSnapshot('closed', f, v)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

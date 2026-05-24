import clsx from 'clsx';
import { RefreshCcw, CheckCircle2, Loader2 } from 'lucide-react';
import type { CalibrationSnapshot, CapturePhase, FingerKey } from '../../types/sensor';
import { useWebSocket } from '../../contexts/WebSocketContext';

const FINGERS: FingerKey[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressRing({ progress }: { progress: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="rotate-[-90deg]">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#27272a" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface FingerReadoutRowProps {
  finger: FingerKey;
  liveValue: number;
  snapshotValue: number | null;
}

function FingerReadoutRow({ finger, liveValue, snapshotValue }: FingerReadoutRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-[10px] font-mono uppercase tracking-widest text-zinc-600 text-right shrink-0">
        {finger}
      </span>
      {/* Live ADC */}
      <span className="w-14 text-[11px] font-mono tabular-nums text-zinc-400">
        {liveValue.toString().padStart(4, '0')}
      </span>
      {/* Arrow */}
      <span className="text-zinc-700 text-[10px]">→</span>
      {/* Snapshot */}
      <span className={clsx(
        'w-14 text-[11px] font-mono tabular-nums',
        snapshotValue !== null ? 'text-cyan-400' : 'text-zinc-700'
      )}>
        {snapshotValue !== null ? snapshotValue.toString().padStart(4, '0') : '----'}
      </span>
    </div>
  );
}

// ─── CapturePanel ─────────────────────────────────────────────────────────────

interface CapturePanelProps {
  pose: 'open' | 'closed';
  phase: CapturePhase;
  progress: number;   // 0–1
  snapshot: CalibrationSnapshot | null;
  onCapture: () => void;
  onReset: () => void;
}

const POSE_META = {
  open: {
    label: 'Open Hand',
    description: 'Spread fingers fully, palm flat.',
    accentColor: 'border-cyan-500/30 bg-cyan-500/5',
    buttonActive: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950',
    icon: '✋',
  },
  closed: {
    label: 'Closed Hand',
    description: 'Make a tight fist.',
    accentColor: 'border-violet-500/30 bg-violet-500/5',
    buttonActive: 'bg-violet-500 hover:bg-violet-400 text-zinc-50',
    icon: '✊',
  },
} as const;

export function CapturePanel({
  pose, phase, progress, snapshot, onCapture, onReset
}: CapturePanelProps) {
  const { latestPacket } = useWebSocket();
  const meta = POSE_META[pose];
  const liveFrame = latestPacket?.flex;

  const isSampling = phase === 'sampling';
  const isDone = phase === 'done';

  return (
    <section className={clsx(
      'flex flex-col gap-4 p-4 border rounded-lg',
      meta.accentColor
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base leading-none">{meta.icon}</span>
            <h2 className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase">
              {meta.label}
            </h2>
          </div>
          <p className="text-[10px] font-mono text-zinc-600">{meta.description}</p>
        </div>

        {/* Phase indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {isSampling && (
            <div className="relative flex items-center justify-center">
              <ProgressRing progress={progress} />
              <Loader2 size={12} className="absolute text-cyan-400 animate-spin" />
            </div>
          )}
          {isDone && <CheckCircle2 size={18} className="text-emerald-400" />}
        </div>
      </div>

      {/* Finger readout table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-0.5">
          <span className="w-12" />
          <span className="w-14 text-[9px] font-mono uppercase tracking-widest text-zinc-700">Live</span>
          <span className="w-4" />
          <span className="w-14 text-[9px] font-mono uppercase tracking-widest text-zinc-700">Captured</span>
        </div>
        {FINGERS.map(f => (
          <FingerReadoutRow
            key={f}
            finger={f}
            liveValue={liveFrame?.[f] ?? 0}
            snapshotValue={snapshot?.[f] ?? null}
          />
        ))}
      </div>

      {/* Status line */}
      {isSampling && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          Sampling… {Math.round(progress * 30)}/30 packets
        </div>
      )}
      {isDone && (
        <div className="text-[10px] font-mono text-emerald-400">
          Snapshot captured — 30 packets averaged.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onCapture}
          disabled={isSampling}
          className={clsx(
            'flex-1 h-8 rounded text-[11px] font-mono font-semibold tracking-wide transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed',
            isDone
              ? 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              : meta.buttonActive
          )}
        >
          {isSampling ? 'Sampling…' : isDone ? 'Re-Capture' : 'Capture'}
        </button>

        {(isDone || isSampling) && (
          <button
            onClick={onReset}
            disabled={isSampling}
            className="h-8 w-8 flex items-center justify-center rounded border border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Reset capture"
          >
            <RefreshCcw size={12} />
          </button>
        )}
      </div>
    </section>
  );
}

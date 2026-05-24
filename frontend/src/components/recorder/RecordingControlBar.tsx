import clsx from 'clsx';
import { Square } from 'lucide-react';
import type { RecordingState } from '../../types/sensor';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  const tenths = Math.floor((ms % 1000) / 100);
  return `${m}:${s}.${tenths}`;
}

// ─── RecordButton ─────────────────────────────────────────────────────────────

interface RecordButtonProps {
  state: RecordingState;
  onStart: () => void;
  onStop: () => void;
  disabled: boolean;
}

function RecordButton({ state, onStart, onStop, disabled }: RecordButtonProps) {
  const isRecording = state === 'recording';

  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      className={clsx(
        'relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed shrink-0',
        isRecording
          ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
          : 'border-zinc-600 bg-zinc-900 hover:border-zinc-400 hover:bg-zinc-800'
      )}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {/* Outer pulse ring when recording */}
      {isRecording && (
        <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-30" />
      )}

      {/* Inner icon */}
      {isRecording ? (
        <Square size={18} className="text-red-400 fill-red-400" />
      ) : (
        <span className="w-5 h-5 rounded-full bg-red-500" />
      )}
    </button>
  );
}

// ─── RecordingControlBar ──────────────────────────────────────────────────────

interface RecordingControlBarProps {
  recordingState: RecordingState;
  activeLabel: string;
  elapsedMs: number;
  sampleCount: number;
  onLabelChange: (v: string) => void;
  onStart: () => void;
  onStop: () => void;
  isConnected: boolean;
}

export function RecordingControlBar({
  recordingState,
  activeLabel,
  elapsedMs,
  sampleCount,
  onLabelChange,
  onStart,
  onStop,
  isConnected,
}: RecordingControlBarProps) {
  const isRecording = recordingState === 'recording';

  return (
    <div className={clsx(
      'flex items-center gap-5 p-4 border rounded-lg transition-colors duration-200',
      isRecording
        ? 'bg-red-500/5 border-red-500/30'
        : 'bg-zinc-900/50 border-zinc-800'
    )}>
      {/* Record button */}
      <RecordButton
        state={recordingState}
        onStart={onStart}
        onStop={onStop}
        disabled={!isConnected}
      />

      {/* Label input */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <label className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
          Gesture Label
        </label>
        <input
          type="text"
          value={activeLabel}
          onChange={e => onLabelChange(e.target.value)}
          disabled={isRecording}
          placeholder="e.g. hello, thank_you, yes…"
          maxLength={48}
          className={clsx(
            'h-8 bg-zinc-900 border rounded px-2.5 text-[12px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
            isRecording ? 'border-zinc-800' : 'border-zinc-700 focus:border-cyan-600'
          )}
        />
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-zinc-800 shrink-0" />

      {/* Timer */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">Duration</span>
        <span className={clsx(
          'text-2xl font-mono font-bold tabular-nums leading-none',
          isRecording ? 'text-red-400' : 'text-zinc-400'
        )}>
          {formatDuration(elapsedMs)}
        </span>
      </div>

      {/* Sample count */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">Samples</span>
        <span className={clsx(
          'text-2xl font-mono font-bold tabular-nums leading-none',
          isRecording ? 'text-amber-400' : 'text-zinc-400'
        )}>
          {sampleCount.toLocaleString()}
        </span>
      </div>

      {/* Status pill */}
      <div className="shrink-0">
        {isRecording ? (
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-widest text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            REC
          </span>
        ) : (
          <span className="text-[10px] font-mono text-zinc-700 tracking-widest">
            {isConnected ? 'STANDBY' : 'NO SIGNAL'}
          </span>
        )}
      </div>
    </div>
  );
}

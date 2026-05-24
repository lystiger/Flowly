import clsx from 'clsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
} from 'recharts';
import type { RecordedSample } from '../../types/sensor';

const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;

const FINGER_COLORS: Record<string, string> = {
  thumb:  '#22d3ee',
  index:  '#a78bfa',
  middle: '#34d399',
  ring:   '#fb923c',
  pinky:  '#f472b6',
};

interface SessionSparkPreviewProps {
  liveSamples: RecordedSample[];
  isRecording: boolean;
}

export function SessionSparkPreview({ liveSamples, isRecording }: SessionSparkPreviewProps) {
  if (!isRecording && liveSamples.length === 0) return null;

  // Build per-finger chart data
  const chartData = liveSamples.map(s => ({
    t: s.t,
    thumb:  s.flex.thumb,
    index:  s.flex.index,
    middle: s.flex.middle,
    ring:   s.flex.ring,
    pinky:  s.flex.pinky,
  }));

  return (
    <section className={clsx(
      'flex flex-col gap-2 p-4 border rounded-lg transition-colors duration-200',
      isRecording
        ? 'bg-red-500/5 border-red-500/20'
        : 'bg-zinc-900/50 border-zinc-800'
    )}>
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Live Capture — Flex Spark
        </h2>
        <div className="flex items-center gap-3">
          {FINGERS.map(f => (
            <span key={f} className="flex items-center gap-1">
              <span
                className="w-3 h-px inline-block"
                style={{ backgroundColor: FINGER_COLORS[f] }}
              />
              <span className="text-[9px] font-mono text-zinc-600">{f}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 0, left: -28 }}>
            <YAxis domain={[0, 4095]} tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#3f3f46' }} />
            {FINGERS.map(f => (
              <Line
                key={f}
                type="monotone"
                dataKey={f}
                stroke={FINGER_COLORS[f]}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9px] font-mono text-zinc-700">
        Last 60 samples shown · ADC 0–4095
      </p>
    </section>
  );
}

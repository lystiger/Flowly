import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LatencyPoint } from '../../types/sensor';

interface ChartPoint {
  t: number;
  latencyMs: number;
  upper: number;
  lower: number;
}

interface LatencyChartProps {
  data: LatencyPoint[];
  jitterMs: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-[10px] font-mono">
      {payload.map(point => (
        <div key={point.name} className="text-zinc-300">
          {point.name}:{' '}
          <span className="text-cyan-400 tabular-nums">
            {typeof point.value === 'number' ? point.value.toFixed(1) : point.value}ms
          </span>
        </div>
      ))}
    </div>
  );
}

const MAX_POINTS = 150;

export function LatencyChart({ data, jitterMs }: LatencyChartProps) {
  const step = Math.max(1, Math.floor(data.length / MAX_POINTS));
  const chartData: ChartPoint[] = data
    .filter((_, index) => index % step === 0)
    .map(point => ({
      t: point.t,
      latencyMs: point.latencyMs,
      upper: point.latencyMs + jitterMs,
      lower: Math.max(0, point.latencyMs - jitterMs),
    }));

  return (
    <section className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Serial to WS Latency
        </h2>
        <span className="text-[9px] font-mono text-zinc-700">
          Jitter +/-{jitterMs.toFixed(1)}ms
        </span>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              domain={[0, 'auto']}
              tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#52525b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1} />
            <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1} />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="none"
              fill="#22d3ee"
              fillOpacity={0.06}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="none"
              fill="#09090b"
              fillOpacity={1}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="latencyMs"
              stroke="#22d3ee"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-700">
        <span className="flex items-center gap-1">
          <span className="w-4 h-px bg-amber-500 inline-block" /> 20ms warn
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-px bg-red-500 inline-block" /> 50ms alert
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-cyan-500/10 inline-block rounded-sm border border-cyan-500/20" /> jitter band
        </span>
      </div>
    </section>
  );
}

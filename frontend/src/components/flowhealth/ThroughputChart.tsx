import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ThroughputPoint } from '../../types/sensor';

const TARGET_HZ = 30;
const WARN_HZ = 20;

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-[10px] font-mono">
      <span className="text-zinc-400">Rate: </span>
      <span className="text-violet-400 tabular-nums">{value} pkt/s</span>
    </div>
  );
}

interface ThroughputChartProps {
  data: ThroughputPoint[];
}

export function ThroughputChart({ data }: ThroughputChartProps) {
  return (
    <section className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Data Throughput
        </h2>
        <span className="text-[9px] font-mono text-zinc-700">
          Target: {TARGET_HZ} pkt/s
        </span>
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barSize={6}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              domain={[0, TARGET_HZ + 10]}
              tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#52525b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={TARGET_HZ} stroke="#a78bfa" strokeDasharray="4 3" strokeWidth={1} />
            <ReferenceLine y={WARN_HZ} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1} />
            <Bar dataKey="packetsPerSec" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.packetsPerSec < WARN_HZ
                      ? '#f87171'
                      : entry.packetsPerSec < TARGET_HZ
                        ? '#fbbf24'
                        : '#a78bfa'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-700">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-violet-500 inline-block" /> &gt;=30 target
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" /> 20-29 warn
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> &lt;20 low
        </span>
      </div>
    </section>
  );
}

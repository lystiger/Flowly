import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { ChartDataPoint, IMUChartDataPoint } from '../../types/sensor';

// ─── Color palette (engineering tone) ────────────────────────────────────────
const FLEX_COLORS: Record<string, string> = {
  thumb:  '#22d3ee', // cyan-400
  index:  '#a78bfa', // violet-400
  middle: '#34d399', // emerald-400
  ring:   '#fb923c', // orange-400
  pinky:  '#f472b6', // pink-400
};

const IMU_COLORS: Record<string, string> = {
  pitch: '#38bdf8', // sky-400
  roll:  '#fb923c', // orange-400
  yaw:   '#a3e635', // lime-400
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; color: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-[10px] font-mono">
      {payload.map(p => (
        <div key={p.name} className="flex gap-2 items-center">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-zinc-300 tabular-nums">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Flex Chart ──────────────────────────────────────────────────────────────
interface FlexChartProps {
  data: ChartDataPoint[];
}

export function FlexChart({ data }: FlexChartProps) {
  return (
    <section className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        Flex — Rolling Window
      </h2>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 4095]} tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#52525b' }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: 4 }}
            />
            {(['thumb', 'index', 'middle', 'ring', 'pinky'] as const).map(f => (
              <Line
                key={f}
                type="monotone"
                dataKey={f}
                stroke={FLEX_COLORS[f]}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// ─── IMU Orientation Chart ────────────────────────────────────────────────────
interface IMUChartProps {
  data: IMUChartDataPoint[];
}

export function IMUOrientationChart({ data }: IMUChartProps) {
  return (
    <section className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        IMU Orientation — Rolling Window
      </h2>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis domain={[-90, 90]} tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#52525b' }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: 4 }}
            />
            <Line type="monotone" dataKey="pitch" stroke={IMU_COLORS.pitch} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="roll"  stroke={IMU_COLORS.roll}  strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="yaw"   stroke={IMU_COLORS.yaw}   strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

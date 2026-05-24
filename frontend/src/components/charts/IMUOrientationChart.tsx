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
import type { IMUChartDataPoint } from '../../types/sensor';
import { ChartTooltip } from './ChartTooltip';

const IMU_COLORS: Record<string, string> = {
  pitch: '#38bdf8', // sky-400
  roll:  '#fb923c', // orange-400
  yaw:   '#a3e635', // lime-400
};

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

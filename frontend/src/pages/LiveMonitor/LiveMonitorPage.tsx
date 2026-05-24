import { useMemo } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { FlexSensorPanel } from '../../components/sensors/FlexSensorPanel';
import { IMUPanel } from '../../components/sensors/IMUPanel';
import { FlexChart, IMUOrientationChart } from '../../components/charts/RealtimeCharts';
import { MetricChip } from '../../components/shared/MetricChip';
import type { ChartDataPoint, IMUChartDataPoint } from '../../types/sensor';

// Subsample for chart: take every Nth packet to keep rendering snappy
const CHART_SUBSAMPLE = 2;

export function LiveMonitorPage() {
  const { latestPacket, history, connection } = useWebSocket();

  const flexChartData = useMemo<ChartDataPoint[]>(() => {
    return history
      .filter((_, i) => i % CHART_SUBSAMPLE === 0)
      .map(p => ({ t: p.timestamp, ...p.flex }));
  }, [history]);

  const imuChartData = useMemo<IMUChartDataPoint[]>(() => {
    return history
      .filter((_, i) => i % CHART_SUBSAMPLE === 0)
      .map(p => ({
        t: p.timestamp,
        pitch: p.imu.pitch,
        roll: p.imu.roll,
        yaw: p.imu.yaw,
        accelMag: Math.sqrt(p.imu.accelX ** 2 + p.imu.accelY ** 2 + p.imu.accelZ ** 2),
      }));
  }, [history]);

  const seqId = latestPacket?.sequenceId ?? '--';
  const lastPacketAge = connection.lastPacketAt
    ? `${Date.now() - connection.lastPacketAt}ms ago`
    : 'never';

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div>
          <h1 className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase">
            Live Monitor
          </h1>
          <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
            Realtime sensor stream — read-only observability
          </p>
        </div>
        <div className="flex items-center gap-5">
          <MetricChip label="Seq ID" value={seqId} />
          <MetricChip label="Last Packet" value={lastPacketAge} />
          <MetricChip label="Buffer" value={history.length} unit="pkts" />
        </div>
      </div>

      {/* Content grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0">

          {/* Left column — sensor value panels */}
          <div className="flex flex-col gap-4">
            <FlexSensorPanel frame={latestPacket?.flex ?? null} />
            <IMUPanel frame={latestPacket?.imu ?? null} />
          </div>

          {/* Right column — rolling charts */}
          <div className="flex flex-col gap-4">
            <FlexChart data={flexChartData} />
            <IMUOrientationChart data={imuChartData} />

            {/* Packet stream footer */}
            <section className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                Latest Packet — Raw
              </h2>
              <pre className="text-[10px] font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                {latestPacket
                  ? JSON.stringify(latestPacket, null, 2)
                  : 'No packets received yet.'}
              </pre>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}

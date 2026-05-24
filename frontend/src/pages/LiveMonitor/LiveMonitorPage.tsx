import { useWebSocket } from '../../contexts/WebSocketContext';
import { useSensorCharts } from '../../hooks/useSensorCharts';
import { FlexSensorPanel } from '../../components/sensors/FlexSensorPanel';
import { IMUPanel } from '../../components/sensors/IMUPanel';
import { PacketStats } from '../../components/sensors/PacketStats';
import { ConnectionStatus } from '../../components/sensors/ConnectionStatus';
import { FlexChart } from '../../components/charts/FlexChart';
import { IMUOrientationChart } from '../../components/charts/IMUOrientationChart';
import { LiveMonitorHeader } from './components/LiveMonitorHeader';
import { RawStreamPanel } from './components/RawStreamPanel';

export function LiveMonitorPage() {
  const { latestPacket } = useWebSocket();
  const { flexChartData, imuChartData } = useSensorCharts();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <LiveMonitorHeader />

      {/* Content grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column - Live Charts (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                <h2 className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">IMU Orientation Graph</h2>
              </div>
              <IMUOrientationChart data={imuChartData} />
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <h2 className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Flex Sensors Graph</h2>
              </div>
              <FlexChart data={flexChartData} />
            </section>
          </div>

          {/* Right Column - Sensor Cards & Stats (4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Sensor Cards</h2>
              </div>
              <div className="flex flex-col gap-4">
                <FlexSensorPanel frame={latestPacket?.flex ?? null} />
                <IMUPanel frame={latestPacket?.imu ?? null} />
              </div>
            </section>

            <PacketStats />
            <ConnectionStatus />
            <RawStreamPanel />
          </div>

        </div>
      </div>
    </div>
  );
}

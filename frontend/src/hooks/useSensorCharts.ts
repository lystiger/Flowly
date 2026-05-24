import { useMemo } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import type { ChartDataPoint, IMUChartDataPoint } from '../types/sensor';

const CHART_SUBSAMPLE = 2;

export function useSensorCharts() {
  const { history } = useWebSocket();

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

  return {
    flexChartData,
    imuChartData,
  };
}

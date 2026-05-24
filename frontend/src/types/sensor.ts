export interface FlexSensorFrame {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface IMUFrame {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  pitch: number;
  roll: number;
  yaw: number;
}

export interface SensorPacket {
  timestamp: number;
  sequenceId: number;
  flex: FlexSensorFrame;
  imu: IMUFrame;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  latencyMs: number;
  packetRate: number;       // packets/sec
  droppedPackets: number;
  totalPackets: number;
  lastPacketAt: number | null;
}

export interface ChartDataPoint extends FlexSensorFrame {
  t: number; // timestamp ms
}

export interface IMUChartDataPoint {
  t: number;
  pitch: number;
  roll: number;
  yaw: number;
  accelMag: number; // magnitude of acceleration vector
}

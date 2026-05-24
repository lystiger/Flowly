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

export type FingerKey = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export type CalibrationSnapshot = FlexSensorFrame;

export interface NormalizedFrame {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
}

export interface CalibrationProfile {
  name: string;
  createdAt: number;
  open: CalibrationSnapshot | null;
  closed: CalibrationSnapshot | null;
}

export type CapturePhase = 'idle' | 'sampling' | 'done';

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

export interface LatencyPoint {
  t: number;
  latencyMs: number;
}

export interface ThroughputPoint {
  t: number;
  packetsPerSec: number;
}

export type FlowEventKind = 'drop' | 'parse_error' | 'reconnect' | 'spike';

export interface FlowEvent {
  id: number;
  t: number;
  kind: FlowEventKind;
  detail: string;
}

export interface FlowHealthState {
  latencyHistory: LatencyPoint[];
  throughputHistory: ThroughputPoint[];
  parseErrors: number;
  events: FlowEvent[];
  jitterMs: number;
}

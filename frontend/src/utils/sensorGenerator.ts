import type { SensorPacket, FlexSensorFrame, IMUFrame } from '../types/sensor';

// Simulates realistic flex sensor values (ADC-like, 0–4095 range)
let _seq = 0;
let _phase = 0;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function noise(base: number, amplitude: number): number {
  return base + (Math.random() - 0.5) * amplitude;
}

// Simulates a slow "hand opening/closing" animation with per-finger offsets
export function generateMockPacket(): SensorPacket {
  _phase += 0.03;
  const wave = (Math.sin(_phase) + 1) / 2; // 0..1

  const flex: FlexSensorFrame = {
    thumb:  Math.round(noise(lerp(800,  3200, wave * 0.9),  60)),
    index:  Math.round(noise(lerp(900,  3500, wave),        80)),
    middle: Math.round(noise(lerp(850,  3400, wave * 0.95), 70)),
    ring:   Math.round(noise(lerp(780,  3100, wave * 1.0),  65)),
    pinky:  Math.round(noise(lerp(700,  2800, wave * 0.85), 55)),
  };

  const imu: IMUFrame = {
    accelX: noise(Math.sin(_phase * 0.7) * 0.3, 0.05),
    accelY: noise(Math.cos(_phase * 0.5) * 0.2, 0.04),
    accelZ: noise(9.81 + Math.sin(_phase * 0.3) * 0.1, 0.06),
    gyroX:  noise(Math.sin(_phase * 1.2) * 15, 2),
    gyroY:  noise(Math.cos(_phase * 0.9) * 10, 1.5),
    gyroZ:  noise(Math.sin(_phase * 0.6) * 8,  1),
    pitch:  noise(Math.sin(_phase * 0.4) * 25, 1),
    roll:   noise(Math.cos(_phase * 0.35) * 18, 0.8),
    yaw:    noise(_phase * 5 % 360, 0.5),
  };

  return {
    timestamp: Date.now(),
    sequenceId: ++_seq,
    flex,
    imu,
  };
}

export function resetMockState() {
  _seq = 0;
  _phase = 0;
}

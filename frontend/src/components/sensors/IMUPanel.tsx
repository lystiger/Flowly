import type { IMUFrame } from '../../types/sensor';

interface IMUFieldProps {
  label: string;
  value: number;
  unit: string;
  precision?: number;
}

function IMUField({ label, value, unit, precision = 2 }: IMUFieldProps) {
  const formatted = value >= 0
    ? ` ${value.toFixed(precision)}`
    : value.toFixed(precision);

  return (
    <div className="flex flex-col gap-0.5 p-2.5 bg-zinc-900 border border-zinc-800/60 rounded">
      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">{label}</span>
      <span className="text-sm font-mono tabular-nums text-zinc-200">
        {formatted}
        <span className="text-[10px] text-zinc-600 ml-1">{unit}</span>
      </span>
    </div>
  );
}

interface IMUPanelProps {
  frame: IMUFrame | null;
}

export function IMUPanel({ frame }: IMUPanelProps) {
  return (
    <section className="flex flex-col gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        IMU — GY-87
      </h2>

      {frame === null ? (
        <div className="flex items-center justify-center h-28 text-zinc-700 text-xs font-mono">
          Waiting for data…
        </div>
      ) : (
        <>
          {/* Orientation */}
          <div>
            <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1.5">Orientation</p>
            <div className="grid grid-cols-3 gap-1.5">
              <IMUField label="Pitch" value={frame.pitch} unit="°" precision={1} />
              <IMUField label="Roll"  value={frame.roll}  unit="°" precision={1} />
              <IMUField label="Yaw"   value={frame.yaw}   unit="°" precision={1} />
            </div>
          </div>

          {/* Accelerometer */}
          <div>
            <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1.5">Accelerometer</p>
            <div className="grid grid-cols-3 gap-1.5">
              <IMUField label="Accel X" value={frame.accelX} unit="g" precision={3} />
              <IMUField label="Accel Y" value={frame.accelY} unit="g" precision={3} />
              <IMUField label="Accel Z" value={frame.accelZ} unit="g" precision={3} />
            </div>
          </div>

          {/* Gyroscope */}
          <div>
            <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-1.5">Gyroscope</p>
            <div className="grid grid-cols-3 gap-1.5">
              <IMUField label="Gyro X" value={frame.gyroX} unit="°/s" precision={1} />
              <IMUField label="Gyro Y" value={frame.gyroY} unit="°/s" precision={1} />
              <IMUField label="Gyro Z" value={frame.gyroZ} unit="°/s" precision={1} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

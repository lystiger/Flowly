import { Activity, BarChart3, BookOpen, Database, Gauge, Sliders, Wifi } from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    title: 'Start With Signal',
    body: 'Open Live Monitor and confirm the connection pill shows connected. Keep mock mode on for UI checks, then switch to the backend stream when hardware is ready.',
    icon: Wifi,
  },
  {
    title: 'Calibrate The Glove',
    body: 'Capture open and closed hand poses before recording real sessions. Save a named profile so the team can compare normalized values consistently.',
    icon: Sliders,
  },
  {
    title: 'Check Pipeline Health',
    body: 'Use Flow Health when values look wrong. Watch latency, throughput, dropped packets, parser errors, and event logs before blaming the model.',
    icon: Gauge,
  },
  {
    title: 'Record Training Data',
    body: 'Pick or create a gesture label, press record, perform the gesture cleanly, then stop and export CSV or JSON for backend and ML work.',
    icon: Database,
  },
];

const PAGE_GUIDES = [
  ['Live Monitor', 'Inspect flex values, IMU orientation, packet stats, and raw stream output.'],
  ['Calibration', 'Capture open and closed reference poses and save reusable calibration profiles.'],
  ['Flow Health', 'Debug serial, parser, WebSocket, and dashboard data movement.'],
  ['Session Recorder', 'Create labeled gesture datasets and export them for training or analysis.'],
];

const TEAM_RULES = [
  'Use the same calibration profile for a shared recording batch.',
  'Name gesture labels with lowercase snake_case, for example thank_you.',
  'Record short, clean sessions instead of one long mixed session.',
  'Export raw sessions before clearing the table.',
  'Log backend or hardware problems only after checking Flow Health.',
];

const ARDUINO_SETUP = [
  {
    platform: 'Windows',
    steps: [
      'Install Arduino IDE and the ESP32 board package.',
      'Upload the glove sketch, then close Serial Monitor and Serial Plotter.',
      'Find the board port in Tools > Port or Device Manager, for example COM3.',
      'Set backend .env to DATA_MODE=serial, SERIAL_PORT=COM3, SERIAL_BAUDRATE=115200.',
    ],
  },
  {
    platform: 'Linux',
    steps: [
      'Install Arduino IDE and the ESP32 board package.',
      'Add your user to the serial group, usually dialout, then log out and back in.',
      'Find the board port with ls /dev/ttyUSB* or ls /dev/ttyACM*.',
      'Set backend .env to DATA_MODE=serial, SERIAL_PORT=/dev/ttyUSB0, SERIAL_BAUDRATE=115200.',
    ],
  },
];

export function InstructionsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div>
          <h1 className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase">
            Instructions
          </h1>
          <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
            Team workflow for operating the frontend before backend integration
          </p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-500">
          <BookOpen size={13} />
          <span>Member guide</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WORKFLOW_STEPS.map(step => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
                        <Icon size={14} />
                      </span>
                      <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-[11px] leading-5 text-zinc-500">
                      {step.body}
                    </p>
                  </article>
                );
              })}
            </div>

            <section className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className="text-violet-400" />
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Page Map
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PAGE_GUIDES.map(([name, description]) => (
                  <div key={name} className="flex items-start gap-3 p-3 rounded border border-zinc-800 bg-zinc-950/40">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <div>
                      <div className="text-[11px] font-mono font-semibold text-zinc-300">{name}</div>
                      <div className="text-[10px] leading-4 text-zinc-600 mt-0.5">{description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Wifi size={14} className="text-amber-400" />
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Arduino IDE Setup
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ARDUINO_SETUP.map(group => (
                  <div key={group.platform} className="p-3 rounded border border-zinc-800 bg-zinc-950/40">
                    <h3 className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-300 mb-2">
                      {group.platform}
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      {group.steps.map((step, index) => (
                        <div key={step} className="flex gap-2 text-[10px] leading-4 text-zinc-600">
                          <span className="font-mono text-zinc-700 tabular-nums">{index + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] leading-5 text-zinc-600 mt-3">
                The sketch must print one complete JSON object per line with Serial.println. Keep the
                baud rate matched to the backend, and do not leave Arduino Serial Monitor open while
                Flowly is reading the port.
              </p>
            </section>
          </section>

          <aside className="flex flex-col gap-4">
            <section className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-emerald-400" />
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  Team Rules
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                {TEAM_RULES.map((rule, index) => (
                  <div key={rule} className="flex gap-2 text-[10px] leading-4 text-zinc-500">
                    <span className="font-mono text-zinc-700 tabular-nums">{index + 1}.</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
                Backend Handoff
              </h2>
              <p className="text-[10px] leading-5 text-zinc-500">
                Before backend work, confirm the UI can run in mock mode, calibration profiles save locally,
                Flow Health updates live, and a sample recording exports successfully.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

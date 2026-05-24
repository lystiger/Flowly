import { useCalibration } from '../../contexts/CalibrationContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { CapturePanel } from '../../components/calibration/CapturePanel';
import { NormalizationPreview } from '../../components/calibration/NormalizationPreview';
import { CalibrationProfileBar } from '../../components/calibration/CalibrationProfileBar';
import type { FingerKey } from '../../types/sensor';

export function CalibrationPage() {
  const {
    profile,
    profileList,
    openPhase,
    closedPhase,
    openProgress,
    closedProgress,
    normalizedLive,
    captureOpen,
    captureClosed,
    resetCapture,
    saveProfile,
    loadProfile,
    deleteProfile,
    renameProfile,
  } = useCalibration();

  const { connection } = useWebSocket();

  const isReadyToSave = profile.open !== null && profile.closed !== null;

  const handleUpdateSnapshot = (pose: 'open' | 'closed', finger: FingerKey, value: number) => {
    // Manual override: patch the snapshot in context via a controlled update
    // CalibrationContext exposes profile directly; we call a targeted update
    // through the existing resetCapture + re-inject pattern via direct state mutation
    // is avoided — instead we bubble up through a dedicated prop here.
    // For now this is handled by the profile setter inside context if exposed.
    // This is a stub for Phase 2 manual override wiring.
    void pose; void finger; void value;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header - Observation Module Style */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-800 bg-black/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-[10px] font-mono font-bold text-cyan-500 tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse" />
              SYS_CALIB_NODE.01
            </h1>
            <span className="text-[8px] font-mono text-zinc-600 tracking-tighter uppercase">Protocol: ESP-NOW // 802.11.LR</span>
          </div>
          <div className="h-6 w-px bg-zinc-800 mx-1" />
          <div className="text-[9px] font-mono text-zinc-500 leading-none">
            <div className="tabular-nums">AVG_WINDOW: 30_PKT</div>
            <div className="tabular-nums text-zinc-600">RATE: {connection.packetRate}Hz</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 px-4 py-1 bg-zinc-900/50 border border-zinc-800/50 rounded-sm">
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-500 uppercase">Latency</span>
            <span className={`text-[10px] font-mono tabular-nums ${connection.latencyMs > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {connection.latencyMs}ms
            </span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-[8px] text-zinc-500 uppercase">Status</span>
            <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-tight">{connection.status}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono ${openPhase === 'done' ? 'text-emerald-500' : 'text-zinc-700'}`}>
            Open {openPhase === 'done' ? '✓' : '○'}
          </span>
          <span className={`text-[10px] font-mono ${closedPhase === 'done' ? 'text-emerald-500' : 'text-zinc-700'}`}>
            Closed {closedPhase === 'done' ? '✓' : '○'}
          </span>
          {isReadyToSave && (
            <span className="text-[10px] font-mono text-cyan-400 animate-pulse bg-cyan-950/30 px-2 py-0.5 border border-cyan-800/50">
              READY_FOR_CALC
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-4 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="flex flex-col gap-4 max-w-5xl mx-auto">

          {/* Capture row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CapturePanel
              pose="open"
              phase={openPhase}
              progress={openProgress}
              snapshot={profile.open}
              onCapture={captureOpen}
              onReset={() => resetCapture('open')}
            />
            <CapturePanel
              pose="closed"
              phase={closedPhase}
              progress={closedProgress}
              snapshot={profile.closed}
              onCapture={captureClosed}
              onReset={() => resetCapture('closed')}
            />
          </div>

          {/* Normalization preview */}
          <NormalizationPreview
            open={profile.open}
            closed={profile.closed}
            normalizedLive={normalizedLive}
            onUpdateSnapshot={handleUpdateSnapshot}
          />

          {/* Profile bar */}
          <CalibrationProfileBar
            profileName={profile.name}
            profileList={profileList}
            onSave={saveProfile}
            onLoad={loadProfile}
            onDelete={deleteProfile}
            onRename={renameProfile}
            isReadyToSave={isReadyToSave}
          />

        </div>
      </div>
    </div>
  );
}

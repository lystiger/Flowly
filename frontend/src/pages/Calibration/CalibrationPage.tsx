import { useCalibration } from '../../contexts/CalibrationContext';
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
      {/* Page header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div>
          <h1 className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase">
            Calibration
          </h1>
          <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
            Capture open/closed hand poses — 30-packet averaged snapshot
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono ${openPhase === 'done' ? 'text-emerald-500' : 'text-zinc-700'}`}>
            Open {openPhase === 'done' ? '✓' : '○'}
          </span>
          <span className={`text-[10px] font-mono ${closedPhase === 'done' ? 'text-emerald-500' : 'text-zinc-700'}`}>
            Closed {closedPhase === 'done' ? '✓' : '○'}
          </span>
          {isReadyToSave && (
            <span className="text-[10px] font-mono text-cyan-400">
              Ready to normalize
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-4">
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

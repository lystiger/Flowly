import { useWebSocket } from '../../contexts/WebSocketContext';
import { useSessionRecorder } from '../../contexts/SessionRecorderContext';
import { RecordingControlBar } from '../../components/recorder/RecordingControlBar';
import { GestureTagPanel } from '../../components/recorder/GestureTagPanel';
import { SessionSparkPreview } from '../../components/recorder/SessionSparkPreview';
import { SessionTable } from '../../components/recorder/SessionTable';

export function SessionRecorderPage() {
  const { connection } = useWebSocket();
  const {
    recordingState,
    activeLabel,
    setActiveLabel,
    elapsedMs,
    sampleCount,
    liveSamples,
    sessions,
    startRecording,
    stopRecording,
    deleteSession,
    clearAllSessions,
    exportSessionCSV,
    exportSessionJSON,
    exportAllCSV,
  } = useSessionRecorder();

  const isConnected = connection.status === 'connected';
  const isRecording = recordingState === 'recording';

  // Label changes sync to the tag panel two-way
  const handleLabelSelect = (label: string) => {
    if (!isRecording) setActiveLabel(label);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div>
          <h1 className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase">
            Session Recorder
          </h1>
          <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
            Record labeled gesture sessions · Export CSV / JSON for ML training
          </p>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-zinc-600">
          <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          <span className="text-zinc-800">·</span>
          <span>
            {sessions.reduce((n, s) => n + s.sampleCount, 0).toLocaleString()} total samples
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">

          {/* Recording control */}
          <RecordingControlBar
            recordingState={recordingState}
            activeLabel={activeLabel}
            elapsedMs={elapsedMs}
            sampleCount={sampleCount}
            onLabelChange={setActiveLabel}
            onStart={startRecording}
            onStop={stopRecording}
            isConnected={isConnected}
          />

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">

            {/* Left: spark + session table */}
            <div className="flex flex-col gap-4">
              <SessionSparkPreview
                liveSamples={liveSamples}
                isRecording={isRecording}
              />
              <SessionTable
                sessions={sessions}
                onExportCSV={exportSessionCSV}
                onExportJSON={exportSessionJSON}
                onDelete={deleteSession}
                onExportAll={exportAllCSV}
                onClearAll={clearAllSessions}
              />
            </div>

            {/* Right: gesture tag panel */}
            <GestureTagPanel
              activeLabel={activeLabel}
              onSelectLabel={handleLabelSelect}
              disabled={isRecording}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

import { Download, Trash2, FileJson, FileText } from 'lucide-react';
import type { RecordedSession } from '../../types/sensor';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m > 0) return `${m}m ${rem}s`;
  return `${s}.${Math.floor((ms % 1000) / 100)}s`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

interface SessionRowProps {
  session: RecordedSession;
  index: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onDelete: () => void;
}

function SessionRow({ session, index, onExportCSV, onExportJSON, onDelete }: SessionRowProps) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 group rounded transition-colors">
      {/* Index */}
      <span className="text-[10px] font-mono text-zinc-700 w-5 tabular-nums shrink-0 text-right">
        {index + 1}
      </span>

      {/* Label */}
      <span className="flex-1 text-[11px] font-mono font-semibold text-zinc-200 truncate min-w-0">
        {session.label}
      </span>

      {/* Metadata */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-[10px] font-mono tabular-nums text-zinc-500 w-16 text-right">
          {session.sampleCount.toLocaleString()}
          <span className="text-zinc-700 ml-0.5">smp</span>
        </span>
        <span className="text-[10px] font-mono tabular-nums text-zinc-500 w-12 text-right">
          {formatDuration(session.durationMs)}
        </span>
        <span className="text-[10px] font-mono tabular-nums text-zinc-600 w-16 text-right">
          {session.packetRate}
          <span className="text-zinc-700 ml-0.5">Hz</span>
        </span>
        <span className="text-[9px] font-mono text-zinc-700 w-20 text-right">
          {formatTime(session.startedAt)}
        </span>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 h-6 px-2 rounded border border-zinc-700 text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-[9px] font-mono"
          title="Export CSV"
        >
          <FileText size={10} />
          CSV
        </button>
        <button
          onClick={onExportJSON}
          className="flex items-center gap-1 h-6 px-2 rounded border border-zinc-700 text-zinc-500 hover:text-violet-400 hover:border-violet-500/40 transition-colors text-[9px] font-mono"
          title="Export JSON"
        >
          <FileJson size={10} />
          JSON
        </button>
        <button
          onClick={onDelete}
          className="h-6 w-6 flex items-center justify-center rounded border border-zinc-800 text-zinc-700 hover:text-red-400 hover:border-red-500/30 transition-colors"
          title="Delete session"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}

interface SessionTableProps {
  sessions: RecordedSession[];
  onExportCSV: (s: RecordedSession) => void;
  onExportJSON: (s: RecordedSession) => void;
  onDelete: (id: string) => void;
  onExportAll: () => void;
  onClearAll: () => void;
}

export function SessionTable({
  sessions,
  onExportCSV,
  onExportJSON,
  onDelete,
  onExportAll,
  onClearAll,
}: SessionTableProps) {
  const totalSamples = sessions.reduce((sum, s) => sum + s.sampleCount, 0);

  return (
    <section className="flex flex-col gap-0 bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-800 bg-zinc-900/60">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 w-5 text-right">#</span>
        <span className="flex-1 text-[9px] font-mono uppercase tracking-widest text-zinc-600">Label</span>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 w-16 text-right">Samples</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 w-12 text-right">Duration</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 w-16 text-right">Avg Rate</span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 w-20 text-right">Time</span>
          {/* Action column spacer */}
          <span className="w-[5.5rem]" />
        </div>
      </div>

      {/* Rows */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-2xl font-mono text-zinc-800">—</span>
          <span className="text-[10px] font-mono text-zinc-700">No sessions recorded yet</span>
        </div>
      ) : (
        <div
          className="flex flex-col max-h-64 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
        >
          {sessions.map((s, i) => (
            <SessionRow
              key={s.id}
              session={s}
              index={i}
              onExportCSV={() => onExportCSV(s)}
              onExportJSON={() => onExportJSON(s)}
              onDelete={() => onDelete(s.id)}
            />
          ))}
        </div>
      )}

      {/* Footer actions */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 border-t border-zinc-800 bg-zinc-900/40">
          <span className="text-[9px] font-mono text-zinc-700 flex-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} · {totalSamples.toLocaleString()} total samples
          </span>
          <button
            onClick={onExportAll}
            className="flex items-center gap-1.5 h-6 px-3 rounded border border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors text-[10px] font-mono"
          >
            <Download size={10} />
            Export All CSV
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 h-6 px-3 rounded border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/30 transition-colors text-[10px] font-mono"
          >
            <Trash2 size={10} />
            Clear All
          </button>
        </div>
      )}
    </section>
  );
}

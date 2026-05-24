import clsx from 'clsx';
import { useRef, useEffect } from 'react';
import type { FlowEvent, FlowEventKind } from '../../types/sensor';

const KIND_STYLES: Record<FlowEventKind, { badge: string; dot: string }> = {
  drop:        { badge: 'text-red-400 bg-red-500/10 border-red-500/20',          dot: 'bg-red-400' },
  parse_error: { badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',    dot: 'bg-amber-400' },
  reconnect:   { badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',       dot: 'bg-cyan-400' },
  spike:       { badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20', dot: 'bg-violet-400' },
};

const KIND_LABELS: Record<FlowEventKind, string> = {
  drop:        'DROP',
  parse_error: 'PARSE ERR',
  reconnect:   'CONNECT',
  spike:       'SPIKE',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
}

interface EventLogProps {
  events: FlowEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to top on new event (events are prepended)
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [events.length]);

  return (
    <section className="flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Event Log
        </h2>
        <span className="text-[9px] font-mono text-zinc-700">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex items-center justify-center h-16 text-[10px] font-mono text-zinc-700">
          No events recorded
        </div>
      ) : (
        <div
          ref={listRef}
          className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
        >
          {events.map(ev => {
            const s = KIND_STYLES[ev.kind];
            return (
              <div
                key={ev.id}
                className="flex items-start gap-2.5 py-1 border-b border-zinc-800/50 last:border-0"
              >
                {/* Timestamp */}
                <span className="text-[9px] font-mono text-zinc-700 tabular-nums shrink-0 mt-px">
                  {formatTime(ev.t)}
                </span>

                {/* Kind badge */}
                <span className={clsx(
                  'text-[8px] font-mono font-semibold tracking-widest px-1.5 py-0.5 rounded border shrink-0',
                  s.badge
                )}>
                  {KIND_LABELS[ev.kind]}
                </span>

                {/* Detail */}
                <span className="text-[10px] font-mono text-zinc-400 leading-snug">
                  {ev.detail}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

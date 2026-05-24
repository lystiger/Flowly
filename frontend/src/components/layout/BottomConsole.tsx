import { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import clsx from 'clsx';

export function BottomConsole() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { history, latestPacket } = useWebSocket();
  const [logs, setLogs] = useState<{ t: string; msg: string; type: 'info' | 'warn' | 'error' | 'data' }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  // Push latest packet to logs (simulated)
  useEffect(() => {
    if (latestPacket) {
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog = {
        t: timestamp,
        msg: `Packet received: seq=${latestPacket.sequenceId} | checksum=valid`,
        type: 'data' as const
      };
      setLogs(prev => [...prev.slice(-49), newLog]);
    }
  }, [latestPacket]);

  return (
    <div className={clsx(
      "border-t border-zinc-800 bg-zinc-950 transition-all duration-200 flex flex-col",
      isExpanded ? "h-48" : "h-9"
    )}>
      {/* Console Header */}
      <div 
        className="flex items-center justify-between px-4 h-9 border-b border-zinc-900 cursor-pointer hover:bg-zinc-900/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-zinc-500" />
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
            System Console / Logs
          </span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-500">
            {logs.length} events
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setLogs([]); }}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
            title="Clear logs"
          >
            <Trash2 size={13} />
          </button>
          {isExpanded ? <ChevronDown size={14} className="text-zinc-600" /> : <ChevronUp size={14} className="text-zinc-600" />}
        </div>
      </div>

      {/* Log area */}
      {isExpanded && (
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 bg-black/20"
        >
          {logs.length === 0 ? (
            <div className="text-zinc-700 italic">Awaiting system events...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-zinc-600 shrink-0">[{log.t}]</span>
                <span className={clsx(
                  log.type === 'data' ? 'text-cyan-600' :
                  log.type === 'warn' ? 'text-amber-500' :
                  log.type === 'error' ? 'text-rose-500' :
                  'text-zinc-400'
                )}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

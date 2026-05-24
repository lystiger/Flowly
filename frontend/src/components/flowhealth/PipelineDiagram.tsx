import clsx from 'clsx';
import type { ConnectionStatus } from '../../types/sensor';

interface HopProps {
  label: string;
  sublabel: string;
  status: 'ok' | 'warn' | 'degraded' | 'down';
  metric?: string;
  isLast?: boolean;
}

const HOP_STATUS_STYLES = {
  ok:       { border: 'border-emerald-500/30 bg-emerald-500/5',  dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'OK' },
  warn:     { border: 'border-amber-500/30 bg-amber-500/5',      dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400', label: 'WARN' },
  degraded: { border: 'border-amber-600/30 bg-amber-600/5',      dot: 'bg-amber-600 animate-pulse', text: 'text-amber-500', label: 'DEG' },
  down:     { border: 'border-red-500/30 bg-red-500/5',          dot: 'bg-red-500',     text: 'text-red-400', label: 'DOWN' },
} as const;

function Hop({ label, sublabel, status, metric, isLast }: HopProps) {
  const s = HOP_STATUS_STYLES[status];
  return (
    <div className="flex flex-col items-center gap-0">
      {/* Node */}
      <div className={clsx('w-full border rounded px-3 py-2.5 flex items-center justify-between gap-2', s.border)}>
        <div className="flex items-center gap-2">
          <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', s.dot)} />
          <div>
            <div className="text-[11px] font-mono font-semibold text-zinc-200">{label}</div>
            <div className="text-[9px] font-mono text-zinc-600">{sublabel}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={clsx('text-[9px] font-mono font-semibold tracking-widest', s.text)}>{s.label}</div>
          {metric && <div className="text-[9px] font-mono text-zinc-600 tabular-nums">{metric}</div>}
        </div>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex flex-col items-center gap-0 my-0.5">
          <div className="w-px h-3 bg-zinc-700" />
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-600" />
        </div>
      )}
    </div>
  );
}

interface PipelineDiagramProps {
  connectionStatus: ConnectionStatus;
  latencyMs: number;
  packetRate: number;
  parseErrors: number;
  droppedPackets: number;
}

function getHopStatus(condition: boolean, fallback: HopProps['status'] = 'ok'): HopProps['status'] {
  return condition ? fallback : 'ok';
}

export function PipelineDiagram({
  connectionStatus,
  latencyMs,
  packetRate,
  parseErrors,
  droppedPackets,
}: PipelineDiagramProps) {
  const wsDown = connectionStatus === 'disconnected' || connectionStatus === 'error';
  const wsReconnecting = connectionStatus === 'reconnecting';

  const serialStatus = getHopStatus(droppedPackets > 5, droppedPackets > 20 ? 'down' : 'warn');
  const parserStatus = getHopStatus(parseErrors > 0, parseErrors > 5 ? 'degraded' : 'warn');
  const wsStatus: HopProps['status'] = wsDown ? 'down' : wsReconnecting ? 'warn' : packetRate < 20 ? 'degraded' : 'ok';
  const clientStatus: HopProps['status'] = wsDown ? 'down' : latencyMs > 50 ? 'warn' : 'ok';

  return (
    <section className="flex flex-col gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        Data Pipeline
      </h2>

      <div className="flex flex-col gap-0">
        <Hop
          label="ESP32 Serial"
          sublabel="UART @ 115200 baud"
          status={serialStatus}
          metric={`${droppedPackets} drops`}
        />
        <Hop
          label="Python Parser"
          sublabel="FastAPI signal proc"
          status={parserStatus}
          metric={`${parseErrors} errors`}
        />
        <Hop
          label="WebSocket"
          sublabel="ws://localhost:8000"
          status={wsStatus}
          metric={`${packetRate} pkt/s`}
        />
        <Hop
          label="Dashboard"
          sublabel="React client"
          status={clientStatus}
          metric={`${latencyMs}ms`}
          isLast
        />
      </div>

      {/* Overall health summary */}
      <div className={clsx(
        'text-center text-[9px] font-mono tracking-widest uppercase py-1.5 rounded border',
        [serialStatus, parserStatus, wsStatus, clientStatus].some(s => s === 'down')
          ? 'text-red-400 border-red-500/20 bg-red-500/5'
          : [serialStatus, parserStatus, wsStatus, clientStatus].some(s => s === 'warn' || s === 'degraded')
            ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
            : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
      )}>
        {[serialStatus, parserStatus, wsStatus, clientStatus].some(s => s === 'down')
          ? 'Pipeline Interrupted'
          : [serialStatus, parserStatus, wsStatus, clientStatus].some(s => s === 'warn' || s === 'degraded')
            ? 'Pipeline Degraded'
            : 'Pipeline Healthy'}
      </div>
    </section>
  );
}

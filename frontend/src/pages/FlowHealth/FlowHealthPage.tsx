import { useMemo } from 'react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { EventLog } from '../../components/flowhealth/EventLog';
import { KPICard, type KPIStatus } from '../../components/flowhealth/KPICard';
import { LatencyChart } from '../../components/flowhealth/LatencyChart';
import { PipelineDiagram } from '../../components/flowhealth/PipelineDiagram';
import { ThroughputChart } from '../../components/flowhealth/ThroughputChart';

function latencyStatus(ms: number): KPIStatus {
  if (ms > 50) return 'danger';
  if (ms > 20) return 'warn';
  return 'ok';
}

function rateStatus(hz: number): KPIStatus {
  if (hz < 20) return 'danger';
  if (hz < 28) return 'warn';
  return 'ok';
}

function dropStatus(count: number): KPIStatus {
  if (count > 20) return 'danger';
  if (count > 0) return 'warn';
  return 'ok';
}

function errorStatus(count: number): KPIStatus {
  if (count > 5) return 'danger';
  if (count > 0) return 'warn';
  return 'ok';
}

export function FlowHealthPage() {
  const { connection, flowHealth } = useWebSocket();
  const { latencyMs, packetRate, droppedPackets, totalPackets } = connection;
  const { latencyHistory, throughputHistory, parseErrors, events, jitterMs } = flowHealth;

  const latencySpark = useMemo(
    () => latencyHistory.slice(-30).map(point => ({ v: point.latencyMs })),
    [latencyHistory],
  );
  const throughputSpark = useMemo(
    () => throughputHistory.slice(-30).map(point => ({ v: point.packetsPerSec })),
    [throughputHistory],
  );

  const dropRate = totalPackets > 0
    ? ((droppedPackets / (totalPackets + droppedPackets)) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0">
        <div>
          <h1 className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase">
            Flow Health
          </h1>
          <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
            Serial to parser to WebSocket to client pipeline telemetry
          </p>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-600">
          <span>{totalPackets.toLocaleString()} total packets</span>
          <span className="text-zinc-800">/</span>
          <span>{dropRate}% drop rate</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard
              label="WS Latency"
              value={latencyMs}
              unit="ms"
              status={latencyStatus(latencyMs)}
              sparkData={latencySpark}
              subtext={`Jitter +/-${jitterMs.toFixed(1)}ms`}
            />
            <KPICard
              label="Packet Rate"
              value={packetRate}
              unit="Hz"
              status={rateStatus(packetRate)}
              sparkData={throughputSpark}
              subtext="Target: 30 pkt/s"
            />
            <KPICard
              label="Dropped Packets"
              value={droppedPackets}
              status={dropStatus(droppedPackets)}
              subtext={`${dropRate}% drop rate`}
            />
            <KPICard
              label="Parse Errors"
              value={parseErrors}
              status={errorStatus(parseErrors)}
              subtext="Malformed frames"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4">
            <div className="flex flex-col gap-4">
              <LatencyChart data={latencyHistory} jitterMs={jitterMs} />
              <ThroughputChart data={throughputHistory} />
            </div>

            <PipelineDiagram
              connectionStatus={connection.status}
              latencyMs={latencyMs}
              packetRate={packetRate}
              parseErrors={parseErrors}
              droppedPackets={droppedPackets}
            />
          </div>

          <EventLog events={events} />
        </div>
      </div>
    </div>
  );
}

import { useWebSocket } from '../../../contexts/WebSocketContext';

export function RawStreamPanel() {
  const { latestPacket } = useWebSocket();

  return (
    <section className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Raw Stream</h2>
      </div>
      <div className="p-3 bg-zinc-900/40 border border-zinc-800/60 rounded flex flex-col h-[150px]">
        <pre className="flex-1 text-[10px] font-mono text-zinc-500 overflow-y-auto whitespace-pre-wrap break-all leading-tight custom-scrollbar">
          {latestPacket
            ? JSON.stringify(latestPacket, null, 2)
            : 'Awaiting first packet...'}
        </pre>
      </div>
    </section>
  );
}

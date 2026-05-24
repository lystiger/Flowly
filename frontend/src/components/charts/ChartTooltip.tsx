export function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; color: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-[10px] font-mono">
      {payload.map(p => (
        <div key={p.name} className="flex gap-2 items-center">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-zinc-300 tabular-nums">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

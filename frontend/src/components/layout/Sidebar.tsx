import { useState } from 'react';
import clsx from 'clsx';
import {
  Activity,
  Sliders,
  GitBranch,
  Radio,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type PageId = 'live-monitor' | 'calibration' | 'flow-health' | 'session-recorder' | 'instructions';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.FC<{ size?: number; strokeWidth?: number }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'live-monitor',      label: 'Live Monitor',      icon: Activity },
  { id: 'calibration',       label: 'Calibration',       icon: Sliders },
  { id: 'flow-health',       label: 'Flow Health',       icon: GitBranch },
  { id: 'session-recorder',  label: 'Session Recorder',  icon: Radio },
  { id: 'instructions',      label: 'Instructions',      icon: BookOpen },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'relative flex flex-col h-full bg-zinc-950 border-r border-zinc-800 transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2.5 px-4 h-12 border-b border-zinc-800 shrink-0">
        <div className="w-6 h-6 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-mono font-bold text-cyan-400">GL</span>
        </div>
        {!collapsed && (
          <span className="text-xs font-mono font-semibold text-zinc-200 tracking-widest uppercase whitespace-nowrap">
            GloveFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {NAV_ITEMS.map(item => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={clsx(
                'flex items-center gap-3 rounded px-2 h-9 text-left transition-colors duration-100 group',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              )}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && (
                <span className="text-[11px] font-mono tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-1 h-1 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-zinc-800 shrink-0">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center justify-center w-full h-8 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors duration-100"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}

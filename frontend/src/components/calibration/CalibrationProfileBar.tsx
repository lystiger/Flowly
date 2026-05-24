import { useState } from 'react';
import clsx from 'clsx';
import { Save, FolderOpen, Trash2, Check } from 'lucide-react';

interface CalibrationProfileBarProps {
  profileName: string;
  profileList: string[];
  onSave: () => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  onRename: (name: string) => void;
  isReadyToSave: boolean;
}

export function CalibrationProfileBar({
  profileName,
  profileList,
  onSave,
  onLoad,
  onDelete,
  onRename,
  isReadyToSave,
}: CalibrationProfileBarProps) {
  const [savedFlash, setSavedFlash] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleSave = () => {
    onSave();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <section className="flex items-center gap-3 p-2 bg-black border border-zinc-800 rounded-sm shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Decorative scanner line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-20" />
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-zinc-600" />
      <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-zinc-600" />
      
      {/* Profile name input */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 shrink-0">ID:</span>
        <input
          type="text"
          value={profileName}
          onChange={e => onRename(e.target.value)}
          maxLength={32}
          className="w-48 h-6 bg-zinc-950 border border-zinc-800 px-2 text-[10px] font-mono text-cyan-500 focus:outline-none focus:border-cyan-700 transition-colors selection:bg-cyan-900 selection:text-white placeholder:text-zinc-800"
          placeholder="NAME_RECORD..."
        />
      </div>

      <div className="w-px h-5 bg-zinc-800" />

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!isReadyToSave}
        className={clsx(
          'flex items-center gap-1.5 h-6 px-3 rounded-sm text-[9px] font-mono font-bold transition-all duration-75 disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-tighter',
          savedFlash
            ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            : 'bg-zinc-900 hover:bg-cyan-900/20 text-zinc-400 border border-zinc-800 hover:border-cyan-800 hover:text-cyan-400'
        )}
      >
        {savedFlash ? <Check size={10} strokeWidth={3} /> : <Save size={10} />}
        {savedFlash ? 'EXEC_SUCCESS' : 'SAVE_PARAM'}
      </button>

      {/* Load */}
      <div className="relative">
        <button
          onClick={() => setShowLoader(v => !v)}
          disabled={profileList.length === 0}
          className="flex items-center gap-1.5 h-6 px-3 rounded-sm text-[9px] font-mono text-zinc-500 hover:text-cyan-400 border border-zinc-800 hover:border-cyan-900 transition-colors disabled:opacity-20 uppercase tracking-tighter"
        >
          <FolderOpen size={11} />
          FETCH
          {profileList.length > 0 && (
            <span className="ml-1 text-[8px] px-1 bg-zinc-800 rounded text-zinc-400">{profileList.length}</span>
          )}
        </button>

        {showLoader && profileList.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-56 bg-black border border-zinc-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden">
            <div className="bg-zinc-900 px-2 py-1 border-b border-zinc-800 text-[8px] font-mono text-zinc-500">AVAILABLE_SLOTS</div>
            {profileList.map(name => (
              <div
                key={name}
                className="flex items-center justify-between px-3 py-1.5 hover:bg-cyan-950/30 group transition-colors border-b border-zinc-900/50 last:border-0"
              >
                <button
                  onClick={() => { onLoad(name); setShowLoader(false); }}
                  className={clsx(
                    'flex-1 text-left text-[11px] font-mono transition-colors',
                    name === profileName ? 'text-cyan-400' : 'text-zinc-300 hover:text-zinc-100'
                  )}
                >
                  {name}
                  {name === profileName && (
                    <span className="ml-1.5 text-[9px] text-zinc-600">active</span>
                  )}
                </button>
                <button
                  onClick={() => onDelete(name)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all ml-2"
                  title="Delete profile"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Ready state hint */}
      {!isReadyToSave ? (
        <span className="text-[9px] font-mono text-zinc-700 italic flex items-center gap-2">
          <span className="w-1 h-1 bg-zinc-800 animate-pulse" />
          AWAITING_CALIB_DATA_LOCK...
        </span>
      ) : (
        <span className="text-[9px] font-mono text-emerald-900 font-bold tracking-tighter">
          CAL_RDY_v1.0
        </span>
      )}
    </section>
  );
}

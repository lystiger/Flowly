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
    <section className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      {/* Profile name input */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 shrink-0">Profile</span>
        <input
          type="text"
          value={profileName}
          onChange={e => onRename(e.target.value)}
          maxLength={32}
          className="w-40 h-7 bg-zinc-900 border border-zinc-700 rounded px-2 text-[11px] font-mono text-zinc-200 focus:outline-none focus:border-cyan-600 transition-colors"
        />
      </div>

      <div className="w-px h-5 bg-zinc-800" />

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!isReadyToSave}
        className={clsx(
          'flex items-center gap-1.5 h-7 px-3 rounded text-[10px] font-mono font-semibold transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed',
          savedFlash
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
        )}
      >
        {savedFlash ? <Check size={11} /> : <Save size={11} />}
        {savedFlash ? 'Saved' : 'Save'}
      </button>

      {/* Load */}
      <div className="relative">
        <button
          onClick={() => setShowLoader(v => !v)}
          disabled={profileList.length === 0}
          className="flex items-center gap-1.5 h-7 px-3 rounded text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FolderOpen size={11} />
          Load
          {profileList.length > 0 && (
            <span className="ml-0.5 text-[9px] text-zinc-600">({profileList.length})</span>
          )}
        </button>

        {showLoader && profileList.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded shadow-xl z-50">
            {profileList.map(name => (
              <div
                key={name}
                className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-800 group"
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
      {!isReadyToSave && (
        <span className="text-[9px] font-mono text-zinc-700">
          Capture both poses to save
        </span>
      )}
    </section>
  );
}

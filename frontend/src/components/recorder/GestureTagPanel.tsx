import clsx from 'clsx';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';

// Preset gesture vocabulary for ASL / common signs
const PRESET_GESTURES = [
  'hello', 'goodbye', 'thank_you', 'please', 'yes', 'no',
  'help', 'sorry', 'wait', 'stop', 'go', 'come',
  'i', 'you', 'we', 'name', 'what', 'where',
  'good', 'bad', 'like', 'want', 'need', 'have',
  'open_hand', 'closed_fist', 'point', 'thumbs_up', 'thumbs_down', 'peace',
];

interface GestureTagPanelProps {
  activeLabel: string;
  onSelectLabel: (label: string) => void;
  disabled: boolean;
}

export function GestureTagPanel({ activeLabel, onSelectLabel, disabled }: GestureTagPanelProps) {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  const handleAddCustom = () => {
    const tag = customInput.trim().replace(/\s+/g, '_').toLowerCase();
    if (!tag || customTags.includes(tag) || PRESET_GESTURES.includes(tag)) return;
    setCustomTags(prev => [...prev, tag]);
    setCustomInput('');
    onSelectLabel(tag);
  };

  const handleRemoveCustom = (tag: string) => {
    setCustomTags(prev => prev.filter(t => t !== tag));
    if (activeLabel === tag) onSelectLabel('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddCustom();
  };

  return (
    <section className="flex flex-col gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div>
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          Gesture Tags
        </h2>
        <p className="text-[9px] font-mono text-zinc-700 mt-0.5">
          Select or create a label before recording
        </p>
      </div>

      {/* Active label display */}
      <div className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded border font-mono',
        activeLabel
          ? 'border-cyan-500/30 bg-cyan-500/5'
          : 'border-zinc-800 bg-zinc-900/40'
      )}>
        <span className="text-[9px] uppercase tracking-widest text-zinc-600">Active:</span>
        <span className={clsx(
          'text-[11px] font-semibold flex-1 truncate',
          activeLabel ? 'text-cyan-400' : 'text-zinc-700 italic'
        )}>
          {activeLabel || 'none selected'}
        </span>
        {activeLabel && (
          <button
            onClick={() => onSelectLabel('')}
            disabled={disabled}
            className="text-zinc-600 hover:text-zinc-300 disabled:opacity-30"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Preset tags */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-700 mb-2">Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_GESTURES.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectLabel(tag)}
              disabled={disabled}
              className={clsx(
                'px-2 py-0.5 rounded text-[10px] font-mono border transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed',
                activeLabel === tag
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom tags */}
      {customTags.length > 0 && (
        <div>
          <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-700 mb-2">Custom</p>
          <div className="flex flex-wrap gap-1.5">
            {customTags.map(tag => (
              <div
                key={tag}
                className={clsx(
                  'flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono',
                  activeLabel === tag
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                )}
              >
                <button
                  onClick={() => onSelectLabel(tag)}
                  disabled={disabled}
                  className="disabled:cursor-not-allowed"
                >
                  {tag}
                </button>
                <button
                  onClick={() => handleRemoveCustom(tag)}
                  disabled={disabled}
                  className="text-zinc-700 hover:text-red-400 transition-colors disabled:opacity-30"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add custom tag */}
      <div className="flex items-center gap-2 mt-auto">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="custom_label"
          maxLength={32}
          className="flex-1 h-7 bg-zinc-900 border border-zinc-700 rounded px-2 text-[10px] font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-violet-600 transition-colors disabled:opacity-40"
        />
        <button
          onClick={handleAddCustom}
          disabled={disabled || !customInput.trim()}
          className="flex items-center gap-1 h-7 px-2.5 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-mono"
        >
          <Plus size={11} />
          Add
        </button>
      </div>
    </section>
  );
}

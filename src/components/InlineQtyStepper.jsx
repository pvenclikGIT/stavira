import { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * Compact qty stepper used inline in quote line tables.
 * - On mobile: large tap targets
 * - Debounced commit so typing 12.5 doesn't fire onChange three times
 */
export default function InlineQtyStepper({ value, unit, onChange, disabled, step = 1 }) {
  const [local, setLocal] = useState(String(value ?? 0));
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocal(String(value ?? 0));
  }, [value]);

  const commit = (raw) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const n = Number(String(raw).replace(',', '.'));
      if (Number.isFinite(n) && n >= 0) {
        onChange?.(n);
      } else {
        // revert
        setLocal(String(value ?? 0));
      }
    }, 350);
  };

  const handleStep = (delta) => {
    if (disabled) return;
    const current = Number(local) || 0;
    const next = Math.max(0, current + delta * step);
    setLocal(String(next));
    onChange?.(next);
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleStep(-1)}
        disabled={disabled}
        aria-label="Snížit"
        className="w-8 h-8 rounded-md bg-ink-50 border border-ink-200 text-ink-700 hover:bg-ink-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={local}
        disabled={disabled}
        onChange={(e) => {
          setLocal(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => {
          const n = Number(String(local).replace(',', '.'));
          if (!Number.isFinite(n) || n < 0) setLocal(String(value ?? 0));
          else if (n !== value) onChange?.(n);
        }}
        className="w-16 h-8 text-center font-mono tabular-nums text-sm font-bold rounded-md border border-ink-200 bg-white disabled:bg-ink-50 disabled:text-ink-500"
      />
      <button
        type="button"
        onClick={() => handleStep(1)}
        disabled={disabled}
        aria-label="Zvýšit"
        className="w-8 h-8 rounded-md bg-ink-50 border border-ink-200 text-ink-700 hover:bg-ink-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      {unit && <span className="text-xs text-ink-500 font-medium ml-1">{unit}</span>}
    </div>
  );
}

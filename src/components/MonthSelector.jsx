import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../utils/format';
import { czMonthLabel } from '../utils/payrollCalc';

/**
 * Month selector — shows N months centered on current.
 * Compact pill style for mobile.
 *
 * Props:
 *   value: 'YYYY-MM'
 *   onChange: (newValue) => void
 *   minMonth, maxMonth: optional bounds 'YYYY-MM'
 */
export default function MonthSelector({ value, onChange, options }) {
  // If options provided, use them. Otherwise generate ±2 months around value.
  const months = options || generateRange(value, 3);

  const idx = months.indexOf(value);
  const canPrev = idx > 0;
  const canNext = idx < months.length - 1;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => canPrev && onChange(months[idx - 1])}
        disabled={!canPrev}
        aria-label="Předchozí měsíc"
        className="w-9 h-9 rounded-lg bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1 overflow-x-auto scroll-thin px-1">
        {months.map((m) => {
          const active = m === value;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={classNames(
                'px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors',
                active
                  ? 'bg-ink-900 text-white'
                  : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
              )}
            >
              {czMonthLabel(m)}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => canNext && onChange(months[idx + 1])}
        disabled={!canNext}
        aria-label="Další měsíc"
        className="w-9 h-9 rounded-lg bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function generateRange(centerMonth, count) {
  if (!centerMonth) {
    const now = new Date();
    centerMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const [y, m] = centerMonth.split('-').map(Number);
  const result = [];
  for (let offset = -count; offset <= 0; offset++) {
    const date = new Date(y, m - 1 + offset, 1);
    result.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

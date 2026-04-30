import { classNames } from '../utils/format';

export default function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  size = 'md',
  tone = 'auto',
  className = '',
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  let toneClass = 'bg-ink-900';
  if (tone === 'accent') toneClass = 'bg-accent-400';
  else if (tone === 'success') toneClass = 'bg-emerald-500';
  else if (tone === 'danger') toneClass = 'bg-red-500';
  else if (tone === 'auto') {
    if (pct >= 100) toneClass = 'bg-emerald-500';
    else if (pct >= 70) toneClass = 'bg-ink-900';
    else if (pct >= 30) toneClass = 'bg-accent-400';
    else toneClass = 'bg-ink-400';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={classNames('w-full', className)}>
      <div className={classNames('w-full bg-ink-100 rounded-full overflow-hidden', heightClass)}>
        <div
          className={classNames(toneClass, 'h-full rounded-full transition-all duration-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs font-mono tabular-nums text-ink-600">
          {Math.round(pct)}%
        </div>
      )}
    </div>
  );
}

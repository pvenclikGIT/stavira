import { classNames } from '../utils/format';

export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={classNames('border-b border-ink-200 bg-white sticky top-14 lg:top-0 z-10', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 overflow-x-auto scroll-thin px-2 md:px-6">
          {tabs.map((tab) => {
            const active = value === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={classNames(
                  'inline-flex items-center gap-2 px-3 md:px-4 py-3 text-sm font-semibold whitespace-nowrap relative transition-colors',
                  active
                    ? 'text-ink-900'
                    : 'text-ink-500 hover:text-ink-700'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {tab.badge !== undefined && tab.badge !== null && tab.badge > 0 && (
                  <span className={classNames(
                    'tabular-nums px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold',
                    active ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-600'
                  )}>
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

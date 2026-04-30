import { classNames } from '../utils/format';

export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center text-center py-12 md:py-20 px-6',
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-ink-100 text-ink-500 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-ink-600 max-w-sm text-balance">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

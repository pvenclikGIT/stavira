export default function PageHeader({ title, subtitle, actions, breadcrumbs }) {
  return (
    <header className="px-4 md:px-8 pt-6 md:pt-8 pb-5 border-b border-ink-200 bg-white">
      <div className="max-w-7xl mx-auto">
        {breadcrumbs && (
          <div className="mb-3 text-sm text-ink-500 flex items-center gap-1.5 flex-wrap">
            {breadcrumbs}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 tracking-tight text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm md:text-base text-ink-600 max-w-2xl">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">{actions}</div>
          )}
        </div>
      </div>
    </header>
  );
}

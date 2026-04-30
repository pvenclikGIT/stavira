import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Slide-in panel from the right.
 * On mobile: full width, on desktop: 480px (or wider via size prop).
 * Backdrop click closes. Escape closes.
 */
export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md', // sm | md | lg
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-xl',
    lg: 'sm:max-w-2xl',
  }[size] || 'sm:max-w-xl';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Zavřít"
        className="flex-1 bg-ink-950/40 backdrop-blur-[2px] cursor-default"
      />
      {/* Panel */}
      <aside
        className={`relative w-full ${widthClass} bg-white shadow-pop flex flex-col h-full slide-in-right`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <header className="flex items-start gap-3 p-4 md:p-5 border-b border-ink-100 sticky top-0 bg-white z-10">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-ink-900 leading-tight">{title}</h2>
            {description && (
              <p className="text-sm text-ink-600 mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="p-2 -m-1 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="border-t border-ink-100 p-4 md:p-5 bg-ink-50/40 flex items-center justify-end gap-2 flex-wrap sticky bottom-0">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}

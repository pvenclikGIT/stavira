import { useEffect } from 'react';
import { X } from 'lucide-react';
import { classNames } from '../utils/format';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }[size] || 'max-w-xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-ink-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={classNames(
          'w-full bg-white rounded-t-2xl md:rounded-2xl shadow-pop overflow-hidden flex flex-col',
          'max-h-[92vh] md:max-h-[85vh]',
          sizeClasses
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <header className="flex items-start justify-between gap-4 px-5 md:px-6 pt-5 pb-4 border-b border-ink-100">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="font-display text-xl font-bold text-ink-900 truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-ink-600">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Zavřít"
                className="-mr-2 -mt-1 p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5 scroll-thin">
          {children}
        </div>
        {footer && (
          <footer className="px-5 md:px-6 py-4 border-t border-ink-100 bg-ink-50/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 safe-bottom">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

import { classNames } from '../utils/format';

const COLORS = {
  amber:   'bg-amber-100 text-amber-800',
  blue:    'bg-blue-100 text-blue-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  orange:  'bg-orange-100 text-orange-800',
  purple:  'bg-purple-100 text-purple-800',
  cyan:    'bg-cyan-100 text-cyan-800',
  pink:    'bg-pink-100 text-pink-800',
  slate:   'bg-ink-100 text-ink-800',
  yellow:  'bg-yellow-100 text-yellow-800',
};

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({ employee, size = 'md', className = '' }) {
  const initials = employee?.avatar
    || (employee?.name || '??').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  const color = employee?.color || 'slate';
  return (
    <div className={classNames(
      'rounded-full font-display font-bold flex items-center justify-center flex-shrink-0',
      COLORS[color] || COLORS.slate,
      SIZES[size] || SIZES.md,
      className
    )}>
      {initials}
    </div>
  );
}

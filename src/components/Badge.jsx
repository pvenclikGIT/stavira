import { classNames } from '../utils/format';

const COLOR_CLASSES = {
  slate:   'bg-ink-100 text-ink-700 border-ink-200',
  amber:   'bg-accent-50 text-accent-700 border-accent-200',
  blue:    'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red:     'bg-red-50 text-red-700 border-red-200',
  purple:  'bg-purple-50 text-purple-700 border-purple-200',
  orange:  'bg-orange-50 text-orange-700 border-orange-200',
  cyan:    'bg-cyan-50 text-cyan-700 border-cyan-200',
  yellow:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  pink:    'bg-pink-50 text-pink-700 border-pink-200',
};

const SOLID_COLOR_CLASSES = {
  slate:   'bg-ink-900 text-white',
  amber:   'bg-accent-400 text-ink-900',
  blue:    'bg-blue-600 text-white',
  emerald: 'bg-emerald-600 text-white',
  red:     'bg-red-600 text-white',
  purple:  'bg-purple-600 text-white',
  orange:  'bg-orange-600 text-white',
  cyan:    'bg-cyan-600 text-white',
  yellow:  'bg-yellow-500 text-ink-900',
  indigo:  'bg-indigo-600 text-white',
  pink:    'bg-pink-600 text-white',
};

export default function Badge({ color = 'slate', solid = false, children, className = '', icon: Icon }) {
  const colorClass = solid ? SOLID_COLOR_CLASSES[color] : COLOR_CLASSES[color];
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap',
        !solid && 'border',
        colorClass,
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

// Czech locale formatting utilities

export const formatCZK = (amount, options = {}) => {
  const { decimals = 0, compact = false } = options;
  const value = Number(amount) || 0;

  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 1,
      notation: 'compact',
    }).format(value);
  }

  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatNumber = (value, decimals = 0) =>
  new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value) || 0);

export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  const { long = false } = options;
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: long ? 'long' : 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
  }).format(date);
};

export const daysBetween = (from, to) => {
  if (!from || !to) return 0;
  const a = new Date(from);
  const b = new Date(to);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

export const daysFromNow = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
};

export const formatDeadline = (dateStr) => {
  const days = daysFromNow(dateStr);
  if (days === null) return '—';
  if (days < 0) return `Po termínu (${Math.abs(days)} dní)`;
  if (days === 0) return 'Dnes';
  if (days === 1) return 'Zítra';
  if (days <= 30) return `Za ${days} dní`;
  return formatDate(dateStr);
};

export const generateId = (prefix = '') => {
  const random = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}${prefix ? '_' : ''}${time}${random}`;
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const classNames = (...args) => args.filter(Boolean).join(' ');

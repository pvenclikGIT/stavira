// Payroll domain constants — Czech construction industry context.

export const SHIFT_TYPES = {
  regular:  { label: 'Běžná směna',     multiplier: 1.0,  color: 'slate',   short: 'Běžná' },
  overtime: { label: 'Přesčas',         multiplier: 1.25, color: 'amber',   short: 'Přesčas' },
  weekend:  { label: 'Sobota / Neděle', multiplier: 1.25, color: 'orange',  short: 'Víkend' },
  holiday:  { label: 'Svátek',          multiplier: 2.0,  color: 'red',     short: 'Svátek' },
  night:    { label: 'Noční práce',     multiplier: 1.10, color: 'indigo',  short: 'Noční' },
  difficult:{ label: 'Ztížené prostředí', multiplier: 1.10, color: 'purple', short: 'Ztížené' },
};

// Roles in the construction crew — different from app user roles
export const EMPLOYEE_ROLES = {
  master:    { label: 'Mistr / vedoucí čety', color: 'amber' },
  bricklayer:{ label: 'Zedník',                color: 'blue' },
  carpenter: { label: 'Tesař',                 color: 'orange' },
  electrician:{ label: 'Elektrikář',            color: 'yellow' },
  plumber:   { label: 'Instalatér',            color: 'cyan' },
  helper:    { label: 'Pomocný dělník',        color: 'slate' },
  apprentice:{ label: 'Učeň',                  color: 'emerald' },
};

// Employment contract types — affects taxation in CZ
export const CONTRACT_TYPES = {
  hpp:  { label: 'Hlavní pracovní poměr (HPP)', short: 'HPP' },
  dpc:  { label: 'Dohoda o pracovní činnosti (DPČ)', short: 'DPČ' },
  dpp:  { label: 'Dohoda o provedení práce (DPP)', short: 'DPP' },
  ico:  { label: 'OSVČ na IČO', short: 'OSVČ' },
};

// Deduction (srážka) types
export const DEDUCTION_TYPES = {
  advance:  { label: 'Záloha',          color: 'amber' },
  loan:     { label: 'Půjčka od firmy', color: 'orange' },
  damage:   { label: 'Náhrada škody',   color: 'red' },
  other:    { label: 'Ostatní srážka',  color: 'slate' },
};

// Bonus types
export const BONUS_TYPES = {
  stage_complete: { label: 'Bonus za etapu',     color: 'emerald' },
  performance:    { label: 'Výkonnostní bonus',  color: 'blue' },
  quality:        { label: 'Bonus za kvalitu',   color: 'purple' },
  loyalty:        { label: 'Věrnostní bonus',    color: 'pink' },
  other:          { label: 'Jiný bonus',         color: 'slate' },
};

// Payroll status
export const PAYROLL_STATUS = {
  draft:     { label: 'Rozpracováno', color: 'slate' },
  approved:  { label: 'Schváleno',    color: 'amber' },
  paid:      { label: 'Vyplaceno',    color: 'emerald' },
};

// Czech 2026 tax & insurance rates — simplified but realistic
// Source: ZP 4.5%, SP 7.1%, daň 15% slevy 30 840 ročně (2 570 měsíčně)
export const CZ_PAYROLL_RATES = {
  socialEmployee:   0.071,  // 7.1% sociální
  healthEmployee:   0.045,  // 4.5% zdravotní
  socialEmployer:   0.248,  // 24.8% sociální (zaměstnavatel)
  healthEmployer:   0.090,  // 9% zdravotní (zaměstnavatel)
  incomeTaxRate:    0.15,   // 15% daň z příjmu
  taxCreditMonthly: 2570,   // měsíční sleva na poplatníka 2026
  // Daily food allowance (diety) — flat rate per work day
  dailyMealAllowance: 140,  // Kč / den (typical 2026)
};

// Helper: minutes/hours from a "HH:MM" string
export const parseHours = (str) => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const [h, m] = String(str).split(':').map(Number);
  return (Number(h) || 0) + (Number(m) || 0) / 60;
};

export const formatHours = (h) => {
  if (h == null) return '0 h';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  if (mm === 0) return `${hh} h`;
  return `${hh}:${String(mm).padStart(2, '0')} h`;
};

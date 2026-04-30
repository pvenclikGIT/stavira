// Payroll calculations — Czech tax rules (simplified but realistic for 2026).
// Single source of truth for all gross / net / employer-cost computations.

import { SHIFT_TYPES, CZ_PAYROLL_RATES, formatHours as _formatHours, parseHours as _parseHours } from '../data/payroll';

// Re-export utilities so consumers only need one import.
export const formatHours = _formatHours;
export const parseHours = _parseHours;

const num = (v) => Number(v) || 0;

/**
 * Compute the wage value of a single time entry.
 * Returns: { hours, multiplier, hourlyRate, gross }
 */
export function calcTimeEntry(entry, employee) {
  const hours = num(entry.hours);
  const shift = SHIFT_TYPES[entry.shiftType] || SHIFT_TYPES.regular;
  const multiplier = shift.multiplier;
  const hourlyRate = num(entry.hourlyRateOverride ?? employee?.hourlyRate);
  const gross = hours * hourlyRate * multiplier;
  return { hours, multiplier, hourlyRate, gross };
}

/**
 * Aggregate time entries for one employee in a given period.
 * Returns totals split by shift type plus grand totals.
 */
export function aggregateTimeEntries(entries, employee) {
  const byShift = {};
  let totalHours = 0;
  let totalGross = 0;
  let workDays = new Set();

  entries.forEach((e) => {
    const { hours, gross } = calcTimeEntry(e, employee);
    if (!byShift[e.shiftType]) byShift[e.shiftType] = { hours: 0, gross: 0, count: 0 };
    byShift[e.shiftType].hours += hours;
    byShift[e.shiftType].gross += gross;
    byShift[e.shiftType].count += 1;
    totalHours += hours;
    totalGross += gross;
    if (e.date) workDays.add(e.date);
  });

  return {
    byShift,
    totalHours,
    totalGross,
    workDayCount: workDays.size,
  };
}

/**
 * Group time entries by project (for "kolik mě která stavba stála na práci").
 * Returns array of { projectId, hours, gross, entries[] }
 */
export function aggregateByProject(entries, employee) {
  const map = new Map();
  entries.forEach((e) => {
    const projectId = e.projectId || '__unassigned__';
    if (!map.has(projectId)) {
      map.set(projectId, { projectId, hours: 0, gross: 0, entries: [] });
    }
    const calc = calcTimeEntry(e, employee);
    const slot = map.get(projectId);
    slot.hours += calc.hours;
    slot.gross += calc.gross;
    slot.entries.push(e);
  });
  return Array.from(map.values()).sort((a, b) => b.gross - a.gross);
}

/**
 * Full payroll calculation for one month for one employee.
 * Combines wage from time entries + bonuses + meal allowance - deductions
 * and computes net salary using simplified Czech rules.
 *
 * Inputs:
 *   - employee: { hourlyRate, contractType, hasTaxCredit }
 *   - entries: time entries already filtered to the month
 *   - bonuses: [{ amount, type, note }]
 *   - deductions: [{ amount, type, note }]
 *
 * Returns full breakdown.
 */
export function calcPayroll({ employee, entries = [], bonuses = [], deductions = [] }) {
  const wage = aggregateTimeEntries(entries, employee);

  const bonusTotal = bonuses.reduce((s, b) => s + num(b.amount), 0);
  const deductionTotal = deductions.reduce((s, d) => s + num(d.amount), 0);
  const mealAllowance = wage.workDayCount * CZ_PAYROLL_RATES.dailyMealAllowance;

  // GROSS SALARY = wage from hours + bonuses (meal allowance is a tax-free perk, not part of gross)
  const grossSalary = Math.round(wage.totalGross + bonusTotal);

  // For DPP under 10 000 Kč there's no insurance — but for HPP we apply standard
  const isHPP = (employee?.contractType || 'hpp') === 'hpp';
  const isDPP = employee?.contractType === 'dpp';

  let socialEmp = 0, healthEmp = 0, socialEr = 0, healthEr = 0;
  if (isHPP) {
    socialEmp = grossSalary * CZ_PAYROLL_RATES.socialEmployee;
    healthEmp = grossSalary * CZ_PAYROLL_RATES.healthEmployee;
    socialEr  = grossSalary * CZ_PAYROLL_RATES.socialEmployer;
    healthEr  = grossSalary * CZ_PAYROLL_RATES.healthEmployer;
  } else if (employee?.contractType === 'dpc' || (isDPP && grossSalary > 10000)) {
    socialEmp = grossSalary * CZ_PAYROLL_RATES.socialEmployee;
    healthEmp = grossSalary * CZ_PAYROLL_RATES.healthEmployee;
    socialEr  = grossSalary * CZ_PAYROLL_RATES.socialEmployer;
    healthEr  = grossSalary * CZ_PAYROLL_RATES.healthEmployer;
  }
  // OSVČ — pays own taxes, we don't compute here
  const isOsvc = employee?.contractType === 'ico';
  if (isOsvc) {
    // For OSVČ we just pay the gross — they handle taxes themselves
    return {
      wage,
      bonusTotal,
      deductionTotal,
      mealAllowance,
      grossSalary,
      socialEmp: 0, healthEmp: 0, socialEr: 0, healthEr: 0,
      taxBase: 0, incomeTax: 0, taxCredit: 0, finalTax: 0,
      netSalary: Math.round(grossSalary + mealAllowance - deductionTotal),
      employerCost: Math.round(grossSalary + mealAllowance),
      isOsvc: true,
    };
  }

  // Income tax (super-hrubá zrušena 2021, super-hrubá = hrubá)
  const taxBase = Math.ceil(grossSalary / 100) * 100;
  const incomeTaxRaw = taxBase * CZ_PAYROLL_RATES.incomeTaxRate;
  const taxCredit = employee?.hasTaxCredit !== false ? CZ_PAYROLL_RATES.taxCreditMonthly : 0;
  const finalTax = Math.max(0, incomeTaxRaw - taxCredit);

  const netSalary = Math.round(
    grossSalary
    - socialEmp - healthEmp
    - finalTax
    + mealAllowance
    - deductionTotal
  );

  const employerCost = Math.round(grossSalary + socialEr + healthEr + mealAllowance);

  return {
    wage,
    bonusTotal,
    deductionTotal,
    mealAllowance,
    grossSalary,
    socialEmp: Math.round(socialEmp),
    healthEmp: Math.round(healthEmp),
    socialEr:  Math.round(socialEr),
    healthEr:  Math.round(healthEr),
    taxBase,
    incomeTax: Math.round(incomeTaxRaw),
    taxCredit,
    finalTax: Math.round(finalTax),
    netSalary,
    employerCost,
    isOsvc: false,
  };
}

/**
 * Filter time entries by year-month string "YYYY-MM"
 */
export function filterEntriesByMonth(entries, yearMonth) {
  return entries.filter((e) => (e.date || '').startsWith(yearMonth));
}

/**
 * Czech month name
 */
export function czMonthLabel(yearMonth) {
  const months = ['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec'];
  const [y, m] = yearMonth.split('-').map(Number);
  return `${months[m - 1]} ${y}`;
}

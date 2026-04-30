import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Wallet, Clock, TrendingUp, Plus, ChevronRight,
  CheckCircle2, AlertCircle, Hourglass,
  Banknote, Building2, Receipt, Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCZK, formatDate, classNames } from '../utils/format';
import {
  calcPayroll, filterEntriesByMonth, aggregateByProject, czMonthLabel, formatHours,
} from '../utils/payrollCalc';
import { EMPLOYEE_ROLES, PAYROLL_STATUS } from '../data/payroll';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import MonthSelector from '../components/MonthSelector';
import EmptyState from '../components/EmptyState';

function getDefaultMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function PayrollPage() {
  const {
    employees, timeEntries, bonuses, deductions, payrolls, projects,
    upsertPayroll,
  } = useApp();

  // Available months from data (Feb-Apr 2026 + current)
  const availableMonths = useMemo(() => {
    const set = new Set();
    timeEntries.forEach((te) => {
      if (te.date) set.add(te.date.slice(0, 7));
    });
    payrolls.forEach((p) => set.add(p.month));
    set.add(getDefaultMonth());
    return Array.from(set).sort();
  }, [timeEntries, payrolls]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to most recent month with data
    const set = new Set();
    timeEntries.forEach((te) => te.date && set.add(te.date.slice(0, 7)));
    const sorted = Array.from(set).sort();
    return sorted[sorted.length - 1] || getDefaultMonth();
  });

  // Compute payroll for every employee for the selected month
  const monthlyData = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.active !== false);
    return activeEmployees.map((emp) => {
      const entries = filterEntriesByMonth(
        timeEntries.filter((te) => te.employeeId === emp.id),
        selectedMonth
      );
      const empBonuses = bonuses.filter((b) => b.employeeId === emp.id && b.month === selectedMonth);
      const empDeductions = deductions.filter((d) => d.employeeId === emp.id && d.month === selectedMonth);
      const calc = calcPayroll({ employee: emp, entries, bonuses: empBonuses, deductions: empDeductions });
      const payroll = payrolls.find((p) => p.employeeId === emp.id && p.month === selectedMonth) || null;
      return {
        employee: emp,
        entries,
        bonuses: empBonuses,
        deductions: empDeductions,
        calc,
        payroll,
        status: payroll?.status || 'draft',
      };
    });
  }, [employees, timeEntries, bonuses, deductions, payrolls, selectedMonth]);

  // Hero metrics — totals across all employees
  const totals = useMemo(() => {
    return monthlyData.reduce((acc, row) => {
      acc.gross += row.calc.grossSalary;
      acc.net += row.calc.netSalary;
      acc.employerCost += row.calc.employerCost;
      acc.hours += row.calc.wage.totalHours;
      acc.bonuses += row.calc.bonusTotal;
      acc.deductions += row.calc.deductionTotal;
      if (row.status === 'paid') acc.paidCount += 1;
      else if (row.status === 'approved') acc.approvedCount += 1;
      else acc.draftCount += 1;
      return acc;
    }, { gross: 0, net: 0, employerCost: 0, hours: 0, bonuses: 0, deductions: 0, paidCount: 0, approvedCount: 0, draftCount: 0 });
  }, [monthlyData]);

  // Per-project labour cost
  const projectCosts = useMemo(() => {
    const map = new Map();
    monthlyData.forEach((row) => {
      const byProj = aggregateByProject(row.entries, row.employee);
      byProj.forEach((p) => {
        if (!map.has(p.projectId)) map.set(p.projectId, { projectId: p.projectId, hours: 0, gross: 0 });
        const slot = map.get(p.projectId);
        slot.hours += p.hours;
        slot.gross += p.gross;
      });
    });
    return Array.from(map.values())
      .filter((p) => p.projectId !== '__unassigned__')
      .sort((a, b) => b.gross - a.gross);
  }, [monthlyData]);

  return (
    <>
      <PageHeader
        title="Mzdy"
        subtitle="Přehled hodin, výplat a nákladů na zaměstnance."
        actions={
          <Link to="/mzdy/zamestnanci" className="btn btn-outline">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Zaměstnanci</span>
          </Link>
        }
      />

      <div className="px-4 md:px-8 py-5 md:py-6 max-w-7xl mx-auto space-y-5">

        {/* Month selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={availableMonths}
          />
          <div className="text-xs text-ink-500">
            {monthlyData.length} {monthlyData.length === 1 ? 'zaměstnanec' : monthlyData.length <= 4 ? 'zaměstnanci' : 'zaměstnanců'}
          </div>
        </div>

        {/* === HERO METRICS === */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <HeroMetric
            icon={Wallet}
            label="Náklad firmy"
            value={formatCZK(totals.employerCost, { compact: true })}
            sublabel={`Hrubé mzdy ${formatCZK(totals.gross, { compact: true })}`}
            tone="primary"
          />
          <HeroMetric
            icon={Banknote}
            label="K výplatě"
            value={formatCZK(totals.net, { compact: true })}
            sublabel={`${czMonthLabel(selectedMonth)}`}
            tone="emerald"
          />
          <HeroMetric
            icon={Clock}
            label="Odpracováno"
            value={formatHours(totals.hours)}
            sublabel={`Bonusy ${formatCZK(totals.bonuses, { compact: true })}`}
            tone="amber"
          />
          <HeroMetric
            icon={CheckCircle2}
            label="Stav výplat"
            value={`${totals.paidCount}/${monthlyData.length}`}
            sublabel={
              totals.draftCount > 0
                ? `${totals.draftCount} ${totals.draftCount === 1 ? 'rozpracovaná' : 'rozpracované'}`
                : totals.approvedCount > 0
                  ? `${totals.approvedCount} ${totals.approvedCount === 1 ? 'schválená' : 'schválené'} k výplatě`
                  : 'Vše vyplaceno'
            }
            tone={totals.draftCount > 0 ? 'amber' : totals.approvedCount > 0 ? 'blue' : 'emerald'}
          />
        </section>

        {/* === EMPLOYEES TABLE === */}
        <section>
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Výplaty — {czMonthLabel(selectedMonth)}
            </h2>
          </div>

          {monthlyData.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Users}
                title="Žádní zaměstnanci"
                description="Začněte přidáním zaměstnance."
                action={
                  <Link to="/mzdy/zamestnanci" className="btn btn-primary">
                    <Plus className="w-4 h-4" /> Přidat zaměstnance
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="space-y-2">
              {monthlyData.map((row) => (
                <EmployeePayrollRow
                  key={row.employee.id}
                  row={row}
                  month={selectedMonth}
                  onApprove={() => upsertPayroll(row.employee.id, selectedMonth, { status: 'approved', approvedDate: new Date().toISOString().slice(0,10) })}
                  onMarkPaid={() => upsertPayroll(row.employee.id, selectedMonth, { status: 'paid', paidDate: new Date().toISOString().slice(0,10) })}
                />
              ))}
            </div>
          )}
        </section>

        {/* === PROJECT LABOUR COSTS === */}
        {projectCosts.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Mzdové náklady na stavbách
                </h2>
                <p className="text-sm text-ink-500 mt-0.5">
                  Kolik mě která stavba stála na práci v {czMonthLabel(selectedMonth)}.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {projectCosts.map((pc) => {
                const project = projects.find((p) => p.id === pc.projectId);
                const totalLabour = projectCosts.reduce((s, p) => s + p.gross, 0) || 1;
                const pct = (pc.gross / totalLabour) * 100;
                return (
                  <ProjectCostRow
                    key={pc.projectId}
                    project={project}
                    hours={pc.hours}
                    gross={pc.gross}
                    pct={pct}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// ============================================================
// HERO METRIC CARD
// ============================================================
function HeroMetric({ icon: Icon, label, value, sublabel, tone = 'slate' }) {
  const TONES = {
    primary:  { bg: 'bg-ink-900 text-white border-ink-900', icon: 'bg-accent-400 text-ink-900', sub: 'text-ink-300' },
    emerald:  { bg: 'bg-white border-ink-200',              icon: 'bg-emerald-100 text-emerald-700', sub: 'text-ink-500' },
    amber:    { bg: 'bg-white border-ink-200',              icon: 'bg-amber-100 text-amber-700',     sub: 'text-ink-500' },
    blue:     { bg: 'bg-white border-ink-200',              icon: 'bg-blue-100 text-blue-700',       sub: 'text-ink-500' },
    slate:    { bg: 'bg-white border-ink-200',              icon: 'bg-ink-100 text-ink-700',          sub: 'text-ink-500' },
  };
  const t = TONES[tone] || TONES.slate;
  return (
    <div className={classNames('card p-4 flex items-start gap-3', t.bg)}>
      <div className={classNames('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', t.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={classNames('text-[10px] uppercase tracking-wider font-bold', tone === 'primary' ? 'text-accent-400' : 'text-ink-500')}>
          {label}
        </p>
        <p className="font-display text-xl font-extrabold tabular-nums leading-tight mt-0.5 truncate">
          {value}
        </p>
        {sublabel && (
          <p className={classNames('text-xs mt-1 truncate', t.sub)}>{sublabel}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EMPLOYEE PAYROLL ROW
// ============================================================
function EmployeePayrollRow({ row, month, onApprove, onMarkPaid }) {
  const { employee, calc, status } = row;
  const role = EMPLOYEE_ROLES[employee.role] || EMPLOYEE_ROLES.helper;
  const statusInfo = PAYROLL_STATUS[status];

  const StatusIcon = status === 'paid' ? CheckCircle2 : status === 'approved' ? Hourglass : AlertCircle;

  return (
    <div className="card overflow-hidden">
      <Link
        to={`/mzdy/zamestnanci/${employee.id}?mesic=${month}`}
        className="block p-4 hover:bg-ink-50/40 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <Avatar employee={employee} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display font-bold text-ink-900 leading-tight">{employee.name}</p>
              <Badge color={role.color}>{role.label}</Badge>
            </div>
            <div className="mt-1 text-xs text-ink-500 flex items-center gap-3 flex-wrap">
              <span className="font-mono tabular-nums">{employee.hourlyRate} Kč/h</span>
              <span>·</span>
              <span>{formatHours(calc.wage.totalHours)} ({calc.wage.workDayCount} dní)</span>
              {calc.bonusTotal > 0 && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold">+ {formatCZK(calc.bonusTotal, { compact: true })} bonus</span>
                </>
              )}
              {calc.deductionTotal > 0 && (
                <>
                  <span>·</span>
                  <span className="text-red-700 font-semibold">− {formatCZK(calc.deductionTotal, { compact: true })}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500">Čistá mzda</p>
            <p className="font-display text-lg font-extrabold tabular-nums text-ink-900 leading-tight">
              {formatCZK(calc.netSalary, { compact: true })}
            </p>
            <p className="text-[10px] text-ink-500 tabular-nums">
              hrubá {formatCZK(calc.grossSalary, { compact: true })}
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-ink-400 group-hover:text-ink-900 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1.5 hidden sm:block" />
        </div>
      </Link>

      {/* Status / actions footer */}
      <div className={classNames(
        'px-4 py-2.5 flex items-center justify-between gap-2 border-t border-ink-100 text-xs',
        status === 'paid' ? 'bg-emerald-50' :
        status === 'approved' ? 'bg-amber-50' : 'bg-ink-50/40'
      )}>
        <div className={classNames(
          'inline-flex items-center gap-1.5 font-semibold',
          status === 'paid' ? 'text-emerald-700' :
          status === 'approved' ? 'text-amber-700' : 'text-ink-700'
        )}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusInfo?.label}
          {row.payroll?.paidDate && status === 'paid' && (
            <span className="text-ink-500 font-normal ml-1">· {formatDate(row.payroll.paidDate)}</span>
          )}
          {row.payroll?.approvedDate && status === 'approved' && (
            <span className="text-ink-500 font-normal ml-1">· {formatDate(row.payroll.approvedDate)}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {status === 'draft' && (
            <button
              type="button"
              onClick={onApprove}
              className="text-xs font-semibold text-ink-700 hover:text-ink-900 px-2 py-1 rounded hover:bg-white"
            >
              Schválit
            </button>
          )}
          {status === 'approved' && (
            <button
              type="button"
              onClick={onMarkPaid}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded hover:bg-white inline-flex items-center gap-1"
            >
              <Banknote className="w-3 h-3" />
              Označit jako vyplaceno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROJECT COST ROW
// ============================================================
function ProjectCostRow({ project, hours, gross, pct }) {
  if (!project) return null;
  return (
    <Link
      to={`/projekty/${project.id}`}
      className="card card-hover p-3 md:p-4 flex items-center gap-3 group"
    >
      <div className="w-10 h-10 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center flex-shrink-0">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-900 leading-tight truncate">{project.name}</p>
        <p className="text-xs text-ink-500 mt-0.5 font-mono tabular-nums">
          {project.code} · {formatHours(hours)}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full bg-accent-400 rounded-full"
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display text-base font-extrabold tabular-nums text-ink-900">
          {formatCZK(gross, { compact: true })}
        </p>
        <p className="text-[10px] text-ink-500 tabular-nums">{Math.round(pct)} % nákladů</p>
      </div>
      <ChevronRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 flex-shrink-0 hidden sm:block" />
    </Link>
  );
}

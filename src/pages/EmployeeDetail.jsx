import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Edit3, Trash2, Phone, Mail, Calendar,
  Clock, Building2, Plus, Banknote, Receipt, MoreHorizontal,
  TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Hourglass,
  User, Briefcase, MapPin, FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCZK, formatDate, classNames } from '../utils/format';
import {
  EMPLOYEE_ROLES, CONTRACT_TYPES, SHIFT_TYPES,
  PAYROLL_STATUS, BONUS_TYPES, DEDUCTION_TYPES,
} from '../data/payroll';
import {
  calcPayroll, filterEntriesByMonth, aggregateByProject,
  czMonthLabel, formatHours,
} from '../utils/payrollCalc';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import EmployeeFormModal from '../components/EmployeeFormModal';
import TimeEntryFormModal from '../components/TimeEntryFormModal';
import BonusFormModal from '../components/BonusFormModal';
import DeductionFormModal from '../components/DeductionFormModal';
import MonthSelector from '../components/MonthSelector';

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    getEmployee, deleteEmployee,
    timeEntries, bonuses, deductions, payrolls, projects,
    deleteTimeEntry, deleteBonus, deleteDeduction,
    upsertPayroll,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [creatingEntry, setCreatingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [creatingBonus, setCreatingBonus] = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [creatingDeduction, setCreatingDeduction] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState(null);

  const employee = getEmployee(id);

  // Selected month (from URL ?mesic= or default to current)
  const selectedMonth = searchParams.get('mesic') || thisMonth();
  const setSelectedMonth = (m) => {
    setSearchParams({ mesic: m });
  };

  // Available months
  const availableMonths = useMemo(() => {
    const set = new Set();
    timeEntries.forEach((te) => {
      if (te.employeeId === id && te.date) set.add(te.date.slice(0, 7));
    });
    payrolls.forEach((p) => {
      if (p.employeeId === id) set.add(p.month);
    });
    set.add(thisMonth());
    return Array.from(set).sort();
  }, [timeEntries, payrolls, id]);

  if (!employee) {
    return (
      <div className="px-4 md:px-8 py-12 max-w-3xl mx-auto">
        <EmptyState
          icon={User}
          title="Zaměstnanec nenalezen"
          description="Tento zaměstnanec neexistuje nebo byl odstraněn."
          action={
            <Link to="/mzdy/zamestnanci" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" /> Zpět na seznam
            </Link>
          }
        />
      </div>
    );
  }

  const role = EMPLOYEE_ROLES[employee.role] || EMPLOYEE_ROLES.helper;
  const contract = CONTRACT_TYPES[employee.contractType] || CONTRACT_TYPES.hpp;

  const monthEntries = filterEntriesByMonth(
    timeEntries.filter((te) => te.employeeId === employee.id),
    selectedMonth
  );
  const monthBonuses = bonuses.filter((b) => b.employeeId === employee.id && b.month === selectedMonth);
  const monthDeductions = deductions.filter((d) => d.employeeId === employee.id && d.month === selectedMonth);
  const calc = calcPayroll({ employee, entries: monthEntries, bonuses: monthBonuses, deductions: monthDeductions });
  const payroll = payrolls.find((p) => p.employeeId === employee.id && p.month === selectedMonth) || null;
  const status = payroll?.status || 'draft';
  const statusInfo = PAYROLL_STATUS[status];

  // Project breakdown
  const projectAgg = aggregateByProject(monthEntries, employee);

  // Year-to-date totals
  const ytd = useMemo(() => {
    const year = selectedMonth.slice(0, 4);
    let totalGross = 0, totalNet = 0, totalHours = 0, totalCost = 0;
    availableMonths.forEach((m) => {
      if (!m.startsWith(year) || m > selectedMonth) return;
      const ents = filterEntriesByMonth(timeEntries.filter((te) => te.employeeId === employee.id), m);
      const bns = bonuses.filter((b) => b.employeeId === employee.id && b.month === m);
      const dds = deductions.filter((d) => d.employeeId === employee.id && d.month === m);
      const c = calcPayroll({ employee, entries: ents, bonuses: bns, deductions: dds });
      totalGross += c.grossSalary;
      totalNet += c.netSalary;
      totalHours += c.wage.totalHours;
      totalCost += c.employerCost;
    });
    return { totalGross, totalNet, totalHours, totalCost };
  }, [employee, timeEntries, bonuses, deductions, availableMonths, selectedMonth]);

  // History list (last 6 months)
  const history = useMemo(() => {
    return [...availableMonths].reverse().slice(0, 6).map((m) => {
      const ents = filterEntriesByMonth(timeEntries.filter((te) => te.employeeId === employee.id), m);
      const bns = bonuses.filter((b) => b.employeeId === employee.id && b.month === m);
      const dds = deductions.filter((d) => d.employeeId === employee.id && d.month === m);
      const c = calcPayroll({ employee, entries: ents, bonuses: bns, deductions: dds });
      const pr = payrolls.find((p) => p.employeeId === employee.id && p.month === m) || null;
      return { month: m, calc: c, status: pr?.status || 'draft', paidDate: pr?.paidDate };
    });
  }, [employee, timeEntries, bonuses, deductions, payrolls, availableMonths]);

  const handleDelete = () => {
    deleteEmployee(employee.id);
    navigate('/mzdy/zamestnanci');
  };

  return (
    <>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/mzdy" className="hover:text-ink-900">Mzdy</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/mzdy/zamestnanci" className="hover:text-ink-900">Zaměstnanci</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink-700">{employee.nickname || employee.name}</span>
          </>
        }
        title={
          <span className="flex items-center gap-3">
            <Avatar employee={employee} size="lg" />
            <span>{employee.name}</span>
          </span>
        }
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <Badge color={role.color}>{role.label}</Badge>
            <Badge color="slate">{contract.short}</Badge>
            <span className="text-ink-600 font-mono tabular-nums text-xs">
              {employee.hourlyRate} Kč/h
            </span>
          </span>
        }
        actions={
          <>
            <button type="button" onClick={() => setEditing(true)} className="btn btn-outline">
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Upravit</span>
            </button>
            <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-danger">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Smazat</span>
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-5 md:py-6 max-w-7xl mx-auto space-y-5">

        {/* Month selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} options={availableMonths} />
          <span className={classNames(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
            status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
            status === 'approved' ? 'bg-amber-100 text-amber-800' : 'bg-ink-100 text-ink-700'
          )}>
            {status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
            {status === 'approved' && <Hourglass className="w-3 h-3" />}
            {status === 'draft' && <AlertCircle className="w-3 h-3" />}
            {statusInfo?.label}
            {payroll?.paidDate && <span className="opacity-70">· {formatDate(payroll.paidDate)}</span>}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-5">

          {/* === Main column === */}
          <div className="space-y-5 min-w-0">

            {/* === Pay slip === */}
            <PayslipCard
              employee={employee}
              calc={calc}
              month={selectedMonth}
              status={status}
              onApprove={() => upsertPayroll(employee.id, selectedMonth, { status: 'approved', approvedDate: new Date().toISOString().slice(0,10) })}
              onMarkPaid={() => upsertPayroll(employee.id, selectedMonth, { status: 'paid', paidDate: new Date().toISOString().slice(0,10) })}
            />

            {/* === Bonuses & Deductions === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BonusesPanel
                bonuses={monthBonuses}
                projects={projects}
                onAdd={() => setCreatingBonus(true)}
                onEdit={(b) => setEditingBonus(b)}
                onDelete={(b) => deleteBonus(b.id)}
              />
              <DeductionsPanel
                deductions={monthDeductions}
                onAdd={() => setCreatingDeduction(true)}
                onEdit={(d) => setEditingDeduction(d)}
                onDelete={(d) => deleteDeduction(d.id)}
              />
            </div>

            {/* === Hours by project === */}
            {projectAgg.length > 0 && (
              <section>
                <h3 className="font-display text-base font-bold text-ink-900 mb-2">
                  Práce na stavbách v tomto měsíci
                </h3>
                <div className="space-y-2">
                  {projectAgg.map((p) => {
                    const project = projects.find((pr) => pr.id === p.projectId);
                    if (!project) return null;
                    const totalHrs = projectAgg.reduce((s, x) => s + x.hours, 0) || 1;
                    const pct = (p.hours / totalHrs) * 100;
                    return (
                      <Link
                        key={p.projectId}
                        to={`/projekty/${p.projectId}`}
                        className="card card-hover p-3 flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-ink-900 truncate">{project.name}</p>
                          <div className="mt-1.5 h-1 rounded-full bg-ink-100 overflow-hidden">
                            <div className="h-full bg-accent-400" style={{ width: `${Math.max(2, pct)}%` }} />
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono tabular-nums font-bold text-sm">{formatHours(p.hours)}</p>
                          <p className="text-[10px] text-ink-500 tabular-nums">{formatCZK(p.gross, { compact: true })}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* === Time entries === */}
            <section>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h3 className="font-display text-base font-bold text-ink-900">
                  Docházka <span className="text-ink-500 font-mono tabular-nums text-sm">({monthEntries.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setCreatingEntry(true)}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Přidat hodiny</span>
                </button>
              </div>
              {monthEntries.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={Clock}
                    title="Žádná docházka"
                    description="V tomto měsíci nejsou zapsané žádné hodiny."
                    className="py-8"
                  />
                </div>
              ) : (
                <div className="card divide-y divide-ink-100 overflow-hidden">
                  {[...monthEntries].sort((a, b) => (a.date < b.date ? 1 : -1)).map((entry) => (
                    <TimeEntryRow
                      key={entry.id}
                      entry={entry}
                      employee={employee}
                      project={projects.find((p) => p.id === entry.projectId)}
                      onEdit={() => setEditingEntry(entry)}
                      onDelete={() => deleteTimeEntry(entry.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* === History === */}
            <section>
              <h3 className="font-display text-base font-bold text-ink-900 mb-2">
                Historie posledních měsíců
              </h3>
              <div className="card divide-y divide-ink-100 overflow-hidden">
                {history.map((h) => (
                  <button
                    key={h.month}
                    type="button"
                    onClick={() => setSelectedMonth(h.month)}
                    className={classNames(
                      'w-full p-3 flex items-center justify-between gap-3 hover:bg-ink-50/40 transition-colors text-left',
                      h.month === selectedMonth && 'bg-accent-50'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Calendar className="w-4 h-4 text-ink-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-ink-900 capitalize">
                          {czMonthLabel(h.month)}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatHours(h.calc.wage.totalHours)} · {h.calc.wage.workDayCount} dní
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono tabular-nums font-bold text-sm">
                        {formatCZK(h.calc.netSalary, { compact: true })}
                      </p>
                      <p className="text-[10px] text-ink-500">
                        {PAYROLL_STATUS[h.status]?.label}
                        {h.paidDate && ` · ${formatDate(h.paidDate)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* === Sidebar === */}
          <aside className="lg:sticky lg:top-4 self-start space-y-3">

            {/* Personal info */}
            <section className="card p-4 text-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-3">
                Osobní údaje
              </p>
              <dl className="space-y-2.5 text-xs">
                <DataItem icon={Briefcase} label="Smlouva" value={contract.label} />
                <DataItem icon={Calendar} label="Ve firmě od" value={formatDate(employee.hireDate)} />
                {employee.phone && (
                  <DataItem
                    icon={Phone}
                    label="Telefon"
                    value={<a href={`tel:${employee.phone.replace(/\s/g,'')}`} className="hover:text-ink-900 break-all">{employee.phone}</a>}
                  />
                )}
                {employee.email && (
                  <DataItem
                    icon={Mail}
                    label="E-mail"
                    value={<a href={`mailto:${employee.email}`} className="hover:text-ink-900 break-all">{employee.email}</a>}
                  />
                )}
                {employee.address && <DataItem icon={MapPin} label="Adresa" value={employee.address} />}
              </dl>
            </section>

            {/* Bank / payroll info */}
            <section className="card p-4 text-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-3">
                Mzdové údaje
              </p>
              <dl className="space-y-2.5 text-xs">
                {employee.accountNumber && (
                  <DataItem icon={Banknote} label="Účet" value={<span className="font-mono">{employee.accountNumber}</span>} />
                )}
                {employee.healthInsurance && (
                  <DataItem icon={Receipt} label="Pojišťovna" value={employee.healthInsurance} />
                )}
                {employee.socialNumber && (
                  <DataItem icon={FileText} label="Rod. číslo" value={<span className="font-mono">{employee.socialNumber}</span>} />
                )}
                <DataItem
                  icon={Receipt}
                  label="Sleva na poplatníka"
                  value={employee.hasTaxCredit ? 'Ano (2 570 Kč/měs)' : 'Ne'}
                />
              </dl>
            </section>

            {/* YTD totals */}
            <section className="card p-4 text-sm">
              <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2">
                Tento rok (YTD)
              </p>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-ink-600">Odpracováno</dt>
                  <dd className="font-mono tabular-nums">{formatHours(ytd.totalHours)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Hrubé mzdy</dt>
                  <dd className="font-mono tabular-nums">{formatCZK(ytd.totalGross, { compact: true })}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-600">Čisté mzdy</dt>
                  <dd className="font-mono tabular-nums font-semibold">{formatCZK(ytd.totalNet, { compact: true })}</dd>
                </div>
                <div className="flex justify-between pt-1.5 mt-1.5 border-t border-ink-100">
                  <dt className="text-ink-700 font-semibold">Náklad firmy</dt>
                  <dd className="font-mono tabular-nums font-bold">{formatCZK(ytd.totalCost, { compact: true })}</dd>
                </div>
              </dl>
            </section>

            {employee.bankNote && (
              <section className="card p-4 bg-ink-50/40 text-xs italic text-ink-700 leading-relaxed">
                {employee.bankNote}
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* Modals */}
      <EmployeeFormModal
        open={editing}
        onClose={() => setEditing(false)}
        employee={employee}
      />
      <TimeEntryFormModal
        open={creatingEntry}
        onClose={() => setCreatingEntry(false)}
        employeeId={employee.id}
        defaultMonth={selectedMonth}
      />
      <TimeEntryFormModal
        open={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        employeeId={employee.id}
        entry={editingEntry}
      />
      <BonusFormModal
        open={creatingBonus}
        onClose={() => setCreatingBonus(false)}
        employeeId={employee.id}
        defaultMonth={selectedMonth}
      />
      <BonusFormModal
        open={!!editingBonus}
        onClose={() => setEditingBonus(null)}
        employeeId={employee.id}
        bonus={editingBonus}
      />
      <DeductionFormModal
        open={creatingDeduction}
        onClose={() => setCreatingDeduction(false)}
        employeeId={employee.id}
        defaultMonth={selectedMonth}
      />
      <DeductionFormModal
        open={!!editingDeduction}
        onClose={() => setEditingDeduction(null)}
        employeeId={employee.id}
        deduction={editingDeduction}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Smazat zaměstnance?"
        description={`Zaměstnanec ${employee.name} bude trvale odstraněn včetně docházky, bonusů a srážek.`}
        confirmLabel="Smazat"
        danger
      />
    </>
  );
}

// ============================================================
// PAYSLIP CARD — full breakdown
// ============================================================
function PayslipCard({ employee, calc, month, status, onApprove, onMarkPaid }) {
  const isOsvc = calc.isOsvc;
  return (
    <section className="card overflow-hidden">
      <div className="p-5 bg-gradient-to-br from-ink-900 to-ink-800 text-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent-400">
              Výplatní páska — {czMonthLabel(month)}
            </p>
            <p className="font-display text-3xl font-extrabold tabular-nums leading-none mt-1">
              {formatCZK(calc.netSalary)}
            </p>
            <p className="text-xs text-ink-300 mt-1.5">čistá mzda k výplatě</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400">Hrubá mzda</p>
            <p className="font-display text-xl font-bold tabular-nums">{formatCZK(calc.grossSalary)}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-400 mt-2">Náklad firmy</p>
            <p className="font-display text-base font-bold tabular-nums text-accent-400">{formatCZK(calc.employerCost)}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Hours breakdown */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2">
            Odpracované hodiny
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(calc.wage.byShift).map(([shiftType, info]) => {
              const shift = SHIFT_TYPES[shiftType];
              return (
                <div key={shiftType} className="bg-ink-50/40 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">
                    {shift?.short || shiftType}
                  </p>
                  <p className="font-mono tabular-nums font-bold text-sm text-ink-900 mt-0.5">
                    {formatHours(info.hours)}
                  </p>
                  <p className="text-[10px] text-ink-500 tabular-nums mt-0.5">
                    {formatCZK(info.gross, { compact: true })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculation breakdown */}
        <div className="space-y-1.5 text-sm">
          <Row label="Mzda z hodin" value={formatCZK(calc.wage.totalGross)} />
          {calc.bonusTotal > 0 && (
            <Row label="+ Bonusy" value={formatCZK(calc.bonusTotal)} positive />
          )}
          <Row label="= Hrubá mzda" value={formatCZK(calc.grossSalary)} bold />

          {!isOsvc && (
            <>
              <Row label={`− Sociální (${(7.1).toFixed(1)} %)`} value={`− ${formatCZK(calc.socialEmp)}`} muted />
              <Row label={`− Zdravotní (${(4.5).toFixed(1)} %)`} value={`− ${formatCZK(calc.healthEmp)}`} muted />
              <Row label={`− Daň po slevě`} value={`− ${formatCZK(calc.finalTax)}`} muted />
            </>
          )}
          {calc.mealAllowance > 0 && (
            <Row label="+ Diety (140 Kč × dny)" value={formatCZK(calc.mealAllowance)} positive />
          )}
          {calc.deductionTotal > 0 && (
            <Row label="− Srážky" value={`− ${formatCZK(calc.deductionTotal)}`} negative />
          )}
          <div className="pt-2 mt-2 border-t border-ink-200">
            <Row label="ČISTÁ MZDA" value={formatCZK(calc.netSalary)} bigBold />
          </div>

          {!isOsvc && (
            <details className="mt-3">
              <summary className="text-xs text-ink-500 cursor-pointer hover:text-ink-700">
                Zobrazit odvody zaměstnavatele
              </summary>
              <div className="mt-2 space-y-1 text-xs pl-3 border-l-2 border-ink-100">
                <Row label="Sociální (24,8 %)" value={formatCZK(calc.socialEr)} muted />
                <Row label="Zdravotní (9 %)" value={formatCZK(calc.healthEr)} muted />
                <Row label="Náklad firmy celkem" value={formatCZK(calc.employerCost)} bold />
              </div>
            </details>
          )}
        </div>

        {/* Status / actions */}
        {status !== 'paid' && (
          <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-end gap-2">
            {status === 'draft' && (
              <button onClick={onApprove} className="btn btn-outline">
                <CheckCircle2 className="w-4 h-4" />
                Schválit
              </button>
            )}
            <button
              onClick={onMarkPaid}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
            >
              <Banknote className="w-4 h-4" />
              Označit jako vyplaceno
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ label, value, positive, negative, muted, bold, bigBold }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={classNames(
        bigBold ? 'font-display font-extrabold text-ink-900 text-base' :
        bold ? 'font-bold text-ink-900' :
        muted ? 'text-ink-500' : 'text-ink-700'
      )}>
        {label}
      </span>
      <span className={classNames(
        'font-mono tabular-nums',
        bigBold ? 'font-extrabold text-lg text-ink-900' :
        bold ? 'font-bold text-ink-900' :
        positive ? 'text-emerald-700 font-semibold' :
        negative ? 'text-red-700 font-semibold' :
        muted ? 'text-ink-500' : 'text-ink-900'
      )}>
        {value}
      </span>
    </div>
  );
}

function DataItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-500 font-bold flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </p>
      <p className="text-ink-900 mt-0.5 font-medium">{value}</p>
    </div>
  );
}

// ============================================================
// BONUSES & DEDUCTIONS PANELS
// ============================================================
function BonusesPanel({ bonuses, projects, onAdd, onEdit, onDelete }) {
  return (
    <section className="card overflow-hidden">
      <header className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-emerald-900 inline-flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Bonusy ({bonuses.length})
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white"
        >
          <Plus className="w-3 h-3" />
          Přidat
        </button>
      </header>
      {bonuses.length === 0 ? (
        <div className="p-4 text-xs text-ink-500 text-center">Bez bonusů.</div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {bonuses.map((b) => {
            const type = BONUS_TYPES[b.type] || BONUS_TYPES.other;
            const project = b.projectId ? projects.find((p) => p.id === b.projectId) : null;
            return (
              <li key={b.id} className="p-3 flex items-start gap-2 group hover:bg-ink-50/40">
                <button onClick={() => onEdit(b)} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">{type.label}</p>
                    <p className="font-mono tabular-nums font-bold text-sm text-emerald-700">
                      + {formatCZK(b.amount, { compact: true })}
                    </p>
                  </div>
                  {b.note && <p className="text-xs text-ink-500 mt-0.5 italic">{b.note}</p>}
                  {project && (
                    <p className="text-[10px] text-ink-400 mt-0.5 inline-flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" />
                      {project.name}
                    </p>
                  )}
                </button>
                <button
                  onClick={() => onDelete(b)}
                  className="p-1 rounded text-ink-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  aria-label="Smazat bonus"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function DeductionsPanel({ deductions, onAdd, onEdit, onDelete }) {
  return (
    <section className="card overflow-hidden">
      <header className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
        <h3 className="font-display font-bold text-red-900 inline-flex items-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Srážky ({deductions.length})
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs font-semibold text-red-700 hover:text-red-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white"
        >
          <Plus className="w-3 h-3" />
          Přidat
        </button>
      </header>
      {deductions.length === 0 ? (
        <div className="p-4 text-xs text-ink-500 text-center">Bez srážek.</div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {deductions.map((d) => {
            const type = DEDUCTION_TYPES[d.type] || DEDUCTION_TYPES.other;
            return (
              <li key={d.id} className="p-3 flex items-start gap-2 group hover:bg-ink-50/40">
                <button onClick={() => onEdit(d)} className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900">{type.label}</p>
                    <p className="font-mono tabular-nums font-bold text-sm text-red-700">
                      − {formatCZK(d.amount, { compact: true })}
                    </p>
                  </div>
                  {d.note && <p className="text-xs text-ink-500 mt-0.5 italic">{d.note}</p>}
                </button>
                <button
                  onClick={() => onDelete(d)}
                  className="p-1 rounded text-ink-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                  aria-label="Smazat srážku"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ============================================================
// TIME ENTRY ROW
// ============================================================
function TimeEntryRow({ entry, employee, project, onEdit, onDelete }) {
  const shift = SHIFT_TYPES[entry.shiftType] || SHIFT_TYPES.regular;
  const grossForEntry = entry.hours * employee.hourlyRate * shift.multiplier;

  return (
    <div className="p-3 flex items-center gap-3 hover:bg-ink-50/40 group">
      <div className="text-center flex-shrink-0">
        <p className="font-mono tabular-nums text-xs text-ink-500">
          {new Date(entry.date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}
        </p>
        <p className="text-[10px] text-ink-400 uppercase">
          {new Date(entry.date).toLocaleDateString('cs-CZ', { weekday: 'short' })}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-ink-900">{formatHours(entry.hours)}</p>
          <Badge color={shift.color}>{shift.short}</Badge>
        </div>
        {project && (
          <p className="text-xs text-ink-500 mt-0.5 truncate">{project.name}</p>
        )}
        {entry.note && <p className="text-[11px] text-ink-500 italic line-clamp-1 mt-0.5">{entry.note}</p>}
      </div>
      <p className="font-mono tabular-nums text-sm font-semibold text-ink-900 flex-shrink-0">
        {formatCZK(grossForEntry, { compact: true })}
      </p>
      <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        <button onClick={onEdit} aria-label="Upravit" className="p-1 rounded text-ink-500 hover:text-ink-900 hover:bg-ink-100">
          <Edit3 className="w-3 h-3" />
        </button>
        <button onClick={onDelete} aria-label="Smazat" className="p-1 rounded text-ink-400 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

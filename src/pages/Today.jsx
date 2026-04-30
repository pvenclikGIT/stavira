import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Building2, Hammer, Receipt, FileText, ShieldAlert,
  Sun, Calendar, ArrowUpRight, Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCZK, formatDate, daysFromNow, classNames } from '../utils/format';
import { calcPayroll, filterEntriesByMonth, formatHours, czMonthLabel } from '../utils/payrollCalc';
import PageHeader from '../components/PageHeader';

/**
 * "Dnes" — primary page after login.
 * Goal: stavbyvedoucí or owner sees in 1 second what matters today,
 * and reaches frequent actions in 1 tap.
 */
export default function Today() {
  const {
    currentUser, visibleProjects,
    invoices, changeOrders, findings, diaryEntries,
    quotes,
    employees, timeEntries, bonuses, deductions, payrolls,
    isManager, isOwner, isAccountant,
  } = useApp();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return 'Dobré ráno';
    if (h < 18) return 'Dobré odpoledne';
    return 'Dobrý večer';
  }, []);

  const firstName = currentUser?.name?.split(' ')[0] || '';
  const today = new Date().toISOString().slice(0, 10);

  // Active projects visible to user
  const activeProjects = visibleProjects
    .filter((p) => p.status === 'active' || p.status === 'planning')
    .sort((a, b) => {
      // active first, then by deadline
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return (a.deadline || '') < (b.deadline || '') ? -1 : 1;
    });

  // Today's diary status per project
  const projectsWithDiaryStatus = useMemo(() => {
    return activeProjects.map((p) => {
      const todayEntry = diaryEntries.find(
        (d) => d.projectId === p.id && d.date === today
      );
      const lastEntry = diaryEntries
        .filter((d) => d.projectId === p.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      return { ...p, _todayEntry: todayEntry, _lastEntry: lastEntry };
    });
  }, [activeProjects, diaryEntries, today]);

  // Things needing attention (only for owner/accountant — manager doesn't deal with money)
  const visibleProjectIds = visibleProjects.map((p) => p.id);
  const pendingCOs = changeOrders.filter(
    (c) => c.status === 'pending' && visibleProjectIds.includes(c.projectId)
  );
  const overdueInvoices = invoices.filter((i) => {
    if (!visibleProjectIds.includes(i.projectId)) return false;
    if (i.status === 'overdue') return true;
    if (i.status === 'sent' && i.dueDate) {
      const d = daysFromNow(i.dueDate);
      return d !== null && d < 0;
    }
    return false;
  });
  const openHighFindings = findings.filter(
    (f) => visibleProjectIds.includes(f.projectId) && f.severity === 'high' && f.status !== 'resolved'
  );

  // Quotes — drafts (need to finish) and sent (waiting for client)
  const draftQuotes = quotes.filter((q) => q.status === 'draft');
  const sentQuotes  = quotes.filter((q) => q.status === 'sent');
  const approvedNotConverted = quotes.filter((q) => q.status === 'approved' && !q.projectId);

  const showAlerts = isOwner || isAccountant;

  // Payroll snapshot for this month — only for owner/accountant
  const payrollSnapshot = useMemo(() => {
    if (!showAlerts) return null;
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let totalEmployerCost = 0;
    let totalNet = 0;
    let pendingCount = 0;
    let paidCount = 0;
    let totalHours = 0;
    const active = (employees || []).filter((e) => e.active !== false);
    active.forEach((emp) => {
      const ents = filterEntriesByMonth(
        (timeEntries || []).filter((te) => te.employeeId === emp.id),
        month
      );
      if (ents.length === 0) return;
      const empBn = (bonuses || []).filter((b) => b.employeeId === emp.id && b.month === month);
      const empDd = (deductions || []).filter((d) => d.employeeId === emp.id && d.month === month);
      const calc = calcPayroll({ employee: emp, entries: ents, bonuses: empBn, deductions: empDd });
      totalEmployerCost += calc.employerCost;
      totalNet += calc.netSalary;
      totalHours += calc.wage.totalHours;
      const pr = (payrolls || []).find((p) => p.employeeId === emp.id && p.month === month);
      if (pr?.status === 'paid') paidCount += 1;
      else pendingCount += 1;
    });
    return {
      month,
      employerCost: totalEmployerCost,
      net: totalNet,
      hours: totalHours,
      pendingCount,
      paidCount,
      employeeCount: active.length,
    };
  }, [showAlerts, employees, timeEntries, bonuses, deductions, payrolls]);

  return (
    <>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        subtitle={
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('cs-CZ', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </span>
        }
      />

      <div className="px-4 md:px-8 py-5 max-w-5xl mx-auto space-y-6">

        {/* ===== Alerts (only for owner/accountant) ===== */}
        {showAlerts && (pendingCOs.length > 0 || overdueInvoices.length > 0) && (
          <div className="space-y-2">
            {pendingCOs.length > 0 && (
              <Link
                to={`/projekty/${pendingCOs[0].projectId}`}
                className="card card-hover p-4 border-l-4 border-amber-400 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    {pendingCOs.length} {pendingCOs.length === 1 ? 'vícepráce čeká' : 'víceprací čeká'} na schválení
                  </p>
                  <p className="text-sm text-ink-600 mt-0.5">
                    Celkem {formatCZK(pendingCOs.reduce((s, c) => s + c.amount, 0), { compact: true })}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
              </Link>
            )}

            {overdueInvoices.length > 0 && (
              <Link
                to={`/projekty/${overdueInvoices[0].projectId}`}
                className="card card-hover p-4 border-l-4 border-red-400 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    {overdueInvoices.length} {overdueInvoices.length === 1 ? 'faktura je' : 'faktur je'} po splatnosti
                  </p>
                  <p className="text-sm text-ink-600 mt-0.5">
                    Celkem {formatCZK(overdueInvoices.reduce((s, i) => s + i.amount, 0), { compact: true })}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
              </Link>
            )}

            {openHighFindings.length > 0 && (
              <Link
                to={`/projekty/${openHighFindings[0].projectId}`}
                className="card card-hover p-4 border-l-4 border-red-400 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    {openHighFindings.length} {openHighFindings.length === 1 ? 'závažný nález' : 'závažných nálezů'}
                  </p>
                  <p className="text-sm text-ink-600 mt-0.5">Vyžaduje řešení</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
              </Link>
            )}

            {approvedNotConverted.length > 0 && (
              <Link
                to={`/nabidky/${approvedNotConverted[0].id}`}
                className="card card-hover p-4 border-l-4 border-emerald-400 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    {approvedNotConverted.length === 1 ? 'Schválená nabídka' : `${approvedNotConverted.length} schválených nabídek`}
                    {' '}— vytvořit projekt
                  </p>
                  <p className="text-sm text-ink-600 mt-0.5">
                    Klient potvrdil, můžeme začít stavět
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
              </Link>
            )}

            {sentQuotes.length > 0 && (
              <Link
                to="/nabidky"
                className="card card-hover p-4 border-l-4 border-amber-400 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    {sentQuotes.length} {sentQuotes.length === 1 ? 'nabídka' : sentQuotes.length <= 4 ? 'nabídky' : 'nabídek'} u klienta
                  </p>
                  <p className="text-sm text-ink-600 mt-0.5">
                    Čekáme na rozhodnutí
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
              </Link>
            )}

            {draftQuotes.length > 0 && (
              <Link
                to="/nabidky"
                className="card card-hover p-4 border-l-4 border-slate-400 flex items-center gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    {draftQuotes.length} {draftQuotes.length === 1 ? 'rozpracovaná nabídka' : 'rozpracovaných nabídek'}
                  </p>
                  <p className="text-sm text-ink-600 mt-0.5">
                    Připravit a odeslat klientovi
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-ink-400 flex-shrink-0" />
              </Link>
            )}
          </div>
        )}

        {/* ===== Payroll snapshot — owner/accountant only ===== */}
        {showAlerts && payrollSnapshot && payrollSnapshot.employeeCount > 0 && payrollSnapshot.hours > 0 && (
          <Link
            to="/mzdy"
            className="card card-hover p-4 flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-xl bg-ink-900 text-accent-400 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-semibold text-ink-900">Mzdy — {czMonthLabel(payrollSnapshot.month)}</p>
                {payrollSnapshot.pendingCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {payrollSnapshot.pendingCount} čeká
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-ink-600 flex-wrap">
                <span className="font-mono tabular-nums">
                  Náklad firmy <strong className="text-ink-900">{formatCZK(payrollSnapshot.employerCost, { compact: true })}</strong>
                </span>
                <span className="text-ink-300">·</span>
                <span className="font-mono tabular-nums">
                  K výplatě <strong className="text-ink-900">{formatCZK(payrollSnapshot.net, { compact: true })}</strong>
                </span>
                <span className="text-ink-300">·</span>
                <span className="font-mono tabular-nums">{formatHours(payrollSnapshot.hours)}</span>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        )}

        {/* ===== Projects today — primary content ===== */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-ink-900">
              {projectsWithDiaryStatus.length === 1 ? 'Vaše stavba' : 'Vaše stavby'}
            </h2>
            {projectsWithDiaryStatus.length > 0 && (
              <span className="text-sm text-ink-500 tabular-nums">
                {projectsWithDiaryStatus.length}
              </span>
            )}
          </div>

          {projectsWithDiaryStatus.length === 0 ? (
            <div className="card p-8 text-center text-ink-500">
              <Sun className="w-10 h-10 mx-auto mb-3 text-ink-300" />
              <p className="text-base">Žádné aktivní stavby.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectsWithDiaryStatus.map((p) => (
                <ProjectTodayCard key={p.id} project={p} isManager={isManager} />
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  );
}

function ProjectTodayCard({ project, isManager }) {
  const TypeIcon = project.type === 'rekonstrukce' ? Hammer : Building2;
  const todayEntry = project._todayEntry;
  const lastEntry = project._lastEntry;
  const daysToDeadline = daysFromNow(project.deadline);
  const isOverdue = daysToDeadline !== null && daysToDeadline < 0;

  return (
    <Link
      to={`/projekty/${project.id}`}
      className="card card-hover overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-ink-900 text-accent-400 flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-bold text-ink-900 leading-tight line-clamp-1">
              {project.name}
            </h3>
            <p className="text-xs text-ink-500 truncate mt-0.5">
              {project.address}
            </p>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-ink-500">Postup</span>
            <span className="font-mono tabular-nums font-bold text-ink-900">{project.progress}%</span>
          </span>
          {project.deadline && (
            <span className={classNames(
              'inline-flex items-center gap-1.5',
              isOverdue && 'text-red-600 font-semibold'
            )}>
              <Calendar className="w-3.5 h-3.5" />
              {isOverdue ? `${Math.abs(daysToDeadline)} d. po term.`
                : daysToDeadline === 0 ? 'Termín dnes'
                : daysToDeadline > 0 && daysToDeadline <= 30 ? `Za ${daysToDeadline} d.`
                : formatDate(project.deadline)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-400 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Diary status — emphasizes today's entry */}
      {isManager && (
        <div className={classNames(
          'px-4 py-3 border-t',
          todayEntry ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
        )}>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className={classNames(
              'w-4 h-4 flex-shrink-0',
              todayEntry ? 'text-emerald-600' : 'text-amber-700'
            )} />
            {todayEntry ? (
              <span className="font-semibold text-emerald-800">
                Deník dnes vyplněn
              </span>
            ) : (
              <span className="font-semibold text-amber-800">
                Deník dnes ještě nevyplněn
              </span>
            )}
          </div>
          {!todayEntry && lastEntry && (
            <p className="text-xs text-amber-700/80 mt-0.5 ml-6">
              Poslední záznam: {formatDate(lastEntry.date)}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}

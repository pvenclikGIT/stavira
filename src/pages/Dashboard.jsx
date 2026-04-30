import { Link } from 'react-router-dom';
import {
  AlertCircle, Wallet, Hammer, ArrowUpRight,
  Calendar, Users, FolderKanban, ChevronRight, Receipt,
  FileText, ShieldAlert, Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCZK, formatDate, daysFromNow, classNames,
} from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const { projects, clients, invoices, changeOrders, findings, currentUser } = useApp();

  // KPIs
  const activeProjects = projects.filter((p) => p.status === 'active');
  const planningProjects = projects.filter((p) => p.status === 'planning');
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.actualCost || 0), 0);
  const budgetUsedPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const projectsOverBudget = projects.filter(
    (p) => p.actualCost > p.budget && p.status !== 'done'
  );

  // Cashflow
  const paidSum = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + (i.amount || 0), 0);
  const pendingInvoices = invoices.filter((i) => {
    if (i.status === 'overdue') return true;
    if (i.status === 'sent') return true;
    return false;
  });
  const overdueInvoices = invoices
    .filter((i) => {
      if (i.status === 'overdue') return true;
      if (i.status === 'sent' && i.dueDate) {
        const d = daysFromNow(i.dueDate);
        return d !== null && d < 0;
      }
      return false;
    })
    .map((i) => ({ ...i, _project: projects.find((p) => p.id === i.projectId) }))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
  const pendingSum = pendingInvoices.reduce((s, i) => s + (i.amount || 0), 0);

  // Pending change orders
  const pendingChangeOrders = changeOrders
    .filter((c) => c.status === 'pending')
    .map((c) => ({ ...c, _project: projects.find((p) => p.id === c.projectId) }))
    .sort((a, b) => (a.requestedDate < b.requestedDate ? 1 : -1));

  // High-severity unresolved findings
  const criticalFindings = findings
    .filter((f) => f.severity === 'high' && f.status !== 'resolved')
    .map((f) => ({ ...f, _project: projects.find((p) => p.id === f.projectId) }));

  const upcomingDeadlines = projects
    .filter((p) => p.status === 'active' && p.deadline)
    .map((p) => ({ ...p, _days: daysFromNow(p.deadline) }))
    .filter((p) => p._days !== null && p._days <= 60)
    .sort((a, b) => a._days - b._days)
    .slice(0, 5);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Dobré ráno';
    if (h < 18) return 'Dobrý den';
    return 'Dobrý večer';
  })();

  return (
    <>
      <PageHeader
        title={`${greeting}, ${currentUser?.name?.split(' ')[0] || ''}`}
        subtitle="Přehled stavebních projektů, financí a otevřených úkolů."
      />

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        {/* ===== KPI cards ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <KpiCard
            icon={FolderKanban}
            label="Aktivní projekty"
            value={activeProjects.length}
            sub={`+ ${planningProjects.length} v přípravě`}
          />
          <KpiCard
            icon={Wallet}
            label="Celkový rozpočet"
            value={formatCZK(totalBudget, { compact: true })}
            sub={`Vyčerpáno ${Math.round(budgetUsedPct)} %`}
            tone="accent"
          />
          <KpiCard
            icon={Receipt}
            label="Zaplaceno klienty"
            value={formatCZK(paidSum, { compact: true })}
            sub={pendingSum > 0 ? `Čeká: ${formatCZK(pendingSum, { compact: true })}` : 'Vše zaplaceno'}
          />
          <KpiCard
            icon={Users}
            label="Klienti"
            value={clients.length}
            sub={`${projects.length} projektů celkem`}
          />
        </div>

        {/* ===== Critical alerts ===== */}
        {(projectsOverBudget.length > 0 || overdueInvoices.length > 0 || criticalFindings.length > 0) && (
          <div className="mt-5 space-y-2">
            {overdueInvoices.length > 0 && (
              <Alert
                tone="red"
                icon={Receipt}
                title={`${overdueInvoices.length} ${overdueInvoices.length === 1 ? 'faktura je' : 'faktur je'} po splatnosti`}
                detail={overdueInvoices.slice(0, 3).map((i) => `${i.number} (${i._project?.name?.split(' — ')[0] || 'Projekt'})`).join(' · ')}
              />
            )}
            {projectsOverBudget.length > 0 && (
              <Alert
                tone="red"
                icon={AlertCircle}
                title={`${projectsOverBudget.length} ${projectsOverBudget.length === 1 ? 'projekt překračuje' : 'projektů překračuje'} rozpočet`}
                detail={projectsOverBudget.map((p) => p.name).join(' · ')}
              />
            )}
            {criticalFindings.length > 0 && (
              <Alert
                tone="amber"
                icon={ShieldAlert}
                title={`${criticalFindings.length} ${criticalFindings.length === 1 ? 'závažný nález není' : 'závažných nálezů není'} vyřešeno`}
                detail={criticalFindings.slice(0, 3).map((f) => f.title).join(' · ')}
              />
            )}
          </div>
        )}

        {/* ===== Two column grid ===== */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active projects list */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-ink-900">
                Aktivní projekty
              </h2>
              <Link
                to="/projekty"
                className="text-sm font-semibold text-ink-600 hover:text-ink-900 inline-flex items-center gap-1"
              >
                Vše <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="card overflow-hidden">
              {activeProjects.length === 0 ? (
                <div className="p-8 text-center text-sm text-ink-500">
                  Žádný aktivní projekt.
                </div>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {activeProjects.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);
                    const overBudget = p.actualCost > p.budget;
                    const TypeIcon = p.type === 'rekonstrukce' ? Hammer : Building2;
                    return (
                      <li key={p.id}>
                        <Link
                          to={`/projekty/${p.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-ink-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-ink-900 text-accent-400 flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-ink-900 truncate">{p.name}</p>
                              {overBudget && (
                                <Badge color="red">Přečerpán</Badge>
                              )}
                            </div>
                            <p className="text-xs text-ink-500 mt-0.5 truncate">
                              <span className="font-mono">{p.code}</span>
                              {' · '}
                              {client?.name || 'Bez klienta'}
                              {' · '}
                              {p.address}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <ProgressBar value={p.progress} size="sm" className="flex-1 max-w-xs" />
                              <span className="text-xs font-mono tabular-nums text-ink-600 w-8 text-right">
                                {p.progress}%
                              </span>
                            </div>
                          </div>
                          <div className="hidden sm:block text-right flex-shrink-0">
                            <p className="text-xs text-ink-500">Rozpočet</p>
                            <p className="font-semibold text-sm text-ink-900 tabular-nums">
                              {formatCZK(p.budget, { compact: true })}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Right column: pending change orders + deadlines */}
          <div className="space-y-6">
            {/* Pending change orders */}
            {pendingChangeOrders.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg font-bold text-ink-900">
                    Čeká na schválení
                  </h2>
                  <span className="text-xs font-mono tabular-nums text-ink-500">
                    {pendingChangeOrders.length}
                  </span>
                </div>
                <div className="card divide-y divide-ink-100 overflow-hidden">
                  {pendingChangeOrders.slice(0, 4).map((co) => (
                    <Link
                      key={co.id}
                      to={`/projekty/${co.projectId}`}
                      className="block p-3 hover:bg-ink-50 transition-colors group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[10px] font-bold text-ink-700">{co.number}</span>
                            <span className="text-xs font-mono tabular-nums font-bold text-ink-900">
                              {formatCZK(co.amount, { compact: true })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-ink-700">
                            {co.title}
                          </p>
                          <p className="text-[11px] text-ink-500 truncate">
                            {co._project?.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming deadlines */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Blížící se termíny
                </h2>
              </div>

              <div className="card p-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="py-6 text-center text-sm text-ink-500">
                    Žádné termíny v nejbližších 60 dnech.
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {upcomingDeadlines.map((p) => {
                      const days = p._days;
                      const tone = days < 0 ? 'red' : days <= 14 ? 'amber' : 'slate';
                      const label =
                        days < 0 ? `${Math.abs(days)} d. po termínu`
                        : days === 0 ? 'Dnes'
                        : days === 1 ? 'Zítra'
                        : `Za ${days} d.`;
                      return (
                        <li key={p.id}>
                          <Link
                            to={`/projekty/${p.id}`}
                            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-ink-50 transition-colors group"
                          >
                            <div className={classNames(
                              'mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                              tone === 'red' && 'bg-red-50 text-red-600',
                              tone === 'amber' && 'bg-accent-50 text-accent-600',
                              tone === 'slate' && 'bg-ink-100 text-ink-600',
                            )}>
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-ink-900 truncate group-hover:text-ink-700">
                                {p.name}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <Badge color={tone}>{label}</Badge>
                                <span className="text-[10px] text-ink-500 font-mono tabular-nums">{formatDate(p.deadline)}</span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone = 'ink' }) {
  return (
    <div className="card p-4 md:p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={classNames(
          'w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center',
          tone === 'accent' ? 'bg-accent-400 text-ink-900' : 'bg-ink-900 text-accent-400'
        )}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
      <p className="stat-label mt-3 md:mt-4">{label}</p>
      <p className="stat-value mt-1">{value}</p>
      {sub && (
        <p className="mt-1 text-xs text-ink-500 truncate">{sub}</p>
      )}
    </div>
  );
}

function Alert({ tone = 'amber', icon: Icon, title, detail }) {
  return (
    <div className={classNames(
      'p-4 rounded-xl border flex items-start gap-3',
      tone === 'red' && 'border-red-200 bg-red-50',
      tone === 'amber' && 'border-amber-200 bg-amber-50',
    )}>
      <div className={classNames(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        tone === 'red' && 'bg-red-100 text-red-600',
        tone === 'amber' && 'bg-amber-100 text-amber-700',
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={classNames(
          'font-semibold',
          tone === 'red' && 'text-red-900',
          tone === 'amber' && 'text-amber-900',
        )}>
          {title}
        </p>
        {detail && (
          <p className={classNames(
            'mt-0.5 text-sm truncate',
            tone === 'red' && 'text-red-700',
            tone === 'amber' && 'text-amber-700',
          )}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

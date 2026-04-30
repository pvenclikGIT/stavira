import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Trash2, MapPin, Calendar, User, Wallet,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, Building2, Hammer, LayoutGrid, HardHat,
  Receipt, FileText, ShieldAlert, BookOpen, Phone, Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_STATUSES, PROJECT_TYPES } from '../data/seed';
import {
  formatCZK, formatDate, formatDeadline, daysBetween, daysFromNow, classNames,
} from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ProjectFormModal from '../components/ProjectFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Tabs from '../components/Tabs';
import StagesTab from '../components/StagesTab';
import InvoicesTab from '../components/InvoicesTab';
import ChangeOrdersTab from '../components/ChangeOrdersTab';
import FindingsTab from '../components/FindingsTab';
import DiaryTab from '../components/DiaryTab';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getProject, getClient, deleteProject, isClient,
    invoicesForProject, changeOrdersForProject, findingsForProject,
  } = useApp();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const project = getProject(id);

  if (!project) {
    return (
      <div className="px-4 md:px-8 py-12 max-w-3xl mx-auto">
        <EmptyState
          icon={Building2}
          title="Projekt nenalezen"
          description="Tento projekt neexistuje nebo byl odstraněn."
          action={
            <Link to="/projekty" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" /> Zpět na seznam
            </Link>
          }
        />
      </div>
    );
  }

  const client = getClient(project.clientId);
  const status = PROJECT_STATUSES[project.status];
  const projectType = PROJECT_TYPES[project.type] || PROJECT_TYPES.novostavba;
  const TypeIcon = project.type === 'rekonstrukce' ? Hammer : Building2;
  const isRenovation = project.type === 'rekonstrukce';

  const overBudget = project.actualCost > project.budget;
  const remaining = project.budget - project.actualCost;
  const budgetPct = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;

  const invoices = invoicesForProject(project.id);
  const changeOrders = changeOrdersForProject(project.id);
  const findings = findingsForProject(project.id);

  const pendingCOCount = changeOrders.filter((c) => c.status === 'pending').length;
  const openFindingCount = findings.filter((f) => f.status !== 'resolved').length;
  const overdueInvoiceCount = useMemo(() => {
    return invoices.filter((i) => {
      if (i.status === 'overdue') return true;
      if (i.status === 'sent' && i.dueDate) {
        const d = daysFromNow(i.dueDate);
        return d !== null && d < 0;
      }
      return false;
    }).length;
  }, [invoices]);

  const handleDelete = () => {
    deleteProject(project.id);
    navigate('/projekty');
  };

  const tabs = isClient ? [
    // Client sees a much smaller, simpler set of tabs
    { key: 'overview',  label: 'Přehled',  icon: LayoutGrid },
    { key: 'diary',     label: 'Deník',    icon: BookOpen },
    { key: 'invoices',  label: 'Faktury',  icon: Receipt },
    { key: 'changeOrders', label: 'Vícepráce', icon: FileText, badge: pendingCOCount > 0 ? pendingCOCount : null },
  ] : [
    { key: 'overview',  label: 'Přehled',  icon: LayoutGrid },
    { key: 'stages',    label: 'Etapy',    icon: HardHat,   badge: project.stages?.length },
    { key: 'diary',     label: 'Deník',    icon: BookOpen },
    { key: 'invoices',  label: 'Faktury',  icon: Receipt,   badge: overdueInvoiceCount > 0 ? overdueInvoiceCount : invoices.length },
    { key: 'changeOrders', label: 'Vícepráce', icon: FileText, badge: pendingCOCount > 0 ? pendingCOCount : changeOrders.length },
    ...(isRenovation ? [{ key: 'findings', label: 'Nálezy', icon: ShieldAlert, badge: openFindingCount > 0 ? openFindingCount : findings.length }] : []),
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={isClient ? (
          <>
            <Link to="/" className="hover:text-ink-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Moje stavba
            </Link>
          </>
        ) : (
          <>
            <Link to="/projekty" className="hover:text-ink-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Projekty
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink-700 font-mono text-xs">{project.code}</span>
          </>
        )}
        title={project.name}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <Badge color={projectType.color} icon={TypeIcon}>{projectType.label}</Badge>
            <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
            <span className="text-ink-500 hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5 text-ink-600 text-xs sm:text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {project.address}
            </span>
          </span>
        }
        actions={isClient ? null : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn btn-outline"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Upravit</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="btn btn-danger"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Smazat</span>
            </button>
          </>
        )}
      />

      {/* Tabs */}
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            client={client}
            isRenovation={isRenovation}
            invoices={invoices}
            changeOrders={changeOrders}
            findings={findings}
            overBudget={overBudget}
            remaining={remaining}
            budgetPct={budgetPct}
            onJumpTo={setActiveTab}
          />
        )}

        {activeTab === 'stages' && <StagesTab project={project} />}
        {activeTab === 'diary' && <DiaryTab project={project} />}
        {activeTab === 'invoices' && <InvoicesTab project={project} />}
        {activeTab === 'changeOrders' && <ChangeOrdersTab project={project} />}
        {activeTab === 'findings' && isRenovation && <FindingsTab project={project} />}
      </div>

      <ProjectFormModal
        open={editing}
        onClose={() => setEditing(false)}
        project={project}
      />
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleDelete}
        title="Smazat projekt?"
        description={`Projekt "${project.name}" bude trvale odstraněn včetně všech etap, faktur, víceprací a nálezů.`}
        confirmLabel="Smazat projekt"
        danger
      />
    </>
  );
}

/* ----------------------------- Overview ----------------------------- */

function OverviewTab({
  project, client, isRenovation,
  invoices, changeOrders, findings,
  overBudget, remaining, budgetPct, onJumpTo,
}) {
  const totalDays = daysBetween(project.startDate, project.endDate);
  const elapsedDays = Math.max(0, daysBetween(project.startDate, new Date().toISOString()));
  const timeProgress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

  const paidSum = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + (i.amount || 0), 0);
  const approvedCOSum = changeOrders
    .filter((c) => c.status === 'approved')
    .reduce((s, c) => s + (c.amount || 0), 0);
  const pendingCOCount = changeOrders.filter((c) => c.status === 'pending').length;
  const overdueInvoices = invoices.filter((i) => {
    if (i.status === 'overdue') return true;
    if (i.status === 'sent' && i.dueDate) {
      const d = daysFromNow(i.dueDate);
      return d !== null && d < 0;
    }
    return false;
  });
  const openHighFindings = findings.filter((f) => f.severity === 'high' && f.status !== 'resolved');

  const daysToDeadline = daysFromNow(project.deadline);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {(pendingCOCount > 0 || overdueInvoices.length > 0 || openHighFindings.length > 0) && (
        <div className="space-y-2">
          {pendingCOCount > 0 && (
            <Alert
              tone="amber"
              icon={FileText}
              title={`${pendingCOCount} vícepráce čeká na schválení klientem`}
              action="Zobrazit"
              onAction={() => onJumpTo('changeOrders')}
            />
          )}
          {overdueInvoices.length > 0 && (
            <Alert
              tone="red"
              icon={Receipt}
              title={`${overdueInvoices.length} ${overdueInvoices.length === 1 ? 'faktura je' : 'faktur je'} po splatnosti`}
              action="Zobrazit faktury"
              onAction={() => onJumpTo('invoices')}
            />
          )}
          {openHighFindings.length > 0 && (
            <Alert
              tone="red"
              icon={ShieldAlert}
              title={`${openHighFindings.length} ${openHighFindings.length === 1 ? 'závažný nález není' : 'závažných nálezů není'} vyřešen`}
              action="Zobrazit nálezy"
              onAction={() => onJumpTo('findings')}
            />
          )}
        </div>
      )}

      {/* Top row: Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={TrendingUp}
          label="Postup prací"
          value={`${project.progress}%`}
          footer={<ProgressBar value={project.progress} size="sm" />}
        />
        <MetricCard
          icon={Wallet}
          label="Rozpočet"
          value={formatCZK(project.budget, { compact: true })}
          footer={
            <p className="text-xs text-ink-600">
              Vyčerpáno{' '}
              <span className={classNames(
                'font-bold tabular-nums',
                overBudget ? 'text-red-600' : 'text-ink-900'
              )}>
                {Math.round(budgetPct)} %
              </span>
            </p>
          }
        />
        <MetricCard
          icon={overBudget ? AlertTriangle : CheckCircle2}
          iconTone={overBudget ? 'red' : 'emerald'}
          label={overBudget ? 'Přečerpáno' : 'Zbývá'}
          value={formatCZK(Math.abs(remaining), { compact: true })}
          valueTone={overBudget ? 'red' : 'ink'}
          footer={
            <p className="text-xs text-ink-600">
              z {formatCZK(project.budget, { compact: true })}
            </p>
          }
        />
        <MetricCard
          icon={Clock}
          label="Termín"
          value={formatDeadline(project.deadline)}
          valueTone={daysToDeadline !== null && daysToDeadline < 0 ? 'red' : 'ink'}
          footer={
            <p className="text-xs text-ink-600 truncate">
              {formatDate(project.deadline)}
            </p>
          }
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {project.description && (
            <section className="card p-5">
              <h2 className="font-display font-bold text-ink-900 mb-2 inline-flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-ink-500" />
                Popis projektu
              </h2>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </section>
          )}

          {/* Original condition for renovations */}
          {isRenovation && project.originalCondition && (
            <section className="card p-5 border-l-4 border-blue-400">
              <h2 className="font-display font-bold text-ink-900 mb-2 inline-flex items-center gap-2">
                <Hammer className="w-4 h-4 text-blue-500" />
                Stav původního objektu
              </h2>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                {project.originalCondition}
              </p>
            </section>
          )}

          {/* Quick stages snapshot */}
          <section className="card overflow-hidden">
            <header className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-ink-900 inline-flex items-center gap-2">
                <HardHat className="w-4 h-4 text-ink-500" />
                Etapy
              </h2>
              <button
                type="button"
                onClick={() => onJumpTo('stages')}
                className="text-xs font-semibold text-ink-700 hover:text-ink-900 inline-flex items-center gap-1"
              >
                Spravovat etapy
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </header>
            {project.stages?.length ? (
              <ul className="divide-y divide-ink-100">
                {project.stages.slice(0, 5).map((stage, idx) => {
                  const isComplete = (stage.progress ?? 0) >= 100;
                  const isActive = (stage.progress ?? 0) > 0 && (stage.progress ?? 0) < 100;
                  return (
                    <li key={stage.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={classNames(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        isComplete && 'bg-emerald-500 text-white',
                        isActive && 'bg-accent-400 text-ink-900',
                        !isActive && !isComplete && 'bg-ink-100 text-ink-500',
                      )}>
                        {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{stage.label}</p>
                        <ProgressBar value={stage.progress ?? 0} size="sm" />
                      </div>
                      <span className="text-xs font-mono tabular-nums font-bold text-ink-700 min-w-[3ch] text-right">
                        {stage.progress ?? 0}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-5 text-sm text-ink-500 text-center">Zatím žádné etapy.</div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Time tracking */}
          <section className="card p-5">
            <h2 className="font-display font-bold text-ink-900 mb-3 inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ink-500" />
              Časový průběh
            </h2>
            <div className="space-y-3">
              <Row label="Začátek" value={formatDate(project.startDate)} />
              <Row label="Konec" value={formatDate(project.endDate)} />
              <Row
                label="Termín předání"
                value={
                  <span className={classNames(
                    'tabular-nums',
                    daysToDeadline !== null && daysToDeadline < 0 && 'text-red-600 font-bold'
                  )}>
                    {formatDate(project.deadline)}
                  </span>
                }
              />
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-500 font-semibold uppercase tracking-wider">
                    Uplynulý čas
                  </span>
                  <span className="font-mono tabular-nums font-bold">
                    {Math.round(timeProgress)} %
                  </span>
                </div>
                <ProgressBar
                  value={timeProgress}
                  size="sm"
                  tone={timeProgress > project.progress + 20 ? 'danger' : 'accent'}
                />
                {timeProgress > project.progress + 20 && (
                  <p className="text-xs text-red-600 mt-1.5">
                    Postup prací zaostává za časovým plánem.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Client */}
          {client && (
            <section className="card p-5">
              <h2 className="font-display font-bold text-ink-900 mb-3 inline-flex items-center gap-2">
                <User className="w-4 h-4 text-ink-500" />
                Klient
              </h2>
              <Link
                to={`/klienti/${client.id}`}
                className="block group -m-2 p-2 rounded-lg hover:bg-ink-50 transition-colors"
              >
                <p className="font-semibold text-ink-900 group-hover:underline">{client.name}</p>
                {client.company && (
                  <p className="text-xs text-ink-500 mt-0.5">{client.company}</p>
                )}
              </Link>
              <div className="mt-3 space-y-1.5">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-sm text-ink-700 hover:text-ink-900 break-all">
                    <Mail className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-ink-700 hover:text-ink-900">
                    <Phone className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
                    {client.phone}
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Site manager */}
          {project.siteManager && (
            <section className="card p-5">
              <h2 className="font-display font-bold text-ink-900 mb-2 inline-flex items-center gap-2">
                <HardHat className="w-4 h-4 text-ink-500" />
                Stavbyvedoucí
              </h2>
              <p className="text-sm text-ink-700">{project.siteManager}</p>
            </section>
          )}

          {/* Money quick view */}
          <section className="card p-5">
            <h2 className="font-display font-bold text-ink-900 mb-3 inline-flex items-center gap-2">
              <Wallet className="w-4 h-4 text-ink-500" />
              Finance
            </h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Rozpočet" value={<span className="font-bold tabular-nums">{formatCZK(project.budget)}</span>} />
              <Row label="Skutečné náklady" value={
                <span className={classNames(
                  'font-bold tabular-nums',
                  overBudget ? 'text-red-600' : 'text-ink-900'
                )}>
                  {formatCZK(project.actualCost)}
                </span>
              } />
              {approvedCOSum > 0 && (
                <Row label="Schválené vícepráce" value={
                  <span className="font-bold tabular-nums text-emerald-700">
                    + {formatCZK(approvedCOSum)}
                  </span>
                } />
              )}
              <Row label="Zaplaceno klientem" value={
                <span className="font-bold tabular-nums text-emerald-700">{formatCZK(paidSum)}</span>
              } />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Helpers ----------------------------- */

function MetricCard({ icon: Icon, label, value, footer, iconTone = 'slate', valueTone = 'ink' }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={classNames(
          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
          iconTone === 'red' && 'bg-red-50 text-red-600',
          iconTone === 'emerald' && 'bg-emerald-50 text-emerald-600',
          iconTone === 'slate' && 'bg-ink-100 text-ink-600',
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500">
          {label}
        </p>
      </div>
      <p className={classNames(
        'font-display text-xl md:text-2xl font-extrabold tabular-nums leading-none',
        valueTone === 'red' && 'text-red-600',
        valueTone === 'ink' && 'text-ink-900',
      )}>
        {value}
      </p>
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-ink-500 font-semibold uppercase tracking-wider">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}

function Alert({ tone = 'amber', icon: Icon, title, action, onAction }) {
  return (
    <div className={classNames(
      'rounded-xl border px-4 py-3 flex items-center gap-3',
      tone === 'red' && 'bg-red-50 border-red-200',
      tone === 'amber' && 'bg-amber-50 border-amber-200',
    )}>
      <div className={classNames(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        tone === 'red' && 'bg-red-100 text-red-600',
        tone === 'amber' && 'bg-amber-100 text-amber-700',
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <p className={classNames(
        'text-sm font-semibold flex-1',
        tone === 'red' && 'text-red-900',
        tone === 'amber' && 'text-amber-900',
      )}>
        {title}
      </p>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className={classNames(
            'btn text-xs py-1.5 min-h-0 whitespace-nowrap',
            tone === 'red' && 'bg-red-600 text-white hover:bg-red-700 border-red-600',
            tone === 'amber' && 'bg-amber-500 text-white hover:bg-amber-600 border-amber-500',
          )}
        >
          {action}
        </button>
      )}
    </div>
  );
}

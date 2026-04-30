import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Trash2, MapPin, Calendar, User, Wallet,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, HardHat,
  ChevronRight, Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_STATUSES, DEFAULT_STAGES } from '../data/seed';
import {
  formatCZK, formatDate, formatDeadline, daysBetween, daysFromNow, classNames,
} from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ProjectFormModal from '../components/ProjectFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, getClient, deleteProject } = useApp();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

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
  const overBudget = project.actualCost > project.budget;
  const remaining = project.budget - project.actualCost;
  const budgetPct = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;
  const totalDays = daysBetween(project.startDate, project.endDate);
  const elapsedDays = Math.max(0, daysBetween(project.startDate, new Date().toISOString()));
  const timeProgress = totalDays > 0 ? Math.min(100, (elapsedDays / totalDays) * 100) : 0;

  const handleDelete = () => {
    deleteProject(project.id);
    navigate('/projekty');
  };

  return (
    <>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/projekty" className="hover:text-ink-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Projekty
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink-700 font-mono text-xs">{project.code}</span>
          </>
        }
        title={project.name}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
            <span className="text-ink-500">·</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {project.address}
            </span>
          </span>
        }
        actions={
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
              aria-label="Smazat projekt"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Smazat</span>
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto space-y-6">
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
            footer={
              <p className="text-xs text-ink-600 truncate">
                {formatDate(project.deadline)}
              </p>
            }
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stages + budget */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stages */}
            <section className="card overflow-hidden">
              <header className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                <h2 className="font-display font-bold text-ink-900">Etapy projektu</h2>
                <span className="text-xs text-ink-500 font-mono tabular-nums">
                  {project.stages?.filter((s) => s.progress >= 100).length || 0} / {project.stages?.length || 0} dokončeno
                </span>
              </header>

              {project.stages?.length ? (
                <ol className="divide-y divide-ink-100">
                  {project.stages.map((stage, idx) => {
                    const def = DEFAULT_STAGES.find((d) => d.key === stage.key);
                    const stageOver = stage.actualCost > stage.budget;
                    const stageBudgetPct = stage.budget > 0 ? (stage.actualCost / stage.budget) * 100 : 0;
                    const isComplete = stage.progress >= 100;
                    const isActive = stage.progress > 0 && stage.progress < 100;

                    return (
                      <li key={stage.id} className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Step indicator */}
                          <div className="flex flex-col items-center pt-1">
                            <div className={classNames(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              isComplete && 'bg-emerald-500 text-white',
                              isActive && 'bg-accent-400 text-ink-900',
                              !isActive && !isComplete && 'bg-ink-100 text-ink-500',
                            )}>
                              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-ink-900">{stage.label}</h3>
                              {isComplete && <Badge color="emerald">Hotovo</Badge>}
                              {isActive && <Badge color="amber">Probíhá</Badge>}
                              {stageOver && <Badge color="red">+ rozpočet</Badge>}
                            </div>

                            {(stage.startDate || stage.endDate) && (
                              <p className="text-xs text-ink-500 mb-3">
                                {formatDate(stage.startDate)} → {formatDate(stage.endDate)}
                              </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-ink-500 font-semibold uppercase tracking-wider">Postup</span>
                                  <span className="font-mono tabular-nums font-bold">{stage.progress}%</span>
                                </div>
                                <ProgressBar value={stage.progress} size="sm" />
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-ink-500 font-semibold uppercase tracking-wider">Rozpočet</span>
                                  <span className={classNames(
                                    'font-mono tabular-nums font-bold',
                                    stageOver && 'text-red-600'
                                  )}>
                                    {Math.round(stageBudgetPct)} %
                                  </span>
                                </div>
                                <p className="text-xs text-ink-700 tabular-nums">
                                  {formatCZK(stage.actualCost, { compact: true })}
                                  <span className="text-ink-400"> / {formatCZK(stage.budget, { compact: true })}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <EmptyState
                  icon={HardHat}
                  title="Zatím bez etap"
                  description="Detailní správa etap přijde s dalším modulem."
                  className="py-10"
                />
              )}
            </section>

            {/* Budget overview */}
            <section className="card p-5">
              <header className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-ink-900">Rozpočet vs. skutečnost</h2>
                {overBudget && <Badge color="red" icon={AlertTriangle}>Přečerpáno</Badge>}
              </header>

              <div className="space-y-4">
                {/* Budget bar */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-ink-500">
                      Náklady
                    </span>
                    <div className="text-right">
                      <span className={classNames(
                        'font-display font-bold text-lg tabular-nums',
                        overBudget ? 'text-red-600' : 'text-ink-900'
                      )}>
                        {formatCZK(project.actualCost)}
                      </span>
                      <span className="text-ink-400 text-sm"> / {formatCZK(project.budget)}</span>
                    </div>
                  </div>
                  <div className="relative h-3 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className={classNames(
                        'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                        overBudget ? 'bg-red-500' : budgetPct >= 90 ? 'bg-accent-400' : 'bg-ink-900'
                      )}
                      style={{ width: `${Math.min(100, budgetPct)}%` }}
                    />
                    {overBudget && (
                      <div
                        className="absolute inset-y-0 bg-red-300 rounded-r-full"
                        style={{
                          left: '100%',
                          width: `${Math.min(20, budgetPct - 100)}%`,
                          transform: 'translateX(0)',
                        }}
                      />
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-ink-500">
                    {overBudget ? (
                      <>Překročení o <span className="font-bold text-red-600">{formatCZK(Math.abs(remaining))}</span></>
                    ) : (
                      <>Zbývá <span className="font-bold text-ink-900">{formatCZK(remaining)}</span> ({Math.round(100 - budgetPct)} %)</>
                    )}
                  </p>
                </div>

                {/* Time progress comparison */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-ink-500">
                      Čas vs. postup
                    </span>
                    <span className="text-xs text-ink-600 tabular-nums">
                      {Math.round(timeProgress)}% času · {project.progress}% postup
                    </span>
                  </div>
                  <div className="relative h-3 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-ink-300 rounded-full"
                      style={{ width: `${timeProgress}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-500/80 rounded-full mix-blend-multiply"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-500">
                    {project.progress >= timeProgress
                      ? <>V plánu nebo <span className="font-bold text-emerald-600">napřed</span></>
                      : <>Postup zaostává za <span className="font-bold text-accent-700">časovým plánem</span></>}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Sidebar info */}
          <aside className="space-y-6">
            {/* Client */}
            {client && (
              <section className="card p-5">
                <header className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Klient
                  </h3>
                  <Link to={`/klienti/${client.id}`} className="text-xs font-semibold text-ink-600 hover:text-ink-900">
                    Detail →
                  </Link>
                </header>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-ink-900 text-accent-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 truncate">{client.name}</p>
                    {client.company && (
                      <p className="text-xs text-ink-500 truncate">{client.company}</p>
                    )}
                    <p className="mt-2 text-xs text-ink-600 truncate">{client.email}</p>
                    <p className="text-xs text-ink-600 font-mono">{client.phone}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Project info */}
            <section className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                Detaily
              </h3>
              <dl className="space-y-3 text-sm">
                <InfoRow icon={Calendar} label="Začátek" value={formatDate(project.startDate)} />
                <InfoRow icon={Calendar} label="Konec" value={formatDate(project.endDate)} />
                <InfoRow icon={Clock} label="Termín" value={formatDate(project.deadline)} />
                {project.siteManager && (
                  <InfoRow icon={User} label="Stavbyvedoucí" value={project.siteManager} />
                )}
                <InfoRow
                  icon={Building2}
                  label="Doba"
                  value={`${totalDays} dní`}
                />
              </dl>
            </section>

            {/* Description */}
            {project.description && (
              <section className="card p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                  Popis
                </h3>
                <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </section>
            )}
          </aside>
        </div>
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
        description={`Projekt "${project.name}" bude trvale odstraněn. Tuto akci nelze vrátit zpět.`}
        confirmLabel="Smazat projekt"
        danger
      />
    </>
  );
}

function MetricCard({ icon: Icon, label, value, footer, iconTone = 'ink', valueTone = 'ink' }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={classNames(
          'w-9 h-9 rounded-lg flex items-center justify-center',
          iconTone === 'red' && 'bg-red-50 text-red-600',
          iconTone === 'emerald' && 'bg-emerald-50 text-emerald-600',
          iconTone === 'ink' && 'bg-ink-900 text-accent-400',
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="stat-label">{label}</p>
      <p className={classNames(
        'stat-value mt-1',
        valueTone === 'red' && '!text-red-600'
      )}>
        {value}
      </p>
      <div className="mt-2">{footer}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-ink-500 text-xs uppercase tracking-wider font-semibold">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-ink-900 font-medium text-right">{value}</span>
    </div>
  );
}

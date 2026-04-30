import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, FolderKanban, MapPin, Calendar, Wallet,
  ArrowUpRight, Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_STATUSES } from '../data/seed';
import {
  formatCZK, formatDate, daysFromNow, classNames,
} from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ProjectFormModal from '../components/ProjectFormModal';

export default function Projects() {
  const { projects, clients } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter((p) => {
      if (status !== 'all' && p.status !== status) return false;
      if (!q) return true;
      const client = clients.find((c) => c.id === p.clientId);
      const haystack = [
        p.name, p.code, p.address, p.description, p.siteManager, client?.name,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, clients, search, status]);

  const counts = useMemo(() => {
    const c = { all: projects.length };
    Object.keys(PROJECT_STATUSES).forEach((key) => {
      c[key] = projects.filter((p) => p.status === key).length;
    });
    return c;
  }, [projects]);

  return (
    <>
      <PageHeader
        title="Projekty"
        subtitle="Všechny stavební projekty, jejich stav, rozpočet a postup."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nový projekt
          </button>
        }
      />

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {/* Filter bar */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat podle názvu, kódu, adresy nebo klienta…"
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scroll-thin -mx-1 px-1 pb-1">
            <FilterPill active={status === 'all'} onClick={() => setStatus('all')} count={counts.all}>
              Vše
            </FilterPill>
            {Object.entries(PROJECT_STATUSES).map(([key, s]) => (
              <FilterPill
                key={key}
                active={status === key}
                onClick={() => setStatus(key)}
                count={counts[key] || 0}
              >
                {s.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div className="mt-5 mb-3 flex items-center justify-between">
          <p className="text-sm text-ink-600">
            <span className="font-semibold text-ink-900 tabular-nums">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'projekt' : filtered.length >= 2 && filtered.length <= 4 ? 'projekty' : 'projektů'}
          </p>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FolderKanban}
              title={search || status !== 'all' ? 'Nic nenalezeno' : 'Zatím žádný projekt'}
              description={
                search || status !== 'all'
                  ? 'Zkuste změnit hledaný výraz nebo filtr.'
                  : 'Začněte založením prvního projektu.'
              }
              action={
                !search && status === 'all' && (
                  <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus className="w-4 h-4" /> Nový projekt
                  </button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} clients={clients} />
            ))}
          </div>
        )}
      </div>

      <ProjectFormModal open={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}

function FilterPill({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap border',
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50 hover:border-ink-300'
      )}
    >
      {children}
      {count !== undefined && (
        <span className={classNames(
          'tabular-nums px-1.5 py-0.5 rounded-md text-[10px] font-mono',
          active ? 'bg-white/15 text-white' : 'bg-ink-100 text-ink-600'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

function ProjectCard({ project, clients }) {
  const client = clients.find((c) => c.id === project.clientId);
  const status = PROJECT_STATUSES[project.status];
  const overBudget = project.actualCost > project.budget;
  const remainingDays = daysFromNow(project.deadline);
  const budgetPct = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0;

  return (
    <Link
      to={`/projekty/${project.id}`}
      className="card card-hover p-5 flex flex-col group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              {project.code}
            </span>
            <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
          </div>
          <h3 className="font-display text-base font-bold text-ink-900 leading-tight line-clamp-2 group-hover:text-ink-700">
            {project.name}
          </h3>
        </div>
        <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      {/* Meta */}
      <dl className="space-y-1.5 text-xs text-ink-600 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-ink-400" />
          <span className="truncate">{project.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-ink-400" />
          <span>
            {formatDate(project.startDate)} → {formatDate(project.deadline)}
            {remainingDays !== null && project.status === 'active' && (
              <span className={classNames(
                'ml-2 font-semibold',
                remainingDays < 0 ? 'text-red-600' : remainingDays <= 14 ? 'text-accent-700' : 'text-ink-500'
              )}>
                {remainingDays < 0 ? `Po termínu` : remainingDays === 0 ? 'Dnes' : `Za ${remainingDays} d.`}
              </span>
            )}
          </span>
        </div>
        {client && (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-ink-200 flex-shrink-0" />
            <span className="truncate">{client.name}</span>
          </div>
        )}
      </dl>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">
            Postup
          </span>
          <span className="text-sm font-mono tabular-nums font-bold text-ink-900">
            {project.progress}%
          </span>
        </div>
        <ProgressBar value={project.progress} size="sm" />
      </div>

      {/* Budget */}
      <div className="pt-3 border-t border-ink-100 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">
            Skutečné / rozpočet
          </p>
          <p className="font-display text-sm font-bold tabular-nums mt-0.5">
            <span className={overBudget ? 'text-red-600' : 'text-ink-900'}>
              {formatCZK(project.actualCost, { compact: true })}
            </span>
            <span className="text-ink-400 font-normal"> / {formatCZK(project.budget, { compact: true })}</span>
          </p>
        </div>
        <div className={classNames(
          'text-xs font-mono tabular-nums font-bold px-2 py-1 rounded',
          overBudget ? 'bg-red-50 text-red-700' :
          budgetPct >= 90 ? 'bg-accent-50 text-accent-700' :
          'bg-ink-100 text-ink-600'
        )}>
          {Math.round(budgetPct)} %
        </div>
      </div>
    </Link>
  );
}

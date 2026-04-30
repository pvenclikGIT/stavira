import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Plus, ArrowUpRight, ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, classNames } from '../utils/format';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import DiaryEntryFormModal from '../components/DiaryEntryFormModal';

export default function DiaryPage() {
  const { visibleProjects, diaryEntries, isClient } = useApp();
  const [filterProjectId, setFilterProjectId] = useState('all');
  const [creating, setCreating] = useState(false);
  const [createForProject, setCreateForProject] = useState(null);

  const visibleProjectIds = visibleProjects.map((p) => p.id);

  const filtered = useMemo(() => {
    return diaryEntries
      .filter((d) => visibleProjectIds.includes(d.projectId))
      .filter((d) => filterProjectId === 'all' || d.projectId === filterProjectId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [diaryEntries, visibleProjectIds, filterProjectId]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((entry) => {
      if (!map.has(entry.date)) map.set(entry.date, []);
      map.get(entry.date).push(entry);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const today = new Date().toISOString().slice(0, 10);
  const activeProjects = visibleProjects.filter((p) => p.status === 'active');

  // Quick "needs entry today" — projects without diary today
  const needsEntryToday = activeProjects.filter((p) => {
    return !diaryEntries.some((d) => d.projectId === p.id && d.date === today);
  });

  return (
    <>
      <PageHeader
        title="Stavební deník"
        subtitle="Záznamy ze všech vašich staveb."
      />

      <div className="px-4 md:px-8 py-5 max-w-4xl mx-auto space-y-5">

        {/* Quick: which projects still need entry today */}
        {!isClient && needsEntryToday.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-ink-700 mb-2">
              Dnes ještě nezapsáno · {needsEntryToday.length}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {needsEntryToday.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setCreateForProject(p.id); setCreating(true); }}
                  className="card card-hover p-3 flex items-center gap-3 text-left border-amber-200 bg-amber-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-200/60 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 truncate text-sm">{p.name.split(' — ')[0] || p.name}</p>
                    <p className="text-xs text-amber-800 mt-0.5">Zapsat dnešní den</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Project filter */}
        {visibleProjects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto scroll-thin -mx-1 px-1 pb-1">
            <FilterPill active={filterProjectId === 'all'} onClick={() => setFilterProjectId('all')}>
              Všechny stavby
            </FilterPill>
            {visibleProjects.map((p) => (
              <FilterPill
                key={p.id}
                active={filterProjectId === p.id}
                onClick={() => setFilterProjectId(p.id)}
              >
                {p.name.split(' — ')[0]}
              </FilterPill>
            ))}
          </div>
        )}

        {/* Entries grouped by date */}
        {grouped.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title="Žádné záznamy"
              description={isClient
                ? 'Stavbyvedoucí zatím nezapsal žádné záznamy.'
                : 'Začněte zapisovat denní průběh stavby.'}
              className="py-16"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, dayEntries]) => (
              <DateGroup
                key={date}
                date={date}
                entries={dayEntries}
                projects={visibleProjects}
                isToday={date === today}
              />
            ))}
          </div>
        )}
      </div>

      <DiaryEntryFormModal
        open={creating}
        onClose={() => { setCreating(false); setCreateForProject(null); }}
        projectId={createForProject}
      />
    </>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap border',
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
      )}
    >
      {children}
    </button>
  );
}

function DateGroup({ date, entries, projects, isToday }) {
  const d = new Date(date);
  return (
    <section>
      <header className="flex items-baseline justify-between mb-2 px-1">
        <h2 className="font-display font-bold text-ink-900">
          {d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          {isToday && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-400 text-ink-900">
              DNES
            </span>
          )}
        </h2>
        <span className="text-xs text-ink-500 tabular-nums">{entries.length}</span>
      </header>
      <div className="space-y-2">
        {entries.map((entry) => {
          const project = projects.find((p) => p.id === entry.projectId);
          return (
            <Link
              key={entry.id}
              to={`/projekty/${entry.projectId}`}
              className="card card-hover p-4 block group"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink-900 text-sm truncate">
                      {project?.name.split(' — ')[0] || 'Projekt'}
                    </p>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed line-clamp-2">
                    {entry.workDone}
                  </p>
                  <p className="text-xs text-ink-500 mt-1.5">{entry.authorName}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

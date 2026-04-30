import { useState, useMemo } from 'react';
import {
  Plus, Edit3, Trash2, FileText, Check, X as XIcon,
  Send, Link2, AlertCircle, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHANGE_ORDER_STATUSES } from '../data/seed';
import { formatCZK, formatDate, classNames } from '../utils/format';
import Badge from './Badge';
import EmptyState from './EmptyState';
import ChangeOrderFormModal from './ChangeOrderFormModal';
import ConfirmDialog from './ConfirmDialog';

export default function ChangeOrdersTab({ project }) {
  const {
    changeOrdersForProject, findingsForProject,
    deleteChangeOrder, decideChangeOrder, updateChangeOrder,
  } = useApp();

  const changeOrders = changeOrdersForProject(project.id);
  const findings = findingsForProject(project.id);

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filter, setFilter] = useState('all');

  const sorted = useMemo(() => {
    return [...changeOrders].sort((a, b) => {
      // pending first, then by requested date desc
      const order = { pending: 0, proposed: 1, approved: 2, rejected: 3 };
      const oa = order[a.status] ?? 9;
      const ob = order[b.status] ?? 9;
      if (oa !== ob) return oa - ob;
      return (a.requestedDate || '') < (b.requestedDate || '') ? 1 : -1;
    });
  }, [changeOrders]);

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted;
    return sorted.filter((c) => c.status === filter);
  }, [sorted, filter]);

  const totals = useMemo(() => {
    const sum = (arr) => arr.reduce((s, c) => s + (c.amount || 0), 0);
    return {
      approved: sum(changeOrders.filter((c) => c.status === 'approved')),
      pending: sum(changeOrders.filter((c) => c.status === 'pending')),
      proposed: sum(changeOrders.filter((c) => c.status === 'proposed')),
      rejected: sum(changeOrders.filter((c) => c.status === 'rejected')),
      total: sum(changeOrders.filter((c) => c.status !== 'rejected')),
    };
  }, [changeOrders]);

  const counts = {
    all: changeOrders.length,
    proposed: changeOrders.filter((c) => c.status === 'proposed').length,
    pending: changeOrders.filter((c) => c.status === 'pending').length,
    approved: changeOrders.filter((c) => c.status === 'approved').length,
    rejected: changeOrders.filter((c) => c.status === 'rejected').length,
  };

  const newBudget = project.budget + totals.approved;
  const approvedPct = project.budget > 0 ? (totals.approved / project.budget) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBlock label="Schváleno" value={formatCZK(totals.approved, { compact: true })} sub={`+${approvedPct.toFixed(1)} % rozpočtu`} tone="emerald" />
        <StatBlock label="Ke schválení" value={formatCZK(totals.pending, { compact: true })} sub={`${counts.pending} VP`} tone={totals.pending > 0 ? 'amber' : 'slate'} />
        <StatBlock label="Návrhy" value={formatCZK(totals.proposed, { compact: true })} sub={`${counts.proposed} VP`} />
        <StatBlock label="Nový rozpočet" value={formatCZK(newBudget, { compact: true })} sub="vč. schválených VP" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin -mx-1 px-1">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all}>
            Vše
          </FilterPill>
          {Object.entries(CHANGE_ORDER_STATUSES).map(([key, s]) => (
            <FilterPill
              key={key}
              active={filter === key}
              onClick={() => setFilter(key)}
              count={counts[key]}
            >
              {s.label}
            </FilterPill>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nová vícepráce
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={changeOrders.length === 0 ? 'Žádné vícepráce' : 'V této kategorii nic není'}
            description={
              changeOrders.length === 0
                ? 'Když během stavby narazíte na něco, co není v původním rozpočtu, zaznamenejte to zde a nechte schválit klientem.'
                : 'Zkuste jiný filtr.'
            }
            action={
              changeOrders.length === 0 && (
                <button onClick={() => setCreating(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" /> Nová vícepráce
                </button>
              )
            }
            className="py-12"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((co) => (
            <ChangeOrderCard
              key={co.id}
              changeOrder={co}
              finding={findings.find((f) => f.id === co.findingId)}
              onEdit={() => setEditing(co)}
              onDelete={() => setConfirmDelete(co)}
              onApprove={() => decideChangeOrder(co.id, 'approved', co.clientNote)}
              onReject={() => decideChangeOrder(co.id, 'rejected', co.clientNote)}
              onSend={() => updateChangeOrder(co.id, { status: 'pending' })}
            />
          ))}
        </div>
      )}

      <ChangeOrderFormModal
        open={creating}
        onClose={() => setCreating(false)}
        projectId={project.id}
      />
      <ChangeOrderFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        projectId={project.id}
        changeOrder={editing}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteChangeOrder(confirmDelete.id)}
        title="Smazat vícepráci?"
        description={`${confirmDelete?.number} — ${confirmDelete?.title} bude trvale odstraněna.`}
        confirmLabel="Smazat"
        danger
      />
    </div>
  );
}

function ChangeOrderCard({ changeOrder: co, finding, onEdit, onDelete, onApprove, onReject, onSend }) {
  const status = CHANGE_ORDER_STATUSES[co.status];

  const statusIcon =
    co.status === 'approved' ? Check :
    co.status === 'rejected' ? XIcon :
    co.status === 'pending'  ? Clock :
    AlertCircle;

  return (
    <article className={classNames(
      'card overflow-hidden border',
      co.status === 'pending' && 'border-amber-200 ring-1 ring-amber-100',
      co.status !== 'pending' && 'border-ink-200',
    )}>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="font-mono text-xs font-bold text-ink-700">{co.number}</span>
              <Badge color={status?.color || 'slate'} icon={statusIcon}>{status?.label}</Badge>
              {finding && (
                <Badge color="blue" icon={Link2}>z nálezu</Badge>
              )}
            </div>
            <h3 className="font-display text-base md:text-lg font-bold text-ink-900 leading-tight">
              {co.title}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display text-lg md:text-xl font-extrabold tabular-nums text-ink-900">
              {formatCZK(co.amount)}
            </p>
          </div>
        </div>

        {co.description && (
          <p className="text-sm text-ink-700 mb-3 leading-relaxed whitespace-pre-line">
            {co.description}
          </p>
        )}

        {finding && (
          <div className="mt-2 mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-900">
            <p className="font-semibold mb-0.5 inline-flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              Souvisí s nálezem:
            </p>
            <p>{finding.title}</p>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap text-xs text-ink-500">
          <span>Vytvořeno {formatDate(co.requestedDate)}</span>
          {co.decidedDate && (
            <span>· Rozhodnuto {formatDate(co.decidedDate)}</span>
          )}
        </div>

        {co.clientNote && (
          <div className="mt-3 p-3 rounded-lg bg-ink-50 border-l-2 border-ink-300">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1">Vyjádření klienta</p>
            <p className="text-sm text-ink-700 italic">„{co.clientNote}"</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 md:px-5 py-3 bg-ink-50/50 border-t border-ink-100 flex items-center gap-2 flex-wrap justify-end">
        {co.status === 'proposed' && (
          <button type="button" onClick={onSend} className="btn btn-outline text-xs py-1.5 min-h-0">
            <Send className="w-3.5 h-3.5" />
            Odeslat ke schválení
          </button>
        )}
        {co.status === 'pending' && (
          <>
            <button
              type="button"
              onClick={onReject}
              className="btn btn-ghost text-xs py-1.5 min-h-0 text-red-600 hover:bg-red-50"
            >
              <XIcon className="w-3.5 h-3.5" />
              Zamítnout
            </button>
            <button
              type="button"
              onClick={onApprove}
              className="btn text-xs py-1.5 min-h-0 bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
            >
              <Check className="w-3.5 h-3.5" />
              Schválit
            </button>
          </>
        )}
        <button type="button" onClick={onEdit} className="btn btn-ghost text-xs py-1.5 min-h-0">
          <Edit3 className="w-3.5 h-3.5" />
          Upravit
        </button>
        <button type="button" onClick={onDelete} className="btn btn-danger text-xs py-1.5 min-h-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

function FilterPill({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap border',
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
      )}
    >
      {children}
      {count !== undefined && (
        <span className={classNames(
          'tabular-nums px-1 py-0.5 rounded text-[10px] font-mono',
          active ? 'bg-white/15' : 'bg-ink-100 text-ink-600'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatBlock({ label, value, sub, tone = 'slate' }) {
  return (
    <div className="card p-3 md:p-4">
      <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500">{label}</p>
      <p className={classNames(
        'font-display text-lg md:text-xl font-extrabold tabular-nums mt-1',
        tone === 'emerald' && 'text-emerald-700',
        tone === 'amber' && 'text-accent-700',
        tone === 'slate' && 'text-ink-900',
      )}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-ink-500 mt-0.5">{sub}</p>}
    </div>
  );
}

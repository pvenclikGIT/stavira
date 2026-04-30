import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, AlertTriangle, ArrowUpRight,
  Link2, ShieldAlert, Eye, CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FINDING_SEVERITY, FINDING_STATUSES } from '../data/seed';
import { formatDate, classNames } from '../utils/format';
import Badge from './Badge';
import EmptyState from './EmptyState';
import FindingFormModal from './FindingFormModal';
import ConfirmDialog from './ConfirmDialog';
import Modal from './Modal';

export default function FindingsTab({ project }) {
  const {
    findingsForProject, changeOrdersForProject,
    deleteFinding, promoteFindingToChangeOrder,
  } = useApp();

  const findings = findingsForProject(project.id);
  const changeOrders = changeOrdersForProject(project.id);

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [promoting, setPromoting] = useState(null);

  const sorted = useMemo(() => {
    return [...findings].sort((a, b) => {
      const sevOrder = { high: 0, medium: 1, low: 2 };
      const sa = sevOrder[a.severity] ?? 9;
      const sb = sevOrder[b.severity] ?? 9;
      if (sa !== sb) return sa - sb;
      return (a.foundDate || '') < (b.foundDate || '') ? 1 : -1;
    });
  }, [findings]);

  const counts = {
    high: findings.filter((f) => f.severity === 'high').length,
    open: findings.filter((f) => f.status === 'open').length,
    documented: findings.filter((f) => f.status === 'documented').length,
    resolved: findings.filter((f) => f.status === 'resolved').length,
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBlock
          label="Celkem nálezů"
          value={findings.length}
          icon={ShieldAlert}
        />
        <StatBlock
          label="Vysoká závažnost"
          value={counts.high}
          icon={AlertTriangle}
          tone={counts.high > 0 ? 'red' : 'slate'}
        />
        <StatBlock
          label="Neřešeno"
          value={counts.open}
          icon={Eye}
          tone={counts.open > 0 ? 'amber' : 'slate'}
        />
        <StatBlock
          label="Vyřešeno"
          value={counts.resolved}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-bold text-ink-900">Nálezy a skryté vady</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Vše, co se objevilo až během stavby a nebylo v původním projektu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nový nález
        </button>
      </div>

      {/* List */}
      {sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ShieldAlert}
            title="Zatím žádné nálezy"
            description="Při bourání nebo demolicích se mohou objevit skryté vady (vlhké zdivo, dřevomorka, poddimenzované konstrukce). Zaznamenejte je sem — pomůže to s reklamacemi a navíc se z nich snadno vytvoří vícepráce."
            action={
              <button onClick={() => setCreating(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Nový nález
              </button>
            }
            className="py-12"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              project={project}
              linkedCO={changeOrders.find((c) => c.id === f.changeOrderId)}
              onEdit={() => setEditing(f)}
              onDelete={() => setConfirmDelete(f)}
              onPromote={() => setPromoting(f)}
            />
          ))}
        </div>
      )}

      <FindingFormModal
        open={creating}
        onClose={() => setCreating(false)}
        projectId={project.id}
        project={project}
      />
      <FindingFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        projectId={project.id}
        project={project}
        finding={editing}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteFinding(confirmDelete.id)}
        title="Smazat nález?"
        description={`Nález „${confirmDelete?.title}" bude trvale odstraněn.`}
        confirmLabel="Smazat"
        danger
      />
      <PromoteToChangeOrderModal
        open={!!promoting}
        onClose={() => setPromoting(null)}
        finding={promoting}
        onPromote={(data) => {
          promoteFindingToChangeOrder(promoting.id, data);
          setPromoting(null);
        }}
      />
    </div>
  );
}

function FindingCard({ finding, project, linkedCO, onEdit, onDelete, onPromote }) {
  const severity = FINDING_SEVERITY[finding.severity];
  const status = FINDING_STATUSES[finding.status];
  const stage = project.stages?.find((s) => s.key === finding.stageKey);

  return (
    <article className={classNames(
      'card overflow-hidden border',
      finding.severity === 'high' && finding.status !== 'resolved' && 'border-red-200',
      !(finding.severity === 'high' && finding.status !== 'resolved') && 'border-ink-200',
    )}>
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge color={severity?.color || 'slate'} icon={AlertTriangle}>
                {severity?.label}
              </Badge>
              <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
              {linkedCO && (
                <Badge color="blue" icon={Link2}>{linkedCO.number}</Badge>
              )}
            </div>
            <h3 className="font-display text-base md:text-lg font-bold text-ink-900 leading-tight">
              {finding.title}
            </h3>
          </div>
        </div>

        {finding.description && (
          <p className="text-sm text-ink-700 mb-3 leading-relaxed whitespace-pre-line">
            {finding.description}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap text-xs text-ink-500">
          <span>Zjištěno {formatDate(finding.foundDate)}</span>
          {stage && <span>· Etapa: {stage.label}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 md:px-5 py-3 bg-ink-50/50 border-t border-ink-100 flex items-center gap-2 flex-wrap justify-end">
        {!linkedCO && (
          <button
            type="button"
            onClick={onPromote}
            className="btn btn-outline text-xs py-1.5 min-h-0 border-accent-400 text-ink-900 hover:bg-accent-50"
            title="Vytvořit vícepráci na základě tohoto nálezu"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Vytvořit vícepráci
          </button>
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

function PromoteToChangeOrderModal({ open, onClose, finding, onPromote }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Reset on open
  useEffect(() => {
    if (open && finding) {
      setTitle(`Řešení: ${finding.title}`);
      setDescription(finding.description || '');
      setAmount('');
      setError('');
    }
  }, [open, finding]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!title.trim()) { setError('Vyplňte název'); return; }
    if (!amount || Number(amount) <= 0) { setError('Zadejte kladnou částku'); return; }
    onPromote({ title: title.trim(), description: description.trim(), amount: Number(amount) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Vytvořit vícepráci z nálezu"
      description="Vícepráce bude propojena s nálezem a odeslána ke schválení klientem."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="promote-form" className="btn btn-primary">
            Vytvořit vícepráci
          </button>
        </>
      }
    >
      <form id="promote-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Název víceprací *</label>
          <input
            type="text" className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Popis prací</label>
          <textarea
            rows={4} className="input resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Částka (Kč) *</label>
          <input
            type="number" min="0" step="1000"
            className="input font-mono tabular-nums"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="např. 145 000"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

function StatBlock({ label, value, sub, tone = 'slate', icon: Icon }) {
  return (
    <div className="card p-3 md:p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500">{label}</p>
        {Icon && (
          <Icon className={classNames(
            'w-4 h-4',
            tone === 'red' && 'text-red-500',
            tone === 'amber' && 'text-amber-500',
            tone === 'emerald' && 'text-emerald-500',
            tone === 'slate' && 'text-ink-400',
          )} />
        )}
      </div>
      <p className={classNames(
        'font-display text-xl md:text-2xl font-extrabold tabular-nums',
        tone === 'red' && 'text-red-700',
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

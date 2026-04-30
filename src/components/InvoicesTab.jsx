import { useState, useMemo } from 'react';
import {
  Plus, Edit3, Trash2, Receipt, Check, AlertTriangle,
  CalendarDays, Send, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INVOICE_TYPES, INVOICE_STATUSES } from '../data/seed';
import { formatCZK, formatDate, daysFromNow, classNames } from '../utils/format';
import Badge from './Badge';
import EmptyState from './EmptyState';
import InvoiceFormModal from './InvoiceFormModal';
import ConfirmDialog from './ConfirmDialog';

export default function InvoicesTab({ project }) {
  const { invoicesForProject, deleteInvoice, updateInvoice } = useApp();
  const invoices = invoicesForProject(project.id);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Compute auto-overdue (sent + dueDate < today and not paid)
  const sortedInvoices = useMemo(() => {
    return [...invoices]
      .map((inv) => {
        if (inv.status === 'sent' && inv.dueDate) {
          const days = daysFromNow(inv.dueDate);
          if (days !== null && days < 0) {
            return { ...inv, status: 'overdue', _autoOverdue: true };
          }
        }
        return inv;
      })
      .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
  }, [invoices]);

  // Stats
  const totals = useMemo(() => {
    const sum = (arr) => arr.reduce((s, i) => s + (i.amount || 0), 0);
    const paid = sum(invoices.filter((i) => i.status === 'paid'));
    const pending = sum(invoices.filter((i) => i.status === 'sent' || i.status === 'overdue'));
    const draft = sum(invoices.filter((i) => i.status === 'draft'));
    const total = sum(invoices);
    const remainingFromBudget = Math.max(0, project.budget - paid - pending);
    return { paid, pending, draft, total, remainingFromBudget };
  }, [invoices, project.budget]);

  const paidPct = project.budget > 0 ? (totals.paid / project.budget) * 100 : 0;

  const markPaid = (inv) => {
    updateInvoice(inv.id, {
      status: 'paid',
      paidDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBlock label="Vyfakturováno" value={formatCZK(totals.total, { compact: true })} sub={`${invoices.length} faktur`} />
        <StatBlock label="Zaplaceno" value={formatCZK(totals.paid, { compact: true })} sub={`${Math.round(paidPct)} % rozpočtu`} tone="emerald" />
        <StatBlock label="Čeká na platbu" value={formatCZK(totals.pending, { compact: true })} tone={totals.pending > 0 ? 'amber' : 'slate'} />
        <StatBlock label="Zbývá vyfakturovat" value={formatCZK(totals.remainingFromBudget, { compact: true })} sub="z rozpočtu" />
      </div>

      {/* Cashflow bar */}
      <div className="card p-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-ink-500">Stav fakturace</span>
          <span className="text-xs text-ink-600 tabular-nums">
            {formatCZK(totals.paid + totals.pending, { compact: true })} / {formatCZK(project.budget, { compact: true })}
          </span>
        </div>
        <div className="relative h-3 bg-ink-100 rounded-full overflow-hidden">
          {project.budget > 0 && (
            <>
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500"
                style={{ width: `${Math.min(100, (totals.paid / project.budget) * 100)}%` }}
              />
              <div
                className="absolute inset-y-0 bg-amber-400"
                style={{
                  left: `${Math.min(100, (totals.paid / project.budget) * 100)}%`,
                  width: `${Math.min(100, (totals.pending / project.budget) * 100)}%`,
                }}
              />
            </>
          )}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <Legend color="bg-emerald-500" label="Zaplaceno" />
          <Legend color="bg-amber-400" label="Čeká" />
          <Legend color="bg-ink-100" label="Zbývá" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display font-bold text-ink-900">Faktury</h3>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nová faktura
        </button>
      </div>

      {/* Invoices list */}
      {sortedInvoices.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Receipt}
            title="Žádné faktury"
            description="Začněte vystavením zálohové faktury na 30 % rozpočtu."
            action={
              <button onClick={() => setCreating(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Nová faktura
              </button>
            }
            className="py-12"
          />
        </div>
      ) : (
        <div className="card divide-y divide-ink-100 overflow-hidden">
          {sortedInvoices.map((inv) => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onEdit={() => setEditing(inv)}
              onDelete={() => setConfirmDelete(inv)}
              onMarkPaid={() => markPaid(inv)}
            />
          ))}
        </div>
      )}

      <InvoiceFormModal
        open={creating}
        onClose={() => setCreating(false)}
        projectId={project.id}
        project={project}
      />
      <InvoiceFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        projectId={project.id}
        project={project}
        invoice={editing}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteInvoice(confirmDelete.id)}
        title="Smazat fakturu?"
        description={`Faktura ${confirmDelete?.number} bude trvale odstraněna.`}
        confirmLabel="Smazat fakturu"
        danger
      />
    </div>
  );
}

function InvoiceRow({ invoice, onEdit, onDelete, onMarkPaid }) {
  const type = INVOICE_TYPES[invoice.type];
  const status = INVOICE_STATUSES[invoice.status];
  const dueDays = daysFromNow(invoice.dueDate);

  const statusIcon =
    invoice.status === 'paid' ? Check :
    invoice.status === 'overdue' ? AlertTriangle :
    invoice.status === 'sent' ? Send :
    Clock;

  return (
    <div className="p-4 hover:bg-ink-50/40 transition-colors">
      <div className="flex items-start gap-3 md:gap-4">
        <div className={classNames(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          invoice.status === 'paid' && 'bg-emerald-50 text-emerald-600',
          invoice.status === 'overdue' && 'bg-red-50 text-red-600',
          invoice.status === 'sent' && 'bg-amber-50 text-amber-600',
          invoice.status === 'draft' && 'bg-ink-100 text-ink-500',
        )}>
          <Receipt className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-ink-500 font-semibold">{invoice.number}</span>
            <Badge color={type?.color || 'slate'}>{type?.label}</Badge>
            <Badge color={status?.color || 'slate'} icon={statusIcon}>{status?.label}</Badge>
          </div>

          {invoice.label && (
            <p className="text-sm font-semibold text-ink-900 truncate">{invoice.label}</p>
          )}

          <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-ink-600">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-ink-400" />
              Vystaveno {formatDate(invoice.issueDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              Splatnost {formatDate(invoice.dueDate)}
              {invoice.status === 'overdue' && dueDays !== null && (
                <span className="text-red-600 font-bold ml-1">
                  ({Math.abs(dueDays)} d. po splatnosti)
                </span>
              )}
              {invoice.status === 'sent' && dueDays !== null && dueDays <= 7 && dueDays >= 0 && (
                <span className="text-amber-700 font-semibold ml-1">
                  ({dueDays === 0 ? 'dnes' : `za ${dueDays} d.`})
                </span>
              )}
            </span>
            {invoice.paidDate && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" />
                Zaplaceno {formatDate(invoice.paidDate)}
              </span>
            )}
          </div>

          {invoice.note && (
            <p className="mt-2 text-xs text-ink-600 italic">{invoice.note}</p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-display text-base md:text-lg font-bold tabular-nums text-ink-900">
            {formatCZK(invoice.amount)}
          </p>
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-1.5 flex-wrap justify-end">
        {invoice.status !== 'paid' && (
          <button
            type="button"
            onClick={onMarkPaid}
            className="btn btn-outline text-xs py-1.5 min-h-0 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
          >
            <Check className="w-3.5 h-3.5" />
            Označit jako zaplaceno
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
    </div>
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

function Legend({ color, label }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={classNames('w-3 h-3 rounded-sm', color)} />
      <span className="text-ink-600">{label}</span>
    </div>
  );
}

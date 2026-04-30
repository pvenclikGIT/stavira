import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { INVOICE_TYPES, INVOICE_STATUSES } from '../data/seed';
import { todayISO, formatCZK } from '../utils/format';

const emptyForm = {
  number: '',
  type: 'progress',
  amount: '',
  label: '',
  note: '',
  issueDate: todayISO(),
  dueDate: '',
  paidDate: '',
  status: 'draft',
};

const addDays = (iso, days) => {
  if (!iso) return '';
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function InvoiceFormModal({ open, onClose, projectId, project, invoice, onSaved }) {
  const { addInvoice, updateInvoice, invoicesForProject } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (invoice) {
        setForm({
          number: invoice.number || '',
          type: invoice.type || 'progress',
          amount: invoice.amount || '',
          label: invoice.label || '',
          note: invoice.note || '',
          issueDate: invoice.issueDate || todayISO(),
          dueDate: invoice.dueDate || '',
          paidDate: invoice.paidDate || '',
          status: invoice.status || 'draft',
        });
      } else {
        const issueDate = todayISO();
        const existing = project ? invoicesForProject(project.id) : [];
        const hasDeposit = existing.some((i) => i.type === 'deposit');
        const defaultType = !hasDeposit ? 'deposit' : 'progress';
        const seq = String(existing.length + 1).padStart(3, '0');
        const year = new Date().getFullYear();
        setForm({
          ...emptyForm,
          number: `${year}${seq}`,
          type: defaultType,
          issueDate,
          dueDate: addDays(issueDate, 14),
          label: defaultType === 'deposit' ? 'Záloha 30 % — zahájení'
               : defaultType === 'final'   ? 'Doplatek'
               : 'Průběžná faktura',
          amount: defaultType === 'deposit' && project ? Math.round(project.budget * 0.3) : '',
        });
      }
      setErrors({});
    }
  }, [open, invoice, project, invoicesForProject]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // When type changes for new invoice, suggest amount + label
  const handleTypeChange = (type) => {
    setForm((prev) => {
      if (invoice) return { ...prev, type };
      const next = { ...prev, type };
      if (project) {
        if (type === 'deposit') {
          next.amount = Math.round(project.budget * 0.3);
          next.label = 'Záloha 30 % — zahájení';
        } else if (type === 'final') {
          // remaining = budget - sum(paid)
          const paidSum = invoicesForProject(project.id)
            .filter((i) => i.status === 'paid')
            .reduce((s, i) => s + (i.amount || 0), 0);
          next.amount = Math.max(0, project.budget - paidSum);
          next.label = 'Doplatek';
        } else if (type === 'progress') {
          next.label = 'Průběžná faktura';
        }
      }
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.number.trim()) e.number = 'Vyplňte číslo faktury';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Zadejte kladnou částku';
    if (!form.dueDate) e.dueDate = 'Vyplňte splatnost';
    if (form.dueDate && form.issueDate && form.dueDate < form.issueDate) {
      e.dueDate = 'Splatnost musí být po datu vystavení';
    }
    if (form.status === 'paid' && !form.paidDate) e.paidDate = 'U zaplacené vyplňte datum';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      projectId,
      amount: Number(form.amount),
      paidDate: form.status === 'paid' ? form.paidDate : null,
    };
    if (invoice) {
      updateInvoice(invoice.id, data);
    } else {
      addInvoice(data);
    }
    onSaved?.();
    onClose?.();
  };

  // Suggest deposit amount from budget
  const depositSuggestion = project ? Math.round(project.budget * 0.3) : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={invoice ? 'Upravit fakturu' : 'Nová faktura'}
      description={invoice ? `Faktura ${invoice.number}` : project?.name}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="invoice-form" className="btn btn-primary">
            {invoice ? 'Uložit změny' : 'Vystavit fakturu'}
          </button>
        </>
      }
    >
      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <p className="label">Typ faktury *</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(INVOICE_TYPES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTypeChange(key)}
                className={`px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                  form.type === key
                    ? 'border-ink-900 bg-ink-50 text-ink-900'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="inv-number" className="label">Číslo faktury *</label>
            <input
              id="inv-number" type="text"
              className={`input font-mono ${errors.number ? 'input-error' : ''}`}
              value={form.number}
              onChange={(e) => handleChange('number', e.target.value)}
            />
            {errors.number && <p className="mt-1 text-xs text-red-600">{errors.number}</p>}
          </div>
          <div>
            <label htmlFor="inv-status" className="label">Stav</label>
            <select
              id="inv-status" className="input"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {Object.entries(INVOICE_STATUSES).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="inv-label" className="label">Označení</label>
          <input
            id="inv-label" type="text" className="input"
            value={form.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Záloha 30 %, průběžná za hrubou stavbu…"
          />
        </div>

        <div>
          <label htmlFor="inv-amount" className="label">Částka (Kč) *</label>
          <input
            id="inv-amount" type="number" min="0" step="1000"
            className={`input font-mono tabular-nums ${errors.amount ? 'input-error' : ''}`}
            value={form.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          {!invoice && form.type === 'deposit' && project && (
            <p className="mt-1 text-xs text-ink-500">
              Návrh: 30 % z rozpočtu = <span className="font-bold tabular-nums">{formatCZK(depositSuggestion)}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="inv-issue" className="label">Datum vystavení *</label>
            <input
              id="inv-issue" type="date" className="input"
              value={form.issueDate}
              onChange={(e) => handleChange('issueDate', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="inv-due" className="label">Splatnost *</label>
            <input
              id="inv-due" type="date"
              className={`input ${errors.dueDate ? 'input-error' : ''}`}
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
            {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>}
          </div>
          {form.status === 'paid' && (
            <div>
              <label htmlFor="inv-paid" className="label">Zaplaceno *</label>
              <input
                id="inv-paid" type="date"
                className={`input ${errors.paidDate ? 'input-error' : ''}`}
                value={form.paidDate}
                onChange={(e) => handleChange('paidDate', e.target.value)}
              />
              {errors.paidDate && <p className="mt-1 text-xs text-red-600">{errors.paidDate}</p>}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="inv-note" className="label">Poznámka</label>
          <textarea
            id="inv-note" rows={2} className="input resize-y"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Vnitřní poznámka, vyúčtování víceprací…"
          />
        </div>
      </form>
    </Modal>
  );
}

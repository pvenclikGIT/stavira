import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hammer } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { PROJECT_TYPES } from '../data/seed';
import { todayISO, classNames } from '../utils/format';

const emptyForm = {
  title: '',
  clientId: '',
  address: '',
  description: '',
  type: 'novostavba',
  validUntil: '',
  marginPercent: 18,
  note: '',
};

const addDays = (iso, days) => {
  if (!iso) return '';
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function QuoteFormModal({ open, onClose, quote, onSaved }) {
  const navigate = useNavigate();
  const { clients, addQuote, updateQuote } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(quote ? {
        title: quote.title || '',
        clientId: quote.clientId || '',
        address: quote.address || '',
        description: quote.description || '',
        type: quote.type || 'novostavba',
        validUntil: quote.validUntil || '',
        marginPercent: quote.marginPercent ?? 18,
        note: quote.note || '',
      } : { ...emptyForm, validUntil: addDays(todayISO(), 30) });
      setErrors({});
    }
  }, [open, quote]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClientChange = (clientId) => {
    setForm((prev) => {
      const next = { ...prev, clientId };
      // Auto-fill address from client if empty
      if (!prev.address && clientId) {
        const c = clients.find((cc) => cc.id === clientId);
        if (c?.address) next.address = c.address;
      }
      return next;
    });
    if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Vyplňte název nabídky';
    if (!form.clientId) e.clientId = 'Vyberte klienta';
    if (!form.address.trim()) e.address = 'Vyplňte adresu';
    if (form.marginPercent < 0 || form.marginPercent > 100) e.marginPercent = 'Marže 0–100 %';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const data = { ...form, marginPercent: Number(form.marginPercent) };

    if (quote) {
      updateQuote(quote.id, data);
      onSaved?.(quote.id);
    } else {
      const created = addQuote(data);
      onSaved?.(created.id);
      // Navigate to detail so user can add lines
      navigate(`/nabidky/${created.id}`);
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={quote ? 'Upravit nabídku' : 'Nová nabídka'}
      description={quote ? quote.number : 'Vytvoříme prázdnou nabídku, položky doplníte v detailu.'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="quote-form" className="btn btn-primary">
            {quote ? 'Uložit změny' : 'Vytvořit nabídku'}
          </button>
        </>
      }
    >
      <form id="quote-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Type */}
        <div>
          <p className="label">Typ stavby *</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PROJECT_TYPES).map(([key, t]) => {
              const active = form.type === key;
              const Icon = key === 'novostavba' ? Building2 : Hammer;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('type', key)}
                  className={classNames(
                    'flex items-center gap-3 p-3.5 rounded-lg border-2 transition-all text-left',
                    active ? 'border-ink-900 bg-ink-50 shadow-card' : 'border-ink-200 hover:border-ink-300 bg-white'
                  )}
                >
                  <div className={classNames(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    active ? 'bg-ink-900 text-accent-400' : 'bg-ink-100 text-ink-600'
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={classNames('font-semibold text-sm', active ? 'text-ink-900' : 'text-ink-700')}>
                    {t.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="q-title" className="label">Název nabídky *</label>
          <input
            id="q-title" type="text"
            className={`input ${errors.title ? 'input-error' : ''}`}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="např. Novostavba RD Zelinkovi — Vinoř"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="q-client" className="label">Klient *</label>
          <select
            id="q-client"
            className={`input ${errors.clientId ? 'input-error' : ''}`}
            value={form.clientId}
            onChange={(e) => handleClientChange(e.target.value)}
          >
            <option value="">Vyberte klienta…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` · ${c.company}` : ''}
              </option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId}</p>}
        </div>

        <div>
          <label htmlFor="q-address" className="label">Adresa stavby *</label>
          <input
            id="q-address" type="text"
            className={`input ${errors.address ? 'input-error' : ''}`}
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="q-desc" className="label">Popis</label>
          <textarea
            id="q-desc" rows={3} className="input resize-y"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Stručný popis stavby pro klienta…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="q-valid" className="label">Platí do</label>
            <input
              id="q-valid" type="date" className="input"
              value={form.validUntil}
              onChange={(e) => handleChange('validUntil', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="q-margin" className="label">Marže (%)</label>
            <input
              id="q-margin" type="number" min="0" max="100" step="1"
              className={`input font-mono tabular-nums ${errors.marginPercent ? 'input-error' : ''}`}
              value={form.marginPercent}
              onChange={(e) => handleChange('marginPercent', e.target.value)}
            />
            {errors.marginPercent && <p className="mt-1 text-xs text-red-600">{errors.marginPercent}</p>}
            <p className="mt-1 text-xs text-ink-500">Přirážka nad nákupní cenou</p>
          </div>
        </div>

        <div>
          <label htmlFor="q-note" className="label">Poznámka pro klienta</label>
          <textarea
            id="q-note" rows={2} className="input resize-y"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Co nabídka neobsahuje, platnost, podmínky…"
          />
        </div>
      </form>
    </Modal>
  );
}

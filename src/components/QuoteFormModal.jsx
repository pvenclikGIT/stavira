import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hammer, Sparkles, Check } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { PROJECT_TYPES } from '../data/seed';
import { QUOTE_TEMPLATES } from '../data/quoteTemplates';
import { todayISO, classNames } from '../utils/format';

const emptyForm = {
  title: '',
  clientId: '',
  address: '',
  description: '',
  type: 'novostavba',
  validUntil: '',
  marginPercentMaterial: 15,
  marginPercentLabor: 25,
  note: '',
  templateId: 'blank',
};

const addDays = (iso, days) => {
  if (!iso) return '';
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function QuoteFormModal({ open, onClose, quote, onSaved }) {
  const navigate = useNavigate();
  const { clients, addQuote, updateQuote, applyQuoteTemplate } = useApp();
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
        marginPercentMaterial: quote.marginPercentMaterial ?? quote.marginPercent ?? 15,
        marginPercentLabor: quote.marginPercentLabor ?? quote.marginPercent ?? 25,
        note: quote.note || '',
        templateId: 'blank',
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
      if (!prev.address && clientId) {
        const c = clients.find((cc) => cc.id === clientId);
        if (c?.address) next.address = c.address;
      }
      return next;
    });
    if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: undefined }));
  };

  const handleTemplateChange = (templateId) => {
    const tpl = QUOTE_TEMPLATES[templateId];
    setForm((prev) => ({
      ...prev,
      templateId,
      // Switch project type to match template (if template has one)
      type: tpl?.type || prev.type,
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Vyplňte název nabídky';
    if (!form.clientId) e.clientId = 'Vyberte klienta';
    if (!form.address.trim()) e.address = 'Vyplňte adresu';
    if (form.marginPercentMaterial < 0 || form.marginPercentMaterial > 100) e.marginPercentMaterial = '0–100 %';
    if (form.marginPercentLabor < 0 || form.marginPercentLabor > 100) e.marginPercentLabor = '0–100 %';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const { templateId, ...rest } = form;
    const data = {
      ...rest,
      marginPercentMaterial: Number(form.marginPercentMaterial),
      marginPercentLabor: Number(form.marginPercentLabor),
      // Keep legacy marginPercent in sync (avg) for older code paths
      marginPercent: Math.round((Number(form.marginPercentMaterial) + Number(form.marginPercentLabor)) / 2),
    };

    if (quote) {
      updateQuote(quote.id, data);
      onSaved?.(quote.id);
      onClose?.();
    } else {
      const created = addQuote(data);
      // Apply template if selected
      if (templateId && templateId !== 'blank' && QUOTE_TEMPLATES[templateId]) {
        applyQuoteTemplate(created.id, QUOTE_TEMPLATES[templateId]);
      }
      onSaved?.(created.id);
      navigate(`/nabidky/${created.id}`);
      onClose?.();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={quote ? 'Upravit nabídku' : 'Nová nabídka'}
      description={quote ? quote.number : 'Vyberte šablonu pro rychlý start nebo začněte od nuly.'}
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
      <form id="quote-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Template — only for new */}
        {!quote && (
          <section>
            <p className="label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              Šablona
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.values(QUOTE_TEMPLATES).map((tpl) => {
                const active = form.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tpl.id)}
                    className={classNames(
                      'text-left p-3 rounded-lg border-2 transition-all relative',
                      active
                        ? 'border-ink-900 bg-ink-50 shadow-card'
                        : 'border-ink-200 hover:border-ink-300 bg-white'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {active && (
                        <div className="w-5 h-5 rounded-full bg-ink-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={classNames(
                          'font-semibold text-sm leading-tight',
                          active ? 'text-ink-900' : 'text-ink-700'
                        )}>
                          {tpl.label}
                        </p>
                        <p className="text-xs text-ink-500 mt-1 leading-relaxed">{tpl.description}</p>
                        {tpl.sections.length > 0 && (
                          <p className="text-[10px] text-ink-400 mt-1.5 font-mono tabular-nums">
                            {tpl.sections.length} sekcí · {tpl.sections.reduce((s, sec) => s + sec.lines.length, 0)} položek
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Type */}
        <section>
          <p className="label">Typ stavby</p>
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
                    'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left',
                    active ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-300 bg-white'
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
        </section>

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
          <label htmlFor="q-desc" className="label">Popis pro klienta</label>
          <textarea
            id="q-desc" rows={3} className="input resize-y"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Co stavíme? Stručný popis projektu, který uvidí klient na začátku nabídky."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label htmlFor="q-valid" className="label">Platí do</label>
            <input
              id="q-valid" type="date" className="input"
              value={form.validUntil}
              onChange={(e) => handleChange('validUntil', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="q-mat-margin" className="label">Marže materiál (%)</label>
            <input
              id="q-mat-margin" type="number" min="0" max="100" step="1"
              className={`input font-mono tabular-nums ${errors.marginPercentMaterial ? 'input-error' : ''}`}
              value={form.marginPercentMaterial}
              onChange={(e) => handleChange('marginPercentMaterial', e.target.value)}
            />
            {errors.marginPercentMaterial && <p className="mt-1 text-xs text-red-600">{errors.marginPercentMaterial}</p>}
          </div>
          <div>
            <label htmlFor="q-lab-margin" className="label">Marže práce (%)</label>
            <input
              id="q-lab-margin" type="number" min="0" max="100" step="1"
              className={`input font-mono tabular-nums ${errors.marginPercentLabor ? 'input-error' : ''}`}
              value={form.marginPercentLabor}
              onChange={(e) => handleChange('marginPercentLabor', e.target.value)}
            />
            {errors.marginPercentLabor && <p className="mt-1 text-xs text-red-600">{errors.marginPercentLabor}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="q-note" className="label">Poznámka pro klienta</label>
          <textarea
            id="q-note" rows={2} className="input resize-y"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Co nabídka neobsahuje, podmínky realizace, záruky…"
          />
        </div>
      </form>
    </Modal>
  );
}

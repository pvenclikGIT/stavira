import { useState, useEffect } from 'react';
import Modal from './Modal';
import { QUOTE_LINE_TYPES } from '../data/seed';
import { classNames } from '../utils/format';

const emptyForm = {
  type: 'work',
  name: '',
  quantity: 1,
  unit: 'kpl',
  unitPrice: 0,
  note: '',
};

export default function QuoteLineFormModal({ open, onClose, line, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(line ? {
        type: line.type || 'work',
        name: line.name || '',
        quantity: line.quantity ?? 1,
        unit: line.unit || 'kpl',
        unitPrice: line.unitPrice ?? 0,
        note: line.note || '',
      } : { ...emptyForm });
      setErrors({});
    }
  }, [open, line]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vyplňte popis';
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Kladné množství';
    if (Number(form.unitPrice) < 0) e.unitPrice = 'Záporná cena';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
    };
    onSave?.(data);
    onClose?.();
  };

  // Filter out 'material' — that goes via picker
  const types = Object.entries(QUOTE_LINE_TYPES).filter(([k]) => k !== 'material');

  const total = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={line ? 'Upravit položku' : 'Přidat práci nebo ostatní'}
      description={line ? null : 'Pro materiál použijte tlačítko „+ z katalogu". Tady přidáte vlastní položku — práci, dopravu, lešení…'}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="line-form" className="btn btn-primary">
            {line ? 'Uložit' : 'Přidat položku'}
          </button>
        </>
      }
    >
      <form id="line-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Type — only when creating */}
        {!line && (
          <div>
            <p className="label">Druh položky</p>
            <div className="grid grid-cols-2 gap-2">
              {types.map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('type', key)}
                  className={classNames(
                    'px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all',
                    form.type === key
                      ? 'border-ink-900 bg-ink-50 text-ink-900'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="line-name" className="label">Popis *</label>
          <input
            id="line-name" type="text"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={
              form.type === 'work' ? 'např. Hrubá stavba — zdění' : 'např. Doprava materiálu'
            }
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="line-qty" className="label">Množství *</label>
            <input
              id="line-qty" type="number" min="0" step="0.01"
              className={`input font-mono tabular-nums ${errors.quantity ? 'input-error' : ''}`}
              value={form.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
            />
            {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
          </div>
          <div>
            <label htmlFor="line-unit" className="label">Jednotka</label>
            <select
              id="line-unit"
              className="input"
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              <option value="kpl">kpl</option>
              <option value="hod">hod</option>
              <option value="den">den</option>
              <option value="m">m</option>
              <option value="m²">m²</option>
              <option value="m³">m³</option>
              <option value="ks">ks</option>
              <option value="t">t</option>
            </select>
          </div>
          <div>
            <label htmlFor="line-price" className="label">Cena / jedn. (Kč)</label>
            <input
              id="line-price" type="number" min="0" step="1"
              className={`input font-mono tabular-nums ${errors.unitPrice ? 'input-error' : ''}`}
              value={form.unitPrice}
              onChange={(e) => handleChange('unitPrice', e.target.value)}
            />
            {errors.unitPrice && <p className="mt-1 text-xs text-red-600">{errors.unitPrice}</p>}
          </div>
        </div>

        {/* Live total preview */}
        <div className="p-3 rounded-lg bg-ink-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-700">Celkem za položku</span>
          <span className="font-display text-lg font-extrabold tabular-nums text-ink-900">
            {total.toLocaleString('cs-CZ')} Kč
          </span>
        </div>

        <div>
          <label htmlFor="line-note" className="label">Poznámka</label>
          <input
            id="line-note" type="text" className="input"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Volitelná poznámka pro klienta"
          />
        </div>
      </form>
    </Modal>
  );
}

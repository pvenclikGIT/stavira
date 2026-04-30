import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { BONUS_TYPES } from '../data/payroll';

export default function BonusFormModal({ open, onClose, employeeId, bonus, defaultMonth }) {
  const { projects, addBonus, updateBonus } = useApp();
  const [form, setForm] = useState({
    month: defaultMonth || new Date().toISOString().slice(0, 7),
    amount: 0,
    type: 'performance',
    projectId: '',
    note: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(bonus ? {
        month: bonus.month,
        amount: bonus.amount,
        type: bonus.type,
        projectId: bonus.projectId || '',
        note: bonus.note || '',
      } : {
        month: defaultMonth || new Date().toISOString().slice(0, 7),
        amount: 0, type: 'performance', projectId: '', note: '',
      });
      setErrors({});
    }
  }, [open, bonus, defaultMonth]);

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!form.amount || form.amount <= 0) {
      setErrors({ amount: 'Zadejte částku' });
      return;
    }
    const data = {
      employeeId,
      month: form.month,
      amount: Number(form.amount),
      type: form.type,
      projectId: form.projectId || null,
      note: form.note,
    };
    if (bonus) updateBonus(bonus.id, data);
    else addBonus(data);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bonus ? 'Upravit bonus' : 'Přidat bonus'}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="bn-form" className="btn btn-primary">
            {bonus ? 'Uložit' : 'Přidat bonus'}
          </button>
        </>
      }
    >
      <form id="bn-form" onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Měsíc *</label>
            <input
              type="month"
              className="input"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Částka (Kč) *</label>
            <input
              type="number"
              min="0"
              step="100"
              className={`input font-mono tabular-nums ${errors.amount ? 'input-error' : ''}`}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </div>
        </div>
        <div>
          <label className="label">Typ bonusu *</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {Object.entries(BONUS_TYPES).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Spojeno se stavbou (volitelné)</label>
          <select
            className="input"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">— žádná —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Poznámka</label>
          <input
            type="text"
            className="input"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Důvod, popis…"
          />
        </div>
      </form>
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { DEDUCTION_TYPES } from '../data/payroll';

export default function DeductionFormModal({ open, onClose, employeeId, deduction, defaultMonth }) {
  const { addDeduction, updateDeduction } = useApp();
  const [form, setForm] = useState({
    month: defaultMonth || new Date().toISOString().slice(0, 7),
    amount: 0,
    type: 'advance',
    note: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(deduction ? {
        month: deduction.month,
        amount: deduction.amount,
        type: deduction.type,
        note: deduction.note || '',
      } : {
        month: defaultMonth || new Date().toISOString().slice(0, 7),
        amount: 0, type: 'advance', note: '',
      });
      setErrors({});
    }
  }, [open, deduction, defaultMonth]);

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
      note: form.note,
    };
    if (deduction) updateDeduction(deduction.id, data);
    else addDeduction(data);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={deduction ? 'Upravit srážku' : 'Přidat srážku'}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="dd-form" className="btn btn-primary">
            {deduction ? 'Uložit' : 'Přidat srážku'}
          </button>
        </>
      }
    >
      <form id="dd-form" onSubmit={handleSubmit} className="space-y-3">
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
          <label className="label">Typ srážky *</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {Object.entries(DEDUCTION_TYPES).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
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
            placeholder="Důvod, splátka X/Y…"
          />
        </div>
      </form>
    </Modal>
  );
}

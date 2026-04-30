import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { SHIFT_TYPES } from '../data/payroll';
import { classNames, todayISO } from '../utils/format';

export default function TimeEntryFormModal({ open, onClose, employeeId, entry, defaultMonth }) {
  const { projects, addTimeEntry, updateTimeEntry } = useApp();
  const activeProjects = projects.filter((p) => p.status === 'active');

  const initialDate = (() => {
    if (entry?.date) return entry.date;
    if (defaultMonth) return `${defaultMonth}-${String(new Date().getDate()).padStart(2, '0')}`;
    return todayISO();
  })();

  const [form, setForm] = useState({
    date: initialDate,
    hours: 8,
    shiftType: 'regular',
    projectId: activeProjects[0]?.id || '',
    note: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(entry ? {
        date: entry.date,
        hours: entry.hours,
        shiftType: entry.shiftType,
        projectId: entry.projectId || (activeProjects[0]?.id || ''),
        note: entry.note || '',
      } : {
        date: initialDate,
        hours: 8,
        shiftType: 'regular',
        projectId: activeProjects[0]?.id || '',
        note: '',
      });
      setErrors({});
    }
  }, [open, entry]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Vyplňte datum';
    if (!form.hours || form.hours <= 0) e.hours = 'Hodiny musí být kladné';
    if (form.hours > 24) e.hours = 'Maximálně 24 hodin';
    if (!form.projectId) e.projectId = 'Vyberte stavbu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      hours: Number(form.hours),
      employeeId,
    };
    if (entry) updateTimeEntry(entry.id, data);
    else addTimeEntry(data);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? 'Upravit docházku' : 'Přidat hodiny'}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="te-form" className="btn btn-primary">
            {entry ? 'Uložit' : 'Přidat'}
          </button>
        </>
      }
    >
      <form id="te-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Datum *</label>
            <input
              type="date"
              className={`input ${errors.date ? 'input-error' : ''}`}
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>
          <div>
            <label className="label">Počet hodin *</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              className={`input font-mono tabular-nums ${errors.hours ? 'input-error' : ''}`}
              value={form.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
            />
            {errors.hours && <p className="mt-1 text-xs text-red-600">{errors.hours}</p>}
          </div>
        </div>

        <div>
          <label className="label">Typ směny *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(SHIFT_TYPES).map(([key, shift]) => {
              const active = form.shiftType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('shiftType', key)}
                  className={classNames(
                    'p-2.5 rounded-lg border-2 text-left transition-all',
                    active ? 'border-ink-900 bg-ink-50' : 'border-ink-200 hover:border-ink-300 bg-white'
                  )}
                >
                  <p className={classNames('font-semibold text-sm', active ? 'text-ink-900' : 'text-ink-700')}>
                    {shift.short}
                  </p>
                  <p className="text-[10px] text-ink-500 font-mono">×{shift.multiplier}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Stavba *</label>
          <select
            className={`input ${errors.projectId ? 'input-error' : ''}`}
            value={form.projectId}
            onChange={(e) => handleChange('projectId', e.target.value)}
          >
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
        </div>

        <div>
          <label className="label">Poznámka</label>
          <input
            type="text"
            className="input"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Co se dělalo, jaký úkol…"
          />
        </div>
      </form>
    </Modal>
  );
}

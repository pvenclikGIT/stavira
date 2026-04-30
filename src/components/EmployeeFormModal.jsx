import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { EMPLOYEE_ROLES, CONTRACT_TYPES } from '../data/payroll';
import { classNames } from '../utils/format';

const empty = {
  name: '',
  nickname: '',
  role: 'helper',
  contractType: 'hpp',
  hourlyRate: 250,
  hireDate: new Date().toISOString().slice(0, 10),
  phone: '',
  email: '',
  accountNumber: '',
  healthInsurance: '',
  socialNumber: '',
  address: '',
  hasTaxCredit: true,
  bankNote: '',
  color: 'slate',
};

const COLORS = ['slate', 'amber', 'blue', 'emerald', 'orange', 'purple', 'cyan', 'pink'];

export default function EmployeeFormModal({ open, onClose, employee }) {
  const { addEmployee, updateEmployee } = useApp();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(employee ? { ...empty, ...employee } : empty);
      setErrors({});
    }
  }, [open, employee]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vyplňte jméno';
    if (form.hourlyRate < 0) e.hourlyRate = 'Nesmí být záporné';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = { ...form, hourlyRate: Number(form.hourlyRate) };
    if (employee) {
      updateEmployee(employee.id, data);
    } else {
      addEmployee(data);
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={employee ? 'Upravit zaměstnance' : 'Nový zaměstnanec'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="emp-form" className="btn btn-primary">
            {employee ? 'Uložit změny' : 'Přidat zaměstnance'}
          </button>
        </>
      }
    >
      <form id="emp-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="label">Jméno a příjmení *</label>
            <input
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="např. David Kovář"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Přezdívka / oslovení</label>
            <input
              type="text"
              className="input"
              value={form.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="David st."
            />
          </div>
          <div>
            <label className="label">Profese *</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
            >
              {Object.entries(EMPLOYEE_ROLES).map(([key, r]) => (
                <option key={key} value={key}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Typ smlouvy *</label>
            <select
              className="input"
              value={form.contractType}
              onChange={(e) => handleChange('contractType', e.target.value)}
            >
              {Object.entries(CONTRACT_TYPES).map(([key, c]) => (
                <option key={key} value={key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Hodinová sazba (Kč/h) *</label>
            <input
              type="number"
              min="0"
              step="10"
              className={`input font-mono tabular-nums ${errors.hourlyRate ? 'input-error' : ''}`}
              value={form.hourlyRate}
              onChange={(e) => handleChange('hourlyRate', e.target.value)}
            />
            {errors.hourlyRate && <p className="mt-1 text-xs text-red-600">{errors.hourlyRate}</p>}
          </div>
          <div>
            <label className="label">Ve firmě od</label>
            <input
              type="date"
              className="input"
              value={form.hireDate}
              onChange={(e) => handleChange('hireDate', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-ink-100">
          <div>
            <label className="label">Telefon</label>
            <input
              type="tel"
              className="input"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+420 …"
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Adresa</label>
            <input
              type="text"
              className="input"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-ink-100">
          <div>
            <label className="label">Bankovní účet</label>
            <input
              type="text"
              className="input font-mono"
              value={form.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              placeholder="123456789/0100"
            />
          </div>
          <div>
            <label className="label">Zdravotní pojišťovna</label>
            <input
              type="text"
              className="input"
              value={form.healthInsurance}
              onChange={(e) => handleChange('healthInsurance', e.target.value)}
              placeholder="VZP (111)"
            />
          </div>
          <div>
            <label className="label">Rodné číslo</label>
            <input
              type="text"
              className="input font-mono"
              value={form.socialNumber}
              onChange={(e) => handleChange('socialNumber', e.target.value)}
              placeholder="rrmm dd / xxxx"
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              id="tax-credit"
              className="w-4 h-4 rounded border-ink-300"
              checked={form.hasTaxCredit}
              onChange={(e) => handleChange('hasTaxCredit', e.target.checked)}
            />
            <label htmlFor="tax-credit" className="text-sm text-ink-700">
              Uplatňuje slevu na poplatníka (2 570 Kč/měs)
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-ink-100">
          <label className="label">Barva avatar</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleChange('color', c)}
                className={classNames(
                  'w-8 h-8 rounded-full border-2 transition-all',
                  form.color === c ? 'border-ink-900 scale-110' : 'border-transparent hover:scale-105',
                  c === 'amber' && 'bg-amber-300',
                  c === 'blue' && 'bg-blue-300',
                  c === 'emerald' && 'bg-emerald-300',
                  c === 'orange' && 'bg-orange-300',
                  c === 'purple' && 'bg-purple-300',
                  c === 'cyan' && 'bg-cyan-300',
                  c === 'pink' && 'bg-pink-300',
                  c === 'slate' && 'bg-ink-300',
                )}
                aria-label={`Barva ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Poznámka</label>
          <textarea
            rows={2}
            className="input resize-y"
            value={form.bankNote}
            onChange={(e) => handleChange('bankNote', e.target.value)}
            placeholder="Interní poznámka — schopnosti, jazyky, specializace…"
          />
        </div>
      </form>
    </Modal>
  );
}

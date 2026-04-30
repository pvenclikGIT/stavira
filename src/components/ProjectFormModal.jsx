import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { PROJECT_STATUSES, DEFAULT_STAGES } from '../data/seed';
import { generateId, todayISO } from '../utils/format';

const emptyForm = {
  name: '',
  code: '',
  clientId: '',
  address: '',
  description: '',
  status: 'planning',
  budget: '',
  startDate: todayISO(),
  endDate: '',
  deadline: '',
  siteManager: '',
};

export default function ProjectFormModal({ open, onClose, project, onSaved }) {
  const { clients, addProject, updateProject } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (project) {
        setForm({
          name: project.name || '',
          code: project.code || '',
          clientId: project.clientId || '',
          address: project.address || '',
          description: project.description || '',
          status: project.status || 'planning',
          budget: project.budget || '',
          startDate: project.startDate || todayISO(),
          endDate: project.endDate || '',
          deadline: project.deadline || '',
          siteManager: project.siteManager || '',
        });
      } else {
        const nextCode = `${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
        setForm({ ...emptyForm, code: nextCode });
      }
      setErrors({});
    }
  }, [open, project]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vyplňte název projektu';
    if (!form.clientId) e.clientId = 'Vyberte klienta';
    if (!form.address.trim()) e.address = 'Vyplňte adresu stavby';
    if (!form.budget || Number(form.budget) <= 0) e.budget = 'Zadejte kladný rozpočet';
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      e.endDate = 'Konec musí být po startu';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const data = {
      ...form,
      budget: Number(form.budget),
      deadline: form.deadline || form.endDate,
    };

    if (project) {
      updateProject(project.id, data);
      onSaved?.(project.id);
    } else {
      // Auto-generate empty stages
      const stages = DEFAULT_STAGES.map((s) => ({
        id: generateId('stg'),
        key: s.key,
        label: s.label,
        startDate: '',
        endDate: '',
        progress: 0,
        budget: 0,
        actualCost: 0,
      }));
      const created = addProject({ ...data, stages, progress: 0, actualCost: 0 });
      onSaved?.(created.id);
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? 'Upravit projekt' : 'Nový projekt'}
      description={project ? 'Aktualizujte údaje o projektu.' : 'Založte nový stavební projekt.'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="project-form" className="btn btn-primary">
            {project ? 'Uložit změny' : 'Založit projekt'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="label">Název projektu *</label>
            <input
              id="name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="např. Rodinný dům Novák — Vinoř"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="code" className="label">Kód</label>
            <input
              id="code"
              type="text"
              className="input font-mono"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="2025-001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="clientId" className="label">Klient *</label>
            <select
              id="clientId"
              className={`input ${errors.clientId ? 'input-error' : ''}`}
              value={form.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
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
            <label htmlFor="status" className="label">Stav</label>
            <select
              id="status"
              className="input"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {Object.entries(PROJECT_STATUSES).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="label">Adresa stavby *</label>
          <input
            id="address"
            type="text"
            className={`input ${errors.address ? 'input-error' : ''}`}
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Bohdanečská 142, 190 17 Praha-Vinoř"
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="description" className="label">Popis</label>
          <textarea
            id="description"
            rows={3}
            className="input resize-y"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Stručný popis stavby, plocha, materiály…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget" className="label">Rozpočet (Kč) *</label>
            <input
              id="budget"
              type="number"
              min="0"
              step="10000"
              className={`input font-mono tabular-nums ${errors.budget ? 'input-error' : ''}`}
              value={form.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              placeholder="9 800 000"
            />
            {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
          </div>
          <div>
            <label htmlFor="siteManager" className="label">Stavbyvedoucí</label>
            <input
              id="siteManager"
              type="text"
              className="input"
              value={form.siteManager}
              onChange={(e) => handleChange('siteManager', e.target.value)}
              placeholder="Jméno a příjmení"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="label">Začátek</label>
            <input
              id="startDate"
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="label">Konec</label>
            <input
              id="endDate"
              type="date"
              className={`input ${errors.endDate ? 'input-error' : ''}`}
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
          </div>
          <div>
            <label htmlFor="deadline" className="label">Termín předání</label>
            <input
              id="deadline"
              type="date"
              className="input"
              value={form.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

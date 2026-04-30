import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

export default function StageFormModal({ open, onClose, projectId, stage, onSaved }) {
  const { updateStage, addStage } = useApp();
  const [form, setForm] = useState({
    label: '', description: '', startDate: '', endDate: '',
    progress: 0, budget: 0, actualCost: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(stage ? {
        label: stage.label || '',
        description: stage.description || '',
        startDate: stage.startDate || '',
        endDate: stage.endDate || '',
        progress: stage.progress ?? 0,
        budget: stage.budget ?? 0,
        actualCost: stage.actualCost ?? 0,
      } : {
        label: '', description: '', startDate: '', endDate: '',
        progress: 0, budget: 0, actualCost: 0,
      });
      setErrors({});
    }
  }, [open, stage]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.label.trim()) e.label = 'Vyplňte název etapy';
    const progress = Number(form.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) e.progress = 'Postup 0–100 %';
    if (Number(form.budget) < 0) e.budget = 'Záporná hodnota';
    if (Number(form.actualCost) < 0) e.actualCost = 'Záporná hodnota';
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
      label: form.label.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      progress: Number(form.progress),
      budget: Number(form.budget),
      actualCost: Number(form.actualCost),
    };
    if (stage) {
      updateStage(projectId, stage.id, data);
    } else {
      addStage(projectId, data);
    }
    onSaved?.();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={stage ? 'Upravit etapu' : 'Nová etapa'}
      description={stage ? 'Aktualizujte údaje etapy.' : 'Přidejte vlastní etapu projektu.'}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="stage-form" className="btn btn-primary">
            {stage ? 'Uložit změny' : 'Přidat etapu'}
          </button>
        </>
      }
    >
      <form id="stage-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stage-label" className="label">Název etapy *</label>
          <input
            id="stage-label" type="text"
            className={`input ${errors.label ? 'input-error' : ''}`}
            value={form.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="např. Hrubá stavba"
          />
          {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label}</p>}
        </div>

        <div>
          <label htmlFor="stage-desc" className="label">Popis</label>
          <textarea
            id="stage-desc" rows={2} className="input resize-y"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Co vše tato etapa obsahuje…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="stage-start" className="label">Začátek</label>
            <input
              id="stage-start" type="date" className="input"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="stage-end" className="label">Konec</label>
            <input
              id="stage-end" type="date"
              className={`input ${errors.endDate ? 'input-error' : ''}`}
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
            {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="stage-progress" className="label">
            Postup ({form.progress} %)
          </label>
          <input
            id="stage-progress" type="range" min="0" max="100" step="5"
            className="w-full accent-ink-900"
            value={form.progress}
            onChange={(e) => handleChange('progress', e.target.value)}
          />
          <div className="flex justify-between text-[10px] text-ink-500 mt-1 font-mono tabular-nums">
            <span>0 %</span><span>50 %</span><span>100 %</span>
          </div>
          {errors.progress && <p className="mt-1 text-xs text-red-600">{errors.progress}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="stage-budget" className="label">Rozpočet (Kč)</label>
            <input
              id="stage-budget" type="number" min="0" step="10000"
              className={`input font-mono tabular-nums ${errors.budget ? 'input-error' : ''}`}
              value={form.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
            />
            {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
          </div>
          <div>
            <label htmlFor="stage-actual" className="label">Skutečnost (Kč)</label>
            <input
              id="stage-actual" type="number" min="0" step="10000"
              className={`input font-mono tabular-nums ${errors.actualCost ? 'input-error' : ''}`}
              value={form.actualCost}
              onChange={(e) => handleChange('actualCost', e.target.value)}
            />
            {errors.actualCost && <p className="mt-1 text-xs text-red-600">{errors.actualCost}</p>}
          </div>
        </div>
      </form>
    </Modal>
  );
}

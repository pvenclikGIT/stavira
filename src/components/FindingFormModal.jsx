import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { FINDING_SEVERITY, FINDING_STATUSES } from '../data/seed';
import { todayISO } from '../utils/format';

const emptyForm = {
  title: '',
  description: '',
  severity: 'medium',
  status: 'open',
  foundDate: todayISO(),
  stageKey: '',
};

export default function FindingFormModal({ open, onClose, projectId, project, finding, onSaved }) {
  const { addFinding, updateFinding } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(finding ? {
        title: finding.title || '',
        description: finding.description || '',
        severity: finding.severity || 'medium',
        status: finding.status || 'open',
        foundDate: finding.foundDate || todayISO(),
        stageKey: finding.stageKey || '',
      } : { ...emptyForm });
      setErrors({});
    }
  }, [open, finding]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Vyplňte název nálezu';
    if (!form.foundDate) e.foundDate = 'Vyplňte datum zjištění';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = { ...form, projectId };
    if (finding) {
      updateFinding(finding.id, data);
    } else {
      addFinding(data);
    }
    onSaved?.();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={finding ? 'Upravit nález' : 'Nový nález / skrytá vada'}
      description={finding
        ? 'Aktualizujte detail nálezu.'
        : 'Zaznamenejte, co bylo objeveno během stavby. Z vážnějších se mohou stát vícepráce.'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="finding-form" className="btn btn-primary">
            {finding ? 'Uložit změny' : 'Zaznamenat nález'}
          </button>
        </>
      }
    >
      <form id="finding-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fnd-title" className="label">Název nálezu *</label>
          <input
            id="fnd-title" type="text"
            className={`input ${errors.title ? 'input-error' : ''}`}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="např. Vlhké zdivo v JZ rohu"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="fnd-desc" className="label">Popis</label>
          <textarea
            id="fnd-desc" rows={4} className="input resize-y"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Co bylo zjištěno, příčina, rozsah, doporučené řešení…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fnd-sev" className="label">Závažnost</label>
            <select
              id="fnd-sev" className="input"
              value={form.severity}
              onChange={(e) => handleChange('severity', e.target.value)}
            >
              {Object.entries(FINDING_SEVERITY).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fnd-status" className="label">Stav</label>
            <select
              id="fnd-status" className="input"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {Object.entries(FINDING_STATUSES).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fnd-date" className="label">Datum zjištění *</label>
            <input
              id="fnd-date" type="date"
              className={`input ${errors.foundDate ? 'input-error' : ''}`}
              value={form.foundDate}
              onChange={(e) => handleChange('foundDate', e.target.value)}
            />
            {errors.foundDate && <p className="mt-1 text-xs text-red-600">{errors.foundDate}</p>}
          </div>
        </div>

        {project?.stages?.length > 0 && (
          <div>
            <label htmlFor="fnd-stage" className="label">Etapa, ve které byl nález zjištěn</label>
            <select
              id="fnd-stage" className="input"
              value={form.stageKey}
              onChange={(e) => handleChange('stageKey', e.target.value)}
            >
              <option value="">— žádná —</option>
              {project.stages.map((s) => (
                <option key={s.id} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}

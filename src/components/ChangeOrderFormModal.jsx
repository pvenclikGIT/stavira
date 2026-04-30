import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { CHANGE_ORDER_STATUSES } from '../data/seed';
import { todayISO } from '../utils/format';

const emptyForm = {
  number: '',
  title: '',
  description: '',
  amount: '',
  status: 'proposed',
  findingId: '',
  clientNote: '',
};

export default function ChangeOrderFormModal({ open, onClose, projectId, changeOrder, onSaved }) {
  const { addChangeOrder, updateChangeOrder, changeOrdersForProject, findingsForProject } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (changeOrder) {
        setForm({
          number: changeOrder.number || '',
          title: changeOrder.title || '',
          description: changeOrder.description || '',
          amount: changeOrder.amount || '',
          status: changeOrder.status || 'proposed',
          findingId: changeOrder.findingId || '',
          clientNote: changeOrder.clientNote || '',
        });
      } else {
        const existing = changeOrdersForProject(projectId);
        const seq = String(existing.length + 1).padStart(3, '0');
        setForm({ ...emptyForm, number: `VP-${seq}` });
      }
      setErrors({});
    }
  }, [open, changeOrder, projectId, changeOrdersForProject]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.number.trim()) e.number = 'Vyplňte číslo';
    if (!form.title.trim()) e.title = 'Vyplňte název';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Zadejte kladnou částku';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = {
      ...form,
      projectId,
      amount: Number(form.amount),
      findingId: form.findingId || null,
    };
    if (changeOrder) {
      updateChangeOrder(changeOrder.id, data);
    } else {
      addChangeOrder({ ...data, requestedDate: todayISO() });
    }
    onSaved?.();
    onClose?.();
  };

  const projectFindings = findingsForProject(projectId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={changeOrder ? 'Upravit vícepráci' : 'Nová vícepráce'}
      description={changeOrder ? changeOrder.number : 'Doplňte popis prací, které vyžadují schválení klientem.'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="co-form" className="btn btn-primary">
            {changeOrder ? 'Uložit změny' : 'Vytvořit vícepráci'}
          </button>
        </>
      }
    >
      <form id="co-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="co-number" className="label">Číslo *</label>
            <input
              id="co-number" type="text"
              className={`input font-mono ${errors.number ? 'input-error' : ''}`}
              value={form.number}
              onChange={(e) => handleChange('number', e.target.value)}
            />
            {errors.number && <p className="mt-1 text-xs text-red-600">{errors.number}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="co-status" className="label">Stav</label>
            <select
              id="co-status" className="input"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {Object.entries(CHANGE_ORDER_STATUSES).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="co-title" className="label">Název víceprací *</label>
          <input
            id="co-title" type="text"
            className={`input ${errors.title ? 'input-error' : ''}`}
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="např. Sanace vlhkého zdiva v JZ rohu"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="co-desc" className="label">Popis</label>
          <textarea
            id="co-desc" rows={4} className="input resize-y"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailní popis prací — co bylo zjištěno, co je třeba udělat, jak…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="co-amount" className="label">Částka (Kč) *</label>
            <input
              id="co-amount" type="number" min="0" step="1000"
              className={`input font-mono tabular-nums ${errors.amount ? 'input-error' : ''}`}
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </div>
          {projectFindings.length > 0 && (
            <div>
              <label htmlFor="co-finding" className="label">Související nález (volitelné)</label>
              <select
                id="co-finding" className="input"
                value={form.findingId}
                onChange={(e) => handleChange('findingId', e.target.value)}
              >
                <option value="">Bez vazby</option>
                {projectFindings.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="co-clinote" className="label">Vyjádření klienta</label>
          <textarea
            id="co-clinote" rows={2} className="input resize-y"
            value={form.clientNote}
            onChange={(e) => handleChange('clientNote', e.target.value)}
            placeholder="Komentář klienta při schvalování / zamítnutí"
          />
        </div>
      </form>
    </Modal>
  );
}

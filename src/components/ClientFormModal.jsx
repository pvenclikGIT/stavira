import { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

const emptyForm = {
  name: '', company: '', email: '', phone: '', address: '', note: '',
};

export default function ClientFormModal({ open, onClose, client, onSaved }) {
  const { addClient, updateClient } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(client ? { ...emptyForm, ...client } : emptyForm);
      setErrors({});
    }
  }, [open, client]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vyplňte jméno';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Neplatný e-mail';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    if (client) {
      updateClient(client.id, form);
      onSaved?.(client.id);
    } else {
      const created = addClient(form);
      onSaved?.(created.id);
    }
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={client ? 'Upravit klienta' : 'Nový klient'}
      description={client ? 'Aktualizujte kontaktní údaje.' : 'Přidejte nového klienta do databáze.'}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="client-form" className="btn btn-primary">
            {client ? 'Uložit změny' : 'Přidat klienta'}
          </button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cl-name" className="label">Jméno a příjmení *</label>
            <input
              id="cl-name"
              type="text"
              className={`input ${errors.name ? 'input-error' : ''}`}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Pavel Novák"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="cl-company" className="label">Firma</label>
            <input
              id="cl-company"
              type="text"
              className="input"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Volitelné"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cl-email" className="label">E-mail</label>
            <input
              id="cl-email"
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@domena.cz"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="cl-phone" className="label">Telefon</label>
            <input
              id="cl-phone"
              type="tel"
              className="input font-mono"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+420 …"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cl-address" className="label">Adresa</label>
          <input
            id="cl-address"
            type="text"
            className="input"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Ulice, PSČ město"
          />
        </div>

        <div>
          <label htmlFor="cl-note" className="label">Poznámka</label>
          <textarea
            id="cl-note"
            rows={3}
            className="input resize-y"
            value={form.note}
            onChange={(e) => handleChange('note', e.target.value)}
            placeholder="Vnitřní poznámka — preference, historie spolupráce…"
          />
        </div>
      </form>
    </Modal>
  );
}

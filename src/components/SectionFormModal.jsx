import { useState, useEffect } from 'react';
import Modal from './Modal';

const SECTION_SUGGESTIONS = [
  'Zemní práce a základy', 'Hrubá stavba', 'Střecha', 'Sítě a rozvody',
  'Omítky a povrchy', 'Zateplení a fasáda', 'Dokončení', 'Doprava',
  'Bourací práce', 'Hydroizolace', 'Obklady a dlažby', 'Sanita',
];

export default function SectionFormModal({ open, onClose, initial, onSave }) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) setTitle(initial || '');
  }, [open, initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave?.(trimmed);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Přejmenovat sekci' : 'Nová sekce'}
      description="Sekce pomáhají rozdělit nabídku do přehledných kapitol pro klienta."
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="section-form" className="btn btn-primary">
            {initial ? 'Uložit' : 'Vytvořit sekci'}
          </button>
        </>
      }
    >
      <form id="section-form" onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="sec-title" className="label">Název sekce *</label>
          <input
            id="sec-title"
            type="text"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="např. Hrubá stavba"
            autoFocus
            list="sec-suggestions"
          />
          <datalist id="sec-suggestions">
            {SECTION_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SECTION_SUGGESTIONS.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTitle(s)}
              className="text-xs px-2 py-1 rounded-md bg-ink-100 text-ink-700 hover:bg-ink-200 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  );
}

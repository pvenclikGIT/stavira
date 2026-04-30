import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Snowflake, CloudSun } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { WEATHER_OPTIONS } from '../data/seed';
import { todayISO, classNames } from '../utils/format';

const WEATHER_ICONS = {
  sunny: Sun, partly: CloudSun, cloudy: Cloud,
  rain: CloudRain, snow: CloudSnow, windy: Wind, frost: Snowflake,
};

const emptyForm = {
  date: todayISO(),
  weather: 'sunny',
  tempC: '',
  workersCount: '',
  workDone: '',
  issues: '',
};

export default function DiaryEntryFormModal({ open, onClose, projectId, entry, onSaved }) {
  const { addDiaryEntry, updateDiaryEntry } = useApp();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(entry ? {
        date: entry.date || todayISO(),
        weather: entry.weather || 'sunny',
        tempC: entry.tempC ?? '',
        workersCount: entry.workersCount ?? '',
        workDone: entry.workDone || '',
        issues: entry.issues || '',
      } : { ...emptyForm });
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
    if (!form.workDone.trim()) e.workDone = 'Popište, co se dnes dělalo';
    if (form.tempC !== '' && (isNaN(Number(form.tempC)) || Number(form.tempC) < -40 || Number(form.tempC) > 50)) {
      e.tempC = 'Zadejte teplotu −40 až +50 °C';
    }
    if (form.workersCount !== '' && (Number(form.workersCount) < 0 || !Number.isInteger(Number(form.workersCount)))) {
      e.workersCount = 'Celé kladné číslo';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const data = {
      ...form, projectId,
      tempC: form.tempC === '' ? null : Number(form.tempC),
      workersCount: form.workersCount === '' ? null : Number(form.workersCount),
    };
    if (entry) {
      updateDiaryEntry(entry.id, data);
    } else {
      addDiaryEntry(data);
    }
    onSaved?.();
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? 'Upravit záznam' : 'Zápis do deníku'}
      description={entry ? null : 'Stručný popis dne na stavbě.'}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button type="submit" form="diary-form" className="btn btn-primary">
            {entry ? 'Uložit' : 'Zapsat'}
          </button>
        </>
      }
    >
      <form id="diary-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label htmlFor="diary-date" className="label">Datum</label>
          <input
            id="diary-date" type="date"
            className={`input ${errors.date ? 'input-error' : ''}`}
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>

        {/* Weather — big visual buttons */}
        <div>
          <p className="label">Počasí</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(WEATHER_OPTIONS).map(([key, opt]) => {
              const Icon = WEATHER_ICONS[key] || Sun;
              const active = form.weather === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('weather', key)}
                  className={classNames(
                    'flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border-2 transition-all active:scale-95',
                    active
                      ? 'border-ink-900 bg-ink-50 text-ink-900'
                      : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300'
                  )}
                  title={opt.label}
                >
                  <Icon className={classNames('w-5 h-5', active && 'text-accent-600')} strokeWidth={active ? 2.4 : 1.8} />
                  <span className="text-[10px] font-semibold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temp + workers — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="diary-temp" className="label">Teplota °C</label>
            <input
              id="diary-temp" type="number" inputMode="numeric"
              className={`input font-mono tabular-nums ${errors.tempC ? 'input-error' : ''}`}
              value={form.tempC}
              onChange={(e) => handleChange('tempC', e.target.value)}
              placeholder="—"
            />
            {errors.tempC && <p className="mt-1 text-xs text-red-600">{errors.tempC}</p>}
          </div>
          <div>
            <label htmlFor="diary-workers" className="label">Lidí na stavbě</label>
            <input
              id="diary-workers" type="number" inputMode="numeric" min="0"
              className={`input font-mono tabular-nums ${errors.workersCount ? 'input-error' : ''}`}
              value={form.workersCount}
              onChange={(e) => handleChange('workersCount', e.target.value)}
              placeholder="—"
            />
            {errors.workersCount && <p className="mt-1 text-xs text-red-600">{errors.workersCount}</p>}
          </div>
        </div>

        {/* Work done */}
        <div>
          <label htmlFor="diary-work" className="label">Co se dnes dělalo *</label>
          <textarea
            id="diary-work" rows={4}
            className={`input resize-y ${errors.workDone ? 'input-error' : ''}`}
            value={form.workDone}
            onChange={(e) => handleChange('workDone', e.target.value)}
            placeholder="Pokračovali jsme s vyzdíváním 2.NP — západní stěna hotová..."
          />
          {errors.workDone && <p className="mt-1 text-xs text-red-600">{errors.workDone}</p>}
        </div>

        {/* Issues */}
        <div>
          <label htmlFor="diary-issues" className="label">
            Problémy a omezení <span className="font-normal text-ink-400">— volitelné</span>
          </label>
          <textarea
            id="diary-issues" rows={2} className="input resize-y"
            value={form.issues}
            onChange={(e) => handleChange('issues', e.target.value)}
            placeholder="Dodávka cihel zpoždění, déšť přerušil práci…"
          />
        </div>
      </form>
    </Modal>
  );
}

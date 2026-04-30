import { useState } from 'react';
import {
  Plus, Edit3, Trash2, BookOpen, Users, Thermometer,
  Sun, Cloud, CloudRain, CloudSnow, Wind, Snowflake, CloudSun,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WEATHER_OPTIONS } from '../data/seed';
import { formatDate, classNames } from '../utils/format';
import EmptyState from './EmptyState';
import DiaryEntryFormModal from './DiaryEntryFormModal';
import ConfirmDialog from './ConfirmDialog';

const WEATHER_ICONS = {
  sunny: Sun, partly: CloudSun, cloudy: Cloud,
  rain: CloudRain, snow: CloudSnow, windy: Wind, frost: Snowflake,
};

export default function DiaryTab({ project }) {
  const { diaryForProject, deleteDiaryEntry, isClient } = useApp();
  const entries = diaryForProject(project.id);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  return (
    <div className="space-y-4">
      {/* Toolbar — only managers/owners can write entries */}
      {!isClient && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-600">
            <span className="font-semibold text-ink-900 tabular-nums">{entries.length}</span>
            <span className="text-ink-500"> {entries.length === 1 ? 'záznam' : entries.length >= 2 && entries.length <= 4 ? 'záznamy' : 'záznamů'}</span>
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="btn btn-primary btn-lg"
          >
            <Plus className="w-5 h-5" />
            Zápis
          </button>
        </div>
      )}

      {/* List */}
      {entries.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookOpen}
            title="Zatím žádné záznamy"
            description={isClient
              ? 'Stavbyvedoucí zatím nezapsal žádný záznam.'
              : 'Zapisujte denní průběh stavby — počasí, kdo pracoval, co se dělalo. Slouží jako stavební deník.'}
            action={
              !isClient && (
                <button onClick={() => setCreating(true)} className="btn btn-primary btn-lg">
                  <Plus className="w-5 h-5" /> První zápis
                </button>
              )
            }
            className="py-12"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              isClient={isClient}
              onEdit={() => setEditing(entry)}
              onDelete={() => setConfirmDelete(entry)}
            />
          ))}
        </div>
      )}

      <DiaryEntryFormModal
        open={creating}
        onClose={() => setCreating(false)}
        projectId={project.id}
      />
      <DiaryEntryFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        projectId={project.id}
        entry={editing}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteDiaryEntry(confirmDelete.id)}
        title="Smazat záznam?"
        description={`Záznam z ${confirmDelete && formatDate(confirmDelete.date)} bude trvale odstraněn.`}
        confirmLabel="Smazat"
        danger
      />
    </div>
  );
}

function DiaryEntryCard({ entry, isClient, onEdit, onDelete }) {
  const WeatherIcon = WEATHER_ICONS[entry.weather] || Sun;
  const weatherInfo = WEATHER_OPTIONS[entry.weather];
  const isToday = entry.date === new Date().toISOString().slice(0, 10);

  return (
    <article className="card overflow-hidden">
      {/* Top: Date + meta */}
      <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-3 bg-ink-50/40">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white border border-ink-200 flex-shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-500 leading-none">
            {new Date(entry.date).toLocaleDateString('cs-CZ', { month: 'short' }).replace('.', '')}
          </span>
          <span className="font-display font-bold text-ink-900 tabular-nums leading-none mt-1">
            {new Date(entry.date).getDate()}.
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">
            {new Date(entry.date).toLocaleDateString('cs-CZ', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
            {isToday && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-400 text-ink-900">
                DNES
              </span>
            )}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">{entry.authorName}</p>
        </div>

        {/* Weather + temp + workers */}
        <div className="flex items-center gap-3 flex-shrink-0 text-xs">
          <span className="inline-flex items-center gap-1 text-ink-700" title={weatherInfo?.label}>
            <WeatherIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{weatherInfo?.label}</span>
          </span>
          {entry.tempC !== null && (
            <span className="inline-flex items-center gap-1 text-ink-700 font-mono tabular-nums">
              <Thermometer className="w-3.5 h-3.5 text-ink-400" />
              {entry.tempC}°
            </span>
          )}
          {entry.workersCount !== null && (
            <span className="inline-flex items-center gap-1 text-ink-700 font-mono tabular-nums">
              <Users className="w-3.5 h-3.5 text-ink-400" />
              {entry.workersCount}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line">
          {entry.workDone}
        </p>

        {entry.issues && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">{entry.issues}</p>
          </div>
        )}
      </div>

      {/* Actions — only non-clients */}
      {!isClient && (
        <div className="px-4 py-2 border-t border-ink-100 flex items-center justify-end gap-1">
          <button type="button" onClick={onEdit} className="btn btn-ghost btn-sm">
            <Edit3 className="w-3.5 h-3.5" />
            Upravit
          </button>
          <button type="button" onClick={onDelete} className="btn btn-danger btn-sm">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </article>
  );
}

import { useState } from 'react';
import {
  Plus, Edit3, Trash2, ChevronUp, ChevronDown, CheckCircle2,
  HardHat, AlertTriangle, RefreshCcw, Hammer, Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_TYPES } from '../data/seed';
import { formatCZK, formatDate, classNames } from '../utils/format';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import EmptyState from './EmptyState';
import StageFormModal from './StageFormModal';
import ConfirmDialog from './ConfirmDialog';

export default function StagesTab({ project }) {
  const { deleteStage, moveStage, replaceStagesFromTemplate } = useApp();
  const [editingStage, setEditingStage] = useState(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const stages = [...(project.stages || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const completedCount = stages.filter((s) => (s.progress ?? 0) >= 100).length;
  const TypeIcon = project.type === 'rekonstrukce' ? Hammer : Building2;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-600">
            <span className="font-semibold text-ink-900 tabular-nums">{completedCount}</span>
            <span className="text-ink-500"> / {stages.length} dokončeno</span>
          </p>
          <Badge color={PROJECT_TYPES[project.type]?.color || 'slate'} icon={TypeIcon}>
            {PROJECT_TYPES[project.type]?.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="btn btn-outline text-xs"
            title="Nahradit etapy výchozí šablonou pro tento typ projektu"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Šablona</span>
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nová etapa
          </button>
        </div>
      </div>

      {/* Stages list */}
      {stages.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={HardHat}
            title="Žádné etapy"
            description="Přidejte etapy nebo načtěte výchozí šablonu pro tento typ projektu."
            action={
              <div className="flex gap-2">
                <button onClick={() => setConfirmReset(true)} className="btn btn-outline">
                  <RefreshCcw className="w-4 h-4" /> Načíst šablonu
                </button>
                <button onClick={() => setCreating(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" /> Nová etapa
                </button>
              </div>
            }
            className="py-12"
          />
        </div>
      ) : (
        <ol className="card divide-y divide-ink-100 overflow-hidden">
          {stages.map((stage, idx) => {
            const stageOver = stage.actualCost > stage.budget;
            const stageBudgetPct = stage.budget > 0 ? (stage.actualCost / stage.budget) * 100 : 0;
            const isComplete = (stage.progress ?? 0) >= 100;
            const isActive = (stage.progress ?? 0) > 0 && (stage.progress ?? 0) < 100;

            return (
              <li key={stage.id} className="p-4 md:p-5 hover:bg-ink-50/40 transition-colors">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Step + reorder controls */}
                  <div className="flex flex-col items-center pt-1 gap-1.5">
                    <div className={classNames(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      isComplete && 'bg-emerald-500 text-white',
                      isActive && 'bg-accent-400 text-ink-900',
                      !isActive && !isComplete && 'bg-ink-100 text-ink-500',
                    )}>
                      {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveStage(project.id, stage.id, -1)}
                        className="p-0.5 text-ink-400 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Posunout nahoru"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => moveStage(project.id, stage.id, 1)}
                        className="p-0.5 text-ink-400 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Posunout dolů"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-ink-900">{stage.label}</h3>
                      {isComplete && <Badge color="emerald">Hotovo</Badge>}
                      {isActive && <Badge color="amber">Probíhá</Badge>}
                      {stageOver && <Badge color="red" icon={AlertTriangle}>+ rozpočet</Badge>}
                    </div>

                    {stage.description && (
                      <p className="text-xs text-ink-600 mb-2">{stage.description}</p>
                    )}

                    {(stage.startDate || stage.endDate) && (
                      <p className="text-xs text-ink-500 mb-3">
                        {formatDate(stage.startDate)} → {formatDate(stage.endDate)}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-ink-500 font-semibold uppercase tracking-wider">Postup</span>
                          <span className="font-mono tabular-nums font-bold">{stage.progress ?? 0} %</span>
                        </div>
                        <ProgressBar value={stage.progress ?? 0} size="sm" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-ink-500 font-semibold uppercase tracking-wider">Rozpočet</span>
                          <span className={classNames(
                            'font-mono tabular-nums font-bold',
                            stageOver && 'text-red-600'
                          )}>
                            {Math.round(stageBudgetPct)} %
                          </span>
                        </div>
                        <p className="text-xs text-ink-700 tabular-nums">
                          {formatCZK(stage.actualCost, { compact: true })}
                          <span className="text-ink-400"> / {formatCZK(stage.budget, { compact: true })}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingStage(stage)}
                      className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-colors"
                      aria-label="Upravit etapu"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(stage)}
                      className="p-2 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Smazat etapu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <StageFormModal
        open={creating}
        onClose={() => setCreating(false)}
        projectId={project.id}
      />
      <StageFormModal
        open={!!editingStage}
        onClose={() => setEditingStage(null)}
        projectId={project.id}
        stage={editingStage}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteStage(project.id, confirmDelete.id)}
        title="Smazat etapu?"
        description={`Etapa "${confirmDelete?.label}" bude trvale odstraněna.`}
        confirmLabel="Smazat etapu"
        danger
      />
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => replaceStagesFromTemplate(project.id, project.type)}
        title="Načíst výchozí šablonu?"
        description={`Stávající etapy budou nahrazeny výchozí šablonou pro typ "${PROJECT_TYPES[project.type]?.label}". Postup a náklady etap se vynulují.`}
        confirmLabel="Nahradit etapy"
        danger
      />
    </div>
  );
}

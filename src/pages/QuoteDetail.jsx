import { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Edit3, Trash2, Plus, Package,
  FileText, Building2, Hammer, Send, Check, X as XIcon,
  Calendar, MapPin, User, ArrowRightCircle,
  Mail, Phone, FolderPlus, Eye, MoreVertical, Copy,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUOTE_STATUSES, QUOTE_LINE_TYPES, PROJECT_TYPES } from '../data/seed';
import { formatCZK, formatDate, classNames, todayISO } from '../utils/format';
import { calcQuoteTotals, calcLineTotal, groupLinesBySections, daysUntilExpiry } from '../utils/quoteCalc';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import QuoteFormModal from '../components/QuoteFormModal';
import MaterialPickerDrawer from '../components/MaterialPickerDrawer';
import QuoteLineFormModal from '../components/QuoteLineFormModal';
import SectionFormModal from '../components/SectionFormModal';
import InlineQtyStepper from '../components/InlineQtyStepper';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getQuote, getClient, deleteQuote, updateQuote,
    addQuoteLines, updateQuoteLine, deleteQuoteLine,
    convertQuoteToProject,
  } = useApp();

  const [editingHeader, setEditingHeader] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickingMaterialFor, setPickingMaterialFor] = useState(null); // section title or null
  const [editingLine, setEditingLine] = useState(null);
  const [creatingLineForSection, setCreatingLineForSection] = useState(undefined); // undefined = closed; null/string = section
  const [editingSection, setEditingSection] = useState(null); // {title} or null
  const [creatingSection, setCreatingSection] = useState(false);
  const [confirmConvert, setConfirmConvert] = useState(false);

  const quote = getQuote(id);

  if (!quote) {
    return (
      <div className="px-4 md:px-8 py-12 max-w-3xl mx-auto">
        <EmptyState
          icon={FileText}
          title="Nabídka nenalezena"
          description="Tato nabídka neexistuje nebo byla odstraněna."
          action={
            <Link to="/nabidky" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" /> Zpět na seznam
            </Link>
          }
        />
      </div>
    );
  }

  const client = getClient(quote.clientId);
  const status = QUOTE_STATUSES[quote.status];
  const projectType = PROJECT_TYPES[quote.type] || PROJECT_TYPES.novostavba;
  const TypeIcon = quote.type === 'rekonstrukce' ? Hammer : Building2;

  const lines = quote.lines || [];
  const totals = useMemo(() => calcQuoteTotals(quote), [quote]);
  const sections = useMemo(() => groupLinesBySections(lines), [lines]);

  const isReadOnly = quote.status === 'approved' || quote.status === 'rejected';
  const isApproved = quote.status === 'approved';

  // Saved indicator
  const lastSaved = quote.updatedAt ? new Date(quote.updatedAt) : null;

  const handleSendToClient = () => {
    updateQuote(quote.id, { status: 'sent', sentDate: todayISO() });
  };
  const handleApprove = () => {
    updateQuote(quote.id, { status: 'approved', decidedDate: todayISO() });
  };
  const handleReject = () => {
    updateQuote(quote.id, { status: 'rejected', decidedDate: todayISO() });
  };
  const handleConvert = () => {
    const newProject = convertQuoteToProject(quote.id);
    if (newProject) navigate(`/projekty/${newProject.id}`);
  };
  const handleDelete = () => {
    deleteQuote(quote.id);
    navigate('/nabidky');
  };

  // Rename section: update all lines with old title
  const handleRenameSection = (oldTitle, newTitle) => {
    if (!newTitle || newTitle === oldTitle) return;
    lines.forEach((l) => {
      if (l.sectionTitle === oldTitle) {
        updateQuoteLine(quote.id, l.id, { sectionTitle: newTitle });
      }
    });
  };

  // Create empty section by adding a placeholder line — actually we just open material picker for that section
  // (so user picks something into it directly)

  return (
    <>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/nabidky" className="hover:text-ink-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Nabídky
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink-700 font-mono text-xs">{quote.number}</span>
          </>
        }
        title={quote.title}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            <Badge color={projectType.color} icon={TypeIcon}>{projectType.label}</Badge>
            <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
            <span className="inline-flex items-center gap-1 text-ink-600 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              {quote.address}
            </span>
          </span>
        }
        actions={
          <>
            {quote.status === 'sent' && (
              <Link to={`/nabidky/${quote.id}/nahled`} className="btn btn-outline">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Náhled klienta</span>
              </Link>
            )}
            {!isReadOnly && (
              <button type="button" onClick={() => setEditingHeader(true)} className="btn btn-outline">
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Upravit</span>
              </button>
            )}
            <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-danger">
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Smazat</span>
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-5 md:py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-5">
          {/* ===================== Main column ===================== */}
          <div className="space-y-4 min-w-0">

            {/* CTA banners */}
            {isApproved && !quote.projectId && (
              <div className="card p-4 border-l-4 border-emerald-400 bg-emerald-50 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <ArrowRightCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-900">Klient nabídku schválil!</p>
                  <p className="text-sm text-emerald-800 mt-0.5">
                    Převést na projekt s rozpočtem {formatCZK(totals.total)}?
                  </p>
                </div>
                <button type="button" onClick={() => setConfirmConvert(true)} className="btn btn-primary">
                  <ArrowRightCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Vytvořit projekt</span>
                </button>
              </div>
            )}

            {quote.projectId && (
              <Link
                to={`/projekty/${quote.projectId}`}
                className="card card-hover p-4 border-l-4 border-emerald-400 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">Z této nabídky vznikl projekt</p>
                  <p className="text-sm text-ink-600 mt-0.5">Klikněte pro zobrazení</p>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-400 group-hover:text-ink-900" />
              </Link>
            )}

            {/* Description card */}
            {quote.description && (
              <section className="card p-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1.5">Popis</p>
                <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line">{quote.description}</p>
              </section>
            )}

            {/* === Sections === */}
            <section>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h2 className="font-display text-lg font-bold text-ink-900">
                  Položky <span className="text-ink-500 font-mono tabular-nums text-base">({lines.length})</span>
                </h2>
                {!isReadOnly && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCreatingSection(true)}
                      className="btn btn-ghost text-xs"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sekce</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickingMaterialFor(null)}
                      className="btn btn-outline"
                    >
                      <Package className="w-4 h-4" />
                      <span className="hidden sm:inline">Z katalogu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreatingLineForSection(null)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Práce / ostatní</span>
                    </button>
                  </div>
                )}
              </div>

              {lines.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={FileText}
                    title="Zatím žádné položky"
                    description={isReadOnly
                      ? 'Nabídka je uzamčená a neobsahuje žádné položky.'
                      : 'Začněte výběrem materiálu z katalogu nebo přidejte vlastní položku.'}
                    action={!isReadOnly && (
                      <div className="flex gap-2">
                        <button onClick={() => setPickingMaterialFor(null)} className="btn btn-outline">
                          <Package className="w-4 h-4" /> Z katalogu
                        </button>
                        <button onClick={() => setCreatingLineForSection(null)} className="btn btn-primary">
                          <Plus className="w-4 h-4" /> Vlastní
                        </button>
                      </div>
                    )}
                    className="py-12"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section) => (
                    <SectionBlock
                      key={section.key}
                      section={section}
                      readOnly={isReadOnly}
                      quoteId={quote.id}
                      onAddMaterial={() => setPickingMaterialFor(section.title)}
                      onAddCustom={() => setCreatingLineForSection(section.title)}
                      onRenameSection={() => setEditingSection({ title: section.title })}
                      onUpdateLineQty={(line, qty) => updateQuoteLine(quote.id, line.id, { quantity: qty })}
                      onEditLine={(line) => setEditingLine(line)}
                      onDeleteLine={(line) => deleteQuoteLine(quote.id, line.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Note for client */}
            {quote.note && (
              <section className="card p-4 bg-amber-50 border-amber-200 border-l-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700 mb-1.5">Poznámka pro klienta</p>
                <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line italic">{quote.note}</p>
              </section>
            )}

            {/* Action bar */}
            {!isReadOnly && lines.length > 0 && (
              <div className="card p-4 bg-ink-50/40 flex items-center gap-2 flex-wrap justify-end">
                {quote.status === 'draft' && (
                  <button type="button" onClick={handleSendToClient} className="btn btn-primary btn-lg">
                    <Send className="w-4 h-4" />
                    Odeslat klientovi
                  </button>
                )}
                {quote.status === 'sent' && (
                  <>
                    <button type="button" onClick={handleReject}
                      className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50">
                      <XIcon className="w-4 h-4" />
                      Zamítnuto klientem
                    </button>
                    <button type="button" onClick={handleApprove}
                      className="btn btn-lg bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600">
                      <Check className="w-4 h-4" />
                      Schváleno klientem
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ===================== Sticky summary sidebar ===================== */}
          <SummaryPanel
            quote={quote}
            client={client}
            totals={totals}
            lastSaved={lastSaved}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      <QuoteFormModal
        open={editingHeader}
        onClose={() => setEditingHeader(false)}
        quote={quote}
      />

      <MaterialPickerDrawer
        open={pickingMaterialFor !== null && pickingMaterialFor !== undefined}
        onClose={() => setPickingMaterialFor(null)}
        defaultSection={pickingMaterialFor}
        onPickMany={(newLines) => addQuoteLines(quote.id, newLines)}
      />

      <QuoteLineFormModal
        open={creatingLineForSection !== undefined}
        onClose={() => setCreatingLineForSection(undefined)}
        defaultSection={creatingLineForSection}
        onSave={(data) => addQuoteLines(quote.id, [data])}
      />
      <QuoteLineFormModal
        open={!!editingLine}
        onClose={() => setEditingLine(null)}
        line={editingLine}
        onSave={(data) => updateQuoteLine(quote.id, editingLine.id, data)}
      />

      <SectionFormModal
        open={creatingSection}
        onClose={() => setCreatingSection(false)}
        onSave={(title) => {
          // Add section by creating a placeholder via material picker
          setCreatingSection(false);
          setPickingMaterialFor(title);
        }}
      />

      <SectionFormModal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        initial={editingSection?.title}
        onSave={(newTitle) => handleRenameSection(editingSection.title, newTitle)}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Smazat nabídku?"
        description={`Nabídka ${quote.number} bude trvale odstraněna.`}
        confirmLabel="Smazat"
        danger
      />

      <ConfirmDialog
        open={confirmConvert}
        onClose={() => setConfirmConvert(false)}
        onConfirm={handleConvert}
        title="Vytvořit projekt z nabídky?"
        description={`Vznikne nový projekt s rozpočtem ${formatCZK(totals.total)}. Etapy budou vytvořeny ze sekcí v nabídce, takže klient i tým uvidí stejnou strukturu jako v nabídce.`}
        confirmLabel="Vytvořit projekt"
      />
    </>
  );
}

// ============================================================
// SECTION BLOCK
// ============================================================
function SectionBlock({
  section, readOnly, onAddMaterial, onAddCustom, onRenameSection,
  onUpdateLineQty, onEditLine, onDeleteLine,
}) {
  const hasTitle = !!section.title;
  return (
    <div className="card overflow-hidden">
      {/* Section header */}
      <header className={classNames(
        'px-4 py-2.5 flex items-center justify-between gap-2 border-b border-ink-100',
        hasTitle ? 'bg-ink-900 text-white' : 'bg-ink-50'
      )}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasTitle ? (
            <>
              <p className="font-display font-bold text-sm truncate">{section.title}</p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onRenameSection}
                  className="text-ink-400 hover:text-white p-1 -m-1"
                  aria-label="Přejmenovat sekci"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[10px] text-ink-400 tabular-nums">
                · {section.lines.length} {section.lines.length === 1 ? 'pol.' : 'pol.'}
              </span>
            </>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Bez sekce
            </p>
          )}
        </div>
        <p className={classNames(
          'font-mono tabular-nums font-bold text-sm flex-shrink-0',
          hasTitle ? 'text-accent-400' : 'text-ink-900'
        )}>
          {formatCZK(section.subtotal, { compact: true })}
        </p>
      </header>

      {/* Lines */}
      <div className="divide-y divide-ink-100">
        {section.lines.map((line) => (
          <LineRow
            key={line.id}
            line={line}
            readOnly={readOnly}
            onUpdateQty={(qty) => onUpdateLineQty(line, qty)}
            onEdit={() => onEditLine(line)}
            onDelete={() => onDeleteLine(line)}
          />
        ))}
      </div>

      {/* Add to section */}
      {!readOnly && hasTitle && (
        <footer className="px-3 py-2 bg-ink-50/40 border-t border-ink-100 flex items-center gap-2">
          <button
            type="button"
            onClick={onAddMaterial}
            className="text-xs font-semibold text-ink-600 hover:text-ink-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-ink-100"
          >
            <Package className="w-3 h-3" />
            Materiál
          </button>
          <button
            type="button"
            onClick={onAddCustom}
            className="text-xs font-semibold text-ink-600 hover:text-ink-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-ink-100"
          >
            <Plus className="w-3 h-3" />
            Práce / ostatní
          </button>
        </footer>
      )}
    </div>
  );
}

// ============================================================
// LINE ROW with inline qty editing
// ============================================================
function LineRow({ line, readOnly, onUpdateQty, onEdit, onDelete }) {
  const lineTypeInfo = QUOTE_LINE_TYPES[line.type];
  const lineTotal = calcLineTotal(line);

  return (
    <div className="p-3 hover:bg-ink-50/30 transition-colors group">
      <div className="flex items-start gap-3">
        {/* Type indicator */}
        <span
          className={classNames(
            'w-1 self-stretch rounded-full flex-shrink-0',
            line.type === 'material' ? 'bg-blue-300' :
            line.type === 'work' ? 'bg-amber-400' : 'bg-slate-300'
          )}
          title={lineTypeInfo?.label}
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-900 text-sm leading-snug">{line.name}</p>
          {line.note && (
            <p className="text-xs text-ink-500 mt-0.5 italic line-clamp-1">{line.note}</p>
          )}

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {readOnly ? (
              <span className="text-xs font-mono tabular-nums text-ink-700">
                {line.quantity} {line.unit} × {formatCZK(line.unitPrice)}
              </span>
            ) : (
              <>
                <InlineQtyStepper
                  value={line.quantity}
                  unit={line.unit}
                  onChange={onUpdateQty}
                />
                <span className="text-xs text-ink-500 tabular-nums">
                  × {formatCZK(line.unitPrice)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-display text-base font-bold tabular-nums text-ink-900">
            {formatCZK(lineTotal)}
          </p>
        </div>

        {!readOnly && (
          <div className="flex flex-col gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded text-ink-500 hover:text-ink-900 hover:bg-ink-100"
              aria-label="Upravit položku"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded text-ink-400 hover:text-red-600 hover:bg-red-50"
              aria-label="Smazat položku"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY PANEL (sticky sidebar on desktop, normal block on mobile)
// ============================================================
function SummaryPanel({ quote, client, totals, lastSaved }) {
  const expiry = daysUntilExpiry(quote.validUntil);

  // Distribution percentages for the bar
  const total = totals.subtotal || 1;
  const pctMat = (totals.byType.material / total) * 100;
  const pctWork = (totals.byType.work / total) * 100;
  const pctOther = (totals.byType.other / total) * 100;

  return (
    <aside className="lg:sticky lg:top-4 self-start space-y-3">
      {/* Total card — hero */}
      <div className="card p-5 bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-900">
        <p className="text-[10px] uppercase tracking-wider font-bold text-accent-400 mb-1">
          Celková cena nabídky
        </p>
        <p className="font-display text-3xl font-extrabold tabular-nums leading-none">
          {formatCZK(totals.total)}
        </p>
        <p className="text-xs text-ink-300 mt-1.5">
          {totals.lineCount} {totals.lineCount === 1 ? 'položka' : totals.lineCount <= 4 ? 'položky' : 'položek'}
        </p>

        {/* Distribution bar */}
        {totals.subtotal > 0 && (
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded-full overflow-hidden bg-ink-700 flex">
              {pctMat > 0 && <div className="h-full bg-blue-400" style={{ width: `${pctMat}%` }} />}
              {pctWork > 0 && <div className="h-full bg-accent-400" style={{ width: `${pctWork}%` }} />}
              {pctOther > 0 && <div className="h-full bg-slate-400" style={{ width: `${pctOther}%` }} />}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-300">
              {totals.byType.material > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Materiál {Math.round(pctMat)}%
                </span>
              )}
              {totals.byType.work > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                  Práce {Math.round(pctWork)}%
                </span>
              )}
              {totals.byType.other > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Ostatní {Math.round(pctOther)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validity countdown */}
      {expiry !== null && quote.status === 'sent' && (
        <ValidityCountdown days={expiry} validUntil={quote.validUntil} />
      )}

      {/* Breakdown */}
      {totals.subtotal > 0 && (
        <div className="card p-4 text-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2">
            Rozpočet
          </p>
          <dl className="space-y-1.5">
            {totals.byType.material > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-600">Materiál</dt>
                <dd className="font-mono tabular-nums">{formatCZK(totals.byType.material, { compact: true })}</dd>
              </div>
            )}
            {totals.byType.work > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-600">Práce</dt>
                <dd className="font-mono tabular-nums">{formatCZK(totals.byType.work, { compact: true })}</dd>
              </div>
            )}
            {totals.byType.other > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-600">Ostatní</dt>
                <dd className="font-mono tabular-nums">{formatCZK(totals.byType.other, { compact: true })}</dd>
              </div>
            )}
            <div className="pt-1.5 mt-1.5 border-t border-ink-100 flex justify-between font-semibold text-ink-700">
              <dt>Bez marže</dt>
              <dd className="font-mono tabular-nums">{formatCZK(totals.subtotal, { compact: true })}</dd>
            </div>
            <div className="flex justify-between text-xs">
              <dt className="text-ink-500">+ marže materiál ({totals.marginRateMaterial} %)</dt>
              <dd className="font-mono tabular-nums text-ink-600">{formatCZK(totals.marginMaterial, { compact: true })}</dd>
            </div>
            <div className="flex justify-between text-xs">
              <dt className="text-ink-500">+ marže práce ({totals.marginRateLabor} %)</dt>
              <dd className="font-mono tabular-nums text-ink-600">{formatCZK(totals.marginLabor, { compact: true })}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Client mini */}
      {client && (
        <div className="card p-4 text-sm">
          <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2 flex items-center gap-1">
            <User className="w-3 h-3" /> Klient
          </p>
          <p className="font-semibold text-ink-900 leading-tight">{client.name}</p>
          {client.company && <p className="text-xs text-ink-500 mt-0.5">{client.company}</p>}
          <div className="mt-2 space-y-1 text-xs">
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-ink-700 hover:text-ink-900 break-all">
                <Mail className="w-3 h-3 text-ink-400" />
                {client.email}
              </a>
            )}
            {client.phone && (
              <a href={`tel:${client.phone.replace(/\s/g,'')}`} className="flex items-center gap-1.5 text-ink-700 hover:text-ink-900">
                <Phone className="w-3 h-3 text-ink-400" />
                {client.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="text-xs text-ink-500 inline-flex items-center gap-1.5 px-3">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Uloženo {formatRelativeTime(lastSaved)}
        </div>
      )}
    </aside>
  );
}

// ============================================================
// VALIDITY COUNTDOWN
// ============================================================
function ValidityCountdown({ days, validUntil }) {
  const isExpired = days < 0;
  const isUrgent = days >= 0 && days <= 7;
  const totalRange = 30; // baseline 30 days
  const pct = Math.max(0, Math.min(100, (days / totalRange) * 100));

  const color = isExpired ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-emerald-600';
  const bgColor = isExpired ? 'bg-red-100' : isUrgent ? 'bg-amber-100' : 'bg-emerald-100';
  const ringColor = isExpired ? 'stroke-red-500' : isUrgent ? 'stroke-amber-500' : 'stroke-emerald-500';

  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeLinecap="round"
            className={ringColor}
            style={{
              strokeDasharray: `${pct * 0.97} 100`,
              transition: 'stroke-dasharray 0.3s ease-out',
            }}
          />
        </svg>
        <div className={classNames(
          'absolute inset-0 flex items-center justify-center font-display font-extrabold text-base tabular-nums',
          color
        )}>
          {Math.abs(days)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {isExpired ? (
          <>
            <p className="font-semibold text-red-700 inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Platnost vypršela
            </p>
            <p className="text-xs text-ink-500 mt-0.5">
              Před {Math.abs(days)} dny ({formatDate(validUntil)})
            </p>
          </>
        ) : (
          <>
            <p className={classNames('font-semibold', isUrgent ? 'text-amber-700' : 'text-ink-900')}>
              Platí ještě {days} {days === 1 ? 'den' : days >= 2 && days <= 4 ? 'dny' : 'dní'}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">do {formatDate(validUntil)}</p>
          </>
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return 'právě teď';
  if (seconds < 60) return 'před chvílí';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `před ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `před ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `před ${days} d`;
  return formatDate(date.toISOString().slice(0, 10));
}

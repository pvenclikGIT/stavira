import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Edit3, Trash2, Plus, Package,
  FileText, Building2, Hammer, Send, Check, X as XIcon,
  Calendar, MapPin, User, ArrowRightCircle, Calculator,
  Mail, Phone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUOTE_STATUSES, QUOTE_LINE_TYPES, PROJECT_TYPES } from '../data/seed';
import { formatCZK, formatDate, classNames, todayISO } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import QuoteFormModal from '../components/QuoteFormModal';
import MaterialPickerModal from '../components/MaterialPickerModal';
import QuoteLineFormModal from '../components/QuoteLineFormModal';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getQuote, getClient, deleteQuote, updateQuote,
    addQuoteLine, updateQuoteLine, deleteQuoteLine,
    convertQuoteToProject,
  } = useApp();

  const [editingHeader, setEditingHeader] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickingMaterial, setPickingMaterial] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [creatingLine, setCreatingLine] = useState(false);
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

  const totals = useMemo(() => {
    const byType = { material: 0, work: 0, other: 0 };
    let subtotal = 0;
    lines.forEach((l) => {
      const lineTotal = (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0);
      byType[l.type] = (byType[l.type] || 0) + lineTotal;
      subtotal += lineTotal;
    });
    const margin = Math.round(subtotal * (Number(quote.marginPercent) || 0) / 100);
    const total = subtotal + margin;
    return { byType, subtotal, margin, total };
  }, [lines, quote.marginPercent]);

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
    if (newProject) {
      navigate(`/projekty/${newProject.id}`);
    }
  };
  const handleDelete = () => {
    deleteQuote(quote.id);
    navigate('/nabidky');
  };

  const isReadOnly = quote.status === 'approved' || quote.status === 'rejected';
  const isApproved = quote.status === 'approved';

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

      <div className="px-4 md:px-8 py-5 md:py-6 max-w-5xl mx-auto space-y-5">
        {/* Approved → project conversion CTA */}
        {isApproved && !quote.projectId && (
          <div className="card p-4 md:p-5 border-l-4 border-emerald-400 bg-emerald-50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <ArrowRightCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-900">Klient nabídku schválil!</p>
              <p className="text-sm text-emerald-800 mt-0.5">
                Převést tuto nabídku na realizační projekt s rozpočtem {formatCZK(totals.total)}?
              </p>
            </div>
            <button type="button" onClick={() => setConfirmConvert(true)} className="btn btn-primary">
              <ArrowRightCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Vytvořit projekt</span>
            </button>
          </div>
        )}

        {/* Already converted */}
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

        {/* Header info grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Client */}
          <section className="card p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2 flex items-center gap-1.5">
              <User className="w-3 h-3" /> Klient
            </p>
            {client ? (
              <>
                <p className="font-semibold text-ink-900">{client.name}</p>
                {client.company && (
                  <p className="text-xs text-ink-500 mt-0.5">{client.company}</p>
                )}
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
              </>
            ) : <p className="text-sm text-ink-500">Bez klienta</p>}
          </section>

          {/* Dates */}
          <section className="card p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Termíny
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Vytvořeno</span>
                <span className="font-mono tabular-nums">{formatDate(quote.createdAt)}</span>
              </div>
              {quote.sentDate && (
                <div className="flex justify-between">
                  <span className="text-ink-500">Odesláno</span>
                  <span className="font-mono tabular-nums">{formatDate(quote.sentDate)}</span>
                </div>
              )}
              {quote.validUntil && (
                <div className="flex justify-between">
                  <span className="text-ink-500">Platí do</span>
                  <span className="font-mono tabular-nums font-bold">{formatDate(quote.validUntil)}</span>
                </div>
              )}
              {quote.decidedDate && (
                <div className="flex justify-between">
                  <span className="text-ink-500">Rozhodnuto</span>
                  <span className="font-mono tabular-nums">{formatDate(quote.decidedDate)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Total */}
          <section className="card p-4 bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-900">
            <p className="text-[10px] uppercase tracking-wider font-bold text-accent-400 mb-2 flex items-center gap-1.5">
              <Calculator className="w-3 h-3" /> Celková cena
            </p>
            <p className="font-display text-3xl font-extrabold tabular-nums">
              {formatCZK(totals.total, { compact: true })}
            </p>
            <p className="text-xs text-ink-300 mt-1 tabular-nums">
              {formatCZK(totals.total)}
            </p>
            <p className="text-[10px] text-ink-400 mt-1">
              vč. marže {quote.marginPercent} %
            </p>
          </section>
        </div>

        {/* Description */}
        {quote.description && (
          <section className="card p-4">
            <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1.5">Popis</p>
            <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line">
              {quote.description}
            </p>
          </section>
        )}

        {/* Lines */}
        <section>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-display text-lg font-bold text-ink-900">
              Položky <span className="text-ink-500 font-mono tabular-nums text-base">({lines.length})</span>
            </h2>
            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickingMaterial(true)}
                  className="btn btn-outline"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Z katalogu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingLine(true)}
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
                  : 'Začněte přidáním materiálu z katalogu Dlabače, nebo vlastní položky pro práci.'}
                action={!isReadOnly && (
                  <div className="flex gap-2">
                    <button onClick={() => setPickingMaterial(true)} className="btn btn-outline">
                      <Package className="w-4 h-4" /> Z katalogu
                    </button>
                    <button onClick={() => setCreatingLine(true)} className="btn btn-primary">
                      <Plus className="w-4 h-4" /> Vlastní
                    </button>
                  </div>
                )}
                className="py-12"
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Group by type */}
              {['material', 'work', 'other'].map((type) => {
                const groupLines = lines.filter((l) => l.type === type);
                if (groupLines.length === 0) return null;
                const typeInfo = QUOTE_LINE_TYPES[type];
                const groupTotal = totals.byType[type];
                return (
                  <div key={type}>
                    <div className="px-4 py-2 bg-ink-50/60 border-b border-ink-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge color={typeInfo?.color || 'slate'}>{typeInfo?.label}</Badge>
                        <span className="text-xs text-ink-500 tabular-nums">
                          {groupLines.length} {groupLines.length === 1 ? 'položka' : groupLines.length >= 2 && groupLines.length <= 4 ? 'položky' : 'položek'}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-bold text-sm text-ink-900">
                        {formatCZK(groupTotal, { compact: true })}
                      </span>
                    </div>
                    <div className="divide-y divide-ink-100">
                      {groupLines.map((line) => (
                        <LineRow
                          key={line.id}
                          line={line}
                          readOnly={isReadOnly}
                          onEdit={() => setEditingLine(line)}
                          onDelete={() => deleteQuoteLine(quote.id, line.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Totals summary */}
        {lines.length > 0 && (
          <section className="card p-4 md:p-5">
            <h3 className="font-display font-bold text-ink-900 mb-3 inline-flex items-center gap-2">
              <Calculator className="w-4 h-4 text-ink-500" />
              Souhrn
            </h3>
            <dl className="space-y-2 text-sm">
              {Object.entries(totals.byType).map(([type, sum]) => sum > 0 && (
                <div key={type} className="flex items-center justify-between">
                  <dt className="text-ink-600">{QUOTE_LINE_TYPES[type]?.label}</dt>
                  <dd className="font-mono tabular-nums">{formatCZK(sum)}</dd>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-ink-100 flex items-center justify-between">
                <dt className="text-ink-600 font-semibold">Mezisoučet</dt>
                <dd className="font-mono tabular-nums font-semibold">{formatCZK(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-600">Marže ({quote.marginPercent} %)</dt>
                <dd className="font-mono tabular-nums">{formatCZK(totals.margin)}</dd>
              </div>
              <div className="pt-3 mt-3 border-t-2 border-ink-200 flex items-center justify-between">
                <dt className="font-display text-lg font-bold text-ink-900">Celkem</dt>
                <dd className="font-display text-2xl font-extrabold tabular-nums text-ink-900">
                  {formatCZK(totals.total)}
                </dd>
              </div>
            </dl>
            {quote.note && (
              <div className="mt-4 pt-4 border-t border-ink-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1">Poznámka pro klienta</p>
                <p className="text-sm text-ink-700 italic">{quote.note}</p>
              </div>
            )}
          </section>
        )}

        {/* Actions bar */}
        {!isReadOnly && lines.length > 0 && (
          <div className="card p-4 md:p-5 bg-ink-50/40 flex items-center gap-2 flex-wrap justify-end">
            {quote.status === 'draft' && (
              <button type="button" onClick={handleSendToClient} className="btn btn-primary btn-lg">
                <Send className="w-4 h-4" />
                Odeslat klientovi
              </button>
            )}
            {quote.status === 'sent' && (
              <>
                <button type="button" onClick={handleReject} className="btn btn-outline border-red-300 text-red-700 hover:bg-red-50">
                  <XIcon className="w-4 h-4" />
                  Zamítnuto klientem
                </button>
                <button type="button" onClick={handleApprove} className="btn btn-primary btn-lg bg-emerald-600 hover:bg-emerald-700 border-emerald-600">
                  <Check className="w-4 h-4" />
                  Schváleno klientem
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuoteFormModal
        open={editingHeader}
        onClose={() => setEditingHeader(false)}
        quote={quote}
      />

      <MaterialPickerModal
        open={pickingMaterial}
        onClose={() => setPickingMaterial(false)}
        onPick={(material, qty) => {
          addQuoteLine(quote.id, {
            type: 'material',
            materialId: material.id,
            name: material.name + (material.packaging ? ` (${material.packaging})` : ''),
            quantity: qty,
            unit: material.unit,
            unitPrice: material.priceVAT,
            note: '',
          });
        }}
      />

      <QuoteLineFormModal
        open={creatingLine}
        onClose={() => setCreatingLine(false)}
        onSave={(data) => addQuoteLine(quote.id, data)}
      />
      <QuoteLineFormModal
        open={!!editingLine}
        onClose={() => setEditingLine(null)}
        line={editingLine}
        onSave={(data) => updateQuoteLine(quote.id, editingLine.id, data)}
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
        description={`Vznikne nový projekt s rozpočtem ${formatCZK(totals.total)} a etapami pro typ "${projectType.label}". Nabídku můžete dále editovat, ale propojení zůstane zachováno.`}
        confirmLabel="Vytvořit projekt"
      />
    </>
  );
}

function LineRow({ line, readOnly, onEdit, onDelete }) {
  const lineTotal = (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
  return (
    <div className="p-3 md:p-4 hover:bg-ink-50/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-900 text-sm leading-tight">{line.name}</p>
          {line.note && (
            <p className="text-xs text-ink-500 mt-1 italic">{line.note}</p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-600 flex-wrap">
            <span className="font-mono tabular-nums">
              {line.quantity} {line.unit} × {formatCZK(line.unitPrice)}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-display text-base font-bold tabular-nums text-ink-900">
            {formatCZK(lineTotal)}
          </p>
        </div>

        {!readOnly && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button type="button" onClick={onEdit}
              className="p-2 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100"
              aria-label="Upravit položku">
              <Edit3 className="w-4 h-4" />
            </button>
            <button type="button" onClick={onDelete}
              className="p-2 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50"
              aria-label="Smazat položku">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

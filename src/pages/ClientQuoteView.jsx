import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Building2, Hammer, Calendar, MapPin, Check, X as XIcon,
  ArrowLeft, ShieldCheck, Clock, FileText,
  Phone, Mail, Sparkles, Package, Wrench, MoreHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUOTE_STATUSES, PROJECT_TYPES } from '../data/seed';
import { formatCZK, formatDate, classNames, todayISO } from '../utils/format';
import { calcQuoteTotals, calcLineTotal, groupLinesBySections, daysUntilExpiry } from '../utils/quoteCalc';
import { MATERIAL_SUPPLIER } from '../data/materials';
import EmptyState from '../components/EmptyState';
import Logo from '../components/Logo';

/**
 * Client-facing quote presentation.
 * Designed as a polished sales document — not an internal table.
 *
 * Layout:
 *   1. Hero — number, title, status, big total
 *   2. Description block
 *   3. Section accordion with breakdown
 *   4. Trust elements (validity, supplier, terms)
 *   5. Sticky decision bar at bottom (mobile-friendly)
 *
 * Used both:
 *   - by the client when viewing their own quote (auto)
 *   - by secretary in "preview mode" via /nabidky/:id/nahled
 */
export default function ClientQuoteView({ previewMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuote, getClient, currentUser, updateQuote } = useApp();

  const quote = getQuote(id);

  if (!quote) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
        <EmptyState
          icon={FileText}
          title="Nabídka nenalezena"
          description="Tato nabídka neexistuje nebo byla odstraněna."
          action={
            <Link to={previewMode ? '/nabidky' : '/'} className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" /> Zpět
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
  const totals = useMemo(() => calcQuoteTotals(quote), [quote]);
  const sections = useMemo(() => groupLinesBySections(quote.lines || []), [quote]);
  const expiryDays = daysUntilExpiry(quote.validUntil);

  const isPending = quote.status === 'sent';
  const canDecide = !previewMode && isPending;

  const handleApprove = () => {
    if (!canDecide) return;
    updateQuote(quote.id, { status: 'approved', decidedDate: todayISO() });
  };
  const handleReject = () => {
    if (!canDecide) return;
    updateQuote(quote.id, { status: 'rejected', decidedDate: todayISO() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 to-white pb-32">
      {/* Preview banner */}
      {previewMode && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2.5 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Náhled nabídky — takto ji uvidí klient
          <Link to={`/nabidky/${quote.id}`} className="ml-2 underline hover:text-amber-700">
            Zpět do editace
          </Link>
        </div>
      )}

      {/* Top bar */}
      <header className="px-4 md:px-8 py-4 max-w-4xl mx-auto flex items-center justify-between">
        <Logo size="sm" />
        {quote.status && (
          <span className={classNames(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
            quote.status === 'sent' && 'bg-amber-100 text-amber-800',
            quote.status === 'approved' && 'bg-emerald-100 text-emerald-800',
            quote.status === 'rejected' && 'bg-red-100 text-red-800',
            quote.status === 'draft' && 'bg-slate-100 text-slate-700',
            quote.status === 'expired' && 'bg-slate-100 text-slate-700',
          )}>
            {status?.label}
          </span>
        )}
      </header>

      <main className="px-4 md:px-8 py-4 max-w-4xl mx-auto space-y-6">
        {/* === Hero === */}
        <section className="card overflow-hidden">
          <div className="p-6 md:p-8 bg-gradient-to-br from-ink-900 to-ink-950 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent-400 text-ink-900 flex items-center justify-center flex-shrink-0">
                <TypeIcon className="w-7 h-7" strokeWidth={2.4} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-400 font-bold">
                  Cenová nabídka {quote.number}
                </p>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold leading-tight mt-1">
                  {quote.title}
                </h1>
                <p className="text-ink-300 text-sm mt-2 inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {quote.address}
                </p>
              </div>
            </div>

            {/* BIG total */}
            <div className="mt-6 pt-6 border-t border-ink-700">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent-400 mb-1">
                Celková cena díla
              </p>
              <p className="font-display text-4xl md:text-5xl font-black tabular-nums leading-none">
                {formatCZK(totals.total)}
              </p>
              <p className="text-xs text-ink-400 mt-2">
                Cena včetně DPH 21 %, dopravy a všech prací uvedených v nabídce.
              </p>
            </div>
          </div>
        </section>

        {/* === Description === */}
        {quote.description && (
          <section className="card p-5 md:p-6">
            <h2 className="font-display text-base font-bold text-ink-900 mb-2">O projektu</h2>
            <p className="text-sm md:text-base text-ink-700 leading-relaxed whitespace-pre-line">
              {quote.description}
            </p>
          </section>
        )}

        {/* === Sections detail === */}
        {sections.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-ink-900">Co všechno cena obsahuje</h2>
              <p className="text-xs text-ink-500 tabular-nums">
                {sections.filter((s) => s.title).length || sections.length} sekcí
              </p>
            </div>
            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <SectionAccordion key={sec.key} section={sec} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* === Validity === */}
        {expiryDays !== null && (
          <section className={classNames(
            'card p-5 flex items-center gap-4',
            expiryDays < 0 ? 'border-red-200 bg-red-50' :
            expiryDays <= 7 ? 'border-amber-200 bg-amber-50' :
            'border-emerald-200 bg-emerald-50'
          )}>
            <div className={classNames(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              expiryDays < 0 ? 'bg-red-100 text-red-700' :
              expiryDays <= 7 ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            )}>
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              {expiryDays < 0 ? (
                <>
                  <p className="font-semibold text-red-900">Platnost nabídky vypršela</p>
                  <p className="text-sm text-red-800 mt-0.5">
                    Pro aktualizaci nás prosím kontaktujte.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-ink-900">
                    Platí ještě {expiryDays} {expiryDays === 1 ? 'den' : expiryDays >= 2 && expiryDays <= 4 ? 'dny' : 'dní'}
                  </p>
                  <p className="text-sm text-ink-700 mt-0.5">
                    Do {formatDate(quote.validUntil)} — po této době můžou být ceny upraveny dle aktuálního ceníku.
                  </p>
                </>
              )}
            </div>
          </section>
        )}

        {/* === Note for client === */}
        {quote.note && (
          <section className="card p-5 border-l-4 border-accent-400 bg-accent-50/40">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent-700 mb-2">
              Důležitá poznámka
            </p>
            <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line">{quote.note}</p>
          </section>
        )}

        {/* === Trust block === */}
        <section className="card p-5 md:p-6">
          <h2 className="font-display text-base font-bold text-ink-900 mb-3 inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Co máme pro vás připraveno
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <TrustItem
              title="Pevná cena"
              description="Nabídka platí přesně tak, jak je. Žádné skryté poplatky."
            />
            <TrustItem
              title="Záruka 5 let"
              description="Na všechny stavební práce poskytujeme zákonnou + prodlouženou záruku."
            />
            <TrustItem
              title="Kvalitní materiál"
              description={`Materiál odebíráme od osvědčených dodavatelů (${MATERIAL_SUPPLIER.name}).`}
            />
          </div>
        </section>

        {/* === Contact / decided info === */}
        {!isPending && quote.decidedDate && (
          <section className={classNames(
            'card p-5 flex items-center gap-4',
            quote.status === 'approved' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
          )}>
            <div className={classNames(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              quote.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            )}>
              {quote.status === 'approved' ? <Check className="w-6 h-6" /> : <XIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink-900">
                {quote.status === 'approved' ? 'Nabídka byla schválena' : 'Nabídka byla zamítnuta'}
              </p>
              <p className="text-sm text-ink-700 mt-0.5">
                Datum: {formatDate(quote.decidedDate)}
              </p>
            </div>
          </section>
        )}

        {/* === Footer with company info === */}
        <footer className="card p-5 bg-ink-50/40">
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-ink-500 mb-2">
            Stavira s.r.o.
          </p>
          <p className="text-sm text-ink-700">Praha 9 — Vinoř</p>
          <p className="text-xs text-ink-500 mt-2">
            V případě dotazů nás neváhejte kontaktovat.
          </p>
        </footer>
      </main>

      {/* === Sticky decision bar (only when pending and not preview) === */}
      {canDecide && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-200 shadow-pop safe-bottom">
          <div className="max-w-4xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleReject}
              className="btn btn-lg btn-outline border-red-300 text-red-700 hover:bg-red-50"
            >
              <XIcon className="w-5 h-5" />
              Zamítnout
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="btn btn-lg bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
            >
              <Check className="w-5 h-5" />
              Schválit za {formatCZK(totals.total, { compact: true })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SECTION ACCORDION
// ============================================================
function SectionAccordion({ section, index }) {
  const hasTitle = !!section.title;
  const stats = section.lines.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <details className="card overflow-hidden group" open={index < 2}>
      <summary className="cursor-pointer list-none px-5 py-4 hover:bg-ink-50/40 transition-colors flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-ink-100 text-ink-700 flex items-center justify-center flex-shrink-0 font-display font-bold tabular-nums text-sm group-open:bg-ink-900 group-open:text-accent-400 transition-colors">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-ink-900 leading-tight">
            {hasTitle ? section.title : 'Ostatní položky'}
          </p>
          <p className="text-xs text-ink-500 mt-0.5 tabular-nums">
            {section.lines.length} {section.lines.length === 1 ? 'položka' : section.lines.length <= 4 ? 'položky' : 'položek'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display font-extrabold tabular-nums text-ink-900">
            {formatCZK(section.subtotal, { compact: true })}
          </p>
          <p className="text-[10px] text-ink-500 group-open:hidden">Klepněte pro detail</p>
        </div>
      </summary>

      {/* Body */}
      <div className="border-t border-ink-100 divide-y divide-ink-100">
        {section.lines.map((line) => <ClientLineRow key={line.id} line={line} />)}
      </div>
    </details>
  );
}

function ClientLineRow({ line }) {
  const total = calcLineTotal(line);
  const Icon = line.type === 'material' ? Package : line.type === 'work' ? Wrench : MoreHorizontal;
  const iconColor = line.type === 'material' ? 'text-blue-600 bg-blue-50' :
                    line.type === 'work' ? 'text-amber-600 bg-amber-50' :
                    'text-slate-600 bg-slate-50';

  return (
    <div className="px-5 py-3 flex items-start gap-3">
      <div className={classNames(
        'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5',
        iconColor
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink-800 leading-snug">{line.name}</p>
        {line.note && (
          <p className="text-xs text-ink-500 mt-0.5 italic">{line.note}</p>
        )}
        <p className="text-[11px] text-ink-500 mt-1 font-mono tabular-nums">
          {line.quantity} {line.unit}
        </p>
      </div>
      <p className="font-mono tabular-nums text-sm font-semibold text-ink-900 flex-shrink-0">
        {formatCZK(total, { compact: true })}
      </p>
    </div>
  );
}

function TrustItem({ title, description }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-3 h-3" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-ink-900 text-sm leading-tight">{title}</p>
        <p className="text-xs text-ink-600 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

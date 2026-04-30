import { useState } from 'react';
import {
  Calendar, MapPin, Receipt, FileText, BookOpen,
  Check, X as XIcon, Building2, Hammer,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_TYPES, INVOICE_STATUSES, CHANGE_ORDER_STATUSES, WEATHER_OPTIONS, QUOTE_STATUSES } from '../data/seed';
import { formatCZK, formatDate, daysFromNow } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

/**
 * Client-only home page — they see ONE project, simply.
 * No tabs, just a top-down vertical scroll: status → fotky/deník → vícepráce → faktury.
 */
export default function ClientHome() {
  const {
    visibleProjects, currentUser,
    invoicesForProject, changeOrdersForProject, diaryForProject,
    decideChangeOrder,
    quotesForClient, updateQuote,
  } = useApp();

  const project = visibleProjects[0];
  const myQuotes = currentUser?.clientId ? quotesForClient(currentUser.clientId) : [];
  // Quote awaiting client decision = sent, not yet decided
  const pendingQuote = myQuotes.find((q) => q.status === 'sent');

  if (!project && myQuotes.length === 0) {
    return (
      <div className="px-4 py-12 max-w-md mx-auto">
        <EmptyState
          icon={Building2}
          title="Zatím žádná stavba"
          description="Jakmile bude vaše stavba zaregistrována, uvidíte ji zde."
        />
      </div>
    );
  }

  // Quote-only client (still considering, no project yet)
  if (!project && myQuotes.length > 0) {
    return <ClientQuoteOnly user={currentUser} quotes={myQuotes} updateQuote={updateQuote} />;
  }

  const TypeIcon = project.type === 'rekonstrukce' ? Hammer : Building2;
  const projectType = PROJECT_TYPES[project.type];
  const invoices = invoicesForProject(project.id);
  const changeOrders = changeOrdersForProject(project.id);
  const diaryEntries = diaryForProject(project.id).slice(0, 3); // last 3 days

  const pendingCO = changeOrders.filter((c) => c.status === 'pending');
  const unpaidInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue' ||
    (i.status === 'sent' && i.dueDate && daysFromNow(i.dueDate) < 0)
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Dobré ráno';
    if (h < 18) return 'Dobré odpoledne';
    return 'Dobrý večer';
  })();

  return (
    <>
      <PageHeader
        title={`${greeting}, ${currentUser?.name?.split(' ')[0] || ''}`}
        subtitle="Aktuální stav vaší stavby."
      />

      <div className="px-4 md:px-8 py-5 max-w-3xl mx-auto space-y-5">

        {/* Pending quote alert — needs decision */}
        {pendingQuote && (
          <ClientQuoteAlert
            quote={pendingQuote}
            onApprove={() => updateQuote(pendingQuote.id, { status: 'approved', decidedDate: new Date().toISOString().slice(0,10) })}
            onReject={() => updateQuote(pendingQuote.id, { status: 'rejected', decidedDate: new Date().toISOString().slice(0,10) })}
          />
        )}

        {/* ===== HERO: Project status ===== */}
        <section className="card overflow-hidden">
          <div className="p-5 border-b border-ink-100">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-ink-900 text-accent-400 flex items-center justify-center flex-shrink-0">
                <TypeIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-bold text-ink-900 leading-tight">
                  {project.name}
                </h2>
                <p className="text-sm text-ink-500 inline-flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {project.address}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Big % */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-semibold text-ink-700">Postup stavby</span>
                <span className="font-display text-3xl font-extrabold text-ink-900 tabular-nums leading-none">
                  {project.progress}<span className="text-xl text-ink-500"> %</span>
                </span>
              </div>
              <div className="h-3 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-400 rounded-full transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Deadline */}
            {project.deadline && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-600 inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-ink-400" />
                  Plánované předání
                </span>
                <span className="font-semibold text-ink-900 tabular-nums">
                  {formatDate(project.deadline)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ===== ACTION ITEMS for client ===== */}
        {(pendingCO.length > 0 || overdueInvoices.length > 0) && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-ink-700 px-1">Vyžaduje vaši pozornost</h2>
            {pendingCO.map((co) => (
              <ChangeOrderApprovalCard
                key={co.id}
                changeOrder={co}
                onDecide={(decision, note) => decideChangeOrder(co.id, decision, note)}
              />
            ))}
            {overdueInvoices.length > 0 && (
              <div className="card p-4 border-l-4 border-red-400 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900">
                    Faktura po splatnosti
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Viz seznam faktur níže
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== Recent diary ===== */}
        {diaryEntries.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-ink-700 mb-2 px-1">
              Co se na stavbě dělo
            </h2>
            <div className="card divide-y divide-ink-100 overflow-hidden">
              {diaryEntries.map((entry) => {
                const weather = WEATHER_OPTIONS[entry.weather];
                return (
                  <article key={entry.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-ink-400" />
                      <span className="text-xs font-semibold text-ink-700">
                        {new Date(entry.date).toLocaleDateString('cs-CZ', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                      </span>
                      {weather && (
                        <span className="text-xs text-ink-500">· {weather.emoji} {weather.label}</span>
                      )}
                    </div>
                    <p className="text-sm text-ink-800 leading-relaxed line-clamp-3">
                      {entry.workDone}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== Invoices ===== */}
        {invoices.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-ink-700 mb-2 px-1 flex items-center justify-between">
              <span>Faktury</span>
              <span className="text-xs text-ink-500 tabular-nums">{invoices.length}</span>
            </h2>
            <div className="card divide-y divide-ink-100 overflow-hidden">
              {invoices
                .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1))
                .map((inv) => {
                  const status = INVOICE_STATUSES[inv.status];
                  const isOverdue = inv.status === 'overdue' ||
                    (inv.status === 'sent' && inv.dueDate && daysFromNow(inv.dueDate) < 0);
                  return (
                    <article key={inv.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-ink-500 font-semibold">{inv.number}</p>
                          {inv.label && (
                            <p className="font-semibold text-ink-900 text-sm mt-0.5">
                              {inv.label}
                            </p>
                          )}
                          <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                            <Badge color={isOverdue ? 'red' : status?.color || 'slate'}>
                              {isOverdue ? 'Po splatnosti' : status?.label}
                            </Badge>
                            <span className="text-ink-500">
                              splatnost {formatDate(inv.dueDate)}
                            </span>
                          </div>
                        </div>
                        <p className="font-display text-base font-bold tabular-nums text-ink-900 flex-shrink-0">
                          {formatCZK(inv.amount)}
                        </p>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        )}

        {/* ===== Past change orders (decided) ===== */}
        {changeOrders.filter((c) => c.status !== 'pending' && c.status !== 'proposed').length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-ink-700 mb-2 px-1">Schválené změny a vícepráce</h2>
            <div className="card divide-y divide-ink-100 overflow-hidden">
              {changeOrders
                .filter((c) => c.status === 'approved' || c.status === 'rejected')
                .map((co) => {
                  const status = CHANGE_ORDER_STATUSES[co.status];
                  return (
                    <article key={co.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs text-ink-500 font-semibold">{co.number}</p>
                          <p className="font-semibold text-ink-900 text-sm mt-0.5">{co.title}</p>
                          <div className="mt-1.5">
                            <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
                          </div>
                        </div>
                        <p className="font-display text-base font-bold tabular-nums text-ink-900 flex-shrink-0">
                          {formatCZK(co.amount)}
                        </p>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/* ----- Big approval card for the client ----- */

function ChangeOrderApprovalCard({ changeOrder, onDecide }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  return (
    <div className="card overflow-hidden border-amber-200 ring-1 ring-amber-100">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-amber-800 font-semibold">{changeOrder.number}</p>
            <p className="font-semibold text-ink-900 mt-0.5">
              {changeOrder.title}
            </p>
            <p className="font-display text-lg font-extrabold text-ink-900 tabular-nums mt-1">
              {formatCZK(changeOrder.amount)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetail(true)}
          className="mt-3 text-xs font-semibold text-ink-700 hover:text-ink-900 inline-flex items-center gap-1"
        >
          Zobrazit detail
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Big action row */}
      <div className="grid grid-cols-2 border-t border-amber-200">
        <button
          type="button"
          onClick={() => setShowReject(true)}
          className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors border-r border-amber-200"
        >
          <XIcon className="w-4 h-4" />
          Zamítnout
        </button>
        <button
          type="button"
          onClick={() => onDecide('approved', '')}
          className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors"
        >
          <Check className="w-4 h-4" />
          Schválit
        </button>
      </div>

      {/* Detail modal */}
      <Modal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        title={changeOrder.title}
        description={changeOrder.number}
        footer={
          <>
            <button type="button" onClick={() => setShowDetail(false)} className="btn btn-ghost">
              Zavřít
            </button>
            <button
              type="button"
              onClick={() => { onDecide('approved', ''); setShowDetail(false); }}
              className="btn btn-primary"
            >
              <Check className="w-4 h-4" /> Schválit
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {changeOrder.description && (
            <div>
              <p className="label">Popis prací</p>
              <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-line">
                {changeOrder.description}
              </p>
            </div>
          )}
          <div className="p-4 bg-ink-50 rounded-xl">
            <p className="text-xs text-ink-500 font-semibold uppercase tracking-wider">Cena</p>
            <p className="font-display text-2xl font-extrabold text-ink-900 tabular-nums mt-1">
              {formatCZK(changeOrder.amount)}
            </p>
          </div>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={showReject}
        onClose={() => setShowReject(false)}
        title="Zamítnout vícepráci"
        description="Volitelně napište důvod, ať stavbyvedoucí ví."
        footer={
          <>
            <button type="button" onClick={() => setShowReject(false)} className="btn btn-ghost">
              Zrušit
            </button>
            <button
              type="button"
              onClick={() => { onDecide('rejected', rejectNote); setShowReject(false); }}
              className="btn btn-danger border border-red-300"
            >
              Zamítnout
            </button>
          </>
        }
      >
        <textarea
          rows={4}
          className="input resize-y"
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="Důvod zamítnutí — volitelné…"
        />
      </Modal>
    </div>
  );
}

// =====================================================================
// Quote-only client view (received quote but no project yet)
// =====================================================================
function ClientQuoteOnly({ user, quotes, updateQuote }) {
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Dobré ráno';
    if (h < 18) return 'Dobré odpoledne';
    return 'Dobrý večer';
  })();
  const sortedQuotes = [...quotes].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] || ''}`}
        subtitle="Vaše cenové nabídky."
      />
      <div className="px-4 md:px-8 py-5 max-w-3xl mx-auto space-y-4">
        {sortedQuotes.map((quote) => {
          const subtotal = (quote.lines || []).reduce(
            (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0
          );
          const total = Math.round(subtotal * (1 + (Number(quote.marginPercent) || 0) / 100));
          const isPending = quote.status === 'sent';
          return (
            <div key={quote.id} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
                      {quote.number}
                    </p>
                    <h3 className="font-display text-lg font-bold text-ink-900 mt-0.5 leading-tight">
                      {quote.title}
                    </h3>
                  </div>
                  <Badge color={QUOTE_STATUSES[quote.status]?.color || 'slate'}>
                    {QUOTE_STATUSES[quote.status]?.label}
                  </Badge>
                </div>
                {quote.description && (
                  <p className="text-sm text-ink-700 mb-3 leading-relaxed">{quote.description}</p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Adresa</p>
                    <p className="text-ink-900 mt-0.5">{quote.address}</p>
                  </div>
                  {quote.validUntil && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Platí do</p>
                      <p className="text-ink-900 mt-0.5 font-mono tabular-nums">{formatDate(quote.validUntil)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 bg-ink-900 text-white">
                <p className="text-[10px] uppercase tracking-wider font-bold text-accent-400 mb-1">
                  Celková cena
                </p>
                <p className="font-display text-3xl font-extrabold tabular-nums">{formatCZK(total)}</p>
                {quote.note && (
                  <p className="text-xs text-ink-300 mt-3 italic">{quote.note}</p>
                )}
              </div>
              {isPending && (
                <div className="p-4 grid grid-cols-2 gap-2 border-t border-ink-100">
                  <button
                    type="button"
                    onClick={() => updateQuote(quote.id, { status: 'rejected', decidedDate: todayStr() })}
                    className="btn btn-lg btn-outline border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XIcon className="w-5 h-5" />
                    Zamítnout
                  </button>
                  <button
                    type="button"
                    onClick={() => updateQuote(quote.id, { status: 'approved', decidedDate: todayStr() })}
                    className="btn btn-lg bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                  >
                    <Check className="w-5 h-5" />
                    Schválit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// =====================================================================
// Pending quote alert (used inside main client view)
// =====================================================================
function ClientQuoteAlert({ quote, onApprove, onReject }) {
  const subtotal = (quote.lines || []).reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0
  );
  const total = Math.round(subtotal * (1 + (Number(quote.marginPercent) || 0) / 100));
  return (
    <div className="card overflow-hidden border-l-4 border-accent-400">
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              Nabídka {quote.number}
            </p>
            <p className="font-display text-base font-bold text-ink-900 leading-tight mt-0.5">
              {quote.title}
            </p>
            <p className="font-display text-2xl font-extrabold tabular-nums text-ink-900 mt-2">
              {formatCZK(total)}
            </p>
            {quote.validUntil && (
              <p className="text-xs text-ink-500 mt-1 inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Platí do {formatDate(quote.validUntil)}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onReject}
          className="btn btn-lg btn-outline border-red-300 text-red-700 hover:bg-red-50"
        >
          <XIcon className="w-5 h-5" />
          Zamítnout
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="btn btn-lg bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
        >
          <Check className="w-5 h-5" />
          Schválit
        </button>
      </div>
    </div>
  );
}

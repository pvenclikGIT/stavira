import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, FileText, ArrowUpRight, Calendar,
  Building2, Hammer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QUOTE_STATUSES, PROJECT_TYPES } from '../data/seed';
import { formatCZK, formatDate, classNames } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import QuoteFormModal from '../components/QuoteFormModal';

export default function QuotesPage() {
  const { quotes, clients } = useApp();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return quotes.filter((quote) => {
      if (status !== 'all' && quote.status !== status) return false;
      if (!q) return true;
      const client = clients.find((c) => c.id === quote.clientId);
      const haystack = [
        quote.title, quote.number, quote.address, quote.description, client?.name,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    }).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [quotes, clients, search, status]);

  const counts = useMemo(() => {
    const c = { all: quotes.length };
    Object.keys(QUOTE_STATUSES).forEach((key) => {
      c[key] = quotes.filter((q) => q.status === key).length;
    });
    return c;
  }, [quotes]);

  return (
    <>
      <PageHeader
        title="Nabídky"
        subtitle="Cenové nabídky pro klienty. Schválené se převedou na projekt."
        actions={
          <button type="button" onClick={() => setCreating(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Nová nabídka
          </button>
        }
      />

      <div className="px-4 md:px-8 py-5 max-w-7xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat podle čísla, názvu, klienta…"
            className="input pl-10"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 overflow-x-auto scroll-thin -mx-1 px-1 pb-1">
          <FilterPill active={status === 'all'} onClick={() => setStatus('all')} count={counts.all}>
            Vše
          </FilterPill>
          {Object.entries(QUOTE_STATUSES).map(([key, s]) => (
            <FilterPill
              key={key}
              active={status === key}
              onClick={() => setStatus(key)}
              count={counts[key] || 0}
            >
              {s.label}
            </FilterPill>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={FileText}
              title={quotes.length === 0 ? 'Zatím žádná nabídka' : 'Nic nenalezeno'}
              description={
                quotes.length === 0
                  ? 'Sekretářka tady připraví nabídku — vybere materiál z katalogu, doplní práce a marži.'
                  : 'Zkuste jiné hledání nebo filtr.'
              }
              action={quotes.length === 0 && (
                <button onClick={() => setCreating(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" /> Nová nabídka
                </button>
              )}
              className="py-12"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} clients={clients} />
            ))}
          </div>
        )}
      </div>

      <QuoteFormModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function QuoteCard({ quote, clients }) {
  const client = clients.find((c) => c.id === quote.clientId);
  const status = QUOTE_STATUSES[quote.status];
  const projectType = PROJECT_TYPES[quote.type] || PROJECT_TYPES.novostavba;
  const TypeIcon = quote.type === 'rekonstrukce' ? Hammer : Building2;

  // Calculate total
  const subtotal = (quote.lines || []).reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0
  );
  const total = Math.round(subtotal * (1 + (Number(quote.marginPercent) || 0) / 100));
  const lineCount = (quote.lines || []).length;

  return (
    <Link to={`/nabidky/${quote.id}`} className="card card-hover p-4 flex flex-col group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              {quote.number}
            </span>
            <Badge color={projectType.color} icon={TypeIcon}>{projectType.label}</Badge>
            <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
          </div>
          <h3 className="font-display text-base font-bold text-ink-900 leading-tight line-clamp-2 group-hover:text-ink-700">
            {quote.title}
          </h3>
        </div>
        <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      {client && (
        <p className="text-xs text-ink-600 mb-2 truncate">
          {client.name}{client.company ? ` · ${client.company}` : ''}
        </p>
      )}

      {quote.address && (
        <p className="text-xs text-ink-500 truncate mb-3">{quote.address}</p>
      )}

      <div className="mt-auto pt-3 border-t border-ink-100 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">
            Celková cena
          </p>
          <p className="font-display text-lg font-extrabold tabular-nums text-ink-900">
            {formatCZK(total, { compact: true })}
          </p>
          <p className="text-[10px] text-ink-500 mt-0.5">
            {lineCount} {lineCount === 1 ? 'položka' : lineCount >= 2 && lineCount <= 4 ? 'položky' : 'položek'}
          </p>
        </div>
        {quote.validUntil && quote.status === 'sent' && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">
              Platí do
            </p>
            <p className="font-mono tabular-nums text-xs font-bold text-ink-700 inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(quote.validUntil)}
            </p>
          </div>
        )}
        {quote.projectId && (
          <Badge color="emerald">→ Projekt</Badge>
        )}
      </div>
    </Link>
  );
}

function FilterPill({ active, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap border',
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
      )}
    >
      {children}
      {count !== undefined && (
        <span className={classNames(
          'tabular-nums px-1.5 py-0.5 rounded-md text-[10px] font-mono',
          active ? 'bg-white/15 text-white' : 'bg-ink-100 text-ink-600'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

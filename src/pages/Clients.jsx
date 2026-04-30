import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Mail, Phone, ArrowUpRight, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCZK, classNames } from '../utils/format';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import ClientFormModal from '../components/ClientFormModal';

export default function Clients() {
  const { clients, projects } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter((c) => {
      const haystack = [c.name, c.company, c.email, c.phone, c.address]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [clients, search]);

  const stats = useMemo(() => {
    return clients.map((c) => {
      const cp = projects.filter((p) => p.clientId === c.id);
      const totalBudget = cp.reduce((s, p) => s + (p.budget || 0), 0);
      const active = cp.filter((p) => p.status === 'active').length;
      return { id: c.id, projectCount: cp.length, activeCount: active, totalBudget };
    }).reduce((acc, s) => ({ ...acc, [s.id]: s }), {});
  }, [clients, projects]);

  return (
    <>
      <PageHeader
        title="Klienti"
        subtitle="Přehled klientů a jejich projektů."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Nový klient
          </button>
        }
      />

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat klienta…"
            className="input pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Users}
              title={search ? 'Žádný klient nenalezen' : 'Zatím žádný klient'}
              description={search
                ? 'Zkuste hledat něco jiného.'
                : 'Přidejte prvního klienta, abyste mohli zakládat projekty.'}
              action={
                !search && (
                  <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus className="w-4 h-4" /> Přidat klienta
                  </button>
                )
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <ClientCard key={c.id} client={c} stats={stats[c.id]} />
            ))}
          </div>
        )}
      </div>

      <ClientFormModal open={showForm} onClose={() => setShowForm(false)} />
    </>
  );
}

function ClientCard({ client, stats }) {
  return (
    <Link
      to={`/klienti/${client.id}`}
      className="card card-hover p-5 flex flex-col group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-11 h-11 rounded-xl bg-ink-900 text-accent-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {client.name.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-ink-900 truncate">{client.name}</h3>
          {client.company && (
            <p className="text-xs text-ink-500 truncate mt-0.5">{client.company}</p>
          )}
        </div>
        <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>

      <dl className="space-y-1.5 text-xs text-ink-600 flex-1 mb-4">
        {client.email && (
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 flex-shrink-0 text-ink-400" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 flex-shrink-0 text-ink-400" />
            <span className="font-mono">{client.phone}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-ink-400" />
            <span className="truncate">{client.address}</span>
          </div>
        )}
      </dl>

      <div className="pt-3 border-t border-ink-100 flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-mono tabular-nums font-bold text-ink-900">{stats?.projectCount || 0}</span>
          <span className="text-ink-500"> {(stats?.projectCount || 0) === 1 ? 'projekt' : 'projektů'}</span>
          {stats?.activeCount > 0 && (
            <span className="text-accent-700 ml-1.5">
              · {stats.activeCount} aktivní
            </span>
          )}
        </div>
        {stats?.totalBudget > 0 && (
          <div className="font-display font-bold text-ink-900 tabular-nums">
            {formatCZK(stats.totalBudget, { compact: true })}
          </div>
        )}
      </div>
    </Link>
  );
}

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Trash2, Mail, Phone, MapPin, ChevronRight,
  Users, FolderKanban, ArrowUpRight, Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROJECT_STATUSES } from '../data/seed';
import { formatCZK, formatDate, classNames } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import ClientFormModal from '../components/ClientFormModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getClient, projectsForClient, deleteClient } = useApp();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const client = getClient(id);

  if (!client) {
    return (
      <div className="px-4 md:px-8 py-12 max-w-3xl mx-auto">
        <EmptyState
          icon={Users}
          title="Klient nenalezen"
          description="Tento klient neexistuje nebo byl odstraněn."
          action={
            <Link to="/klienti" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" /> Zpět na seznam
            </Link>
          }
        />
      </div>
    );
  }

  const projects = projectsForClient(client.id);
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.actualCost || 0), 0);

  const handleDelete = () => {
    if (projects.length > 0) return;
    deleteClient(client.id);
    navigate('/klienti');
  };

  return (
    <>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/klienti" className="hover:text-ink-900 inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Klienti
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink-700">{client.name}</span>
          </>
        }
        title={client.name}
        subtitle={client.company || 'Soukromá osoba'}
        actions={
          <>
            <button type="button" onClick={() => setEditing(true)} className="btn btn-outline">
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Upravit</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="btn btn-danger"
              disabled={projects.length > 0}
              title={projects.length > 0 ? 'Klient má aktivní projekty' : 'Smazat klienta'}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Smazat</span>
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact info */}
          <aside className="space-y-6">
            <section className="card p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                Kontakt
              </h2>
              <dl className="space-y-3">
                {client.email && (
                  <ContactRow icon={Mail} label="E-mail">
                    <a href={`mailto:${client.email}`} className="text-ink-900 hover:text-accent-700 break-all">
                      {client.email}
                    </a>
                  </ContactRow>
                )}
                {client.phone && (
                  <ContactRow icon={Phone} label="Telefon">
                    <a href={`tel:${client.phone}`} className="text-ink-900 hover:text-accent-700 font-mono">
                      {client.phone}
                    </a>
                  </ContactRow>
                )}
                {client.address && (
                  <ContactRow icon={MapPin} label="Adresa">
                    <span className="text-ink-900">{client.address}</span>
                  </ContactRow>
                )}
                {client.createdAt && (
                  <ContactRow icon={Calendar} label="Klient od">
                    <span className="text-ink-900">{formatDate(client.createdAt)}</span>
                  </ContactRow>
                )}
              </dl>
            </section>

            {client.note && (
              <section className="card p-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                  Poznámka
                </h2>
                <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                  {client.note}
                </p>
              </section>
            )}

            <section className="grid grid-cols-2 gap-3">
              <div className="card p-4">
                <p className="stat-label">Projektů</p>
                <p className="stat-value">{projects.length}</p>
              </div>
              <div className="card p-4">
                <p className="stat-label">Hodnota</p>
                <p className="font-display text-xl font-bold tabular-nums text-ink-900 mt-1">
                  {formatCZK(totalBudget, { compact: true })}
                </p>
              </div>
            </section>
          </aside>

          {/* Projects */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-bold text-ink-900">
                Projekty klienta
              </h2>
              <span className="text-sm text-ink-500">
                {projects.length} {projects.length === 1 ? 'projekt' : 'projektů'}
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FolderKanban}
                  title="Žádné projekty"
                  description="Klient zatím nemá založen žádný projekt."
                  className="py-12"
                />
              </div>
            ) : (
              <div className="card divide-y divide-ink-100">
                {projects.map((p) => {
                  const status = PROJECT_STATUSES[p.status];
                  const overBudget = p.actualCost > p.budget;
                  return (
                    <Link
                      key={p.id}
                      to={`/projekty/${p.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-ink-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-ink-900 text-accent-400 font-mono text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        {p.code?.slice(-3) || '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-ink-900 truncate">{p.name}</p>
                          <Badge color={status?.color || 'slate'}>{status?.label}</Badge>
                          {overBudget && <Badge color="red">+ rozpočet</Badge>}
                        </div>
                        <p className="text-xs text-ink-500 truncate mb-2">{p.address}</p>
                        <div className="flex items-center gap-3">
                          <ProgressBar value={p.progress} size="sm" className="flex-1 max-w-[200px]" />
                          <span className="text-xs font-mono tabular-nums text-ink-600">
                            {p.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="text-xs text-ink-500">Rozpočet</p>
                        <p className="font-semibold text-sm text-ink-900 tabular-nums">
                          {formatCZK(p.budget, { compact: true })}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-ink-400 group-hover:text-ink-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <ClientFormModal
        open={editing}
        onClose={() => setEditing(false)}
        client={client}
      />
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleDelete}
        title="Smazat klienta?"
        description={`Klient "${client.name}" bude trvale odstraněn.`}
        confirmLabel="Smazat klienta"
        danger
      />
    </>
  );
}

function ContactRow({ icon: Icon, label, children }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-ink-500 mb-1">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </dt>
      <dd className="text-sm pl-5">{children}</dd>
    </div>
  );
}

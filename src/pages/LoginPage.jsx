import { useState } from 'react';
import { HardHat, ArrowRight, KeyRound } from 'lucide-react';
import Logo from '../components/Logo';
import { useApp } from '../context/AppContext';
import { ROLE_LABELS } from '../data/seed';
import { classNames } from '../utils/format';

const ROLE_CARD = {
  owner:      { tag: 'Plný přístup',         desc: 'Přehled financí, projektů a stavby.' },
  manager:    { tag: 'Stavbyvedoucí',         desc: 'Co je dnes na stavbě, deník, vícepráce.' },
  accountant: { tag: 'Fakturace a rozpočty',  desc: 'Faktury, náklady, reporty.' },
  client:     { tag: 'Klient',                desc: 'Stav vaší stavby, schvalování, faktury.' },
};

export default function LoginPage() {
  const { users, login } = useApp();
  const [selectedId, setSelectedId] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const selected = users.find((u) => u.id === selectedId);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!selected) return;
    if (pin !== selected.pin) {
      setError('Nesprávný PIN');
      return;
    }
    login(selected.id);
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col lg:flex-row">
      {/* Left visual side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-ink-900 grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950/60 via-transparent to-ink-950" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-950 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" mono />

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-400/10 border border-accent-400/20 text-accent-400 text-xs font-semibold uppercase tracking-wider">
              <HardHat className="w-3.5 h-3.5" />
              Stavební firma · Praha-Vinoř
            </div>

            <h1 className="font-display text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Stavební projekty<br />
              <span className="text-accent-400">pod kontrolou.</span>
            </h1>

            <p className="text-lg text-ink-300 max-w-md leading-relaxed">
              Rozpočty, etapy, materiál, tým a fakturace na jednom místě.
              Od přípravy po předání klíčů.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
              <Stat n="6" label="Projektů" />
              <Stat n="67M" label="Obrat (Kč)" />
              <Stat n="12" label="V týmu" />
            </div>
          </div>

          <p className="text-xs text-ink-500">© 2025 Stavira s.r.o. · IČO: 12 34 56 78</p>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" mono />
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              {selected ? `Vítejte zpět, ${selected.name.split(' ')[0]}` : 'Přihlášení'}
            </h2>
            <p className="text-ink-400 text-sm">
              {selected
                ? 'Zadejte čtyřmístný PIN pro pokračování.'
                : 'Vyberte svůj profil a pokračujte přihlášením.'}
            </p>
          </div>

          {!selected ? (
            <div className="space-y-2.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setSelectedId(u.id); setPin(''); setError(''); }}
                  className="w-full group flex items-center gap-4 p-4 rounded-xl bg-ink-900 border border-ink-800 hover:border-accent-400/50 hover:bg-ink-800 transition-all text-left"
                >
                  <div className={classNames(
                    'w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                    u.role === 'owner' && 'bg-accent-400 text-ink-900',
                    u.role === 'manager' && 'bg-blue-500 text-white',
                    u.role === 'accountant' && 'bg-emerald-500 text-white',
                    u.role === 'client' && 'bg-purple-500 text-white',
                  )}>
                    {u.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {ROLE_LABELS[u.role]} · {ROLE_CARD[u.role].desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-500 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-ink-900 border border-ink-800 flex items-center gap-3">
                <div className={classNames(
                  'w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0',
                  selected.role === 'owner' && 'bg-accent-400 text-ink-900',
                  selected.role === 'manager' && 'bg-blue-500 text-white',
                  selected.role === 'accountant' && 'bg-emerald-500 text-white',
                  selected.role === 'client' && 'bg-purple-500 text-white',
                )}>
                  {selected.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-xs text-ink-400">{ROLE_LABELS[selected.role]}</p>
                </div>
              </div>

              <div>
                <label htmlFor="pin" className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">
                  PIN kód
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                  <input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    autoFocus
                    value={pin}
                    onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                    placeholder="••••"
                    className={classNames(
                      'w-full pl-10 pr-3 py-3 rounded-lg bg-ink-900 border text-white placeholder:text-ink-600 focus:outline-none transition-colors text-lg tracking-[0.5em] font-mono text-center',
                      error
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-ink-800 focus:border-accent-400'
                    )}
                  />
                </div>
                {error && <p className="mt-2 text-xs text-red-400 font-medium">{error}</p>}
                <p className="mt-2 text-xs text-ink-500">
                  Demo PIN: <span className="font-mono text-ink-400">{selected.pin}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedId(null); setPin(''); setError(''); }}
                  className="btn flex-1 bg-ink-900 border border-ink-800 text-ink-200 hover:bg-ink-800"
                >
                  Zpět
                </button>
                <button
                  type="submit"
                  disabled={pin.length !== 4}
                  className="btn btn-accent flex-1"
                >
                  Přihlásit se
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display text-2xl xl:text-3xl font-extrabold text-accent-400 tabular-nums">{n}</div>
      <div className="text-xs text-ink-500 uppercase tracking-wider font-semibold mt-0.5">{label}</div>
    </div>
  );
}

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, LogOut, Menu, X,
  ChevronDown, RotateCcw,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { ROLE_LABELS } from '../data/seed';
import { classNames } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

const NAV = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projekty', label: 'Projekty',  icon: FolderKanban },
  { to: '/klienti',  label: 'Klienti',   icon: Users },
];

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, logout } = useApp();
  const location = useLocation();

  // Close mobile menu on route change
  const closeMobile = () => setMobileOpen(false);

  const NavItems = ({ onClick }) => (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onClick}
          className={({ isActive }) =>
            classNames(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
              isActive
                ? 'bg-accent-400 text-ink-900'
                : 'text-ink-300 hover:text-white hover:bg-ink-800'
            )
          }
        >
          <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-ink-950 flex-col z-30">
        <div className="px-5 py-6 border-b border-ink-800">
          <Logo size="md" mono />
        </div>
        <div className="flex-1 px-3 py-4 overflow-y-auto scroll-thin">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] font-bold text-ink-500">
            Hlavní
          </p>
          <NavItems />
        </div>
        <div className="p-3 border-t border-ink-800">
          <UserBlock currentUser={currentUser} onLogout={logout} />
        </div>
      </aside>

      {/* ===== Mobile header ===== */}
      <header className="lg:hidden sticky top-0 z-30 bg-ink-950 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo size="sm" mono />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Otevřít menu"
            className="p-2 -mr-2 rounded-lg hover:bg-ink-800 active:bg-ink-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===== Mobile drawer ===== */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex" onClick={closeMobile}>
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
          <aside
            className="relative w-72 max-w-[85vw] ml-auto bg-ink-950 flex flex-col fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-ink-800">
              <Logo size="sm" mono />
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Zavřít menu"
                className="p-2 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 px-3 py-4 overflow-y-auto">
              <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] font-bold text-ink-500">
                Hlavní
              </p>
              <NavItems onClick={closeMobile} />
            </div>
            <div className="p-3 border-t border-ink-800 safe-bottom">
              <UserBlock currentUser={currentUser} onLogout={() => { logout(); closeMobile(); }} />
            </div>
          </aside>
        </div>
      )}

      {/* ===== Main content ===== */}
      <main className="lg:pl-64 min-h-screen">
        <div key={location.pathname} className="fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}

function UserBlock({ currentUser, onLogout }) {
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const { resetAllData } = useApp();
  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-ink-800 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-accent-400 text-ink-900 flex items-center justify-center font-bold flex-shrink-0">
          {currentUser.name.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
          <p className="text-xs text-ink-400 truncate">{ROLE_LABELS[currentUser.role]}</p>
        </div>
        <ChevronDown className={classNames('w-4 h-4 text-ink-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-pop border border-ink-200 overflow-hidden"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => { setResetOpen(true); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors border-b border-ink-100"
          >
            <RotateCcw className="w-4 h-4" />
            Obnovit demo data
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Odhlásit se
          </button>
        </div>
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetAllData}
        title="Obnovit demo data?"
        description="Všechny změny — projekty, klienti — budou nahrazeny původními demo daty. Tuto akci nelze vrátit zpět."
        confirmLabel="Obnovit data"
        danger
      />
    </div>
  );
}

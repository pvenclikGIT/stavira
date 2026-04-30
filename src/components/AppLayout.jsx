import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users, LogOut,
  Sun, BookOpen, ChevronDown, RotateCcw, FileText, Package,
} from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';
import { ROLE_LABELS } from '../data/seed';
import { classNames } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

// Build navigation depending on role
function buildNav(role) {
  // Owner / accountant — full access, "Dnes" first as it's most-used daily
  if (role === 'owner' || role === 'accountant') {
    return [
      { to: '/',         label: 'Dnes',     icon: Sun, end: true },
      { to: '/projekty', label: 'Projekty', icon: FolderKanban },
      { to: '/nabidky',  label: 'Nabídky',  icon: FileText },
      { to: '/klienti',  label: 'Klienti',  icon: Users },
    ];
  }
  // Manager (stavbyvedoucí) — daily focus, no clients
  if (role === 'manager') {
    return [
      { to: '/',          label: 'Dnes',     icon: Sun, end: true },
      { to: '/projekty',  label: 'Stavby',   icon: FolderKanban },
      { to: '/denik',     label: 'Deník',    icon: BookOpen },
    ];
  }
  // Client — only sees their own thing
  return [
    { to: '/',         label: 'Moje stavba', icon: FolderKanban, end: true },
  ];
}

// Secondary nav items shown in desktop sidebar + profile dropdown (not in mobile bottom bar)
function buildSecondaryNav(role) {
  if (role === 'owner' || role === 'accountant') {
    return [
      { to: '/dashboard', label: 'Přehled',  icon: LayoutDashboard },
      { to: '/material',  label: 'Materiál', icon: Package },
    ];
  }
  return [];
}

export default function AppLayout({ children }) {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navItems = buildNav(currentUser?.role);
  const secondaryNavItems = buildSecondaryNav(currentUser?.role);

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ===== Desktop sidebar (≥lg) ===== */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-ink-950 flex-col z-30">
        <div className="px-5 py-6 border-b border-ink-800">
          <Logo size="md" mono />
        </div>
        <div className="flex-1 px-3 py-4 overflow-y-auto scroll-thin">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] font-bold text-ink-500">
            {currentUser?.role === 'client' ? 'Moje' : 'Hlavní'}
          </p>
          <DesktopNav items={navItems} />

          {secondaryNavItems.length > 0 && (
            <>
              <p className="px-3 mt-6 mb-2 text-[10px] uppercase tracking-[0.18em] font-bold text-ink-500">
                Další
              </p>
              <DesktopNav items={secondaryNavItems} />
            </>
          )}
        </div>
        <div className="p-3 border-t border-ink-800">
          <UserBlock currentUser={currentUser} onLogout={logout} />
        </div>
      </aside>

      {/* ===== Mobile header — minimal, just brand + user avatar ===== */}
      <header className="lg:hidden sticky top-0 z-30 bg-ink-950 text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo size="sm" mono />
          {currentUser && <MobileUserMenu currentUser={currentUser} onLogout={logout} secondaryNav={secondaryNavItems} />}
        </div>
      </header>

      {/* ===== Main content ===== */}
      <main className="lg:pl-64 min-h-screen pb-bottom-nav lg:pb-0">
        <div key={location.pathname} className="fade-up">
          {children}
        </div>
      </main>

      {/* ===== Mobile bottom navigation ===== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-ink-200 safe-bottom">
        <div className="flex items-stretch">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => classNames(
                'nav-tab',
                isActive && 'text-ink-900'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={classNames(
                      'w-6 h-6 transition-transform',
                      isActive && 'scale-110'
                    )}
                    strokeWidth={isActive ? 2.4 : 1.8}
                  />
                  <span className={classNames(
                    'text-[11px] font-semibold',
                    isActive ? 'text-ink-900' : 'text-ink-500'
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-400 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function DesktopNav({ items }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
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
}

function MobileUserMenu({ currentUser, onLogout, secondaryNav = [] }) {
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const { resetAllData } = useApp();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Uživatelské menu"
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ink-800 active:bg-ink-700"
      >
        <div className="w-9 h-9 rounded-lg bg-accent-400 text-ink-900 flex items-center justify-center font-bold text-sm">
          {currentUser.name.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-2 top-14 mt-1 w-64 bg-white rounded-xl shadow-pop border border-ink-200 overflow-hidden z-50">
            <div className="p-3 border-b border-ink-100">
              <p className="font-semibold text-ink-900">{currentUser.name}</p>
              <p className="text-xs text-ink-500 mt-0.5">{ROLE_LABELS[currentUser.role]}</p>
            </div>

            {secondaryNav.length > 0 && (
              <div className="border-b border-ink-100">
                {secondaryNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 active:bg-ink-100"
                  >
                    <item.icon className="w-4 h-4 text-ink-500" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => { setResetOpen(true); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 active:bg-ink-100 border-b border-ink-100"
            >
              <RotateCcw className="w-4 h-4" />
              Obnovit demo data
            </button>
            <button
              type="button"
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetAllData}
        title="Obnovit demo data?"
        description="Všechny změny budou nahrazeny původními demo daty. Tuto akci nelze vrátit zpět."
        confirmLabel="Obnovit"
        danger
      />
    </>
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
        description="Všechny změny budou nahrazeny původními demo daty. Tuto akci nelze vrátit zpět."
        confirmLabel="Obnovit"
        danger
      />
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  Package, Search, Phone, Globe, MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MATERIAL_CATEGORIES, MATERIAL_SUPPLIER } from '../data/materials';
import { formatCZK, classNames } from '../utils/format';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function MaterialsPage() {
  const { materials } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return materials.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (!q) return true;
      const haystack = `${m.name} ${m.packaging || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [materials, search, category]);

  const counts = useMemo(() => {
    const c = { all: materials.length };
    Object.keys(MATERIAL_CATEGORIES).forEach((key) => {
      c[key] = materials.filter((m) => m.category === key).length;
    });
    return c;
  }, [materials]);

  return (
    <>
      <PageHeader
        title="Materiál"
        subtitle="Katalog stavebního materiálu od dodavatele Stavebniny Dlabač."
      />

      <div className="px-4 md:px-8 py-5 max-w-7xl mx-auto space-y-5">
        {/* Supplier card */}
        <SupplierCard />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat materiál — cement, cihla, KARI…"
            className="input pl-10"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 overflow-x-auto scroll-thin -mx-1 px-1 pb-1">
          <FilterPill active={category === 'all'} onClick={() => setCategory('all')} count={counts.all}>
            Vše
          </FilterPill>
          {Object.entries(MATERIAL_CATEGORIES).map(([key, cat]) => (
            <FilterPill
              key={key}
              active={category === key}
              onClick={() => setCategory(key)}
              count={counts[key] || 0}
            >
              {cat.label}
            </FilterPill>
          ))}
        </div>

        {/* Stats */}
        <p className="text-sm text-ink-600">
          <span className="font-semibold text-ink-900 tabular-nums">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'položka' : filtered.length >= 2 && filtered.length <= 4 ? 'položky' : 'položek'}
          {(search || category !== 'all') && ` z ${materials.length} celkem`}
        </p>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Package}
              title="Nic nenalezeno"
              description="Zkuste jiné hledání nebo kategorii."
              className="py-12"
            />
          </div>
        ) : (
          <div className="card divide-y divide-ink-100 overflow-hidden">
            {filtered.map((m) => <MaterialRow key={m.id} material={m} />)}
          </div>
        )}
      </div>
    </>
  );
}

function SupplierCard() {
  return (
    <div className="card p-4 md:p-5 bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-900">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent-400 text-ink-900 flex items-center justify-center flex-shrink-0 font-bold">
          D
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-lg leading-tight">
            {MATERIAL_SUPPLIER.name}
          </p>
          <p className="text-sm text-ink-300 mt-0.5">Hlavní dodavatel materiálu</p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <a href={`tel:${MATERIAL_SUPPLIER.phone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 text-ink-200 hover:text-white">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{MATERIAL_SUPPLIER.phone}</span>
            </a>
            <a href={`tel:${MATERIAL_SUPPLIER.mobile.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 text-ink-200 hover:text-white">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{MATERIAL_SUPPLIER.mobile}</span>
            </a>
            <a href={`https://${MATERIAL_SUPPLIER.web}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 text-ink-200 hover:text-white">
              <Globe className="w-3.5 h-3.5" />
              <span>{MATERIAL_SUPPLIER.web}</span>
            </a>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 text-xs text-ink-400">
            <MapPin className="w-3 h-3" />
            {MATERIAL_SUPPLIER.address}
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialRow({ material }) {
  const cat = MATERIAL_CATEGORIES[material.category];
  return (
    <div className="p-3 md:p-4 hover:bg-ink-50/40 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-900 text-sm leading-tight">
            {material.name}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-ink-500 flex-wrap">
            {material.packaging && (
              <span className="font-mono tabular-nums">{material.packaging}</span>
            )}
            {cat && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-ink-100 text-ink-700">
                {cat.label}
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-display text-base font-bold tabular-nums text-ink-900">
            {formatCZK(material.priceVAT)}
          </p>
          <p className="text-[10px] text-ink-500 mt-0.5">
            za {material.unit} · s DPH
          </p>
        </div>
      </div>
    </div>
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

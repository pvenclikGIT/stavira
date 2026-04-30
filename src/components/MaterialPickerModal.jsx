import { useState, useMemo } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { MATERIAL_CATEGORIES } from '../data/materials';
import { formatCZK, classNames } from '../utils/format';

/**
 * Pick a material from catalog and add it as a quote line.
 * onPick(material, quantity) — receives the chosen material + quantity.
 */
export default function MaterialPickerModal({ open, onClose, onPick }) {
  const { materials } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const filtered = useMemo(() => {
    if (!open) return [];
    const q = search.toLowerCase().trim();
    return materials.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (!q) return true;
      const haystack = `${m.name} ${m.packaging || ''}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 100); // perf cap
  }, [materials, search, category, open]);

  const handleClose = () => {
    setSearch('');
    setCategory('all');
    setSelected(null);
    setQuantity(1);
    onClose?.();
  };

  const handlePick = () => {
    if (!selected) return;
    onPick?.(selected, Number(quantity) || 1);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Vybrat materiál z katalogu"
      description="Vyberte z katalogu Stavebniny Dlabač. Cena se předvyplní podle ceníku."
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={handleClose}>Zrušit</button>
          <button
            type="button"
            disabled={!selected}
            onClick={handlePick}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {selected ? `Přidat ${quantity}× ${selected.name.slice(0, 30)}` : 'Vybrat materiál'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat — cement, cihla, KARI…"
            className="input pl-10"
            autoFocus
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin -mx-1 px-1 pb-1">
          <FilterPill active={category === 'all'} onClick={() => setCategory('all')}>Vše</FilterPill>
          {Object.entries(MATERIAL_CATEGORIES).map(([key, cat]) => (
            <FilterPill
              key={key}
              active={category === key}
              onClick={() => setCategory(key)}
            >
              {cat.label}
            </FilterPill>
          ))}
        </div>

        {/* Selected material panel */}
        {selected && (
          <div className="card p-3 bg-accent-50 border-accent-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-accent-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900 text-sm truncate">{selected.name}</p>
              <p className="text-xs text-ink-600">
                {selected.packaging} · {formatCZK(selected.priceVAT)} / {selected.unit}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}
                className="w-9 h-9 rounded-lg bg-white border border-ink-200 font-bold text-ink-700 hover:bg-ink-50 active:scale-95"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-16 h-9 text-center font-mono tabular-nums font-bold rounded-lg border border-ink-200 bg-white"
              />
              <button
                type="button"
                onClick={() => setQuantity(Number(quantity) + 1)}
                className="w-9 h-9 rounded-lg bg-white border border-ink-200 font-bold text-ink-700 hover:bg-ink-50 active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Material list */}
        <div className="card divide-y divide-ink-100 overflow-hidden max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-500">
              Nic nenalezeno. Zkuste jiné hledání.
            </div>
          ) : filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              className={classNames(
                'w-full p-3 text-left transition-colors flex items-center gap-3',
                selected?.id === m.id
                  ? 'bg-accent-50 border-l-4 border-l-accent-400'
                  : 'hover:bg-ink-50'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 text-sm leading-tight">
                  {m.name}
                </p>
                {m.packaging && (
                  <p className="text-xs text-ink-500 mt-0.5 font-mono tabular-nums">
                    {m.packaging}
                  </p>
                )}
              </div>
              <p className="font-display font-bold tabular-nums text-ink-900 text-sm flex-shrink-0">
                {formatCZK(m.priceVAT)}
              </p>
            </button>
          ))}
        </div>

        {filtered.length === 100 && (
          <p className="text-xs text-ink-500 text-center">
            Zobrazeno prvních 100 výsledků. Upřesněte hledání.
          </p>
        )}
      </div>
    </Modal>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-colors',
        active
          ? 'bg-ink-900 text-white border-ink-900'
          : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
      )}
    >
      {children}
    </button>
  );
}

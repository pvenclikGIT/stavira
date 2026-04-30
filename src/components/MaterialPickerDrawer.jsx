import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Minus, Package, ShoppingCart, Trash2, X } from 'lucide-react';
import Drawer from './Drawer';
import { useApp } from '../context/AppContext';
import { MATERIAL_CATEGORIES } from '../data/materials';
import { formatCZK, classNames } from '../utils/format';

/**
 * Material picker drawer.
 *
 * UX improvements over the previous modal:
 *   - Slides in from the right, doesn't block whole screen on desktop
 *   - Persistent cart at the bottom — secretary picks 5 things, then "Add all"
 *   - Tap +/- on a material to adjust quantity in cart inline
 *   - Cart survives reordering, search filter changes, etc.
 *   - "Add all" button shows total count and value
 *
 * Props:
 *   open, onClose, defaultSection (string|null), onPickMany(lines)
 */
export default function MaterialPickerDrawer({ open, onClose, defaultSection = null, onPickMany }) {
  const { materials } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  // cart: { [materialId]: quantity }
  const [cart, setCart] = useState({});

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch('');
      setCategory('all');
      setCart({});
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!open) return [];
    const q = search.toLowerCase().trim();
    return materials.filter((m) => {
      if (category !== 'all' && m.category !== category) return false;
      if (!q) return true;
      const haystack = `${m.name} ${m.packaging || ''}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 200);
  }, [materials, search, category, open]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ material: materials.find((m) => m.id === id), quantity: qty }))
      .filter((c) => c.material);
  }, [cart, materials]);

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((s, c) => s + c.material.priceVAT * c.quantity, 0);

  const setQty = (materialId, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[materialId];
      else next[materialId] = qty;
      return next;
    });
  };

  const handleConfirm = () => {
    if (cartItems.length === 0) return;
    const lines = cartItems.map(({ material, quantity }) => ({
      type: 'material',
      materialId: material.id,
      name: material.name + (material.packaging ? ` (${material.packaging})` : ''),
      quantity,
      unit: material.unit,
      unitPrice: material.priceVAT,
      sectionTitle: defaultSection,
      note: '',
    }));
    onPickMany?.(lines);
    onClose?.();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Vybrat materiál z katalogu"
      description={defaultSection ? `Sekce: ${defaultSection}` : 'Klepněte na položku pro přidání. Můžete přidat víc najednou.'}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Zrušit</button>
          <button
            type="button"
            disabled={cartCount === 0}
            onClick={handleConfirm}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed btn-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount === 0
              ? 'Vyberte materiál'
              : `Přidat ${cartCount} ${cartCount === 1 ? 'položku' : cartCount <= 4 ? 'položky' : 'položek'} (${formatCZK(cartTotal, { compact: true })})`
            }
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Search */}
        <div className="relative sticky top-0 bg-white z-10 -mx-4 -mt-1 px-4 pt-1 pb-2">
          <Search className="absolute left-7 top-3 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hledat — cement, cihla, KARI…"
            className="input pl-10"
            autoFocus
          />
          <div className="flex items-center gap-1.5 overflow-x-auto scroll-thin -mx-1 px-1 mt-2 pb-0.5">
            <FilterPill active={category === 'all'} onClick={() => setCategory('all')}>Vše</FilterPill>
            {Object.entries(MATERIAL_CATEGORIES).map(([key, cat]) => (
              <FilterPill key={key} active={category === key} onClick={() => setCategory(key)}>
                {cat.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-sm text-ink-500">
            Nic nenalezeno. Zkuste jiné hledání.
          </div>
        ) : (
          <div className="card divide-y divide-ink-100 overflow-hidden">
            {filtered.map((m) => (
              <PickerRow
                key={m.id}
                material={m}
                quantity={cart[m.id] || 0}
                onChange={(qty) => setQty(m.id, qty)}
              />
            ))}
          </div>
        )}

        {filtered.length === 200 && (
          <p className="text-xs text-ink-500 text-center pt-2">
            Zobrazeno prvních 200. Upřesněte hledání pro užší výběr.
          </p>
        )}

        {/* Cart sticky panel — only when items present */}
        {cartCount > 0 && (
          <div className="sticky bottom-0 -mx-4 -mb-1 px-4 pb-2 pt-2 bg-gradient-to-t from-white via-white to-white/80">
            <div className="card p-3 bg-ink-900 text-white border-ink-900">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-bold text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-accent-400" />
                  V košíku: {cartCount}
                </p>
                <button
                  type="button"
                  onClick={() => setCart({})}
                  className="text-xs text-ink-400 hover:text-white inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Vyprázdnit
                </button>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto scroll-thin">
                {cartItems.map(({ material, quantity }) => (
                  <div key={material.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate flex-1 text-ink-300">{quantity}× {material.name}</span>
                    <button
                      type="button"
                      onClick={() => setQty(material.id, 0)}
                      className="text-ink-500 hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function PickerRow({ material, quantity, onChange }) {
  const cat = MATERIAL_CATEGORIES[material.category];
  const inCart = quantity > 0;

  return (
    <div className={classNames(
      'p-3 transition-colors',
      inCart ? 'bg-accent-50' : 'hover:bg-ink-50/50'
    )}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(inCart ? 0 : 1)}
          className={classNames(
            'flex-1 min-w-0 text-left',
            'flex items-center gap-3'
          )}
        >
          <div className={classNames(
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
            inCart ? 'bg-accent-400 text-ink-900' : 'bg-ink-100 text-ink-600'
          )}>
            <Package className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-ink-900 text-sm leading-tight">{material.name}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-500 flex-wrap">
              {material.packaging && <span className="font-mono tabular-nums">{material.packaging}</span>}
              <span className="font-mono tabular-nums font-bold text-ink-700">
                {formatCZK(material.priceVAT)} / {material.unit}
              </span>
            </div>
          </div>
        </button>

        {/* Stepper */}
        {inCart ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onChange(Math.max(0, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-ink-200 font-bold text-ink-700 hover:bg-ink-50 active:scale-95 flex items-center justify-center"
              aria-label="Snížit množství"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
              className="w-14 h-8 text-center font-mono tabular-nums font-bold rounded-lg border border-ink-200 bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-white border border-ink-200 font-bold text-ink-700 hover:bg-ink-50 active:scale-95 flex items-center justify-center"
              aria-label="Zvýšit množství"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange(1)}
            className="w-8 h-8 rounded-lg bg-ink-100 text-ink-700 hover:bg-ink-200 active:scale-95 flex items-center justify-center flex-shrink-0"
            aria-label="Přidat do košíku"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
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

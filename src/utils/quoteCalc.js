// Quote calculations — single source of truth.
// All UI components import these helpers so totals are consistent everywhere.

const num = (v) => Number(v) || 0;

export function calcLineTotal(line) {
  return num(line.quantity) * num(line.unitPrice);
}

/**
 * Returns:
 *   subtotalByType: { material, work, other }
 *   subtotal: sum of all
 *   marginMaterial / marginLabor / marginOther: applied margin amounts
 *   margin: total margin
 *   total: grand total with margin
 *   marginRateMaterial, marginRateLabor: effective rates used
 */
export function calcQuoteTotals(quote) {
  const lines = quote?.lines || [];
  const byType = { material: 0, work: 0, other: 0 };
  lines.forEach((l) => {
    const t = calcLineTotal(l);
    byType[l.type] = (byType[l.type] || 0) + t;
  });
  const subtotal = byType.material + byType.work + byType.other;

  // Determine effective margin rates with backward compatibility
  const fallback = num(quote?.marginPercent);
  const rateMaterial = quote?.marginPercentMaterial != null ? num(quote.marginPercentMaterial) : fallback;
  const rateLabor    = quote?.marginPercentLabor    != null ? num(quote.marginPercentLabor)    : fallback;
  // 'other' line type uses material margin rate (it's a pass-through cost typically)
  const rateOther = rateMaterial;

  const marginMaterial = byType.material * rateMaterial / 100;
  const marginLabor    = byType.work     * rateLabor    / 100;
  const marginOther    = byType.other    * rateOther    / 100;
  const margin = marginMaterial + marginLabor + marginOther;
  const total = Math.round(subtotal + margin);

  return {
    byType,
    subtotal,
    marginMaterial,
    marginLabor,
    marginOther,
    margin,
    total,
    marginRateMaterial: rateMaterial,
    marginRateLabor: rateLabor,
    lineCount: lines.length,
  };
}

/**
 * Group quote lines by sectionTitle. Lines without a section go into '__no_section__'.
 * Returns ordered array preserving first-seen section order.
 */
export function groupLinesBySections(lines) {
  const groups = new Map();
  (lines || []).forEach((l) => {
    const key = l.sectionTitle || '__no_section__';
    if (!groups.has(key)) groups.set(key, { title: l.sectionTitle || null, lines: [] });
    groups.get(key).lines.push(l);
  });
  return Array.from(groups.entries()).map(([key, g]) => ({
    key,
    title: g.title,
    lines: g.lines,
    subtotal: g.lines.reduce((s, l) => s + calcLineTotal(l), 0),
  }));
}

/**
 * Days until validity expires. Negative = expired.
 */
export function daysUntilExpiry(validUntil) {
  if (!validUntil) return null;
  const ms = new Date(validUntil).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

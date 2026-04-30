import { useMemo } from 'react';
import {
  TrendingDown, MapPin, Award, Shield, Eye, Users, Star,
  CheckCircle2, Sparkles, Building2, Calendar, ThumbsUp,
  Hammer, Heart, Lock, BadgeCheck, Briefcase,
} from 'lucide-react';
import { useInView, useCountUp } from '../hooks/useAnimations';
import { formatCZK, classNames } from '../utils/format';
import {
  MARKET_DATA, computeMarketComparison,
  COMPANY_FACTS, REFERENCES, TEAM_MEMBERS, DIFFERENTIATORS,
} from '../data/marketData';

/**
 * Big "WOW" marketing block shown to clients on the quote.
 * Goal: convert "checking" client into "yes, sign with Stavira" through:
 *   1. Market price comparison (anchored, fair, never naming competitors)
 *   2. Per-m² context for the locality
 *   3. Multi-dimension value radar
 *   4. What's included checklist
 *   5. 5-year warranty highlight
 *   6. Animated counter facts
 *   7. References from happy clients
 *   8. Differentiators ("co děláme jinak")
 *   9. Team & certifications
 *
 * All animations use IntersectionObserver — no perf cost outside viewport.
 * Honors prefers-reduced-motion.
 */
export default function ClientValueShowcase({ quote, totals }) {
  const totalPrice = totals?.total || 0;
  const areaSqm = quote?.areaSqm || null;
  const projectType = quote?.type || 'novostavba';

  // Market comparison only meaningful if we have area AND price is realistic
  // (within reasonable range vs market — if we're 60%+ under, the quote is likely
  // a partial scope and the comparison would be misleading)
  const market = useMemo(() => {
    if (!areaSqm) return null;
    const m = computeMarketComparison({ totalPrice, areaSqm, projectType });
    // If price is implausibly low (e.g., quote is just materials, or just a phase),
    // skip the market block entirely to avoid misleading the client
    const tooLow = m.vsPragueAvg < -55;
    return tooLow ? null : m;
  }, [totalPrice, areaSqm, projectType]);

  return (
    <div className="space-y-6">
      {/* === Block 1: Market price comparison ===  */}
      {market && market.ourPricePerSqm > 0 && (
        <MarketComparisonBlock market={market} projectType={projectType} totalPrice={totalPrice} areaSqm={areaSqm} />
      )}

      {/* === Block 2: Value radar — 5 dimensions === */}
      <ValueRadarBlock />

      {/* === Block 3: What's included === */}
      <WhatsIncludedBlock projectType={projectType} />

      {/* === Block 4: 5-year warranty === */}
      <WarrantyHighlight />

      {/* === Block 5: Counter facts about the company === */}
      <CompanyFactsBlock />

      {/* === Block 6: References === */}
      <ReferencesBlock />

      {/* === Block 7: Why Stavira === */}
      <DifferentiatorsBlock />

      {/* === Block 8: Team === */}
      <TeamBlock />
    </div>
  );
}

// ============================================================
// 1. MARKET COMPARISON
// ============================================================
function MarketComparisonBlock({ market, projectType, totalPrice, areaSqm }) {
  const [ref, inView] = useInView({ threshold: 0.25 });

  // Animated values
  const ourPrice = useCountUp({ end: market.ourPricePerSqm, start: inView, duration: 1500 });
  const prahaAvg = useCountUp({ end: market.prahaAvg, start: inView, duration: 1700 });
  const stredniAvg = useCountUp({ end: market.stredniAvg, start: inView, duration: 1700 });

  // Bar chart math — find max value for scaling
  const max = Math.max(market.prahaHigh, market.ourPricePerSqm, market.stredniHigh);
  const barWidth = (val) => `${Math.max(2, (val / max) * 100)}%`;

  // Determine "savings" message tone
  // If our price is more than 35% under Prague avg, it's likely a PARTIAL scope quote
  // (materials + some work, not turnkey delivery). Avoid making implausible savings claim.
  const isFullScope = market.vsPragueAvg >= -35;
  const isCompetitive = market.vsPragueAvg <= 0 && isFullScope;
  const isPartialScope = market.vsPragueAvg < -35;
  const savingsAmount = market.savingsVsPrague;

  return (
    <section ref={ref} className="card overflow-hidden">
      {/* Hero strip */}
      <div className="bg-gradient-to-br from-ink-900 to-ink-950 text-white p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className={classNames(
            'w-11 h-11 rounded-xl bg-accent-400 text-ink-900 flex items-center justify-center flex-shrink-0',
            inView && 'scale-in'
          )}>
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-accent-400 font-bold">
              Cenový kontext
            </p>
            <h2 className="font-display text-xl md:text-2xl font-extrabold mt-1 leading-tight">
              {isPartialScope
                ? 'Cena pro vás v kontextu trhu'
                : isCompetitive
                  ? 'Naše cena vs běžné ceny v lokalitě'
                  : 'Cena v kontextu trhu'}
            </h2>
          </div>
        </div>

        {isCompetitive && savingsAmount > 0 && inView && (
          <div className="mb-4 reveal-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-ink-300">
              Oproti průměru pro Prahu šetříte
            </p>
            <p className="font-display text-3xl md:text-4xl font-black text-accent-400 tabular-nums mt-1">
              {formatCZK(savingsAmount, { compact: true })}
            </p>
          </div>
        )}

        {isPartialScope && inView && (
          <div className="mb-4 reveal-up" style={{ animationDelay: '0.4s' }}>
            <p className="font-display text-xl md:text-2xl font-bold text-accent-400 leading-tight">
              Naše cena za m² je významně příznivější
            </p>
            <p className="text-sm text-ink-300 mt-1.5 leading-relaxed">
              Tato nabídka pokrývá konkrétní rozsah prací uvedený níže.
              Plné kompletní dodávky novostaveb se v Praze běžně pohybují v pásmu
              {' '}{formatCZK(market.prahaLow, { compact: true })} – {formatCZK(market.prahaHigh, { compact: true })}/m²,
              proto naše cena vychází níž.
            </p>
          </div>
        )}

        <p className="text-sm text-ink-300 leading-relaxed">
          Tyto údaje vychází z veřejně dostupných stavebních ukazatelů (ČSÚ, Cenová mapa Praha)
          a průměrů zveřejněných realit ve Vinoři, Praze a Středočeském kraji za rok 2025–2026.
          Neporovnáváme se s konkrétními firmami — ukazujeme reálný cenový kontext.
        </p>
      </div>

      {/* Bar chart */}
      <div className="p-5 md:p-7 space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-ink-500 mb-1">
            Cena za m² — porovnání s trhem
          </p>
          <p className="text-xs text-ink-500">
            {projectType === 'novostavba' ? 'Novostavba RD' : 'Rekonstrukce'} ·
            {areaSqm ? ` plocha ${areaSqm} m² · ` : ' '}
            celková cena {formatCZK(totalPrice, { compact: true })}
          </p>
        </div>

        <div className="space-y-4">
          {/* Our price — highlighted */}
          <PriceBar
            label="Naše nabídka"
            sublabel="Stavira s.r.o."
            value={ourPrice}
            barWidth={inView ? barWidth(market.ourPricePerSqm) : '0%'}
            color="accent"
            highlighted
            delay={0}
            inView={inView}
          />

          {/* Praha avg */}
          <PriceBar
            label="Průměr Praha"
            sublabel={`Rozsah ${formatCZK(market.prahaLow, { compact: true })} – ${formatCZK(market.prahaHigh, { compact: true })}`}
            value={prahaAvg}
            barWidth={inView ? barWidth(market.prahaAvg) : '0%'}
            barRange={inView ? {
              from: barWidth(market.prahaLow),
              to: barWidth(market.prahaHigh),
            } : null}
            color="slate"
            delay={250}
            inView={inView}
          />

          {/* Středočeský kraj avg */}
          <PriceBar
            label="Průměr Středočeský kraj"
            sublabel={`Rozsah ${formatCZK(market.stredniLow, { compact: true })} – ${formatCZK(market.stredniHigh, { compact: true })}`}
            value={stredniAvg}
            barWidth={inView ? barWidth(market.stredniAvg) : '0%'}
            barRange={inView ? {
              from: barWidth(market.stredniLow),
              to: barWidth(market.stredniHigh),
            } : null}
            color="slate"
            delay={500}
            inView={inView}
          />
        </div>

        {/* Footer summary card */}
        {isCompetitive && (
          <div
            className={classNames(
              'mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3',
              inView && 'reveal-up'
            )}
            style={{ animationDelay: '1s' }}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">
                Naše cena je {Math.abs(market.vsPragueAvg)}&nbsp;%&nbsp;{market.vsPragueAvg < 0 ? 'pod' : 'nad'} pražským průměrem.
              </p>
              <p className="text-emerald-800 text-xs mt-0.5 leading-relaxed">
                A to bez kompromisů — používáme stejné kvalitní materiály jako prémiové firmy
                (Porotherm, Knauf, Wienerberger). Pojďte si to ověřit v rozpisu položek níže.
              </p>
            </div>
          </div>
        )}

        {isPartialScope && (
          <div
            className={classNames(
              'mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3',
              inView && 'reveal-up'
            )}
            style={{ animationDelay: '1s' }}
          >
            <Sparkles className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">
                Cena vychází podstatně níže — tato nabídka má specifický rozsah.
              </p>
              <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                Tržní průměry zahrnují kompletní dodávky „na klíč". Pokud chcete kompletní stavbu,
                rádi pro vás připravíme rozšířenou nabídku. V rozsahu této nabídky šetříte oproti běžným cenám.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PriceBar({ label, sublabel, value, barWidth, barRange, color, highlighted, delay = 0, inView }) {
  return (
    <div
      className={classNames(
        'transition-all',
        inView && 'reveal-up'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
        <div className="min-w-0">
          <p className={classNames(
            'font-semibold text-sm leading-tight',
            highlighted ? 'text-ink-900' : 'text-ink-700'
          )}>
            {label}
          </p>
          {sublabel && (
            <p className="text-[10px] text-ink-500 mt-0.5">{sublabel}</p>
          )}
        </div>
        <div className="text-right">
          <p className={classNames(
            'font-display font-extrabold tabular-nums leading-none',
            highlighted ? 'text-ink-900 text-xl md:text-2xl' : 'text-ink-700 text-base'
          )}>
            {formatCZK(value, { compact: true })}
            <span className="text-xs text-ink-500 font-normal ml-1">/m²</span>
          </p>
        </div>
      </div>

      {/* Bar with optional range */}
      <div className={classNames(
        'relative h-3 rounded-full overflow-hidden',
        highlighted ? 'bg-ink-100' : 'bg-ink-50'
      )}>
        {/* Range (low–high) shown as lighter bar behind average */}
        {barRange && (
          <div
            className="absolute h-full bg-ink-200/70 rounded-full"
            style={{
              left: barRange.from,
              width: `calc(${barRange.to} - ${barRange.from})`,
              transition: 'left 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s, width 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s',
            }}
          />
        )}

        {/* Average value bar */}
        <div
          className={classNames(
            'h-full rounded-full transition-all',
            highlighted
              ? 'bg-gradient-to-r from-accent-400 to-accent-300 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
              : 'bg-ink-400'
          )}
          style={{
            width: barWidth,
            transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* Tick mark on highlighted bar end */}
        {highlighted && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-ink-900 rounded-full shadow-md"
            style={{
              left: `calc(${barWidth} - 2px)`,
              transition: 'left 1.4s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// 2. VALUE RADAR — 5 dimensions
// ============================================================
function ValueRadarBlock() {
  const [ref, inView] = useInView({ threshold: 0.2 });

  const dimensions = [
    { label: 'Cenová férovost',  value: 92, color: 'amber' },
    { label: 'Kvalita materiálu',value: 95, color: 'emerald' },
    { label: 'Záruka',           value: 100, color: 'blue' },
    { label: 'Zkušenost týmu',   value: 90, color: 'purple' },
    { label: 'Termín a spolehlivost', value: 88, color: 'orange' },
  ];

  return (
    <section ref={ref} className="card p-5 md:p-7">
      <div className="flex items-start gap-3 mb-5">
        <div className={classNames(
          'w-10 h-10 rounded-xl bg-ink-900 text-accent-400 flex items-center justify-center flex-shrink-0',
          inView && 'scale-in'
        )}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-lg md:text-xl font-extrabold text-ink-900 leading-tight">
            Proč to dává smysl
          </h2>
          <p className="text-sm text-ink-600 mt-1">
            Cena je jen jedna stránka. Tady je celkový obraz toho, co dostáváte.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map((d, i) => (
          <RadarBar key={d.label} {...d} inView={inView} delay={i * 120} />
        ))}
      </div>
    </section>
  );
}

function RadarBar({ label, value, color, inView, delay }) {
  const animatedValue = useCountUp({ end: value, start: inView, duration: 1200 });

  const colorClasses = {
    amber:   'from-accent-400 to-accent-300',
    emerald: 'from-emerald-500 to-emerald-400',
    blue:    'from-blue-500 to-blue-400',
    purple:  'from-purple-500 to-purple-400',
    orange:  'from-orange-500 to-orange-400',
  }[color] || 'from-ink-400 to-ink-300';

  return (
    <div
      className={classNames(inView && 'reveal-up')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-sm font-semibold text-ink-800">{label}</p>
        <p className="font-mono tabular-nums text-sm font-bold text-ink-900">
          {animatedValue} <span className="text-ink-400 font-normal">/ 100</span>
        </p>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
        <div
          className={classNames('h-full rounded-full bg-gradient-to-r', colorClasses)}
          style={{
            width: inView ? `${value}%` : '0%',
            transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${delay + 100}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// 3. WHAT'S INCLUDED
// ============================================================
function WhatsIncludedBlock({ projectType }) {
  const [ref, inView] = useInView({ threshold: 0.15 });

  const items = MARKET_DATA.whatIsTypicallyIncluded;

  return (
    <section ref={ref} className="card p-5 md:p-7">
      <div className="flex items-start gap-3 mb-5">
        <div className={classNames(
          'w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0',
          inView && 'scale-in'
        )}>
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-lg md:text-xl font-extrabold text-ink-900 leading-tight">
            Co je v naší ceně zahrnuto
          </h2>
          <p className="text-sm text-ink-600 mt-1">
            Žádná překvapení. Tady je přesně, co dostáváte za naši cenu.
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {items.map((item, i) => (
          <li
            key={item.label}
            className={classNames(
              'flex items-center gap-2.5 text-sm',
              inView && 'reveal-up'
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              className={classNames(
                'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                item.always ? 'bg-emerald-500 text-white' :
                item.varies ? 'bg-amber-100 text-amber-700' :
                'bg-ink-100 text-ink-400',
                inView && 'check-pop'
              )}
              style={{ animationDelay: `${i * 60 + 200}ms` }}
            >
              {item.always ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> : null}
              {item.varies ? <Sparkles className="w-3 h-3" /> : null}
              {item.often ? <span className="text-[9px] font-bold leading-none">−</span> : null}
            </span>
            <div className="flex-1 min-w-0">
              <span className={classNames(
                'leading-tight',
                item.always ? 'text-ink-900 font-medium' :
                item.varies ? 'text-ink-700' : 'text-ink-500'
              )}>
                {item.label}
              </span>
              {item.often && (
                <span className="text-[10px] text-ink-400 ml-1.5 italic">{item.often}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 pt-4 border-t border-ink-100 grid grid-cols-3 gap-2 text-xs">
        <Legend color="emerald" label="V ceně" />
        <Legend color="amber" label="Volitelné" />
        <Legend color="slate" label="Není v ceně" />
      </div>
    </section>
  );
}

function Legend({ color, label }) {
  const dot = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-400',
    slate: 'bg-ink-300',
  }[color];
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-600">
      <span className={classNames('w-2.5 h-2.5 rounded-full', dot)} />
      {label}
    </span>
  );
}

// ============================================================
// 4. WARRANTY HIGHLIGHT
// ============================================================
function WarrantyHighlight() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const yearCount = useCountUp({ end: 5, start: inView, duration: 800 });

  return (
    <section
      ref={ref}
      className="card overflow-hidden bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50 border-amber-200"
    >
      <div className="p-6 md:p-7 grid grid-cols-1 md:grid-cols-[auto,1fr] gap-5 items-center">
        <div className={classNames(
          'w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-accent-400 to-amber-500 text-ink-900 flex items-center justify-center flex-shrink-0 shadow-lg',
          inView && 'scale-in soft-glow'
        )}>
          <div className="text-center">
            <p className="font-display text-4xl md:text-5xl font-black tabular-nums leading-none">
              {yearCount}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-bold mt-1">
              {yearCount === 1 ? 'rok' : 'let'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent-700 mb-1">
            Dvojnásobná záruka
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-black text-ink-900 leading-tight">
            Za svojí prací stojíme 5 let
          </h3>
          <p className="text-sm text-ink-700 mt-2 leading-relaxed">
            Standardní záruka v Česku je 24 měsíců. My poskytujeme {' '}
            <strong className="text-ink-900">5 let na celé dílo</strong> — pokud něco selže,
            přijedeme to opravit zdarma. Bez vytáček, bez výmluv.
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-ink-600 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              Pojištění odpovědnosti 30 mil. Kč
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-amber-700" />
              ČKAIT autorizace
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 5. COMPANY FACTS COUNTERS
// ============================================================
function CompanyFactsBlock() {
  const [ref, inView] = useInView({ threshold: 0.3 });

  const facts = [
    { icon: Calendar, label: 'let zkušeností',         value: COMPANY_FACTS.yearsInBusiness, suffix: '' },
    { icon: Hammer,   label: 'dokončených staveb',     value: COMPANY_FACTS.completedProjects, suffix: '' },
    { icon: Heart,    label: 'spokojených klientů',    value: COMPANY_FACTS.happyClients, suffix: '' },
    { icon: Star,     label: 'průměrné hodnocení',     value: COMPANY_FACTS.averageRating, suffix: ' / 5', decimals: 1 },
  ];

  return (
    <section ref={ref} className="card p-5 md:p-7 bg-ink-900 text-white border-ink-900">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {facts.map((fact, i) => (
          <CounterFact key={fact.label} {...fact} inView={inView} delay={i * 150} />
        ))}
      </div>
    </section>
  );
}

function CounterFact({ icon: Icon, label, value, suffix, decimals, inView, delay }) {
  const animatedValue = useCountUp({ end: value, start: inView, duration: 1600, decimals: decimals || 0 });

  return (
    <div
      className={classNames('text-center', inView && 'reveal-up')}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={classNames(
          'w-11 h-11 rounded-xl bg-accent-400 text-ink-900 flex items-center justify-center mx-auto mb-2',
          inView && 'scale-in'
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-display text-3xl md:text-4xl font-black tabular-nums text-accent-400 leading-none">
        {decimals ? animatedValue.toFixed(decimals) : animatedValue}{suffix}
      </p>
      <p className="text-xs text-ink-300 mt-1.5 leading-tight">{label}</p>
    </div>
  );
}

// ============================================================
// 6. REFERENCES
// ============================================================
function ReferencesBlock() {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <section ref={ref}>
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-lg md:text-xl font-extrabold text-ink-900">
          Co o nás říkají naši klienti
        </h2>
        <p className="text-xs text-ink-500 font-mono tabular-nums">
          {COMPANY_FACTS.ratingCount} hodnocení · ⭐ {COMPANY_FACTS.averageRating}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {REFERENCES.map((ref, i) => (
          <ReferenceCard key={ref.id} reference={ref} inView={inView} delay={i * 150} />
        ))}
      </div>
    </section>
  );
}

function ReferenceCard({ reference: r, inView, delay }) {
  const colorBg = {
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-800',
    emerald: 'bg-emerald-100 text-emerald-800',
  }[r.color] || 'bg-ink-100 text-ink-800';

  return (
    <article
      className={classNames(
        'card overflow-hidden flex flex-col',
        inView && 'reveal-up'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header strip with icon */}
      <div className={classNames('p-3 flex items-center gap-2', colorBg)}>
        <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">{r.year}</p>
          <p className="text-xs font-semibold leading-tight truncate">{r.title}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              className={classNames(
                'w-3.5 h-3.5',
                s <= r.rating ? 'fill-accent-400 text-accent-400' : 'text-ink-200'
              )}
            />
          ))}
        </div>

        <p className="text-sm text-ink-700 leading-relaxed italic">
          „{r.quote}"
        </p>

        <p className="text-xs text-ink-500 mt-auto">
          — {r.author}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-ink-100 text-[11px]">
          <div>
            <p className="text-ink-500 uppercase font-bold tracking-wider text-[9px]">Plocha</p>
            <p className="font-mono tabular-nums font-bold text-ink-900">{r.area} m²</p>
          </div>
          <div>
            <p className="text-ink-500 uppercase font-bold tracking-wider text-[9px]">Doba</p>
            <p className="font-mono tabular-nums font-bold text-ink-900">{r.duration}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// 7. DIFFERENTIATORS
// ============================================================
function DifferentiatorsBlock() {
  const [ref, inView] = useInView({ threshold: 0.1 });

  const iconMap = {
    shield: Shield,
    users: Users,
    eye: Eye,
    award: Award,
  };

  return (
    <section ref={ref}>
      <h2 className="font-display text-lg md:text-xl font-extrabold text-ink-900 mb-4">
        Co děláme jinak
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DIFFERENTIATORS.map((d, i) => {
          const Icon = iconMap[d.icon] || Sparkles;
          return (
            <article
              key={d.title}
              className={classNames(
                'card p-4 flex gap-3 items-start',
                inView && 'reveal-up'
              )}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-700 border border-accent-200 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-ink-900 text-sm leading-tight">
                  {d.title}
                </h3>
                <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                  {d.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ============================================================
// 8. TEAM
// ============================================================
function TeamBlock() {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <section ref={ref} className="card p-5 md:p-7">
      <div className="flex items-start gap-3 mb-5">
        <div className={classNames(
          'w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0',
          inView && 'scale-in'
        )}>
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-lg md:text-xl font-extrabold text-ink-900 leading-tight">
            Tým, který vám staví
          </h2>
          <p className="text-sm text-ink-600 mt-1">
            Stejní lidé od základů po klíče. Žádné anonymní subdodavatele.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TEAM_MEMBERS.map((member, i) => (
          <TeamMemberCard key={member.name} member={member} inView={inView} delay={i * 120} />
        ))}
      </div>

      {/* Certifications row */}
      <div className="mt-6 pt-5 border-t border-ink-100 flex items-center gap-3 flex-wrap">
        <Certification icon={BadgeCheck} label="ČKAIT autorizace" />
        <Certification icon={Shield}     label="Pojištění 30 mil." />
        <Certification icon={Lock}        label="Záruka 5 let" />
        <Certification icon={Briefcase}  label={`IČO · od ${COMPANY_FACTS.founded}`} />
      </div>
    </section>
  );
}

function TeamMemberCard({ member, inView, delay }) {
  const colorBg = {
    amber: 'from-amber-200 to-amber-100 text-amber-900',
    blue: 'from-blue-200 to-blue-100 text-blue-900',
    emerald: 'from-emerald-200 to-emerald-100 text-emerald-900',
  }[member.color] || 'from-ink-200 to-ink-100 text-ink-900';

  const initials = member.name.split(' ').map((p) => p[0]).join('').slice(0, 2);

  return (
    <div
      className={classNames(
        'flex items-center gap-3 p-3 rounded-xl bg-ink-50/40',
        inView && 'reveal-up'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={classNames(
        'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center font-display font-bold flex-shrink-0',
        colorBg
      )}>
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-ink-900 truncate">{member.name}</p>
        <p className="text-xs text-ink-600 truncate">{member.role}</p>
        <p className="text-[10px] text-ink-500 font-mono tabular-nums mt-0.5">
          {member.experience} ve firmě
        </p>
      </div>
    </div>
  );
}

function Certification({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 bg-ink-50 border border-ink-200 px-2.5 py-1.5 rounded-lg font-medium">
      <Icon className="w-3.5 h-3.5 text-ink-500" />
      {label}
    </span>
  );
}

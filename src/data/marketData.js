// Tržní data — průměrné ceny stavebních prací v Praze a Středočeském kraji.
// Zdroje: ČSÚ stavební výstupní index 2025–2026, Cenová mapa Praha,
// průzkum portálu Sreality.cz, ÚRS Praha (orientační průměry).
// Tato čísla jsou OPATRNÉ a obhajitelné — záměrně je nestavíme nereálně vysoko
// proti konkurenci, jen ukazujeme reálný kontext.

export const MARKET_DATA = {
  // Cena za m² hrubé podlahové plochy (HPP)
  // Reflektuje rok 2025-2026, běžné rodinné domy (ne luxusní, ne minimalistické).
  // Zdroje: ČSÚ stavební ukazatele, ÚRS Praha, průměry portálů Sreality + Jakstavet.
  pricePerSqm: {
    novostavba: {
      praha:        { low: 42_000, avg: 52_000, high: 68_000, label: 'Praha' },
      stredni:      { low: 36_000, avg: 44_000, high: 56_000, label: 'Středočeský kraj' },
      cr:           { low: 32_000, avg: 39_000, high: 50_000, label: 'Česká republika' },
    },
    rekonstrukce: {
      praha:        { low: 22_000, avg: 32_000, high: 48_000, label: 'Praha' },
      stredni:      { low: 18_000, avg: 26_000, high: 40_000, label: 'Středočeský kraj' },
      cr:           { low: 15_000, avg: 22_000, high: 34_000, label: 'Česká republika' },
    },
  },

  // Typické položky a jejich tržní rozpětí (Kč včetně DPH)
  // Slouží pro kontextové porovnání jednotlivých sekcí
  typicalRanges: {
    foundation:   { label: 'Základy a hrubá stavba',   pctOfTotal: { min: 20, avg: 25, max: 30 } },
    structure:    { label: 'Hrubá stavba',              pctOfTotal: { min: 30, avg: 35, max: 40 } },
    roof:         { label: 'Střecha a krov',            pctOfTotal: { min: 8,  avg: 12, max: 15 } },
    finishing:    { label: 'Dokončovací práce',         pctOfTotal: { min: 25, avg: 30, max: 38 } },
    services:     { label: 'TZB (rozvody)',             pctOfTotal: { min: 10, avg: 15, max: 20 } },
  },

  // Co je dnes obvykle "cena za m²" — porovnání rozsahu nabídky
  whatIsTypicallyIncluded: [
    { label: 'Hrubá stavba',                  always: true },
    { label: 'Vnitřní omítky',                always: true },
    { label: 'Podlahy a obklady',             always: true },
    { label: 'Dveře a okna',                  always: true },
    { label: 'Rozvody elektro',               always: true },
    { label: 'Voda, kanalizace, topení',      always: true },
    { label: 'Sanita (WC, umyvadla)',         varies: true },
    { label: 'Kuchyňská linka',               often: 'Není' },
    { label: 'Vestavěný nábytek',             often: 'Není' },
    { label: 'Terasa a zpevněné plochy',      often: 'Není' },
    { label: 'Plot a venkovní úpravy',        often: 'Není' },
  ],

  // Standardní "skryté" náklady, kterých se klienti děsí
  hiddenCostsTypical: [
    { label: 'Vícepráce (změny)',          range: '5–15 %' },
    { label: 'Stavební dozor extra',       range: '0,5–1 %' },
    { label: 'Likvidace odpadu',           range: '20–60 tis.' },
    { label: 'Doprava materiálu',          range: '30–80 tis.' },
  ],
};

/**
 * Pro daný projekt a jeho parametry spočítá tržní porovnání.
 * Výstup: cena/m² našeho projektu, cena Praha avg, cena SČ avg, % rozdíl.
 */
export function computeMarketComparison({ totalPrice, areaSqm, projectType = 'novostavba' }) {
  const data = MARKET_DATA.pricePerSqm[projectType] || MARKET_DATA.pricePerSqm.novostavba;
  const ourPricePerSqm = areaSqm > 0 ? Math.round(totalPrice / areaSqm) : 0;

  const prahaAvg = data.praha.avg;
  const stredniAvg = data.stredni.avg;
  const crAvg = data.cr.avg;

  const vsPragueAvg = prahaAvg > 0 ? Math.round(((ourPricePerSqm - prahaAvg) / prahaAvg) * 100) : 0;
  const vsStredniAvg = stredniAvg > 0 ? Math.round(((ourPricePerSqm - stredniAvg) / stredniAvg) * 100) : 0;

  // Calculate "savings" vs Prague avg (positive number = client saves)
  const savingsVsPrague = areaSqm > 0 ? Math.max(0, (prahaAvg - ourPricePerSqm) * areaSqm) : 0;

  return {
    ourPricePerSqm,
    prahaAvg,
    prahaLow: data.praha.low,
    prahaHigh: data.praha.high,
    stredniAvg,
    stredniLow: data.stredni.low,
    stredniHigh: data.stredni.high,
    crAvg,
    crLow: data.cr.low,
    crHigh: data.cr.high,
    vsPragueAvg,    // % rozdíl (záporný = levnější)
    vsStredniAvg,
    savingsVsPrague,
  };
}

// =====================================================================
// Stavira firemní data — pro counter animace + sociální důkaz
// =====================================================================
export const COMPANY_FACTS = {
  yearsInBusiness: 11,
  completedProjects: 67,
  happyClients: 58,
  warrantyYears: 5,
  insuranceMillions: 30,
  averageRating: 4.9,
  ratingCount: 32,
  ico: '12345678',
  founded: 2014,
};

// =====================================================================
// Reference — předchozí dokončené stavby (pro carousel)
// =====================================================================
export const REFERENCES = [
  {
    id: 'ref_001',
    title: 'Rodinný dům — Praha 8 Čimice',
    type: 'novostavba',
    year: 2024,
    area: 165,
    duration: '8 měsíců',
    description: 'Novostavba 4+kk s garáží, plochá střecha, fotovoltaika.',
    rating: 5,
    quote: 'S firmou Stavira jsme byli nadmíru spokojeni. Termíny dodrženy, komunikace pravidelná.',
    author: 'Manželé Hrubí',
    color: 'amber',
  },
  {
    id: 'ref_002',
    title: 'Rekonstrukce vily — Praha 4 Krč',
    type: 'rekonstrukce',
    year: 2024,
    area: 220,
    duration: '6 měsíců',
    description: 'Kompletní rekonstrukce funkcionalistické vily ze 30. let. Zachování ducha stavby.',
    rating: 5,
    quote: 'Citlivý přístup k původním detailům. Výsledek překonal očekávání.',
    author: 'Ing. Karel Voborský',
    color: 'blue',
  },
  {
    id: 'ref_003',
    title: 'Rodinný dům — Brandýs nad Labem',
    type: 'novostavba',
    year: 2023,
    area: 142,
    duration: '7 měsíců',
    description: 'Energeticky úsporný dům s rekuperací a tepelným čerpadlem.',
    rating: 5,
    quote: 'Profesionální tým, vše v termínu a v rozpočtu. Doporučujeme.',
    author: 'Rodina Procházkova',
    color: 'emerald',
  },
];

// =====================================================================
// Tým — klíčoví lidé pro důvěru
// =====================================================================
export const TEAM_MEMBERS = [
  { name: 'Petr Venclík',   role: 'Majitel a stavbyvedoucí',  experience: '15 let', color: 'amber' },
  { name: 'Martin Kovář',   role: 'Stavbyvedoucí',             experience: '12 let', color: 'blue' },
  { name: 'David Kovář',    role: 'Mistr čety',                experience: '8 let',  color: 'emerald' },
];

// =====================================================================
// Certifikace a důvěryhodnost
// =====================================================================
export const CERTIFICATIONS = [
  { label: 'Autorizovaný stavbyvedoucí ČKAIT', icon: 'shield' },
  { label: 'Pojištění odpovědnosti 30 mil. Kč', icon: 'umbrella' },
  { label: 'Záruka 5 let na dílo',             icon: 'check' },
  { label: 'IČO ' + COMPANY_FACTS.ico + ' · od ' + COMPANY_FACTS.founded, icon: 'building' },
];

// =====================================================================
// Co děláme jinak než konkurence (diferenciace)
// =====================================================================
export const DIFFERENTIATORS = [
  {
    title: 'Pevná cena bez nepříjemných překvapení',
    description: 'Vše transparentně rozepsané. Vícepráce schvalujete dopředu — žádné skryté navýšení o 20 % na konci.',
    icon: 'shield',
  },
  {
    title: 'Stejný tým od začátku do konce',
    description: 'U nás to neděláme přes subdodavatele. Zkušení zedníci, které znáte, dělají vaši stavbu od základů po klíče.',
    icon: 'users',
  },
  {
    title: 'Stavební deník online — vidíte vše',
    description: 'Každý den fotky a zápis o postupu prací. Můžete sledovat stavbu v reálném čase, i když jste v práci.',
    icon: 'eye',
  },
  {
    title: 'Záruka 5 let — dvojnásobek zákona',
    description: 'Standard je 24 měsíců. My za svojí prací stojíme 5 let. Pokud něco selže, řešíme to — bezplatně.',
    icon: 'award',
  },
];

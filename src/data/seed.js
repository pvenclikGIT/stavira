// Demo data for Stavira — family houses around Vinoř, Praha 9
// All prices in CZK, dates in ISO format

// Re-export material catalog
export { initialMaterials, MATERIAL_CATEGORIES, MATERIAL_SUPPLIER } from './materials';

export const PROJECT_TYPES = {
  novostavba:   { label: 'Novostavba',   color: 'amber',   short: 'NS' },
  rekonstrukce: { label: 'Rekonstrukce', color: 'blue',    short: 'RK' },
};

// Default stages depend on project type
export const STAGES_BY_TYPE = {
  novostavba: [
    { key: 'priprava',   label: 'Příprava',       description: 'Projektová dokumentace, povolení, vytyčení.' },
    { key: 'hruba',      label: 'Hrubá stavba',   description: 'Základy, zdivo, strop, krov, střecha.' },
    { key: 'vnitrni',    label: 'Vnitřní práce',  description: 'Rozvody, omítky, podlahy, obklady.' },
    { key: 'dokonceni',  label: 'Dokončení',      description: 'Finální povrchy, sanita, předání.' },
  ],
  rekonstrukce: [
    { key: 'priprava',   label: 'Příprava',       description: 'Zaměření, projekt, ohlášení.' },
    { key: 'bourani',    label: 'Bourání',        description: 'Demolice nenosných konstrukcí, odpady.' },
    { key: 'site',       label: 'Sítě a rozvody', description: 'Elektro, voda, topení, kanalizace.' },
    { key: 'povrchy',    label: 'Povrchy',        description: 'Omítky, podlahy, obklady, malby.' },
    { key: 'dokonceni',  label: 'Dokončení',      description: 'Vybavení, finální úpravy, předání.' },
  ],
};

export const PROJECT_STATUSES = {
  planning:    { label: 'V přípravě',  color: 'slate' },
  active:      { label: 'V realizaci', color: 'amber' },
  paused:      { label: 'Pozastaven',  color: 'blue' },
  done:        { label: 'Dokončen',    color: 'emerald' },
};

export const INVOICE_TYPES = {
  deposit:    { label: 'Zálohová', color: 'amber',   defaultPct: 30 },
  progress:   { label: 'Průběžná', color: 'blue',    defaultPct: 0 },
  final:      { label: 'Doplatek', color: 'emerald', defaultPct: 0 },
};

export const INVOICE_STATUSES = {
  draft:    { label: 'Koncept',      color: 'slate' },
  sent:     { label: 'Odesláno',     color: 'amber' },
  paid:     { label: 'Zaplaceno',    color: 'emerald' },
  overdue:  { label: 'Po splatnosti', color: 'red' },
};

export const CHANGE_ORDER_STATUSES = {
  proposed:  { label: 'Návrh',       color: 'slate' },
  pending:   { label: 'Ke schválení', color: 'amber' },
  approved:  { label: 'Schváleno',   color: 'emerald' },
  rejected:  { label: 'Zamítnuto',   color: 'red' },
};

export const FINDING_SEVERITY = {
  low:    { label: 'Nízká',  color: 'slate' },
  medium: { label: 'Střední', color: 'amber' },
  high:   { label: 'Vysoká',  color: 'red' },
};

export const FINDING_STATUSES = {
  open:       { label: 'Otevřeno',   color: 'red' },
  documented: { label: 'Zdokumentováno', color: 'amber' },
  resolved:   { label: 'Vyřešeno',   color: 'emerald' },
};

// ============================================================
// CLIENTS
// ============================================================
export const initialClients = [
  {
    id: 'cli_novak',
    name: 'Pavel Novák',
    company: '',
    email: 'pavel.novak@email.cz',
    phone: '+420 602 123 456',
    address: 'U Bažantnice 12, 190 17 Praha-Vinoř',
    note: 'Investor, preferuje komunikaci e-mailem. Velmi pečlivý.',
    createdAt: '2025-01-15',
  },
  {
    id: 'cli_svobodova',
    name: 'Jana Svobodová',
    company: '',
    email: 'j.svobodova@gmail.com',
    phone: '+420 723 987 654',
    address: 'Mladoboleslavská 45, 197 00 Praha-Kbely',
    note: 'Druhá etapa rekonstrukce, již s námi spolupracovala.',
    createdAt: '2024-11-08',
  },
  {
    id: 'cli_dvorak',
    name: 'Ing. Tomáš Dvořák',
    company: 'Dvořák Reality s.r.o.',
    email: 'dvorak@dvorakreality.cz',
    phone: '+420 608 444 222',
    address: 'K Letišti 8, 197 00 Praha-Satalice',
    note: 'Developerský projekt, plánuje další zakázky.',
    createdAt: '2025-02-20',
  },
  {
    id: 'cli_horakovi',
    name: 'Manželé Horákovi',
    company: '',
    email: 'horak.martin@seznam.cz',
    phone: '+420 776 333 111',
    address: 'Bohdanečská 22, 199 00 Praha-Letňany',
    note: 'Mladá rodina, první dům. Rozhodují společně.',
    createdAt: '2025-03-05',
  },
  {
    id: 'cli_prochazka',
    name: 'MUDr. Karel Procházka',
    company: '',
    email: 'k.prochazka@email.cz',
    phone: '+420 605 778 899',
    address: 'Cukrovarská 14, 196 00 Praha-Čakovice',
    note: 'Vyšší standard, dbá na detaily a materiály.',
    createdAt: '2024-09-12',
  },
  {
    id: 'cli_bartos',
    name: 'Jiří Bartoš',
    company: '',
    email: 'bartos.jiri@volny.cz',
    phone: '+420 720 555 444',
    address: 'Slavětínská 38, 190 14 Praha-Klánovice',
    note: 'Pozemek v lese, nutnost ohledů na okolní stromy.',
    createdAt: '2025-04-01',
  },
  {
    id: 'cli_kralova',
    name: 'Eva Králová',
    company: '',
    email: 'eva.kralova@email.cz',
    phone: '+420 728 111 999',
    address: 'Ke Kbelům 5, 190 17 Praha-Vinoř',
    note: 'Rekonstrukce starého rodinného domu po rodičích.',
    createdAt: '2024-12-01',
  },
];

// ============================================================
// HELPER for stages
// ============================================================
const buildStages = (type, defs) => {
  const template = STAGES_BY_TYPE[type];
  return template.map((s, i) => ({
    id: `stg_${s.key}_${Math.random().toString(36).slice(2, 6)}`,
    key: s.key,
    label: s.label,
    description: s.description,
    order: i,
    startDate: defs[i]?.startDate || '',
    endDate:   defs[i]?.endDate   || '',
    progress:  defs[i]?.progress  ?? 0,
    budget:    defs[i]?.budget    ?? 0,
    actualCost:defs[i]?.actualCost?? 0,
  }));
};

// ============================================================
// PROJECTS
// ============================================================
export const initialProjects = [
  {
    id: 'prj_novak_vinor',
    name: 'Rodinný dům Novák — Vinoř',
    code: '2025-001',
    type: 'novostavba',
    clientId: 'cli_novak',
    address: 'Bohdanečská 142, 190 17 Praha-Vinoř',
    description: 'Novostavba rodinného domu 5+kk s garáží, plocha 178 m². Plochá střecha, fasáda kombinace omítka + dřevěný obklad.',
    status: 'active',
    budget: 9_800_000,
    actualCost: 4_120_000,
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    deadline: '2025-11-30',
    progress: 42,
    siteManager: 'Martin Kovář',
    originalCondition: '',
    stages: buildStages('novostavba', [
      { startDate: '2025-02-01', endDate: '2025-03-15', progress: 100, budget: 800_000,   actualCost: 820_000  },
      { startDate: '2025-03-16', endDate: '2025-06-30', progress: 95,  budget: 4_200_000, actualCost: 3_300_000 },
      { startDate: '2025-07-01', endDate: '2025-10-15', progress: 5,   budget: 3_400_000, actualCost: 0        },
      { startDate: '2025-10-16', endDate: '2025-11-30', progress: 0,   budget: 1_400_000, actualCost: 0        },
    ]),
    createdAt: '2025-01-20',
  },
  {
    id: 'prj_svoboda_kbely',
    name: 'Rekonstrukce RD Svobodová — Kbely',
    code: '2024-007',
    type: 'rekonstrukce',
    clientId: 'cli_svobodova',
    address: 'Mladoboleslavská 45, 197 00 Praha-Kbely',
    description: 'Kompletní rekonstrukce přízemí a půdní vestavba. Zachování původního zdiva 1. PP.',
    status: 'active',
    budget: 4_350_000,
    actualCost: 3_180_000,
    startDate: '2024-11-15',
    endDate: '2025-06-30',
    deadline: '2025-06-30',
    progress: 78,
    siteManager: 'Petr Hájek',
    originalCondition: 'Dům z 60. let, původní okna, eternitová střecha (azbest!), elektroinstalace v hliníku. Nutná kompletní obnova rozvodů. Zdivo cihelné, suché, bez statických problémů.',
    stages: buildStages('rekonstrukce', [
      { startDate: '2024-11-15', endDate: '2024-12-10', progress: 100, budget: 280_000,   actualCost: 270_000  },
      { startDate: '2024-12-11', endDate: '2025-01-20', progress: 100, budget: 420_000,   actualCost: 510_000  },
      { startDate: '2025-01-21', endDate: '2025-03-31', progress: 100, budget: 1_350_000, actualCost: 1_280_000 },
      { startDate: '2025-04-01', endDate: '2025-05-31', progress: 80,  budget: 1_600_000, actualCost: 1_120_000 },
      { startDate: '2025-06-01', endDate: '2025-06-30', progress: 0,   budget: 700_000,   actualCost: 0        },
    ]),
    createdAt: '2024-10-15',
  },
  {
    id: 'prj_dvorak_satalice',
    name: 'Developerský projekt — Satalice 4 RD',
    code: '2025-003',
    type: 'novostavba',
    clientId: 'cli_dvorak',
    address: 'K Letišti 8–14, 197 00 Praha-Satalice',
    description: 'Čtyři identické řadové rodinné domy 4+kk, společné inženýrské sítě.',
    status: 'planning',
    budget: 26_400_000,
    actualCost: 480_000,
    startDate: '2025-05-15',
    endDate: '2026-08-31',
    deadline: '2026-08-31',
    progress: 4,
    siteManager: 'Martin Kovář',
    originalCondition: '',
    stages: buildStages('novostavba', [
      { startDate: '2025-05-15', endDate: '2025-07-31', progress: 35, budget: 1_800_000,  actualCost: 480_000 },
      { startDate: '2025-08-01', endDate: '2026-02-28', progress: 0,  budget: 11_200_000, actualCost: 0       },
      { startDate: '2026-03-01', endDate: '2026-07-15', progress: 0,  budget: 9_600_000,  actualCost: 0       },
      { startDate: '2026-07-16', endDate: '2026-08-31', progress: 0,  budget: 3_800_000,  actualCost: 0       },
    ]),
    createdAt: '2025-02-25',
  },
  {
    id: 'prj_horak_letnany',
    name: 'Novostavba RD Horákovi — Letňany',
    code: '2025-005',
    type: 'novostavba',
    clientId: 'cli_horakovi',
    address: 'Bohdanečská 22, 199 00 Praha-Letňany',
    description: 'Bungalov 4+kk, dřevostavba na ŽB základech. Důraz na nízkoenergetický standard.',
    status: 'active',
    budget: 6_900_000,
    actualCost: 1_240_000,
    startDate: '2025-03-20',
    endDate: '2025-12-15',
    deadline: '2025-12-15',
    progress: 22,
    siteManager: 'Petr Hájek',
    originalCondition: '',
    stages: buildStages('novostavba', [
      { startDate: '2025-03-20', endDate: '2025-04-30', progress: 100, budget: 600_000,   actualCost: 640_000  },
      { startDate: '2025-05-01', endDate: '2025-08-15', progress: 30,  budget: 2_900_000, actualCost: 600_000  },
      { startDate: '2025-08-16', endDate: '2025-11-30', progress: 0,   budget: 2_500_000, actualCost: 0        },
      { startDate: '2025-12-01', endDate: '2025-12-15', progress: 0,   budget: 900_000,   actualCost: 0        },
    ]),
    createdAt: '2025-03-10',
  },
  {
    id: 'prj_prochazka_cakovice',
    name: 'Vila Procházka — Čakovice',
    code: '2024-005',
    type: 'novostavba',
    clientId: 'cli_prochazka',
    address: 'Cukrovarská 14, 196 00 Praha-Čakovice',
    description: 'Reprezentativní vila 6+kk s bazénem a wellness. Vyšší standard, italský obklad fasády.',
    status: 'done',
    budget: 14_200_000,
    actualCost: 14_580_000,
    startDate: '2024-09-15',
    endDate: '2025-04-15',
    deadline: '2025-04-15',
    progress: 100,
    siteManager: 'Martin Kovář',
    originalCondition: '',
    stages: buildStages('novostavba', [
      { startDate: '2024-09-15', endDate: '2024-10-31', progress: 100, budget: 1_100_000, actualCost: 1_080_000 },
      { startDate: '2024-11-01', endDate: '2025-01-31', progress: 100, budget: 5_800_000, actualCost: 6_100_000 },
      { startDate: '2025-02-01', endDate: '2025-03-31', progress: 100, budget: 5_200_000, actualCost: 5_300_000 },
      { startDate: '2025-04-01', endDate: '2025-04-15', progress: 100, budget: 2_100_000, actualCost: 2_100_000 },
    ]),
    createdAt: '2024-08-20',
  },
  {
    id: 'prj_bartos_klanovice',
    name: 'RD Bartoš — Klánovice (les)',
    code: '2025-008',
    type: 'novostavba',
    clientId: 'cli_bartos',
    address: 'Slavětínská 38, 190 14 Praha-Klánovice',
    description: 'Dřevostavba mezi vzrostlými duby. Speciální základová deska bez výkopu pro ochranu kořenů.',
    status: 'planning',
    budget: 5_600_000,
    actualCost: 0,
    startDate: '2025-06-01',
    endDate: '2026-03-31',
    deadline: '2026-03-31',
    progress: 0,
    siteManager: 'Petr Hájek',
    originalCondition: '',
    stages: buildStages('novostavba', [
      { startDate: '2025-06-01', endDate: '2025-07-15', progress: 0, budget: 480_000,   actualCost: 0 },
      { startDate: '2025-07-16', endDate: '2025-11-30', progress: 0, budget: 2_400_000, actualCost: 0 },
      { startDate: '2025-12-01', endDate: '2026-02-28', progress: 0, budget: 1_980_000, actualCost: 0 },
      { startDate: '2026-03-01', endDate: '2026-03-31', progress: 0, budget: 740_000,   actualCost: 0 },
    ]),
    createdAt: '2025-04-10',
  },
  {
    id: 'prj_kralova_vinor',
    name: 'Rekonstrukce RD Králová — Vinoř',
    code: '2024-009',
    type: 'rekonstrukce',
    clientId: 'cli_kralova',
    address: 'Ke Kbelům 5, 190 17 Praha-Vinoř',
    description: 'Rekonstrukce rodinného domu z 50. let. Zachování dispozice, výměna všech rozvodů, zateplení, nová střecha. Půdní vestavba s ložnicí a koupelnou.',
    status: 'active',
    budget: 3_900_000,
    actualCost: 1_750_000,
    startDate: '2025-01-10',
    endDate: '2025-09-30',
    deadline: '2025-09-30',
    progress: 48,
    siteManager: 'Petr Hájek',
    originalCondition: 'Dům z roku 1956, cihlové zdivo, vlhká podezdívka v JZ rohu (zatékání). Původní okna z 80. let, krov v dobrém stavu, poškozená střešní krytina (břidlice). Topení akumulačními kamny.',
    stages: buildStages('rekonstrukce', [
      { startDate: '2025-01-10', endDate: '2025-02-15', progress: 100, budget: 240_000,   actualCost: 235_000  },
      { startDate: '2025-02-16', endDate: '2025-03-31', progress: 100, budget: 380_000,   actualCost: 420_000  },
      { startDate: '2025-04-01', endDate: '2025-06-15', progress: 80,  budget: 1_200_000, actualCost: 1_095_000 },
      { startDate: '2025-06-16', endDate: '2025-08-31', progress: 0,   budget: 1_400_000, actualCost: 0        },
      { startDate: '2025-09-01', endDate: '2025-09-30', progress: 0,   budget: 680_000,   actualCost: 0        },
    ]),
    createdAt: '2024-11-20',
  },
];

// ============================================================
// INVOICES
// ============================================================
export const initialInvoices = [
  { id: 'inv_novak_1', projectId: 'prj_novak_vinor', number: '2025010', type: 'deposit',
    issueDate: '2025-02-05', dueDate: '2025-02-19', paidDate: '2025-02-12',
    amount: 2_940_000, status: 'paid',
    label: 'Záloha 30 % — zahájení', note: '' },
  { id: 'inv_novak_2', projectId: 'prj_novak_vinor', number: '2025028', type: 'progress',
    issueDate: '2025-04-30', dueDate: '2025-05-14', paidDate: '2025-05-09',
    amount: 1_180_000, status: 'paid',
    label: 'Průběžná — hrubá stavba (50 %)', note: '' },
  { id: 'inv_svob_1', projectId: 'prj_svoboda_kbely', number: '2024055', type: 'deposit',
    issueDate: '2024-11-18', dueDate: '2024-12-02', paidDate: '2024-11-26',
    amount: 1_305_000, status: 'paid',
    label: 'Záloha 30 % — zahájení', note: '' },
  { id: 'inv_svob_2', projectId: 'prj_svoboda_kbely', number: '2025014', type: 'progress',
    issueDate: '2025-03-15', dueDate: '2025-03-29', paidDate: '2025-03-22',
    amount: 1_400_000, status: 'paid',
    label: 'Průběžná — sítě, povrchy', note: '' },
  { id: 'inv_svob_3', projectId: 'prj_svoboda_kbely', number: '2025032', type: 'progress',
    issueDate: '2025-05-20', dueDate: '2025-06-03', paidDate: null,
    amount: 950_000, status: 'sent',
    label: 'Průběžná — povrchy II.', note: 'Včetně schválených víceprací' },
  { id: 'inv_proc_1', projectId: 'prj_prochazka_cakovice', number: '2024042', type: 'deposit',
    issueDate: '2024-09-20', dueDate: '2024-10-04', paidDate: '2024-09-28',
    amount: 4_260_000, status: 'paid',
    label: 'Záloha 30 %', note: '' },
  { id: 'inv_proc_2', projectId: 'prj_prochazka_cakovice', number: '2024063', type: 'progress',
    issueDate: '2024-12-15', dueDate: '2024-12-29', paidDate: '2024-12-23',
    amount: 4_500_000, status: 'paid',
    label: 'Průběžná — hrubá stavba', note: '' },
  { id: 'inv_proc_3', projectId: 'prj_prochazka_cakovice', number: '2025008', type: 'progress',
    issueDate: '2025-02-20', dueDate: '2025-03-06', paidDate: '2025-02-28',
    amount: 4_100_000, status: 'paid',
    label: 'Průběžná — vnitřní práce', note: '' },
  { id: 'inv_proc_4', projectId: 'prj_prochazka_cakovice', number: '2025020', type: 'final',
    issueDate: '2025-04-15', dueDate: '2025-04-29', paidDate: '2025-04-22',
    amount: 1_720_000, status: 'paid',
    label: 'Doplatek + vícepráce', note: 'Zahrnuje schválené VP-1 a VP-2' },
  { id: 'inv_kral_1', projectId: 'prj_kralova_vinor', number: '2025002', type: 'deposit',
    issueDate: '2025-01-12', dueDate: '2025-01-26', paidDate: '2025-01-22',
    amount: 1_170_000, status: 'paid',
    label: 'Záloha 30 %', note: '' },
  { id: 'inv_kral_2', projectId: 'prj_kralova_vinor', number: '2025025', type: 'progress',
    issueDate: '2025-04-10', dueDate: '2025-04-24', paidDate: null,
    amount: 580_000, status: 'overdue',
    label: 'Průběžná — bourání + sítě', note: 'Klientka avizovala zaplacení do 5. 5.' },
];

// ============================================================
// CHANGE ORDERS (vícepráce)
// ============================================================
export const initialChangeOrders = [
  { id: 'co_svob_1', projectId: 'prj_svoboda_kbely', number: 'VP-001',
    title: 'Výměna trámu v krovu',
    description: 'Při bourání podhledu zjištěn napadený trám (dřevomorka). Nutná výměna a chemická ochrana okolního dřeva.',
    amount: 78_000, requestedDate: '2025-01-15', decidedDate: '2025-01-17',
    status: 'approved', findingId: 'fnd_svob_1',
    clientNote: 'Souhlasím s výměnou. Bezpečnost na prvním místě. — J. Svobodová' },
  { id: 'co_svob_2', projectId: 'prj_svoboda_kbely', number: 'VP-002',
    title: 'Posun příčky v koupelně',
    description: 'Klient si přeje rozšířit koupelnu o 40 cm na úkor chodby. Nutná úprava rozvodů.',
    amount: 42_000, requestedDate: '2025-03-02', decidedDate: '2025-03-05',
    status: 'approved', findingId: null,
    clientNote: 'OK, schvaluji.' },
  { id: 'co_kral_1', projectId: 'prj_kralova_vinor', number: 'VP-001',
    title: 'Sanace vlhkého zdiva v JZ rohu',
    description: 'Při odstranění omítky odhaleny degradované cihly do výšky 80 cm. Doporučujeme injektážní hydroizolaci a výměnu cihel.',
    amount: 145_000, requestedDate: '2025-03-15', decidedDate: '2025-03-18',
    status: 'approved', findingId: 'fnd_kral_1',
    clientNote: 'Děkuji za fotografie a vysvětlení. Schvaluji řešení injektáží.' },
  { id: 'co_kral_2', projectId: 'prj_kralova_vinor', number: 'VP-002',
    title: 'Posílení stropní konstrukce nad kuchyní',
    description: 'Odhalen nedostatečně dimenzovaný strop pro plánovanou půdní vestavbu. Nutné statické posílení.',
    amount: 96_000, requestedDate: '2025-04-22', decidedDate: null,
    status: 'pending', findingId: 'fnd_kral_2',
    clientNote: '' },
  { id: 'co_kral_3', projectId: 'prj_kralova_vinor', number: 'VP-003',
    title: 'Krbová vložka v obývacím pokoji',
    description: 'Klient si přeje doplnit krbovou vložku včetně komínového tělesa.',
    amount: 88_000, requestedDate: '2025-04-25', decidedDate: null,
    status: 'proposed', findingId: null,
    clientNote: '' },
];

// ============================================================
// FINDINGS (nálezy / skryté vady) — only for renovations
// ============================================================
export const initialFindings = [
  { id: 'fnd_svob_1', projectId: 'prj_svoboda_kbely',
    title: 'Napadený trám v krovu (dřevomorka)',
    description: 'Při demontáži podhledu odhalen napadený krovový trám u JV štítu. Houba se rozšířila do okolního zdiva.',
    severity: 'high', status: 'resolved',
    foundDate: '2025-01-14', stageKey: 'bourani',
    photoUrls: [], changeOrderId: 'co_svob_1' },
  { id: 'fnd_kral_1', projectId: 'prj_kralova_vinor',
    title: 'Vlhké zdivo v JZ rohu',
    description: 'Po odstranění omítky odhaleny degradované cihly v rozsahu cca 2,5 m² do výšky 80 cm. Příčina: chybějící hydroizolace v podlaze.',
    severity: 'high', status: 'resolved',
    foundDate: '2025-03-14', stageKey: 'bourani',
    photoUrls: [], changeOrderId: 'co_kral_1' },
  { id: 'fnd_kral_2', projectId: 'prj_kralova_vinor',
    title: 'Poddimenzovaný strop nad kuchyní',
    description: 'Stávající dřevěné trámy 14×16 cm v rozteči 90 cm jsou nedostatečné pro zatížení plánované půdní vestavbou (výpočet stat.).',
    severity: 'high', status: 'documented',
    foundDate: '2025-04-21', stageKey: 'site',
    photoUrls: [], changeOrderId: 'co_kral_2' },
  { id: 'fnd_kral_3', projectId: 'prj_kralova_vinor',
    title: 'Stará elektroinstalace v hliníku',
    description: 'V chodbě a komoře nalezeny zbytky původních hliníkových rozvodů, neoznačené. Bezpečnostní riziko, řeší se v rámci běžných sítí.',
    severity: 'medium', status: 'open',
    foundDate: '2025-04-28', stageKey: 'site',
    photoUrls: [], changeOrderId: null },
];

// ============================================================
// DIARY ENTRIES (stavební deník + fotodeník)
// ============================================================
export const WEATHER_OPTIONS = {
  sunny:    { label: 'Slunečno',  emoji: '☀️' },
  partly:   { label: 'Polojasno', emoji: '⛅' },
  cloudy:   { label: 'Zataženo',  emoji: '☁️' },
  rain:     { label: 'Déšť',      emoji: '🌧️' },
  snow:     { label: 'Sníh',      emoji: '🌨️' },
  windy:    { label: 'Vítr',      emoji: '💨' },
  frost:    { label: 'Mráz',      emoji: '❄️' },
};

export const initialDiaryEntries = [
  // Novák Vinoř — recent entries
  {
    id: 'diary_novak_1', projectId: 'prj_novak_vinor',
    date: '2026-04-29', authorId: 'usr_manager', authorName: 'Martin Kovář',
    weather: 'partly', tempC: 14, workersCount: 5,
    workDone: 'Pokračovali jsme s vyzdíváním 2.NP — západní stěna hotová, severní z poloviny. Zedníci Karel + Honza, na pomoc dvojka učňů.',
    issues: '',
    photoUrls: [],
  },
  {
    id: 'diary_novak_2', projectId: 'prj_novak_vinor',
    date: '2026-04-28', authorId: 'usr_manager', authorName: 'Martin Kovář',
    weather: 'rain', tempC: 9, workersCount: 3,
    workDone: 'Kvůli dešti přerušeno zdění. Připravovali jsme materiál pod přístřeškem, čistili lešení.',
    issues: 'Dodávka cihel zpoždění o 2 dny — ovlivní harmonogram.',
    photoUrls: [],
  },
  {
    id: 'diary_novak_3', projectId: 'prj_novak_vinor',
    date: '2026-04-27', authorId: 'usr_manager', authorName: 'Martin Kovář',
    weather: 'sunny', tempC: 18, workersCount: 6,
    workDone: 'Dokončen strop nad 1.NP — bednění odstraněno, povrch v pořádku. Začalo zdění 2.NP.',
    issues: '',
    photoUrls: [],
  },
  // Králová — renovation
  {
    id: 'diary_kral_1', projectId: 'prj_kralova_vinor',
    date: '2026-04-29', authorId: 'usr_manager', authorName: 'Petr Hájek',
    weather: 'partly', tempC: 13, workersCount: 4,
    workDone: 'Pokládka rozvodů elektro v 1.NP. Zedníci dokončili vyzdění příček v ložnici.',
    issues: 'V chodbě nalezeny zbytky původní hliníkové elektroinstalace — viz nález.',
    photoUrls: [],
  },
  {
    id: 'diary_kral_2', projectId: 'prj_kralova_vinor',
    date: '2026-04-28', authorId: 'usr_manager', authorName: 'Petr Hájek',
    weather: 'cloudy', tempC: 11, workersCount: 4,
    workDone: 'Statik dnes potvrdil návrh posílení stropu nad kuchyní — 4 nové ocelové nosníky. Čekáme na schválení víceprací klientkou.',
    issues: '',
    photoUrls: [],
  },
  // Svobodová — recent
  {
    id: 'diary_svob_1', projectId: 'prj_svoboda_kbely',
    date: '2026-04-29', authorId: 'usr_manager', authorName: 'Petr Hájek',
    weather: 'partly', tempC: 14, workersCount: 3,
    workDone: 'Malíři dokončili druhou vrstvu v obyváku. Pokládají dlažbu v koupelně 2.NP.',
    issues: '',
    photoUrls: [],
  },
  // Horák Letňany
  {
    id: 'diary_hor_1', projectId: 'prj_horak_letnany',
    date: '2026-04-29', authorId: 'usr_manager', authorName: 'Petr Hájek',
    weather: 'partly', tempC: 14, workersCount: 5,
    workDone: 'Dřevěná konstrukce — montáž stěnových panelů na západní straně. Plán dokončit do pátku.',
    issues: '',
    photoUrls: [],
  },
];

// ============================================================
// QUOTES (Cenové nabídky)
// ============================================================
export const QUOTE_STATUSES = {
  draft:    { label: 'Rozpracováno', color: 'slate' },
  sent:     { label: 'Odesláno klientovi', color: 'amber' },
  approved: { label: 'Schváleno',  color: 'emerald' },
  rejected: { label: 'Zamítnuto',  color: 'red' },
  expired:  { label: 'Prošlá platnost', color: 'slate' },
};

// Quote line types
export const QUOTE_LINE_TYPES = {
  material: { label: 'Materiál', color: 'blue' },
  work:     { label: 'Práce',    color: 'amber' },
  other:    { label: 'Ostatní',  color: 'slate' },
};

export const initialQuotes = [
  // Active draft — secretary preparing quote for new family house
  {
    id: 'q_zelinka_001',
    number: 'NAB-2026-001',
    title: 'Novostavba RD Zelinkovi — Vinoř',
    clientId: 'cli_horakovi', // reuse existing client
    address: 'Mladoboleslavská 220, 190 17 Praha-Vinoř',
    description: 'Cenová nabídka kompletní realizace novostavby rodinného domu 4+kk, plocha 142 m², plochá střecha.',
    type: 'novostavba',
    status: 'sent',
    createdAt: '2026-04-22',
    sentDate: '2026-04-25',
    decidedDate: null,
    validUntil: '2026-05-25',
    marginPercent: 18, // celková marže nad nákupní cenou
    laborMarginPercent: 0,
    note: 'Nabídka platí 30 dní. Nezahrnuje vnitřní vybavení, kuchyně a sanity.',
    lines: [
      // === MATERIÁL ===
      { id: 'l1', type: 'material', materialId: 'mat_pt_38_p15', name: 'Porotherm 38 Profi P15', quantity: 480, unit: 'ks', unitPrice: 134, note: 'Obvodové zdivo' },
      { id: 'l2', type: 'material', materialId: 'mat_pt_115_p10', name: 'Porotherm 11,5 Profi P10', quantity: 220, unit: 'ks', unitPrice: 95, note: 'Vnitřní příčky' },
      { id: 'l3', type: 'material', materialId: 'mat_cement_bm325', name: 'Cement II / B-M 32,5 R 25 kg', quantity: 80, unit: 'ks', unitPrice: 132, note: '' },
      { id: 'l4', type: 'material', materialId: 'mat_zelezo_12', name: 'Betonářská žebírková ocel 12 mm', quantity: 1200, unit: 'bm', unitPrice: 24.2, note: 'Věnce a překlady' },
      { id: 'l5', type: 'material', materialId: 'mat_kari_kh20', name: 'KARI síť 6×6 mm, oka 15 cm', quantity: 28, unit: 'ks', unitPrice: 543, note: 'Podkladní deska' },
      { id: 'l6', type: 'material', materialId: 'mat_eps_70f_15', name: 'EPS 70 F fasádní 15 cm', quantity: 240, unit: 'ks', unitPrice: 175, note: '120 m² fasády' },
      { id: 'l7', type: 'material', materialId: 'mat_pt_kp7_200', name: 'Porotherm KP 7 překlad 200 cm', quantity: 8, unit: 'ks', unitPrice: 1024, note: '' },
      { id: 'l8', type: 'material', materialId: 'mat_pt_kp7_150', name: 'Porotherm KP 7 překlad 150 cm', quantity: 6, unit: 'ks', unitPrice: 615, note: '' },
      { id: 'l9', type: 'material', materialId: 'mat_kg_125_2', name: 'KGEM trubka 125 × 2000 mm', quantity: 14, unit: 'ks', unitPrice: 442, note: 'Vnitřní kanalizace' },
      { id: 'l10', type: 'material', materialId: 'mat_kg_160_2', name: 'KGEM trubka 160 × 2000 mm', quantity: 8, unit: 'ks', unitPrice: 637, note: 'Hlavní rozvod' },
      { id: 'l11', type: 'material', materialId: 'mat_kn_mvc8', name: 'TOMEŠ MVC 8 jádrová omítka 30 kg', quantity: 120, unit: 'ks', unitPrice: 123, note: 'Vnitřní omítky' },
      { id: 'l12', type: 'material', materialId: 'mat_kn_mp75', name: 'KNAUF MP 75 sádrová omítka 30 kg', quantity: 60, unit: 'ks', unitPrice: 217, note: 'Stropní omítky' },
      // === PRÁCE ===
      { id: 'l20', type: 'work', materialId: null, name: 'Zemní práce a základy', quantity: 1, unit: 'kpl', unitPrice: 280000, note: 'Včetně bednění a betonáže' },
      { id: 'l21', type: 'work', materialId: null, name: 'Hrubá stavba — zdění', quantity: 320, unit: 'm²', unitPrice: 1450, note: 'Cena včetně zedníků' },
      { id: 'l22', type: 'work', materialId: null, name: 'Stropní konstrukce + věnce', quantity: 142, unit: 'm²', unitPrice: 1850, note: '' },
      { id: 'l23', type: 'work', materialId: null, name: 'Krov + střecha', quantity: 1, unit: 'kpl', unitPrice: 480000, note: 'Plochá střecha s tepelnou izolací' },
      { id: 'l24', type: 'work', materialId: null, name: 'Vnitřní omítky', quantity: 380, unit: 'm²', unitPrice: 380, note: '' },
      { id: 'l25', type: 'work', materialId: null, name: 'Zateplení fasády', quantity: 120, unit: 'm²', unitPrice: 950, note: 'Včetně lepení a kotvení' },
      // === OSTATNÍ ===
      { id: 'l30', type: 'other', materialId: null, name: 'Doprava materiálu', quantity: 1, unit: 'kpl', unitPrice: 35000, note: '' },
      { id: 'l31', type: 'other', materialId: null, name: 'Lešení a stavební zařízení', quantity: 1, unit: 'kpl', unitPrice: 45000, note: '' },
    ],
  },
  // Approved quote — already became a project (Bartoš Klánovice)
  {
    id: 'q_bartos_001',
    number: 'NAB-2025-008',
    title: 'RD Bartoš — Klánovice (les)',
    clientId: 'cli_bartos',
    address: 'Slavětínská 38, 190 14 Praha-Klánovice',
    description: 'Dřevostavba 3+kk se speciální základovou deskou bez výkopu pro ochranu kořenů.',
    type: 'novostavba',
    status: 'approved',
    createdAt: '2025-03-15',
    sentDate: '2025-03-18',
    decidedDate: '2025-04-02',
    validUntil: '2025-04-30',
    marginPercent: 20,
    laborMarginPercent: 0,
    note: 'Schváleno ve verzi V2 po úpravě stropní konstrukce.',
    projectId: 'prj_bartos_klanovice',
    lines: [
      { id: 'b1', type: 'material', materialId: 'mat_kvh_100', name: 'KVH hranol 100×100 × 4 m', quantity: 80, unit: 'ks', unitPrice: 900, note: 'Konstrukce' },
      { id: 'b2', type: 'material', materialId: 'mat_osb_22', name: 'OSB/3 deska 22 mm', quantity: 45, unit: 'ks', unitPrice: 494, note: 'Podlaha' },
      { id: 'b3', type: 'material', materialId: 'mat_osb_15', name: 'OSB/3 deska 15 mm', quantity: 60, unit: 'ks', unitPrice: 358, note: 'Stěny' },
      { id: 'b4', type: 'material', materialId: 'mat_nat_18', name: 'KNAUF Naturoll 039 Pro 18 cm', quantity: 16, unit: 'bal', unitPrice: 1060, note: 'Tepelná izolace' },
      { id: 'b20', type: 'work', materialId: null, name: 'Speciální základová deska', quantity: 1, unit: 'kpl', unitPrice: 320000, note: 'Bez výkopu pro ochranu kořenů' },
      { id: 'b21', type: 'work', materialId: null, name: 'Dřevěná konstrukce', quantity: 110, unit: 'm²', unitPrice: 2800, note: '' },
      { id: 'b22', type: 'work', materialId: null, name: 'Střecha + krytina', quantity: 1, unit: 'kpl', unitPrice: 380000, note: '' },
      { id: 'b30', type: 'other', materialId: null, name: 'Doprava materiálu', quantity: 1, unit: 'kpl', unitPrice: 25000, note: '' },
    ],
  },
  // Draft — secretary still working on it
  {
    id: 'q_kralova_002',
    number: 'NAB-2026-002',
    title: 'Rekonstrukce koupelny — Králová Vinoř',
    clientId: 'cli_kralova',
    address: 'Ke Kbelům 5, 190 17 Praha-Vinoř',
    description: 'Doplňková nabídka rekonstrukce koupelny v rámci probíhajícího projektu.',
    type: 'rekonstrukce',
    status: 'draft',
    createdAt: '2026-04-28',
    sentDate: null,
    decidedDate: null,
    validUntil: '2026-05-30',
    marginPercent: 22,
    laborMarginPercent: 0,
    note: 'Připravujeme — čekáme na specifikaci obkladů od klientky.',
    lines: [
      { id: 'k1', type: 'material', materialId: 'mat_lep_kp_5', name: 'Tekutá lepenka KOUPELNA 5 kg', quantity: 4, unit: 'ks', unitPrice: 529, note: '' },
      { id: 'k2', type: 'material', materialId: 'mat_kn_flex25', name: 'KNAUF Flexkleber C2TE S1 25 kg', quantity: 6, unit: 'ks', unitPrice: 342, note: 'Lepidlo na obklady' },
      { id: 'k3', type: 'material', materialId: 'mat_kn_fugen5', name: 'KNAUF spárovací hmota 5 kg', quantity: 3, unit: 'ks', unitPrice: 151, note: '' },
      { id: 'k20', type: 'work', materialId: null, name: 'Demontáž stávající koupelny', quantity: 1, unit: 'kpl', unitPrice: 28000, note: '' },
      { id: 'k21', type: 'work', materialId: null, name: 'Obklady a dlažba — práce', quantity: 18, unit: 'm²', unitPrice: 850, note: '' },
    ],
  },
  // Pending quote for Pavel Novák — extension on top of his existing project
  // Showcases the client-portal approval flow during demo
  {
    id: 'q_novak_garaz',
    number: 'NAB-2026-003',
    title: 'Doplnění — zděná garáž k RD Novákovi',
    clientId: 'cli_novak',
    address: 'Mladoboleslavská 220, 190 17 Praha-Vinoř',
    description: 'Doplňková nabídka: zděná garáž 6 × 3,5 m s plochou střechou, napojená na hlavní stavbu.\n\nKonstrukce z Porotherm 30, plochá střecha s tepelnou izolací, omítky v souladu s hlavním domem.',
    type: 'novostavba',
    status: 'sent',
    createdAt: '2026-04-26',
    sentDate: '2026-04-28',
    decidedDate: null,
    validUntil: '2026-05-28',
    marginPercent: 17, // legacy fallback
    marginPercentMaterial: 15,
    marginPercentLabor: 22,
    note: 'Cena nezahrnuje vrata garáže (vyberete si dle preference). Termín realizace: 6 týdnů od odsouhlasení. Na všechny práce poskytujeme záruku 5 let.',
    lines: [
      // === Základy ===
      { id: 'g20', type: 'work', sectionTitle: 'Základy', materialId: null, name: 'Zemní práce a základová deska', quantity: 1, unit: 'kpl', unitPrice: 78000, note: 'Výkop, bednění, betonáž' },
      { id: 'g2', type: 'material', sectionTitle: 'Základy', materialId: 'mat_zelezo_10', name: 'Betonářská žebírková ocel 10 mm', quantity: 280, unit: 'bm', unitPrice: 17, note: 'Věnec' },
      { id: 'g3', type: 'material', sectionTitle: 'Základy', materialId: 'mat_kari_kh20', name: 'KARI síť 6×6 mm, oka 15 cm', quantity: 7, unit: 'ks', unitPrice: 543, note: 'Podkladní deska' },
      { id: 'g5', type: 'material', sectionTitle: 'Základy', materialId: 'mat_cement_bm325', name: 'Cement II / B-M 32,5 R 25 kg', quantity: 24, unit: 'ks', unitPrice: 132, note: '' },
      // === Hrubá stavba ===
      { id: 'g1', type: 'material', sectionTitle: 'Hrubá stavba', materialId: 'mat_pt_30_p15', name: 'Porotherm 30 Profi P15', quantity: 80, unit: 'ks', unitPrice: 112, note: 'Obvodové zdivo' },
      { id: 'g6', type: 'material', sectionTitle: 'Hrubá stavba', materialId: 'mat_pt_kp7_300', name: 'Porotherm KP 7 překlad 300 cm', quantity: 1, unit: 'ks', unitPrice: 1684, note: 'Nad vraty' },
      { id: 'g21', type: 'work', sectionTitle: 'Hrubá stavba', materialId: null, name: 'Zdění a věnec', quantity: 21, unit: 'm²', unitPrice: 1450, note: '' },
      // === Střecha a fasáda ===
      { id: 'g22', type: 'work', sectionTitle: 'Střecha a fasáda', materialId: null, name: 'Plochá střecha s tepelnou izolací', quantity: 21, unit: 'm²', unitPrice: 2200, note: '' },
      { id: 'g4', type: 'material', sectionTitle: 'Střecha a fasáda', materialId: 'mat_eps_70f_15', name: 'EPS 70 F fasádní 15 cm', quantity: 38, unit: 'ks', unitPrice: 175, note: 'Zateplení stěn' },
      { id: 'g23', type: 'work', sectionTitle: 'Střecha a fasáda', materialId: null, name: 'Omítky a zateplení fasády', quantity: 65, unit: 'm²', unitPrice: 920, note: 'Slazené s hlavním domem' },
      // === Dokončení ===
      { id: 'g24', type: 'work', sectionTitle: 'Dokončení', materialId: null, name: 'Podlaha — beton + epoxid', quantity: 21, unit: 'm²', unitPrice: 850, note: '' },
      { id: 'g30', type: 'other', sectionTitle: 'Doprava', materialId: null, name: 'Doprava materiálu', quantity: 1, unit: 'kpl', unitPrice: 12000, note: '' },
    ],
  },
];
export const initialUsers = [
  { id: 'usr_owner',   name: 'Petr Venclík',   role: 'owner',     email: 'petr@stavira.cz',     pin: '1111' },
  { id: 'usr_manager', name: 'Martin Kovář',   role: 'manager',   email: 'martin@stavira.cz',   pin: '2222' },
  { id: 'usr_account', name: 'Lenka Nováková', role: 'accountant',email: 'lenka@stavira.cz',    pin: '3333' },
  { id: 'usr_client',  name: 'Pavel Novák',    role: 'client',    email: 'pavel.novak@email.cz', pin: '4444', clientId: 'cli_novak' },
];

export const ROLE_LABELS = {
  owner:      'Majitel',
  manager:    'Stavbyvedoucí',
  accountant: 'Účetní',
  client:     'Klient',
};

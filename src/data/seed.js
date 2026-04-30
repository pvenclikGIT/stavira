// Demo data for Stavira — family houses around Vinoř, Praha 9
// All prices in CZK, dates in ISO format

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
// USERS
// ============================================================
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

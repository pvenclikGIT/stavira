// Seed data for payroll system — 3 employees with 3 months of history
// (February, March, April 2026) plus bonuses, deductions, and payroll records.

export const initialEmployees = [
  {
    id: 'emp_david_st',
    name: 'David Kovář',
    nickname: 'David st.',
    role: 'master',          // mistr
    contractType: 'hpp',
    hourlyRate: 380,
    hireDate: '2018-04-01',
    phone: '+420 602 145 887',
    email: 'david.kovar@stavira.cz',
    birthYear: 1976,
    accountNumber: '1234567890/0100',
    healthInsurance: 'VZP (111)',
    socialNumber: '760418/1234',
    address: 'Vinořské nám. 12, Praha 9',
    hasTaxCredit: true,
    bankNote: 'Mistr čety, 8 let ve firmě. Vede stavbu Novák a Svoboda.',
    color: 'amber',
    avatar: 'DK',
    active: true,
  },
  {
    id: 'emp_david_ml',
    name: 'David Kovář ml.',
    nickname: 'David ml.',
    role: 'bricklayer',      // zedník
    contractType: 'hpp',
    hourlyRate: 320,
    hireDate: '2021-06-15',
    phone: '+420 776 332 901',
    email: 'david.junior@stavira.cz',
    birthYear: 2000,
    accountNumber: '9876543210/0300',
    healthInsurance: 'VZP (111)',
    socialNumber: '000615/5678',
    address: 'Vinořské nám. 12, Praha 9',
    hasTaxCredit: true,
    bankNote: 'Syn Davida st., zedník-tesař. 5 let zkušeností.',
    color: 'blue',
    avatar: 'DM',
    active: true,
  },
  {
    id: 'emp_dominik',
    name: 'Dominik Novotný',
    nickname: 'Dominik',
    role: 'helper',          // pomocný dělník
    contractType: 'hpp',
    hourlyRate: 220,
    hireDate: '2025-09-01',
    phone: '+420 723 558 142',
    email: 'dominik@stavira.cz',
    birthYear: 2003,
    accountNumber: '5544332211/0800',
    healthInsurance: 'OZP (207)',
    socialNumber: '030712/9012',
    address: 'Klánovická 8, Praha 9',
    hasTaxCredit: true,
    bankNote: 'Pomocník, ve firmě od září 2025. Spolehlivý, učí se.',
    color: 'emerald',
    avatar: 'DN',
    active: true,
  },
];

// =====================================================================
// Generate realistic time entries
// =====================================================================

const PROJECT_IDS = [
  'prj_novak_vinor',
  'prj_svoboda_kbely',
  'prj_dvorak_satalice',
  'prj_horak_letnany',
  'prj_prochazka_cakovice',
  'prj_bartos_klanovice',
];

// Workdays in CZ Feb/Mar/Apr 2026 — Easter holidays applied
const HOLIDAYS_2026 = ['2026-04-03', '2026-04-06']; // Velký pátek, Velikonoční pondělí

function isWeekend(dateStr) {
  const d = new Date(dateStr).getDay();
  return d === 0 || d === 6;
}

function generateMonthEntries(year, month, employeeId, primaryProject, secondaryProject) {
  const entries = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (HOLIDAYS_2026.includes(dateStr)) {
      // Holiday — only David st. occasionally works for double pay
      if (employeeId === 'emp_david_st' && Math.random() > 0.7) {
        entries.push({
          id: `te_${employeeId}_${dateStr}`,
          employeeId,
          projectId: primaryProject,
          date: dateStr,
          hours: 6,
          shiftType: 'holiday',
          note: 'Práce o svátku, urgent termín',
        });
      }
      continue;
    }

    if (isWeekend(dateStr)) {
      // Saturdays — sometimes weekend work (but not Sundays)
      if (new Date(dateStr).getDay() === 6 && Math.random() > 0.7) {
        entries.push({
          id: `te_${employeeId}_${dateStr}`,
          employeeId,
          projectId: Math.random() > 0.5 ? primaryProject : secondaryProject,
          date: dateStr,
          hours: 8,
          shiftType: 'weekend',
          note: 'Sobotní směna — dohánění termínu',
        });
      }
      continue;
    }

    // Regular weekday — 8 hours, occasional overtime
    const hasOvertime = Math.random() > 0.78;
    const projectId = Math.random() > 0.3 ? primaryProject : secondaryProject;
    entries.push({
      id: `te_${employeeId}_${dateStr}`,
      employeeId,
      projectId,
      date: dateStr,
      hours: 8,
      shiftType: 'regular',
      note: '',
    });
    if (hasOvertime) {
      entries.push({
        id: `te_${employeeId}_${dateStr}_ot`,
        employeeId,
        projectId,
        date: dateStr,
        hours: 2,
        shiftType: 'overtime',
        note: 'Přesčas — dokončení etapy',
      });
    }
  }
  return entries;
}

// Use a deterministic seed so demo data is stable across reloads.
// We replace Math.random with a seeded variant temporarily.
let seedCounter = 0;
const seededRandom = () => {
  seedCounter += 1;
  const x = Math.sin(seedCounter * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function generateAllEntries() {
  const original = Math.random;
  Math.random = seededRandom;
  try {
    const all = [];
    // David st. — works mostly Novák Vinoř + Svoboda Kbely
    all.push(...generateMonthEntries(2026, 2, 'emp_david_st', 'prj_novak_vinor', 'prj_svoboda_kbely'));
    all.push(...generateMonthEntries(2026, 3, 'emp_david_st', 'prj_novak_vinor', 'prj_svoboda_kbely'));
    all.push(...generateMonthEntries(2026, 4, 'emp_david_st', 'prj_novak_vinor', 'prj_dvorak_satalice'));
    // David ml. — Novák Vinoř + Dvořák Satalice
    all.push(...generateMonthEntries(2026, 2, 'emp_david_ml', 'prj_novak_vinor', 'prj_horak_letnany'));
    all.push(...generateMonthEntries(2026, 3, 'emp_david_ml', 'prj_novak_vinor', 'prj_dvorak_satalice'));
    all.push(...generateMonthEntries(2026, 4, 'emp_david_ml', 'prj_dvorak_satalice', 'prj_novak_vinor'));
    // Dominik — Letňany + Čakovice (jednodušší stavby)
    all.push(...generateMonthEntries(2026, 2, 'emp_dominik', 'prj_horak_letnany', 'prj_prochazka_cakovice'));
    all.push(...generateMonthEntries(2026, 3, 'emp_dominik', 'prj_horak_letnany', 'prj_svoboda_kbely'));
    all.push(...generateMonthEntries(2026, 4, 'emp_dominik', 'prj_prochazka_cakovice', 'prj_horak_letnany'));
    return all;
  } finally {
    Math.random = original;
  }
}

export const initialTimeEntries = generateAllEntries();

// =====================================================================
// Bonuses — given for completed stages
// =====================================================================
export const initialBonuses = [
  // February — David st. dostal bonus za dokončení hrubé stavby Svoboda
  { id: 'bn_001', employeeId: 'emp_david_st', month: '2026-02', amount: 8000, type: 'stage_complete', projectId: 'prj_svoboda_kbely', note: 'Dokončení hrubé stavby Kbely' },
  { id: 'bn_002', employeeId: 'emp_david_ml', month: '2026-02', amount: 5000, type: 'stage_complete', projectId: 'prj_novak_vinor', note: 'Dokončení zdění Vinoř' },

  // March — výkon
  { id: 'bn_003', employeeId: 'emp_david_st', month: '2026-03', amount: 12000, type: 'performance', projectId: null, note: 'Výborný výkon, klient pochválil' },
  { id: 'bn_004', employeeId: 'emp_dominik',  month: '2026-03', amount: 3000,  type: 'quality', projectId: null, note: 'Pečlivá práce, žádné reklamace' },

  // April — etapa
  { id: 'bn_005', employeeId: 'emp_david_st', month: '2026-04', amount: 10000, type: 'stage_complete', projectId: 'prj_dvorak_satalice', note: 'Dokončení dokončovacích prací Satalice' },
  { id: 'bn_006', employeeId: 'emp_david_ml', month: '2026-04', amount: 6000,  type: 'stage_complete', projectId: 'prj_dvorak_satalice', note: 'Dokončení Satalice' },
];

// =====================================================================
// Deductions — advances and other
// =====================================================================
export const initialDeductions = [
  // Únor
  { id: 'dd_001', employeeId: 'emp_david_ml', month: '2026-02', amount: 5000,  type: 'advance', note: 'Záloha na osobní účely' },
  { id: 'dd_002', employeeId: 'emp_dominik',  month: '2026-02', amount: 3000,  type: 'advance', note: 'Záloha — auto v servisu' },

  // Březen — Dominik si půjčil od firmy 30 000, splácí 5 000/měs
  { id: 'dd_003', employeeId: 'emp_dominik', month: '2026-03', amount: 5000, type: 'loan', note: 'Splátka půjčky 1/6' },

  // Duben — pokračování splátky + záloha
  { id: 'dd_004', employeeId: 'emp_dominik',  month: '2026-04', amount: 5000, type: 'loan',    note: 'Splátka půjčky 2/6' },
  { id: 'dd_005', employeeId: 'emp_david_st', month: '2026-04', amount: 8000, type: 'advance', note: 'Záloha — dovolená' },
];

// =====================================================================
// Payroll records — March is paid, April is approved (waiting), Feb is paid
// =====================================================================
export const initialPayrolls = [
  { id: 'pr_001', employeeId: 'emp_david_st', month: '2026-02', status: 'paid',     paidDate: '2026-03-08', approvedDate: '2026-03-05', note: '' },
  { id: 'pr_002', employeeId: 'emp_david_ml', month: '2026-02', status: 'paid',     paidDate: '2026-03-08', approvedDate: '2026-03-05', note: '' },
  { id: 'pr_003', employeeId: 'emp_dominik',  month: '2026-02', status: 'paid',     paidDate: '2026-03-08', approvedDate: '2026-03-05', note: '' },

  { id: 'pr_004', employeeId: 'emp_david_st', month: '2026-03', status: 'paid',     paidDate: '2026-04-09', approvedDate: '2026-04-05', note: '' },
  { id: 'pr_005', employeeId: 'emp_david_ml', month: '2026-03', status: 'paid',     paidDate: '2026-04-09', approvedDate: '2026-04-05', note: '' },
  { id: 'pr_006', employeeId: 'emp_dominik',  month: '2026-03', status: 'paid',     paidDate: '2026-04-09', approvedDate: '2026-04-05', note: '' },

  { id: 'pr_007', employeeId: 'emp_david_st', month: '2026-04', status: 'approved', paidDate: null, approvedDate: '2026-04-29', note: 'Připraveno k výplatě' },
  { id: 'pr_008', employeeId: 'emp_david_ml', month: '2026-04', status: 'approved', paidDate: null, approvedDate: '2026-04-29', note: 'Připraveno k výplatě' },
  { id: 'pr_009', employeeId: 'emp_dominik',  month: '2026-04', status: 'draft',    paidDate: null, approvedDate: null,         note: 'Ke kontrole — chybí 2 dny docházky?' },
];

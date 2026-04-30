import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  initialClients, initialProjects, initialUsers,
  initialInvoices, initialChangeOrders, initialFindings,
  initialDiaryEntries, initialQuotes, initialMaterials,
  STAGES_BY_TYPE,
} from '../data/seed';
import {
  initialEmployees, initialTimeEntries,
  initialBonuses, initialDeductions, initialPayrolls,
} from '../data/payrollSeed';
import { generateId, todayISO } from '../utils/format';

const AppContext = createContext(null);

const STORAGE_VERSION = 6; // bumped — added payroll (employees, time entries, payrolls)
const KEY = (name) => `stavira:v${STORAGE_VERSION}:${name}`;

// One-shot cleanup of stale storage from older app versions.
// Runs once at module load. Removes any stavira:v* keys that aren't current.
// Prevents stale state from breaking the app after schema changes.
(function cleanupOldStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const currentPrefix = `stavira:v${STORAGE_VERSION}:`;
    const toRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('stavira:v') && !key.startsWith(currentPrefix)) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
    if (toRemove.length > 0) {
      console.info(`[Stavira] Vyčištěno ${toRemove.length} zastaralých klíčů ze starší verze.`);
    }
  } catch (err) {
    console.warn('[Stavira] Cleanup of old storage failed:', err);
  }
})();

export function AppProvider({ children }) {
  const [clients, setClients]           = useLocalStorage(KEY('clients'),      initialClients);
  const [projects, setProjects]         = useLocalStorage(KEY('projects'),     initialProjects);
  const [users, setUsers]               = useLocalStorage(KEY('users'),        initialUsers);
  const [invoices, setInvoices]         = useLocalStorage(KEY('invoices'),     initialInvoices);
  const [changeOrders, setChangeOrders] = useLocalStorage(KEY('changeOrders'), initialChangeOrders);
  const [findings, setFindings]         = useLocalStorage(KEY('findings'),     initialFindings);
  const [diaryEntries, setDiaryEntries] = useLocalStorage(KEY('diary'),        initialDiaryEntries);
  const [quotes, setQuotes]             = useLocalStorage(KEY('quotes'),       initialQuotes);
  const [materials, setMaterials]       = useLocalStorage(KEY('materials'),    initialMaterials);
  const [employees, setEmployees]       = useLocalStorage(KEY('employees'),    initialEmployees);
  const [timeEntries, setTimeEntries]   = useLocalStorage(KEY('timeEntries'),  initialTimeEntries);
  const [bonuses, setBonuses]           = useLocalStorage(KEY('bonuses'),      initialBonuses);
  const [deductions, setDeductions]     = useLocalStorage(KEY('deductions'),   initialDeductions);
  const [payrolls, setPayrolls]         = useLocalStorage(KEY('payrolls'),     initialPayrolls);
  const [currentUserId, setCurrentUserId] = useLocalStorage(KEY('currentUser'), null);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  const isClient = currentUser?.role === 'client';
  const isOwner = currentUser?.role === 'owner';
  const isManager = currentUser?.role === 'manager';
  const isAccountant = currentUser?.role === 'accountant';

  const visibleProjects = useMemo(() => {
    if (!currentUser) return [];
    if (isClient && currentUser.clientId) {
      return projects.filter((p) => p.clientId === currentUser.clientId);
    }
    return projects;
  }, [projects, currentUser, isClient]);

  // ---------- Auth ----------
  const login = useCallback((userId) => setCurrentUserId(userId), [setCurrentUserId]);
  const logout = useCallback(() => setCurrentUserId(null), [setCurrentUserId]);

  // ---------- Clients ----------
  const addClient = useCallback((data) => {
    const newClient = { id: generateId('cli'), createdAt: todayISO(), ...data };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  }, [setClients]);
  const updateClient = useCallback((id, patch) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, [setClients]);
  const deleteClient = useCallback((id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, [setClients]);
  const getClient = useCallback(
    (id) => clients.find((c) => c.id === id) || null, [clients]
  );

  // ---------- Projects ----------
  const addProject = useCallback((data) => {
    const newProject = {
      id: generateId('prj'), createdAt: todayISO(),
      progress: 0, actualCost: 0, stages: [], type: 'novostavba',
      originalCondition: '', ...data,
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, [setProjects]);
  const updateProject = useCallback((id, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, [setProjects]);
  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setInvoices((prev) => prev.filter((i) => i.projectId !== id));
    setChangeOrders((prev) => prev.filter((c) => c.projectId !== id));
    setFindings((prev) => prev.filter((f) => f.projectId !== id));
    setDiaryEntries((prev) => prev.filter((d) => d.projectId !== id));
  }, [setProjects, setInvoices, setChangeOrders, setFindings, setDiaryEntries]);
  const getProject = useCallback(
    (id) => projects.find((p) => p.id === id) || null, [projects]
  );
  const projectsForClient = useCallback(
    (clientId) => projects.filter((p) => p.clientId === clientId), [projects]
  );

  // ---------- Stages ----------
  const updateStage = useCallback((projectId, stageId, patch) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const stages = p.stages.map((s) => (s.id === stageId ? { ...s, ...patch } : s));
        const avg = Math.round(stages.reduce((s, st) => s + (st.progress || 0), 0) / stages.length);
        const totalActual = stages.reduce((s, st) => s + (st.actualCost || 0), 0);
        return { ...p, stages, progress: avg, actualCost: totalActual };
      })
    );
  }, [setProjects]);
  const addStage = useCallback((projectId, data) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newStage = {
          id: generateId('stg'),
          key: data.key || `custom_${Math.random().toString(36).slice(2, 6)}`,
          label: data.label || 'Nová etapa',
          description: data.description || '',
          order: p.stages.length,
          startDate: data.startDate || '', endDate: data.endDate || '',
          progress: data.progress ?? 0, budget: data.budget ?? 0, actualCost: data.actualCost ?? 0,
        };
        return { ...p, stages: [...p.stages, newStage] };
      })
    );
  }, [setProjects]);
  const deleteStage = useCallback((projectId, stageId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const stages = p.stages.filter((s) => s.id !== stageId).map((s, i) => ({ ...s, order: i }));
        const avg = stages.length
          ? Math.round(stages.reduce((s, st) => s + (st.progress || 0), 0) / stages.length) : 0;
        const totalActual = stages.reduce((s, st) => s + (st.actualCost || 0), 0);
        return { ...p, stages, progress: avg, actualCost: totalActual };
      })
    );
  }, [setProjects]);
  const moveStage = useCallback((projectId, stageId, direction) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const idx = p.stages.findIndex((s) => s.id === stageId);
        if (idx === -1) return p;
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= p.stages.length) return p;
        const stages = [...p.stages];
        [stages[idx], stages[newIdx]] = [stages[newIdx], stages[idx]];
        return { ...p, stages: stages.map((s, i) => ({ ...s, order: i })) };
      })
    );
  }, [setProjects]);
  const replaceStagesFromTemplate = useCallback((projectId, type) => {
    const template = STAGES_BY_TYPE[type];
    if (!template) return;
    const stages = template.map((s, i) => ({
      id: generateId('stg'), key: s.key, label: s.label, description: s.description,
      order: i, startDate: '', endDate: '', progress: 0, budget: 0, actualCost: 0,
    }));
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, stages, progress: 0, actualCost: 0 } : p))
    );
  }, [setProjects]);

  // ---------- Invoices ----------
  const invoicesForProject = useCallback(
    (projectId) => invoices.filter((i) => i.projectId === projectId), [invoices]
  );
  const addInvoice = useCallback((data) => {
    const newInvoice = {
      id: generateId('inv'), issueDate: todayISO(), paidDate: null,
      status: 'draft', note: '', ...data,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  }, [setInvoices]);
  const updateInvoice = useCallback((id, patch) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, [setInvoices]);
  const deleteInvoice = useCallback((id) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, [setInvoices]);

  // ---------- Change Orders ----------
  const changeOrdersForProject = useCallback(
    (projectId) => changeOrders.filter((c) => c.projectId === projectId), [changeOrders]
  );
  const addChangeOrder = useCallback((data) => {
    const newCO = {
      id: generateId('co'), requestedDate: todayISO(), decidedDate: null,
      status: 'proposed', clientNote: '', findingId: null, ...data,
    };
    setChangeOrders((prev) => [newCO, ...prev]);
    return newCO;
  }, [setChangeOrders]);
  const updateChangeOrder = useCallback((id, patch) => {
    setChangeOrders((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, [setChangeOrders]);
  const deleteChangeOrder = useCallback((id) => {
    setChangeOrders((prev) => prev.filter((c) => c.id !== id));
    setFindings((prev) =>
      prev.map((f) => (f.changeOrderId === id ? { ...f, changeOrderId: null } : f))
    );
  }, [setChangeOrders, setFindings]);
  const decideChangeOrder = useCallback((id, status, clientNote = '') => {
    setChangeOrders((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, decidedDate: todayISO(), clientNote } : c))
    );
  }, [setChangeOrders]);

  // ---------- Findings ----------
  const findingsForProject = useCallback(
    (projectId) => findings.filter((f) => f.projectId === projectId), [findings]
  );
  const addFinding = useCallback((data) => {
    const newFinding = {
      id: generateId('fnd'), foundDate: todayISO(), status: 'open', severity: 'medium',
      photoUrls: [], changeOrderId: null, ...data,
    };
    setFindings((prev) => [newFinding, ...prev]);
    return newFinding;
  }, [setFindings]);
  const updateFinding = useCallback((id, patch) => {
    setFindings((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, [setFindings]);
  const deleteFinding = useCallback((id) => {
    setFindings((prev) => prev.filter((f) => f.id !== id));
  }, [setFindings]);

  const promoteFindingToChangeOrder = useCallback((findingId, { title, description, amount }) => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return null;
    const project = projects.find((p) => p.id === finding.projectId);
    if (!project) return null;

    const projectCOs = changeOrders.filter((c) => c.projectId === finding.projectId);
    const number = `VP-${String(projectCOs.length + 1).padStart(3, '0')}`;

    const co = {
      id: generateId('co'), projectId: finding.projectId, number,
      title: title || finding.title, description: description || finding.description,
      amount: amount || 0, requestedDate: todayISO(), decidedDate: null,
      status: 'pending', findingId: finding.id, clientNote: '',
    };
    setChangeOrders((prev) => [co, ...prev]);
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, changeOrderId: co.id, status: 'documented' } : f))
    );
    return co;
  }, [findings, projects, changeOrders, setChangeOrders, setFindings]);

  // ---------- Diary entries ----------
  const diaryForProject = useCallback(
    (projectId) => diaryEntries
      .filter((d) => d.projectId === projectId)
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [diaryEntries]
  );
  const addDiaryEntry = useCallback((data) => {
    const newEntry = {
      id: generateId('diary'), date: todayISO(),
      authorId: currentUser?.id || null,
      authorName: currentUser?.name || 'Neznámý',
      weather: 'sunny', tempC: null, workersCount: null,
      workDone: '', issues: '', photoUrls: [],
      ...data,
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, [setDiaryEntries, currentUser]);
  const updateDiaryEntry = useCallback((id, patch) => {
    setDiaryEntries((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, [setDiaryEntries]);
  const deleteDiaryEntry = useCallback((id) => {
    setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
  }, [setDiaryEntries]);

  // ---------- Materials ----------
  const getMaterial = useCallback(
    (id) => materials.find((m) => m.id === id) || null, [materials]
  );
  const materialsByCategory = useMemo(() => {
    const map = {};
    materials.forEach((m) => {
      if (!map[m.category]) map[m.category] = [];
      map[m.category].push(m);
    });
    return map;
  }, [materials]);
  const addMaterial = useCallback((data) => {
    const newMaterial = { id: generateId('mat'), ...data };
    setMaterials((prev) => [newMaterial, ...prev]);
    return newMaterial;
  }, [setMaterials]);
  const updateMaterial = useCallback((id, patch) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, [setMaterials]);
  const deleteMaterial = useCallback((id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }, [setMaterials]);

  // ---------- Quotes ----------
  const getQuote = useCallback(
    (id) => quotes.find((q) => q.id === id) || null, [quotes]
  );
  const quotesForClient = useCallback(
    (clientId) => quotes.filter((q) => q.clientId === clientId), [quotes]
  );
  const addQuote = useCallback((data) => {
    const seq = String(quotes.length + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const newQuote = {
      id: generateId('q'),
      number: `NAB-${year}-${seq}`,
      status: 'draft',
      createdAt: todayISO(),
      sentDate: null,
      decidedDate: null,
      validUntil: '',
      marginPercent: 18,            // legacy fallback
      marginPercentMaterial: 15,
      marginPercentLabor: 25,
      lines: [],
      note: '',
      type: 'novostavba',
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setQuotes((prev) => [newQuote, ...prev]);
    return newQuote;
  }, [quotes.length, setQuotes]);
  const updateQuote = useCallback((id, patch) => {
    setQuotes((prev) => prev.map((q) => (
      q.id === id ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q
    )));
  }, [setQuotes]);
  const deleteQuote = useCallback((id) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, [setQuotes]);

  // Quote line operations
  const addQuoteLine = useCallback((quoteId, line) => {
    setQuotes((prev) => prev.map((q) => {
      if (q.id !== quoteId) return q;
      const newLine = { id: generateId('l'), type: 'material', quantity: 1, unitPrice: 0, note: '', sectionTitle: null, ...line };
      return { ...q, lines: [...(q.lines || []), newLine], updatedAt: new Date().toISOString() };
    }));
  }, [setQuotes]);
  // Bulk add — used by material picker for hromadné přidání
  const addQuoteLines = useCallback((quoteId, newLines) => {
    setQuotes((prev) => prev.map((q) => {
      if (q.id !== quoteId) return q;
      const stamped = newLines.map((line) => ({
        id: generateId('l'), type: 'material', quantity: 1, unitPrice: 0, note: '', sectionTitle: null, ...line,
      }));
      return { ...q, lines: [...(q.lines || []), ...stamped], updatedAt: new Date().toISOString() };
    }));
  }, [setQuotes]);
  const updateQuoteLine = useCallback((quoteId, lineId, patch) => {
    setQuotes((prev) => prev.map((q) => {
      if (q.id !== quoteId) return q;
      return { ...q, lines: q.lines.map((l) => (l.id === lineId ? { ...l, ...patch } : l)), updatedAt: new Date().toISOString() };
    }));
  }, [setQuotes]);
  const deleteQuoteLine = useCallback((quoteId, lineId) => {
    setQuotes((prev) => prev.map((q) => {
      if (q.id !== quoteId) return q;
      return { ...q, lines: q.lines.filter((l) => l.id !== lineId), updatedAt: new Date().toISOString() };
    }));
  }, [setQuotes]);

  // Apply a template to an existing quote — fills in lines from sections.
  // Existing lines are PRESERVED (template prepends).
  const applyQuoteTemplate = useCallback((quoteId, template) => {
    if (!template || !template.sections) return;
    setQuotes((prev) => prev.map((q) => {
      if (q.id !== quoteId) return q;
      const newLines = [];
      template.sections.forEach((sec) => {
        sec.lines.forEach((tplLine) => {
          let resolved = { ...tplLine, sectionTitle: sec.title };
          // For material lines, hydrate from catalog
          if (tplLine.type === 'material' && tplLine.materialId) {
            const m = materials.find((mm) => mm.id === tplLine.materialId);
            if (m) {
              resolved = {
                ...resolved,
                name: m.name + (m.packaging ? ` (${m.packaging})` : ''),
                unit: m.unit,
                unitPrice: m.priceVAT,
              };
            }
          }
          newLines.push({ id: generateId('l'), note: '', ...resolved });
        });
      });
      return {
        ...q,
        lines: [...newLines, ...(q.lines || [])],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [materials, setQuotes]);

  // Convert approved quote to a real project
  const convertQuoteToProject = useCallback((quoteId) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote || quote.projectId) return null;

    // Calculate total budget with proper margin (uses dual margins)
    const lines = quote.lines || [];
    const subMat = lines.filter((l) => l.type === 'material').reduce((s, l) => s + (Number(l.quantity)||0)*(Number(l.unitPrice)||0), 0);
    const subWork = lines.filter((l) => l.type === 'work').reduce((s, l) => s + (Number(l.quantity)||0)*(Number(l.unitPrice)||0), 0);
    const subOther = lines.filter((l) => l.type === 'other').reduce((s, l) => s + (Number(l.quantity)||0)*(Number(l.unitPrice)||0), 0);
    const fallback = Number(quote.marginPercent) || 0;
    const rateMat = quote.marginPercentMaterial != null ? Number(quote.marginPercentMaterial) : fallback;
    const rateLab = quote.marginPercentLabor != null ? Number(quote.marginPercentLabor) : fallback;
    const total = Math.round(
      subMat * (1 + rateMat/100) +
      subWork * (1 + rateLab/100) +
      subOther * (1 + rateMat/100)
    );

    // Build stages: prefer using quote sections if they exist
    const sectionMap = new Map();
    lines.forEach((l) => {
      if (l.sectionTitle) {
        if (!sectionMap.has(l.sectionTitle)) sectionMap.set(l.sectionTitle, 0);
        sectionMap.set(l.sectionTitle, sectionMap.get(l.sectionTitle) + (Number(l.quantity)||0)*(Number(l.unitPrice)||0));
      }
    });

    let stages;
    if (sectionMap.size >= 2) {
      // Use sections from quote as stages — keeps client-facing structure
      const sectionEntries = Array.from(sectionMap.entries());
      const sumSections = sectionEntries.reduce((s, [,v]) => s + v, 0) || 1;
      stages = sectionEntries.map(([title, sub], i) => ({
        id: generateId('stg'),
        key: title.toLowerCase().replace(/\s+/g, '_').slice(0, 24),
        label: title,
        description: '',
        order: i, startDate: '', endDate: '', progress: 0,
        budget: Math.round((sub / sumSections) * total),
        actualCost: 0,
      }));
    } else {
      // Fall back to standard template
      const template = STAGES_BY_TYPE[quote.type] || STAGES_BY_TYPE.novostavba;
      stages = template.map((s, i) => ({
        id: generateId('stg'), key: s.key, label: s.label, description: s.description,
        order: i, startDate: '', endDate: '', progress: 0,
        budget: Math.round(total / template.length), actualCost: 0,
      }));
    }

    const yearCode = new Date().getFullYear();
    const projectCount = projects.filter((p) => (p.code || '').startsWith(String(yearCode))).length;
    const code = `${yearCode}-${String(projectCount + 1).padStart(3, '0')}`;

    const newProject = {
      id: generateId('prj'),
      name: quote.title,
      code,
      type: quote.type,
      clientId: quote.clientId,
      address: quote.address,
      description: quote.description,
      status: 'planning',
      budget: total,
      actualCost: 0,
      startDate: todayISO(),
      endDate: '',
      deadline: '',
      progress: 0,
      siteManager: '',
      originalCondition: '',
      stages,
      createdAt: todayISO(),
      fromQuoteId: quote.id,
    };

    setProjects((prev) => [newProject, ...prev]);
    setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, projectId: newProject.id } : q)));
    return newProject;
  }, [quotes, projects, setProjects, setQuotes]);

  // ---------- Payroll: Employees ----------
  const getEmployee = useCallback(
    (id) => employees.find((e) => e.id === id) || null, [employees]
  );
  const addEmployee = useCallback((data) => {
    const newEmp = {
      id: generateId('emp'),
      hourlyRate: 250,
      contractType: 'hpp',
      hireDate: todayISO(),
      hasTaxCredit: true,
      active: true,
      avatar: (data.name || '??').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
      color: 'slate',
      ...data,
    };
    setEmployees((prev) => [newEmp, ...prev]);
    return newEmp;
  }, [setEmployees]);
  const updateEmployee = useCallback((id, patch) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, [setEmployees]);
  const deleteEmployee = useCallback((id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setTimeEntries((prev) => prev.filter((te) => te.employeeId !== id));
    setBonuses((prev) => prev.filter((b) => b.employeeId !== id));
    setDeductions((prev) => prev.filter((d) => d.employeeId !== id));
    setPayrolls((prev) => prev.filter((p) => p.employeeId !== id));
  }, [setEmployees, setTimeEntries, setBonuses, setDeductions, setPayrolls]);

  // ---------- Payroll: Time entries ----------
  const timeEntriesForEmployee = useCallback(
    (employeeId) => timeEntries.filter((te) => te.employeeId === employeeId),
    [timeEntries]
  );
  const timeEntriesForProject = useCallback(
    (projectId) => timeEntries.filter((te) => te.projectId === projectId),
    [timeEntries]
  );
  const addTimeEntry = useCallback((data) => {
    const newEntry = {
      id: generateId('te'),
      shiftType: 'regular',
      hours: 8,
      note: '',
      ...data,
    };
    setTimeEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, [setTimeEntries]);
  const updateTimeEntry = useCallback((id, patch) => {
    setTimeEntries((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, [setTimeEntries]);
  const deleteTimeEntry = useCallback((id) => {
    setTimeEntries((prev) => prev.filter((t) => t.id !== id));
  }, [setTimeEntries]);

  // ---------- Payroll: Bonuses ----------
  const addBonus = useCallback((data) => {
    const newBonus = { id: generateId('bn'), type: 'performance', ...data };
    setBonuses((prev) => [newBonus, ...prev]);
    return newBonus;
  }, [setBonuses]);
  const updateBonus = useCallback((id, patch) => {
    setBonuses((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, [setBonuses]);
  const deleteBonus = useCallback((id) => {
    setBonuses((prev) => prev.filter((b) => b.id !== id));
  }, [setBonuses]);

  // ---------- Payroll: Deductions ----------
  const addDeduction = useCallback((data) => {
    const newD = { id: generateId('dd'), type: 'advance', ...data };
    setDeductions((prev) => [newD, ...prev]);
    return newD;
  }, [setDeductions]);
  const updateDeduction = useCallback((id, patch) => {
    setDeductions((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, [setDeductions]);
  const deleteDeduction = useCallback((id) => {
    setDeductions((prev) => prev.filter((d) => d.id !== id));
  }, [setDeductions]);

  // ---------- Payroll: Payroll records (monthly) ----------
  const getPayroll = useCallback(
    (employeeId, month) => payrolls.find((p) => p.employeeId === employeeId && p.month === month) || null,
    [payrolls]
  );
  const upsertPayroll = useCallback((employeeId, month, patch) => {
    setPayrolls((prev) => {
      const existing = prev.find((p) => p.employeeId === employeeId && p.month === month);
      if (existing) {
        return prev.map((p) => (p.id === existing.id ? { ...p, ...patch } : p));
      }
      return [{
        id: generateId('pr'),
        employeeId, month,
        status: 'draft',
        paidDate: null,
        approvedDate: null,
        note: '',
        ...patch,
      }, ...prev];
    });
  }, [setPayrolls]);
  const deletePayroll = useCallback((id) => {
    setPayrolls((prev) => prev.filter((p) => p.id !== id));
  }, [setPayrolls]);

  // ---------- Reset ----------
  const resetAllData = useCallback(() => {
    setClients(initialClients);
    setProjects(initialProjects);
    setUsers(initialUsers);
    setInvoices(initialInvoices);
    setChangeOrders(initialChangeOrders);
    setFindings(initialFindings);
    setDiaryEntries(initialDiaryEntries);
    setQuotes(initialQuotes);
    setMaterials(initialMaterials);
    setEmployees(initialEmployees);
    setTimeEntries(initialTimeEntries);
    setBonuses(initialBonuses);
    setDeductions(initialDeductions);
    setPayrolls(initialPayrolls);
  }, [setClients, setProjects, setUsers, setInvoices, setChangeOrders, setFindings, setDiaryEntries, setQuotes, setMaterials, setEmployees, setTimeEntries, setBonuses, setDeductions, setPayrolls]);

  const value = {
    clients, projects, users, currentUser, invoices, changeOrders, findings, diaryEntries,
    quotes, materials,
    employees, timeEntries, bonuses, deductions, payrolls,
    visibleProjects,
    isClient, isOwner, isManager, isAccountant,
    login, logout,
    addClient, updateClient, deleteClient, getClient,
    addProject, updateProject, deleteProject, getProject, projectsForClient,
    updateStage, addStage, deleteStage, moveStage, replaceStagesFromTemplate,
    invoicesForProject, addInvoice, updateInvoice, deleteInvoice,
    changeOrdersForProject, addChangeOrder, updateChangeOrder, deleteChangeOrder, decideChangeOrder,
    findingsForProject, addFinding, updateFinding, deleteFinding, promoteFindingToChangeOrder,
    diaryForProject, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
    // Materials
    getMaterial, materialsByCategory, addMaterial, updateMaterial, deleteMaterial,
    // Quotes
    getQuote, quotesForClient, addQuote, updateQuote, deleteQuote,
    addQuoteLine, addQuoteLines, updateQuoteLine, deleteQuoteLine,
    applyQuoteTemplate, convertQuoteToProject,
    // Payroll
    getEmployee, addEmployee, updateEmployee, deleteEmployee,
    timeEntriesForEmployee, timeEntriesForProject,
    addTimeEntry, updateTimeEntry, deleteTimeEntry,
    addBonus, updateBonus, deleteBonus,
    addDeduction, updateDeduction, deleteDeduction,
    getPayroll, upsertPayroll, deletePayroll,
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

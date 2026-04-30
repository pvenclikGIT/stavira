import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  initialClients, initialProjects, initialUsers,
  initialInvoices, initialChangeOrders, initialFindings,
  initialDiaryEntries, STAGES_BY_TYPE,
} from '../data/seed';
import { generateId, todayISO } from '../utils/format';

const AppContext = createContext(null);

const STORAGE_VERSION = 3; // bumped — added diary entries + bigger seed dates
const KEY = (name) => `stavira:v${STORAGE_VERSION}:${name}`;

export function AppProvider({ children }) {
  const [clients, setClients]           = useLocalStorage(KEY('clients'),      initialClients);
  const [projects, setProjects]         = useLocalStorage(KEY('projects'),     initialProjects);
  const [users, setUsers]               = useLocalStorage(KEY('users'),        initialUsers);
  const [invoices, setInvoices]         = useLocalStorage(KEY('invoices'),     initialInvoices);
  const [changeOrders, setChangeOrders] = useLocalStorage(KEY('changeOrders'), initialChangeOrders);
  const [findings, setFindings]         = useLocalStorage(KEY('findings'),     initialFindings);
  const [diaryEntries, setDiaryEntries] = useLocalStorage(KEY('diary'),        initialDiaryEntries);
  const [currentUserId, setCurrentUserId] = useLocalStorage(KEY('currentUser'), null);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  // Role helpers
  const isClient = currentUser?.role === 'client';
  const isOwner = currentUser?.role === 'owner';
  const isManager = currentUser?.role === 'manager';
  const isAccountant = currentUser?.role === 'accountant';

  // Project visibility — clients see only their own
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

  // ---------- Reset ----------
  const resetAllData = useCallback(() => {
    setClients(initialClients);
    setProjects(initialProjects);
    setUsers(initialUsers);
    setInvoices(initialInvoices);
    setChangeOrders(initialChangeOrders);
    setFindings(initialFindings);
    setDiaryEntries(initialDiaryEntries);
  }, [setClients, setProjects, setUsers, setInvoices, setChangeOrders, setFindings, setDiaryEntries]);

  const value = {
    // state
    clients, projects, users, currentUser, invoices, changeOrders, findings, diaryEntries,
    visibleProjects,
    // role helpers
    isClient, isOwner, isManager, isAccountant,
    // auth
    login, logout,
    // clients
    addClient, updateClient, deleteClient, getClient,
    // projects
    addProject, updateProject, deleteProject, getProject, projectsForClient,
    // stages
    updateStage, addStage, deleteStage, moveStage, replaceStagesFromTemplate,
    // invoices
    invoicesForProject, addInvoice, updateInvoice, deleteInvoice,
    // change orders
    changeOrdersForProject, addChangeOrder, updateChangeOrder, deleteChangeOrder, decideChangeOrder,
    // findings
    findingsForProject, addFinding, updateFinding, deleteFinding, promoteFindingToChangeOrder,
    // diary
    diaryForProject, addDiaryEntry, updateDiaryEntry, deleteDiaryEntry,
    // utility
    resetAllData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

import { createContext, useContext, useMemo, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialClients, initialProjects, initialUsers } from '../data/seed';
import { generateId, todayISO } from '../utils/format';

const AppContext = createContext(null);

const STORAGE_VERSION = 1;
const KEY = (name) => `stavira:v${STORAGE_VERSION}:${name}`;

export function AppProvider({ children }) {
  const [clients, setClients]   = useLocalStorage(KEY('clients'),  initialClients);
  const [projects, setProjects] = useLocalStorage(KEY('projects'), initialProjects);
  const [users, setUsers]       = useLocalStorage(KEY('users'),    initialUsers);
  const [currentUserId, setCurrentUserId] = useLocalStorage(KEY('currentUser'), null);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  // ---------- Auth ----------
  const login = useCallback((userId) => setCurrentUserId(userId), [setCurrentUserId]);
  const logout = useCallback(() => setCurrentUserId(null), [setCurrentUserId]);

  // ---------- Clients ----------
  const addClient = useCallback((data) => {
    const newClient = {
      id: generateId('cli'),
      createdAt: todayISO(),
      ...data,
    };
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
    (id) => clients.find((c) => c.id === id) || null,
    [clients]
  );

  // ---------- Projects ----------
  const addProject = useCallback((data) => {
    const newProject = {
      id: generateId('prj'),
      createdAt: todayISO(),
      progress: 0,
      actualCost: 0,
      stages: [],
      ...data,
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback((id, patch) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, [setProjects]);

  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, [setProjects]);

  const getProject = useCallback(
    (id) => projects.find((p) => p.id === id) || null,
    [projects]
  );

  const projectsForClient = useCallback(
    (clientId) => projects.filter((p) => p.clientId === clientId),
    [projects]
  );

  // ---------- Reset ----------
  const resetAllData = useCallback(() => {
    setClients(initialClients);
    setProjects(initialProjects);
    setUsers(initialUsers);
  }, [setClients, setProjects, setUsers]);

  const value = {
    // state
    clients, projects, users, currentUser,
    // auth
    login, logout,
    // clients
    addClient, updateClient, deleteClient, getClient,
    // projects
    addProject, updateProject, deleteProject, getProject, projectsForClient,
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

import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import EmptyState from './components/EmptyState';
import { Compass } from 'lucide-react';

function ProtectedShell() {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projekty" element={<Projects />} />
        <Route path="/projekty/:id" element={<ProjectDetail />} />
        <Route path="/klienti" element={<Clients />} />
        <Route path="/klienti/:id" element={<ClientDetail />} />
        <Route
          path="*"
          element={
            <div className="px-4 md:px-8 py-12 max-w-3xl mx-auto">
              <EmptyState
                icon={Compass}
                title="Stránka nenalezena"
                description="Tato stránka neexistuje nebo byla přesunuta."
                action={
                  <Link to="/" className="btn btn-primary">
                    Zpět na Dashboard
                  </Link>
                }
              />
            </div>
          }
        />
      </Routes>
    </AppLayout>
  );
}

function AuthGate() {
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AuthGate />
      </HashRouter>
    </AppProvider>
  );
}

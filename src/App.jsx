import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import Today from './pages/Today';
import Dashboard from './pages/Dashboard';
import DiaryPage from './pages/DiaryPage';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientHome from './pages/ClientHome';
import QuotesPage from './pages/QuotesPage';
import QuoteDetail from './pages/QuoteDetail';
import ClientQuoteView from './pages/ClientQuoteView';
import MaterialsPage from './pages/MaterialsPage';
import PayrollPage from './pages/PayrollPage';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetail from './pages/EmployeeDetail';
import EmptyState from './components/EmptyState';
import ErrorBoundary from './components/ErrorBoundary';
import { Compass } from 'lucide-react';

function ProtectedShell() {
  const { currentUser, isClient } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;

  // Client gets a totally different home — read-only, simplified
  if (isClient) {
    return (
      <AppLayout>
        <Routes>
          <Route path="/" element={<ClientHome />} />
          <Route path="/projekty/:id" element={<ProjectDetail />} />
          <Route path="/nabidky/:id" element={<ClientQuoteView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Today />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/denik" element={<DiaryPage />} />
        <Route path="/projekty" element={<Projects />} />
        <Route path="/projekty/:id" element={<ProjectDetail />} />
        <Route path="/nabidky" element={<QuotesPage />} />
        <Route path="/nabidky/:id" element={<QuoteDetail />} />
        <Route path="/nabidky/:id/nahled" element={<ClientQuoteView previewMode />} />
        <Route path="/material" element={<MaterialsPage />} />
        <Route path="/mzdy" element={<PayrollPage />} />
        <Route path="/mzdy/zamestnanci" element={<EmployeesPage />} />
        <Route path="/mzdy/zamestnanci/:id" element={<EmployeeDetail />} />
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
                    Zpět na úvod
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
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <AuthGate />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

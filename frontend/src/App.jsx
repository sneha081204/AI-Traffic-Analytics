import React, { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { PoliceSidebar } from './components/layout/PoliceSidebar';
import { DepartmentSidebar } from './components/layout/DepartmentSidebar';
import { Header } from './components/layout/Header';
import { TrafficLightCursorTrail } from './components/common/TrafficLightCursorTrail';
import { AppRoutes } from './routes/AppRoutes';
import { ROUTES } from './config/routes';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Runtime Exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0B0F19', color: '#FFFFFF', padding: '2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '520px', background: '#131C2E', padding: '2rem', borderRadius: '16px', border: '1px solid #1E293B', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#E11D48', marginBottom: '1rem', fontSize: '1.4rem' }}>Application Notice</h2>
            <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {this.state.error?.message || 'A render exception occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/police/capture'; }}
                style={{ background: '#2563EB', color: '#FFF', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Return to Enforcement
              </button>
              <button
                onClick={() => { window.location.reload(); }}
                style={{ background: '#1E293B', color: '#FFF', border: '1px solid #334155', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainLayout = () => {
  const location = useLocation();
  const { isDepartment } = useAuth() || {};
  const normalizedPath = (location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';
  const isLandingPage = normalizedPath === ROUTES.LANDING || normalizedPath === '/';
  const isLoginPage = normalizedPath === ROUTES.LOGIN || normalizedPath === '/login';
  const isDepartmentPath = normalizedPath.startsWith('/department');
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    if (isLandingPage || isLoginPage) {
      document.documentElement.classList.add('dark-theme-page');
      document.body.classList.add('dark-theme-page');
      document.documentElement.style.backgroundColor = '#05070D';
      document.body.style.backgroundColor = '#05070D';
    } else {
      document.documentElement.classList.remove('dark-theme-page');
      document.body.classList.remove('dark-theme-page');
      document.documentElement.style.backgroundColor = '#F1F5F9';
      document.body.style.backgroundColor = '#F1F5F9';
    }
  }, [isLandingPage, isLoginPage]);

  if (isLandingPage || isLoginPage) {
    return (
      <>
        <TrafficLightCursorTrail />
        <AppRoutes />
      </>
    );
  }

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', maxHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Dynamic Portal Sidebar */}
      {isDepartmentPath || isDepartment ? (
        <DepartmentSidebar onCloseMobile={() => setMobileOpen(false)} />
      ) : (
        <PoliceSidebar onCloseMobile={() => setMobileOpen(false)} />
      )}

      {/* Main View Area */}
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden', backgroundColor: 'transparent' }}>
        <Header onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />
        <main className="page-body" style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto', overflowX: 'hidden' }}>
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <MainLayout />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;

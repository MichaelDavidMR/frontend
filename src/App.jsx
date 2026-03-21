import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Services from './pages/Services';
import CreateReceipt from './pages/CreateReceipt';
import ReceiptHistory from './pages/ReceiptHistory';
import ViewReceipt from './pages/ViewReceipt';
import ExportBackup from './pages/ExportBackup';
import Login from './pages/Login';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [checking, setChecking] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const stored = localStorage.getItem('token');
      if (!stored) {
        setChecking(false);
        return;
      }
      const API_URL = import.meta.env.VITE_API_URL || 'https://backend-2c3d.onrender.com';
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${stored}` },
        });
        if (!res.ok) {
          localStorage.removeItem('token');
          setToken(null);
        } else {
          setToken(stored);
        }
      } catch {
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setChecking(false);
      }
    };
    verifyToken();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Loading splash while checking token
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 60%, #6366f1 80%, #8b5cf6 100%)',
              animation: 'spin 1.2s linear infinite',
            }}
          />
          <div className="absolute inset-2 rounded-full bg-gray-950 flex items-center justify-center">
            <span className="text-xl">🧾</span>
          </div>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  // Not authenticated → show login
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/receipts/new', label: 'Nuevo Recibo', icon: '📝' },
    { path: '/receipts', label: 'Historial', icon: '📋' },
    { path: '/clients', label: 'Clientes', icon: '👥' },
    { path: '/services', label: 'Servicios', icon: '🔧' },
    { path: '/export', label: 'Exportar', icon: '💾' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🧾</span>
              <h1 className="text-lg font-bold">Recibos</h1>
            </div>

            <div className="flex items-center space-x-3">
              {!isOnline && (
                <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
                  Offline
                </span>
              )}
              {/* Logout button */}
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="hidden md:flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-primary-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <nav className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:block border-r border-gray-200
        `} style={{ top: '56px' }}>
          <div className="p-4 space-y-1 overflow-y-auto h-full pb-20">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="md:hidden flex w-full items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-500 hover:bg-red-50 mt-4"
            >
              <span className="text-xl">🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </nav>

        {/* Overlay for mobile */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMenuOpen(false)}
            style={{ top: '56px' }}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/services" element={<Services />} />
            <Route path="/receipts/new" element={<CreateReceipt />} />
            <Route path="/receipts" element={<ReceiptHistory />} />
            <Route path="/receipts/:id" element={<ViewReceipt />} />
            <Route path="/export" element={<ExportBackup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
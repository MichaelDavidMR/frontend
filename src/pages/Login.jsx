import { useState, useEffect } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      localStorage.setItem('token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600 rounded-full blur-3xl opacity-10 animate-pulse"
        style={{ animationDelay: '1.5s' }} />

      {/* Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>

        {/* Spinning ring wrapper */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer spinning ring */}
          <div className="absolute w-28 h-28 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, #6366f1 80%, #8b5cf6 90%, #6366f1 100%)',
              animation: 'spin 2s linear infinite',
            }}
          />
          {/* Middle ring */}
          <div className="absolute w-24 h-24 rounded-full"
            style={{
              background: 'conic-gradient(from 180deg, transparent 0%, transparent 50%, #8b5cf6 70%, #a78bfa 85%, #8b5cf6 100%)',
              animation: 'spin 3s linear infinite reverse',
            }}
          />
          {/* Inner glow ring */}
          <div className="absolute w-20 h-20 rounded-full"
            style={{
              background: 'conic-gradient(from 90deg, transparent 0%, transparent 40%, #a78bfa 65%, #c4b5fd 80%, #a78bfa 100%)',
              animation: 'spin 1.5s linear infinite',
            }}
          />
          {/* Center logo circle */}
          <div className="relative w-16 h-16 rounded-full bg-gray-950 flex items-center justify-center border border-indigo-500/30 shadow-xl shadow-indigo-500/20">
            <span className="text-2xl">🧾</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>
            Recibos ERP
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Inicia sesión para continuar</p>
        </div>

        {/* Form card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(99,102,241,0.08), 0 25px 50px rgba(0,0,0,0.5)' }}>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@empresa.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 
                           focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50
                           transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600
                           focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50
                           transition-all duration-200 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white text-sm
                         transition-all duration-200 relative overflow-hidden
                         disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #4338ca, #7c3aed)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Sistema de gestión de recibos © {new Date().getFullYear()}
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

export default Login;
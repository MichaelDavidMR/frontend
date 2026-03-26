// Login.jsx
import { useState } from 'react';

function Login({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [shake,    setShake]    = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_URL = import.meta.env.VITE_API_URL || 'https://backend-2c3d.onrender.com';

    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

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
    <div className="login-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0C0F18;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Geometric grid background */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(47,84,235,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47,84,235,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Glow orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .orb-1 {
          width: 480px; height: 480px;
          top: -120px; left: -80px;
          background: radial-gradient(circle, rgba(47,84,235,0.15), transparent 70%);
          animation: drift1 8s ease-in-out infinite;
        }
        .orb-2 {
          width: 360px; height: 360px;
          bottom: -60px; right: -60px;
          background: radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%);
          animation: drift2 10s ease-in-out infinite;
        }
        @keyframes drift1 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(30px, 20px); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-20px, -30px); }
        }

        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          margin: 0 1rem;
        }

        /* Logo ring */
        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }
        .logo-ring {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(47,84,235,0.2), rgba(124,58,237,0.2));
          border: 1px solid rgba(47,84,235,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          box-shadow: 0 0 0 8px rgba(47,84,235,0.06), 0 8px 24px rgba(0,0,0,0.3);
          animation: breathe 3s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,100% { box-shadow: 0 0 0 8px rgba(47,84,235,0.06), 0 8px 24px rgba(0,0,0,0.3); }
          50%      { box-shadow: 0 0 0 12px rgba(47,84,235,0.10), 0 8px 24px rgba(0,0,0,0.3); }
        }

        .login-title {
          font-size: 1.625rem;
          font-weight: 800;
          color: #F2F1ED;
          letter-spacing: -0.04em;
          margin: 0;
        }
        .login-sub {
          font-size: 0.825rem;
          color: #5C6370;
          margin-top: 0.25rem;
          letter-spacing: 0.01em;
        }

        /* Form container */
        .login-form-wrap {
          background: #141720;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(47,84,235,0.08);
        }

        .field-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #6B7280;
          margin-bottom: 0.5rem;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #1C2030;
          border: 1.5px solid #2A2F40;
          border-radius: 12px;
          color: #F2F1ED;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input::placeholder { color: #3D4455; }
        .login-input:focus {
          border-color: rgba(47,84,235,0.7);
          box-shadow: 0 0 0 3px rgba(47,84,235,0.15);
        }

        .pass-wrap {
          position: relative;
        }
        .pass-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #4B5260;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .pass-toggle:hover { color: #8B93A8; }

        .error-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(220,38,38,0.1);
          border: 1px solid rgba(220,38,38,0.25);
          border-radius: 10px;
          color: #F87171;
          font-size: 0.825rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
          animation: errorIn 0.3s ease both;
        }
        @keyframes errorIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-btn {
          width: 100%;
          padding: 0.8rem;
          border: none;
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: white;
          cursor: pointer;
          background: linear-gradient(135deg, #2F54EB, #5B7FFF);
          box-shadow: 0 4px 16px rgba(47,84,235,0.4);
          transition: all 0.15s;
          margin-top: 0.5rem;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1D3FCC, #4F6FEE);
          box-shadow: 0 6px 20px rgba(47,84,235,0.5);
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: #2A2F40;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.02em;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-10px); }
          40%       { transform: translateX(10px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        .shake { animation: shake 0.5s ease-in-out; }

        .field-group { margin-bottom: 1.25rem; }
        .field-group:last-of-type { margin-bottom: 0; }
      `}</style>

      <div className={`login-card ${shake ? 'shake' : ''}`}>
        {/* Background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* Logo */}
        <div className="logo-wrap">
          <div className="logo-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(47,84,235,0.9)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 className="login-title">Recibos ERP</h1>
          <p className="login-sub">Taller de Reparaciones</p>
        </div>

        {/* Card */}
        <div className="login-form-wrap">
          {error && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="field-group">
              <label className="field-label">Contraseña</label>
              <div className="pass-wrap">
                <input
                  className="login-input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Verificando...
                </span>
              ) : 'Iniciar Sesión →'}
            </button>
          </form>
        </div>

        <p className="login-footer">© {new Date().getFullYear()} Sistema de Recibos</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Login;
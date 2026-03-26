// Login.jsx — with real public stats + mobile fixes
import { useState, useEffect } from 'react';

export default function Login({ onLogin }) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [shake,       setShake]       = useState(false);
  const [publicStats, setPublicStats] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://backend-2c3d.onrender.com';

  // Fetch public stats for the branding panel
  useEffect(() => {
    fetch(`${API_URL}/api/public-stats`)
      .then(r => r.json())
      .then(d => setPublicStats(d))
      .catch(() => {}); // silently fail — login still works
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
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
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { value: publicStats?.totalClients,  label: 'Registrados',  suffix: 'Clientes'  },
    { value: publicStats?.totalReceipts, label: 'Emitidos',     suffix: 'Recibos'   },
    { value: publicStats?.totalServices, label: 'Disponibles',  suffix: 'Servicios' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--primary)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="login-brand-panel">
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', bottom: -120, left: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 80, left: -180,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(117,248,179,0.05)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.5rem',
            background: 'var(--primary-container)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined icon-filled"
              style={{ color: 'var(--on-primary-container)', fontSize: 22 }}>receipt_long</span>
          </div>
          <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
            Recibos ERP
          </span>
        </div>

        {/* Tagline */}
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 800,
            fontSize: '2.75rem', lineHeight: 1.1,
            color: '#fff', marginBottom: '1rem',
            letterSpacing: '-0.03em',
          }}>
            Gestión de Recibos<br />
            <span style={{ color: 'var(--secondary-container)' }}>
              Taller de Reparaciones
            </span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-primary-container)', lineHeight: 1.6, maxWidth: 360 }}>
            Administra clientes, servicios y facturación desde un solo panel de control profesional.
          </p>

          {/* Live stats row */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
            {statItems.map(({ value, label, suffix }) => (
              <div key={label}>
                <p style={{
                  fontFamily: 'var(--font-headline)', fontWeight: 800,
                  fontSize: '1.75rem', color: 'var(--secondary-fixed)', marginBottom: 2,
                  minWidth: 40,
                }}>
                  {value === undefined || value === null
                    ? <span className="stat-loading-bar" />
                    : value}
                </p>
                <p style={{ fontSize: '0.65rem', color: 'var(--on-primary-container)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                  {suffix}
                </p>
                <p style={{ fontSize: '0.6rem', color: 'var(--on-primary-container)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--on-primary-container)', opacity: 0.5, position: 'relative' }}>
          © {new Date().getFullYear()} Recibos ERP — Sistema de Gestión
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="login-form-panel">

        {/* Mobile logo */}
        <div className="login-mobile-logo">
          <div style={{
            width: 32, height: 32, borderRadius: '0.5rem',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-symbols-outlined icon-filled" style={{ color: '#fff', fontSize: 18 }}>receipt_long</span>
          </div>
          <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>
            Recibos ERP
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 800,
            fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.375rem',
          }}>
            Iniciar Sesión
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>
            Ingresa tus credenciales de administrador
          </p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', borderRadius: '0.5rem',
              background: 'var(--error-container)',
              border: '1px solid color-mix(in srgb, var(--error) 20%, transparent)',
              marginBottom: '1.25rem',
              fontSize: '0.825rem', fontWeight: 500,
              color: 'var(--on-error-container)',
              animation: 'fadeIn 0.2s ease both',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--error)' }}>error</span>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}
            className={shake ? 'anim-shake' : ''}
          >
            <div>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
                fontFamily: 'var(--font-headline)',
              }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', fontSize: 18,
                  color: 'var(--on-surface-variant)',
                }}>mail</span>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input" required placeholder="admin@empresa.com"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.7rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--on-surface-variant)', marginBottom: '0.5rem',
                fontFamily: 'var(--font-headline)',
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', fontSize: 18,
                  color: 'var(--on-surface-variant)',
                }}>lock</span>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input" required placeholder="••••••••"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--on-surface-variant)', padding: 2,
                    display: 'flex', alignItems: 'center',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.75rem 1rem', marginTop: '0.25rem', fontSize: '0.875rem' }}
            >
              {loading
                ? <><span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 0.8s linear infinite' }}>autorenew</span> Verificando...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span> Iniciar Sesión</>
              }
            </button>
          </form>
        </div>
      </div>

      <style>{`
        /* ── Animations ── */
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shake  {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        @keyframes pulse  {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.8; }
        }
        .anim-shake { animation: shake 0.5s ease; }

        /* ── Stat loading bar ── */
        .stat-loading-bar {
          display: inline-block;
          width: 40px;
          height: 14px;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          animation: pulse 1.4s ease infinite;
          vertical-align: middle;
        }

        /* ── Brand panel (desktop only) ── */
        .login-brand-panel {
          flex: 1;
          display: none;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        /* ── Form panel ── */
        .login-form-panel {
          width: 100%;
          background: var(--background);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          box-sizing: border-box;
        }

        /* ── Mobile logo (shown on mobile, hidden on desktop) ── */
        .login-mobile-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        /* ── Desktop breakpoint ── */
        @media (min-width: 1024px) {
          .login-brand-panel {
            display: flex;
          }
          .login-form-panel {
            max-width: 480px;
            padding: 2.5rem 3rem;
          }
          .login-mobile-logo {
            display: none;
          }
        }

        /* ── Tablet ── */
        @media (min-width: 480px) and (max-width: 1023px) {
          .login-form-panel {
            padding: 2.5rem 2rem;
          }
        }

        /* ── Small phone ── */
        @media (max-width: 374px) {
          .login-form-panel {
            padding: 1.5rem 1rem;
          }
        }

        /* ── Prevent zoom on input focus (iOS) ── */
        @media (max-width: 767px) {
          .login-form-panel input {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
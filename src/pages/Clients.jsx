// Clients.jsx
import { useState, useEffect, useCallback } from 'react';
import { getClients, createClient } from '../utils/api';

/* ─── Avatar ────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  ['#DBEAFE','#1D4ED8'], ['#DCFCE7','#166534'], ['#EDE9FE','#5B21B6'],
  ['#FEF3C7','#92400E'], ['#FFE4E6','#9F1239'], ['#E0F2FE','#0C4A6E'],
];
function Avatar({ name }) {
  const initials = name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const [bg, color] = AVATAR_COLORS[idx];
  return (
    <div style={{
      width:32, height:32, borderRadius:10, flexShrink:0,
      background:bg, color, fontWeight:800, fontSize:'0.7rem',
      display:'flex', alignItems:'center', justifyContent:'center',
      letterSpacing:'0.02em',
    }}>
      {initials}
    </div>
  );
}

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ message, type='error', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const isSuccess = type === 'success';
  return (
    <div style={{
      position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)',
      zIndex:50, display:'flex', alignItems:'center', gap:'0.625rem',
      background: isSuccess ? '#14532D' : '#1A1917',
      color:'#F2F1ED',
      border:`1px solid ${isSuccess ? 'rgba(22,163,74,0.5)' : 'rgba(220,38,38,0.4)'}`,
      padding:'0.75rem 1rem', borderRadius:12,
      boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
      fontSize:'0.825rem', fontWeight:500,
      minWidth:260, maxWidth:'calc(100vw - 2rem)',
      animation:'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      {isSuccess
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      <span style={{ flex:1 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6B6960', fontSize:'0.75rem' }}>✕</button>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px) scale(.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}`}</style>
    </div>
  );
}

/* ─── Clients ───────────────────────────────────────────────── */
function Clients() {
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState({ name:'', phone:'', address:'', notes:'' });
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [errors,     setErrors]     = useState({});
  const [search,     setSearch]     = useState('');

  const showToast = useCallback((msg, type='error') => setToast({ msg, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getClients();
      setClients(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error cargando clientes.');
    } finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())  e.name  = 'El nombre es obligatorio';
    if (!formData.phone.trim()) e.phone = 'El teléfono es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await createClient(formData);
      setFormData({ name:'', phone:'', address:'', notes:'' });
      setErrors({});
      setShowForm(false);
      showToast('Cliente guardado correctamente', 'success');
      loadClients();
    } catch (err) {
      console.error(err);
      showToast('Error creando cliente.');
    } finally { setSubmitting(false); }
  };

  const toggleForm = () => { setShowForm(v => !v); setErrors({}); };

  const filtered = clients.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <>
      <style>{`
        .client-row td { transition: background 0.1s; }
        .client-row:hover td { background: var(--bg-subtle) !important; }
      `}</style>

      <div className="space-y-5 pb-24 sm:pb-6" style={{ maxWidth:'100%', overflowX:'hidden' }}>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Clientes</h2>
            {!loading && (
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:2 }}>
                {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button onClick={toggleForm} className={showForm ? 'btn-secondary hide-on-mobile' : 'btn-primary hide-on-mobile'}>
            {showForm
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Cancelar</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Nuevo Cliente</>
            }
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card anim-slide-down" style={{ padding:'1.5rem' }}>
            <h3 style={{ fontWeight:800, fontSize:'0.95rem', letterSpacing:'-0.025em', marginBottom:'1.25rem', color:'var(--text-1)' }}>
              Nuevo Cliente
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                    Nombre *
                  </label>
                  <input type="text" value={formData.name} onChange={handleChange('name')}
                    className="input" placeholder="Nombre completo"
                    style={{ borderColor: errors.name ? 'var(--red)' : undefined }}
                  />
                  {errors.name && <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:'0.25rem' }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                    Teléfono *
                  </label>
                  <input type="tel" value={formData.phone} onChange={handleChange('phone')}
                    className="input" placeholder="809-555-0000"
                    style={{ fontFamily:'var(--font-mono)', borderColor: errors.phone ? 'var(--red)' : undefined }}
                  />
                  {errors.phone && <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:'0.25rem' }}>{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Dirección
                </label>
                <input type="text" value={formData.address} onChange={handleChange('address')}
                  className="input" placeholder="Dirección (opcional)" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Notas
                </label>
                <textarea value={formData.notes} onChange={handleChange('notes')}
                  className="input" rows="2" placeholder="Notas adicionales..." />
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.5rem' }}>
                <button onClick={toggleForm} className="btn-secondary">Cancelar</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search + table */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {/* Search bar */}
          <div style={{
            padding:'0.875rem 1.25rem',
            borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:'0.625rem',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" style={{ flexShrink:0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              style={{
                border:'none', outline:'none', background:'none',
                fontSize:'0.875rem', color:'var(--text-1)', flex:1,
                fontFamily:'var(--font-sans)',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:2 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {!loading && filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{clients.length === 0 ? '👥' : '🔍'}</div>
              <p style={{ fontWeight:600, color:'var(--text-2)', marginBottom:'0.375rem' }}>
                {clients.length === 0 ? 'Sin clientes registrados' : 'No se encontraron resultados'}
              </p>
              <p style={{ fontSize:'0.825rem', color:'var(--text-3)' }}>
                {clients.length === 0
                  ? 'Agrega tu primer cliente arriba'
                  : 'Intenta con otro nombre o teléfono'
                }
              </p>
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table className="table-base" style={{ minWidth:380 }}>
                <colgroup>
                  <col style={{ width:'42%' }}/>
                  <col style={{ width:'28%' }}/>
                  <col style={{ width:'30%' }}/>
                </colgroup>
                <thead>
                  <tr>
                    {['Cliente', 'Teléfono', 'Dirección'].map(h => (
                      <th key={h} style={{ textAlign:'left', paddingLeft:'1.25rem', paddingRight:'1.25rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(3)].map((_, j) => (
                            <td key={j} style={{ padding:'0.875rem 1.25rem' }}>
                              <div className="skeleton" style={{ height:14, width: j===0 ? 160 : j===1 ? 110 : 80 }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : filtered.map((c, i) => (
                        <tr key={c.id} className="client-row anim-fade-up" style={{ animationDelay:`${i * 35}ms` }}>
                          <td style={{ paddingLeft:'1.25rem', paddingRight:'1.25rem' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                              <Avatar name={c.name} />
                              <div>
                                <p style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text-1)' }}>{c.name}</p>
                                <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-3)', marginTop:1 }}>{c.id}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ paddingLeft:'1.25rem', paddingRight:'1.25rem' }}>
                            <a href={`tel:${c.phone}`} style={{
                              color:'var(--primary)', fontFamily:'var(--font-mono)',
                              fontSize:'0.8rem', fontWeight:500, textDecoration:'none',
                              display:'flex', alignItems:'center', gap:'0.25rem',
                            }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.68 3.49 2 2 0 0 1 3.67 1.3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
                              {c.phone}
                            </a>
                          </td>
                          <td style={{ paddingLeft:'1.25rem', paddingRight:'1.25rem', fontSize:'0.8rem', color:'var(--text-3)' }}>
                            {c.address || '—'}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{
              padding:'0.625rem 1.25rem',
              borderTop:'1px solid var(--border)',
              background:'var(--bg-subtle)',
              fontSize:'0.75rem', color:'var(--text-3)', textAlign:'right',
              fontFamily:'var(--font-mono)',
            }}>
              {filtered.length} de {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={toggleForm}
        className="fab btn-primary items-center justify-center w-14 h-14 rounded-full"
        aria-label="Nuevo Cliente"
        style={{ fontSize: showForm ? '1rem' : '1.5rem', fontWeight:300 }}
      >
        {showForm ? '✕' : '+'}
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={hideToast} />}
    </>
  );
}

export default Clients;
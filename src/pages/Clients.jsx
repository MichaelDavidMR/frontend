// Clients.jsx — Logistics Pro style
import { useState, useEffect, useCallback } from 'react';
import { getClients, createClient } from '../utils/api';

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', marginBottom: '0.5rem' }}>
      {children}
    </label>
  );
}

/* Avatar with initials */
const COLORS = [
  ['#d8e2ff','#224583'], ['#dcfce7','#166534'], ['#ede9fe','#5b21b6'],
  ['#fef3c7','#92400e'], ['#ffe4e6','#9f1239'], ['#e0f2fe','#0c4a6e'],
];
function Avatar({ name, size = 32 }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const [bg, color] = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color, fontWeight: 800, fontFamily: 'var(--font-headline)',
      fontSize: size * 0.3 + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid color-mix(in srgb, var(--primary) 12%, transparent)',
    }}>
      {initials}
    </div>
  );
}

/* Toast */
function Toast({ message, type = 'error', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const isSuccess = type === 'success';
  return (
    <div className="anim-toast" style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, display: 'flex', alignItems: 'center', gap: '0.625rem',
      background: isSuccess ? 'var(--secondary)' : 'var(--primary)',
      color: '#fff', padding: '0.75rem 1rem', borderRadius: '0.5rem',
      boxShadow: '0 8px 32px rgba(0,27,68,0.25)',
      fontSize: '0.825rem', fontWeight: 600,
      minWidth: 260, maxWidth: 'calc(100vw - 2rem)',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {isSuccess ? 'check_circle' : 'error'}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>✕</button>
    </div>
  );
}

export default function Clients() {
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState({ name: '', phone: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [errors,     setErrors]     = useState({});
  const [search,     setSearch]     = useState('');

  const showToast = useCallback((msg, type = 'error') => setToast({ msg, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const loadClients = useCallback(async () => {
    try { setLoading(true); const res = await getClients(); setClients(res.data); }
    catch { showToast('Error cargando clientes.'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleChange = (field) => (e) => {
    setFormData(p => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())  e.name  = 'Nombre obligatorio';
    if (!formData.phone.trim()) e.phone = 'Teléfono obligatorio';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await createClient(formData);
      setFormData({ name: '', phone: '', address: '', notes: '' });
      setErrors({}); setShowForm(false);
      showToast('Cliente guardado correctamente', 'success');
      loadClients();
    } catch { showToast('Error creando cliente.'); }
    finally { setSubmitting(false); }
  };

  const toggleForm = () => { setShowForm(v => !v); setErrors({}); };
  const filtered = clients.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title">Driver Management</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {!loading ? `${clients.length} cliente${clients.length !== 1 ? 's' : ''} registrado${clients.length !== 1 ? 's' : ''}` : '...'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={toggleForm} className={showForm ? 'btn-secondary hide-on-mobile' : 'btn-primary hide-on-mobile'}>
              {showForm
                ? <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span> Cancelar</>
                : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span> Nuevo Cliente</>
              }
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card anim-slide-down">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)' }}>
              <h3 className="section-title" style={{ fontSize: '1rem' }}>Registrar Nuevo Cliente</h3>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <FieldLabel>Nombre Completo *</FieldLabel>
                  <input type="text" value={formData.name} onChange={handleChange('name')}
                    className="input" placeholder="Nombre completo"
                    style={{ borderColor: errors.name ? 'var(--error)' : undefined }} />
                  {errors.name && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', fontWeight: 600 }}>{errors.name}</p>}
                </div>
                <div>
                  <FieldLabel>Teléfono *</FieldLabel>
                  <input type="tel" value={formData.phone} onChange={handleChange('phone')}
                    className="input" placeholder="809-555-0000"
                    style={{ fontFamily: 'var(--font-mono)', borderColor: errors.phone ? 'var(--error)' : undefined }} />
                  {errors.phone && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', fontWeight: 600 }}>{errors.phone}</p>}
                </div>
              </div>
              <div>
                <FieldLabel>Dirección</FieldLabel>
                <input type="text" value={formData.address} onChange={handleChange('address')} className="input" placeholder="Dirección (opcional)" />
              </div>
              <div>
                <FieldLabel>Notas</FieldLabel>
                <textarea value={formData.notes} onChange={handleChange('notes')} className="input" rows="2" placeholder="Notas adicionales..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button onClick={toggleForm} className="btn-secondary">Cancelar</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? 'Guardando...' : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span> Guardar Cliente</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table — Fleet Driver Manifest style */}
        <section className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h3 className="section-title">Fleet Client Manifest</h3>
              <p className="section-sub">Seguimiento y datos de todos los clientes</p>
            </div>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: 220 }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--on-surface-variant)' }}>search</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="input-search" placeholder="Buscar cliente..."
                style={{ paddingLeft: '2.5rem' }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 0, display: 'flex' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              )}
            </div>
          </div>

          {!loading && filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--outline-variant)', display: 'block', marginBottom: '0.75rem' }}>
                {clients.length === 0 ? 'group' : 'search_off'}
              </span>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
                {clients.length === 0 ? 'Sin clientes registrados' : 'Sin resultados'}
              </p>
              <p style={{ fontSize: '0.825rem', color: 'var(--outline)' }}>
                {clients.length === 0 ? 'Agrega tu primer cliente arriba' : 'Intenta con otro nombre o teléfono'}
              </p>
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table className="table-base" style={{ minWidth: 500 }}>
                <thead>
                  <tr>
                    <th>Driver ID</th>
                    <th>Nombre del Operador</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th style={{ textAlign: 'right' }}>Eficiencia</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(5)].map((_, j) => (
                            <td key={j}><div className="skeleton" style={{ height: 14, width: j === 1 ? 180 : 80 }} /></td>
                          ))}
                        </tr>
                      ))
                    : filtered.map((c, i) => (
                        <tr key={c.id} className="anim-fade-up" style={{ animationDelay: `${i * 35}ms` }}>
                          <td className="table-id">#{c.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Avatar name={c.name} size={32} />
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>{c.name}</p>
                                {c.notes && <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{c.notes}</p>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <a href={`tel:${c.phone}`} style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>call</span>
                              {c.phone}
                            </a>
                          </td>
                          <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.825rem' }}>{c.address || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--primary)', fontSize: '0.875rem' }}>
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', background: 'color-mix(in srgb, var(--surface-container-low) 60%, transparent)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-headline)' }}>
              {filtered.length} de {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <button onClick={toggleForm} className="fab btn-primary" aria-label="Nuevo Cliente"
        style={{ width: 56, height: 56, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,27,68,0.3)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{showForm ? 'close' : 'person_add'}</span>
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={hideToast} />}
    </>
  );
}
// Services.jsx — Logistics Pro style
import { useState, useEffect } from 'react';
import { getServices, createService } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', marginBottom: '0.5rem' }}>
      {children}
    </label>
  );
}

export default function Services() {
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState({ name: '', price: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try { const res = await getServices(); setServices(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Nombre obligatorio';
    if (!formData.price)       e.price = 'Precio obligatorio';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await createService({ ...formData, price: parseFloat(formData.price) });
      setFormData({ name: '', price: '', description: '' }); setErrors({});
      setShowForm(false); loadServices();
    } catch { alert('Error creando servicio'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 className="page-title">Catálogo de Servicios</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
            {!loading ? `${services.length} servicio${services.length !== 1 ? 's' : ''} disponible${services.length !== 1 ? 's' : ''}` : '...'}
          </p>
        </div>
        <button onClick={() => { setShowForm(v => !v); setErrors({}); }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm
            ? <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span> Cancelar</>
            : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Nuevo Servicio</>
          }
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card anim-slide-down">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)' }}>
            <h3 className="section-title" style={{ fontSize: '1rem' }}>Nuevo Servicio</h3>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <FieldLabel>Nombre del Servicio *</FieldLabel>
                <input type="text" value={formData.name} onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors(p => ({ ...p, name: undefined })); }}
                  className="input" placeholder="Ej: Limpieza y optimización"
                  style={{ borderColor: errors.name ? 'var(--error)' : undefined }} />
                {errors.name && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', fontWeight: 600 }}>{errors.name}</p>}
              </div>
              <div>
                <FieldLabel>Precio Base (RD$) *</FieldLabel>
                <input type="number" value={formData.price} onChange={e => { setFormData({ ...formData, price: e.target.value }); setErrors(p => ({ ...p, price: undefined })); }}
                  className="input" placeholder="1500" min="0" step="0.01"
                  style={{ fontFamily: 'var(--font-mono)', borderColor: errors.price ? 'var(--error)' : undefined }} />
                {errors.price && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', fontWeight: 600 }}>{errors.price}</p>}
              </div>
            </div>
            <div>
              <FieldLabel>Descripción</FieldLabel>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="input" rows="2" placeholder="Descripción opcional..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Guardando...' : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span> Guardar Servicio</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem' }}>
              <div className="skeleton" style={{ height: 9, width: 60, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 18, width: 180, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 32, width: 96, borderRadius: '0.5rem' }} />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--outline-variant)', display: 'block', marginBottom: '0.75rem' }}>home_repair_service</span>
          <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>Sin servicios registrados</p>
          <p style={{ fontSize: '0.825rem', color: 'var(--outline)' }}>Agrega tu primer servicio arriba</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {services.map((s, i) => (
            <div key={s.id} className="card anim-fade-up" style={{ animationDelay: `${i * 50}ms`, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.5rem', background: 'color-mix(in srgb, var(--primary) 8%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>home_repair_service</span>
                </div>
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)', background: 'color-mix(in srgb, var(--secondary-container) 30%, transparent)', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {formatCurrency(s.price)}
                </div>
              </div>
              <p style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--outline)', marginBottom: '0.25rem' }}>{s.id}</p>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: s.description ? '0.5rem' : 0 }}>{s.name}</p>
              {s.description && <p style={{ fontSize: '0.775rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{s.description}</p>}
              {/* Progress bar as decoration */}
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="progress-wrap">
                  <div className="progress-fill" style={{ width: '100%', background: 'var(--secondary)' }} />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--secondary)', whiteSpace: 'nowrap', fontFamily: 'var(--font-headline)' }}>Activo</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
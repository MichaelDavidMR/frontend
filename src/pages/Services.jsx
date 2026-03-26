// Services.jsx
import { useState, useEffect } from 'react';
import { getServices, createService } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

/* ─── Service card ──────────────────────────────────────────── */
function ServiceCard({ service, delay = 0 }) {
  return (
    <div
      className="card anim-fade-up"
      style={{
        animationDelay:`${delay}ms`,
        padding:'1.25rem',
        display:'flex', flexDirection:'column', gap:'0.625rem',
        borderTop:'2.5px solid var(--primary)',
        position:'relative',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', color:'var(--text-3)', marginBottom:'0.25rem' }}>
            {service.id}
          </p>
          <h3 style={{ fontWeight:700, fontSize:'0.9rem', letterSpacing:'-0.02em', color:'var(--text-1)', lineHeight:1.3 }}>
            {service.name}
          </h3>
        </div>
        <div style={{
          fontFamily:'var(--font-mono)', fontWeight:800,
          fontSize:'1rem', color:'var(--primary)',
          background:'var(--primary-light)',
          padding:'0.3rem 0.75rem', borderRadius:8,
          whiteSpace:'nowrap', flexShrink:0,
        }}>
          {formatCurrency(service.price)}
        </div>
      </div>
      {service.description && (
        <p style={{ fontSize:'0.8rem', color:'var(--text-2)', lineHeight:1.5 }}>
          {service.description}
        </p>
      )}
    </div>
  );
}

/* ─── Services ──────────────────────────────────────────────── */
function Services() {
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState({ name:'', price:'', description:'' });
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await getServices();
      setServices(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())  e.name  = 'El nombre es obligatorio';
    if (!formData.price)        e.price = 'El precio es obligatorio';
    if (parseFloat(formData.price) < 0) e.price = 'El precio no puede ser negativo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await createService({ ...formData, price: parseFloat(formData.price) });
      setFormData({ name:'', price:'', description:'' });
      setErrors({});
      setShowForm(false);
      loadServices();
    } catch (err) {
      alert('Error creando servicio');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="space-y-5 pb-10" style={{ maxWidth:'100%', overflowX:'hidden' }}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="page-title">Servicios</h2>
          {!loading && (
            <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:2 }}>
              {services.length} servicio{services.length !== 1 ? 's' : ''} disponible{services.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button onClick={() => { setShowForm(v => !v); setErrors({}); }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm
            ? <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Cancelar
              </>
            : <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nuevo Servicio
              </>
          }
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card anim-slide-down" style={{ padding:'1.5rem' }}>
          <h3 style={{ fontWeight:800, fontSize:'0.95rem', letterSpacing:'-0.025em', marginBottom:'1.25rem', color:'var(--text-1)' }}>
            Nuevo Servicio
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Nombre del Servicio *
                </label>
                <input
                  type="text" value={formData.name} onChange={handleChange('name')}
                  className="input" placeholder="Ej: Limpieza y optimización"
                  style={{ borderColor: errors.name ? 'var(--red)' : undefined }}
                />
                {errors.name && <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:'0.25rem' }}>{errors.name}</p>}
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Precio Base (RD$) *
                </label>
                <input
                  type="number" value={formData.price} onChange={handleChange('price')}
                  className="input" placeholder="1500" min="0" step="0.01"
                  style={{ fontFamily:'var(--font-mono)', borderColor: errors.price ? 'var(--red)' : undefined }}
                />
                {errors.price && <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:'0.25rem' }}>{errors.price}</p>}
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                Descripción
              </label>
              <textarea
                value={formData.description} onChange={handleChange('description')}
                className="input" rows="2" placeholder="Descripción del servicio..."
              />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.5rem' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Guardando...' : 'Guardar Servicio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding:'1.25rem', borderTop:'2.5px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'0.5rem' }}>
                <div style={{ flex:1 }}>
                  <div className="skeleton" style={{ height:10, width:56, marginBottom:8 }} />
                  <div className="skeleton" style={{ height:16, width:140 }} />
                </div>
                <div className="skeleton" style={{ height:32, width:80, borderRadius:8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3.5rem 1rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🔧</div>
          <p style={{ fontWeight:600, color:'var(--text-2)', marginBottom:'0.375rem' }}>Sin servicios registrados</p>
          <p style={{ fontSize:'0.825rem', color:'var(--text-3)' }}>Agrega tu primer servicio con el botón de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => <ServiceCard key={s.id} service={s} delay={i * 50} />)}
        </div>
      )}
    </div>
  );
}

export default Services;
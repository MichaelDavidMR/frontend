// ReceiptHistory.jsx — Logistics Pro style
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getReceipts, getClients } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="anim-toast" style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, display: 'flex', alignItems: 'center', gap: '0.625rem',
      background: 'var(--primary)', color: 'var(--on-primary)',
      padding: '0.75rem 1rem', borderRadius: '0.5rem',
      boxShadow: '0 8px 32px rgba(0,27,68,0.25)',
      fontSize: '0.825rem', fontWeight: 600,
      minWidth: 260, maxWidth: 'calc(100vw - 2rem)',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--error-container)' }}>error</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-primary-container)' }}>✕</button>
    </div>
  );
}

function PayBadge({ method }) {
  const map = { Efectivo: 'badge-cash', Tarjeta: 'badge-card', Transferencia: 'badge-transfer', Cheque: 'badge-transfer' };
  return <span className={`badge ${map[method] || 'badge-transfer'}`}><span className="badge-dot" />{method}</span>;
}

export default function ReceiptHistory() {
  const [receipts,    setReceipts]    = useState([]);
  const [clients,     setClients]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filters,     setFilters]     = useState({ from: '', to: '', clientId: '' });
  const [toast,       setToast]       = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const showToast = useCallback((msg) => setToast(msg), []);
  const hideToast = useCallback(() => setToast(null), []);

  const loadData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const [rr, cr] = await Promise.all([getReceipts(params), getClients()]);
      setReceipts(rr.data);
      setClients(cr.data);
    } catch { showToast('Error cargando datos.'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const applyFilters = async () => {
    const p = {};
    if (filters.from)     p.from     = filters.from;
    if (filters.to)       p.to       = filters.to;
    if (filters.clientId) p.clientId = filters.clientId;
    await loadData(p);
    setFiltersOpen(false);
  };

  const clearFilters = () => { setFilters({ from: '', to: '', clientId: '' }); loadData(); };
  const handleFilter = (f) => (e) => setFilters(p => ({ ...p, [f]: e.target.value }));
  const getClientName = (id) => clients.find(c => c.id === id)?.name || '—';
  const activeCount = [filters.from, filters.to, filters.clientId].filter(Boolean).length;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title">Fleet Receipt Manifest</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              Seguimiento y métricas de facturación en tiempo real
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/receipts/new" className="btn-primary hide-on-mobile">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Nuevo Recibo
            </Link>
            <button className="btn-secondary hide-on-mobile">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters card */}
        <div className="card" style={{ padding: '1rem 1.5rem' }}>
          {/* Mobile toggle */}
          <button className="sm:hidden w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => setFiltersOpen(v => !v)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-headline)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
              Filtros
              {activeCount > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 800 }}>
                  {activeCount}
                </span>
              )}
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>
              {filtersOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          <div className={`${filtersOpen ? 'anim-slide-down' : 'hidden'} sm:block`} style={{ marginTop: filtersOpen ? '0.875rem' : 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.375rem', fontFamily: 'var(--font-headline)' }}>Desde</label>
                <input type="date" value={filters.from} onChange={handleFilter('from')} className="input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.375rem', fontFamily: 'var(--font-headline)' }}>Hasta</label>
                <input type="date" value={filters.to} onChange={handleFilter('to')} className="input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: '0.375rem', fontFamily: 'var(--font-headline)' }}>Cliente</label>
                <select value={filters.clientId} onChange={handleFilter('clientId')} className="input">
                  <option value="">Todos los clientes</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={applyFilters} className="btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>search</span>
                  Filtrar
                </button>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="btn-secondary" style={{ padding: '0.5rem 0.625rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table — Fleet Driver Manifest style */}
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)' }}>
            <div>
              <h3 className="section-title">Historial de Recibos</h3>
              <p className="section-sub">{!loading ? `${receipts.length} recibo${receipts.length !== 1 ? 's' : ''} encontrado${receipts.length !== 1 ? 's' : ''}` : 'Cargando...'}</p>
            </div>
          </div>

          {!loading && receipts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--outline-variant)', display: 'block', marginBottom: '0.75rem' }}>receipt_long</span>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>
                No se encontraron recibos
              </p>
              {activeCount > 0 && (
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.825rem' }}>
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table className="table-base" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th>ID Recibo</th>
                    <th>Operador / Cliente</th>
                    <th>Servicios</th>
                    <th>Estado</th>
                    <th>Progreso</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(6)].map((_, j) => (
                            <td key={j}><div className="skeleton" style={{ height: 14, width: j === 1 ? 160 : 80 }} /></td>
                          ))}
                        </tr>
                      ))
                    : receipts.map((r, i) => (
                        <tr key={r.id} className="anim-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                          <td>
                            <Link to={`/receipts/${r.id}`} className="table-id" style={{ textDecoration: 'none' }}>#{r.id}</Link>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>person</span>
                              </div>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>{getClientName(r.clientId)}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                                  {new Date(r.createdAt).toLocaleDateString('es-DO')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                            {r.items.length} ítem{r.items.length !== 1 ? 's' : ''}
                          </td>
                          <td>
                            {r.anulled
                              ? <span className="badge badge-delayed"><span className="badge-dot" />Anulado</span>
                              : <span className="badge badge-active"><span className="badge-dot" />Activo</span>
                            }
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="progress-wrap">
                                <div className="progress-fill done" style={{ width: '100%' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', whiteSpace: 'nowrap' }}>100%</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(r.total)}</p>
                            <PayBadge method={r.paymentMethod} />
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {!loading && receipts.length > 0 && (
            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', background: 'color-mix(in srgb, var(--surface-container-low) 60%, transparent)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'right', fontWeight: 600 }}>
              {receipts.length} recibo{receipts.length !== 1 ? 's' : ''} en total
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <Link to="/receipts/new" className="fab btn-primary" aria-label="Nuevo Recibo"
        style={{ width: 56, height: 56, borderRadius: '50%', fontSize: '1.5rem', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,27,68,0.3)' }}>
        +
      </Link>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </>
  );
}
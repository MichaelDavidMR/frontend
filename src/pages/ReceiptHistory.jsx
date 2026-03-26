// ReceiptHistory.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getReceipts, getClients } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position:'fixed', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)',
      zIndex:50, display:'flex', alignItems:'center', gap:'0.625rem',
      background:'#1A1917', color:'#F2F1ED',
      border:'1px solid rgba(220,38,38,0.4)',
      padding:'0.75rem 1rem', borderRadius:12,
      boxShadow:'0 8px 32px rgba(0,0,0,0.2)',
      fontSize:'0.825rem', fontWeight:500,
      minWidth:260, maxWidth:'calc(100vw - 2rem)',
      animation:'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style={{ flex:1 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6B6960', fontSize:'0.75rem' }}>✕</button>
    </div>
  );
}

/* ─── Payment badge ─────────────────────────────────────────── */
function PayBadge({ method }) {
  const map = { Efectivo:'badge-green', Tarjeta:'badge-blue', Transferencia:'badge-purple', Cheque:'badge-amber' };
  return <span className={`badge ${map[method] || 'badge-purple'}`}>{method}</span>;
}

/* ─── ReceiptHistory ────────────────────────────────────────── */
function ReceiptHistory() {
  const [receipts,    setReceipts]    = useState([]);
  const [clients,     setClients]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filters,     setFilters]     = useState({ from:'', to:'', clientId:'' });
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
    } catch (err) {
      console.error(err);
      showToast('Error cargando datos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  const applyFilters = async () => {
    const params = {};
    if (filters.from)     params.from     = filters.from;
    if (filters.to)       params.to       = filters.to;
    if (filters.clientId) params.clientId = filters.clientId;
    await loadData(params);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setFilters({ from:'', to:'', clientId:'' });
    loadData();
  };

  const handleFilter = (field) => (e) =>
    setFilters(prev => ({ ...prev, [field]: e.target.value }));

  const getClientName = (clientId) =>
    clients.find(c => c.id === clientId)?.name || '—';

  const activeCount = [filters.from, filters.to, filters.clientId].filter(Boolean).length;

  return (
    <>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(16px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        .rh-filter-panel { animation: fadeSlideDown 0.22s ease both; }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="space-y-5 pb-24 sm:pb-6" style={{ maxWidth:'100%', overflowX:'hidden' }}>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Historial de Recibos</h2>
            {!loading && (
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:2 }}>
                {receipts.length} recibo{receipts.length !== 1 ? 's' : ''} encontrado{receipts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link to="/receipts/new" className="btn-primary hide-on-mobile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Recibo
          </Link>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding:'1rem' }}>
          {/* Mobile toggle */}
          <button
            className="sm:hidden w-full flex items-center justify-between"
            style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}
            onClick={() => setFiltersOpen(v => !v)}
          >
            <span style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.825rem', fontWeight:600, color:'var(--text-2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtros
              {activeCount > 0 && (
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  width:18, height:18, borderRadius:'50%',
                  background:'var(--primary)', color:'#fff',
                  fontSize:'0.65rem', fontWeight:700,
                }}>
                  {activeCount}
                </span>
              )}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2">
              {filtersOpen
                ? <polyline points="18 15 12 9 6 15"/>
                : <polyline points="6 9 12 15 18 9"/>
              }
            </svg>
          </button>

          {/* Filter fields */}
          <div className={`${filtersOpen ? 'rh-filter-panel' : 'hidden'} sm:block`} style={{ marginTop: filtersOpen ? '0.75rem' : 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Desde
                </label>
                <input type="date" value={filters.from} onChange={handleFilter('from')} className="input" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Hasta
                </label>
                <input type="date" value={filters.to} onChange={handleFilter('to')} className="input" />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
                  Cliente
                </label>
                <select value={filters.clientId} onChange={handleFilter('clientId')} className="input">
                  <option value="">Todos los clientes</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem' }}>
                <button onClick={applyFilters} className="btn-primary" style={{ flex:1 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Filtrar
                </button>
                {activeCount > 0 && (
                  <button onClick={clearFilters} className="btn-secondary" title="Limpiar" style={{ padding:'0.625rem 0.75rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {!loading && receipts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🔍</div>
              <p style={{ fontWeight:600, color:'var(--text-2)', marginBottom:'0.375rem' }}>
                No se encontraron recibos
              </p>
              {activeCount > 0 && (
                <p style={{ fontSize:'0.825rem', color:'var(--text-3)' }}>
                  Intenta{' '}
                  <button onClick={clearFilters} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--primary)', fontWeight:600 }}>
                    limpiar los filtros
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table className="table-base" style={{ minWidth:480 }}>
                <colgroup>
                  <col style={{ width:'11%' }}/>
                  <col style={{ width:'16%' }}/>
                  <col style={{ width:'21%' }}/>
                  <col style={{ width:'10%' }}/>
                  <col style={{ width:'22%' }}/>
                  <col style={{ width:'20%' }}/>
                </colgroup>
                <thead>
                  <tr>
                    {[['ID','left'],['Fecha','left'],['Cliente','left'],['Items','center'],['Total','right'],['Pago','left']].map(([h, a]) => (
                      <th key={h} style={{ textAlign: a, paddingLeft:'1rem', paddingRight:'1rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(6)].map((_, j) => (
                            <td key={j} style={{ padding:'0.875rem 1rem' }}>
                              <div className="skeleton" style={{ height:13 }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : receipts.map((r, i) => (
                        <tr key={r.id} className="anim-fade-up" style={{ animationDelay:`${i * 30}ms` }}>
                          <td style={{ paddingLeft:'1rem', paddingRight:'1rem' }}>
                            <Link to={`/receipts/${r.id}`} style={{
                              color:'var(--primary)', fontWeight:700,
                              fontFamily:'var(--font-mono)', fontSize:'0.775rem',
                              textDecoration:'none',
                            }}>
                              {r.id}
                            </Link>
                          </td>
                          <td style={{ paddingLeft:'1rem', paddingRight:'1rem', fontSize:'0.8rem' }}>
                            {new Date(r.createdAt).toLocaleDateString('es-DO')}
                          </td>
                          <td style={{ paddingLeft:'1rem', paddingRight:'1rem', fontWeight:500, color:'var(--text-1)', fontSize:'0.85rem' }}>
                            {getClientName(r.clientId)}
                          </td>
                          <td style={{ paddingLeft:'1rem', paddingRight:'1rem', textAlign:'center' }}>
                            <span style={{
                              display:'inline-flex', alignItems:'center', justifyContent:'center',
                              width:22, height:22, borderRadius:'50%',
                              background:'var(--bg-subtle)', color:'var(--text-2)',
                              fontSize:'0.7rem', fontWeight:700,
                            }}>
                              {r.items.length}
                            </span>
                          </td>
                          <td style={{ paddingLeft:'1rem', paddingRight:'1rem', textAlign:'right', fontWeight:700, fontFamily:'var(--font-mono)', fontSize:'0.875rem', color:'var(--text-1)' }}>
                            {formatCurrency(r.total)}
                          </td>
                          <td style={{ paddingLeft:'1rem', paddingRight:'1rem' }}>
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
            <div style={{
              padding:'0.625rem 1rem',
              borderTop:'1px solid var(--border)',
              background:'var(--bg-subtle)',
              fontSize:'0.75rem', color:'var(--text-3)', textAlign:'right',
              fontFamily:'var(--font-mono)',
            }}>
              {receipts.length} recibo{receipts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/receipts/new"
        className="fab btn-primary items-center justify-center w-14 h-14 rounded-full"
        aria-label="Nuevo Recibo"
        style={{ fontSize:'1.5rem', fontWeight:300 }}
      >
        +
      </Link>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </>
  );
}

export default ReceiptHistory;
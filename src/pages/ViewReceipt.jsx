// ViewReceipt.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReceipt, anullReceipt } from '../utils/api';
import { formatCurrency, downloadReceiptPDF, printReceipt } from '../utils/pdfGenerator';

/* ─── Payment badge ─────────────────────────────────────────── */
function PayBadge({ method }) {
  const map = { Efectivo:'badge-green', Tarjeta:'badge-blue', Transferencia:'badge-purple', Cheque:'badge-amber' };
  return <span className={`badge ${map[method] || 'badge-purple'}`} style={{ fontSize:'0.75rem', padding:'0.25rem 0.7rem' }}>{method}</span>;
}

/* ─── Spinner ───────────────────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:240 }}>
      <svg style={{ animation:'spin 0.7s linear infinite' }} width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── ViewReceipt ───────────────────────────────────────────── */
function ViewReceipt() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [receipt,        setReceipt]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [anullReason,    setAnullReason]    = useState('');
  const [anulling,       setAnulling]       = useState(false);
  const [reasonError,    setReasonError]    = useState(false);

  useEffect(() => { loadReceipt(); }, [id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const res = await getReceipt(id);
      setReceipt(res.data);
    } catch (err) {
      console.error(err);
      alert('Recibo no encontrado');
      navigate('/receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleAnull = async () => {
    if (!anullReason.trim()) { setReasonError(true); return; }
    try {
      setAnulling(true);
      await anullReceipt(id, { reason: anullReason });
      setShowModal(false);
      loadReceipt();
    } catch (err) {
      alert('Error anulando recibo');
    } finally {
      setAnulling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!receipt) return <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-2)' }}>Recibo no encontrado</div>;

  const createdDate = new Date(receipt.createdAt).toLocaleString('es-DO', {
    year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit',
  });

  return (
    <>
      <style>{`
        .receipt-doc {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .receipt-header {
          padding: 1.75rem 2rem;
          border-bottom: 1px solid var(--border);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          align-items: start;
        }
        .receipt-section {
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--bg-subtle);
        }
        .receipt-section:last-child { border-bottom: none; }
        .receipt-section-title {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-3);
          margin-bottom: 0.75rem;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.3rem 0;
          font-size: 0.875rem;
        }
        .total-row.grand {
          padding: 0.875rem 0 0;
          margin-top: 0.5rem;
          border-top: 1.5px solid var(--text-1);
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-1);
        }
        .anull-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 1rem;
          animation: fadeIn 0.2s ease both;
        }
        .anull-modal {
          background: #fff;
          border-radius: var(--radius-xl);
          padding: 1.75rem;
          max-width: 420px; width: 100%;
          box-shadow: var(--shadow-lg);
          animation: scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        @media (max-width: 640px) {
          .receipt-header { padding: 1.25rem; }
          .receipt-section { padding: 1rem 1.25rem; }
          .action-bar { flex-wrap: wrap; }
        }
      `}</style>

      <div style={{ maxWidth: 760, margin:'0 auto' }} className="space-y-5">

        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 action-bar">
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Link to="/receipts" style={{ display:'flex', alignItems:'center', color:'var(--text-3)', textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--text-1)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </Link>
            <div>
              <h2 className="page-title" style={{ fontSize:'1.25rem' }}>Recibo</h2>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--text-3)', marginTop:1 }}>{receipt.id}</p>
            </div>
          </div>

          {!receipt.anulled && (
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <button onClick={() => printReceipt(receipt, receipt.client)} className="btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Imprimir
              </button>
              <button onClick={() => downloadReceiptPDF(receipt, receipt.client)} className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                PDF
              </button>
              <button onClick={() => setShowModal(true)} className="btn-danger">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Anular
              </button>
            </div>
          )}
        </div>

        {/* Anulled banner */}
        {receipt.anulled && (
          <div style={{
            background:'var(--red-bg)', border:'1px solid rgba(220,38,38,0.3)',
            borderRadius:'var(--radius-lg)', padding:'1rem 1.25rem',
            display:'flex', gap:'0.75rem', alignItems:'flex-start',
          }}>
            <div style={{ color:'var(--red)', marginTop:2 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <div>
              <p style={{ fontWeight:700, color:'var(--red)', fontSize:'0.875rem' }}>Recibo Anulado</p>
              <p style={{ fontSize:'0.8rem', color:'#991B1B', marginTop:'0.25rem' }}>{receipt.anulledReason}</p>
              <p style={{ fontSize:'0.75rem', color:'#B91C1C', marginTop:'0.125rem', fontFamily:'var(--font-mono)' }}>
                {new Date(receipt.anulledAt).toLocaleString('es-DO')}
              </p>
            </div>
          </div>
        )}

        {/* Receipt document */}
        <div className="receipt-doc no-print">
          {/* Header */}
          <div className="receipt-header">
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.375rem' }}>
                <div style={{
                  width:34, height:34, borderRadius:10,
                  background:'var(--primary-light)', color:'var(--primary)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span style={{ fontWeight:800, fontSize:'1rem', letterSpacing:'-0.03em', color:'var(--text-1)' }}>
                  Taller de Reparaciones
                </span>
              </div>
              <p style={{ fontSize:'0.775rem', color:'var(--text-3)', lineHeight:1.6 }}>
                RNC: 000-00000-0 · Santo Domingo, RD · Tel: 809-000-0000
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.875rem', fontWeight:700, color:'var(--primary)' }}>
                {receipt.id}
              </p>
              <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:'0.25rem' }}>{createdDate}</p>
              <div style={{ marginTop:'0.5rem' }}>
                <PayBadge method={receipt.paymentMethod} />
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="receipt-section">
            <p className="receipt-section-title">Cliente</p>
            <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>{receipt.client?.name || 'N/A'}</p>
            <p style={{ fontSize:'0.8rem', color:'var(--text-2)', marginTop:'0.125rem', fontFamily:'var(--font-mono)' }}>
              {receipt.client?.phone || ''}
            </p>
            {receipt.client?.address && (
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:'0.125rem' }}>{receipt.client.address}</p>
            )}
          </div>

          {/* Items */}
          <div className="receipt-section" style={{ padding:'0' }}>
            <div style={{ padding:'1rem 2rem 0.75rem', borderBottom:'1px solid var(--border)' }}>
              <p className="receipt-section-title" style={{ marginBottom:0 }}>Servicios / Productos</p>
            </div>
            <table className="table-base">
              <thead>
                <tr>
                  <th style={{ paddingLeft:'2rem', textAlign:'left' }}>Descripción</th>
                  <th style={{ textAlign:'center', width:'10%' }}>Cant</th>
                  <th style={{ textAlign:'right', width:'20%' }}>P. Unit</th>
                  <th style={{ textAlign:'right', width:'20%', paddingRight:'2rem' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ paddingLeft:'2rem', fontWeight:500, color:'var(--text-1)' }}>{item.description}</td>
                    <td style={{ textAlign:'center', color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{item.qty}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', color:'var(--text-2)' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ textAlign:'right', paddingRight:'2rem', fontFamily:'var(--font-mono)', fontWeight:600, color:'var(--text-1)' }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="receipt-section" style={{ maxWidth:320, marginLeft:'auto' }}>
            {receipt.discount > 0 && (
              <div className="total-row">
                <span style={{ color:'var(--text-2)' }}>Subtotal</span>
                <span style={{ fontFamily:'var(--font-mono)' }}>{formatCurrency(receipt.subtotal + receipt.discount)}</span>
              </div>
            )}
            {receipt.discount > 0 && (
              <div className="total-row">
                <span style={{ color:'var(--text-2)' }}>Descuento</span>
                <span style={{ fontFamily:'var(--font-mono)', color:'var(--red)' }}>−{formatCurrency(receipt.discount)}</span>
              </div>
            )}
            {receipt.tax > 0 && (
              <div className="total-row">
                <span style={{ color:'var(--text-2)' }}>ITBIS</span>
                <span style={{ fontFamily:'var(--font-mono)' }}>{formatCurrency(receipt.tax)}</span>
              </div>
            )}
            <div className="total-row grand">
              <span>Total</span>
              <span style={{ fontFamily:'var(--font-mono)', color:'var(--primary)' }}>{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="receipt-section" style={{ borderTop:'1px dashed var(--border)', background:'var(--bg-subtle)' }}>
              <p className="receipt-section-title">Notas</p>
              <p style={{ fontSize:'0.825rem', color:'var(--text-2)' }}>{receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding:'1rem 2rem',
            borderTop:'1px dashed var(--border)',
            textAlign:'center',
            background:'var(--bg-subtle)',
          }}>
            <p style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>
              Este recibo respalda la prestación del servicio. Guardar comprobante.
            </p>
            <p style={{ fontSize:'0.7rem', fontFamily:'var(--font-mono)', color:'var(--text-3)', marginTop:'0.25rem' }}>
              Control: {receipt.id}
            </p>
          </div>
        </div>
      </div>

      {/* Anull modal */}
      {showModal && (
        <div className="anull-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="anull-modal">
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'var(--red-bg)', color:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <div>
                <h3 style={{ fontWeight:800, fontSize:'1rem', letterSpacing:'-0.03em', color:'var(--text-1)' }}>Anular Recibo</h3>
                <p style={{ fontSize:'0.775rem', color:'var(--text-3)', marginTop:2 }}>Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.5rem' }}>
                Motivo de anulación *
              </label>
              <textarea
                value={anullReason}
                onChange={(e) => { setAnullReason(e.target.value); setReasonError(false); }}
                className="input"
                rows="3"
                placeholder="Ej: Error en facturación, cliente canceló..."
                style={{ borderColor: reasonError ? 'var(--red)' : undefined }}
              />
              {reasonError && (
                <p style={{ fontSize:'0.75rem', color:'var(--red)', marginTop:'0.375rem' }}>
                  El motivo es obligatorio
                </p>
              )}
            </div>

            <div style={{ display:'flex', gap:'0.625rem' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex:1 }}>
                Cancelar
              </button>
              <button onClick={handleAnull} disabled={anulling} className="btn-danger" style={{ flex:1 }}>
                {anulling ? 'Anulando...' : 'Confirmar Anulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewReceipt;
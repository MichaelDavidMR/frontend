// ViewReceipt.jsx — Logistics Pro style
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReceipt, anullReceipt } from '../utils/api';
import { formatCurrency, downloadReceiptPDF, printReceipt } from '../utils/pdfGenerator';

function PayBadge({ method }) {
  const map = { Efectivo: 'badge-cash', Tarjeta: 'badge-card', Transferencia: 'badge-transfer', Cheque: 'badge-transfer' };
  return <span className={`badge ${map[method] || 'badge-transfer'}`} style={{ fontSize: '0.7rem', padding: '0.3rem 0.75rem' }}><span className="badge-dot" />{method}</span>;
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)', animation: 'spin 0.8s linear infinite' }}>autorenew</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function ViewReceipt() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [receipt,      setReceipt]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [anullReason,  setAnullReason]  = useState('');
  const [anulling,     setAnulling]     = useState(false);
  const [reasonError,  setReasonError]  = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getReceipt(id);
      setReceipt(res.data);
    } catch { alert('Recibo no encontrado'); navigate('/receipts'); }
    finally { setLoading(false); }
  };

  const handleAnull = async () => {
    if (!anullReason.trim()) { setReasonError(true); return; }
    try {
      setAnulling(true);
      await anullReceipt(id, { reason: anullReason });
      setShowModal(false);
      load();
    } catch { alert('Error anulando recibo'); }
    finally { setAnulling(false); }
  };

  if (loading) return <Spinner />;
  if (!receipt) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>Recibo no encontrado</div>;

  const createdDate = new Date(receipt.createdAt).toLocaleString('es-DO', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <Link to="/receipts" className="icon-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
            </Link>
            <div>
              <h2 className="page-title" style={{ fontSize: '1.25rem' }}>Detalle del Recibo</h2>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>#{receipt.id}</p>
            </div>
          </div>

          {!receipt.anulled && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => printReceipt(receipt, receipt.client)} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                Imprimir
              </button>
              <button onClick={() => downloadReceiptPDF(receipt, receipt.client)} className="btn-primary" style={{ fontSize: '0.8rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                PDF
              </button>
              <button onClick={() => setShowModal(true)} className="btn-danger" style={{ fontSize: '0.8rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span>
                Anular
              </button>
            </div>
          )}
        </div>

        {/* Anulled banner */}
        {receipt.anulled && (
          <div style={{
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            padding: '1rem 1.25rem', borderRadius: '0.5rem',
            background: 'var(--error-container)',
            border: '1px solid color-mix(in srgb, var(--error) 20%, transparent)',
            animation: 'fadeIn 0.3s ease both',
          }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 20, marginTop: 1 }}>cancel</span>
            <div>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--on-error-container)', fontSize: '0.875rem' }}>Recibo Anulado</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-error-container)', marginTop: '0.2rem', opacity: 0.8 }}>{receipt.anulledReason}</p>
              <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--on-error-container)', marginTop: '0.125rem', opacity: 0.6 }}>
                {new Date(receipt.anulledAt).toLocaleString('es-DO')}
              </p>
            </div>
          </div>
        )}

        {/* Receipt document */}
        <div className="card anim-fade-up">
          {/* Header strip — like a manifest header */}
          <div style={{
            background: 'var(--primary)', padding: '1.5rem 2rem',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <span className="material-symbols-outlined icon-filled" style={{ color: 'var(--on-primary-container)', fontSize: 20 }}>receipt_long</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                  Taller de Reparaciones
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-primary-container)', lineHeight: 1.7 }}>
                RNC: 000-00000-0 · Santo Domingo, RD · Tel: 809-000-0000
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--secondary-fixed)' }}>
                #{receipt.id}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--on-primary-container)', marginTop: '0.25rem', opacity: 0.8 }}>{createdDate}</p>
              <div style={{ marginTop: '0.5rem' }}><PayBadge method={receipt.paymentMethod} /></div>
            </div>
          </div>

          {/* Client row */}
          <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--on-primary-fixed-variant)', fontSize: 22 }}>person</span>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', marginBottom: '0.25rem' }}>Operador / Cliente</p>
              <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>{receipt.client?.name || 'N/A'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>
                {receipt.client?.phone || ''}{receipt.client?.address ? ` · ${receipt.client.address}` : ''}
              </p>
            </div>
          </div>

          {/* Items table */}
          <div>
            <div style={{ padding: '0.875rem 2rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', background: 'color-mix(in srgb, var(--surface-container-low) 60%, transparent)' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)' }}>Servicios / Productos</p>
            </div>
            <table className="table-base">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'center', width: '10%' }}>Cant</th>
                  <th style={{ textAlign: 'right', width: '20%' }}>P. Unit</th>
                  <th style={{ textAlign: 'right', width: '20%' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{item.description}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>{item.qty}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', maxWidth: 340, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {receipt.discount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(receipt.subtotal + receipt.discount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--error)' }}>
                  <span>Descuento</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>−{formatCurrency(receipt.discount)}</span>
                </div>
              </>
            )}
            {receipt.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                <span>ITBIS</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(receipt.tax)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', marginTop: '0.375rem', borderTop: '2px solid var(--primary)' }}>
              <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>TOTAL</span>
              <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{formatCurrency(receipt.total)}</span>
            </div>
          </div>

          {/* Progress bar — route progress style */}
          <div style={{ padding: '1rem 2rem', borderTop: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', background: 'color-mix(in srgb, var(--surface-container-low) 60%, transparent)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', whiteSpace: 'nowrap' }}>Progreso del Cobro</span>
            <div className="progress-wrap">
              <div className="progress-fill done" style={{ width: receipt.anulled ? '0%' : '100%' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: receipt.anulled ? 'var(--error)' : 'var(--secondary)', whiteSpace: 'nowrap' }}>
              {receipt.anulled ? 'Anulado' : '100%'}
            </span>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div style={{ padding: '1rem 2rem', borderTop: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', marginBottom: '0.375rem' }}>Notas</p>
              <p style={{ fontSize: '0.825rem', color: 'var(--on-surface-variant)' }}>{receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '0.875rem 2rem', borderTop: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', background: 'color-mix(in srgb, var(--surface-container-low) 60%, transparent)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>Este recibo respalda la prestación del servicio. Guardar comprobante.</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--outline)', marginTop: '0.25rem' }}>Control: #{receipt.id}</p>
          </div>
        </div>
      </div>

      {/* Anull modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,27,68,0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem', animation: 'fadeIn 0.2s ease both',
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{
            background: 'var(--surface-container-lowest)', borderRadius: '0.5rem',
            padding: '1.75rem', maxWidth: 440, width: '100%',
            boxShadow: '0 24px 64px rgba(0,27,68,0.3)',
            animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: 'var(--error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--error)', fontSize: 22 }}>block</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>Anular Recibo</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', marginBottom: '0.5rem' }}>
                Motivo de anulación *
              </label>
              <textarea
                value={anullReason}
                onChange={e => { setAnullReason(e.target.value); setReasonError(false); }}
                className="input" rows="3"
                placeholder="Ej: Error en facturación, cliente canceló..."
                style={{ borderColor: reasonError ? 'var(--error)' : undefined }}
              />
              {reasonError && <p style={{ fontSize: '0.75rem', color: 'var(--error)', marginTop: '0.25rem', fontWeight: 600 }}>El motivo es obligatorio</p>}
            </div>

            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={handleAnull} disabled={anulling} className="btn-danger" style={{ flex: 1 }}>
                {anulling
                  ? <><span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 0.8s linear infinite' }}>autorenew</span> Anulando...</>
                  : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span> Confirmar Anulación</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
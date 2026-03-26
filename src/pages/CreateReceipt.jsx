// CreateReceipt.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClients, getServices, createReceipt } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

/* ─── Step indicator ────────────────────────────────────────── */
function StepBar({ current }) {
  const steps = ['Cliente', 'Items', 'Pago'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:'1.5rem' }}>
      {steps.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const isLast  = i === steps.length - 1;
        return (
          <div key={s} style={{ display:'flex', alignItems:'center', flex: isLast ? 0 : 1 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{
                width:28, height:28, borderRadius:'50%',
                background: done ? 'var(--primary)' : active ? 'var(--primary-light)' : 'var(--bg-subtle)',
                border: active ? '2px solid var(--primary)' : done ? 'none' : '1.5px solid var(--border)',
                color: done ? '#fff' : active ? 'var(--primary)' : 'var(--text-3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.7rem', fontWeight:800,
                transition:'all 0.2s',
              }}>
                {done
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : i + 1
                }
              </div>
              <span style={{ fontSize:'0.65rem', fontWeight: active ? 700 : 500, color: active ? 'var(--primary)' : 'var(--text-3)', whiteSpace:'nowrap' }}>
                {s}
              </span>
            </div>
            {!isLast && (
              <div style={{
                flex:1, height:1.5,
                background: done ? 'var(--primary)' : 'var(--border)',
                margin:'0 6px', marginBottom:20,
                transition:'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Section card ──────────────────────────────────────────── */
function Section({ number, title, subtitle, children, active }) {
  return (
    <div className="card" style={{
      opacity: active ? 1 : 0.6,
      transition:'opacity 0.2s',
      padding: '1.5rem',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', marginBottom:'1.25rem' }}>
        <div style={{
          width:32, height:32, borderRadius:10, flexShrink:0,
          background: active ? 'var(--primary)' : 'var(--bg-subtle)',
          color: active ? '#fff' : 'var(--text-3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.75rem', fontWeight:800,
          transition:'all 0.2s',
        }}>
          {number}
        </div>
        <div>
          <h3 style={{ fontWeight:800, fontSize:'0.95rem', letterSpacing:'-0.025em', color:'var(--text-1)' }}>{title}</h3>
          {subtitle && <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:1 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── CreateReceipt ─────────────────────────────────────────── */
function CreateReceipt() {
  const navigate = useNavigate();
  const [clients,    setClients]    = useState([]);
  const [services,   setServices]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClient, setSelectedClient] = useState('');
  const [items,          setItems]          = useState([]);
  const [paymentMethod,  setPaymentMethod]  = useState('Efectivo');
  const [notes,          setNotes]          = useState('');
  const [tax,            setTax]            = useState(0);
  const [discount,       setDiscount]       = useState(0);

  const [newItem, setNewItem] = useState({ serviceId:'', description:'', qty:1, unitPrice:'' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cr, sr] = await Promise.all([getClients(), getServices()]);
      setClients(cr.data);
      setServices(sr.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleServiceSelect = (serviceId) => {
    const s = services.find(s => s.id === serviceId);
    if (s) setNewItem({ serviceId:s.id, description:s.name, qty:1, unitPrice:s.price.toString() });
  };

  const addItem = () => {
    if (!newItem.description || !newItem.unitPrice) return;
    const qty   = parseInt(newItem.qty) || 1;
    const price = parseFloat(newItem.unitPrice);
    setItems([...items, { ...newItem, qty, unitPrice:price, subtotal: qty * price }]);
    setNewItem({ serviceId:'', description:'', qty:1, unitPrice:'' });
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const calcTotals = () => {
    const itemsTotal = items.reduce((s, i) => s + i.subtotal, 0);
    const subtotal   = itemsTotal - parseFloat(discount || 0);
    const total      = subtotal + parseFloat(tax || 0);
    return { itemsTotal, subtotal, total };
  };

  const handleSubmit = async () => {
    if (!selectedClient || items.length === 0) return;
    const { subtotal, total } = calcTotals();
    try {
      setSubmitting(true);
      const res = await createReceipt({
        clientId: selectedClient,
        items: items.map(i => ({ serviceId: i.serviceId || null, description: i.description, qty: i.qty, unitPrice: i.unitPrice })),
        paymentMethod, notes,
        tax: parseFloat(tax) || 0, discount: parseFloat(discount) || 0,
        subtotal, total,
      });
      navigate(`/receipts/${res.data.id}`);
    } catch (err) {
      alert('Error creando recibo: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const { itemsTotal, subtotal, total } = calcTotals();
  const step = selectedClient ? (items.length > 0 ? 2 : 1) : 0;

  const payIcons = { Efectivo:'💵', Tarjeta:'💳', Transferencia:'🏦', Cheque:'📋' };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:240 }}>
      <svg style={{ animation:'spin 0.7s linear infinite' }} width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }} className="space-y-4 pb-10">

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.25rem' }}>
        <Link to="/receipts" style={{ color:'var(--text-3)', textDecoration:'none', display:'flex' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--text-1)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </Link>
        <h2 className="page-title" style={{ fontSize:'1.25rem' }}>Nuevo Recibo</h2>
      </div>

      <StepBar current={step} />

      {/* Step 1 — Client */}
      <Section number="1" title="Seleccionar Cliente" subtitle="Elige el cliente para este recibo" active={step === 0 || step >= 0}>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="input">
          <option value="">— Seleccionar cliente —</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
          ))}
        </select>
        {clients.length === 0 && (
          <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:'0.5rem' }}>
            Sin clientes.{' '}
            <Link to="/clients" style={{ color:'var(--primary)', fontWeight:600 }}>Agrega uno primero</Link>
          </p>
        )}
      </Section>

      {/* Step 2 — Items */}
      <Section number="2" title="Agregar Servicios / Productos" subtitle="Añade uno o más ítems al recibo" active={!!selectedClient}>
        {/* Quick service */}
        <div style={{ marginBottom:'0.875rem' }}>
          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
            Servicio rápido
          </label>
          <select value={newItem.serviceId} onChange={e => handleServiceSelect(e.target.value)} className="input" disabled={!selectedClient}>
            <option value="">— Seleccionar servicio —</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} · {formatCurrency(s.price)}</option>)}
          </select>
        </div>

        {/* Manual entry */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 72px 112px 40px', gap:'0.5rem', alignItems:'flex-start' }}>
          <input
            type="text" value={newItem.description}
            onChange={e => setNewItem({...newItem, description:e.target.value})}
            className="input" placeholder="Descripción del servicio"
            disabled={!selectedClient}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <input
            type="number" value={newItem.qty}
            onChange={e => setNewItem({...newItem, qty:e.target.value})}
            className="input" placeholder="Cant" min="1"
            disabled={!selectedClient}
          />
          <input
            type="number" value={newItem.unitPrice}
            onChange={e => setNewItem({...newItem, unitPrice:e.target.value})}
            className="input" placeholder="Precio" min="0" step="0.01"
            disabled={!selectedClient}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <button
            onClick={addItem}
            disabled={!selectedClient || !newItem.description || !newItem.unitPrice}
            className="btn-primary"
            style={{ height:'42px', borderRadius:10, padding:'0 0', fontSize:'1.2rem' }}
          >
            +
          </button>
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div style={{ marginTop:'1rem', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <table className="table-base">
              <thead>
                <tr>
                  <th style={{ textAlign:'left', paddingLeft:'0.875rem' }}>Descripción</th>
                  <th style={{ textAlign:'center', width:'14%' }}>Cant</th>
                  <th style={{ textAlign:'right', width:'22%' }}>Precio</th>
                  <th style={{ textAlign:'right', width:'22%' }}>Subtotal</th>
                  <th style={{ width:'36px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="anim-fade-up" style={{ animationDelay:`${i * 40}ms` }}>
                    <td style={{ paddingLeft:'0.875rem', fontWeight:500, color:'var(--text-1)', fontSize:'0.85rem' }}>{item.description}</td>
                    <td style={{ textAlign:'center', fontFamily:'var(--font-mono)', color:'var(--text-2)' }}>{item.qty}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', color:'var(--text-2)' }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--text-1)' }}>{formatCurrency(item.subtotal)}</td>
                    <td>
                      <button
                        onClick={() => removeItem(i)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'4px 6px', borderRadius:6, transition:'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='var(--red-bg)'; e.currentTarget.style.color='var(--red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-3)'; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Step 3 — Payment */}
      <Section number="3" title="Pago y Totales" subtitle="Configura el método de pago y ajustes" active={items.length > 0}>
        {/* Payment methods */}
        <div style={{ marginBottom:'1rem' }}>
          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.5rem' }}>
            Método de Pago
          </label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'0.5rem' }}>
            {['Efectivo','Tarjeta','Transferencia','Cheque'].map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                style={{
                  padding:'0.625rem 0.25rem',
                  borderRadius:'var(--radius-md)',
                  border: paymentMethod === m ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: paymentMethod === m ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: paymentMethod === m ? 'var(--primary)' : 'var(--text-2)',
                  fontFamily:'var(--font-sans)',
                  fontSize:'0.75rem', fontWeight: paymentMethod === m ? 700 : 500,
                  cursor:'pointer',
                  transition:'all 0.15s',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                }}
              >
                <span style={{ fontSize:'1.1rem' }}>{payIcons[m]}</span>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Discount + Tax */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
          <div>
            <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
              Descuento (RD$)
            </label>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="input" min="0" step="0.01" placeholder="0.00" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
              ITBIS (RD$)
            </label>
            <input type="number" value={tax} onChange={e => setTax(e.target.value)} className="input" min="0" step="0.01" placeholder="0.00" />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom:'1.25rem' }}>
          <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'0.375rem' }}>
            Notas
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" rows="2" placeholder="Notas adicionales..." />
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div style={{
            background:'var(--bg-subtle)', border:'1px solid var(--border)',
            borderRadius:'var(--radius-md)', padding:'1rem 1.25rem',
          }}>
            {discount > 0 && (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.825rem', marginBottom:'0.375rem', color:'var(--text-2)' }}>
                  <span>Subtotal items</span>
                  <span style={{ fontFamily:'var(--font-mono)' }}>{formatCurrency(itemsTotal)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.825rem', marginBottom:'0.375rem', color:'var(--red)' }}>
                  <span>Descuento</span>
                  <span style={{ fontFamily:'var(--font-mono)' }}>−{formatCurrency(discount)}</span>
                </div>
              </>
            )}
            {tax > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.825rem', marginBottom:'0.375rem', color:'var(--text-2)' }}>
                <span>ITBIS</span>
                <span style={{ fontFamily:'var(--font-mono)' }}>{formatCurrency(tax)}</span>
              </div>
            )}
            <div style={{
              display:'flex', justifyContent:'space-between',
              fontSize:'1.25rem', fontWeight:800, letterSpacing:'-0.03em',
              color:'var(--text-1)',
              paddingTop:'0.75rem', marginTop:'0.5rem',
              borderTop:'1.5px solid var(--border-strong)',
            }}>
              <span>Total</span>
              <span style={{ fontFamily:'var(--font-mono)', color:'var(--primary)' }}>{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </Section>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !selectedClient || items.length === 0}
        className="btn-primary w-full"
        style={{ padding:'0.875rem', fontSize:'0.925rem', borderRadius:'var(--radius-lg)' }}
      >
        {submitting
          ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg style={{ animation:'spin 0.7s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              Generando Recibo...
            </span>
          : <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Generar Recibo
            </span>
        }
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default CreateReceipt;
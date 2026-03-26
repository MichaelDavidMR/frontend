// CreateReceipt.jsx — Logistics Pro style
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getClients, getServices, createReceipt } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

function Section({ num, title, sub, children, active }) {
  return (
    <div className="card" style={{ opacity: active ? 1 : 0.55, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '0.5rem', flexShrink: 0,
          background: active ? 'var(--primary)' : 'var(--surface-container)',
          color: active ? '#fff' : 'var(--on-surface-variant)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.8rem',
          transition: 'all 0.2s',
        }}>
          {num}
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>{title}</h3>
          {sub && <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
      <div style={{ padding: '1.25rem 1.5rem' }}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontFamily: 'var(--font-headline)', marginBottom: '0.5rem' }}>
      {children}
    </label>
  );
}

export default function CreateReceipt() {
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
  const [newItem,        setNewItem]        = useState({ serviceId: '', description: '', qty: 1, unitPrice: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cr, sr] = await Promise.all([getClients(), getServices()]);
      setClients(cr.data); setServices(sr.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleServiceSelect = (id) => {
    const s = services.find(s => s.id === id);
    if (s) setNewItem({ serviceId: s.id, description: s.name, qty: 1, unitPrice: s.price.toString() });
  };

  const addItem = () => {
    if (!newItem.description || !newItem.unitPrice) return;
    const qty = parseInt(newItem.qty) || 1;
    const price = parseFloat(newItem.unitPrice);
    setItems([...items, { ...newItem, qty, unitPrice: price, subtotal: qty * price }]);
    setNewItem({ serviceId: '', description: '', qty: 1, unitPrice: '' });
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
        clientId: selectedClient, items: items.map(i => ({ serviceId: i.serviceId || null, description: i.description, qty: i.qty, unitPrice: i.unitPrice })),
        paymentMethod, notes, tax: parseFloat(tax) || 0, discount: parseFloat(discount) || 0, subtotal, total,
      });
      navigate(`/receipts/${res.data.id}`);
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
    finally { setSubmitting(false); }
  };

  const { itemsTotal, subtotal, total } = calcTotals();
  const step = selectedClient ? (items.length > 0 ? 2 : 1) : 0;

  const payMethods = [
    { key: 'Efectivo', icon: 'payments' },
    { key: 'Tarjeta', icon: 'credit_card' },
    { key: 'Transferencia', icon: 'account_balance' },
    { key: 'Cheque', icon: 'description' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)', animation: 'spin 0.8s linear infinite' }}>autorenew</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Link to="/receipts" className="icon-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          </Link>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.25rem' }}>Nuevo Recibo</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 1 }}>Completa los pasos para generar el recibo</p>
          </div>
        </div>

        {/* Step track */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0.75rem 1.5rem', background: 'var(--surface-container-lowest)', borderRadius: '0.5rem', border: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)', boxShadow: 'var(--shadow-sm)' }}>
          {['Seleccionar Cliente', 'Agregar Ítems', 'Pago & Total'].map((s, i) => {
            const done   = i < step;
            const active = i === step;
            const isLast = i === 2;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: done ? 'var(--secondary)' : active ? 'var(--primary)' : 'var(--surface-container)',
                    color: done || active ? '#fff' : 'var(--on-surface-variant)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, fontFamily: 'var(--font-headline)',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {done
                      ? <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                      : i + 1
                    }
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: active ? 800 : 500,
                    color: active ? 'var(--primary)' : done ? 'var(--secondary)' : 'var(--on-surface-variant)',
                    whiteSpace: 'nowrap', fontFamily: active ? 'var(--font-headline)' : 'var(--font-body)',
                    transition: 'all 0.2s',
                  }}>
                    {s}
                  </span>
                </div>
                {!isLast && <div style={{ flex: 1, height: 1.5, background: done ? 'var(--secondary)' : 'var(--outline-variant)', margin: '0 0.75rem', transition: 'background 0.3s' }} />}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Client */}
        <Section num="1" title="Seleccionar Cliente" sub="Elige el cliente para este recibo" active={step >= 0}>
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="input">
            <option value="">— Seleccionar cliente —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </select>
          {clients.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.625rem' }}>
              Sin clientes. <Link to="/clients" style={{ color: 'var(--secondary)', fontWeight: 700 }}>Agregar uno</Link>
            </p>
          )}
        </Section>

        {/* Step 2 — Items */}
        <Section num="2" title="Agregar Servicios / Ítems" sub="Añade los servicios o productos al recibo" active={!!selectedClient}>
          <div style={{ marginBottom: '0.875rem' }}>
            <FieldLabel>Servicio Rápido</FieldLabel>
            <select value={newItem.serviceId} onChange={e => handleServiceSelect(e.target.value)} className="input" disabled={!selectedClient}>
              <option value="">— Seleccionar del catálogo —</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} · {formatCurrency(s.price)}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 44px', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.875rem' }}>
            <div>
              <FieldLabel>Descripción</FieldLabel>
              <input type="text" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                className="input" placeholder="Descripción del servicio" disabled={!selectedClient}
                onKeyDown={e => e.key === 'Enter' && addItem()} />
            </div>
            <div>
              <FieldLabel>Cant</FieldLabel>
              <input type="number" value={newItem.qty} onChange={e => setNewItem({ ...newItem, qty: e.target.value })}
                className="input" placeholder="1" min="1" disabled={!selectedClient} />
            </div>
            <div>
              <FieldLabel>Precio</FieldLabel>
              <input type="number" value={newItem.unitPrice} onChange={e => setNewItem({ ...newItem, unitPrice: e.target.value })}
                className="input" placeholder="0.00" min="0" step="0.01" disabled={!selectedClient}
                onKeyDown={e => e.key === 'Enter' && addItem()} />
            </div>
            <button onClick={addItem} disabled={!selectedClient || !newItem.description || !newItem.unitPrice}
              className="btn-primary" style={{ height: 42, padding: 0, borderRadius: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            </button>
          </div>

          {items.length > 0 && (
            <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent)' }}>
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th style={{ textAlign: 'center', width: '12%' }}>Cant</th>
                    <th style={{ textAlign: 'right', width: '22%' }}>Precio</th>
                    <th style={{ textAlign: 'right', width: '22%' }}>Subtotal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="anim-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--on-surface-variant)' }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(item.subtotal)}</td>
                      <td>
                        <button onClick={() => removeItem(i)} className="icon-btn" style={{ color: 'var(--on-surface-variant)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
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
        <Section num="3" title="Método de Pago & Totales" sub="Configura el pago y ajustes finales" active={items.length > 0}>

          {/* Payment method selector */}
          <FieldLabel>Método de Pago</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {payMethods.map(({ key, icon }) => (
              <button key={key} onClick={() => setPaymentMethod(key)} style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '0.5rem',
                border: paymentMethod === key ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                background: paymentMethod === key ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--surface-container-lowest)',
                color: paymentMethod === key ? 'var(--primary)' : 'var(--on-surface-variant)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
                fontSize: '0.75rem', fontWeight: paymentMethod === key ? 800 : 500,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                transition: 'all 0.15s',
                fontFamily: paymentMethod === key ? 'var(--font-headline)' : 'var(--font-body)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
                {key}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <FieldLabel>Descuento (RD$)</FieldLabel>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="input" min="0" step="0.01" placeholder="0.00" />
            </div>
            <div>
              <FieldLabel>ITBIS (RD$)</FieldLabel>
              <input type="number" value={tax} onChange={e => setTax(e.target.value)} className="input" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <FieldLabel>Notas</FieldLabel>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input" rows="2" placeholder="Notas adicionales..." />
          </div>

          {/* Totals summary */}
          {items.length > 0 && (
            <div style={{ background: 'var(--primary)', borderRadius: '0.5rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {discount > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--on-primary-container)' }}>
                    <span>Subtotal ítems</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(itemsTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--secondary-container)' }}>
                    <span>Descuento</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>−{formatCurrency(discount)}</span>
                  </div>
                </>
              )}
              {tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--on-primary-container)' }}>
                  <span>ITBIS</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(tax)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', marginTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--secondary-fixed)', fontSize: '1.5rem', letterSpacing: '-0.03em' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </Section>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={submitting || !selectedClient || items.length === 0}
          className="btn-primary" style={{ padding: '0.875rem 1rem', fontSize: '0.925rem', borderRadius: '0.5rem' }}>
          {submitting
            ? <><span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 0.8s linear infinite' }}>autorenew</span> Generando Recibo...</>
            : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>receipt_long</span> Generar Recibo</>
          }
        </button>
      </div>
    </>
  );
}
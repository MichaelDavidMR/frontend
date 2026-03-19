import { useState, useEffect, useCallback } from 'react';
import { getClients, createClient } from '../utils/api';

/* ─── Toast ───────────────────────────────────────────────────── */
function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:w-max z-50 flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-toast`}>
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {type === 'success'
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        }
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 shrink-0">✕</button>
    </div>
  );
}

/* ─── Clients ─────────────────────────────────────────────────── */
function Clients() {
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [formData,   setFormData]   = useState({ name: '', phone: '', address: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState(null);

  const showToast = useCallback((msg, type = 'error') => setToast({ msg, type }), []);
  const hideToast = useCallback(() => setToast(null), []);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClients();
      setClients(response.data);
    } catch (err) {
      console.error(err);
      showToast('Error cargando clientes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleChange = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Nombre y teléfono son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await createClient(formData);
      setFormData({ name: '', phone: '', address: '', notes: '' });
      setShowForm(false);
      showToast('Cliente guardado correctamente', 'success');
      loadClients();
    } catch (err) {
      console.error(err);
      showToast('Error creando cliente. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleForm = () => setShowForm(v => !v);

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .form-enter    { animation: fadeSlideDown 0.25s ease both; }
        .row-enter     { animation: fadeSlideUp 0.3s ease both; }
        .animate-toast { animation: toastIn 0.3s ease both; }
        .table-scroll-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .fab {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          z-index: 40; display: none;
        }
        @media (max-width: 640px) {
          .fab { display: flex; }
          .new-client-header-btn { display: none; }
        }
      `}</style>

      <div className="space-y-5 pb-24 sm:pb-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <button onClick={toggleForm} className="btn-primary new-client-header-btn text-sm">
            {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
          </button>
        </div>

        {/* ── Form ── */}
        {showForm && (
          <div className="card form-enter">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Nuevo Cliente</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" value={formData.name} onChange={handleChange('name')}
                    className="input w-full" placeholder="Nombre completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                  <input type="tel" value={formData.phone} onChange={handleChange('phone')}
                    className="input w-full" placeholder="809-555-0000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" value={formData.address} onChange={handleChange('address')}
                  className="input w-full" placeholder="Dirección (opcional)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={formData.notes} onChange={handleChange('notes')}
                  className="input w-full" rows="2" placeholder="Notas adicionales..." />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button onClick={toggleForm} className="btn-secondary w-full sm:w-auto">
                  Cancelar
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="btn-primary w-full sm:w-auto disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── List ── */}
        <div className="card" style={{ maxWidth: '100%' }}>
          {!loading && clients.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">No hay clientes registrados</p>
              <p className="text-sm text-gray-400 mt-1">Agrega tu primer cliente arriba</p>
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '340px' }}>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '32%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '28%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200">
                    {['ID', 'Nombre', 'Teléfono', 'Dirección'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          {[...Array(4)].map((_, j) => (
                            <td key={j} className="py-3 px-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : clients.map((client, i) => (
                        <tr key={client.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors row-enter"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <td className="py-3 px-2 text-sm font-medium text-gray-500">{client.id}</td>
                          <td className="py-3 px-2 font-medium text-gray-900 text-sm truncate">{client.name}</td>
                          <td className="py-3 px-2">
                            <a href={`tel:${client.phone}`}
                              className="text-primary-600 hover:underline text-sm block truncate">
                              {client.phone}
                            </a>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500 truncate">
                            {client.address || '—'}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={toggleForm}
        className="fab btn-primary items-center justify-center w-14 h-14 rounded-full shadow-lg text-2xl leading-none"
        aria-label="Nuevo Cliente"
      >
        {showForm ? '✕' : '+'}
      </button>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={hideToast} />}
    </>
  );
}

export default Clients;
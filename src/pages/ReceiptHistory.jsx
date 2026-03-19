import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getReceipts, getClients } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

/* ─── Toast ───────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:w-max z-50 flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-toast">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 shrink-0">✕</button>
    </div>
  );
}

const PAYMENT_STYLES = {
  Efectivo: 'bg-green-100 text-green-800',
  Tarjeta:  'bg-blue-100  text-blue-800',
};
const paymentStyle = (m) => PAYMENT_STYLES[m] || 'bg-purple-100 text-purple-800';

/* ─── ReceiptHistory ──────────────────────────────────────────── */
function ReceiptHistory() {
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
      const [receiptsRes, clientsRes] = await Promise.all([
        getReceipts(params),
        getClients(),
      ]);
      setReceipts(receiptsRes.data);
      setClients(clientsRes.data);
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
    setFilters({ from: '', to: '', clientId: '' });
    loadData();
  };

  const handleFilter = (field) => (e) =>
    setFilters(prev => ({ ...prev, [field]: e.target.value }));

  const getClientName = (clientId) =>
    clients.find(c => c.id === clientId)?.name || 'N/A';

  const activeFilterCount = [filters.from, filters.to, filters.clientId].filter(Boolean).length;

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes filterSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .row-enter      { animation: fadeSlideUp 0.3s ease both; }
        .animate-toast  { animation: toastIn 0.3s ease both; }
        .filter-enter   { animation: filterSlide 0.2s ease both; }
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
          .new-receipt-header-btn { display: none; }
        }
      `}</style>

      <div className="space-y-5 pb-24 sm:pb-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Historial de Recibos</h2>
          <Link to="/receipts/new" className="btn-primary new-receipt-header-btn text-sm">
            + Nuevo Recibo
          </Link>
        </div>

        {/* ── Filters ── */}
        <div className="card" style={{ maxWidth: '100%' }}>
          {/* Mobile toggle */}
          <button
            className="sm:hidden w-full flex items-center justify-between text-sm font-medium text-gray-700"
            onClick={() => setFiltersOpen(v => !v)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 5a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 5a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
              </svg>
              Filtros
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-primary-600 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <span className="text-gray-400">{filtersOpen ? '▲' : '▼'}</span>
          </button>

          <div className={`${filtersOpen ? 'filter-enter mt-4' : 'hidden'} sm:block sm:mt-0`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Desde</label>
                <input type="date" value={filters.from} onChange={handleFilter('from')}
                  className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Hasta</label>
                <input type="date" value={filters.to} onChange={handleFilter('to')}
                  className="input w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Cliente</label>
                <select value={filters.clientId} onChange={handleFilter('clientId')}
                  className="input w-full text-sm">
                  <option value="">Todos los clientes</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={applyFilters} className="btn-primary flex-1 text-sm">Filtrar</button>
                <button onClick={clearFilters} className="btn-secondary text-sm px-3" title="Limpiar filtros">✕</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="card" style={{ maxWidth: '100%' }}>
          {!loading && receipts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">No hay recibos registrados</p>
              {activeFilterCount > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Prueba ajustando los filtros o{' '}
                  <button onClick={clearFilters} className="text-primary-600 hover:underline">
                    limpia la búsqueda
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '420px' }}>
                <colgroup>
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '18%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200">
                    {[['ID','left'],['Fecha','left'],['Cliente','left'],['Items','left'],['Total','right'],['Pago','left']].map(([h, align]) => (
                      <th key={h} className={`text-${align} py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(6)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="py-3 px-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : receipts.map((receipt, i) => (
                        <tr key={receipt.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors row-enter"
                          style={{ animationDelay: `${i * 35}ms` }}
                        >
                          <td className="py-3 px-2">
                            <Link to={`/receipts/${receipt.id}`}
                              className="text-primary-600 hover:underline font-medium text-sm block truncate">
                              {receipt.id}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {new Date(receipt.createdAt).toLocaleDateString('es-DO')}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-900 truncate">
                            {getClientName(receipt.clientId)}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {receipt.items.length}
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-sm truncate">
                            {formatCurrency(receipt.total)}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${paymentStyle(receipt.paymentMethod)}`}>
                              {receipt.paymentMethod}
                            </span>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {!loading && receipts.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              {receipts.length} recibo{receipts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── FAB ── */}
      <Link
        to="/receipts/new"
        className="fab btn-primary items-center justify-center w-14 h-14 rounded-full shadow-lg text-2xl leading-none"
        aria-label="Nuevo Recibo"
      >
        +
      </Link>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </>
  );
}

export default ReceiptHistory;
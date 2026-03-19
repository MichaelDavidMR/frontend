import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getStats } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';
 
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
 
/* ─── Toast ───────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
 
  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:w-max sm:left-1/2 sm:-translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-toast">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 shrink-0">✕</button>
    </div>
  );
}
 
/* ─── Skeletons ───────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-24" />
    </div>
  );
}
 
/* ─── Dashboard ───────────────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
 
  const showToast = useCallback((msg) => setToast(msg), []);
  const hideToast = useCallback(() => setToast(null), []);
 
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      console.error(err);
      showToast('Error cargando estadísticas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);
 
  useEffect(() => { loadStats(); }, [loadStats]);
 
  const chartData = {
    labels: stats?.monthlyData.map(d => d.month) || [],
    datasets: [{
      label: 'Ingresos (RD$)',
      data: stats?.monthlyData.map(d => d.total) || [],
      borderColor: 'rgb(37, 99, 235)',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };
 
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `RD$${v.toLocaleString()}`, maxTicksLimit: 5, font: { size: 11 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };
 
  const statItems = [
    { label: 'Total Mes', value: formatCurrency(stats?.totalMonth  || 0), color: 'text-primary-600' },
    { label: 'Trabajos',  value: stats?.totalJobs     || 0, color: 'text-gray-900' },
    { label: 'Clientes',  value: stats?.totalClients  || 0, color: 'text-gray-900' },
    { label: 'Servicios', value: stats?.totalServices || 0, color: 'text-gray-900' },
  ];
 
  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .stat-card-animated { animation: fadeSlideUp 0.35s ease both; }
        .animate-toast      { animation: toastIn 0.3s ease both; }
        .fab {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          z-index: 40; display: none;
        }
        .table-scroll-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 640px) {
          .fab { display: flex; }
          .new-receipt-header-btn { display: none; }
        }
      `}</style>
 
      <div className="space-y-5 pb-24 sm:pb-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
 
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <Link to="/receipts/new" className="btn-primary new-receipt-header-btn text-sm">
            + Nuevo Recibo
          </Link>
        </div>
 
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : statItems.map((item, i) => (
                <div
                  key={item.label}
                  className="stat-card stat-card-animated"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="stat-label text-xs sm:text-sm">{item.label}</span>
                  <span className={`stat-value text-base sm:text-2xl font-bold ${item.color} break-words leading-tight`}>
                    {item.value}
                  </span>
                </div>
              ))
          }
        </div>
 
        {/* ── Chart ── */}
        <div className="card" style={{ maxWidth: '100%' }}>
          <h3 className="text-base sm:text-lg font-semibold mb-4">Ingresos Últimos 6 Meses</h3>
          <div className="h-44 sm:h-64">
            {loading
              ? <div className="h-full bg-gray-100 rounded-lg animate-pulse" />
              : <Line data={chartData} options={chartOptions} />
            }
          </div>
        </div>
 
        {/* ── Recent Receipts ── */}
        <div className="card" style={{ maxWidth: '100%' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Últimos Recibos</h3>
            <Link to="/receipts" className="text-primary-600 hover:text-primary-700 text-sm whitespace-nowrap">
              Ver todos →
            </Link>
          </div>
 
          {!loading && stats?.lastReceipts?.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">No hay recibos registrados</p>
          ) : (
            <div className="table-scroll-wrap">
              <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '360px' }}>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '27%' }} />
                  <col style={{ width: '28%' }} />
                  <col style={{ width: '27%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200">
                    {['ID', 'Fecha', 'Total', 'Pago'].map(h => (
                      <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(4)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          {[...Array(4)].map((_, j) => (
                            <td key={j} className="py-3 px-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : stats?.lastReceipts?.map((receipt) => (
                        <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <Link to={`/receipts/${receipt.id}`} className="text-primary-600 hover:underline font-medium text-sm block truncate">
                              {receipt.id}
                            </Link>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {new Date(receipt.createdAt).toLocaleDateString('es-DO')}
                          </td>
                          <td className="py-3 px-2 font-semibold text-sm truncate">
                            {formatCurrency(receipt.total)}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              receipt.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-800' :
                              receipt.paymentMethod === 'Tarjeta'  ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
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
 
export default Dashboard;
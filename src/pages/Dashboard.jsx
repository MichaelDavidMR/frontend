// Dashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { getStats } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

/* ─── Icons ─────────────────────────────────────────────────── */
const Icons = {
  Revenue: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast-wrap anim-toast">
      <Icons.Alert />
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} className="toast-close">✕</button>
      <style>{`
        .toast-wrap {
          position: fixed; bottom: 1.5rem; left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex; align-items: center; gap: 0.625rem;
          background: #1A1917; color: #F2F1ED;
          border: 1px solid rgba(220,38,38,0.4);
          padding: 0.75rem 1rem; border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          font-size: 0.825rem; font-weight: 500;
          min-width: 260px; max-width: calc(100vw - 2rem);
          white-space: nowrap;
        }
        .toast-close {
          background: none; border: none; cursor: pointer;
          color: #6B6960; font-size: 0.75rem; padding: 2px;
        }
        .toast-close:hover { color: #F2F1ED; }
      `}</style>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ height: 10, width: 56, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 28, width: 96, borderRadius: 6 }} />
    </div>
  );
}

/* ─── Payment badge ─────────────────────────────────────────── */
function PayBadge({ method }) {
  const styles = {
    Efectivo:      'badge-green',
    Tarjeta:       'badge-blue',
    Transferencia: 'badge-purple',
  };
  return (
    <span className={`badge ${styles[method] || 'badge-purple'}`}>{method}</span>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────── */
function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

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

  /* Chart */
  const chartData = {
    labels: stats?.monthlyData.map(d => d.month) || [],
    datasets: [{
      label: 'Ingresos (RD$)',
      data:  stats?.monthlyData.map(d => d.total) || [],
      borderColor: 'rgb(47, 84, 235)',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
        gradient.addColorStop(0, 'rgba(47,84,235,0.18)');
        gradient.addColorStop(1, 'rgba(47,84,235,0)');
        return gradient;
      },
      tension: 0.4, fill: true, pointRadius: 4, pointHoverRadius: 7,
      pointBackgroundColor: '#fff', pointBorderColor: 'rgb(47,84,235)',
      pointBorderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181A',
        titleColor: '#9C9A93',
        bodyColor: '#F2F1ED',
        borderColor: '#2A2D35',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => `  ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `RD$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`,
          maxTicksLimit: 5,
          font: { size: 11, family: 'JetBrains Mono' },
          color: '#9C9A93',
        },
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        border: { display: false },
      },
      x: {
        ticks: { font: { size: 11 }, color: '#9C9A93' },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const statItems = [
    {
      label: 'Total del Mes',
      value: formatCurrency(stats?.totalMonth || 0),
      icon: Icons.Revenue,
      iconClass: 'icon-revenue',
      color: '#2F54EB',
      bg: 'rgba(47,84,235,0.08)',
    },
    {
      label: 'Trabajos',
      value: stats?.totalJobs || 0,
      icon: Icons.Clipboard,
      iconClass: 'icon-jobs',
      color: '#16A34A',
      bg: 'rgba(22,163,74,0.08)',
    },
    {
      label: 'Clientes',
      value: stats?.totalClients || 0,
      icon: Icons.Users,
      iconClass: 'icon-clients',
      color: '#7C3AED',
      bg: 'rgba(124,58,237,0.08)',
    },
    {
      label: 'Servicios',
      value: stats?.totalServices || 0,
      icon: Icons.Grid,
      iconClass: 'icon-services',
      color: '#B45309',
      bg: 'rgba(180,83,9,0.08)',
    },
  ];

  return (
    <>
      <div className="space-y-5 pb-24 sm:pb-6" style={{ maxWidth: '100%', overflowX: 'hidden' }}>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Dashboard</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>
              {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/receipts/new" className="btn-primary hide-on-mobile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Recibo
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : statItems.map((item, i) => (
                <div
                  key={item.label}
                  className="stat-card anim-fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span className="stat-label">{item.label}</span>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: item.bg, color: item.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <item.icon />
                    </div>
                  </div>
                  <span className="stat-value" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--text-1)' }}>
                    {item.value}
                  </span>
                </div>
              ))
          }
        </div>

        {/* Chart */}
        <div className="card">
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '1.25rem',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              Ingresos — Últimos 6 Meses
            </h3>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              RD$
            </span>
          </div>
          <div style={{ height: 200 }}>
            {loading
              ? <div className="skeleton" style={{ height: '100%', borderRadius: 10 }} />
              : <Line data={chartData} options={chartOptions} />
            }
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="card">
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '1.25rem',
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              Últimos Recibos
            </h3>
            <Link to="/receipts" style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--primary)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
            }}>
              Ver todos
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>

          {!loading && stats?.lastReceipts?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧾</div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>No hay recibos registrados</p>
            </div>
          ) : (
            <div className="table-scroll-wrap">
              <table className="table-base" style={{ minWidth: 360 }}>
                <colgroup>
                  <col style={{ width: '18%' }} /><col style={{ width: '25%' }} />
                  <col style={{ width: '30%' }} /><col style={{ width: '27%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['ID', 'Fecha', 'Total', 'Método'].map(h => (
                      <th key={h} style={{ textAlign: h === 'Total' ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(4)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(4)].map((_, j) => (
                            <td key={j}><div className="skeleton" style={{ height: 14 }} /></td>
                          ))}
                        </tr>
                      ))
                    : stats?.lastReceipts?.map((receipt, i) => (
                        <tr key={receipt.id} className="anim-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                          <td>
                            <Link to={`/receipts/${receipt.id}`} style={{
                              color: 'var(--primary)', fontWeight: 700,
                              textDecoration: 'none', fontSize: '0.8rem',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {receipt.id}
                            </Link>
                          </td>
                          <td style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>
                            {new Date(receipt.createdAt).toLocaleDateString('es-DO')}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>
                            {formatCurrency(receipt.total)}
                          </td>
                          <td><PayBadge method={receipt.paymentMethod} /></td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <Link
        to="/receipts/new"
        className="fab btn-primary items-center justify-center w-14 h-14 rounded-full"
        aria-label="Nuevo Recibo"
        style={{ fontSize: '1.5rem', fontWeight: 300 }}
      >
        +
      </Link>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </>
  );
}

export default Dashboard;
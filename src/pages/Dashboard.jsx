// Dashboard.jsx — mobile responsive
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
import { getStats } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
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

/* ─── Payment badge ─────────────────────────────────────────── */
function PayBadge({ method }) {
  const map = { Efectivo: 'badge-cash', Tarjeta: 'badge-card', Transferencia: 'badge-transfer' };
  const cls = map[method] || 'badge-transfer';
  return <span className={`badge ${cls}`}><span className="badge-dot" />{method}</span>;
}

/* ─── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  const showToast = useCallback((msg) => setToast(msg), []);
  const hideToast = useCallback(() => setToast(null), []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStats();
      setStats(res.data);
    } catch { showToast('Error cargando estadísticas.'); }
    finally   { setLoading(false); }
  }, [showToast]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const avgTime      = stats?.avgTimePerReceipt;
  const avgTimeDisp  = avgTime != null ? avgTime.toFixed(1) : '—';
  const avgTrend     = stats?.avgTimeTrend;
  const trendUp      = avgTrend != null && avgTrend >= 0;
  const avgTrendDisp = avgTrend != null
    ? `${avgTrend >= 0 ? '+' : ''}${avgTrend}% ${avgTrend >= 0 ? 'más rápido' : 'más lento'} esta semana`
    : 'Sin datos de semana anterior';

  const onTrackPct  = stats?.workshopStatus?.onTrack    ?? 0;
  const freePct     = stats?.workshopStatus?.free       ?? 100;
  const todayCount  = stats?.workshopStatus?.todayCount ?? 0;
  const dailyTarget = stats?.workshopStatus?.dailyTarget ?? 10;

  const chartData = {
    labels:   stats?.monthlyData?.map(d => d.month) || [],
    datasets: [{
      data: stats?.monthlyData?.map(d => d.total) || [],
      borderColor: '#59de9b', backgroundColor: 'rgba(89,222,155,0.12)',
      tension: 0.45, fill: true, pointRadius: 3, pointHoverRadius: 6,
      pointBackgroundColor: '#59de9b', pointBorderColor: '#fff', pointBorderWidth: 2,
    }],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--primary)', titleColor: 'var(--on-primary-container)',
        bodyColor: '#fff', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        padding: 10, displayColors: false,
        callbacks: { label: (ctx) => `  ${formatCurrency(ctx.raw)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: v => `RD$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`, maxTicksLimit: 5, font: { size: 10 }, color: 'var(--on-surface-variant)' },
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, border: { display: false },
      },
      x: {
        ticks: { font: { size: 10 }, color: 'var(--on-surface-variant)' },
        grid: { display: false }, border: { display: false },
      },
    },
  };

  const infoCards = [
    { label: 'Trabajos Activos',     value: stats?.totalJobs     || 0, icon: 'build_circle',        color: 'var(--secondary)' },
    { label: 'Clientes Totales',      value: stats?.totalClients  || 0, icon: 'group',               color: 'var(--primary-container)' },
    { label: 'Servicios en Catálogo', value: stats?.totalServices || 0, icon: 'home_repair_service', color: 'var(--on-tertiary-fixed-variant)' },
  ];

  return (
    <>
      <style>{`
        /* ── Hero layout ── */
        .d-hero { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
        .d-hero-main { grid-column: span 8; }
        .d-hero-side { grid-column: span 4; display: flex; flex-direction: column; gap: 1.5rem; }
        .d-hero-amount { font-size: 3rem; }

        /* ── Info cards ── */
        .d-info { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; }

        /* ── Recent table cols ── */
        .d-col-fecha, .d-col-estado { display: table-cell; }

        /* ── Header row ── */
        .d-recent-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid color-mix(in srgb, var(--outline-variant) 12%, transparent); gap: 0.75rem; flex-wrap: wrap; }

        @media (max-width: 639px) {
          /* Hero: single column */
          .d-hero { grid-template-columns: 1fr; gap: 1rem; }
          .d-hero-main { grid-column: span 1; }
          .d-hero-side { grid-column: span 1; }
          .d-hero-amount { font-size: 2rem !important; }

          /* Info cards: single column */
          .d-info { grid-template-columns: 1fr; gap: 0.75rem; }

          /* Hide date & estado columns in recent table */
          .d-col-fecha  { display: none !important; }
          .d-col-estado { display: none !important; }

          /* Recent header: stack */
          .d-recent-head { flex-direction: column; align-items: flex-start; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .d-hero { grid-template-columns: repeat(12, 1fr); }
          .d-hero-main { grid-column: span 7; }
          .d-hero-side { grid-column: span 5; }
          .d-hero-amount { font-size: 2.4rem !important; }
          .d-info { grid-template-columns: repeat(3,1fr); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 className="page-title">Delivery Dashboard</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>
              {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/receipts/new" className="btn-primary hide-on-mobile">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Nuevo Recibo
          </Link>
        </div>

        {/* Hero grid */}
        <div className="d-hero">

          {/* Main card */}
          <div className="stat-card stat-card-hero d-hero-main" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -16, top: -16, width: 160, height: 160, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ minWidth: 0 }}>
                <p className="stat-label" style={{ color: 'var(--on-primary-container)' }}>Ingresos del Mes</p>
                <div className="d-hero-amount" style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginTop: '0.375rem', letterSpacing: '-0.04em', wordBreak: 'break-word' }}>
                  {loading ? '—' : formatCurrency(stats?.totalMonth || 0)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem', color: 'var(--secondary-fixed)', fontWeight: 700, fontSize: '0.825rem', flexWrap: 'wrap' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>trending_up</span>
                  +12.4% desde el mes pasado
                </div>
              </div>
              <div style={{ padding: '0.625rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>payments</span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
              <div className="sparkbar-wrap">
                {[60,80,40,70,90,50,85,60,78,92,55,80].map((h, i) => (
                  <div key={i} className="sparkbar" style={{ height: `${h}%`, background: `rgba(89,222,155,${0.3 + h/200})` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="d-hero-side">

            {/* Avg time */}
            <div className="card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                  <p className="stat-label" style={{ color: 'var(--on-surface-variant)' }}>Tiempo Prom. por Recibo</p>
                  <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '2.25rem', color: 'var(--primary)', lineHeight: 1.1, marginTop: '0.375rem' }}>
                    {loading ? '—' : avgTimeDisp}
                    {!loading && avgTime != null && <span style={{ fontSize: '0.875rem', fontWeight: 600 }}> min</span>}
                  </div>
                </div>
                <div style={{ padding: '0.625rem', background: 'color-mix(in srgb, var(--secondary-container) 20%, transparent)', borderRadius: '0.5rem', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: 24 }}>schedule</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem', color: trendUp ? 'var(--secondary)' : 'var(--error)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {!loading && (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{trendUp ? 'trending_up' : 'trending_down'}</span>
                    <span>{avgTrendDisp}</span>
                  </>
                )}
              </div>
              <svg width="100%" height="40" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path d="M0 25 Q 10 20, 20 22 T 40 10 T 60 18 T 80 5 T 100 15" fill="none" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Workshop status */}
            <div style={{ background: 'var(--primary)', borderRadius: '0.5rem', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--on-primary-container)', marginBottom: '0.875rem' }}>
                Estado del Taller
              </h3>
              {!loading && (
                <p style={{ fontSize: '0.7rem', color: 'var(--on-primary-container)', opacity: 0.65, marginBottom: '0.875rem' }}>
                  {todayCount} de {dailyTarget} recibos hoy
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Recibos al Día',  val: loading ? 0 : onTrackPct, color: 'var(--secondary)' },
                  { label: 'Capacidad Libre', val: loading ? 0 : freePct,    color: 'var(--tertiary-fixed-dim)' },
                ].map(({ label, val, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-primary-container)' }}>{label}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>{loading ? '—' : `${val}%`}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="d-info">
          {infoCards.map((c, i) => (
            <div key={c.label} className="card anim-fade-up" style={{ padding: '1.25rem', animationDelay: `${i * 60}ms` }}>
              {loading ? (
                <>
                  <div className="skeleton" style={{ height: 9, width: 80, marginBottom: 10 }} />
                  <div className="skeleton" style={{ height: 30, width: 60 }} />
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <p className="stat-label" style={{ color: 'var(--on-surface-variant)' }}>{c.label}</p>
                    <div style={{ padding: '0.375rem', background: `color-mix(in srgb, ${c.color} 12%, transparent)`, borderRadius: '0.375rem', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: c.color }}>{c.icon}</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem', letterSpacing: '-0.04em' }}>
                    {c.value}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid color-mix(in srgb, var(--outline-variant) 15%, transparent)', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="section-title">Ingresos — Últimos 6 Meses</h3>
              <p className="section-sub">Evolución de facturación mensual</p>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-variant)' }}>RD$</span>
          </div>
          <div style={{ padding: '1.5rem', height: 220 }}>
            {loading
              ? <div className="skeleton" style={{ height: '100%', borderRadius: '0.25rem' }} />
              : <Line data={chartData} options={chartOptions} />
            }
          </div>
        </div>

        {/* Recent Receipts */}
        <section className="card">
          <div className="d-recent-head">
            <div>
              <h3 className="section-title">Últimos Recibos</h3>
              <p className="section-sub">Seguimiento en tiempo real de facturación</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/receipts/new" className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                Nuevo Recibo
              </Link>
              <Link to="/receipts" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}>
                Ver todos
              </Link>
            </div>
          </div>

          {!loading && stats?.lastReceipts?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--outline-variant)', display: 'block', marginBottom: '0.75rem' }}>receipt_long</span>
              <p style={{ fontWeight: 600, color: 'var(--on-surface-variant)' }}>No hay recibos registrados</p>
            </div>
          ) : (
            <div className="table-scroll-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="table-base" style={{ minWidth: 400 }}>
                <thead>
                  <tr>
                    <th style={{ width: '14%' }}>ID</th>
                    <th className="d-col-fecha" style={{ width: '26%' }}>Fecha</th>
                    <th style={{ width: '22%' }}>Total</th>
                    <th style={{ width: '22%' }}>Método</th>
                    <th className="d-col-estado" style={{ width: '16%' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(4)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(5)].map((_, j) => (
                            <td key={j}><div className="skeleton" style={{ height: 14, width: j === 1 ? 120 : 70 }} /></td>
                          ))}
                        </tr>
                      ))
                    : stats?.lastReceipts?.map((r, i) => (
                        <tr key={r.id} className="anim-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                          <td>
                            <Link to={`/receipts/${r.id}`} className="table-id" style={{ textDecoration: 'none' }}>
                              #{r.id}
                            </Link>
                          </td>
                          <td className="d-col-fecha" style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                            {new Date(r.createdAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                            {formatCurrency(r.total)}
                          </td>
                          <td><PayBadge method={r.paymentMethod} /></td>
                          <td className="d-col-estado">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="progress-wrap" style={{ flex: 1 }}>
                                <div className="progress-fill done" style={{ width: '100%' }} />
                              </div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary)', whiteSpace: 'nowrap' }}>Cobrado</span>
                            </div>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <Link to="/receipts/new" className="fab btn-primary" aria-label="Nuevo Recibo"
        style={{ width: 56, height: 56, borderRadius: '50%', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,27,68,0.3)' }}>
        +
      </Link>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </>
  );
}
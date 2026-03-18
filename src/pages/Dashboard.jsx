import { useState, useEffect } from 'react';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      setError('Error cargando estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: stats?.monthlyData.map(d => d.month) || [],
    datasets: [
      {
        label: 'Ingresos (RD$)',
        data: stats?.monthlyData.map(d => d.total) || [],
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `RD$${value.toLocaleString()}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button onClick={loadStats} className="btn-primary mt-4">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Link to="/receipts/new" className="btn-primary">
          + Nuevo Recibo
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="stat-label">Total Mes</span>
          <span className="stat-value text-primary-600">{formatCurrency(stats?.totalMonth || 0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Trabajos</span>
          <span className="stat-value">{stats?.totalJobs || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Clientes</span>
          <span className="stat-value">{stats?.totalClients || 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Servicios</span>
          <span className="stat-value">{stats?.totalServices || 0}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Ingresos Últimos 6 Meses</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Receipts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Últimos Recibos</h3>
          <Link to="/receipts" className="text-primary-600 hover:text-primary-700 text-sm">
            Ver todos →
          </Link>
        </div>
        
        {stats?.lastReceipts?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay recibos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Fecha</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Pago</th>
                </tr>
              </thead>
              <tbody>
                {stats?.lastReceipts?.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <Link to={`/receipts/${receipt.id}`} className="text-primary-600 hover:underline font-medium">
                        {receipt.id}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {new Date(receipt.createdAt).toLocaleDateString('es-DO')}
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {formatCurrency(receipt.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        receipt.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-800' :
                        receipt.paymentMethod === 'Tarjeta' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {receipt.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

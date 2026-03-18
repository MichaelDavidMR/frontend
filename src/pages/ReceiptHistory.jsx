import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReceipts, getClients } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

function ReceiptHistory() {
  const [receipts, setReceipts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    clientId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [receiptsRes, clientsRes] = await Promise.all([
        getReceipts(),
        getClients()
      ]);
      setReceipts(receiptsRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.clientId) params.clientId = filters.clientId;
      
      const response = await getReceipts(params);
      setReceipts(response.data);
    } catch (err) {
      console.error('Error filtering:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ from: '', to: '', clientId: '' });
    loadData();
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Recibos</h2>
        <Link to="/receipts/new" className="btn-primary">
          + Nuevo Recibo
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({...filters, from: e.target.value})}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({...filters, to: e.target.value})}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cliente</label>
            <select
              value={filters.clientId}
              onChange={(e) => setFilters({...filters, clientId: e.target.value})}
              className="input"
            >
              <option value="">Todos los clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button onClick={applyFilters} className="btn-primary flex-1">
              Filtrar
            </button>
            <button onClick={clearFilters} className="btn-secondary">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay recibos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pago</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link 
                        to={`/receipts/${receipt.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {receipt.id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(receipt.createdAt).toLocaleDateString('es-DO')}
                    </td>
                    <td className="py-3 px-4">
                      {getClientName(receipt.clientId)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {receipt.items.length} item(s)
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(receipt.total)}
                    </td>
                    <td className="py-3 px-4">
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

export default ReceiptHistory;

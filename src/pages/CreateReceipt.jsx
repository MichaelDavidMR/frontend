import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClients, getServices, createReceipt } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

function CreateReceipt() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [notes, setNotes] = useState('');
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // New item form
  const [newItem, setNewItem] = useState({
    serviceId: '',
    description: '',
    qty: 1,
    unitPrice: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, servicesRes] = await Promise.all([
        getClients(),
        getServices()
      ]);
      setClients(clientsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setNewItem({
        serviceId: service.id,
        description: service.name,
        qty: 1,
        unitPrice: service.price.toString()
      });
    }
  };

  const addItem = () => {
    if (!newItem.description || !newItem.unitPrice) {
      alert('Descripción y precio son obligatorios');
      return;
    }
    
    const item = {
      ...newItem,
      qty: parseInt(newItem.qty) || 1,
      unitPrice: parseFloat(newItem.unitPrice),
      subtotal: (parseInt(newItem.qty) || 1) * parseFloat(newItem.unitPrice)
    };
    
    setItems([...items, item]);
    setNewItem({ serviceId: '', description: '', qty: 1, unitPrice: '' });
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const subtotal = itemsTotal - parseFloat(discount || 0);
    const total = subtotal + parseFloat(tax || 0);
    return { itemsTotal, subtotal, total };
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      alert('Selecciona un cliente');
      return;
    }
    if (items.length === 0) {
      alert('Agrega al menos un item');
      return;
    }
    
    const { subtotal, total } = calculateTotals();
    
    const receiptData = {
      clientId: selectedClient,
      items: items.map(item => ({
        serviceId: item.serviceId || null,
        description: item.description,
        qty: item.qty,
        unitPrice: item.unitPrice
      })),
      paymentMethod,
      notes,
      tax: parseFloat(tax) || 0,
      discount: parseFloat(discount) || 0,
      subtotal,
      total
    };
    
    try {
      setSubmitting(true);
      const response = await createReceipt(receiptData);
      navigate(`/receipts/${response.data.id}`);
    } catch (err) {
      alert('Error creando recibo: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const { itemsTotal, subtotal, total } = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Nuevo Recibo</h2>
      </div>

      {/* Client Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">1. Seleccionar Cliente</h3>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="input"
        >
          <option value="">-- Seleccionar cliente --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} - {client.phone}
            </option>
          ))}
        </select>
        {clients.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No hay clientes. <a href="/clients" className="text-primary-600">Agrega uno primero</a>
          </p>
        )}
      </div>

      {/* Items */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">2. Agregar Items</h3>
        
        {/* Quick service select */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Servicio rápido</label>
          <select
            value={newItem.serviceId}
            onChange={(e) => handleServiceSelect(e.target.value)}
            className="input"
          >
            <option value="">-- Seleccionar servicio --</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - {formatCurrency(service.price)}
              </option>
            ))}
          </select>
        </div>

        {/* Manual item entry */}
        <div className="grid grid-cols-12 gap-2 mb-4">
          <div className="col-span-6">
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              className="input"
              placeholder="Descripción"
            />
          </div>
          <div className="col-span-2">
            <input
              type="number"
              value={newItem.qty}
              onChange={(e) => setNewItem({...newItem, qty: e.target.value})}
              className="input"
              placeholder="Cant"
              min="1"
            />
          </div>
          <div className="col-span-3">
            <input
              type="number"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
              className="input"
              placeholder="Precio"
              min="0"
              step="0.01"
            />
          </div>
          <div className="col-span-1">
            <button
              onClick={addItem}
              className="w-full h-full bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3">Descripción</th>
                  <th className="text-center py-2 px-3">Cant</th>
                  <th className="text-right py-2 px-3">Precio</th>
                  <th className="text-right py-2 px-3">Subtotal</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-3">{item.description}</td>
                    <td className="text-center py-2 px-3">{item.qty}</td>
                    <td className="text-right py-2 px-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-2 px-3 font-medium">{formatCurrency(item.subtotal)}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment & Totals */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">3. Pago y Totales</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descuento (RD$)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">ITBIS/Impuesto (RD$)</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="input"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows="2"
            placeholder="Notas adicionales..."
          />
        </div>

        {/* Totals Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Subtotal items:</span>
            <span>{formatCurrency(itemsTotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Descuento:</span>
              <span className="text-red-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Impuesto:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
            <span>TOTAL:</span>
            <span className="text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !selectedClient || items.length === 0}
        className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Generando Recibo...' : '🧾 Generar Recibo'}
      </button>
    </div>
  );
}

export default CreateReceipt;

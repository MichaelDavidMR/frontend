import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReceipt, anullReceipt } from '../utils/api';
import { formatCurrency, downloadReceiptPDF, printReceipt } from '../utils/pdfGenerator';

function ViewReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnullModal, setShowAnullModal] = useState(false);
  const [anullReason, setAnullReason] = useState('');
  const [anulling, setAnulling] = useState(false);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const response = await getReceipt(id);
      setReceipt(response.data);
    } catch (err) {
      console.error('Error loading receipt:', err);
      alert('Recibo no encontrado');
      navigate('/receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (receipt) {
      downloadReceiptPDF(receipt, receipt.client);
    }
  };

  const handlePrint = () => {
    if (receipt) {
      printReceipt(receipt, receipt.client);
    }
  };

  const handleAnull = async () => {
    if (!anullReason.trim()) {
      alert('Debes indicar un motivo para anular');
      return;
    }
    
    try {
      setAnulling(true);
      await anullReceipt(id, { reason: anullReason });
      setShowAnullModal(false);
      loadReceipt();
    } catch (err) {
      alert('Error anulando recibo');
      console.error(err);
    } finally {
      setAnulling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!receipt) {
    return <div className="text-center py-8">Recibo no encontrado</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Recibo {receipt.id}</h2>
        <div className="flex space-x-2">
          {!receipt.anulled && (
            <>
              <button onClick={handlePrint} className="btn-secondary">
                🖨️ Imprimir
              </button>
              <button onClick={handleDownloadPDF} className="btn-primary">
                📄 Descargar PDF
              </button>
              <button 
                onClick={() => setShowAnullModal(true)}
                className="btn-danger"
              >
                🗑️ Anular
              </button>
            </>
          )}
        </div>
      </div>

      {/* Anulled Banner */}
      {receipt.anulled && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">⚠️ RECIBO ANULADO</p>
          <p className="text-sm">Motivo: {receipt.anulledReason}</p>
          <p className="text-sm">Fecha de anulación: {new Date(receipt.anulledAt).toLocaleString('es-DO')}</p>
        </div>
      )}

      {/* Receipt Preview */}
      <div className="card bg-white">
        {/* Header */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">Taller de Reparaciones</h3>
              <p className="text-sm text-gray-600">RNC: 000-00000-0</p>
              <p className="text-sm text-gray-600">Santo Domingo, RD</p>
              <p className="text-sm text-gray-600">Tel: 809-000-0000</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary-600">{receipt.id}</span>
              <p className="text-sm text-gray-600">
                {new Date(receipt.createdAt).toLocaleString('es-DO')}
              </p>
              <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-1 ${
                receipt.paymentMethod === 'Efectivo' ? 'bg-green-100 text-green-800' :
                receipt.paymentMethod === 'Tarjeta' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {receipt.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">CLIENTE</h4>
          <p className="font-medium">{receipt.client?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600">{receipt.client?.phone || 'N/A'}</p>
          {receipt.client?.address && (
            <p className="text-sm text-gray-600">{receipt.client.address}</p>
          )}
        </div>

        {/* Items Table */}
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4 text-sm font-medium">Descripción</th>
                <th className="text-center py-2 px-4 text-sm font-medium">Cant</th>
                <th className="text-right py-2 px-4 text-sm font-medium">Precio</th>
                <th className="text-right py-2 px-4 text-sm font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="py-2 px-4">{item.description}</td>
                  <td className="text-center py-2 px-4">{item.qty}</td>
                  <td className="text-right py-2 px-4">{formatCurrency(item.unitPrice)}</td>
                  <td className="text-right py-2 px-4 font-medium">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(receipt.subtotal + receipt.discount)}</span>
          </div>
          {receipt.discount > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Descuento:</span>
              <span className="text-red-600">-{formatCurrency(receipt.discount)}</span>
            </div>
          )}
          {receipt.tax > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">ITBIS:</span>
              <span>{formatCurrency(receipt.tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
            <span>TOTAL:</span>
            <span className="text-primary-600">{formatCurrency(receipt.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-gray-700 mb-1">Notas:</h4>
            <p className="text-sm text-gray-600">{receipt.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
          <p>Este recibo respalda la prestación del servicio. Guardar comprobante.</p>
          <p className="mt-1">Control: {receipt.id}</p>
        </div>
      </div>

      {/* Anull Modal */}
      {showAnullModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Anular Recibo</h3>
            <p className="text-gray-600 mb-4">
              Esta acción no se puede deshacer. El recibo será marcado como anulado pero permanecerá en el sistema.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de anulación *
              </label>
              <textarea
                value={anullReason}
                onChange={(e) => setAnullReason(e.target.value)}
                className="input"
                rows="3"
                placeholder="Ej: Error en facturación, cliente canceló..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAnullModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnull}
                disabled={anulling}
                className="btn-danger flex-1"
              >
                {anulling ? 'Anulando...' : 'Confirmar Anulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewReceipt;

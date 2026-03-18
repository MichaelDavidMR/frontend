import { useState, useEffect } from 'react';
import { getServices, createService } from '../utils/api';
import { formatCurrency } from '../utils/pdfGenerator';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await getServices();
      setServices(response.data);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Nombre y precio son obligatorios');
      return;
    }
    
    try {
      setSubmitting(true);
      await createService({
        ...formData,
        price: parseFloat(formData.price)
      });
      setFormData({ name: '', price: '', description: '' });
      setShowForm(false);
      loadServices();
    } catch (err) {
      alert('Error creando servicio');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {/* Add Service Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Nuevo Servicio</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Servicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input"
                  placeholder="Ej: Limpieza y optimización"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Base (RD$) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="input"
                  placeholder="1500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input"
                rows="2"
                placeholder="Descripción del servicio..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Guardar Servicio'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No hay servicios registrados</p>
            <p className="text-sm text-gray-400 mt-1">Agrega tu primer servicio arriba</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-gray-500">{service.id}</span>
                  <h3 className="font-semibold text-gray-900 mt-1">{service.name}</h3>
                </div>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(service.price)}
                </span>
              </div>
              {service.description && (
                <p className="text-sm text-gray-600 mt-2">{service.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Services;

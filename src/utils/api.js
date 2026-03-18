import axios from 'axios';

// Si existe la variable en .env la usa, si no, usa tu URL de Render por defecto
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-2c3d.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Clients
export const getClients = () => api.get('/clients');
export const createClient = (data) => api.post('/clients', data);

// Services
export const getServices = () => api.get('/services');
export const createService = (data) => api.post('/services', data);

// Receipts
export const getReceipts = (params = {}) => api.get('/receipts', { params });
export const getReceipt = (id) => api.get(`/receipts/${id}`);
export const createReceipt = (data) => api.post('/receipts', data);
export const updateReceipt = (id, data) => api.put(`/receipts/${id}`, data);
export const anullReceipt = (id, data) => api.post(`/receipts/${id}/anull`, data);

// Stats
export const getStats = () => api.get('/stats');

// Export
export const exportCSV = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  // Usamos API_URL directamente para que coincida con la base del backend
  window.open(`${API_URL}/api/export?${queryString}`, '_blank');
};

export const downloadBackup = () => {
  window.open(`${API_URL}/api/backup`, '_blank');
};

export const restoreBackup = (data) => api.post('/restore', data);

export default api;
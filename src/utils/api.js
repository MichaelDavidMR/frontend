import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-2c3d.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── Interceptor: adjunta el token JWT en cada petición ──────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor: si el token expiró, limpia sesión y recarga ────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload(); // vuelve al login
    }
    return Promise.reject(error);
  }
);

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
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();
  // Para descargas usamos fetch con el token en el header
  fetch(`${API_URL}/api/export?${queryString}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'receipts.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
};

export const downloadBackup = () => {
  const token = localStorage.getItem('token');
  fetch(`${API_URL}/api/backup`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
};

export const restoreBackup = (data) => api.post('/restore', data);

export default api;
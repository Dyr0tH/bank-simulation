import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_bank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('apex_bank_token');
        localStorage.removeItem('apex_bank_user');
        window.location.href = '/login?session_expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  getDemoCredentials: () => api.get('/auth/demo-credentials')
};

// Account endpoints
export const accountsApi = {
  get: () => api.get('/accounts/my'),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts/open', data),
  lookup: (query) => api.get(`/accounts/lookup`, { params: { query } })
};

// Transaction endpoints
export const transactionsApi = {
  transfer: (data) => api.post('/transactions/transfer', data),
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  getMy: (params) => api.get('/transactions/my', { params }),
  receipt: (referenceNo) => api.get(`/transactions/receipt/${referenceNo}`)
};

// Admin endpoints
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  customers: (params) => api.get('/admin/customers', { params }),
  customerDetail: (id) => api.get(`/admin/customers/${id}`),
  updateAccountStatus: (accountId, data) => api.patch(`/admin/accounts/${accountId}/status`, data),
  ledger: (params) => api.get('/admin/ledger', { params })
};

// Aliases for convenience
export const auth = authApi;
export const accounts = accountsApi;
export const transactions = transactionsApi;
export const admin = adminApi;

export { api };
export default api;

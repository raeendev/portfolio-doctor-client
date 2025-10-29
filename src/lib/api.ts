import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { email?: string; username?: string }) =>
    api.put('/users/profile', data),
};

// Portfolio API
export const portfolioApi = {
  getPortfolio: () => api.get('/portfolio'),
  syncPortfolio: () => api.post('/portfolio/sync'),
};

// Exchanges API
export const exchangesApi = {
  getList: () => api.get('/exchanges/list'),
  connect: (exchangeId: string, apiKey: string, apiSecret: string) => 
    api.post('/exchanges/connect', { exchangeId, apiKey, apiSecret }),
  sync: () => api.post('/exchanges/sync'),
  getPortfolio: () => api.get('/exchanges/portfolio'),
  getConnectedExchanges: () => api.get('/exchanges/connected'),
  disconnect: (exchangeId: string) => api.delete(`/exchanges/${exchangeId}`),
  updateKeys: (exchangeId: string, apiKey: string, apiSecret: string) => 
    api.put(`/exchanges/${exchangeId}`, { apiKey, apiSecret }),
};

// Profiling API
export const profilingApi = {
  getQuestionnaire: () => api.get('/profiling/questionnaire'),
};

// Trading Plan API
export const tradingPlanApi = {
  getTradingPlan: () => api.get('/trading-plan'),
};

// Health API
export const healthApi = {
  check: () => api.get('/health'),
};

import axios from 'axios';

// Updated to connect to Python FastAPI backend (port 3001)
// IMPORTANT: Always use port 3001 for backend
const getApiBaseUrl = () => {
  // Check environment variable
  const envUrl = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL 
    : process.env.NEXT_PUBLIC_API_URL;
  
  // Default to port 3001
  const defaultUrl = 'http://localhost:3001/api';
  
  // Use env URL if it exists and points to 3001, otherwise use default
  if (envUrl && envUrl.includes(':3001')) {
    return envUrl;
  }
  
  // If env URL points to wrong port, fix it
  if (envUrl && envUrl.includes(':3000')) {
    console.warn('⚠️ API URL was pointing to port 3000, forcing to 3001');
    return envUrl.replace(':3000', ':3001');
  }
  
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

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

// Portfolio API (with longer timeout for live data fetching)
export const portfolioApi = {
  getPortfolio: () => api.get('/portfolio', { timeout: 60000 }), // 60 seconds for live portfolio data
  syncPortfolio: () => api.post('/portfolio/sync', { timeout: 120000 }), // 120 seconds for sync
  getSpotPortfolio: () => api.get('/portfolio/spot', { timeout: 60000 }),
  getFuturesPortfolio: () => api.get('/portfolio/futures', { timeout: 60000 }),
  getAIAnalysis: () => api.get('/portfolio/ai-analysis', { timeout: 30000 }), // 30 seconds for AI analysis
  getMemeCoinAnalysis: () => api.get('/portfolio/meme-analysis', { timeout: 30000 }), // 30 seconds for meme coin analysis
  getAllocationAnalysis: () => api.get('/portfolio/allocation-analysis', { timeout: 30000 }), // 30 seconds for allocation analysis
  getCoinSentiment: (symbol: string) => api.get(`/portfolio/sentiment/${symbol}`, { timeout: 20000 }), // 20 seconds for sentiment
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
  importTradeData: (data: { data: any[]; fileName: string; fileType: string }) =>
    api.post('/exchanges/import-trades', data, { timeout: 60000 }),
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

// AI Chat API
export const aiChatApi = {
  sendMessage: (data: { message: string; portfolioContext?: any }) =>
    api.post('/ai-chat/message', data, { timeout: 60000 }), // 60 seconds for AI response
  getHistory: () => api.get('/ai-chat/history', { timeout: 10000 }),
  clearHistory: () => api.delete('/ai-chat/history', { timeout: 10000 }),
};

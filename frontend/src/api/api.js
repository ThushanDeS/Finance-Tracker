import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || '';

    const shouldRefreshBudgetAlerts =
      (url.includes('/transactions') && ['post', 'put', 'delete'].includes(method)) ||
      (url.includes('/budgets') && ['post', 'put', 'delete'].includes(method));

    if (shouldRefreshBudgetAlerts && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('budget-alerts-refresh'));
    }

    return response;
  },
  (error) => Promise.reject(error)
);

export default api;

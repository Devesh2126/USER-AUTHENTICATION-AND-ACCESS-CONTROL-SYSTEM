import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests = [];

function resolvePending(error) {
  pendingRequests.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (status !== 401 || code !== 'INVALID_TOKEN' || originalRequest._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retried = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      resolvePending(null);
      return api(originalRequest);
    } catch (refreshError) {
      resolvePending(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

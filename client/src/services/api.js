import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // The single most important line in this file: without this, the
  // browser will NOT send our HttpOnly cookies on cross-origin requests
  // (localhost:5173 -> localhost:5000 counts as cross-origin), and every
  // authenticated request would silently look like a logged-out user.
  withCredentials: true,
});

// If a request fails with 401 because the access token expired (not
// because credentials were simply missing), try refreshing once and
// replay the original request. This is what makes the 1-hour token
// expiry invisible to the user during normal use.
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

    // Don't try to refresh on the refresh endpoint itself, or if we've
    // already retried this request once (avoids infinite loops).
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (status !== 401 || code !== 'INVALID_TOKEN' || originalRequest._retried || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // A refresh is already in flight (e.g. two requests failed at once)
      // — queue this one instead of firing a second refresh call.
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

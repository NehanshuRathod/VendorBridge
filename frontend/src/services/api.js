import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const hasBrowserStorage = () => typeof window !== 'undefined' && window.localStorage;

export const normalizeRole = (role) => {
  if (!role) return null;

  const rawRole = typeof role === 'object'
    ? role.name || role.role || role.authority || String(role)
    : String(role);

  return rawRole
    .replace(/^ROLE_/i, '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
};

const normalizeUser = (userData = {}) => {
  const { accessToken, refreshToken, tokenType, ...profile } = userData;
  return {
    ...profile,
    role: normalizeRole(profile.role),
  };
};

export const clearStoredAuth = () => {
  if (!hasBrowserStorage()) return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const readStoredUser = () => {
  if (!hasBrowserStorage()) return null;

  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!storedUser || storedUser === 'undefined' || !token) {
    return null;
  }

  try {
    const user = normalizeUser(JSON.parse(storedUser));
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    clearStoredAuth();
    return null;
  }
};

export const setStoredAuth = (authData = {}) => {
  if (!hasBrowserStorage()) return normalizeUser(authData);

  if (authData.accessToken) {
    localStorage.setItem('token', authData.accessToken);
  }

  if (authData.refreshToken) {
    localStorage.setItem('refreshToken', authData.refreshToken);
  }

  const user = normalizeUser(authData);
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

const getRefreshToken = () => {
  if (!hasBrowserStorage()) return null;
  return localStorage.getItem('refreshToken');
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  const publicPaths = ['/login', '/register'];
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.href = '/login';
  }
};

const isAuthRequest = (url = '') => (
  url.includes('/auth/login')
  || url.includes('/auth/register')
  || url.includes('/auth/refresh')
);

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  const responseData = error?.response?.data;
  let errorMsg = responseData?.message || error?.message || fallback;
  const fieldErrors = responseData?.errors || responseData?.data;

  if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
    const details = Object.values(fieldErrors).filter(Boolean).join(', ');
    if (details) {
      errorMsg = `${errorMsg}: ${details}`;
    }
  }

  return errorMsg;
};

export const getPayload = (apiResponse) => {
  if (!apiResponse) return null;
  if (
    Object.prototype.hasOwnProperty.call(apiResponse, 'success')
    || Object.prototype.hasOwnProperty.call(apiResponse, 'message')
    || Object.prototype.hasOwnProperty.call(apiResponse, 'timestamp')
  ) {
    return apiResponse.data;
  }
  return apiResponse.data ?? apiResponse;
};

export const getList = (apiResponse) => {
  const payload = getPayload(apiResponse);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = hasBrowserStorage() ? localStorage.getItem('token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest(originalRequest.url)) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post(
            `${baseURL}/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const authData = refreshResponse.data?.data;
          if (refreshResponse.data?.success && authData?.accessToken) {
            setStoredAuth(authData);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
            return api(originalRequest);
          }
        } catch {
          clearStoredAuth();
          redirectToLogin();
        }
      }
    }

    if (status === 401 && !isAuthRequest(originalRequest?.url)) {
      clearStoredAuth();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export default api;

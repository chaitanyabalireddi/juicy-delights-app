// API utility for making HTTP requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const api = {
  async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, headers = {}, ...fetchOptions } = options;

    const token = localStorage.getItem('authToken');
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requiresAuth && token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  },

  get<T>(endpoint: string, requiresAuth = false) {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  },

  post<T>(endpoint: string, data?: any, requiresAuth = false) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth,
    });
  },

  put<T>(endpoint: string, data?: any, requiresAuth = false) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth,
    });
  },

  delete<T>(endpoint: string, requiresAuth = false) {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  },
};

export default api;


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

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers: defaultHeaders,
      });
    } catch (networkError: any) {
      // Network error (no internet, CORS, server down, etc.)
      throw new Error(`Failed to fetch: ${networkError.message || 'Cannot connect to server. Please check your internet connection and ensure the backend is running.'}`);
    }

    const data = await response.json().catch(() => null);
    
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
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


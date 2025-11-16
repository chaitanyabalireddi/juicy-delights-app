// API utility for making HTTP requests
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://fruitjet.onrender.com/api');

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

const isFormDataBody = (body: BodyInit | null | undefined): body is FormData => {
  return typeof FormData !== 'undefined' && body instanceof FormData;
};

const prepareBody = (data?: unknown) => {
  if (data === undefined || data === null) {
    return undefined;
  }
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return data;
  }
  return JSON.stringify(data);
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

export const api = {
  async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, headers = {}, ...fetchOptions } = options;

    const token = localStorage.getItem('authToken');
    
    const defaultHeaders: HeadersInit = {
      ...(isFormDataBody(fetchOptions.body) ? {} : { 'Content-Type': 'application/json' }),
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
    } catch (networkError: unknown) {
      const message = getErrorMessage(
        networkError,
        'Cannot connect to server. Please check your internet connection and ensure the backend is running.'
      );
      throw new Error(`Failed to fetch: ${message}`);
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

  post<T>(endpoint: string, data?: unknown, requiresAuth = false) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: prepareBody(data),
      requiresAuth,
    });
  },

  put<T>(endpoint: string, data?: unknown, requiresAuth = false) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: prepareBody(data),
      requiresAuth,
    });
  },

  delete<T>(endpoint: string, requiresAuth = false) {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  },
};

export default api;


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'delivery';
  address?: Address[];
}

interface AuthApiResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens: unknown;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

const extractAccessToken = (tokens: unknown): string | null => {
  if (!tokens) return null;
  if (typeof tokens === 'string') {
    return tokens;
  }
  if (
    typeof tokens === 'object' &&
    tokens !== null &&
    'accessToken' in tokens &&
    typeof (tokens as { accessToken?: unknown }).accessToken === 'string'
  ) {
    return (tokens as { accessToken: string }).accessToken;
  }
  if (
    typeof tokens === 'object' &&
    tokens !== null &&
    'access' in tokens &&
    typeof (tokens as { access?: unknown }).access === 'string'
  ) {
    return (tokens as { access: string }).access;
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const normalizePassword = (value: string) => value.trim();

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthApiResponse>(
        '/auth/login',
        { email: normalizeEmail(email), password: normalizePassword(password) },
        false
      );

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        setUser(userData);
        const accessToken = extractAccessToken(tokens);
        
        if (!accessToken) {
          throw new Error('No access token received from server');
        }
        
        setToken(accessToken);
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw new Error(getErrorMessage(error, 'Login failed. Please check your credentials.'));
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);
      const normalizedPassword = normalizePassword(password);
      // Ensure phone has + prefix if not present
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        // If it's an Indian number starting with 0 or without +, add +91
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+91' + formattedPhone.substring(1);
        } else if (formattedPhone.length === 10) {
          formattedPhone = '+91' + formattedPhone;
        } else {
          formattedPhone = '+' + formattedPhone;
        }
      }

      const response = await api.post<AuthApiResponse>('/auth/register', { 
        name: trimmedName, 
        email: normalizedEmail, 
        phone: formattedPhone, 
        password: normalizedPassword
      }, false);

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        setUser(userData);
        const accessToken = extractAccessToken(tokens);
        
        if (!accessToken) {
          throw new Error('No access token received from server');
        }
        
        setToken(accessToken);
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      throw new Error(getErrorMessage(error, 'Registration failed. Please check your details.'));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


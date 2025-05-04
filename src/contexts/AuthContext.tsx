import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  credits: number;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  
  // Set auth token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser({
            id: res.data._id,
            username: res.data.username,
            email: res.data.email,
            role: res.data.role,
            credits: res.data.credits.total,
            profileCompleted: res.data.profileCompleted
          });
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, [token]);
  
  
  // Login user
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };
  
  // Register user
  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { username, email, password });
      
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };
  
  // Update user info
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
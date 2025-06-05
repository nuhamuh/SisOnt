import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, login as apiLogin } from '../services/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      return JSON.parse(savedUser);
    }
    return null;
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await apiLogin({ username, password });
      const { token, user: userData } = response;
      
      // Simpan token dan user ke localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set header Authorization untuk semua request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Hapus data dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Hapus header Authorization
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  // Verifikasi token saat aplikasi dimuat
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Coba verifikasi token dengan backend
          await api.get('/auth/verify');
        } catch (error) {
          // Jika token tidak valid, logout
          console.error('Token verification failed:', error);
          logout();
        }
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/apiService';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      console.log("Attempting login with:", { email });
      const response = await authAPI.login(email, password);
      console.log("Login response:", response);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser({
        id: response.user.id,
        username: response.user.username,
        email: response.user.email
      });
      
      setIsLoggedIn(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to log in');
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      console.log("Attempting signup with:", { username, email });
      const response = await authAPI.register(username, email, password);
      console.log("Signup response:", response);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser({
        id: response.user.id,
        username: response.user.username,
        email: response.user.email
      });
      
      setIsLoggedIn(true);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to create account');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, error, login, signup, logout, clearError }}>
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

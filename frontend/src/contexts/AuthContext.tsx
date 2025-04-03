import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/apiService';

interface User {
  id: number;
  username: string;
  email: string;
  is_private?: boolean; // Add this property
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
  updateUser: (userData: Partial<User>) => void; // Add this method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuthentication = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Attempt to verify token
        const result = await authAPI.verify();
        
        if (result.valid) {
          setUser(result.user);
          setIsLoggedIn(true);
          
          // Schedule token refresh
          const REFRESH_INTERVAL = 23 * 60 * 60 * 1000; // 23 hours
          const refreshTimer = setTimeout(refreshUserToken, REFRESH_INTERVAL);
          
          // Clean up timer on unmount
          return () => clearTimeout(refreshTimer);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        
        // On network errors, use stored user data as fallback
        if (!navigator.onLine) {
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              setUser(JSON.parse(userData));
              setIsLoggedIn(true);
            }
          } catch (e) {
            console.error("Failed to parse stored user data:", e);
          }
        } else {
          // For other errors, logout
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuthentication();
  }, []);

  // Add token refresh function
  const refreshUserToken = async () => {
    try {
      const result = await authAPI.refresh();
      if (result.token) {
        localStorage.setItem('token', result.token);
        
        // Schedule next refresh
        const REFRESH_INTERVAL = 23 * 60 * 60 * 1000; // 23 hours
        setTimeout(refreshUserToken, REFRESH_INTERVAL);
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      console.log("Attempting login with:", { email });
      const response = await authAPI.login(email, password);
      console.log("Login response:", response);
      
      if (response && response.token) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setUser({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          is_private: response.user.is_private
        });
        
        setIsLoggedIn(true);
        console.log("Login successful, token saved to localStorage");
      } else {
        throw new Error("Invalid response format from server");
      }
      
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

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, error, login, signup, logout, clearError, updateUser }}>
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

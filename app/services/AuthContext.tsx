import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to encode to base64 (Basic Auth)
  const encodeBase64 = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    while (i < str.length) {
      const c1 = str.charCodeAt(i++);
      const c2 = str.charCodeAt(i++);
      const c3 = str.charCodeAt(i++);
      const e1 = c1 >> 2;
      const e2 = ((c1 & 3) << 4) | (c2 >> 4);
      let e3 = ((c2 & 15) << 2) | (c3 >> 6);
      let e4 = c3 & 63;
      if (isNaN(c2)) e3 = e4 = 64;
      else if (isNaN(c3)) e4 = 64;
      output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
    }
    return output;
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Create Basic Auth header
      const authHeader = 'Basic ' + encodeBase64(`${username}:${password}`);
      
      // Attempt to fetch current user info from our new endpoint
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': authHeader
        }
      });
      
      if (response.data && response.data.id) {
        // Login successful
        setUser(response.data);
        
        // Persist the auth header for future requests
        api.defaults.headers.common['Authorization'] = authHeader;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error?.response?.status, error?.response?.data);
      // If 401, it's definitely wrong credentials
      throw new Error('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

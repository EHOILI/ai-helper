
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from '../api/authService';
import { useNavigate } from 'react-router-dom';

// Define the shape of the user object
interface User {
  id: number;
  username: string;
  xp: number;
  money: number;
  reputation: string;
  inventory: string[];
  xpBoosterExpires: number | null;
}

// Define the shape of the context data
interface AuthContextType {
  user: { token: string; user: User } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (newUserData: User) => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Define the props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ token: string; user: User } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      console.log('Login successful, server response:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await authService.register(username, password);
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (newUserData: User) => {
    if (user) {
      const updatedUser = { ...user, user: newUserData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = { user, loading, login, register, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;
const CURRENT_USER_KEY = 'photoReviveCurrentUser';

interface AuthContextType {
  user: User | null;
  credits: number;
  isLoggedIn: boolean;
  login: (name: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  addCredits: (amount: number) => Promise<void>;
  spendCredits: (amount: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [credits, setCredits] = useState<number>(user?.credits || 0);

  useEffect(() => {
    setCredits(user?.credits || 0);
  }, [user]);

  const updateUserState = (userData: User) => {
    setUser(userData);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  };
  
  const login = useCallback(async (name: string, referralCode?: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, referralCode }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const userData = await response.json();
      updateUserState(userData);
    } catch (error) {
      console.error(error);
      // Handle error appropriately in UI
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);
  
  const addCredits = useCallback(async (amount: number) => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/add-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to add credits');
      }
      const updatedUser = await response.json();
      updateUserState(updatedUser);
    } catch (error) {
      console.error(error);
    }
  }, [user]);
  
  const spendCredits = useCallback(async (amount: number) => {
    if (!user || user.credits < amount) return false;
    try {
      const response = await fetch(`${API_URL}/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to spend credits');
      }
      const updatedUser = await response.json();
      updateUserState(updatedUser);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, [user]);


  const value = {
    user,
    credits,
    isLoggedIn: !!user,
    login,
    logout,
    addCredits,
    spendCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

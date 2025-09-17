import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import chatAPI from '../services/chatAPI';

interface UserContextType {
  userId: string;
  setUserId: (userId: string) => void;
  isValidUserId: (userId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  // Initialize with existing userId from localStorage or default
  const [userId, setUserIdState] = useState<string>(() => {
    const saved = localStorage.getItem('chatUserId');
    return saved || 'default-user';
  });

  const setUserId = useCallback((newUserId: string) => {
    if (newUserId.trim() && newUserId !== userId) {
      const trimmedUserId = newUserId.trim();
      setUserIdState(trimmedUserId);
      localStorage.setItem('chatUserId', trimmedUserId);
      // Update the API service with the new userId
      chatAPI.setUserId(trimmedUserId);
    }
  }, [userId]);

  const isValidUserId = useCallback((userId: string): boolean => {
    return userId.trim().length > 0 && userId.trim().length <= 50;
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, isValidUserId }}>
      {children}
    </UserContext.Provider>
  );
}

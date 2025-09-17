import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  hasApiKey: boolean;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKey, setApiKeyState] = useState(() => {
    return localStorage.getItem('chat-api-key') || '';
  });

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem('chat-api-key', key);
    } else {
      localStorage.removeItem('chat-api-key');
    }
  };

  const clearApiKey = () => {
    setApiKey('');
  };

  const hasApiKey = apiKey.length > 0;

  useEffect(() => {
    // Listen for storage changes (if user opens multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-api-key') {
        setApiKeyState(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey, hasApiKey, clearApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}

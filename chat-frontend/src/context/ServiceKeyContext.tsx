import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ServiceKeyContextType {
  serviceKey: string;
  setServiceKey: (key: string) => void;
  updateApiService: () => void;
}

const ServiceKeyContext = createContext<ServiceKeyContextType | undefined>(undefined);

interface ServiceKeyProviderProps {
  children: ReactNode;
}

export function ServiceKeyProvider({ children }: ServiceKeyProviderProps) {
  const [serviceKey, setServiceKeyState] = useState(() => {
    return localStorage.getItem('chat-service-auth-key') || 'dev-api-key-2024';
  });

  const setServiceKey = (key: string) => {
    setServiceKeyState(key);
    localStorage.setItem('chat-service-auth-key', key);
    
    // Dynamically update the API service header
    updateApiService();
  };

  const updateApiService = () => {
    // This will be called to update the axios instance headers
    const event = new CustomEvent('service-key-changed', { 
      detail: { serviceKey: serviceKey } 
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    // Listen for storage changes (if user opens multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chat-service-auth-key') {
        setServiceKeyState(e.newValue || 'dev-api-key-2024');
        const event = new CustomEvent('service-key-changed', { 
          detail: { serviceKey: e.newValue || 'dev-api-key-2024' } 
        });
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update API service on initial load
  useEffect(() => {
    const event = new CustomEvent('service-key-changed', { 
      detail: { serviceKey: serviceKey } 
    });
    window.dispatchEvent(event);
  }, [serviceKey]);

  return (
    <ServiceKeyContext.Provider value={{ serviceKey, setServiceKey, updateApiService }}>
      {children}
    </ServiceKeyContext.Provider>
  );
}

export function useServiceKey() {
  const context = useContext(ServiceKeyContext);
  if (context === undefined) {
    throw new Error('useServiceKey must be used within a ServiceKeyProvider');
  }
  return context;
}

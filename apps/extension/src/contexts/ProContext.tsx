import React, { createContext, useContext, useState } from 'react';

interface ProContextType {
  isPro: boolean;
  isLoading: boolean;
  setProStatus: (isPro: boolean) => Promise<void>;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

export function ProProvider({ children }: { children: React.ReactNode }) {
  // All features available for now
  const [isPro, setIsPro] = useState(true);
  const [isLoading] = useState(false);

  const setProStatus = async (newStatus: boolean) => {
    await chrome.storage.local.set({ isPro: newStatus });
    setIsPro(newStatus);
  };

  return (
    <ProContext.Provider value={{ isPro, isLoading, setProStatus }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (context === undefined) {
    throw new Error('usePro must be used within a ProProvider');
  }
  return context;
}

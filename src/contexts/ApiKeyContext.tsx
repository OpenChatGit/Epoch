'use client';

import { createContext, useContext, ReactNode } from 'react';

interface ApiKeyContextType {
  serperApiKey?: string;
}

const ApiKeyContext = createContext<ApiKeyContextType>({});

export function ApiKeyProvider({ 
  children, 
  serperApiKey 
}: { 
  children: ReactNode; 
  serperApiKey?: string;
}) {
  return (
    <ApiKeyContext.Provider value={{ serperApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  return useContext(ApiKeyContext);
}

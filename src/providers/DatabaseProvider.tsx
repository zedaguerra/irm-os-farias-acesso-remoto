import React, { createContext, useContext, ReactNode } from 'react';
import { useDatabase } from '../hooks/useDatabase';

const DatabaseContext = createContext<ReturnType<typeof useDatabase> | null>(null);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const database = useDatabase();

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDB() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDB must be used within a DatabaseProvider');
  }
  return context;
}
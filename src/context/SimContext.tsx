import React, { createContext, useContext, ReactNode } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { Vehicle, Alert } from '../data/network';

interface SimContextType {
  vehicles: Vehicle[];
  alerts: Alert[];
  simulateDelay: (id: string, mins?: number) => void;
  clearDelay: (id: string) => void;
  dismissAlert: (id: number) => void;
  addAlert: (msg: string, type?: Alert['type']) => void;
}

const SimContext = createContext<SimContextType | null>(null);

export function SimProvider({ children }: { children: ReactNode }) {
  const sim = useSimulation();
  return <SimContext.Provider value={sim}>{children}</SimContext.Provider>;
}

export function useSim() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSim must be used within SimProvider');
  return ctx;
}

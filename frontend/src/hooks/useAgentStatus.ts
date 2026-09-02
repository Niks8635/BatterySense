import { useState, useEffect, createContext, useContext } from 'react';
import { fetchHealth } from '../services/api';

interface AgentStatusContextType {
  isOnline: boolean;
  isDemoMode: boolean;
  checking: boolean;
  checkNow: () => Promise<boolean>;
  setDemoMode: (val: boolean) => void;
}

export const AgentStatusContext = createContext<AgentStatusContextType>({
  isOnline: false,
  isDemoMode: true,
  checking: false,
  checkNow: async () => false,
  setDemoMode: () => {}
});

export const useAgentStatus = () => useContext(AgentStatusContext);

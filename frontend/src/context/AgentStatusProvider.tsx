import React, { useState, useEffect, ReactNode } from 'react';
import { AgentStatusContext } from '../hooks/useAgentStatus';
import { fetchHealth } from '../services/api';
import { wsService } from '../services/websocketService';

export const AgentStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [checking, setChecking] = useState<boolean>(false);

  const checkConnection = async (): Promise<boolean> => {
    setChecking(true);
    try {
      await fetchHealth();
      setIsOnline(true);
      setIsDemoMode(false);
      wsService.connect();
      return true;
    } catch {
      setIsOnline(false);
      setIsDemoMode(true);
      return false;
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Background polling for agent detection every 6 seconds
    const timer = setInterval(checkConnection, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AgentStatusContext.Provider
      value={{
        isOnline,
        isDemoMode,
        checking,
        checkNow: checkConnection,
        setDemoMode: setIsDemoMode
      }}
    >
      {children}
    </AgentStatusContext.Provider>
  );
};

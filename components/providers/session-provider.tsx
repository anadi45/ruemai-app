'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { RoomContext } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS, type AppConfig } from '@/app-config';
import type { ConversationHistory } from '@/components/views/history-view';
import { useRoom } from '@/hooks/useRoom';

const SessionContext = createContext<{
  appConfig: AppConfig;
  isSessionActive: boolean;
  conversationHistory: ConversationHistory | null;
  startSession: () => void;
  endSession: () => void;
  clearHistory: () => void;
  saveHistory: (history: ConversationHistory) => void;
}>({
  appConfig: APP_CONFIG_DEFAULTS,
  isSessionActive: false,
  conversationHistory: null,
  startSession: () => {},
  endSession: () => {},
  clearHistory: () => {},
  saveHistory: () => {},
});

interface SessionProviderProps {
  appConfig: AppConfig;
  children: React.ReactNode;
}

export const SessionProvider = ({ appConfig, children }: SessionProviderProps) => {
  const { room, isSessionActive, startSession, endSession } = useRoom(appConfig);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory | null>(null);

  const clearHistory = useCallback(() => {
    setConversationHistory(null);
  }, []);

  const saveHistory = useCallback((history: ConversationHistory) => {
    setConversationHistory(history);
  }, []);

  const contextValue = useMemo(
    () => ({
      appConfig,
      isSessionActive,
      conversationHistory,
      startSession,
      endSession,
      clearHistory,
      saveHistory,
    }),
    [
      appConfig,
      isSessionActive,
      conversationHistory,
      startSession,
      endSession,
      clearHistory,
      saveHistory,
    ]
  );

  return (
    <RoomContext.Provider value={room}>
      <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
    </RoomContext.Provider>
  );
};

export function useSession() {
  return useContext(SessionContext);
}

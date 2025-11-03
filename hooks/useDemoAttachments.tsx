'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DemoAttachment {
  id: string;
  liveUrl: string;
  timestamp: number;
}

interface DemoAttachmentContextType {
  demos: DemoAttachment[];
  addDemoAttachment: (attachment: Omit<DemoAttachment, 'id' | 'timestamp'>) => void;
  clearDemos: () => void;
}

const DemoAttachmentContext = createContext<DemoAttachmentContextType | undefined>(undefined);

export function DemoAttachmentProvider({ children }: { children: ReactNode }) {
  const [demos, setDemos] = useState<DemoAttachment[]>([]);

  const addDemoAttachment = useCallback((attachment: Omit<DemoAttachment, 'id' | 'timestamp'>) => {
    const newDemo: DemoAttachment = {
      ...attachment,
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setDemos(prev => [...prev, newDemo]);
  }, []);

  const clearDemos = useCallback(() => {
    setDemos([]);
  }, []);

  return (
    <DemoAttachmentContext.Provider value={{ demos, addDemoAttachment, clearDemos }}>
      {children}
    </DemoAttachmentContext.Provider>
  );
}

export function useDemoAttachments() {
  const context = useContext(DemoAttachmentContext);
  if (context === undefined) {
    throw new Error('useDemoAttachments must be used within a DemoAttachmentProvider');
  }
  return context;
}


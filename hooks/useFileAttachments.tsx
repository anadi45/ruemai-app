'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FileAttachment {
  id: string;
  filename: string;
  fileSize: number;
  fileExtension: string;
  filePath: string;
  timestamp: number;
}

interface FileAttachmentContextType {
  attachments: FileAttachment[];
  addFileAttachment: (attachment: Omit<FileAttachment, 'id' | 'timestamp'>) => void;
  clearAttachments: () => void;
}

const FileAttachmentContext = createContext<FileAttachmentContextType | undefined>(undefined);

export function FileAttachmentProvider({ children }: { children: ReactNode }) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);

  const addFileAttachment = useCallback((attachment: Omit<FileAttachment, 'id' | 'timestamp'>) => {
    const newAttachment: FileAttachment = {
      ...attachment,
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setAttachments(prev => [...prev, newAttachment]);
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return (
    <FileAttachmentContext.Provider value={{ attachments, addFileAttachment, clearAttachments }}>
      {children}
    </FileAttachmentContext.Provider>
  );
}

export function useFileAttachments() {
  const context = useContext(FileAttachmentContext);
  if (context === undefined) {
    throw new Error('useFileAttachments must be used within a FileAttachmentProvider');
  }
  return context;
}

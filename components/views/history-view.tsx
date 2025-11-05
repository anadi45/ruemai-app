'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { ReceivedChatMessage } from '@livekit/components-react';
import { FileAttachment } from '@/components/features/attachments/file-attachment';
import { ChatTranscript } from '@/components/features/chat/chat-transcript';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area/scroll-area';

const MotionHistoryView = motion.create('div');

const VIEW_MOTION_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.5,
  },
};

export interface ConversationHistory {
  messages: ReceivedChatMessage[];
  fileAttachments: Array<{
    id: string;
    filename: string;
    fileSize: number;
    fileExtension: string;
    timestamp: number;
  }>;
  demoAttachments: Array<{
    id: string;
    liveUrl: string;
    timestamp: number;
  }>;
}

interface HistoryViewProps {
  history: ConversationHistory;
  onStartNewCall: () => void;
}

export const HistoryView = ({ history, onStartNewCall }: HistoryViewProps) => {
  return (
    <MotionHistoryView
      {...VIEW_MOTION_PROPS}
      className="bg-background relative z-10 h-full w-full overflow-hidden"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-border bg-background/95 flex-shrink-0 border-b p-6 backdrop-blur-sm">
          <h1 className="text-foreground text-2xl font-semibold">Call History</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review your conversation and attachments from the call
          </p>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side - Chat Transcript */}
          <div className="border-border bg-background/95 w-80 flex-shrink-0 border-r backdrop-blur-sm">
            <div className="flex h-full flex-col">
              {/* Transcript Header */}
              <div className="border-border flex-shrink-0 border-b p-4">
                <h3 className="text-foreground text-sm font-medium">Transcript</h3>
              </div>

              {/* Transcript Content */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <ChatTranscript
                      hidden={false}
                      messages={history.messages}
                      className="space-y-3"
                    />
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Right Side - Attachments */}
          <div className="relative flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              {/* Attachments Header */}
              <div className="border-border flex-shrink-0 border-b p-4">
                <h3 className="text-foreground text-sm font-medium">Attachments</h3>
              </div>

              {/* Attachments Content */}
              <div className="flex-1 overflow-auto">
                <ScrollArea className="h-full">
                  <div className="space-y-4 p-4">
                    {/* File Attachments */}
                    {history.fileAttachments.map((attachment) => (
                      <FileAttachment
                        key={attachment.id}
                        filename={attachment.filename}
                        fileSize={attachment.fileSize}
                        fileExtension={attachment.fileExtension}
                      />
                    ))}

                    {/* Demo Attachments - Placeholder Style */}
                    {history.demoAttachments.map((demo) => (
                      <div
                        key={demo.id}
                        className="border-border from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-primary/20 overflow-hidden rounded-lg border-2 bg-gradient-to-br p-6 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">🎬</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-primary text-lg font-semibold">Live Demo</span>
                              <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                DEMO
                              </span>
                            </div>
                            <div className="text-muted-foreground mt-1 text-sm">
                              Browser automation was performed during this call
                            </div>
                            <div className="text-muted-foreground/70 mt-2 text-xs">
                              {new Date(demo.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State */}
                    {history.fileAttachments.length === 0 &&
                      history.demoAttachments.length === 0 && (
                        <div className="text-muted-foreground flex h-full items-center justify-center py-12 text-center">
                          <div>
                            <div className="mb-2 text-4xl">📎</div>
                            <p className="text-sm">No attachments in this conversation</p>
                          </div>
                        </div>
                      )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="border-border bg-background/95 flex-shrink-0 border-t p-6 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartNewCall}
              className="w-full font-mono"
            >
              Start a New Call
            </Button>
          </div>
        </div>
      </div>
    </MotionHistoryView>
  );
};

'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { ReceivedChatMessage } from '@livekit/components-react';
import { FileAttachment } from '@/components/features/attachments/file-attachment';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area/scroll-area';
import { cn } from '@/lib/utils';

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

type TimelineItem =
  | { type: 'message'; data: ReceivedChatMessage }
  | { type: 'file'; data: ConversationHistory['fileAttachments'][0] }
  | { type: 'demo'; data: ConversationHistory['demoAttachments'][0] };

export const HistoryView = ({ history, onStartNewCall }: HistoryViewProps) => {
  // Combine messages and attachments into a single timeline sorted by timestamp
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [
      ...history.messages.map((msg) => ({ type: 'message' as const, data: msg })),
      ...history.fileAttachments.map((file) => ({ type: 'file' as const, data: file })),
      ...history.demoAttachments.map((demo) => ({ type: 'demo' as const, data: demo })),
    ];

    // Sort by timestamp
    items.sort((a, b) => {
      const timestampA = a.type === 'message' ? a.data.timestamp : a.data.timestamp;
      const timestampB = b.type === 'message' ? b.data.timestamp : b.data.timestamp;
      return timestampA - timestampB;
    });

    return items;
  }, [history]);

  const locale = navigator?.language ?? 'en-US';

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

        {/* Content Area - Single unified timeline */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto max-w-4xl p-6">
              {timelineItems.length === 0 ? (
                <div className="text-muted-foreground flex items-center justify-center py-12 text-center">
                  <div>
                    <div className="mb-2 text-4xl">💬</div>
                    <p className="text-sm">No conversation history</p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {timelineItems.map((item, index) => {
                    if (item.type === 'message') {
                      const message = item.data;
                      const messageOrigin = message.from?.isLocal ? 'local' : 'remote';
                      const hasBeenEdited = !!message.editTimestamp;

                      // Find attachments that were sent close to this message (within 5 seconds)
                      const recentFiles =
                        messageOrigin === 'remote'
                          ? history.fileAttachments.filter(
                              (file) => Math.abs(file.timestamp - message.timestamp) < 5000
                            )
                          : [];
                      const recentDemos =
                        messageOrigin === 'remote'
                          ? history.demoAttachments.filter(
                              (demo) => Math.abs(demo.timestamp - message.timestamp) < 5000
                            )
                          : [];

                      const time = new Date(message.timestamp);
                      const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

                      return (
                        <li
                          key={`message-${message.id}`}
                          title={title}
                          data-lk-message-origin={messageOrigin}
                          className={cn('group flex w-full flex-col gap-0.5')}
                        >
                          <header
                            className={cn(
                              'text-muted-foreground flex items-center gap-2 text-sm',
                              messageOrigin === 'local' ? 'flex-row-reverse' : 'text-left'
                            )}
                          >
                            <span className="font-mono text-xs opacity-0 transition-opacity ease-linear group-hover:opacity-100">
                              {hasBeenEdited && '*'}
                              {time.toLocaleTimeString(locale, { timeStyle: 'short' })}
                            </span>
                          </header>
                          <div
                            className={cn(
                              'max-w-4/5 rounded-[20px]',
                              messageOrigin === 'local' ? 'bg-muted ml-auto p-2' : 'mr-auto'
                            )}
                          >
                            <span>{message.message}</span>
                            {/* Show attachments inline with the message */}
                            {recentFiles.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {recentFiles.map((file) => (
                                  <FileAttachment
                                    key={file.id}
                                    filename={file.filename}
                                    fileSize={file.fileSize}
                                    fileExtension={file.fileExtension}
                                    className="text-xs"
                                  />
                                ))}
                              </div>
                            )}
                            {recentDemos.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {recentDemos.map((demo) => (
                                  <div
                                    key={demo.id}
                                    className="border-border from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-primary/20 overflow-hidden rounded-lg border-2 bg-gradient-to-br p-4 transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="text-2xl">🎬</div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-primary font-semibold">
                                            Live Demo
                                          </span>
                                          <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                            DEMO
                                          </span>
                                        </div>
                                        <div className="text-muted-foreground mt-0.5 text-xs">
                                          Browser automation was performed
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    } else if (item.type === 'file') {
                      // Show standalone file attachments that weren't associated with a message
                      const file = item.data;
                      // Check if this file was already shown with a message
                      const wasShownWithMessage = history.messages.some(
                        (msg) =>
                          !msg.from?.isLocal && Math.abs(msg.timestamp - file.timestamp) < 5000
                      );

                      if (wasShownWithMessage) {
                        return null;
                      }

                      return (
                        <div key={`file-${file.id}`} className="ml-auto max-w-md">
                          <FileAttachment
                            filename={file.filename}
                            fileSize={file.fileSize}
                            fileExtension={file.fileExtension}
                          />
                        </div>
                      );
                    } else if (item.type === 'demo') {
                      // Show standalone demo attachments that weren't associated with a message
                      const demo = item.data;
                      // Check if this demo was already shown with a message
                      const wasShownWithMessage = history.messages.some(
                        (msg) =>
                          !msg.from?.isLocal && Math.abs(msg.timestamp - demo.timestamp) < 5000
                      );

                      if (wasShownWithMessage) {
                        return null;
                      }

                      return (
                        <div key={`demo-${demo.id}`} className="ml-auto max-w-md">
                          <div className="border-border from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-primary/20 overflow-hidden rounded-lg border-2 bg-gradient-to-br p-4 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">🎬</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-primary font-semibold">Live Demo</span>
                                  <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                    DEMO
                                  </span>
                                </div>
                                <div className="text-muted-foreground mt-0.5 text-xs">
                                  Browser automation was performed
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </ul>
              )}
            </div>
          </ScrollArea>
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

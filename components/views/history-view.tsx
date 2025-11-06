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

export type TimelineItem =
  | { type: 'message'; data: ReceivedChatMessage; timestamp: Date }
  | {
      type: 'file';
      data: {
        id: string;
        filename: string;
        fileSize: number;
        fileExtension: string;
      };
      timestamp: Date;
    }
  | {
      type: 'demo';
      data: {
        id: string;
        liveUrl: string;
      };
      timestamp: Date;
    };

export interface ConversationHistory {
  items: TimelineItem[];
}

interface HistoryViewProps {
  history: ConversationHistory;
  onStartNewCall: () => void;
}

export const HistoryView = ({ history, onStartNewCall }: HistoryViewProps) => {
  // Calculate which message each demo should be attached to (one-to-one mapping)
  const demoToMessageMap = useMemo(() => {
    const map = new Map<string, string>(); // demo.id -> message.id

    // Get all messages and demos from the unified array
    const messages = history.items.filter((item) => item.type === 'message') as Array<
      Extract<TimelineItem, { type: 'message' }>
    >;
    const demos = history.items.filter((item) => item.type === 'demo') as Array<
      Extract<TimelineItem, { type: 'demo' }>
    >;

    // First pass: Match demos to messages that mention demo keywords
    demos.forEach((demo) => {
      const matchingMessage = messages.find((msg) => {
        if (msg.data.from?.isLocal) return false;
        const msgLower = msg.data.message.toLowerCase();
        const mentionsDemo =
          msgLower.includes('demo') || msgLower.includes('showing') || msgLower.includes('browser');
        if (mentionsDemo) {
          const timeDiff = Math.abs(demo.timestamp.getTime() - msg.timestamp.getTime());
          return timeDiff < 15000;
        }
        return false;
      });

      if (matchingMessage) {
        map.set(demo.data.id, matchingMessage.data.id);
      }
    });

    // Second pass: Match remaining demos to closest messages
    demos.forEach((demo) => {
      if (map.has(demo.data.id)) return; // Already matched

      const closestMessage = messages
        .filter((msg) => !msg.data.from?.isLocal)
        .reduce(
          (closest, msg) => {
            if (!closest) return msg;
            const closestDiff = Math.abs(demo.timestamp.getTime() - closest.timestamp.getTime());
            const msgDiff = Math.abs(demo.timestamp.getTime() - msg.timestamp.getTime());
            return msgDiff < closestDiff && msgDiff < 10000 ? msg : closest;
          },
          null as Extract<TimelineItem, { type: 'message' }> | null
        );

      if (closestMessage) {
        map.set(demo.data.id, closestMessage.data.id);
      }
    });

    return map;
  }, [history]);

  // Calculate which message each file should be attached to (one-to-one mapping)
  const fileToMessageMap = useMemo(() => {
    const map = new Map<string, string>(); // file.id -> message.id

    // Get all messages and files from the unified array
    const messages = history.items.filter((item) => item.type === 'message') as Array<
      Extract<TimelineItem, { type: 'message' }>
    >;
    const files = history.items.filter((item) => item.type === 'file') as Array<
      Extract<TimelineItem, { type: 'file' }>
    >;

    // Match files to closest messages (within 10 seconds)
    files.forEach((file) => {
      const closestMessage = messages
        .filter((msg) => !msg.data.from?.isLocal)
        .reduce(
          (closest, msg) => {
            const msgDiff = Math.abs(file.timestamp.getTime() - msg.timestamp.getTime());
            if (msgDiff >= 10000) return closest; // Outside time window
            if (!closest) return msg;
            const closestDiff = Math.abs(file.timestamp.getTime() - closest.timestamp.getTime());
            return msgDiff < closestDiff ? msg : closest;
          },
          null as Extract<TimelineItem, { type: 'message' }> | null
        );

      if (closestMessage) {
        map.set(file.data.id, closestMessage.data.id);
      }
    });

    return map;
  }, [history]);

  // Timeline is already sorted, just use it directly
  const timelineItems = history.items;

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

                      // Find file attachments that are matched to this message (one-to-one mapping)
                      const recentFiles = timelineItems
                        .filter(
                          (i) =>
                            i.type === 'file' &&
                            messageOrigin === 'remote' &&
                            fileToMessageMap.get(i.data.id) === message.id
                        )
                        .map((i) => (i.type === 'file' ? i : null))
                        .filter((i): i is Extract<TimelineItem, { type: 'file' }> => i !== null);

                      // Find demo attachments that are matched to this message (one-to-one mapping)
                      const recentDemos = timelineItems
                        .filter(
                          (i) =>
                            i.type === 'demo' &&
                            messageOrigin === 'remote' &&
                            demoToMessageMap.get(i.data.id) === message.id
                        )
                        .map((i) => (i.type === 'demo' ? i : null))
                        .filter((i): i is Extract<TimelineItem, { type: 'demo' }> => i !== null);

                      const title = item.timestamp.toLocaleTimeString(locale, {
                        timeStyle: 'full',
                      });

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
                              {item.timestamp.toLocaleTimeString(locale, { timeStyle: 'short' })}
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
                                    key={file.data.id}
                                    filename={file.data.filename}
                                    fileSize={file.data.fileSize}
                                    fileExtension={file.data.fileExtension}
                                    className="text-xs"
                                  />
                                ))}
                              </div>
                            )}
                            {recentDemos.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {recentDemos.map((demo) => (
                                  <div
                                    key={demo.data.id}
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
                      // Check if this file was already matched to a message
                      if (fileToMessageMap.has(file.id)) {
                        return null;
                      }

                      return (
                        <div key={`file-${file.id}`} className="mr-auto max-w-md">
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
                      // Check if this demo was already matched to a message
                      if (demoToMessageMap.has(demo.id)) {
                        return null;
                      }

                      return (
                        <div key={`demo-${demo.id}`} className="mr-auto max-w-md">
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

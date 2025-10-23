'use client';

import { type ReceivedChatMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat-entry';

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedChatMessage[];
  className?: string;
}

export function ChatTranscript({ hidden = false, messages = [], className }: ChatTranscriptProps) {
  // Log messages when they change
  console.log('🎯 ChatTranscript rendering with messages:', messages);
  console.log('👁️ ChatTranscript hidden:', hidden);

  if (hidden) {
    return null;
  }

  return (
    <div className={className}>
      {messages.map(({ id, timestamp, from, message, editTimestamp }: ReceivedChatMessage) => {
        const locale = navigator?.language ?? 'en-US';
        const messageOrigin = from?.isLocal ? 'local' : 'remote';
        const hasBeenEdited = !!editTimestamp;

        // Log individual message details
        console.log('💬 Rendering message:', {
          id,
          timestamp,
          message,
          messageOrigin,
          hasBeenEdited,
          from: from?.identity,
        });

        return (
          <ChatEntry
            key={id}
            locale={locale}
            timestamp={timestamp}
            message={message}
            messageOrigin={messageOrigin}
            hasBeenEdited={hasBeenEdited}
          />
        );
      })}
    </div>
  );
}

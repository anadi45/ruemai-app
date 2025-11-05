'use client';

import { useMemo } from 'react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/features/chat/chat-entry';
import { useDemoAttachments } from '@/hooks/useDemoAttachments';
import { useFileAttachments } from '@/hooks/useFileAttachments';

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedChatMessage[];
  className?: string;
}

export function ChatTranscript({ hidden = false, messages = [], className }: ChatTranscriptProps) {
  const { attachments } = useFileAttachments();
  const { demos } = useDemoAttachments();

  // Calculate which message each file should be attached to (one-to-one mapping)
  const fileToMessageMap = useMemo(() => {
    const map = new Map<string, string>(); // file.id -> message.id

    const remoteMessages = messages.filter((msg) => !msg.from?.isLocal);

    // Match files to closest messages (within 10 seconds)
    attachments.forEach((file) => {
      const closestMessage = remoteMessages.reduce(
        (closest, msg) => {
          const msgDiff = Math.abs(file.timestamp - msg.timestamp);
          if (msgDiff >= 10000) return closest; // Outside time window
          if (!closest) return msg;
          const closestDiff = Math.abs(file.timestamp - closest.timestamp);
          return msgDiff < closestDiff ? msg : closest;
        },
        null as ReceivedChatMessage | null
      );

      if (closestMessage) {
        map.set(file.id, closestMessage.id);
      }
    });

    return map;
  }, [messages, attachments]);

  // Calculate which message each demo should be attached to (one-to-one mapping)
  const demoToMessageMap = useMemo(() => {
    const map = new Map<string, string>(); // demo.id -> message.id

    const remoteMessages = messages.filter((msg) => !msg.from?.isLocal);

    // First pass: Match demos to messages that mention demo keywords
    demos.forEach((demo) => {
      const matchingMessage = remoteMessages.find((msg) => {
        const msgLower = msg.message.toLowerCase();
        const mentionsDemo =
          msgLower.includes('demo') || msgLower.includes('showing') || msgLower.includes('browser');
        if (mentionsDemo) {
          const timeDiff = Math.abs(demo.timestamp - msg.timestamp);
          return timeDiff < 15000;
        }
        return false;
      });

      if (matchingMessage) {
        map.set(demo.id, matchingMessage.id);
      }
    });

    // Second pass: Match remaining demos to closest messages
    demos.forEach((demo) => {
      if (map.has(demo.id)) return; // Already matched

      const closestMessage = remoteMessages.reduce(
        (closest, msg) => {
          if (!closest) return msg;
          const closestDiff = Math.abs(demo.timestamp - closest.timestamp);
          const msgDiff = Math.abs(demo.timestamp - msg.timestamp);
          return msgDiff < closestDiff && msgDiff < 10000 ? msg : closest;
        },
        null as ReceivedChatMessage | null
      );

      if (closestMessage) {
        map.set(demo.id, closestMessage.id);
      }
    });

    return map;
  }, [messages, demos]);

  if (hidden) {
    return null;
  }

  return (
    <div className={className}>
      {messages.map(({ id, timestamp, from, message, editTimestamp }: ReceivedChatMessage) => {
        const locale = navigator?.language ?? 'en-US';
        const messageOrigin = from?.isLocal ? 'local' : 'remote';
        const hasBeenEdited = !!editTimestamp;

        return (
          <ChatEntry
            key={id}
            locale={locale}
            timestamp={timestamp}
            message={message}
            messageOrigin={messageOrigin}
            hasBeenEdited={hasBeenEdited}
            messageId={id}
            fileToMessageMap={fileToMessageMap}
            demoToMessageMap={demoToMessageMap}
          />
        );
      })}
    </div>
  );
}

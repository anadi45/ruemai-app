'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
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

  // Stable bindings - once an attachment is bound to a message, it stays bound
  const fileBindingsRef = useRef<Map<string, string>>(new Map());
  const demoBindingsRef = useRef<Map<string, string>>(new Map());
  const [bindingsVersion, setBindingsVersion] = useState(0);

  // Get all agent (remote) and user (local) messages, sorted by timestamp
  const agentMessages = useMemo(() => {
    return messages
      .filter((msg) => !msg.from?.isLocal)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  const userMessages = useMemo(() => {
    return messages
      .filter((msg) => msg.from?.isLocal)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  // Update bindings for new attachments that haven't been bound yet
  useEffect(() => {
    if (agentMessages.length === 0 || userMessages.length === 0) return;

    const latestUserMessage = userMessages[userMessages.length - 1];
    
    // Find the latest agent message that comes after the latest user message
    const agentMessagesAfterUser = agentMessages.filter(
      (msg) => msg.timestamp > latestUserMessage.timestamp
    );

    if (agentMessagesAfterUser.length === 0) return;

    const latestAgentMessageAfterUser = agentMessagesAfterUser[agentMessagesAfterUser.length - 1];

    let bindingsUpdated = false;

    // Bind new file attachments that haven't been bound yet
    attachments.forEach((file) => {
      if (!fileBindingsRef.current.has(file.id)) {
        fileBindingsRef.current.set(file.id, latestAgentMessageAfterUser.id);
        bindingsUpdated = true;
      }
    });

    // Bind new demos that haven't been bound yet
    demos.forEach((demo) => {
      if (!demoBindingsRef.current.has(demo.id)) {
        demoBindingsRef.current.set(demo.id, latestAgentMessageAfterUser.id);
        bindingsUpdated = true;
      }
    });

    // Trigger re-render if bindings were updated
    if (bindingsUpdated) {
      setBindingsVersion((v) => v + 1);
    }
  }, [agentMessages, userMessages, attachments, demos]);

  // Convert refs to maps for rendering
  const fileToMessageMap = useMemo(() => {
    return new Map(fileBindingsRef.current);
  }, [attachments, agentMessages, userMessages, bindingsVersion]);

  const demoToMessageMap = useMemo(() => {
    return new Map(demoBindingsRef.current);
  }, [demos, agentMessages, userMessages, bindingsVersion]);

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

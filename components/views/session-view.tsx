'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useChat } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/features/agent-control-bar/agent-control-bar';
import { DemoAttachment } from '@/components/features/attachments/demo-attachment';
import { ChatInput } from '@/components/features/chat/chat-input';
import { ChatTranscript } from '@/components/features/chat/chat-transcript';
import { PreConnectMessage } from '@/components/features/chat/preconnect-message';
import { CameraPreview } from '@/components/features/media/camera-preview';
import { TileLayout } from '@/components/features/media/tile-layout';
import { ScrollArea } from '@/components/ui/scroll-area/scroll-area';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { useDemoAttachments } from '@/hooks/useDemoAttachments';
import { cn } from '@/lib/utils';

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  const messages = useChatMessages();
  const { send } = useChat();
  const { demos } = useDemoAttachments();

  // Get the latest demo URL
  const latestDemo = demos.length > 0 ? demos[demos.length - 1] : null;

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsVideoInput,
  };

  return (
    <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Camera Preview - Top Left */}
      <CameraPreview />

      {/* Main Layout - Two Column */}
      <div className="flex h-[calc(100vh-180px)]">
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
                  <ChatTranscript hidden={false} messages={messages} className="space-y-3" />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Right Side - Video Tiles or Demo */}
        <div className="relative flex-1 overflow-hidden">
          {latestDemo ? (
            <DemoAttachment
              liveUrl={latestDemo.liveUrl}
              className="h-full w-full rounded-none border-0"
              fullScreen
            />
          ) : (
            <TileLayout chatOpen={false} hasActiveDemo={!!latestDemo} />
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <MotionBottom
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {appConfig.isPreConnectBufferEnabled && (
          <PreConnectMessage messages={messages} className="pb-4" />
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />

          {/* Text Input - Always Visible */}
          <div className="mb-4">
            <ChatInput chatOpen={true} isAgentAvailable={true} onSend={send} />
          </div>

          <AgentControlBar controls={controls} />
        </div>
      </MotionBottom>
    </section>
  );
};

'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRoomContext } from '@livekit/components-react';
import { useSession } from '@/components/providers/session-provider';
import { HistoryView } from '@/components/views/history-view';
import { SessionView } from '@/components/views/session-view';
import { WelcomeView } from '@/components/views/welcome-view';
import { useDemoAttachments } from '@/hooks/useDemoAttachments';
import { useFileAttachments } from '@/hooks/useFileAttachments';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(SessionView);
const MotionHistoryView = motion.create(HistoryView);

const VIEW_MOTION_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.5,
  },
};

export function ViewController() {
  const room = useRoomContext();
  const isSessionActiveRef = useRef(false);
  const { appConfig, isSessionActive, startSession, conversationHistory, clearHistory } =
    useSession();
  const { clearAttachments } = useFileAttachments();
  const { clearDemos } = useDemoAttachments();

  // animation handler holds a reference to stale isSessionActive value
  isSessionActiveRef.current = isSessionActive;

  // disconnect room after animation completes
  const handleAnimationComplete = () => {
    if (!isSessionActiveRef.current && room.state !== 'disconnected') {
      room.disconnect();
    }
  };

  const handleStartNewCall = () => {
    clearHistory();
    clearAttachments();
    clearDemos();
    startSession();
  };

  return (
    <AnimatePresence mode="wait">
      {/* Session view - highest priority */}
      {isSessionActive && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          appConfig={appConfig}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
      {/* History view - shown when session ends and there's history */}
      {!isSessionActive && conversationHistory && (
        <MotionHistoryView
          key="history-view"
          {...VIEW_MOTION_PROPS}
          history={conversationHistory}
          onStartNewCall={handleStartNewCall}
        />
      )}
      {/* Welcome screen - shown when no session and no history */}
      {!isSessionActive && !conversationHistory && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={startSession}
        />
      )}
    </AnimatePresence>
  );
}

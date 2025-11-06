'use client';

import { type HTMLAttributes, useCallback } from 'react';
import { Track } from 'livekit-client';
import { PhoneDisconnectIcon } from '@phosphor-icons/react/dist/ssr';
import { TrackToggle } from '@/components/features/agent-control-bar/track-toggle';
import { useSession } from '@/components/providers/session-provider';
import { Button } from '@/components/ui/button';
import type { ConversationHistory } from '@/components/views/history-view';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useDemoAttachments } from '@/hooks/useDemoAttachments';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import { cn } from '@/lib/utils';
import { UseInputControlsProps, useInputControls } from './hooks/use-input-controls';
import { usePublishPermissions } from './hooks/use-publish-permissions';
import { TrackSelector } from './track-selector';

export interface ControlBarControls {
  leave?: boolean;
  camera?: boolean;
  microphone?: boolean;
  screenShare?: boolean;
  chat?: boolean;
}

export interface AgentControlBarProps extends UseInputControlsProps {
  controls?: ControlBarControls;
  onDisconnect?: () => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

/**
 * A control bar specifically designed for voice assistant interfaces
 */
export function AgentControlBar({
  controls,
  saveUserChoices = true,
  className,
  onDisconnect,
  onDeviceError,
  ...props
}: AgentControlBarProps & HTMLAttributes<HTMLDivElement>) {
  const publishPermissions = usePublishPermissions();
  const { isSessionActive, endSession, saveHistory } = useSession();
  const messages = useChatMessages();
  const { attachments } = useFileAttachments();
  const { demos } = useDemoAttachments();

  const {
    micTrackRef,
    cameraToggle,
    microphoneToggle,
    screenShareToggle,
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  } = useInputControls({ onDeviceError, saveUserChoices });

  const handleDisconnect = useCallback(async () => {
    // Capture conversation history before ending session - build unified timeline array
    const items: ConversationHistory['items'] = [
      // Add all messages
      ...messages.map((msg) => ({
        type: 'message' as const,
        data: msg,
        timestamp: new Date(msg.timestamp),
      })),
      // Add all file attachments
      ...attachments.map((file) => ({
        type: 'file' as const,
        data: {
          id: file.id,
          filename: file.filename,
          fileSize: file.fileSize,
          fileExtension: file.fileExtension,
        },
        timestamp: new Date(file.timestamp),
      })),
      // Add all demo attachments
      ...demos.map((demo) => ({
        type: 'demo' as const,
        data: {
          id: demo.id,
          liveUrl: demo.liveUrl,
        },
        timestamp: new Date(demo.timestamp),
      })),
    ];

    // Sort by timestamp
    items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const history: ConversationHistory = {
      items,
    };
    saveHistory(history);

    endSession();
    onDisconnect?.();
  }, [endSession, onDisconnect, messages, attachments, demos, saveHistory]);

  const visibleControls = {
    leave: controls?.leave ?? true,
    microphone: controls?.microphone ?? publishPermissions.microphone,
    screenShare: controls?.screenShare ?? publishPermissions.screenShare,
    camera: controls?.camera ?? publishPermissions.camera,
    chat: controls?.chat ?? publishPermissions.data,
  };

  return (
    <div
      aria-label="Voice assistant controls"
      className={cn(
        'bg-background border-input/50 dark:border-muted flex flex-col rounded-[31px] border p-3 drop-shadow-md/3',
        className
      )}
      {...props}
    >
      <div className="flex gap-1">
        <div className="flex grow gap-1">
          {/* Toggle Microphone */}
          {visibleControls.microphone && (
            <TrackSelector
              kind="audioinput"
              aria-label="Toggle microphone"
              source={Track.Source.Microphone}
              pressed={microphoneToggle.enabled}
              disabled={microphoneToggle.pending}
              audioTrackRef={micTrackRef}
              onPressedChange={microphoneToggle.toggle}
              onMediaDeviceError={handleMicrophoneDeviceSelectError}
              onActiveDeviceChange={handleAudioDeviceChange}
            />
          )}

          {/* Toggle Camera */}
          {visibleControls.camera && (
            <TrackSelector
              kind="videoinput"
              aria-label="Toggle camera"
              source={Track.Source.Camera}
              pressed={cameraToggle.enabled}
              pending={cameraToggle.pending}
              disabled={cameraToggle.pending}
              onPressedChange={cameraToggle.toggle}
              onMediaDeviceError={handleCameraDeviceSelectError}
              onActiveDeviceChange={handleVideoDeviceChange}
            />
          )}

          {/* Toggle Screen Share */}
          {visibleControls.screenShare && (
            <TrackToggle
              size="icon"
              variant="secondary"
              aria-label="Toggle screen share"
              source={Track.Source.ScreenShare}
              pressed={screenShareToggle.enabled}
              disabled={screenShareToggle.pending}
              onPressedChange={screenShareToggle.toggle}
            />
          )}
        </div>

        {/* Disconnect */}
        {visibleControls.leave && (
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={!isSessionActive}
            className="font-mono"
          >
            <PhoneDisconnectIcon weight="bold" />
            <span className="hidden md:inline">END CALL</span>
            <span className="inline md:hidden">END</span>
          </Button>
        )}
      </div>
    </div>
  );
}

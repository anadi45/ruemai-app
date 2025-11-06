'use client';

import React from 'react';
import { Track } from 'livekit-client';
import { VideoTrack, useLocalParticipant } from '@livekit/components-react';
import { cn } from '@/lib/utils';

interface CameraPreviewProps {
  className?: string;
}

export function CameraPreview({ className }: CameraPreviewProps) {
  const { localParticipant } = useLocalParticipant();
  const cameraPublication = localParticipant.getTrackPublication(Track.Source.Camera);

  // Only show if camera is enabled and not muted
  const isCameraEnabled = cameraPublication && !cameraPublication.isMuted;

  if (!isCameraEnabled) {
    return null;
  }

  const trackRef = {
    source: Track.Source.Camera,
    participant: localParticipant,
    publication: cameraPublication,
  };

  return (
    <div
      className={cn(
        'fixed top-4 left-4 z-50',
        'h-24 w-32 overflow-hidden rounded-lg',
        'border-2 border-white/20 shadow-lg',
        'bg-black/10 backdrop-blur-sm',
        className
      )}
    >
      <VideoTrack trackRef={trackRef} className="h-full w-full object-cover" />
    </div>
  );
}

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DemoAttachmentProps {
  liveUrl: string;
  className?: string;
  fullScreen?: boolean;
}

export const DemoAttachment = ({
  liveUrl,
  className,
  fullScreen = false,
  ...props
}: DemoAttachmentProps & React.HTMLAttributes<HTMLDivElement>) => {
  if (fullScreen) {
    return (
      <div className={cn('bg-background h-full w-full overflow-hidden', className)} {...props}>
        <iframe
          src={liveUrl}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Live Demo Browser Automation"
        />
      </div>
    );
  }

  return (
    <div
      className={cn('border-border bg-muted/50 overflow-hidden rounded-lg border', className)}
      {...props}
    >
      <div className="bg-muted/70 border-border border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="text-xl">🎬</div>
          <div className="flex-1">
            <div className="text-sm font-medium">Live Demo</div>
            <div className="text-muted-foreground text-xs">Browser automation in progress</div>
          </div>
        </div>
      </div>
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={liveUrl}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Live Demo Browser Automation"
        />
      </div>
    </div>
  );
};

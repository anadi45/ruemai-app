'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DemoAttachmentProps {
  liveUrl: string;
  className?: string;
}

export const DemoAttachment = ({
  liveUrl,
  className,
  ...props
}: DemoAttachmentProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'border-border bg-muted/50 rounded-lg border overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="bg-muted/70 px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="text-xl">🎬</div>
          <div className="flex-1">
            <div className="font-medium text-sm">Live Demo</div>
            <div className="text-muted-foreground text-xs">Browser automation in progress</div>
          </div>
        </div>
      </div>
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={liveUrl}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Live Demo Browser Automation"
        />
      </div>
    </div>
  );
};


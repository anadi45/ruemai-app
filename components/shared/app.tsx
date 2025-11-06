'use client';

import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { SessionProvider } from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/toaster';
import { ViewController } from '@/components/views/view-controller';
import { DemoAttachmentProvider } from '@/hooks/useDemoAttachments';
import { FileAttachmentProvider } from '@/hooks/useFileAttachments';

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  return (
    <FileAttachmentProvider>
      <DemoAttachmentProvider>
        <SessionProvider appConfig={appConfig}>
          <main className="grid h-svh grid-cols-1">
            <ViewController />
          </main>
          <StartAudio label="Start Audio" />
          <RoomAudioRenderer />
          <Toaster />
        </SessionProvider>
      </DemoAttachmentProvider>
    </FileAttachmentProvider>
  );
}

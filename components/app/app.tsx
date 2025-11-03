'use client';

import { RoomAudioRenderer, StartAudio } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { SessionProvider } from '@/components/app/session-provider';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { FileAttachmentProvider } from '@/hooks/useFileAttachments';
import { DemoAttachmentProvider } from '@/hooks/useDemoAttachments';

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  return (
    <FileAttachmentProvider>
      <DemoAttachmentProvider>
        <SessionProvider appConfig={appConfig}>
          <main className="grid h-svh grid-cols-1 place-content-center">
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

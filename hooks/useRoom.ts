import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, TokenSource, RpcError, RpcInvocationData } from 'livekit-client';
import { AppConfig } from '@/app-config';
import { toastAlert } from '@/components/livekit/alert-toast';
import { useFileAttachments } from './useFileAttachments';
import { useDemoAttachments } from './useDemoAttachments';

export function useRoom(appConfig: AppConfig) {
  const aborted = useRef(false);
  const room = useMemo(() => new Room(), []);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { addFileAttachment } = useFileAttachments();
  const { addDemoAttachment } = useDemoAttachments();

  useEffect(() => {
    function onDisconnected() {
      setIsSessionActive(false);
    }

    function onMediaDevicesError(error: Error) {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    }

    // Register RPC method for getting user location
    function registerRpcMethods() {
      room.registerRpcMethod(
        'getUserLocation',
        async (data: RpcInvocationData) => {
          try {
            let params = JSON.parse(data.payload);
            const position: GeolocationPosition = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: params.highAccuracy ?? false,
                timeout: data.responseTimeout,
              });
            });

            return JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } catch (error) {
            throw new RpcError(1, "Could not retrieve user location");
          }
        }
      );

      // Register RPC method for file attachments
      room.registerRpcMethod(
        'attachFile',
        async (data: RpcInvocationData) => {
          try {
            const fileInfo = JSON.parse(data.payload);
            console.log('📎 File attachment received:', fileInfo);
            
            // Add file attachment to context
            addFileAttachment({
              filename: fileInfo.filename,
              fileSize: fileInfo.fileSize,
              fileExtension: fileInfo.fileExtension,
              filePath: fileInfo.filePath,
              contentPreview: fileInfo.contentPreview,
            });
            
            return JSON.stringify({ success: true });
          } catch (error) {
            throw new RpcError(1, "Could not process file attachment");
          }
        }
      );

      // Register RPC method for demo attachments
      room.registerRpcMethod(
        'demo',
        async (data: RpcInvocationData) => {
          try {
            const demoInfo = JSON.parse(data.payload);
            console.log('🎬 Demo attachment received:', demoInfo);
            
            // Add demo attachment to context
            addDemoAttachment({
              liveUrl: demoInfo.liveUrl,
            });
            
            return JSON.stringify({ success: true });
          } catch (error) {
            throw new RpcError(1, "Could not process demo attachment");
          }
        }
      );
    }

    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    
    // Register RPC methods when room is ready
    room.on(RoomEvent.Connected, registerRpcMethods);

    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
      room.off(RoomEvent.Connected, registerRpcMethods);
    };
  }, [room, addFileAttachment, addDemoAttachment]);

  useEffect(() => {
    return () => {
      aborted.current = true;
      room.disconnect();
    };
  }, [room]);

  const tokenSource = useMemo(
    () =>
      TokenSource.custom(async () => {
        const url = new URL(
          process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
          window.location.origin
        );

        try {
          const res = await fetch(url.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sandbox-Id': appConfig.sandboxId ?? '',
            },
            body: JSON.stringify({
              room_config: appConfig.agentName
                ? {
                    agents: [{ agent_name: appConfig.agentName }],
                  }
                : undefined,
            }),
          });
          return await res.json();
        } catch (error) {
          console.error('Error fetching connection details:', error);
          throw new Error('Error fetching connection details!');
        }
      }),
    [appConfig]
  );

  const startSession = useCallback(() => {
    setIsSessionActive(true);

    if (room.state === 'disconnected') {
      const { isPreConnectBufferEnabled } = appConfig;
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: isPreConnectBufferEnabled,
        }),
        tokenSource
          .fetch({ agentName: appConfig.agentName })
          .then((connectionDetails) =>
            room.connect(connectionDetails.serverUrl, connectionDetails.participantToken)
          ),
      ]).catch((error) => {
        if (aborted.current) {
          // Once the effect has cleaned up after itself, drop any errors
          //
          // These errors are likely caused by this effect rerunning rapidly,
          // resulting in a previous run `disconnect` running in parallel with
          // a current run `connect`
          return;
        }

        toastAlert({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      });
    }
  }, [room, appConfig, tokenSource]);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
  }, []);

  return { room, isSessionActive, startSession, endSession };
}

import * as React from 'react';
import { DemoAttachment } from '@/components/features/attachments/demo-attachment';
import { FileAttachment } from '@/components/features/attachments/file-attachment';
import { useDemoAttachments } from '@/hooks/useDemoAttachments';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import { cn } from '@/lib/utils';

export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The locale to use for the timestamp. */
  locale: string;
  /** The timestamp of the message. */
  timestamp: number;
  /** The message to display. */
  message: string;
  /** The origin of the message. */
  messageOrigin: 'local' | 'remote';
  /** The sender's name. */
  name?: string;
  /** Whether the message has been edited. */
  hasBeenEdited?: boolean;
}

export const ChatEntry = ({
  name,
  locale,
  timestamp,
  message,
  messageOrigin,
  hasBeenEdited = false,
  className,
  ...props
}: ChatEntryProps) => {
  const time = new Date(timestamp);
  const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });
  const { attachments } = useFileAttachments();
  const { demos } = useDemoAttachments();

  // Find recent attachments (within last 10 seconds of this message)
  // Only show attachments for agent messages (remote), not user messages (local)
  const recentAttachments =
    messageOrigin === 'remote'
      ? attachments.filter((attachment) => Math.abs(attachment.timestamp - timestamp) < 10000)
      : [];

  // Find recent demo attachments (within last 30 seconds of this message, or if message mentions demo)
  // Only show demo attachments for agent messages (remote), not user messages (local)
  const messageLower = message.toLowerCase();
  const mentionsDemo = messageLower.includes('demo') || messageLower.includes('showing');
  const recentDemos =
    messageOrigin === 'remote'
      ? demos.filter((demo) => {
          const timeDiff = Math.abs(demo.timestamp - timestamp);
          // Match if within 30 seconds OR if message mentions demo and demo was added within 60 seconds
          return timeDiff < 30000 || (mentionsDemo && timeDiff < 60000);
        })
      : [];

  return (
    <li
      title={title}
      data-lk-message-origin={messageOrigin}
      className={cn('group flex w-full flex-col gap-0.5', className)}
      {...props}
    >
      <header
        className={cn(
          'text-muted-foreground flex items-center gap-2 text-sm',
          messageOrigin === 'local' ? 'flex-row-reverse' : 'text-left'
        )}
      >
        {name && <strong>{name}</strong>}
        <span className="font-mono text-xs opacity-0 transition-opacity ease-linear group-hover:opacity-100">
          {hasBeenEdited && '*'}
          {time.toLocaleTimeString(locale, { timeStyle: 'short' })}
        </span>
      </header>
      <div
        className={cn(
          'max-w-4/5 rounded-[20px]',
          messageOrigin === 'local' ? 'bg-muted ml-auto p-2' : 'mr-auto'
        )}
      >
        <span>{message}</span>
        {recentAttachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {recentAttachments.map((attachment) => (
              <FileAttachment
                key={attachment.id}
                filename={attachment.filename}
                fileSize={attachment.fileSize}
                fileExtension={attachment.fileExtension}
                className="text-xs"
              />
            ))}
          </div>
        )}
        {recentDemos.length > 0 && (
          <div className="mt-2 space-y-2">
            {recentDemos.map((demo) => (
              <DemoAttachment key={demo.id} liveUrl={demo.liveUrl} className="text-xs" />
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

import * as React from 'react';
import { cn } from '@/lib/utils';
import { FileAttachment } from './file-attachment';
import { DemoAttachment } from './demo-attachment';
import { useFileAttachments } from '@/hooks/useFileAttachments';
import { useDemoAttachments } from '@/hooks/useDemoAttachments';

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
  
  // Find recent attachments (within last 5 seconds of this message)
  const recentAttachments = attachments.filter(attachment => 
    Math.abs(attachment.timestamp - timestamp) < 5000
  );
  
  // Find recent demo attachments (within last 5 seconds of this message)
  const recentDemos = demos.filter(demo => 
    Math.abs(demo.timestamp - timestamp) < 5000
  );

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
                contentPreview={attachment.contentPreview}
                className="text-xs"
              />
            ))}
          </div>
        )}
        {recentDemos.length > 0 && (
          <div className="mt-2 space-y-2">
            {recentDemos.map((demo) => (
              <DemoAttachment
                key={demo.id}
                liveUrl={demo.liveUrl}
                className="text-xs"
              />
            ))}
          </div>
        )}
      </div>
    </li>
  );
};

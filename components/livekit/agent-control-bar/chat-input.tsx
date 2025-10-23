import { useEffect, useRef, useState } from 'react';
import { PaperPlaneRightIcon, SpinnerIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/livekit/button';

// Removed motion props for persistent input

interface ChatInputProps {
  chatOpen: boolean;
  isAgentAvailable?: boolean;
  onSend?: (message: string) => void;
}

export function ChatInput({
  chatOpen,
  isAgentAvailable = false,
  onSend = async () => {},
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSending(true);
      await onSend(message);
      setMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const isDisabled = isSending || !isAgentAvailable || message.trim().length === 0;

  useEffect(() => {
    if (chatOpen && isAgentAvailable) return;
    // when not disabled refocus on input
    inputRef.current?.focus();
  }, [chatOpen, isAgentAvailable]);

  return (
    <div className="flex w-full items-start">
      <form
        onSubmit={handleSubmit}
        className="flex grow items-end gap-2 rounded-md text-sm"
      >
        <input
          autoFocus
          ref={inputRef}
          type="text"
          value={message}
          disabled={!isAgentAvailable}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          className="h-8 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          size="icon"
          type="submit"
          disabled={isDisabled}
          variant={isDisabled ? 'secondary' : 'primary'}
          title={isSending ? 'Sending...' : 'Send'}
          className="h-8 w-8"
        >
          {isSending ? (
            <SpinnerIcon className="animate-spin" weight="bold" />
          ) : (
            <PaperPlaneRightIcon weight="bold" />
          )}
        </Button>
      </form>
    </div>
  );
}

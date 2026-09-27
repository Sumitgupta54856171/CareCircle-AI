import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    onSendMessage(text.trim());
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-[#0D9488]/20 dark:border-slate-800 dark:bg-slate-900"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask anything about meds, tasks, recovery, or feelings..."
        disabled={isLoading}
        className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 disabled:opacity-50"
      />

      <Button
        type="submit"
        variant="teal"
        size="icon"
        disabled={!text.trim() || isLoading}
        className="h-9 w-9 rounded-xl shrink-0 cursor-pointer shadow-xs disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

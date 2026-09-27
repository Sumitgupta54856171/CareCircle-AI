import { Sparkles, User } from 'lucide-react';

interface ChatBubbleProps {
  message: {
    _id?: string;
    senderType: 'user' | 'ai' | 'system';
    senderName?: string;
    message: string;
    createdAt?: string;
  };
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAI = message.senderType === 'ai';
  const isUser = message.senderType === 'user';

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isAI && !isUser) {
    // System message
    return (
      <div className="flex justify-center my-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {message.message}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 my-3 animate-in fade-in duration-200 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs ${
          isAI
            ? 'bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-[#0D9488]/20'
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
        }`}
      >
        {isAI ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Bubble Content */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed shadow-xs ${
          isUser
            ? 'bg-[#0D9488] text-white rounded-tr-xs'
            : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100'
        }`}
      >
        {/* Header inside bubble */}
        <div
          className={`flex items-center justify-between gap-3 text-[11px] font-semibold mb-1 ${
            isUser ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span>{isAI ? 'CareCircle Co-Pilot' : 'You'}</span>
          {message.createdAt && (
            <span className="text-[10px] font-normal tabular-nums">
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>

        {/* Message body (preserves formatting and bullet points) */}
        <div className="whitespace-pre-wrap break-words font-normal">
          {message.message}
        </div>
      </div>
    </div>
  );
}

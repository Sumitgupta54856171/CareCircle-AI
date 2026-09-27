import { useEffect, useRef } from 'react';
import { ChatBubble } from '../components/chat/ChatBubble';
import { SuggestionChips } from '../components/chat/SuggestionChips';
import { ChatInput } from '../components/chat/ChatInput';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { Sparkles, Bot } from 'lucide-react';

interface ChatPageProps {
  user?: {
    fullName: string;
    email: string;
    role: 'patient' | 'caregiver';
  };
  circle?: {
    patientId?: {
      fullName: string;
      conditions: string[];
    };
  };
}

export function ChatPage({ user: propUser, circle: propCircle }: ChatPageProps) {
  const { user: authUser, circle: authCircle } = useAuth();
  const { messages, isLoading, sendMessage, isSending } = useChat();

  const user = propUser || authUser || { fullName: 'User', email: '', role: 'patient' as const };
  const circle = propCircle || authCircle;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const patientName = circle?.patientId?.fullName || (user.role === 'patient' ? user.fullName : 'the patient');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;
    try {
      await sendMessage(text.trim());
    } catch (err: any) {
      alert(err.message || 'Failed to send message to AI Co-Pilot.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] max-w-4xl mx-auto space-y-3">
      {/* Chat Header Card */}
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-xs shrink-0">
        <CardHeader className="py-3 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    CareCircle AI Co-Pilot
                  </h2>
                  <Badge variant="teal" className="text-[10px] py-0 px-1.5 font-bold">
                    Clinical Co-Pilot
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Context-aware support for {patientName} & Care Circle
                </p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                Online & Ready
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Scroll Area */}
      <Card className="flex-1 overflow-hidden border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1">
          {isLoading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0D9488] border-t-transparent" />
                <p className="text-xs text-slate-500 font-medium">Connecting to AI Co-Pilot...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bot className="h-10 w-10 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Start a conversation with your AI Co-Pilot
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Ask about medication timing, condition management, or general caregiving advice.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatBubble key={msg._id || index} message={msg} />
            ))
          )}

          {/* Typing Indicator while waiting for AI */}
          {isSending && (
            <div className="flex items-center gap-2.5 my-2 animate-in fade-in duration-150">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0D9488] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 rounded-full bg-[#0D9488] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 rounded-full bg-[#0D9488] animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggestion Chips & Input Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2 shrink-0">
          <SuggestionChips
            role={user.role}
            patientName={patientName}
            onSelectChip={handleSendMessage}
            disabled={isSending}
          />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isSending} />
        </div>
      </Card>
    </div>
  );
}

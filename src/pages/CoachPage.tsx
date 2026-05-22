import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Trash2, ThumbsUp, ThumbsDown, Copy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loadState, getToday, getTodayWorkoutType } from "@/lib/store";
import { askCoach } from "@/lib/coach";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down';
  timestamp: number;
}

const STORAGE_KEY = 'transform90_coach_messages';

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveMessages(msgs: Message[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
}

function getSuggestionChips(state: any): string[] {
  const today = getToday();
  const todayType = getTodayWorkoutType(state);
  
  if (todayType === 'Rest') {
    return ['How do I recover faster?', 'Is my progress normal?', 'I feel like giving up', 'Yoga for rest days?'];
  }
  return ['How do I push harder today?', 'My form feels off', "I'm feeling tired — should I train?", 'Quick healthy meal ideas?'];
}

export default function CoachPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const state = loadState();
  const coachName = (state.settings as any).coachName || 'Coach Max';
  const chips = getSuggestionChips(state);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: text.trim(), 
      timestamp: Date.now() 
    };
    
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    saveMessages(updatedWithUser);
    setInput('');
    setIsStreaming(true);

    try {
      const history = updatedWithUser.slice(-6).map(m => ({ 
        role: m.role, 
        content: m.content 
      }));
      
      const response = await askCoach(text.trim(), history);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedWithUser, assistantMsg];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } catch (e: any) {
      console.error('Coach error:', e);
      toast.error(e.message || 'Could not reach coach');
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming]);

  const setFeedback = (msgId: string, fb: 'up' | 'down') => {
    setMessages(prev => {
      const next = prev.map(m => m.id === msgId ? { ...m, feedback: fb } : m);
      saveMessages(next);
      return next;
    });
  };

  const clearChat = () => {
    setMessages([]);
    saveMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary/60 btn-press">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">{coachName}</p>
              <p className="text-[11px] text-primary font-medium tracking-wide">Autonomous AI Coach</p>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-lg hover:bg-secondary/60">
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 shadow-lg shadow-primary/5">
              <span className="text-3xl">🤖</span>
            </div>
            <p className="font-bold text-lg">{coachName} is ready.</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              I analyze your recovery, sleep, and performance to give you the best advice.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[85%]">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words overflow-visible ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md shadow-md'
                    : 'bg-card border border-border/40 rounded-bl-md shadow-sm'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="max-w-none leading-relaxed overflow-visible text-sm italic-markdown">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : <p className="whitespace-pre-wrap">{msg.content}</p>}
                </div>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1 ml-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => setFeedback(msg.id, 'up')} className={`p-1 rounded hover:bg-secondary/60 ${msg.feedback === 'up' ? 'text-primary' : ''}`}>
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => setFeedback(msg.id, 'down')} className={`p-1 rounded hover:bg-secondary/60 ${msg.feedback === 'down' ? 'text-destructive' : ''}`}>
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <div className="px-4 pb-2 flex flex-wrap gap-2 overflow-x-auto no-scrollbar py-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => sendMessage(chip)}
            disabled={isStreaming}
            className="text-[11px] whitespace-nowrap px-3 py-2 rounded-full bg-secondary/30 border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all btn-press disabled:opacity-40"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/30 bg-card/80 backdrop-blur-md safe-area-pb">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={isStreaming ? "Coach is thinking..." : "Ask Max for advice..."}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-secondary/40 border border-border/30 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40 disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="p-3 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 btn-press shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import aiChatApi from '@/services/aiChatApi';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_SUGGESTIONS = [
  'Tuần này nhân viên nào có ít ca nhất?',
  'Sản phẩm nào đang tồn thấp?',
  'Hướng dẫn tạo đơn nhập hàng',
];

export function ChatWidget() {
  const location = useLocation();
  const { user, role } = useAuth();
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào, mình là AI Copilot của hệ thống siêu thị. Bạn có thể hỏi về nhân viên, lịch ca, sản phẩm tồn thấp, nhà cung cấp hoặc đơn nhập hàng.',
    },
  ]);

  const displayName = user?.name || user?.username || 'bạn';
  const visibleHistory = useMemo(
    () =>
      messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .slice(-8),
    [messages]
  );

  const scrollToBottom = () => {
    window.setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const send = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;

    const userMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await aiChatApi.sendMessage({
        message: content,
        history: visibleHistory,
        pagePath: location.pathname,
      });
      const data = response.data || {};
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'Mình chưa nhận được phản hồi phù hợp. Bạn thử hỏi lại ngắn hơn nhé.',
          fallback: data.fallback,
        },
      ]);
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions.slice(0, 4));
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error?.response?.data?.message ||
            'Mình chưa kết nối được AI lúc này. Bạn kiểm tra backend/API key rồi thử lại nhé.',
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <section className="mb-3 flex h-[620px] max-h-[calc(100vh-7rem)] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">AI Copilot</h2>
                <p className="text-xs text-muted-foreground">
                  {displayName} · {role || 'USER'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setOpen(false)}
              aria-label="Đóng AI Copilot"
            >
              <X size={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              return (
                <div key={`${message.role}-${index}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[86%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : message.error
                          ? 'border border-destructive/30 bg-destructive/10 text-foreground'
                          : 'bg-muted text-foreground'
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                        <Bot size={13} />
                        <span>{message.fallback ? 'AI nội bộ' : 'AI Copilot'}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 size={15} className="animate-spin" />
                  Đang suy nghĩ...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => send(item)}
                  disabled={loading}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Hỏi AI về lịch ca, tồn kho, nhập hàng..."
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => send()}
                disabled={loading || !input.trim()}
                aria-label="Gửi tin nhắn"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        aria-label="Mở AI Copilot"
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </div>
  );
}

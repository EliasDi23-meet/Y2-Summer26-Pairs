import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AGENTS, AGENT_LIST, AgentId } from '../agents';
import { ChatMessage, sendChat } from '../lib/chat';
import MessageBubble from '../components/MessageBubble';
import TypingDots from '../components/TypingDots';
import './ChatPage.css';

export default function ChatPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const agent = AGENTS[agentId as AgentId];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryPayload, setRetryPayload] = useState<ChatMessage[] | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when switching agents
  useEffect(() => {
    setMessages([]);
    setInput('');
    setLoading(false);
    setError(null);
    setRetryPayload(null);
    // focus the input shortly after mount
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [agentId]);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, error]);

  const otherAgent = useMemo(() => {
    if (!agent) return null;
    return AGENT_LIST.find((a) => a.id !== agent.id) ?? null;
  }, [agent]);

  if (!agent) {
    return (
      <div className="chat-missing">
        <h2>Agent not found</h2>
        <p>That agent doesn't exist. Pick one from the home page.</p>
        <Link to="/" className="btn btn--primary">
          Back home
        </Link>
      </div>
    );
  }

  const handleSend = async (textArg?: string) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setRetryPayload(null);
    setLoading(true);

    try {
      const { reply } = await sendChat(agent.id, nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Something went wrong while contacting the AI.';
      setError(msg);
      setRetryPayload(nextMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (!retryPayload) return;
    // Drop the failed user message and resend
    setMessages(retryPayload);
    setError(null);
    setRetryPayload(null);
    setLoading(true);
    sendChat(agent.id, retryPayload)
      .then(({ reply }) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      })
      .catch((e) => {
        const msg =
          e instanceof Error ? e.message : 'Something went wrong while contacting the AI.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleNewChat = () => {
    if (loading) return;
    if (messages.length > 0) {
      const ok = window.confirm('Start a new conversation? This will clear the current chat.');
      if (!ok) return;
    }
    setMessages([]);
    setError(null);
    setRetryPayload(null);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showWelcome = messages.length === 0 && !loading && !error;

  return (
    <div
      className="chat"
      style={{ '--agent-accent': agent.accent, '--agent-soft': agent.accentSoft } as React.CSSProperties}
    >
      <div className="chat__header">
        <div className="chat__header-left">
          <div className="chat__avatar" style={{ background: agent.gradient }} aria-hidden>
            {agent.avatarInitials}
          </div>
          <div className="chat__header-meta">
            <div className="chat__header-name">
              {agent.name}
              <span className="chat__header-emoji" aria-hidden>{agent.emoji}</span>
            </div>
            <div className="chat__header-role">{agent.role}</div>
          </div>
        </div>
        <div className="chat__header-actions">
          {otherAgent && (
            <button
              type="button"
              className="chat__switch"
              onClick={() => navigate(`/chat/${otherAgent.id}`)}
              title={`Switch to ${otherAgent.name}`}
            >
              <span className="chat__switch-icon" aria-hidden>⇄</span>
              <span className="chat__switch-text">Switch to {otherAgent.name}</span>
            </button>
          )}
          <button
            type="button"
            className="chat__new"
            onClick={handleNewChat}
            disabled={loading || messages.length === 0}
            title="Start a new conversation"
          >
            <span aria-hidden>＋</span>
            <span className="chat__new-text">New chat</span>
          </button>
        </div>
      </div>

      <div className="chat__scroll" ref={scrollRef}>
        {showWelcome ? (
          <div className="chat__welcome">
            <div className="chat__welcome-avatar" style={{ background: agent.gradient }} aria-hidden>
              {agent.avatarInitials}
            </div>
            <h2 className="chat__welcome-title">{agent.name}</h2>
            <p className="chat__welcome-role">{agent.role}</p>
            <p className="chat__welcome-desc">{agent.longDescription}</p>
            <p className="chat__welcome-message">{agent.welcomeMessage}</p>
            <div className="chat__suggestions">
              {agent.suggestedPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="chat__suggestion"
                  onClick={() => handleSend(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat__messages">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} agent={agent} />
            ))}

            {loading && (
              <div className="bubble bubble--assistant">
                <div className="bubble__avatar" style={{ background: agent.gradient }} aria-hidden>
                  {agent.avatarInitials}
                </div>
                <div className="bubble__content">
                  <div className="bubble__name">{agent.name}</div>
                  <div className="chat__thinking">
                    <span className="chat__thinking-label">
                      {agent.name} is thinking
                    </span>
                    <TypingDots />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="chat__error" role="alert">
                <div className="chat__error-icon" aria-hidden>!</div>
                <div className="chat__error-body">
                  <p className="chat__error-title">Something went wrong while connecting to the AI.</p>
                  <p className="chat__error-detail">{error}</p>
                  <button type="button" className="chat__error-retry" onClick={handleRetry}>
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chat__input-bar">
        <div className="chat__input-wrap">
          <textarea
            ref={inputRef}
            className="chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={agent.placeholder}
            rows={1}
            disabled={loading}
            aria-label="Message"
          />
          <button
            type="button"
            className="chat__send"
            onClick={() => handleSend()}
            disabled={loading || input.trim().length === 0}
            aria-label="Send message"
          >
            {loading ? (
              <span className="chat__send-spinner" aria-hidden />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3.4 20.4 21 12 3.4 3.6 3 10l12 2-12 2 .4 6.4Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="chat__input-hint">
          Press <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
        </p>
      </div>
    </div>
  );
}

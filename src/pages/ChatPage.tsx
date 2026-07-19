import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AGENTS, AGENT_LIST, type AgentId, type AgentMeta } from '../lib/agents'
import { sendChat, type ChatMessage } from '../lib/chat'
import AgentAvatar from '../components/AgentAvatar'
import MessageBubble from '../components/MessageBubble'
import TypingDots from '../components/TypingDots'

function getAgent(id?: string): AgentMeta | undefined {
  if (!id) return undefined
  return AGENTS[id as AgentId]
}

export default function ChatPage() {
  const { agentId } = useParams()
  const agent = useMemo(() => getAgent(agentId), [agentId])

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMessages([])
    setInput('')
    setLoading(false)
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [agentId])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  if (!agent) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-white">Agent not found</h1>
        <Link to="/" className="btn-primary mt-6">Back home</Link>
      </div>
    )
  }

  const other = AGENT_LIST.find((a) => a.id !== agent.id)!

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setError(null)
    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const reply = await sendChat(agent!.systemPrompt, next)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setError('Something went wrong while connecting to the AI. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  function newChat() {
    setMessages([])
    setError(null)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 pt-4">
        <div className="card flex items-center gap-4 p-4">
          <AgentAvatar
            emoji={agent.emoji}
            size="md"
            ring={agent.accent === 'pitch' ? 'ring-pitch-500/40' : 'ring-accent-500/40'}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl tracking-wide text-white truncate">{agent.name}</h1>
              <span className="rounded-full bg-night-800 px-2.5 py-0.5 text-xs text-night-200">{agent.role}</span>
            </div>
            <p className="text-xs text-night-400 truncate">{agent.tagline}</p>
          </div>
          <button onClick={newChat} className="btn-ghost hidden sm:inline-flex">
            New Chat
          </button>
          <Link to={`/agent/${other.id}`} className="btn-ghost">
            Switch Agent
          </Link>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center text-center py-8">
              <AgentAvatar emoji={agent.emoji} size="lg" ring={agent.accent === 'pitch' ? 'ring-pitch-500/40' : 'ring-accent-500/40'} />
              <h2 className="mt-4 font-display text-2xl tracking-wide text-white">Welcome to {agent.name}</h2>
              <p className="mt-2 max-w-md text-sm text-night-300">{agent.welcome}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {agent.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="card p-4 text-left text-sm text-night-200 hover:border-pitch-500/40 hover:bg-night-800/80 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} emoji={agent.emoji} />
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <AgentAvatar emoji={agent.emoji} size="sm" />
            <div className="card px-4 py-3">
              <div className="flex items-center gap-3">
                <TypingDots />
                <span className="text-xs text-night-400">{agent.name} is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="card border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <p>{error}</p>
            <button
              onClick={() => {
                const lastUser = [...messages].reverse().find((m) => m.role === 'user')
                if (lastUser) send(lastUser.content)
              }}
              className="btn-ghost mt-3"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-night-950 to-transparent pt-4">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 pb-4">
          <div className="card flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
              }}
              onKeyDown={onKeyDown}
              placeholder={agent.placeholder}
              className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-night-500 focus:outline-none max-h-40"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="btn-primary !rounded-xl"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-night-500">
            Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </div>
  )
}

import AgentAvatar from './AgentAvatar'

interface Props {
  role: 'user' | 'assistant'
  content: string
  emoji: string
}

export default function MessageBubble({ role, content, emoji }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <AgentAvatar emoji={emoji} size="sm" />}
      <div className={`max-w-[78%] sm:max-w-[70%]`}>
        <div
          className={`px-4 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm sm:text-base ${
            isUser
              ? 'bg-pitch-500 text-night-950 rounded-tr-sm'
              : 'bg-night-800 text-night-100 rounded-tl-sm border border-night-700'
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  )
}

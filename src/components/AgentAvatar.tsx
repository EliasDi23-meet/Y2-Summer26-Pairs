interface Props {
  emoji: string
  size?: 'sm' | 'md' | 'lg'
  ring?: string
}

export default function AgentAvatar({ emoji, size = 'md', ring = 'ring-pitch-500/40' }: Props) {
  const sizes = {
    sm: 'h-9 w-9 text-base',
    md: 'h-12 w-12 text-xl',
    lg: 'h-16 w-16 text-3xl',
  }
  return (
    <div
      className={`flex items-center justify-center rounded-2xl bg-night-800 ring-2 ${ring} ${sizes[size]} shadow-inner`}
    >
      <span>{emoji}</span>
    </div>
  )
}

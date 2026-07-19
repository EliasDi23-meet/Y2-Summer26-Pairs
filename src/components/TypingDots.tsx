export default function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <span className="h-2 w-2 rounded-full bg-pitch-400 animate-bounce-dot" />
      <span className="h-2 w-2 rounded-full bg-pitch-400 animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
      <span className="h-2 w-2 rounded-full bg-pitch-400 animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
    </div>
  )
}

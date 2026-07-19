import './TypingDots.css';

export default function TypingDots() {
  return (
    <span className="typing-dots" aria-label="Agent is typing">
      <span style={{ animationDelay: '0ms' }} />
      <span style={{ animationDelay: '160ms' }} />
      <span style={{ animationDelay: '320ms' }} />
    </span>
  );
}

import { ReactNode } from 'react';
import { AgentConfig } from '../agents';
import { parseReply, splitLines } from '../lib/format';
import './MessageBubble.css';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  agent: AgentConfig;
}

export default function MessageBubble({ role, content, agent }: Props) {
  if (role === 'user') {
    return (
      <div className="bubble bubble--user">
        <div className="bubble__body">{content}</div>
      </div>
    );
  }

  const parsed = parseReply(content);
  const hasStructured = parsed.summary || parsed.response || parsed.nextStep;

  return (
    <div className="bubble bubble--assistant">
      <div
        className="bubble__avatar"
        style={{ background: agent.gradient }}
        aria-hidden
      >
        {agent.avatarInitials}
      </div>
      <div className="bubble__content">
        <div className="bubble__name">{agent.name}</div>
        {hasStructured ? (
          <div className="bubble__structured">
            {parsed.summary && (
              <Section label="Summary" tone="muted">
                {parsed.summary}
              </Section>
            )}
            {parsed.response && (
              <Section label="Response" tone="default">
                {splitLines(parsed.response).map((line, i) => (
                  <span key={i} style={{ display: 'block' }}>
                    {line || '\u00A0'}
                  </span>
                ))}
              </Section>
            )}
            {parsed.nextStep && (
              <Section label="Next Step" tone="accent" accent={agent.accent}>
                {parsed.nextStep}
              </Section>
            )}
          </div>
        ) : (
          <div className="bubble__body">{content}</div>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  tone,
  accent,
  children,
}: {
  label: string;
  tone: 'muted' | 'default' | 'accent';
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div className={`section section--${tone}`}>
      <span
        className="section__label"
        style={tone === 'accent' && accent ? { color: accent } : undefined}
      >
        {label}
      </span>
      <div className="section__body">{children}</div>
    </div>
  );
}

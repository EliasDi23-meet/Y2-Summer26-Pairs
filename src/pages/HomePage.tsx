import { Link } from 'react-router-dom';
import { AGENT_LIST } from '../agents';
import './HomePage.css';

const STEPS = [
  {
    n: '01',
    title: 'Choose your AI expert',
    text: 'Pick between Naknik (coaching) and Naknikya (nutrition) — or use both.',
  },
  {
    n: '02',
    title: 'Tell the agent about your goals',
    text: 'Share your position, age, schedule, and what you want to improve.',
  },
  {
    n: '03',
    title: 'Receive personalized advice',
    text: 'Get drills, meal plans, and next steps tailored to you as a young player.',
  },
];

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero__inner">
          <span className="hero__eyebrow">AI Football Support Team</span>
          <h1 className="hero__title">
            Your AI Football <span className="hero__title-accent">Support Team</span>
          </h1>
          <p className="hero__subtitle">
            Two specialized AI assistants — one for football coaching, one for sports
            nutrition — built for young players who want to grow faster, train smarter,
            and fuel better.
          </p>
          <div className="hero__cta">
            <a href="#agents" className="btn btn--primary">
              Meet your team
            </a>
            <Link to="/chat/naknik" className="btn btn--ghost">
              Start with the coach
            </Link>
          </div>
        </div>
        <div className="hero__ball" aria-hidden>
          <div className="hero__ball-ring" />
          <span className="hero__ball-emoji">⚽</span>
        </div>
      </section>

      <section id="agents" className="agents">
        <header className="section-head">
          <h2 className="section-head__title">Two experts. One goal.</h2>
          <p className="section-head__text">
            Each agent has a clear responsibility and stays in its lane. Pick the one
            that fits what you need today — and switch any time.
          </p>
        </header>

        <div className="agent-grid">
          {AGENT_LIST.map((a) => (
            <article
              key={a.id}
              className="agent-card"
              style={{ '--agent-accent': a.accent, '--agent-soft': a.accentSoft } as React.CSSProperties}
            >
              <div className="agent-card__top">
                <div
                  className="agent-card__avatar"
                  style={{ background: a.gradient }}
                  aria-hidden
                >
                  <span>{a.avatarInitials}</span>
                </div>
                <div className="agent-card__meta">
                  <span className="agent-card__name">{a.name}</span>
                  <span
                    className="agent-card__role"
                    style={{ color: a.accent, background: a.accentSoft }}
                  >
                    {a.role}
                  </span>
                </div>
                <span className="agent-card__emoji" aria-hidden>
                  {a.emoji}
                </span>
              </div>

              <p className="agent-card__desc">{a.shortDescription}</p>

              <ul className="agent-card__tags">
                {a.id === 'naknik'
                  ? ['Dribbling', 'Tactics', 'Drills', 'Positioning'].map((t) => (
                      <li key={t}>{t}</li>
                    ))
                  : ['Meal plans', 'Hydration', 'Recovery', 'Match-day fuel'].map((t) => (
                      <li key={t}>{t}</li>
                    ))}
              </ul>

              <Link
                to={`/chat/${a.id}`}
                className="agent-card__cta"
                style={{ background: a.gradient }}
              >
                Start chatting
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="how">
        <header className="section-head">
          <h2 className="section-head__title">How it works</h2>
          <p className="section-head__text">
            Three simple steps from question to personalized plan.
          </p>
        </header>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.n} className="step">
              <span className="step__n">{s.n}</span>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="home__footer">
        <p>Built for young football players. Always consult a doctor for injuries or medical concerns.</p>
      </footer>
    </div>
  );
}

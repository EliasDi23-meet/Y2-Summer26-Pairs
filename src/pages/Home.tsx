import { Link } from 'react-router-dom'
import { AGENT_LIST } from '../lib/agents'
import AgentAvatar from '../components/AgentAvatar'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-pitch-900/20 via-night-950 to-night-950" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[40rem] rounded-full bg-pitch-500/10 blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-pitch-500/30 bg-pitch-500/10 px-3 py-1 text-xs font-medium text-pitch-300">
          <span className="h-1.5 w-1.5 rounded-full bg-pitch-400 animate-pulse" />
          Built for young footballers
        </span>
        <h1 className="mt-6 font-display text-5xl sm:text-7xl tracking-wide text-white">
          YOUR AI FOOTBALL <span className="text-pitch-400">SUPPORT TEAM</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-night-300">
          Get personalized support from two specialized AI assistants — one for football coaching,
          one for sports nutrition. Choose your expert, share your goals, and start improving today.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#agents" className="btn-primary">
            Meet your team
          </a>
          <Link to="/agent/naknik" className="btn-ghost">
            Start chatting
          </Link>
        </div>
      </section>

      <section id="agents" className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {AGENT_LIST.map((a) => (
            <article
              key={a.id}
              className={`card relative overflow-hidden p-6 sm:p-8 transition hover:border-night-700 hover:-translate-y-1 animate-fade-in`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.gradient}`} />
              <div className="relative flex items-start gap-4">
                <AgentAvatar emoji={a.emoji} size="lg" ring={a.accent === 'pitch' ? 'ring-pitch-500/40' : 'ring-accent-500/40'} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-2xl tracking-wide text-white">{a.name}</h2>
                    <span className="rounded-full bg-night-800 px-2.5 py-0.5 text-xs font-medium text-night-200">
                      {a.role}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-pitch-300">{a.tagline}</p>
                </div>
              </div>
              <p className="relative mt-5 text-sm leading-relaxed text-night-300">{a.description}</p>
              <div className="relative mt-6">
                <Link to={`/agent/${a.id}`} className="btn-primary w-full sm:w-auto">
                  Chat with {a.name} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <h3 className="text-center font-display text-3xl tracking-wide text-white">HOW IT WORKS</h3>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { n: '01', t: 'Choose your AI expert', d: 'Pick between coaching and nutrition — or use both.' },
            { n: '02', t: 'Tell the agent your goals', d: 'Share your position, schedule, and what you want to improve.' },
            { n: '03', t: 'Receive personalized advice', d: 'Get clear, actionable guidance with a next step every time.' },
          ].map((s) => (
            <div key={s.n} className="card p-6">
              <div className="font-display text-4xl text-pitch-500/80">{s.n}</div>
              <h4 className="mt-2 text-lg font-semibold text-white">{s.t}</h4>
              <p className="mt-2 text-sm text-night-300">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

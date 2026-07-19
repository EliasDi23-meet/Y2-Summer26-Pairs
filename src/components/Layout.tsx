import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AGENT_LIST } from '../lib/agents'

function NavItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <NavLink
      to={to}
      className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-pitch-500 text-night-950'
          : 'text-night-300 hover:text-white hover:bg-night-800'
      }`}
    >
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 border-b border-night-800/80 bg-night-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <NavLink to="/" className="flex items-center gap-2 group">
              <span className="text-2xl">⚽</span>
              <span className="font-display text-xl tracking-wide text-white">
                KICKSTART <span className="text-pitch-400">AI</span>
              </span>
            </NavLink>

            <nav className="flex items-center gap-1 sm:gap-2">
              <NavItem to="/" label="Home" active={location.pathname === '/'} />
              {AGENT_LIST.map((a) => (
                <NavItem
                  key={a.id}
                  to={`/agent/${a.id}`}
                  label={a.name}
                  active={location.pathname === `/agent/${a.id}`}
                />
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}

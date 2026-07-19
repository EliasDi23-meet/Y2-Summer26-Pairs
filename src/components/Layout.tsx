import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AGENT_LIST } from '../agents';
import './Layout.css';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const onChatPage = location.pathname.startsWith('/chat/');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="brand">
            <span className="brand__logo" aria-hidden>
              ⚽
            </span>
            <span className="brand__text">
              <span className="brand__title">Football AI</span>
              <span className="brand__subtitle">Support Team</span>
            </span>
          </NavLink>

          <nav className="app-nav" aria-label="Primary">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                'app-nav__item' + (isActive ? ' app-nav__item--active' : '')
              }
            >
              Home
            </NavLink>
            {AGENT_LIST.map((a) => (
              <NavLink
                key={a.id}
                to={`/chat/${a.id}`}
                className={({ isActive }) =>
                  'app-nav__item' + (isActive ? ' app-nav__item--active' : '')
                }
                style={
                  onChatPage && location.pathname === `/chat/${a.id}`
                    ? { '--nav-accent': a.accent } as React.CSSProperties
                    : undefined
                }
              >
                {a.name}
              </NavLink>
            ))}
          </nav>

          <div className="app-header__spacer" />
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}

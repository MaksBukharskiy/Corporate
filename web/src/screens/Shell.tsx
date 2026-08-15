import { useEffect, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '../store';

export function Shell({
  title,
  nav,
  page,
  onNav,
  children,
}: {
  title: string;
  nav: { key: string; label: string; icon: LucideIcon }[];
  page: string;
  onNav: (key: string) => void;
  children: ReactNode;
}) {
  const { session, logout, dark, setDark, booting } = useStore();
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    if (booting || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnter(false);
      return;
    }
    setEnter(true);
    const t = window.setTimeout(() => setEnter(false), 750);
    return () => window.clearTimeout(t);
  }, [booting]);

  const shellClass = ['shell', booting ? 'booting' : '', enter ? 'enter' : ''].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      <aside className="side">
        <div className="brand">
          <span className="brand-mark">
            <img src="/logomark.png" alt="" />
          </span>
          Corporate
        </div>
        <div className="user-chip">
          <b>{session?.name}</b>
          <span>{title}</span>
        </div>
        <nav className="nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} className={page === item.key ? 'on' : ''} type="button" onClick={() => onNav(item.key)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="side-foot">
          <button className="ghost" type="button" onClick={() => setDark(!dark)}>
            {dark ? <Moon size={14} /> : <Sun size={14} />} {dark ? 'Тёмная' : 'Светлая'}
          </button>
          <button className="primary" type="button" onClick={() => {
            window.location.hash = '#/overview';
            logout();
          }}>
            Выйти
          </button>
        </div>
      </aside>
      <main className="main">
        <div key={booting ? 'boot' : page} className="main-fade">
          {booting ? <CabinetSkeleton /> : children}
        </div>
      </main>
    </div>
  );
}

function CabinetSkeleton() {
  return (
    <div className="boot-skel" aria-hidden="true">
      <div className="skel skel-title" />
      <div className="skel skel-lead" />
      <div className="grid">
        <div className="skel skel-stat" />
        <div className="skel skel-stat" />
        <div className="skel skel-stat" />
        <div className="skel skel-stat" />
      </div>
      <div className="panel skel-panel">
        <div className="skel skel-row" />
        <div className="skel skel-row" />
        <div className="skel skel-row" />
        <div className="skel skel-row" />
        <div className="skel skel-row" />
      </div>
    </div>
  );
}

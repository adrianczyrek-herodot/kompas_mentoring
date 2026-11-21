import React from 'react';
import { useDemo } from '../context/DemoContext';
import { DEFAULT_ROUTE, ROLE_LABELS } from '../utils/types';
import { navigate } from '../utils/router';
import { PROTO_BAR_HEIGHT } from '../utils/constants';

interface HeaderProps {
  role: 'guest' | 'student' | 'mentor' | 'admin';
  nav: { label: string; href: string; icon: string }[];
  screenTitle?: string;
}

export function Header({ role, nav, screenTitle }: HeaderProps) {
  const { logout, unreadCount } = useDemo();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const handleNavClick = (href: string) => {
    navigate(href);
  };

  return (
    <header 
      className="topbar" 
      style={{ 
        position: 'sticky', 
        top: PROTO_BAR_HEIGHT, 
        zIndex: 100,
        background: 'color-mix(in srgb, var(--surface-page) 92%, transparent)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-divider)',
      }}
    >
      <a href={DEFAULT_ROUTE[role]} className="logo" aria-label="Kompas — strona główna">
        <span className="logo__mark" style={{ color: 'var(--action-primary)' }}>✦</span>
        <span style={{ fontFamily: 'var(--font-family-serif)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-default)' }}>kompas</span>
      </a>
      
      <nav className="topnav" aria-label="Główna nawigacja" style={{ display: 'none', gap: '4px' }}>
        {nav.map(item => (
          <a
            key={item.href}
            href={item.href}
            onClick={e => { e.preventDefault(); handleNavClick(item.href); }}
            className="topnav__item"
            style={{
              textDecoration: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 11px',
              borderRadius: '999px',
              fontWeight: 500,
              fontSize: '0.92rem',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div className="topbar__right" style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
        {role === 'guest' ? (
          <>
            <a className="btn btn--ghost btn--s" href="#/logowanie" onClick={e => { e.preventDefault(); navigate('#/logowanie'); }}>
              Zaloguj
            </a>
            <a className="btn btn--primary btn--s" href="#/rejestracja" onClick={e => { e.preventDefault(); navigate('#/rejestracja'); }}>
              Załóż konto
            </a>
          </>
        ) : (
          <>
            <button 
              className="iconbtn"
              onClick={() => navigate('#/powiadomienia')}
              aria-label={`Powiadomienia${unreadCount > 0 ? `, ${unreadCount} nieprzeczytanych` : ''}`}
              style={{ position: 'relative', display: 'grid', placeItems: 'center', width: '38px', height: '38px', borderRadius: '50%', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{ 
                  position: 'absolute', top: '3px', right: '3px', 
                  background: 'var(--action-primary)', color: '#fff', 
                  fontSize: '0.65rem', fontWeight: 700, 
                  minWidth: '16px', height: '16px', borderRadius: '8px', 
                  display: 'grid', placeItems: 'center' 
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <div style={{ position: 'relative' }}>
              <button
                className="avatar avatar--me"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Menu konta"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
                style={{ 
                  width: '34px', height: '34px', borderRadius: '50%', 
                  display: 'inline-grid', placeItems: 'center', 
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  background: 'hsl(168 45% 86%)', color: 'hsl(168 45% 22%)',
                }}
              >
                {role === 'mentor' ? 'KN' : role === 'admin' ? 'AD' : 'AC'}
              </button>
              
              {showProfileMenu && (
                <div 
                  style={{ 
                    position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                    background: 'var(--surface-panel)', border: '1px solid var(--border-divider)',
                    borderRadius: 'var(--shape-panel)', boxShadow: 'var(--depth-overlay)',
                    minWidth: '200px', padding: '8px', zIndex: 200,
                  }}
                  role="menu"
                >
                  <div style={{ padding: '8px 12px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-default)' }}>
                    {ROLE_LABELS[role]}
                  </div>
                  <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Prototyp — dane fikcyjne
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-divider)', margin: '8px 0' }} />
                  <button
                    onClick={() => { navigate('#/konto'); setShowProfileMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-default)', cursor: 'pointer', fontSize: '0.875rem', borderRadius: 'var(--shape-control)' }}
                    role="menuitem"
                  >
                    ⚙️ Konto i ustawienia
                  </button>
                  {role === 'student' && (
                    <button
                      onClick={() => { logout(); navigate('#/mentor/onboarding/1'); setShowProfileMenu(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-default)', cursor: 'pointer', fontSize: '0.875rem', borderRadius: 'var(--shape-control)' }}
                      role="menuitem"
                    >
                      🔁 Przełącz na rolę: Mentor
                    </button>
                  )}
                  {role === 'mentor' && (
                    <button
                      onClick={() => { logout(); navigate('#/sesje'); setShowProfileMenu(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-default)', cursor: 'pointer', fontSize: '0.875rem', borderRadius: 'var(--shape-control)' }}
                      role="menuitem"
                    >
                      🔁 Przełącz na rolę: Uczeń
                    </button>
                  )}
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-divider)', margin: '8px 0' }} />
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: 'var(--status-danger-fg)', cursor: 'pointer', fontSize: '0.875rem', borderRadius: 'var(--shape-control)' }}
                    role="menuitem"
                  >
                    🚪 Wyloguj
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
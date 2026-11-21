import { navigate } from '../utils/router';

interface BottomNavProps {
  role: 'guest' | 'student' | 'mentor' | 'admin';
  nav: { label: string; href: string; icon: string }[];
}

export function BottomNav({ role, nav }: BottomNavProps) {
  if (role === 'guest') return null;

  const currentHash = window.location.hash;

  return (
    <nav 
      className="bottomnav" 
      aria-label="Główna nawigacja (mobile)"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 25,
        display: 'flex',
        justifyContent: 'space-around',
        background: 'var(--surface-panel)',
        borderTop: '1px solid var(--border-divider)',
        padding: '6px 4px',
        paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
      }}
    >
      {nav.map(item => (
        <a
          key={item.href}
          href={item.href}
          onClick={e => { e.preventDefault(); navigate(item.href); }}
          style={{
            flexDirection: 'column',
            gap: '2px',
            fontSize: '0.7rem',
            padding: '4px 6px',
            borderRadius: '10px',
            textDecoration: 'none',
            color: currentHash === item.href || (item.href !== '#/mentor' && currentHash.startsWith(item.href)) 
              ? 'var(--action-primary)' 
              : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
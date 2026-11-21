import React from 'react';
import { useDemo } from '../context/DemoContext';
import { useReview } from '../context/ReviewContext';
import { SCREENS, ROLE_LABELS } from '../utils/types';
import { navigate, buildPath } from '../utils/router';
import { PROTO_BAR_HEIGHT } from '../utils/constants';

export function ProtoBar() {
  const { role, setRole, darkMode, toggleDarkMode, viewState, setViewState, activeScreen } = useDemo();
  const { sidebarOpen, setSidebarOpen } = useReview();
  const [showMap, setShowMap] = React.useState(false);

  const handleScreenChange = (screenId: string) => {
    const screen = SCREENS.find(s => s.id === screenId);
    if (screen) {
      navigate(buildPath(screen.id as any));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as any);
  };

  const handleStateChange = (state: 'success' | 'loading' | 'empty' | 'error') => {
    setViewState(state);
    const currentHash = window.location.hash.replace(/^#/, '') || '/';
    const [path, qs] = currentHash.split('?');
    const query = new URLSearchParams(qs ?? '');
    if (state === 'success') {
      query.delete('state');
    } else {
      query.set('state', state);
    }
    const newHash = `#${path}${query.toString() ? `?${query.toString()}` : ''}`;
    window.location.hash = newHash;
  };

  return (
    <div 
      className="proto-bar" 
      role="region" 
      aria-label="Pasek narzędzi prototypu"
      style={{ height: PROTO_BAR_HEIGHT }}
    >
      <span className="proto-bar__badge">PROTOTYP</span>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 200 }}>
        <span className="proto-bar__label">Ekran:</span>
        <select 
          className="proto-bar__select" 
          value={activeScreen || ''} 
          onChange={e => handleScreenChange(e.target.value)}
          aria-label="Wybierz ekran"
        >
          <option value="">— wybierz ekran —</option>
          {SCREENS.map(s => (
            <option key={s.id} value={s.id}>
              {s.id} — {s.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Rola
          <select 
            className="proto-bar__select" 
            value={role} 
            onChange={handleRoleChange}
            style={{ padding: '2px 6px', fontSize: '0.75rem' }}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        <div className="proto-bar__states" role="group" aria-label="Stan danych ekranu">
          {(['success', 'loading', 'empty', 'error'] as const).map(state => (
            <button
              key={state}
              className={`proto-bar__states-btn ${viewState === state ? 'is-on' : ''}`}
              onClick={() => handleStateChange(state)}
              aria-pressed={viewState === state}
              style={{
                padding: '4px 10px',
                border: '1px solid var(--border-divider)',
                background: viewState === state ? 'var(--selected-bg)' : 'transparent',
                color: viewState === state ? 'var(--selected-border)' : 'var(--text-muted)',
                borderRadius: state === 'success' ? 'var(--shape-tag) 0 0 var(--shape-tag)' : 
                          state === 'error' ? '0 var(--shape-tag) var(--shape-tag) 0' : 0,
                borderLeft: state !== 'success' ? '1px solid var(--border-divider)' : 0,
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {state === 'success' ? 'Domyślny' : state}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowMap(!showMap)}
          className="btn btn--ghost btn--sm"
          style={{ fontSize: '0.75rem' }}
        >
          🗺️ Mapa
        </button>

        <button
          onClick={toggleDarkMode}
          className="btn btn--ghost btn--sm"
          style={{ fontSize: '0.75rem' }}
          aria-pressed={darkMode}
        >
          {darkMode ? '☀️' : '🌙'} Motyw
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn--ghost btn--sm"
          style={{ fontSize: '0.75rem' }}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Zamknij panel komentarzy' : 'Otwórz panel komentarzy'}
        >
          💬 Komentarze
        </button>
      </div>

      {showMap && (
        <div style={{ 
          position: 'fixed', 
          top: PROTO_BAR_HEIGHT, 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: 'var(--surface-panel)',
          border: '1px solid var(--border-divider)',
          borderRadius: 'var(--shape-panel)',
          padding: '1rem',
          maxWidth: '90vw',
          maxHeight: '60vh',
          overflow: 'auto',
          zIndex: 2000,
          boxShadow: 'var(--depth-overlay)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.875rem' }}>Mapa ekranów</h3>
            <button onClick={() => setShowMap(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: 'grid', gap: '4px', maxHeight: '50vh', overflow: 'auto' }}>
            {SCREENS.map(s => (
              <a
                key={s.id}
                href={buildPath(s.id)}
                onClick={() => setShowMap(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: 'var(--shape-control)',
                  textDecoration: 'none',
                  color: 'var(--text-default)',
                  fontSize: '0.8rem',
                  background: activeScreen === s.id ? 'var(--selected-bg)' : 'transparent',
                }}
              >
                <span style={{ 
                  fontFamily: 'var(--font-family-mono)', 
                  fontSize: '0.7rem', 
                  background: 'var(--action-primary)', 
                  color: 'var(--text-on-action)', 
                  padding: '1px 6px', 
                  borderRadius: 'var(--shape-tag)',
                  minWidth: '32px',
                  textAlign: 'center',
                }}>
                  {s.id}
                </span>
                {s.title}
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  [{s.access}]
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
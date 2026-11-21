import React, { useState } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { threadById, formatDateTime, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { OFF_PLATFORM } from '../utils/mocks';

export function S1Messages({ id }: { id?: string }) {
  const { threads, addMessage, role } = useDemo();
  const { addToast } = useToast();
  const [activeThread, setActiveThread] = useState<typeof threads[0] | null>(id ? (threads.find(t => t.id === id) || null) : null);
  const [newMessage, setNewMessage] = useState('');
  const [showOffPlatformWarning, setShowOffPlatformWarning] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleSend = () => {
    if (!newMessage.trim() || !activeThread) return;
    
    // Check for off-platform contact info
    if (OFF_PLATFORM.test(newMessage)) {
      setShowOffPlatformWarning(true);
      return;
    }

    addMessage(activeThread.id, newMessage.trim());
    setNewMessage('');
  };

  const handleSendAnyway = () => {
    if (!newMessage.trim() || !activeThread) return;
    addMessage(activeThread.id, newMessage.trim());
    setNewMessage('');
    setShowOffPlatformWarning(false);
  };

  const unreadCount = threads.reduce((sum, t) => sum + t.unread, 0);

  if (!activeThread) {
    return (
      <div className="messages">
        <div className="threads" style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '1rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>
              Wiadomości {unreadCount > 0 && <span className="count" style={{ marginLeft: '8px' }}>{unreadCount}</span>}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {threads.map(thread => (
                <a key={thread.id} href={`#/wiadomosci/${thread.id}`} onClick={e => { e.preventDefault(); navigate(`#/wiadomosci/${thread.id}`); setActiveThread(thread); }} className="list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="avatar" style={{ '--h': thread.hue, '--s': '44px' }} aria-hidden="true">{thread.withName[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{thread.withName}</strong>
                      {thread.unread > 0 && <span className="count">{thread.unread}</span>}
                    </div>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {thread.messages[thread.messages.length - 1]?.text || 'Brak wiadomości'}
                    </p>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(thread.messages[thread.messages.length - 1]?.at || '', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </a>
              ))}
            </div>
            {threads.length === 0 && (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <div className="empty-state__icon">💬</div>
                <h3 className="empty-state__title">Brak wiadomości</h3>
                <p className="empty-state__text">Rozpocznij rozmowę z mentorami po zarezerwowaniu sesji próbnej.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const thread = activeThread;
  const otherName = thread.withName;
  const otherHue = thread.hue;

  return (
    <div className={`messages ${isMobile && 'has-thread'}`}>
      {/* Thread list (mobile) */}
      {isMobile && (
        <div className="threads" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, background: 'var(--surface-page)', overflow: 'auto', paddingBottom: '80px' }}>
          <div className="thread__head" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--border-divider)' }}>
            <button className="back-ic" onClick={() => { setActiveThread(null); setNewMessage(''); }} aria-label="Powrót">←</button>
            <h2 className="type-section-title font-serif" style={{ margin: 0 }}>Wiadomości</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {threads.map(t => (
                <a key={t.id} href={`#/wiadomosci/${t.id}`} onClick={e => { e.preventDefault(); navigate(`#/wiadomosci/${t.id}`); setActiveThread(t); }} className="list-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="avatar" style={{ '--h': t.hue, '--s': '44px' }} aria-hidden="true">{t.withName[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{t.withName}</strong>
                      {t.unread > 0 && <span className="count">{t.unread}</span>}
                    </div>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.messages[t.messages.length - 1]?.text || 'Brak wiadomości'}
                    </p>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(t.messages[t.messages.length - 1]?.at || '', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thread view */}
      <div className="thread" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
        {!isMobile && (
          <div className="thread__head" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--border-divider)' }}>
            <div className="avatar" style={{ '--h': otherHue, '--s': '44px' }} aria-hidden="true">{otherName[0]}</div>
            <div style={{ flex: 1 }}>
              <strong>{otherName}</strong>
              <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>Mentor</p>
            </div>
          </div>
        )}

        {/* Context card - next session */}
        {threads[0].messages[0]?.text.includes('14:05') && (
          <a href="#/sesje/s1" className="context-card" onClick={e => { e.preventDefault(); navigate('#/sesje/s1'); }}>
            <span>📅</span>
            <span>Nadchodząca sesja: dzisiaj o 14:05 z Kasią Nowicką</span>
          </a>
        )}

        <div className="thread__body" style={{ flex: 1, overflow: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {thread.messages.map(msg => (
            <div key={msg.at} className={`bubble ${msg.me ? 'bubble--me' : ''}`} style={{ maxWidth: '80%' }}>
              {msg.text}
              <span className="bubble__t">{formatDateTime(msg.at, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
          <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
        </div>

        {/* Off-platform warning */}
        {showOffPlatformWarning && (
          <div className="notice notice--warn" style={{ margin: '0 14px', animation: 'fade-in 0.2s' }}>
            <span>⚠️</span>
            <div>
              <strong>Wykryto dane kontaktowe</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Przekazywanie numerów telefonu, e-maili lub płatności poza platformą narusza regulamin. Zachowaj bezpieczeństwo — komunikuj się tutaj.</p>
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="composer" style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderTop: '1px solid var(--border-divider)' }}>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !showOffPlatformWarning && handleSend()}
            placeholder="Napisz wiadomość…"
            style={{ flex: 1, background: 'var(--surface-page)', border: '1px solid var(--border-control)', borderRadius: 'var(--shape-control)', padding: '10px 12px', color: 'var(--text-default)', fontSize: '0.92rem', resize: 'none' }}
          />
          <button className="btn btn--primary" onClick={showOffPlatformWarning ? handleSendAnyway : handleSend} disabled={!newMessage.trim()} style={{ padding: 0, width: '44px', flex: 'none' }}>
            ➤
          </button>
        </div>
      </div>

      {/* Off-platform modal */}
      {showOffPlatformWarning && (
        <div className="modal-backdrop" onClick={() => setShowOffPlatformWarning(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setShowOffPlatformWarning(false)} aria-label="Zamknij">×</button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>⚠️</span>
              <div>
                <h2 className="type-page-title font-serif" style={{ marginBottom: '0.5rem' }}>Wykryto dane kontaktowe</h2>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Twoja wiadomość zawiera numer telefonu, e-mail lub informacje o płatnościach poza platformą.
                  <br /><br />
                  <strong>Dlaczego to niebezpieczne?</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                    <li>Brak ochrony w razie sporu</li>
                    <li>Możliwość oszustwa (płatność nie dociera do mentora)</li>
                    <li>Naruszenie regulaminu platformy</li>
                  </ul>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn--primary" onClick={handleSendAnyway}>Wyślij mimo to</button>
              <button className="btn btn--ghost" onClick={() => setShowOffPlatformWarning(false)}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
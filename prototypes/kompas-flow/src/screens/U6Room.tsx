import React, { useState, useEffect } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { sessionById, canJoin, hasStarted, formatDateTime, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

export function U6Room({ id }: { id: string }) {
  const { sessions } = useDemo();
  const { addToast } = useToast();
  const session = sessions.find(s => s.id === id) || sessionById(id);
  
  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Sesja nie znaleziona</h2>
        <a href="#/sesje" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/sesje'); }}>
          Moje sesje
        </a>
      </div>
    );
  }

  const mentor = session.mentorId === 'm1' ? { name: 'Kasia Nowicka', hue: 168 } : { name: 'Mentor', hue: 0 };
  const joinable = canJoin(session, DEMO_NOW);
  const started = hasStarted(session, DEMO_NOW);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string; me: boolean; text: string; time: string}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sharedNotes, setSharedNotes] = useState('');
  const [timer, setTimer] = useState('00:00:00');
  const [showNoShow, setShowNoShow] = useState(false);
  const [pictureInPicture, setPictureInPicture] = useState(false);

  const handleLeave = () => navigate('#/sesje');
  const handleEnd = () => { addToast('Sesja zakończona (symulacja)', 'success'); navigate('#/sesje'); };
  const handleNoShow = () => { addToast('Zgłoszono: Mentor się nie pojawił (symulacja)', 'success'); navigate('#/sesje'); };
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, me: true, text: newMessage.trim(), time: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) }]);
    setNewMessage('');
  };

  useEffect(() => {
    if (!joinable && !started) return;
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(session.startsAt);
      const elapsed = now.getTime() - start.getTime();
      if (elapsed < 0) { setTimer('Czekam...'); return; }
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTimer(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startsAt, joinable, started]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;

  return (
    <div className="room" style={{ minHeight: '100vh' }}>
      <div className="room__top" style={{ position: isMobile ? 'fixed' : 'sticky', top: 0, zIndex: 100, background: '#0e1615', borderBottom: '1px solid #2a3532', width: '100%' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="iconbtn" onClick={handleLeave} aria-label="Wyjdź z pokoju">←</button>
          <div>
            <h2 className="type-body" style={{ margin: 0, color: '#e7f0ec' }}>{session.goal || 'Sesja'}</h2>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', color: '#a9b6b2' }}>{mentor.name} • {formatDateTime(session.startsAt, { hour: '2-digit', minute: '2-digit' })} • {session.durationMin} min</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="timer" style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.85rem' }}>{timer}</span>
          {session.status === 'scheduled' && !joinable && !started && <span className="badge badge--warning" style={{ fontSize: '0.7rem' }}>Zaczyna się za chwilę</span>}
        </div>
      </div>

      <div className="room__stage" style={{ flex: 1, position: 'relative', margin: isMobile ? 0 : '0 12px', marginTop: isMobile ? '60px' : 0 }}>
        <div className="tile tile--main" style={{ background: `radial-gradient(circle at 50% 40%, hsl(${mentor.hue} 40% 30%), hsl(${mentor.hue} 40% 15%))` }}>
          {!joinable && !started && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#e7f0ec', textAlign: 'center', padding: '2rem' }}><div className="spinner spinner--l" style={{ color: '#e7f0ec' }} /><p>Łączenie z pokojem sesji...</p><p className="muted-inv" style={{ fontSize: '0.875rem' }}>Sesja zaczyna się o {formatDateTime(session.startsAt, { hour: '2-digit', minute: '2-digit' })}</p></div>}
          {started && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: '#e7f0ec', textAlign: 'center', padding: '2rem' }}><div style={{ width: '120px', height: '120px', borderRadius: '50%', background: `hsl(${mentor.hue} 40% 30%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700 }}>{mentor.name.split(' ').map(n => n[0]).join('')}</div><p style={{ fontSize: '1.25rem' }}>{mentor.name}</p><p className="muted-inv">Wideo: symulacja (LiveKit embed w produkcji)</p></div>}
          {started && <div className="tile tile--self" style={{ background: `radial-gradient(circle at 50% 40%, hsl(${12} 40% 30%), hsl(${12} 40% 15%))` }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: '#e7f0ec', textAlign: 'center' }}><div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `hsl(${12} 40% 30%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>AC</div><p style={{ fontSize: '0.75rem' }}>Ty{pictureInPicture && ' (PiP)'}</p></div><div className="tile__name">Ty</div></div>}
        </div>

      <div className="room__controls" style={{ position: isMobile ? 'fixed' : 'relative', bottom: isMobile ? 0 : 'auto', left: 0, right: 0, zIndex: 100, background: isMobile ? '#0e1615' : 'transparent', padding: isMobile ? '12px 16px calc(12px + env(safe-area-inset-bottom))' : '14px' }}>
        <button className="ctrl" aria-pressed={micOn} onClick={() => setMicOn(!micOn)} aria-label={micOn ? 'Wycisz mikrofon' : 'Włącz mikrofon'}>{micOn ? '🎤' : '🎤🔇'}</button>
        <button className="ctrl" aria-pressed={camOn} onClick={() => setCamOn(!camOn)} aria-label={camOn ? 'Wyłącz kamerę' : 'Włącz kamerę'}>{camOn ? '📷' : '📷🔇'}</button>
        <button className="ctrl" aria-pressed={screenShareOn} onClick={() => setScreenShareOn(!screenShareOn)} aria-label={screenShareOn ? 'Zatrzymaj udostępnianie' : 'Udostępnij ekran'}>🖥️</button>
        <button className="ctrl" data-panel={showChat ? 'chat' : ''} onClick={() => setShowChat(!showChat)} aria-label={showChat ? 'Zamknij czat' : 'Otwórz czat'} aria-pressed={showChat}>💬{messages.length > 0 && !showChat && <span className="dot">{messages.length}</span>}</button>
        <button className="ctrl" data-panel={showNotes ? 'notes' : ''} onClick={() => setShowNotes(!showNotes)} aria-label={showNotes ? 'Zamknij notatki' : 'Otwórz notatki'} aria-pressed={showNotes}>📝</button>
        {!started && <button className="ctrl ctrl--end" onClick={handleNoShow} aria-label="Mentor się nie pojawił">Mentor się nie pojawił</button>}
        {started && <button className="ctrl ctrl--end" onClick={handleEnd} aria-label="Zakończ sesję">Zakończ</button>}
      </div>

      {(showChat || showNotes) && <div className={`room__panel ${(showChat || showNotes) ? 'is-open' : ''}`} style={{ display: isMobile ? 'none' : 'block', background: '#172220' }}><div className="tabs" style={{ borderColor: '#2a3532' }}><button className={`tab ${showChat ? 'is-active' : ''}`} onClick={() => setShowChat(true)}>Czat</button><button className={`tab ${showNotes ? 'is-active' : ''}`} onClick={() => setShowNotes(true)}>Notatki</button></div>{showChat && <div style={{ flex: 1, overflow: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{messages.map(msg => <div key={msg.id} className={`bubble ${msg.me ? 'bubble--me' : ''}`} style={{ maxWidth: '80%' }}>{msg.text}<span className="bubble__t">{msg.time}</span></div>)}<div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #2a3532'}}><input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Napisz wiadomość…" style={{ flex: 1, background: '#0e1615', border: '1px solid #2a3532', borderRadius: 'var(--shape-control)', padding: '10px 12px', color: '#fff', fontSize: '0.92rem' }} /><button className="btn btn--primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>Wyślij</button></div></div>}{showNotes && <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}><label className="type-label">Wspólne notatki</label><textarea value={sharedNotes} onChange={e => setSharedNotes(e.target.value)} placeholder="Notatki widoczne dla obu stron…" rows={8} style={{ background: '#0e1615', border: '1px solid #2a3532', borderRadius: 'var(--shape-control)', padding: '12px', color: '#fff', fontSize: '0.92rem', resize: 'vertical', fontFamily: 'inherit' }}/></div>}</div>}

      {isMobile && (showChat || showNotes) && <div className="modal-backdrop" onClick={() => { setShowChat(false); setShowNotes(false); }}><div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '70vh' }}><button className="modal__close" onClick={() => { setShowChat(false); setShowNotes(false); }}>×</button><div className="tabs" style={{ borderColor: '#2a3532' }}><button className={`tab ${showChat ? 'is-active' : ''}`} onClick={() => { setShowChat(true); setShowNotes(false); }}>Czat</button><button className={`tab ${showNotes ? 'is-active' : ''}`} onClick={() => { setShowNotes(true); setShowChat(false); }}>Notatki</button></div>{showChat && <div style={{ maxHeight: '50vh', overflow: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{messages.map(msg => <div key={msg.id} className={`bubble ${msg.me ? 'bubble--me' : ''}`} style={{ maxWidth: '80%' }}>{msg.text}<span className="bubble__t">{msg.time}</span></div>)}<div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-divider)'}}><input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Napisz wiadomość…" style={{ flex: 1, background: 'var(--surface-panel)', border: '1px solid var(--border-control)', borderRadius: 'var(--shape-control)', padding: '10px 12px', color: 'var(--text-default)', fontSize: '0.92rem' }}/><button className="btn btn--primary" onClick={handleSendMessage} disabled={!newMessage.trim()}>Wyślij</button></div></div>}{showNotes && <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}><label className="type-label">Wspólne notatki</label><textarea value={sharedNotes} onChange={e => setSharedNotes(e.target.value)} placeholder="Notatki widoczne dla obu stron…" rows={8} style={{ background: 'var(--surface-panel)', border: '1px solid var(--border-control)', borderRadius: 'var(--shape-control)', padding: '12px', color: 'var(--text-default)', fontSize: '0.92rem', resize: 'vertical', fontFamily: 'inherit'}}/></div>}</div></div>}

      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { sessionById, formatMoney, formatDateTime } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

export function U3Confirmation({ id }: { id: string }) {
  const { sessions } = useDemo();
  const { addToast } = useToast();
  const session = sessions.find(s => s.id === id) || sessionById(id);
  
  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Rezerwacja nie znaleziona</h2>
        <p className="empty-state__text">Ta rezerwacja nie istnieje lub nie należy do Ciebie.</p>
        <a href="#/sesje" className="btn btn--primary" style={{ marginTop: '1rem' }}>Moje sesje</a>
      </div>
    );
  }

  const mentor = session.mentorId === 'm1' ? { name: 'Kasia Nowicka', hue: 168 } : { name: 'Mentor', hue: 0 };
  const formattedDate = formatDateTime(session.startsAt, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = formatDateTime(session.startsAt, { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(new Date(session.startsAt).getTime() + session.durationMin * 60000);
  const formattedEndTime = endTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  const [showIcs, setShowIcs] = useState(false);

  const handleAddToCalendar = (type: 'google' | 'outlook' | 'ics') => {
    if (type === 'ics') {
      setShowIcs(true);
      return;
    }
    const title = encodeURIComponent(`Sesja z ${mentor.name} — Kompas`);
    const details = encodeURIComponent(`Cel: ${session.goal}\n\nZarezerwowano przez Kompas — portal mentoringu 1:1`);
    const start = new Date(session.startsAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    if (type === 'google') {
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`, '_blank');
    } else {
      window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${start}&enddt=${end}`, '_blank');
    }
    addToast('Otwarto kalendarz w nowej karcie', 'success');
  };

  return (
    <div className="narrow" style={{ maxWidth: '640px' }}>
      {/* Success header */}
      <div className="success-head" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="ic" style={{ width: '72px', height: '72px', padding: '18px', background: 'var(--status-success-bg)', color: 'var(--status-success-fg)', borderRadius: '50%', marginBottom: '1rem', display: 'inline-grid', placeItems: 'center', fontSize: '2.5rem' }}>
          ✓
        </div>
        <h1 className="type-display font-serif" style={{ marginBottom: '0.5rem' }}>Sesja zarezerwowana!</h1>
        <p className="lead" style={{ marginBottom: 0 }}>Twoja sesja próbna jest potwierdzona.</p>
      </div>

      {/* Booking card */}
      <article className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div className="avatar" style={{ '--h': mentor.hue, '--s': '56px' }} aria-hidden="true">
            {mentor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="type-body" style={{ margin: 0 }}>{mentor.name}</h2>
            <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Sesja próbna · 30 min</p>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: '1rem' }}>
          <dl className="dl" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', margin: 0 }}>
            <dt className="text-muted">Data</dt>
            <dd style={{ textAlign: 'right', fontWeight: 500 }}>{formattedDate}</dd>
            <dt className="text-muted">Godzina</dt>
            <dd style={{ textAlign: 'right' }}>{formattedTime} – {formattedEndTime}</dd>
            <dt className="text-muted">Czas trwania</dt>
            <dd style={{ textAlign: 'right' }}>30 minut</dd>
            <dt className="text-muted">Typ</dt>
            <dd style={{ textAlign: 'right' }}>Sesja próbna</dd>
            <dt className="text-muted">Cel</dt>
            <dd style={{ textAlign: 'right', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.goal || '—'}</dd>
          </dl>
        </div>
      </article>

      {/* Calendar buttons */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 className="type-label" style={{ marginBottom: '8px' }}>Dodaj do kalendarza</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={() => handleAddToCalendar('google')}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google Calendar
          </button>
          <button className="btn btn--ghost" onClick={() => handleAddToCalendar('outlook')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0078D4" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-17v2h-2v2h2v2h2v-2h2v-2h-2v-2h-2z"/></svg>
            Outlook
          </button>
          <button className="btn btn--ghost" onClick={() => handleAddToCalendar('ics')}>
            📅 Plik .ics
          </button>
        </div>
      </section>

      {/* Preparation checklist */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 className="type-label" style={{ marginBottom: '8px' }}>Checklista przygotowania</h3>
        <ul className="checklist" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '8px' }}>
          <li>Przygotuj pytania do mentora</li>
          <li>Sprawdź kamerę i mikrofon przed sesją</li>
          <li>Upewnij się, że masz stabilne internet</li>
          <li>Otwórz link do pokoju 5 min przed rozpoczęciem</li>
          {session.goal && <li>Przeczytaj swój cel sesji: „{session.goal.slice(0, 80)}…“</li>}
        </ul>
      </section>

      {/* Next steps */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h3 className="type-label" style={{ marginBottom: '8px' }}>Co dalej?</h3>
        <ul className="todo" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '8px' }}>
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" />
              <span>Przyjdź do pokoju sesji 5 min przed rozpoczęciem (link aktywny od T-10 min)</span>
            </label>
          </li>
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" />
              <span>Po sesji oceń mentora i zdecyduj o kontynuacji</span>
            </label>
          </li>
          <li>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" />
              <span>Jeśli się spodoba — wybierz plan i kontynuuj naukę</span>
            </label>
          </li>
        </ul>
      </section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <a href={`#/sesje/${session.id}`} className="btn btn--primary btn--block" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}`); }} style={{ flex: 1, minWidth: '200px' }}>
          Zobacz szczegóły sesji
        </a>
        <a href="#/wiadomosci" className="btn btn--ghost btn--block" onClick={e => { e.preventDefault(); navigate('#/wiadomosci'); }} style={{ flex: 1, minWidth: '200px' }}>
          Napisz do mentora
        </a>
      </div>

      {/* ICS download modal */}
      {showIcs && (
        <div className="modal-backdrop" onClick={() => setShowIcs(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setShowIcs(false)} aria-label="Zamknij">×</button>
            <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Plik .ics do pobrania</h3>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Kliknij przycisk poniżej, by pobrać plik kalendarza i zaimportować go ręcznie.</p>
            <button className="btn btn--primary btn--block" onClick={() => {
              const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kompas//Mentoring Session//PL
BEGIN:VEVENT
UID:${session.id}@kompas
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(session.startsAt).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Sesja z ${mentor.name} — Kompas
DESCRIPTION:Cel: ${session.goal}\\n\\nZarezerwowano przez Kompas — portal mentoringu 1:1
LOCATION:Online (pokój wideo Kompas)
END:VEVENT
END:VCALENDAR`;
              const blob = new Blob([icsContent], { type: 'text/calendar' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `kompas-sesja-${session.id}.ics`;
              a.click();
              URL.revokeObjectURL(url);
              addToast('Plik .ics pobrany', 'success');
              setShowIcs(false);
            }}>
              Pobierz plik .ics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
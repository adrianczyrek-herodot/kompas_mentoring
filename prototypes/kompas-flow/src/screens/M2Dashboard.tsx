import React from 'react';
import { useDemo } from '../context/DemoContext';
import { navigate } from '../utils/router';
import { REQUESTS, formatDateTime, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

export function M2Dashboard() {
  const { sessions } = useDemo();
  const { addToast } = useToast();
  const todaySessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.startsAt).toDateString() === DEMO_NOW.toDateString());
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.startsAt) > DEMO_NOW).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()).slice(0, 5);
  const pendingNotes = sessions.filter(s => s.status === 'completed' && s.note && !s.actionItems?.some(a => !a.done)).length;

  const handleAccept = (requestId: string) => {
    addToast('Prośba zaakceptowana (symulacja)', 'success');
  };

  const handleDecline = (requestId: string) => {
    addToast('Prośba odrzucona (symulacja)', 'success');
  };

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="type-page-title font-serif">Panel mentora</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge--success">Profil zweryfikowany</span>
          <span className="badge badge--neutral">Przyjmujesz nowych uczniów</span>
        </div>
      </div>

      {/* Status profilu */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--status-success-bg)', borderColor: 'var(--status-success-fg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>✓</span>
            <strong>Profil opublikowany i widoczny dla uczniów</strong>
          </div>
          <button className="btn btn--ghost btn--s" style={{ marginLeft: 'auto' }}>Edytuj profil</button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpis" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi">
          <span>Godziny ten tydzień</span>
          <strong>8.5 h</strong>
          <em className="up">+12% wg tydzień temu</em>
        </div>
        <div className="kpi">
          <span>Przychód ten miesiąc</span>
          <strong>4 320 PLN</strong>
          <em className="up">+8% wg miesiąc temu</em>
        </div>
        <div className="kpi">
          <span>Konwersja próbnych</span>
          <strong>72%</strong>
          <em>13 z 18 kontynuowało</em>
        </div>
        <div className="kpi">
          <span>Dostępne do wypłaty</span>
          <strong>2 160 PLN</strong>
          <em>Wypłać teraz</em>
        </div>
      </div>

      {/* Dzisiejsze sesje */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Dziś
          {todaySessions.length > 0 && <span className="count">{todaySessions.length}</span>}
        </h2>
        {todaySessions.length === 0 ? (
          <div className="card" style={{ background: 'var(--status-neutral-bg)', borderColor: 'var(--status-neutral-fg)' }}>
            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="empty-state__icon">📅</div>
              <h3 className="empty-state__title">Brak sesji dzisiaj</h3>
              <p className="empty-state__text">Możesz dodać dostępność w kalendarzu, by zwiększać szanse na rezerwacje.</p>
              <a href="#/mentor/kalendarz" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/mentor/kalendarz'); }}>Otwórz kalendarz</a>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todaySessions.map(session => (
              <div key={session.id} className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: 0 }}>
                <div className="date-tile" style={{ background: 'var(--selected-bg)', color: 'var(--selected-border)' }}>
                  <b>{new Date(session.startsAt).getHours()}:{String(new Date(session.startsAt).getMinutes()).padStart(2, '0')}</b>
                  <span>{session.durationMin} min</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{session.goal || 'Sesja'}</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                    Uczeń: {session.student} • {session.type === 'trial' ? 'Sesja próbna' : 'Sesja z planu'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={`#/sesje/${session.id}/pokoj`} className="btn btn--primary btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}/pokoj`); }}>
                    Dołącz
                  </a>
                  <a href={`#/sesje/${session.id}`} className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}`); }}>
                    Szczegóły
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Prośby o sesję próbną */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Prośby o sesję próbną
          {REQUESTS.length > 0 && <span className="count">{REQUESTS.length}</span>}
        </h2>
        {REQUESTS.length === 0 ? (
          <div className="card" style={{ background: 'var(--status-neutral-bg)' }}>
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state__icon">📩</div>
              <h3 className="empty-state__title">Brak nowych prośb</h3>
              <p className="empty-state__text">Uczniowie mogą prosić o sesję próbną z Twoim kalendarzem.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {REQUESTS.map(req => (
              <div key={req.id} className="request card" style={{ borderColor: 'var(--border-divider)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div className="avatar" style={{ '--h': req.hue, '--s': '36px' }} aria-hidden="true">{req.student[0]}</div>
                      <strong>{req.student}</strong>
                      <span className="badge badge--requested">Nowa prośba</span>
                    </div>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
                      {formatDateTime(req.startsAt, { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} • 30 min
                    </p>
                    <p style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{req.goal}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button className="btn btn--primary btn--s" onClick={() => handleAccept(req.id)}>Akceptuj</button>
                    <button className="btn btn--danger btn--s" onClick={() => handleDecline(req.id)}>Odrzuć</button>
                  </div>
                </div>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>SLA: 24h do decyzji. Po upływie: auto-akceptacja, jeśli slot wolny.</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Zadania / przypomnienia */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Do zrobienia</h2>
        <div className="card">
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingNotes > 0 && (
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--status-warning-bg)', borderRadius: 'var(--shape-control)', border: '1px solid var(--status-warning-fg)' }}>
                <span style={{ fontSize: '1.25rem' }}>📝</span>
                <div style={{ flex: 1 }}>
                  <strong>Uzupełnij notatki po sesji</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Masz {pendingNotes} sesji bez notatki. Uczniowie czekają na action items.</p>
                </div>
                <a href="#/mentor/uczniowie" className="btn btn--primary btn--s" onClick={e => { e.preventDefault(); navigate('#/mentor/uczniowie'); }}>Dodaj notatki</a>
              </li>
            )}
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <span style={{ fontSize: '1.25rem' }}>📅</span>
              <div style={{ flex: 1 }}>
                <strong>Sprawdź dostępność na przyszły tydzień</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Upewnij się, że kalendarz jest aktualny.</p>
              </div>
              <a href="#/mentor/kalendarz" className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate('#/mentor/kalendarz'); }}>Otwórz</a>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <span style={{ fontSize: '1.25rem' }}>💰</span>
              <div style={{ flex: 1 }}>
                <strong>Dostępne do wypłaty: 2 160 PLN</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Minimum wypłaty: 100 PLN.</p>
              </div>
              <a href="#/mentor/zarobki" className="btn btn--primary btn--s" onClick={e => { e.preventDefault(); navigate('#/mentor/zarobki'); }}>Wypłać</a>
            </li>
          </ul>
        </div>
      </section>

      {/* Nadchodzące sesje */}
      <section>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Nadchodzące sesje
          <a href="#/mentor/uczniowie" className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate('#/mentor/uczniowie'); }}>Wszystkie →</a>
        </h2>
        {upcomingSessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📅</div>
            <h3 className="empty-state__title">Brak nadchodzących sesji</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingSessions.map(session => (
              <a key={session.id} href={`#/sesje/${session.id}`} onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}`); }} className="list-item">
                <div className="date-tile" style={{ background: 'var(--selected-bg)', color: 'var(--selected-border)' }}>
                  <b>{new Date(session.startsAt).getDate()}</b>
                  <span>{new Date(session.startsAt).toLocaleDateString('pl-PL', { month: 'short' })}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{session.goal || 'Sesja'}</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                    {formatDateTime(session.startsAt, { weekday: 'long', hour: '2-digit', minute: '2-digit' })} • {session.student}
                  </p>
                </div>
                <span className="badge badge--scheduled">Zaplanowana</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
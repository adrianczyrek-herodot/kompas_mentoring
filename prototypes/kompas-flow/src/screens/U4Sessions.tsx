import React, { useState, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import { navigate } from '../utils/router';
import { formatMoney, formatDateTime, canJoin, hasStarted, canCancelFree, DEMO_NOW, Session } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { SessionStatus } from '../utils/mocks';

interface SessionListItemProps {
  session: Session;
}

function SessionListItem({ session }: SessionListItemProps) {
  const { addToast } = useToast();
  const now = DEMO_NOW;
  const joinable = canJoin(session, now);
  const started = hasStarted(session, now);
  const freeCancel = canCancelFree(session, now);

  const statusLabels: Record<SessionStatus, string> = {
    scheduled: 'Zaplanowana',
    completed: 'Zakończona',
    cancelled: 'Anulowana',
    no_show: 'Mentor nie przyszedł',
    disputed: 'Spór',
    requested: 'Oczekuje na akceptację',
  };

  const statusBadgeClass: Record<SessionStatus, string> = {
    scheduled: 'badge--scheduled',
    completed: 'badge--neutral',
    cancelled: 'badge--danger',
    no_show: 'badge--danger',
    disputed: 'badge--warning',
    requested: 'badge--warning',
  };

  return (
    <a href={`#/sesje/${session.id}`} className="list-item" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}`); }} role="listitem">
      <div className="date-tile" style={{ 
        background: session.status === 'scheduled' ? 'var(--selected-bg)' : 'var(--surface-sunken)',
        color: session.status === 'scheduled' ? 'var(--selected-border)' : 'var(--text-muted)'
      }}>
        <b>{new Date(session.startsAt).getDate()}</b>
        <span>{new Date(session.startsAt).toLocaleDateString('pl-PL', { month: 'short' })}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h4 className="type-body" style={{ margin: 0, flex: 1 }}>{session.goal || 'Sesja'}</h4>
          <span className={`badge ${statusBadgeClass[session.status]}`}>{statusLabels[session.status]}</span>
        </div>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
          {formatDateTime(session.startsAt, { weekday: 'long', hour: '2-digit', minute: '2-digit' })} · {session.durationMin} min · {session.type === 'trial' ? 'Próbna' : 'Plan'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        {session.status === 'scheduled' && joinable && (
          <a href={`#/sesje/${session.id}/pokoj`} className="btn btn--primary btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}/pokoj`); }}>
            Dołącz
          </a>
        )}
        {session.status === 'scheduled' && !joinable && !started && (
          <button className="btn btn--ghost btn--s" disabled style={{ opacity: 0.6 }}>
            {started ? 'W toku' : 'Za wcześnie'}
          </button>
        )}
        <a href={`#/sesje/${session.id}`} className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}`); }}>
          Szczegóły
        </a>
      </div>
    </a>
  );
}

export function U4Sessions() {
  const { sessions, balances, subscription, currentStudent, role } = useDemo();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [filterMentor, setFilterMentor] = useState<string>('');

  const now = DEMO_NOW;

  const upcomingSessions = useMemo(() => 
    sessions
      .filter(s => s.status === 'scheduled' && new Date(s.startsAt) >= now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
  [sessions]);

  const pastSessions = useMemo(() => 
    sessions
      .filter(s => s.status !== 'scheduled' || new Date(s.startsAt) < now)
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
  [sessions]);

  const filteredUpcoming = filterMentor 
    ? upcomingSessions.filter(s => s.mentorId === filterMentor)
    : upcomingSessions;
  
  const filteredPast = filterMentor
    ? pastSessions.filter(s => s.mentorId === filterMentor)
    : pastSessions;

  const mentorsWithSessions = useMemo(() => {
    const mentorIds = new Set(sessions.map(s => s.mentorId));
    return Array.from(mentorIds);
  }, [sessions]);

  const nextSession = upcomingSessions[0];

  const currentSessions = activeTab === 'upcoming' ? filteredUpcoming : filteredPast;

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state__icon">{activeTab === 'upcoming' ? '📅' : '📋'}</div>
      <h3 className="empty-state__title">
        {activeTab === 'upcoming' ? 'Brak nadchodzących sesji' : 'Brak minionych sesji'}
      </h3>
      <p className="empty-state__text">
        {activeTab === 'upcoming' 
          ? 'Zarezerwuj swoją pierwszą sesję próbną, by zacząć.'
          : 'Twoja historia sesji pojawi się tutaj po pierwszej spotkaniu.'
        }
      </p>
      {activeTab === 'upcoming' && (
        <a href="#/mentorzy" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/mentorzy'); }}>
          Znajdź mentora
        </a>
      )}
    </div>
  );

  const renderSessionList = () => (
    <div className="list" role="list" aria-label={`${activeTab === 'upcoming' ? 'Nadchodzące' : 'Minione'} sesje`}>
      {currentSessions.map(session => (
        <SessionListItem key={session.id} session={session} />
      ))}
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Moje sesje</h1>
        <a href="#/mentorzy" className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate('#/mentorzy'); }}>
          Znajdź mentora
        </a>
      </div>

      {/* Balance & Subscription summary */}
      {((balances && Object.keys(balances).length > 0) || subscription) && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {subscription && (
            <div className="card" style={{ flex: 1, minWidth: '280px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="type-label">Aktywny plan</span>
                <span className="badge badge--success">{subscription.status === 'active' ? 'Aktywny' : subscription.status}</span>
              </div>
              <div className="price" style={{ fontFamily: 'var(--font-family-serif)' }}>
                {subscription.perWeek}×{subscription.durationMin} min / tydz.
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>
                Odnowienie: {new Date(subscription.renewsOn).toLocaleDateString('pl-PL')} · 
                Mentor: {subscription.mentorId === 'm1' ? 'Kasia Nowicka' : subscription.mentorId}
              </p>
            </div>
          )}
          {Object.entries(balances || {}).map(([mentorId, count]) => (
            <div key={mentorId} className="card" style={{ padding: '1rem', minWidth: '160px' }}>
              <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saldo u mentora</div>
              <div className="price" style={{ fontFamily: 'var(--font-family-serif)' }}>{count} sesje</div>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>
                {mentorId === 'm1' ? 'Kasia Nowicka' : mentorId}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Next session hero */}
      {nextSession && (
        <div className="card next-session" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="date-tile" style={{ background: 'var(--selected-bg)', color: 'var(--selected-border)' }}>
              <b>{new Date(nextSession.startsAt).getDate()}</b>
              <span>{new Date(nextSession.startsAt).toLocaleDateString('pl-PL', { month: 'short' })}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 className="type-body" style={{ margin: 0 }}>{nextSession.goal || 'Sesja'}</h3>
              <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                {formatDateTime(nextSession.startsAt, { weekday: 'long', hour: '2-digit', minute: '2-digit' })} · {nextSession.durationMin} min
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span className={`badge ${nextSession.status === 'scheduled' ? 'badge--scheduled' : 'badge--completed'}`}>
                {nextSession.status === 'scheduled' ? 'Zaplanowana' : nextSession.status}
              </span>
              {canJoin(nextSession, DEMO_NOW) && (
                <a href={`#/sesje/${nextSession.id}/pokoj`} className="btn btn--primary btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${nextSession.id}/pokoj`); }}>
                  Dołącz
                </a>
              )}
              <a href={`#/sesje/${nextSession.id}`} className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${nextSession.id}`); }}>
                Szczegóły
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Filtr sesji" style={{ marginBottom: '1rem' }}>
        <button
          role="tab"
          aria-selected={activeTab === 'upcoming'}
          className={`tab ${activeTab === 'upcoming' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Nadchodzące ({filteredUpcoming.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'past'}
          className={`tab ${activeTab === 'past' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Minione ({filteredPast.length})
        </button>
      </div>

      {/* Mentor filter */}
      {mentorsWithSessions.length > 1 && (
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <label htmlFor="mentor-filter" className="text-muted" style={{ fontSize: '0.875rem' }}>Filtruj po mentorze:</label>
          <select
            id="mentor-filter"
            className="select-s"
            value={filterMentor}
            onChange={e => setFilterMentor(e.target.value)}
          >
            <option value="">Wszyscy mentorzy</option>
            {mentorsWithSessions.map(mid => (
              <option key={mid} value={mid}>{mid === 'm1' ? 'Kasia Nowicka' : mid}</option>
            ))}
          </select>
          {filterMentor && (
            <button className="btn btn--ghost btn--s" onClick={() => setFilterMentor('')}>Wyczyść</button>
          )}
        </div>
      )}

      {/* Session list */}
      {currentSessions.length === 0 ? (
        renderEmptyState()
      ) : (
        renderSessionList()
      )}
    </div>
  );
}
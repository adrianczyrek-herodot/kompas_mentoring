import React, { useState, useMemo } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { mentorById, MENTORS, weekSlots, formatMoney, formatTime, formatDayName, formatDayNumber, DEMO_NOW } from '../utils/mocks';
import { Mentor } from '../utils/mocks';

export function P3Profile({ id }: { id: string }) {
  const { role, startBooking } = useDemo();
  const mentor = mentorById(id);
  
  if (!mentor) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Profil niedostępny</h2>
        <p className="empty-state__text">Ten mentor nie istnieje lub profil został zawieszony.</p>
        <a href="#/mentorzy" className="btn btn--primary" style={{ marginTop: '1rem' }}>Wróć do wyszukiwarki</a>
      </div>
    );
  }

  const [activeWeek, setActiveWeek] = useState(0);
  const weekData = useMemo(() => weekSlots(mentor, activeWeek, DEMO_NOW), [mentor, activeWeek]);
  const nextWeek = weekSlots(mentor, activeWeek + 1, DEMO_NOW);
  const hasFreeSlots = weekData.some(d => d.slots.some(s => !s.taken));
  const hasFreeSlotsNext = nextWeek.some(d => d.slots.some(s => !s.taken));
  const nextFreeWeekNum = hasFreeSlots ? activeWeek : (hasFreeSlotsNext ? activeWeek + 1 : null);

  const allSlots = weekData.flatMap(d => d.slots);
  const freeSlotsCount = allSlots.filter(s => !s.taken).length;

  const handleBookTrial = () => {
    startBooking(mentor.id, 'trial');
    navigate(`#/rezerwacja/${mentor.id}`);
  };

  if (!mentor.acceptingNew) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="notice notice--warn" style={{ marginBottom: '1rem', justifyContent: 'center' }}>
          ⚠️ Ten mentor nie przyjmuje nowych uczniów.
        </div>
        <p className="text-muted">Możesz dodać go do ulubionych i sprawdzić później.</p>
      </div>
    );
  }

  return (
    <div className="layout-profile">
      <div>
        {/* Profile Hero */}
        <section className="profile-hero" aria-labelledby="mentor-name">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 id="mentor-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              {mentor.name}
              {mentor.verified && <span className="verified" aria-label="Zweryfikowany mentor">✓</span>}
            </h1>
            <p className="text-muted" style={{ margin: '4px 0 0' }}>{mentor.headline}</p>
            <div className="tags" style={{ marginTop: '8px' }}>
              {mentor.categories.map(c => <span key={c} className="tag">{c}</span>)}
              {mentor.tags.slice(0, 5).map(t => <span key={t} className="tag tag--soft">{t}</span>)}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span>📍 {mentor.country}</span>
              <span>🌐 {mentor.languages.join(', ')}</span>
              <span>💼 {mentor.yearsExp} lat doświadczenia</span>
            </div>
          </div>
          <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
            <div className="avatar" style={{ '--h': mentor.hue, '--s': '120px', fontSize: '40px' }} aria-hidden="true">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </section>

        {/* Video placeholder */}
        <section style={{ marginTop: '1.5rem' }}>
          <div className="video-ph" style={{ background: `radial-gradient(circle at 30% 30%, hsl(${mentor.hue} 40% 30%), hsl(${mentor.hue} 40% 15%))` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'inline-grid', placeItems: 'center', marginBottom: '12px' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#fff', marginLeft: '4px' }}>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <p style={{ color: '#e7f0ec', fontSize: '1rem' }}>Wideo-wprowadzenie</p>
              <p className="muted-inv" style={{ fontSize: '0.8rem' }}>Kliknij, by odtworzyć (symulacja)</p>
            </div>
          </div>
        </section>

        {/* About */}
        <section style={{ marginTop: '1.5rem' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '0.75rem' }}>O mnie</h2>
          <p style={{ lineHeight: 1.7, color: 'var(--text-default)' }}>{mentor.bio}</p>
          {mentor.companies.length > 0 && (
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
              <strong>Poprzednie firmy:</strong> {mentor.companies.join(', ')}
            </p>
          )}
        </section>

        {/* Stats */}
        <section style={{ marginTop: '1.5rem' }}>
          <div className="stats" role="img" aria-label="Statystyki mentora">
            <div>
              <strong>{mentor.rating.toFixed(1)}</strong>
              <span>Średnia ocena</span>
            </div>
            <div>
              <strong>{mentor.reviewsCount}</strong>
              <span>Opinii</span>
            </div>
            <div>
              <strong>{mentor.sessions}</strong>
              <span>Sesji</span>
            </div>
            <div>
              <strong>{mentor.returningPct}%</strong>
              <span>Powracających</span>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="type-section-title font-serif" style={{ margin: 0 }}>Opinie</h2>
            <a href="#/mentorzy" className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate('#/mentorzy'); }}>Wszystkie opinie →</a>
          </div>
          {mentor.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mentor.reviews.slice(0, 3).map((review, idx) => (
                <article key={idx} className="card" style={{ border: '1px solid var(--border-divider)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="avatar" style={{ '--h': 0, '--s': '36px' }} aria-hidden="true">{review.author[0]}</div>
                    <div>
                      <strong>{review.author}</strong>
                      <div className="stars-line" style={{ color: 'var(--action-primary)', fontSize: '0.875rem' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{review.date}</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{review.text}</p>
                  {review.tags.length > 0 && (
                    <div className="tags" style={{ marginTop: '8px' }}>
                      {review.tags.map(t => <span key={t} className="tag tag--soft">{t}</span>)}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="card" style={{ background: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-fg)' }}>
              <p style={{ margin: 0, color: 'var(--status-warning-fg)' }}>
                <strong>Nowy mentor</strong> — jeszcze nie ma opinii. Bądź pierwszym, kto go oceni!
              </p>
            </div>
          )}
        </section>

        {/* Similar mentors */}
        <section style={{ marginTop: '1.5rem' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Podobni mentorzy</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {MENTORS.filter(m => m.id !== mentor.id && m.categories.some(c => mentor.categories.includes(c))).slice(0, 3).map(m => (
              <article key={m.id} className="card--mini" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={`#/mentorzy/${m.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${m.id}`); }} style={{ flexShrink: 0 }}>
                    <div className="avatar" style={{ '--h': m.hue, '--s': '64px' }} aria-hidden="true">{m.name.split(' ').map(n => n[0]).join('')}</div>
                  </a>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={`#/mentorzy/${m.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${m.id}`); }} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 className="mentor-card__headline" style={{ margin: 0 }}>{m.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.875rem', margin: '4px 0 0' }}>{m.headline}</p>
                    </a>
                    <div className="tags">
                      {m.categories.slice(0, 2).map(c => <span key={c} className="tag">{c}</span>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <span className="rating" style={{ color: 'var(--action-primary)' }}>
                        {'★'.repeat(Math.floor(m.rating))}{'☆'.repeat(5 - Math.floor(m.rating))}
                        <span className="text-muted" style={{ fontWeight: 400, marginLeft: '4px' }}>{m.rating} ({m.reviewsCount})</span>
                      </span>
                      <span className="price" style={{ fontFamily: 'var(--font-family-serif)' }}>{formatMoney(m.trialPrice)}/30 min</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Sidebar - Booking */}
      <aside className="booking-box" aria-labelledby="booking-title">
        <div className="card" style={{ position: 'sticky', top: '100px' }}>
          <h3 id="booking-title" className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Zarezerwuj sesję</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Sesja próbna</label>
            <div className="price" style={{ fontFamily: 'var(--font-family-serif)', color: 'var(--text-default)' }}>
              {formatMoney(mentor.trialPrice)}
              <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}> / 30 min</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
              Maks. jedna sesja próbna na parę uczeń–mentor. Gwarancja: nie pasuje? Darmowa zamiana mentora lub zwrot.
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Dostępność w tym tygodniu</label>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              {freeSlotsCount} wolnych terminów. Termin w Twojej strefie czasowej.
            </p>
          </div>

          <button 
            className="btn btn--primary btn--block btn--lg"
            onClick={handleBookTrial}
            disabled={!mentor.acceptingNew}
            style={{ minHeight: '52px', fontSize: '1rem' }}
          >
            Wybierz termin →
          </button>

          <div className="guarantee" style={{ marginTop: '1rem' }}>
            <span className="ic" style={{ color: 'var(--ok)' }}>✓</span>
            <span>Gwarancja sesji próbnej: darmowa zamiana mentora lub zwrot, jeśli nie pasuje.</span>
          </div>
        </div>

        {/* Availability week preview */}
        <div className="card" style={{ marginTop: '1rem', position: 'sticky', top: '320px' }}>
          <h4 className="type-label" style={{ marginBottom: '0.75rem' }}>Tydzień dostępności</h4>
          <div className="week">
            {weekData.map(({ day, slots }) => {
              const freeCount = slots.filter(s => !s.taken).length;
              const isToday = day.toDateString() === DEMO_NOW.toDateString();
              return (
                <div key={day.toISOString()} className="week__day" style={{ opacity: freeCount === 0 ? 0.5 : 1 }}>
                  <div className="week__label" style={{ color: isToday ? 'var(--action-primary)' : 'var(--text-muted)' }}>
                    {isToday ? 'Dziś' : formatDayName(day)}
                    <br />
                    <b>{formatDayNumber(day)}</b>
                  </div>
                  {slots.length === 0 ? (
                    <div className="slot-none" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '8px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                      Brak slotów
                    </div>
                  ) : (
                    slots.map(slot => (
                      <button
                        key={slot.iso}
                        className={`week__slot ${slot.taken ? 'is-taken' : ''}`}
                        disabled={slot.taken}
                        style={{ 
                          display: 'block', width: '100%', textAlign: 'left', 
                          background: slot.taken ? 'var(--surface-sunken)' : 'var(--selected-bg)',
                          color: slot.taken ? 'var(--text-muted)' : 'var(--selected-border)',
                          border: 'none', padding: '4px 8px', borderRadius: 'var(--shape-tag)',
                          fontSize: '0.75rem', cursor: slot.taken ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {formatTime(slot.iso)} {slot.taken ? '✕' : ''}
                      </button>
                    ))
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
            <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0}>
              ← Poprzedni
            </button>
            <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => w + 1)}>
              Następny →
            </button>
          </div>
          {nextFreeWeekNum !== null && nextFreeWeekNum !== activeWeek && (
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Następny wolny termin: tydzień {nextFreeWeekNum + 1}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile sticky bar */}
      <div className="sticky-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="price" style={{ fontFamily: 'var(--font-family-serif)', color: 'var(--text-default)' }}>
            {formatMoney(mentor.trialPrice)} / 30 min
          </div>
          <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Sesja próbna</p>
        </div>
        <button className="btn btn--primary btn--lg" onClick={handleBookTrial} disabled={!mentor.acceptingNew} style={{ minHeight: '48px' }}>
          Zarezerwuj próbną
        </button>
      </div>
    </div>
  );
}
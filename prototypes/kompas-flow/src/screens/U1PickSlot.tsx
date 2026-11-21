import React, { useState, useMemo, useEffect } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { mentorById, weekSlots, nextFreeWeek, formatTime, formatDayName, formatDayNumber, DEMO_NOW, Mentor } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

export function U1PickSlot({ mentorId }: { mentorId: string }) {
  const { draft, updateDraft, setDraft, viewState, simulateSlotConflict } = useDemo();
  const { addToast } = useToast();
  const mentor = mentorById(mentorId);
  const [activeWeek, setActiveWeek] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState('Europe/Warsaw');
  const [showTimezoneSelect, setShowTimezoneSelect] = useState(false);

  if (!mentor) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Mentor nie znaleziony</h2>
        <p className="empty-state__text">Ten mentor nie istnieje.</p>
        <a href="#/mentorzy" className="btn btn--primary" style={{ marginTop: '1rem' }}>Wróć do wyszukiwarki</a>
      </div>
    );
  }

  const weekData = useMemo(() => weekSlots(mentor, activeWeek, DEMO_NOW), [mentor, activeWeek]);
  const allSlots = weekData.flatMap(d => d.slots);
  const freeSlotsCount = allSlots.filter(s => !s.taken).length;
  const nextWeekNum = nextFreeWeek(mentor, activeWeek);
  
  // Initialize draft if not set
  useEffect(() => {
    if (!draft || draft.mentorId !== mentorId) {
      setDraft({ mentorId, durationMin: 30, type: 'trial' });
    }
  }, [mentorId, draft, setDraft]);

  const handleSlotClick = (slotIso: string) => {
    if (simulateSlotConflict) {
      addToast('Ten termin został właśnie zajęty (symulacja 409)', 'error');
      return;
    }
    setSelectedSlot(slotIso);
    updateDraft({ startsAt: slotIso });
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      addToast('Wybierz termin sesji', 'error');
      return;
    }
    navigate(`#/rezerwacja/${mentorId}/platnosc`);
  };

  const timezones = [
    'Europe/Warsaw', 'Europe/Berlin', 'Europe/London', 'Europe/Paris',
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'UTC',
  ];

  return (
    <div>
      {/* Mentor Summary Bar */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="avatar" style={{ '--h': mentor.hue, '--s': '48px' }} aria-hidden="true">
          {mentor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="type-body" style={{ margin: 0 }}>{mentor.name}</h2>
          <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.875rem' }}>{mentor.headline}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="price" style={{ fontFamily: 'var(--font-family-serif)', color: 'var(--text-default)' }}>
            {mentor.trialPrice > 0 ? `Od ${mentor.trialPrice} PLN` : 'Gratis'}
          </div>
          <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>Sesja próbna 30 min</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="steps-bar" style={{ marginBottom: '1rem' }} role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={3} aria-label="Kroki rezerwacji">
        <span className="is-done">1. Mentor ✓</span>
        <span className="is-active">2. Termin</span>
        <span>3. Płatność</span>
        <span>4. Potwierdzenie</span>
      </div>

      {/* Duration toggle - fixed for trial */}
      <div style={{ marginBottom: '1rem' }}>
        <label className="type-label" style={{ display: 'block', marginBottom: '8px' }}>Długość sesji</label>
        <div className="segmented" role="radiogroup" aria-label="Długość sesji">
          <label style={{ opacity: 1 }}>
            <input type="radio" name="duration" value="30" checked={true} disabled />
            <span>30 min (proba)</span>
          </label>
          <label style={{ opacity: 0.5, pointerEvents: 'none' }}>
            <input type="radio" name="duration" value="60" disabled />
            <span>60 min (plan)</span>
          </label>
        </div>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Sesja próbna ma zawsze 30 minut. Po niej wybierzesz plan 30/60 min.</p>
      </div>

      {/* Week navigation */}
      <div className="week-nav" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0} aria-label="Poprzedni tydzień">←</button>
          <span className="type-label" style={{ minWidth: '160px', textAlign: 'center' }}>
            Tydzień {activeWeek === 0 ? 'ten' : activeWeek === 1 ? 'następny' : `#${activeWeek + 1}`}
          </span>
          <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => w + 1)} aria-label="Następny tydzień">→</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="timezone-select" className="text-muted" style={{ fontSize: '0.8rem' }}>Strefa:</label>
          <select
            id="timezone-select"
            className="select-s w-date"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
          >
            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>

      {/* Slot grid */}
      <section aria-labelledby="slots-title">
        <h3 id="slots-title" className="type-label" style={{ marginBottom: '0.5rem' }}>Wolne terminy (w strefie {timezone})</h3>
        
        {freeSlotsCount === 0 && (
          <div className="card" style={{ background: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-fg)', padding: '1.5rem' }}>
            <p style={{ margin: 0, color: 'var(--status-warning-fg)' }}>
              <strong>Brak wolnych terminów w tym tygodniu.</strong>
              {nextWeekNum !== null && (
                <button 
                  className="btn btn--ghost btn--s" 
                  style={{ marginLeft: '8px' }}
                  onClick={() => setActiveWeek(nextWeekNum)}
                >
                  Sprawdź tydzień {nextWeekNum + 1} →
                </button>
              )}
            </p>
          </div>
        )}

        {freeSlotsCount > 0 && (
          <div className="slot-grid" role="list" aria-label="Dostępne terminy">
            {weekData.map(({ day, slots }) => {
              const dayFree = slots.filter(s => !s.taken);
              const isToday = day.toDateString() === DEMO_NOW.toDateString();
              return (
                <div key={day.toISOString()} className="slot-col" role="listitem">
                  <div className="slot-col__head">
                    <span>{isToday ? 'Dziś' : formatDayName(day)}</span>
                    <b>{formatDayNumber(day)}</b>
                  </div>
                  {slots.length === 0 ? (
                    <div className="slot-none" style={{ gridColumn: '1 / -1', padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Brak dostępności
                    </div>
                  ) : (
                    slots.map(slot => (
                      <button
                        key={slot.iso}
                        className={`slot ${slot.taken ? '' : ''} ${selectedSlot === slot.iso ? 'is-selected' : ''}`}
                        disabled={slot.taken}
                        onClick={() => !slot.taken && handleSlotClick(slot.iso)}
                        aria-label={`${formatDayName(day)} ${formatDayNumber(day)}, ${formatTime(slot.iso)}${slot.taken ? ', zajęty' : ', wolny'}`}
                        aria-pressed={selectedSlot === slot.iso}
                        style={{
                          borderColor: slot.taken ? 'var(--border-divider)' : 
                                       selectedSlot === slot.iso ? 'var(--selected-border)' : 'var(--selected-border)',
                          background: slot.taken ? 'transparent' :
                                      selectedSlot === slot.iso ? 'var(--selected-bg)' : 'var(--selected-bg)',
                          color: slot.taken ? 'var(--text-muted)' :
                                 selectedSlot === slot.iso ? 'var(--selected-border)' : 'var(--selected-border)',
                          textDecoration: slot.taken ? 'line-through' : 'none',
                        }}
                      >
                        {formatTime(slot.iso)}
                      </button>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
          Minimalne wyprzedzenie: 6 h. Termin zablokowany na 10 min po wybraniu (hold).
        </p>
      </section>

      {/* Timezone selector popover */}
      {showTimezoneSelect && (
        <div className="modal-backdrop" onClick={() => setShowTimezoneSelect(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
            <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Wybierz strefę czasową</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflow: 'auto' }}>
              {timezones.map(tz => (
                <button
                  key={tz}
                  className="btn btn--ghost"
                  onClick={() => { setTimezone(tz); setShowTimezoneSelect(false); }}
                  style={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 'var(--shape-control)' }}
                >
                  {tz}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Continue button */}
      <div style={{ position: 'sticky', bottom: '120px', zIndex: 50 }}>
        <button 
          className="btn btn--primary btn--block btn--lg"
          onClick={handleContinue}
          disabled={!selectedSlot}
          style={{ minHeight: '52px', fontSize: '1rem' }}
        >
          Dalej do płatności →
        </button>
      </div>
    </div>
  );
}
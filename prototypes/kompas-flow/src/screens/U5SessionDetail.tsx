import React, { useState } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { sessionById, formatMoney, formatDateTime, canCancelFree, canJoin, hasStarted, DEMO_NOW, FREE_CANCEL_HOURS } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { SessionStatus } from '../utils/mocks';

export function U5SessionDetail({ id }: { id: string }) {
  const { sessions, cancelBooking, rescheduleBooking, currentStudent } = useDemo();
  const { addToast } = useToast();
  const session = sessions.find(s => s.id === id) || sessionById(id);
  
  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Sesja nie znaleziona</h2>
        <p className="empty-state__text">Ta sesja nie istnieje lub nie należy do Ciebie.</p>
        <a href="#/sesje" className="btn btn--primary" style={{ marginTop: '1rem' }}>Moje sesje</a>
      </div>
    );
  }

  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  const now = DEMO_NOW;
  const joinable = canJoin(session, now);
  const started = hasStarted(session, now);
  const freeCancel = canCancelFree(session, now);
  const mentor = session.mentorId === 'm1' ? { name: 'Kasia Nowicka', hue: 168, rate60: 180 } : { name: 'Mentor', hue: 0, rate60: 0 };
  const formattedDate = formatDateTime(session.startsAt, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = formatDateTime(session.startsAt, { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(new Date(session.startsAt).getTime() + session.durationMin * 60000);
  const formattedEndTime = endTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

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

  const handleCancel = () => {
    cancelBooking(session.id);
    addToast('Sesja anulowana', 'success');
    setShowCancelDialog(false);
    navigate('#/sesje');
  };

  const handleReschedule = () => {
    if (!rescheduleSlot) {
      addToast('Wybierz nowy termin', 'error');
      return;
    }
    rescheduleBooking(session.id, rescheduleSlot);
    addToast('Sesja przełożona', 'success');
    setShowReschedule(false);
    setRescheduleSlot(null);
  };

  const handleDispute = () => {
    if (!disputeReason || !disputeDescription.trim() || disputeDescription.length < 30) {
      addToast('Wypełnij powód i opis (min. 30 znaków)', 'error');
      return;
    }
    addToast('Zgłoszenie problemu wysłane do administratora', 'success');
    setShowDisputeDialog(false);
    setDisputeReason('');
    setDisputeDescription('');
  };

  return (
    <div>
      {/* Session header */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div className="avatar" style={{ '--h': mentor.hue, '--s': '56px' }} aria-hidden="true">
            {mentor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h1 className="type-page-title font-serif" style={{ margin: 0 }}>{session.goal || 'Sesja'}</h1>
              <span className={`badge ${statusBadgeClass[session.status]}`}>{statusLabels[session.status]}</span>
            </div>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
              {mentor.name} · {session.type === 'trial' ? 'Sesja próbna' : 'Sesja z planu'} · {session.durationMin} min
            </p>
          </div>
        </div>
        
        <dl className="dl" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-divider)' }}>
          <dt className="text-muted">Data</dt>
          <dd style={{ textAlign: 'right', fontWeight: 500 }}>{formattedDate}</dd>
          <dt className="text-muted">Godzina</dt>
          <dd style={{ textAlign: 'right' }}>{formattedTime} – {formattedEndTime}</dd>
          <dt className="text-muted">Czas trwania</dt>
          <dd style={{ textAlign: 'right' }}>{session.durationMin} minut</dd>
          <dt className="text-muted">Typ</dt>
          <dd style={{ textAlign: 'right' }}>{session.type === 'trial' ? 'Sesja próbna' : 'Sesja z planu'}</dd>
          {session.type === 'trial' && (
            <>
              <dt className="text-muted">Cena próbnej</dt>
              <dd style={{ textAlign: 'right' }}>{formatMoney(mentor.rate60 > 0 ? Math.round(mentor.rate60 * 0.5) : 0)}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Policy notice for upcoming sessions */}
      {session.status === 'scheduled' && (
        <div className="card" style={{ marginBottom: '1rem', background: freeCancel ? 'var(--status-success-bg)' : 'var(--status-warning-bg)', borderColor: freeCancel ? 'var(--status-success-fg)' : 'var(--status-warning-fg)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem' }}>{freeCancel ? '✓' : '⚠️'}</span>
            <div>
              <strong>{freeCancel ? 'Możesz anulować lub przełożyć bez kosztów' : 'Anulowanie lub przełożenie wiąże się z utratą sesji'}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                {freeCancel 
                  ? `Zasada 12 h: do ${FREE_CANCEL_HOURS} h przed sesją anulowanie i przełożenie są darmowe. Po tym terminie sesja przepada.`
                  : `Zostało mniej niż ${FREE_CANCEL_HOURS} h do sesji. Anulowanie lub przełożenie spowoduje utratę tej sesji (nie wraca do salda). Wyjątek: decyzja admina w sporze.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions for upcoming sessions */}
      {session.status === 'scheduled' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {joinable && (
            <a href={`#/sesje/${session.id}/pokoj`} className="btn btn--primary btn--lg" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}/pokoj`); }} style={{ flex: 1, minWidth: '200px' }}>
              Dołącz do pokoju
            </a>
          )}
          {!joinable && !started && (
            <button className="btn btn--primary btn--lg" disabled style={{ flex: 1, minWidth: '200px', opacity: 0.6 }}>
              Dołącz możliwe od T-10 min
            </button>
          )}
          {started && (
            <a href={`#/sesje/${session.id}/pokoj`} className="btn btn--primary btn--lg" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}/pokoj`); }} style={{ flex: 1, minWidth: '200px' }}>
              Wróć do pokoju
            </a>
          )}
          <button 
            className="btn btn--secondary" 
            onClick={() => setShowReschedule(true)}
            disabled={started}
          >
            Przełóż
          </button>
          <button 
            className="btn btn--danger" 
            onClick={() => setShowCancelDialog(true)}
            disabled={started}
          >
            Anuluj
          </button>
          <button 
            className="btn btn--ghost" 
            onClick={() => setShowDisputeDialog(true)}
          >
            Zgłoś problem
          </button>
        </div>
      )}

      {/* Completed session - review link */}
      {session.status === 'completed' && !session.reviewed && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
          <a href={`#/sesje/${session.id}/ocena`} className="btn btn--primary btn--block" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}/ocena`); }}>
            Oceń tę sesję
          </a>
        </div>
      )}

      {/* Reschedule sheet */}
      {showReschedule && (
        <div className="modal-backdrop" onClick={() => setShowReschedule(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', maxHeight: '90vh', overflow: 'auto' }}>
            <button className="modal__close" onClick={() => setShowReschedule(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Przełóż sesję</h2>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>Wybierz nowy termin. Stary termin zostanie zwolniony.</p>
            
            <RescheduleSlotPicker 
              mentorId={session.mentorId} 
              selectedSlot={rescheduleSlot}
              onSelect={setRescheduleSlot}
              onConfirm={handleReschedule}
              onClose={() => setShowReschedule(false)}
            />
          </div>
        </div>
      )}

      {/* Cancel dialog */}
      {showCancelDialog && (
        <div className="modal-backdrop" onClick={() => setShowCancelDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal__close" onClick={() => setShowCancelDialog(false)} aria-label="Zamknij">×</button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>{freeCancel ? '✓' : '⚠️'}</span>
              <div>
                <h2 className="type-page-title font-serif" style={{ marginBottom: '0.5rem' }}>
                  {freeCancel ? 'Anuluj bez kosztów' : 'Anuluj — sesja przepadnie'}
                </h2>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  {freeCancel 
                    ? `Jesteś w terminie (>${FREE_CANCEL_HOURS} h przed sesją). Anulowanie jest darmowe — sesja wróci do salda lub zostanie zwrócona.`
                    : `Zostało mniej niż ${FREE_CANCEL_HOURS} h do sesji. Anulowanie spowoduje utratę tej sesji (nie wraca do salda, nie ma zwrotu). Wyjątek: decyzja admina w sporze.`
                  }
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowCancelDialog(false)}>Nie, zostawiam</button>
              <button className="btn btn--danger" onClick={handleCancel}>Tak, anuluj</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute dialog */}
      {showDisputeDialog && (
        <div className="modal-backdrop" onClick={() => setShowDisputeDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal__close" onClick={() => setShowDisputeDialog(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Zgłoś problem z sesją</h2>
            
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="dispute-reason" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Powód zgłoszenia *</label>
              <select
                id="dispute-reason"
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                className="input"
                required
              >
                <option value="">Wybierz powód</option>
                <option value="mentor_no_show">Mentor się nie pojawił</option>
                <option value="session_mismatch">Sesja niezgodna z opisem</option>
                <option value="technical_issues">Problemy techniczne</option>
                <option value="inappropriate_behavior">Nieodpowiednie zachowanie</option>
                <option value="other">Inne</option>
              </select>
            </div>

            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="dispute-description" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Opisz problem (min. 30 znaków) *</label>
              <textarea
                id="dispute-description"
                value={disputeDescription}
                onChange={e => setDisputeDescription(e.target.value)}
                className="textarea"
                rows={4}
                minLength={30}
                maxLength={1000}
                required
              />
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{disputeDescription.length}/1000 znaków</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowDisputeDialog(false)}>Anuluj</button>
              <button className="btn btn--primary" onClick={handleDispute} disabled={!disputeReason || disputeDescription.length < 30}>Wyślij zgłoszenie</button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor note & action items */}
      {session.note && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Notatka mentora po sesji</h2>
          <div className="card" style={{ background: 'var(--surface-sunken)' }}>
            <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{session.note}</p>
          </div>
          
          {session.actionItems && session.actionItems.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 className="type-label" style={{ marginBottom: '8px' }}>Zadania (action items)</h3>
              <ul className="todo" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '8px' }}>
                {session.actionItems.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input type="checkbox" checked={item.done} readOnly />
                    <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-muted)' : 'var(--text-default)' }}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Session goal */}
      <section>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Cel sesji</h2>
        <div className="card">
          <p style={{ margin: 0, lineHeight: 1.7 }}>{session.goal || 'Nie podano celu'}</p>
        </div>
      </section>
    </div>
  );
}

function RescheduleSlotPicker({ mentorId, selectedSlot, onSelect, onConfirm, onClose }: { mentorId: string; selectedSlot: string | null; onSelect: (slot: string) => void; onConfirm: () => void; onClose: () => void }) {
  const { weekSlots, DEMO_NOW, formatTime, formatDayName, formatDayNumber, nextFreeWeek } = require('../utils/mocks');
  const { mentorById } = require('../utils/mocks');
  const [activeWeek, setActiveWeek] = useState(0);
  const mentor = mentorById(mentorId);
  
  if (!mentor) return <div className="empty-state">Mentor nie znaleziony</div>;
  
  const weekData = weekSlots(mentor, activeWeek, DEMO_NOW);
  const freeSlotsCount = weekData.flatMap(d => d.slots).filter(s => !s.taken).length;
  const nextWeekNum = nextFreeWeek(mentor, activeWeek);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => Math.max(0, w - 1))} disabled={activeWeek === 0}>← Poprzedni</button>
        <span className="type-label">Tydzień {activeWeek === 0 ? 'ten' : activeWeek === 1 ? 'następny' : `#${activeWeek + 1}`}</span>
        <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => w + 1)}>Następny →</button>
      </div>
      
      {freeSlotsCount === 0 && (
        <div className="card" style={{ background: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-fg)' }}>
          <p style={{ margin: 0, color: 'var(--status-warning-fg)' }}>
            <strong>Brak wolnych terminów w tym tygodniu.</strong>
            {nextWeekNum !== null && (
              <button className="btn btn--ghost btn--s" style={{ marginLeft: '8px' }} onClick={() => setActiveWeek(nextWeekNum)}>
                Sprawdź tydzień {nextWeekNum + 1}
              </button>
            )}
          </p>
        </div>
      )}
      
      {freeSlotsCount > 0 && (
        <div className="slot-grid" style={{ maxHeight: '400px', overflow: 'auto' }}>
          {weekData.map(({ day, slots }) => {
            const isToday = day.toDateString() === DEMO_NOW.toDateString();
            return (
              <div key={day.toISOString()} className="slot-col">
                <div className="slot-col__head">
                  <span>{isToday ? 'Dziś' : formatDayName(day)}</span>
                  <b>{formatDayNumber(day)}</b>
                </div>
                {slots.map(slot => (
                  <button
                    key={slot.iso}
                    className={`slot ${slot.taken ? '' : ''} ${selectedSlot === slot.iso ? 'is-selected' : ''}`}
                    disabled={slot.taken}
                    onClick={() => !slot.taken && onSelect(slot.iso)}
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
                ))}
              </div>
            );
          })}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
        <button className="btn btn--ghost" onClick={onClose}>Anuluj</button>
        <button className="btn btn--primary" onClick={onConfirm} disabled={!selectedSlot}>Potwierdź nowy termin</button>
      </div>
    </div>
  );
}
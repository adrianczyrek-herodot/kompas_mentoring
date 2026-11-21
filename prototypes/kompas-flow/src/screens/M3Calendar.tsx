import React, { useState, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import { DEMO_NOW, formatTime, formatDayName, formatDayNumber } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

const DAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
const HOURS = Array.from({ length: 16 }, (_, i) => 8 + i);

export function M3Calendar() {
  const { mentorTemplate, toggleFavorite } = useDemo();
  const { addToast } = useToast();
  const [activeWeek, setActiveWeek] = useState(0);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [exceptionType, setExceptionType] = useState<'off' | 'extra'>('off');
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionStart, setExceptionStart] = useState('09:00');
  const [exceptionEnd, setExceptionEnd] = useState('17:00');
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  const weekStart = useMemo(() => {
    const d = new Date(DEMO_NOW);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + activeWeek * 7);
    return d;
  }, [activeWeek]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  }), [weekStart]);

  const isSlotBooked = (day: number, hour: number) => {
    return mentorTemplate.has(`${day}-${hour}`);
  };

  const isException = (date: Date, hour: number) => {
    // Symulacja wyjątków
    return false;
  };

  const toggleSlot = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    const newTemplate = new Set(mentorTemplate);
    if (newTemplate.has(key)) newTemplate.delete(key);
    else newTemplate.add(key);
    toggleFavorite(key); // Reuse for demo
  };

  const handleAddException = () => {
    if (!exceptionDate || !exceptionStart || !exceptionEnd) {
      addToast('Wypełnij wszystkie pola', 'error');
      return;
    }
    addToast(`${exceptionType === 'off' ? 'Urlop' : 'Dodatkowe godziny'} dodany (symulacja)`, 'success');
    setShowExceptionDialog(false);
  };

  const handleSync = () => {
    addToast('Synchronizacja z Google Calendar (symulacja)', 'success');
    setShowSyncDialog(false);
  };

  const hoursThisWeek = useMemo(() => {
    let count = 0;
    mentorTemplate.forEach(key => {
      const [day] = key.split('-').map(Number);
      if (day >= 0 && day < 7) count++;
    });
    return count;
  }, [mentorTemplate]);

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="type-page-title font-serif">Kalendarz i dostępność</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${hoursThisWeek >= 3 ? 'badge--success' : 'badge--warning'}`}>
            {hoursThisWeek} h / tydz. {hoursThisWeek >= 3 ? '(minimum spełnione)' : '(min. 3 h)'}
          </span>
        </div>
      </div>

      {/* Banner if no availability */}
      {hoursThisWeek === 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-fg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong>Brak dostępności</strong>
              <p className="text-muted" style={{ margin: '4px 0 0' }}>Uczniowie nie mogą Cię zarezerwować. Dodaj sloty w edytorze poniżej.</p>
            </div>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => Math.max(-4, w - 1))} disabled={activeWeek <= -4}>← Poprzedni</button>
          <span className="type-label" style={{ minWidth: '280px', textAlign: 'center' }}>
            {weekDays[0].toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })} – {weekDays[6].toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          <button className="btn btn--ghost btn--s" onClick={() => setActiveWeek(w => w + 1)}>Następny →</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn--secondary" onClick={() => { setExceptionType('off'); setShowExceptionDialog(true); }}>Dodaj urlop</button>
          <button className="btn btn--secondary" onClick={() => { setExceptionType('extra'); setShowExceptionDialog(true); }}>Dodaj godziny</button>
        </div>
      </div>

      {/* Availability grid */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Szablon tygodniowy (powtarza się co tydzień)</h2>
        <div className="avail" style={{ overflowX: 'auto' }}>
          <div className="avail__row avail__head">
            <span className="avail__h" style={{ width: '44px', textAlign: 'right', paddingRight: '4px' }}>Godz.</span>
            {DAYS.map((d, i) => (
              <span key={d} style={{ textAlign: 'center', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--ink-2)', fontWeight: 600 }}>
                {d}
                <br />
                <b style={{ fontSize: '1.05rem', color: 'var(--ink)', fontFamily: 'var(--font-family-serif)' }}>{formatDayNumber(weekDays[i])}</b>
              </span>
            ))}
          </div>
          {HOURS.map(hour => (
            <div key={hour} className="avail__row">
              <span className="avail__h" style={{ width: '44px', textAlign: 'right', paddingRight: '4px', fontSize: '0.72rem', color: 'var(--ink-3)' }}>{hour}:00</span>
              {DAYS.map((_, day) => (
                <button
                  key={`${day}-${hour}`}
                  className={`avail__cell ${isSlotBooked(day, hour) ? 'is-on' : ''} ${isException(weekDays[day], hour) ? 'is-booked' : ''}`}
                  onClick={() => toggleSlot(day, hour)}
                  disabled={isException(weekDays[day], hour)}
                  aria-label={`${DAYS[day]} ${hour}:00 ${isSlotBooked(day, hour) ? 'dostępny' : 'niedostępny'}`}
                  style={{ 
                    background: isSlotBooked(day, hour) ? 'var(--brand-soft)' : '#fbfaf6',
                    borderColor: isSlotBooked(day, hour) ? '#bcd8cd' : 'var(--line-2)',
                    color: isSlotBooked(day, hour) ? 'var(--brand)' : 'inherit',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="legend" style={{ marginTop: '1rem' }}>
          <span className="lg lg--free" /><span>Dostępny</span>
          <span className="lg lg--off" style={{ marginLeft: '1rem' }} /><span>Niedostępny</span>
          <span className="lg lg--booked" style={{ marginLeft: '1rem' }} /><span>Wyjątek (urlop/dodatkowe)</span>
        </div>
      </section>

      {/* Wyjątki */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Wyjątki (urlopy, dodatkowe godziny)
          <button className="btn btn--ghost btn--s" onClick={() => { setExceptionType('off'); setShowExceptionDialog(true); }}>Dodaj</button>
        </h2>
        <div className="card">
          <p className="text-muted" style={{ margin: 0 }}>Brak wyjątków. Dodaj urlop lub dodatkowe godziny, by zmienić dostępność w konkretnych dniach.</p>
        </div>
      </section>

      {/* Ustawienia */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Ustawienia kalendarza</h2>
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="type-label" style={{ display: 'block', marginBottom: '8px' }}>Minimalne wyprzedzenie rezerwacji</label>
              <select className="input" style={{ maxWidth: '240px' }}>
                <option value="2">2 godziny</option>
                <option value="6" selected>6 godzin</option>
                <option value="12">12 godzin</option>
                <option value="24">24 godziny</option>
                <option value="48">48 godzin</option>
              </select>
            </div>
            <div>
              <label className="type-label" style={{ display: 'block', marginBottom: '8px' }}>Bufor między sesjami</label>
              <select className="input" style={{ maxWidth: '240px' }}>
                <option value="0" selected>Brak</option>
                <option value="5">5 minut</option>
                <option value="10">10 minut</option>
                <option value="15">15 minut</option>
                <option value="30">30 minut</option>
              </select>
            </div>
            <div>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={false} />
                <div style={{ flex: 1 }}>
                  <strong>Wstrzymaj przyjmowanie nowych uczniów</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Twój profil nie będzie widoczny w wyszukiwarce. Obecni uczniowie mogą rezerwować dalej.</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Google Calendar Sync */}
      <section>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Synchronizacja z Google Calendar
          <button className="btn btn--primary" onClick={() => setShowSyncDialog(true)}>Połącz / Odśwież</button>
        </h2>
        <div className="card" style={{ background: 'var(--surface-sunken)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong>Niepołączone</strong>
              <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Połącz kalendarz, by automatycznie blokować terminy z Google Calendar.</p>
            </div>
            <button className="btn btn--primary" onClick={() => setShowSyncDialog(true)}>Połącz konto Google</button>
          </div>
        </div>
      </section>

      {/* Exception dialog */}
      {showExceptionDialog && (
        <div className="modal-backdrop" onClick={() => setShowExceptionDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal__close" onClick={() => setShowExceptionDialog(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>{exceptionType === 'off' ? 'Dodaj urlop' : 'Dodaj dodatkowe godziny'}</h2>
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="exception-date" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Data <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
              <input id="exception-date" type="date" value={exceptionDate} onChange={e => setExceptionDate(e.target.value)} className="input" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="field">
                <label htmlFor="exception-start" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Od <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                <input id="exception-start" type="time" value={exceptionStart} onChange={e => setExceptionStart(e.target.value)} className="input" />
              </div>
              <div className="field">
                <label htmlFor="exception-end" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Do <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                <input id="exception-end" type="time" value={exceptionEnd} onChange={e => setExceptionEnd(e.target.value)} className="input" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowExceptionDialog(false)}>Anuluj</button>
              <button className="btn btn--primary" onClick={handleAddException} disabled={!exceptionDate || !exceptionStart || !exceptionEnd}>{exceptionType === 'off' ? 'Dodaj urlop' : 'Dodaj godziny'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Sync dialog */}
      {showSyncDialog && (
        <div className="modal-backdrop" onClick={() => setShowSyncDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal__close" onClick={() => setShowSyncDialog(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Połącz Google Calendar</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Zezwól na dostęp do kalendarza, by automatycznie blokować terminy z wydarzeń (busy/free). Twoje prywatne wydarzenia nie są widoczne dla uczniów.</p>
            <button className="btn btn--primary btn--block" onClick={handleSync} style={{ marginBottom: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Połącz z Google
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => setShowSyncDialog(false)}>Anuluj</button>
          </div>
        </div>
      )}
    </div>
  );
}
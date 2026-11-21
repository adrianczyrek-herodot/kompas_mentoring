import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { formatDateTime } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

export function U9Progress() {
  const { sessions, currentStudent } = useDemo();
  const { addToast } = useToast();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(currentStudent?.goal || '');

  const completedSessions = sessions.filter(s => s.status === 'completed' && s.note).sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());

  const handleSaveGoal = () => {
    if (goalText.trim().length < 10) {
      addToast('Cel musi mieć min. 10 znaków', 'error');
      return;
    }
    setEditingGoal(false);
    addToast('Cel zaktualizowany (symulacja)', 'success');
  };

  const handleAddMilestone = () => {
    addToast('Dodawanie kamienia milowego (symulacja)', 'success');
  };

  const handleAddActionItem = () => {
    addToast('Dodawanie zadania (symulacja)', 'success');
  };

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Postępy</h1>
      </div>

      {/* Goal Card */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ background: editingGoal ? 'var(--surface-panel)' : 'var(--status-success-bg)', borderColor: editingGoal ? 'var(--border-divider)' : 'var(--status-success-fg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="type-section-title font-serif" style={{ margin: 0, color: editingGoal ? 'var(--text-default)' : 'var(--status-success-fg)' }}>
              {editingGoal ? 'Edytuj cel' : 'Twój cel'}
            </h2>
            {editingGoal ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn--ghost btn--s" onClick={() => { setEditingGoal(false); setGoalText(currentStudent?.goal || ''); }}>Anuluj</button>
                <button className="btn btn--primary btn--s" onClick={handleSaveGoal}>Zapisz</button>
              </div>
            ) : (
              <button className="btn btn--ghost btn--s" onClick={() => setEditingGoal(true)}>Edytuj</button>
            )}
          </div>

          {editingGoal ? (
            <textarea
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              className="textarea"
              placeholder="Np. Pierwsza praca jako frontend developer do marca 2027"
              minLength={10}
              maxLength={200}
              rows={3}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, color: 'var(--text-default)' }}>
                {currentStudent?.goal || 'Nie ustawiono celu. Ustal go z mentorem na pierwszej sesji.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: center, color: 'var(--status-success-fg)' }}>
                <span>🎯</span>
                <span style={{ fontSize: '0.875rem' }}>Termin: <strong>marzec 2027</strong></span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Milestones */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="type-section-title font-serif">Kamienie milowe</h2>
          <button className="btn btn--ghost btn--s" onClick={handleAddMilestone}>Dodaj</button>
        </div>

        <div className="card">
          <ul className="todo" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" checked={true} readOnly />
              <div style={{ flex: 1 }}>
                <strong>Projekt portfolio #1 (sklep) po code review</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Ukończone • 2026-09-15</p>
              </div>
              <span className="badge badge--success">✓ Zrobione</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" readOnly />
              <div style={{ flex: 1 }}>
                <strong>Projekt portfolio #2 z testami</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>W trakcie • termin: 2026-11-30</p>
              </div>
              <span className="badge badge--warning">⏳ W trakcie</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" readOnly />
              <div style={{ flex: 1 }}>
                <strong>2 próbne rozmowy techniczne</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Planowane • termin: 2027-01-15</p>
              </div>
              <span className="badge badge--neutral">📅 Planowane</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" readOnly />
              <div style={{ flex: 1 }}>
                <strong>20 wysłanych aplikacji</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Planowane • termin: 2027-02-15</p>
              </div>
              <span className="badge badge--neutral">📅 Planowane</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Action Items */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="type-section-title font-serif">Zadania (action items)</h2>
          <button className="btn btn--ghost btn--s" onClick={handleAddActionItem}>Dodaj</button>
        </div>

        <div className="card">
          <ul className="todo" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" checked={true} readOnly />
              <div style={{ flex: 1 }}>
                <strong>Wydziel hook useCheckoutForm</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Z sesji z 18.10 • Kasia Nowicka</p>
              </div>
              <span className="badge badge--success">✓ Zrobione</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" checked={true} readOnly />
              <div style={{ flex: 1 }}>
                <strong>Przeczytaj dokumentację React o „lifting state up”</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Z sesji z 18.10 • Kasia Nowicka</p>
              </div>
              <span className="badge badge--success">✓ Zrobione</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" readOnly />
              <div style={{ flex: 1 }}>
                <strong>Dodaj testy do walidacji formularza</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Z sesji z 18.10 • Kasia Nowicka • termin: 2026-10-25</p>
              </div>
              <span className="badge badge--warning">⏳ Do zrobienia</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <input type="checkbox" readOnly />
              <div style={{ flex: 1 }}>
                <strong>Spisz listę 10 firm do aplikacji</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Z sesji próbnej 09.10 • Kasia Nowicka</p>
              </div>
              <span className="badge badge--success">✓ Zrobione</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Session Notes Timeline */}
      <section>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Notatki z sesji</h2>

        {completedSessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📝</div>
            <h3 className="empty-state__title">Brak notatek</h3>
            <p className="empty-state__text">Notatki pojawią się tutaj po każdej zakończonej sesji.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {completedSessions.map(session => (
              <article key={session.id} className="card" style={{ borderLeft: '4px solid var(--action-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div className="avatar" style={{ '--h': session.mentorId === 'm1' ? 168 : 262, '--s': '40px' }} aria-hidden="true">
                    {session.mentorId === 'm1' ? 'KN' : 'ES'}
                  </div>
                  <div>
                    <strong>{session.mentorId === 'm1' ? 'Kasia Nowicka' : 'Ewa Sadowska'}</strong>
                    <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>
                      {formatDateTime(session.startsAt, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {session.durationMin} min
                    </p>
                  </div>
                </div>
                
                {session.note && (
                  <div style={{ marginBottom: '1rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-default)' }}>
                    {session.note}
                  </div>
                )}
                
                {session.actionItems && session.actionItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <strong style={{ fontSize: '0.875rem' }}>Zadania z tej sesji:</strong>
                    <ul className="todo" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'grid', gap: '6px' }}>
                      {session.actionItems.map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                          <input type="checkbox" checked={item.done} readOnly />
                          <span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text-muted)' : 'var(--text-default)' }}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
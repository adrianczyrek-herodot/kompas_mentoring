import React, { useState, useMemo } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { STUDENTS, formatDateTime, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

// Main list view
export function M4Students() {
  const { sessions } = useDemo();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'active' | 'trial' | 'inactive'>('all');

  const filteredStudents = useMemo(() => {
    if (filter === 'all') return STUDENTS;
    if (filter === 'active') return STUDENTS.filter(s => s.status === 'aktywny');
    if (filter === 'trial') return STUDENTS.filter(s => s.status === 'próbny');
    return STUDENTS.filter(s => s.status === 'nieaktywny');
  }, [filter]);

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Uczniowie</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['all', 'active', 'trial', 'inactive'] as const).map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn--primary' : 'btn--ghost'} btn--s`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Wszyscy' : f === 'active' ? 'Aktywni' : f === 'trial' ? 'Próbni' : 'Nieaktywni'}
            <span className="count">{STUDENTS.filter(s => f === 'all' || s.status === (f === 'active' ? 'aktywny' : f === 'trial' ? 'próbny' : 'nieaktywny')).length}</span>
          </button>
        ))}
      </div>

      <div className="list" role="list">
        {filteredStudents.map(student => (
          <a key={student.id} href={`#/mentor/uczniowie/${student.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentor/uczniowie/${student.id}`); }} className="list-item">
            <div className="avatar" style={{ '--h': student.hue, '--s': '44px' }} aria-hidden="true">{student.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong>{student.name}</strong>
                <span className={`badge ${student.status === 'aktywny' ? 'badge--success' : student.status === 'próbny' ? 'badge--warning' : 'badge--neutral'}`}>{student.status}</span>
              </div>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.goal}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{student.plan}</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Saldo: {student.balance} sesji</span>
              {student.nextSession && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDateTime(student.nextSession, { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// Detail view
export function M4StudentDetail({ id }: { id: string }) {
  const { sessions } = useDemo();
  const { addToast } = useToast();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [actionItems, setActionItems] = useState<Array<{text: string; done: boolean}>>([]);

  const student = STUDENTS.find(s => s.id === id);

  if (!student) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Uczeń nie znaleziony</h2>
        <a href="#/mentor/uczniowie" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/mentor/uczniowie'); }}>
          Uczniowie
        </a>
      </div>
    );
  }

  const studentSessions = sessions.filter(s => s.mentorId === 'm1' && s.student === student.name).sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime());
  const completedSessions = studentSessions.filter(s => s.status === 'completed');
  const nextSession = studentSessions.find(s => s.status === 'scheduled' && new Date(s.startsAt) >= DEMO_NOW);

  return (
    <div className="narrow" style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        <button className="btn btn--ghost" onClick={() => navigate('#/mentor/uczniowie')}>← Powrót</button>
        <div className="avatar" style={{ '--h': student.hue, '--s': '56px' }} aria-hidden="true">{student.name[0]}</div>
        <div>
          <h1 className="type-page-title font-serif" style={{ marginBottom: '0.5rem' }}>{student.name}</h1>
          <p className="text-muted">{student.status === 'aktywny' ? '🟢 Aktywny' : student.status === 'próbny' ? '🟡 Próbny' : '⚪ Nieaktywny'} • {student.plan} • Saldo: {student.balance} sesji</p>
        </div>
      </div>

      {/* Goal */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ background: 'var(--status-success-bg)', borderColor: 'var(--status-success-fg)' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', color: 'var(--status-success-fg)' }}>Cel ucznia</h2>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{student.goal}</p>
        </div>
      </section>

      {/* Next session */}
      {nextSession && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Nadchodząca sesja</h2>
          <div className="card" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="date-tile" style={{ background: 'var(--selected-bg)', color: 'var(--selected-border)' }}>
              <b>{new Date(nextSession.startsAt).getDate()}</b>
              <span>{new Date(nextSession.startsAt).toLocaleDateString('pl-PL', { month: 'short' })}</span>
            </div>
            <div style={{ flex: 1 }}>
              <strong>{nextSession.goal || 'Sesja'}</strong>
              <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                {formatDateTime(nextSession.startsAt, { weekday: 'long', hour: '2-digit', minute: '2-digit' })} • {nextSession.durationMin} min
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={`#/sesje/${nextSession.id}/pokoj`} className="btn btn--primary btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${nextSession.id}/pokoj`); }}>Dołącz</a>
              <a href={`#/sesje/${nextSession.id}`} className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${nextSession.id}`); }}>Szczegóły</a>
            </div>
          </div>
        </section>
      )}

      {/* History */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Historia sesji</h2>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cel</th>
                  <th>Typ</th>
                  <th>Status</th>
                  <th>Notatka</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {studentSessions.map(session => (
                  <tr key={session.id}>
                    <td>{formatDateTime(session.startsAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.goal || '—'}</td>
                    <td>{session.type === 'trial' ? 'Próbna' : 'Plan'}</td>
                    <td><span className={`badge ${session.status === 'completed' ? 'badge--neutral' : session.status === 'scheduled' ? 'badge--scheduled' : 'badge--danger'}`}>{session.status === 'completed' ? 'Zakończona' : session.status === 'scheduled' ? 'Zaplanowana' : session.status}</span></td>
                    <td>
                      {session.note ? (
                        <button className="btn btn--ghost btn--s" onClick={() => { setEditingNote(session.id); setNoteText(session.note || ''); setActionItems(session.actionItems?.map(a => ({ ...a })) || []); }}>
                          Zobacz notatkę
                        </button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <a href={`#/sesje/${session.id}`} className="btn btn--ghost btn--s" onClick={e => { e.preventDefault(); navigate(`#/sesje/${session.id}`); }}>Otwórz</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Note editor modal */}
      {editingNote && (
        <div className="modal-backdrop" onClick={() => setEditingNote(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px', maxHeight: '90vh', overflow: 'auto' }}>
            <button className="modal__close" onClick={() => setEditingNote(null)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Notatka po sesji</h2>
            
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="note-editor" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Notatka (widoczna dla ucznia)</label>
              <textarea id="note-editor" value={noteText} onChange={e => setNoteText(e.target.value)} className="textarea" rows={6} maxLength={3000} />
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{noteText.length}/3000 znaków (min. 20)</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h3 className="type-label" style={{ marginBottom: '8px' }}>Zadania (action items)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {actionItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <input type="checkbox" checked={item.done} onChange={e => setActionItems(prev => prev.map((a, i) => i === idx ? { ...a, done: e.target.checked } : a))} />
                    <input type="text" value={item.text} onChange={e => setActionItems(prev => prev.map((a, i) => i === idx ? { ...a, text: e.target.value } : a))} className="input" style={{ flex: 1 }} placeholder="Treść zadania" />
                    <input type="date" className="input" style={{ width: '160px' }} />
                    <button className="btn btn--ghost btn--s" onClick={() => setActionItems(prev => prev.filter((_, i) => i !== idx))}>Usuń</button>
                  </div>
                ))}
                <button className="btn btn--ghost btn--s" onClick={() => setActionItems(prev => [...prev, { text: '', done: false }])}>Dodaj zadanie</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setEditingNote(null)}>Zamknij</button>
              <button className="btn btn--primary" onClick={() => { addToast('Notatka zapisana i wysłana uczniowi (symulacja)', 'success'); setEditingNote(null); }}>Wyślij uczniowi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
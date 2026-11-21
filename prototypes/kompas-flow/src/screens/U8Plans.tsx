import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { formatMoney, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { PLAN_OPTIONS, DURATION_OPTIONS } from '../utils/constants';

export function U8Plans() {
  const { subscription, balances, currentStudent } = useDemo();
  const { addToast } = useToast();
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferMentor, setTransferMentor] = useState('');
  const [transferSessions, setTransferSessions] = useState(0);
  const [activeTab, setActiveTab] = useState<'plan' | 'history'>('plan');

  const mentorNames: Record<string, string> = { m1: 'Kasia Nowicka', m3: 'Ewa Sadowska' };
  const activeMentor = subscription?.mentorId || 'm1';
  const activeMentorName = mentorNames[activeMentor] || activeMentor;
  const activeBalance = balances[activeMentor] || 0;
  const mentorRate = activeMentor === 'm1' ? 180 : 200;
  const nextRenewal = subscription?.renewsOn ? new Date(subscription.renewsOn).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  const handleTransfer = () => {
    if (!transferMentor || transferSessions <= 0) {
      addToast('Wybierz mentora i liczbę sesji', 'error');
      return;
    }
    if (transferSessions > activeBalance) {
      addToast('Nie masz tyle sesji na saldzie', 'error');
      return;
    }
    const targetRate = transferMentor === 'm3' ? 200 : 180;
    const receivedSessions = Math.floor((transferSessions * mentorRate) / targetRate);
    addToast(`Przeniesiono ${transferSessions} sesji → ${receivedSessions} u ${mentorNames[transferMentor]} (symulacja)`, 'success');
    setShowTransferDialog(false);
    setTransferMentor('');
    setTransferSessions(0);
  };

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Plany i saldo</h1>
      </div>

      {/* Active plan */}
      {subscription && (
        <section style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ background: 'var(--selected-bg)', borderColor: 'var(--selected-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge--success" style={{ marginRight: '8px' }}>{subscription.status === 'active' ? 'Aktywny' : subscription.status}</span>
                <strong>{activeMentorName}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price" style={{ fontFamily: 'var(--font-family-serif)', color: 'var(--text-default)' }}>
                  {subscription.perWeek}×{subscription.durationMin} min / tydz.
                </div>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>Następne odnowienie: {nextRenewal}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn--secondary" onClick={() => setActiveTab('plan')}>Zmień plan</button>
              <button className="btn btn--ghost" onClick={() => addToast('Plan wstrzymany (symulacja)', 'success')}>Wstrzymaj</button>
              <button className="btn btn--danger-ghost" onClick={() => addToast('Anulowanie planu (symulacja)', 'error')}>Anuluj</button>
            </div>
          </div>
        </section>
      )}

      {!subscription && currentStudent && (
        <section style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ background: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-fg)' }}>
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state__icon">📋</div>
              <h3 className="empty-state__title">Nie masz aktywnego planu</h3>
              <p className="empty-state__text">Po sesji próbnej wybierz plan, by kontynuować naukę.</p>
              <a href="#/mentorzy" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); window.location.href = '#/mentorzy'; }}>
                Znajdź mentora
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Balance per mentor */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Saldo sesji u mentorów
          {Object.keys(balances).length > 1 && (
            <button className="btn btn--primary btn--s" onClick={() => setShowTransferDialog(true)}>
              Przenieś saldo
            </button>
          )}
        </h2>
        
        {Object.entries(balances).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">💰</div>
            <h3 className="empty-state__title">Brak salda</h3>
            <p className="empty-state__text">Sesje z planu trafią tutaj po opłaceniu.</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mentor</th>
                    <th style={{ textAlign: 'right' }}>Dostępne sesje</th>
                    <th style={{ textAlign: 'right' }}>Wartość (szac.)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(balances).map(([mentorId, count]) => (
                    <tr key={mentorId}>
                      <td>{mentorNames[mentorId] || mentorId}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{count}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(count * (mentorId === 'm1' ? 180 : 200))}</td>
                      <td style={{ textAlign: 'right' }}>
                        {Object.keys(balances).length > 1 && count > 0 && (
                          <button className="btn btn--ghost btn--s" onClick={() => { setTransferMentor(mentorId === 'm1' ? 'm3' : 'm1'); setTransferSessions(count); setShowTransferDialog(true); }}>
                            Przenieś
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Plan picker (when changing) */}
      {activeTab === 'plan' && subscription && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Wybierz nowy plan</h2>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Zmiana wejdzie w życie od następnego okresu rozliczeniowego ({nextRenewal}).</p>
          
          <div className="plan-grid" role="radiogroup" aria-label="Wybór planu">
            {DURATION_OPTIONS.map(duration => (
              <div key={duration} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PLAN_OPTIONS.map(perWeek => (
                  <label key={`${perWeek}-${duration}`} className="plan-opt">
                    <input type="radio" name="plan" value={`${perWeek}-${duration}`} />
                    <div>
                      <strong>{perWeek}×{duration} min / tydz.</strong>
                      <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                        {formatMoney(perWeek * duration * 4 * mentorRate / 60)} / 4 tyg.
                      </p>
                      <span className="badge badge--neutral" style={{ marginTop: '8px' }}>
                        {perWeek * 4} sesji / okres
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn btn--ghost" onClick={() => setActiveTab('plan')}>Anuluj</button>
            <button className="btn btn--primary" onClick={() => addToast('Plan zmieniony (symulacja)', 'success')}>Zatwierdź zmianę</button>
          </div>
        </section>
      )}

      {/* Transfer dialog */}
      {showTransferDialog && (
        <div className="modal-backdrop" onClick={() => setShowTransferDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal__close" onClick={() => setShowTransferDialog(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Przenieś saldo</h2>
            <p className="text-muted" style={{ marginBottom: '1rem' }}>
              Masz <strong>{activeBalance} sesji</strong> u <strong>{activeMentorName}</strong> (wartość: {formatMoney(activeBalance * mentorRate)}).
            </p>
            
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="transfer-mentor" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Mentor docelowy *</label>
              <select
                id="transfer-mentor"
                value={transferMentor}
                onChange={e => setTransferMentor(e.target.value)}
                className="input"
              >
                <option value="">Wybierz mentora</option>
                {Object.entries(mentorNames).map(([id, name]) => (
                  id !== activeMentor && <option key={id} value={id}>{name} ({formatMoney(id === 'm1' ? 180 : 200)}/60 min)</option>
                ))}
              </select>
            </div>

            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="transfer-sessions" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Liczba sesji do przeniesienia *</label>
              <input
                id="transfer-sessions"
                type="number"
                min="1"
                max={activeBalance}
                value={transferSessions}
                onChange={e => setTransferSessions(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>

            {transferMentor && transferSessions > 0 && (
              <div className="card" style={{ marginBottom: '1rem', background: 'var(--surface-sunken)' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  <strong>Po przeliczeniu:</strong> {transferSessions} sesji × {formatMoney(mentorRate)} = {formatMoney(transferSessions * mentorRate)} 
                  → <strong>{Math.floor((transferSessions * mentorRate) / (transferMentor === 'm1' ? 180 : 200))} sesji</strong> u {mentorNames[transferMentor]} ({formatMoney(transferMentor === 'm1' ? 180 : 200)}/60 min)
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowTransferDialog(false)}>Anuluj</button>
              <button className="btn btn--primary" onClick={handleTransfer} disabled={!transferMentor || transferSessions <= 0}>Przenieś</button>
            </div>
          </div>
        </div>
      )}

      {/* History / Invoices */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="type-section-title font-serif">Historia płatności i faktury</h2>
          <button className="btn btn--ghost btn--s">Eksport CSV</button>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Opis</th>
                  <th style={{ textAlign: 'right' }}>Kwota</th>
                  <th style={{ textAlign: 'right' }}>Faktura</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2026-10-06</td>
                  <td>Odnowienie planu: 1×60 min / tydz. (Kasia Nowicka)</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(4 * 180)}</td>
                  <td style={{ textAlign: 'right' }}><a href="#" className="link">FV-2026/10/001</a></td>
                </tr>
                <tr>
                  <td>2026-09-08</td>
                  <td>Sesja próbna (Kasia Nowicka)</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(49)}</td>
                  <td style={{ textAlign: 'right' }}><a href="#" className="link">FV-2026/09/005</a></td>
                </tr>
                <tr>
                  <td>2026-09-01</td>
                  <td>Odnowienie planu: 1×60 min / tydz. (Kasia Nowicka)</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(4 * 180)}</td>
                  <td style={{ textAlign: 'right' }}><a href="#" className="link">FV-2026/09/001</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
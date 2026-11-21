import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { DISPUTES, formatMoney, formatDateTime } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { DISPUTE_REASONS } from '../utils/constants';

export function A2Disputes() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [editingDispute, setEditingDispute] = useState<typeof DISPUTES[0] | null>(null);
  const [resolutionType, setResolutionType] = useState<'balance' | 'card' | 'partial' | 'none'>('balance');
  const [refundAmount, setRefundAmount] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');

  const filteredDisputes = DISPUTES.filter(d => 
    filter === 'all' || (filter === 'open' && !d.resolved) || (filter === 'resolved' && d.resolved)
  );

  const handleResolve = (disputeId: string) => {
    setEditingDispute(DISPUTES.find(d => d.id === disputeId) || null);
    setResolutionType('balance');
    setRefundAmount('');
    setResolutionReason('');
  };

  const confirmResolution = () => {
    if (!editingDispute) return;
    if (!resolutionReason.trim() || resolutionReason.length < 20) {
      addToast('Uzasadnienie min. 20 znaków', 'error');
      return;
    }
    const amount = parseInt(refundAmount) || 0;
    if (amount > editingDispute.amount) {
      addToast('Kwota zwrotu nie może przekraczać kwoty sesji', 'error');
      return;
    }
    
    addToast(`Spór ${editingDispute.id} rozstrzygnięty (symulacja)`, 'success');
    setEditingDispute(null);
    setResolutionReason('');
    setRefundAmount('');
  };

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="type-page-title font-serif">Spory i zwroty</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'open', 'resolved'] as const).map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn--primary' : 'btn--ghost'} btn--s`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Wszystkie' : f === 'open' ? 'Otwarte' : 'Rozstrzygnięte'}
              <span className="count">{DISPUTES.filter(d => f === 'all' || (f === 'open' && !d.resolved) || (f === 'resolved' && d.resolved)).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dispute queue */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sesja</th>
                  <th>Uczeń</th>
                  <th>Mentor</th>
                  <th>Powód</th>
                  <th>Kwota</th>
                  <th>Otwarto</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredDisputes.map(dispute => (
                  <tr key={dispute.id}>
                    <td><code>{dispute.id}</code></td>
                    <td>{dispute.sessionId}</td>
                    <td>{dispute.student}</td>
                    <td>{dispute.mentor}</td>
                    <td>{dispute.reason}</td>
                    <td>{formatMoney(dispute.amount)}</td>
                    <td>{formatDateTime(dispute.opened, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td>
                      <span className={`badge ${dispute.resolved ? 'badge--success' : 'badge--warning'}`}>
                        {dispute.resolved ? 'Rozstrzygnięty' : 'Otwarty'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!dispute.resolved && (
                        <button className="btn btn--primary btn--s" onClick={() => handleResolve(dispute.id)}>Rozstrzygnij</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Dispute detail modal */}
      {editingDispute && (
        <div className="modal-backdrop" onClick={() => setEditingDispute(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <button className="modal__close" onClick={() => setEditingDispute(null)} aria-label="Zamknij">×</button>
            
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1.5rem' }}>Rozstrzygnij spór: {editingDispute.id}</h2>

            {/* Session event timeline */}
            <section style={{ marginBottom: '1.5rem' }}>
              <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Oś zdarzeń sesji (dowody)</h3>
              <div className="card" style={{ background: 'var(--surface-sunken)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '1rem' }}>
                  {editingDispute.events.map((event, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', padding: '8px', background: 'var(--surface-panel)', borderRadius: 'var(--shape-control)', borderLeft: '3px solid var(--brand)' }}>
                      <span className="text-muted" style={{ fontSize: '0.8rem', minWidth: '80px', fontFamily: 'var(--font-family-mono)' }}>{event.split(' — ')[0]}</span>
                      <span style={{ flex: 1 }}>{event.split(' — ')[1] || event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Statements */}
            <section style={{ marginBottom: '1.5rem' }}>
              <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Stanowiska stron
                <span className="badge badge--neutral">Dowody</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ background: 'var(--surface-sunken)' }}>
                  <h4 className="type-label" style={{ marginBottom: '8px', color: 'var(--status-danger-fg)' }}>Uczeń: {editingDispute.student}</h4>
                  <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-default)' }}>{editingDispute.studentSays}</p>
                </div>
                <div className="card" style={{ background: 'var(--surface-sunken)' }}>
                  <h4 className="type-label" style={{ marginBottom: '8px', color: 'var(--brand)' }}>Mentor: {editingDispute.mentor}</h4>
                  <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-default)' }}>{editingDispute.mentorSays}</p>
                </div>
              </div>
            </section>

            {/* Resolution form */}
            <section>
              <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Decyzja</h3>
              
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h4 className="type-label" style={{ marginBottom: '8px' }}>Typ rozstrzygnięcia</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(['balance', 'card', 'partial', 'none'] as const).map(type => (
                    <label key={type} className={`choice__opt ${resolutionType === type ? '' : ''}`} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="resolution" value={type} checked={resolutionType === type} onChange={e => setResolutionType(e.target.value as any)} />
                      <div>
                        <strong>
                          {type === 'balance' ? 'Zwrot do salda u mentora' : 
                           type === 'card' ? 'Zwrot na kartę ucznia' : 
                           type === 'partial' ? 'Zwrot częściowy' : 'Brak zwrotu'}
                        </strong>
                        <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                          {type === 'balance' ? 'Sesja wraca do salda ucznia u tego mentora' :
                           type === 'card' ? 'Pełny zwrot na oryginalną metodę płatności' :
                           type === 'partial' ? 'Częściowy zwrot (wpisz kwotę niżej)' : 'Sesja pozostaje u mentora, brak zwrotu'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {resolutionType === 'partial' && (
                <div className="field" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="refund-amount" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Kwota zwrotu (PLN) <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                  <input id="refund-amount" type="number" min="1" max={editingDispute.amount} step="1" value={refundAmount} onChange={e => setRefundAmount(e.target.value)} className="input" placeholder={`Max ${editingDispute.amount} PLN`} />
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Kwota sesji: {formatMoney(editingDispute.amount)}</p>
                </div>
              )}

              <div className="field" style={{ marginBottom: '1rem' }}>
                <label htmlFor="resolution-reason" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Uzasadnienie decyzji <span style={{ color: 'var(--status-danger-fg)' }}>*</span> (min. 20 znaków)</label>
                <textarea id="resolution-reason" value={resolutionReason} onChange={e => setResolutionReason(e.target.value)} className="textarea" rows={4} minLength={20} maxLength={1000} placeholder="Uzasadnij decyzję..." />
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{resolutionReason.length}/1000 znaków (min. 20)</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn btn--ghost" onClick={() => setEditingDispute(null)}>Anuluj</button>
                <button className="btn btn--primary" onClick={confirmResolution} disabled={resolutionReason.length < 20 || (resolutionType === 'partial' && (!refundAmount || parseInt(refundAmount) <= 0))}>
                  Rozstrzygnij spór
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
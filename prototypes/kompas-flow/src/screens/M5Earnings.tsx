import React, { useState, useMemo } from 'react';
import { useDemo } from '../context/DemoContext';
import { EARNINGS, formatMoney, formatDateTime } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';

export function M5Earnings() {
  const { addToast } = useToast();
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const filteredEarnings = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    switch (dateRange) {
      case 'month': cutoff = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'quarter': cutoff = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); break;
      case 'year': cutoff = new Date(now.getFullYear(), 0, 1); break;
      default: cutoff = new Date(0);
    }
    return EARNINGS.filter(e => new Date(e.date) >= cutoff);
  }, [dateRange]);

  const available = EARNINGS.filter(e => e.status === 'dostępne').reduce((sum, e) => sum + (e.gross - e.fee), 0);
  const pending = EARNINGS.filter(e => e.status === 'oczekujące').reduce((sum, e) => sum + (e.gross - e.fee), 0);
  const paidOut = EARNINGS.filter(e => e.status === 'wypłacone').reduce((sum, e) => sum + (e.gross - e.fee), 0);
  const totalGross = EARNINGS.reduce((sum, e) => sum + e.gross, 0);
  const totalFees = EARNINGS.reduce((sum, e) => sum + e.fee, 0);
  const totalNet = totalGross - totalFees;

  const hoursCompleted = 45; // symulacja
  const nextTierHours = 50;
  const tierProgress = (hoursCompleted / nextTierHours) * 100;
  const currentCommission = hoursCompleted < 20 ? 33 : hoursCompleted < 50 ? 28 : hoursCompleted < 200 ? 20 : 18;
  const nextCommission = hoursCompleted < 20 ? 28 : hoursCompleted < 50 ? 20 : hoursCompleted < 200 ? 18 : 18;

  const handlePayout = () => {
    const amount = parseInt(payoutAmount);
    if (isNaN(amount) || amount < 100) {
      addToast('Minimalna wypłata: 100 PLN', 'error');
      return;
    }
    if (amount > available) {
      addToast('Niewystarczające środki', 'error');
      return;
    }
    addToast(`Wypłata ${amount} PLN zlecona (symulacja)`, 'success');
    setShowPayoutDialog(false);
    setPayoutAmount('');
  };

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Zarobki i wypłaty</h1>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="card kpi kpi--big">
          <span>Dostępne do wypłaty</span>
          <strong>{formatMoney(available)}</strong>
          <div className="progress" style={{ marginTop: '8px' }}>
            <span style={{ width: `${available > 0 ? 100 : 0}%` }} />
          </div>
          <em>{available >= 100 ? 'Możesz wypłacić' : 'Minimum 100 PLN'}</em>
        </div>
        <div className="card kpi kpi--big">
          <span>Oczekujące (do 48h po sesji)</span>
          <strong>{formatMoney(pending)}</strong>
        </div>
        <div className="card kpi kpi--big">
          <span>Wypłacone łącznie</span>
          <strong>{formatMoney(paidOut)}</strong>
        </div>
        <div className="card kpi kpi--big">
          <span>Przychód brutto (wszystkie)</span>
          <strong>{formatMoney(totalGross)}</strong>
          <em>Prowizja: {formatMoney(totalFees)} • Netto: {formatMoney(totalNet)}</em>
        </div>
      </div>

      {/* Commission tier progress */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Postęp prowizji</h2>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
            <div>
              <strong>Aktualna prowizja: {currentCommission}%</strong>
              <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>
                {hoursCompleted} / {nextTierHours} h do kolejnego progu ({nextCommission}%)
              </p>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div className="progress" style={{ height: '12px' }}>
                <span style={{ width: `${Math.min(tierProgress, 100)}%` }} />
              </div>
            </div>
            {hoursCompleted >= nextTierHours && (
              <span className="badge badge--success">Następny próg osiągnięty!</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Próg 1</div>
              <strong>20 h</strong> → 28%
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Próg 2</div>
              <strong>50 h</strong> → 20%
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Próg 3</div>
              <strong>200 h</strong> → 18%
            </div>
          </div>
        </div>
      </section>

      {/* Earnings history */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
          <h2 className="type-section-title font-serif">Historia zarobków</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['month', 'quarter', 'year', 'all'] as const).map(r => (
              <button key={r} className={`btn ${dateRange === r ? 'btn--primary' : 'btn--ghost'} btn--s`} onClick={() => setDateRange(r)}>
                {r === 'month' ? 'Miesiąc' : r === 'quarter' ? 'Kwartał' : r === 'year' ? 'Rok' : 'Wszystko'}
              </button>
            ))}
            <button className="btn btn--ghost btn--s" onClick={() => addToast('Eksport CSV (symulacja)', 'success')}>Eksport CSV</button>
          </div>
        </div>
        
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Uczeń</th>
                  <th>Typ</th>
                  <th style={{ textAlign: 'right' }}>Brutto</th>
                  <th style={{ textAlign: 'right' }}>Prowizja</th>
                  <th style={{ textAlign: 'right' }}>Netto</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEarnings.map((e, i) => (
                  <tr key={i}>
                    <td>{formatDateTime(e.date, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td>{e.student}</td>
                    <td>{e.type}</td>
                    <td style={{ textAlign: 'right' }}>{formatMoney(e.gross)}</td>
                    <td style={{ textAlign: 'right' }}>{formatMoney(e.fee)}</td>
                    <td style={{ textAlign: 'right' }}><strong>{formatMoney(e.gross - e.fee)}</strong></td>
                    <td>
                      <span className={`badge ${e.status === 'dostępne' ? 'badge--success' : e.status === 'oczekujące' ? 'badge--warning' : 'badge--neutral'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Payout */}
      <section style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="type-section-title font-serif">Wypłata</h2>
          <button className="btn btn--primary" onClick={() => setShowPayoutDialog(true)} disabled={available < 100}>
            {available >= 100 ? 'Wypłać' : 'Niewystarczające środki'}
          </button>
        </div>

        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Dostępne</div>
              <strong>{formatMoney(available)}</strong>
            </div>
            <div style={{ padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Oczekujące</div>
              <strong>{formatMoney(pending)}</strong>
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Minimum wypłaty: 100 PLN • Maks. 1 wypłata ręczna/dobę • Czas przelewu: 1–2 dni robocze
          </p>
        </div>

        {/* Payout history */}
        <h3 className="type-label" style={{ margin: '1.5rem 0 1rem' }}>Historia wypłat</h3>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th style={{ textAlign: 'right' }}>Kwota</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>2026-10-01</td><td style={{ textAlign: 'right' }}>{formatMoney(5000)}</td><td><span className="badge badge--success">Wypłacone</span></td></tr>
                <tr><td>2026-09-01</td><td style={{ textAlign: 'right' }}>{formatMoney(4200)}</td><td><span className="badge badge--success">Wypłacone</span></td></tr>
                <tr><td>2026-08-01</td><td style={{ textAlign: 'right' }}>{formatMoney(3800)}</td><td><span className="badge badge--success">Wypłacone</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Payout dialog */}
      {showPayoutDialog && (
        <div className="modal-backdrop" onClick={() => setShowPayoutDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <button className="modal__close" onClick={() => setShowPayoutDialog(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Nowa wypłata</h2>
            <div className="card" style={{ marginBottom: '1rem', background: 'var(--surface-sunken)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Dostępne</div>
                  <strong>{formatMoney(available)}</strong>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Oczekujące</div>
                  <strong>{formatMoney(pending)}</strong>
                </div>
              </div>
            </div>
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="payout-amount" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Kwota do wypłaty (PLN) <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
              <input id="payout-amount" type="number" min="100" max={available} step="10" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} className="input" placeholder="Np. 500" />
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Min. 100 PLN, max. {formatMoney(available)}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setShowPayoutDialog(false)}>Anuluj</button>
              <button className="btn btn--primary" onClick={handlePayout} disabled={!payoutAmount || parseInt(payoutAmount) < 100 || parseInt(payoutAmount) > available}>Wypłać {payoutAmount ? formatMoney(parseInt(payoutAmount)) : ''}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
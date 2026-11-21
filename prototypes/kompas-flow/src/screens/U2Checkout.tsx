import React, { useState, useEffect } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { mentorById, formatMoney, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { PAYMENT_METHODS, PROMO_CODES } from '../utils/constants';

export function U2Checkout({ mentorId }: { mentorId: string }) {
  const { draft, updateDraft, paymentSimulation, forceNextError, confirmBooking, viewState } = useDemo();
  const { addToast } = useToast();
  const mentor = mentorById(mentorId);
  const [goal, setGoal] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState<null | { discount: number }>(null);
  const [promoError, setPromoError] = useState('');
  const [holdExpires, setHoldExpires] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  if (!mentor || !draft?.startsAt) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <h2 className="empty-state__title">Brak danych rezerwacji</h2>
        <p className="empty-state__text">Wróć do wyboru terminu.</p>
        <a href={`#/rezerwacja/${mentorId}`} className="btn btn--primary" style={{ marginTop: '1rem' }}>Wróć</a>
      </div>
    );
  }

  // Initialize hold expiration
  useEffect(() => {
    if (draft.holdExpires) {
      setHoldExpires(draft.holdExpires);
    }
  }, [draft.holdExpires]);

  // Countdown timer
  useEffect(() => {
    if (!holdExpires) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((holdExpires - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        addToast('Blokada terminu wygasła', 'error');
        navigate(`#/rezerwacja/${mentorId}`);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [holdExpires, mentorId, addToast, navigate]);

  const handlePromoCheck = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoValid(null);
      setPromoError('');
      return;
    }
    if (PROMO_CODES[code]) {
      setPromoValid(PROMO_CODES[code]);
      setPromoError('');
    } else {
      setPromoValid(null);
      setPromoError('Nieprawidłowy kod rabatowy');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal.trim() || goal.length < 20) {
      addToast('Cel sesji musi mieć min. 20 znaków', 'error');
      return;
    }

    if (forceNextError) {
      addToast('Symulowany błąd serwera. Spróbuj ponownie.', 'error');
      return;
    }

    // Simulate payment processing
    addToast('Przetwarzamy płatność…', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Handle payment simulation
    if (paymentSimulation === 'declined') {
      addToast('Płatność odrzucona przez operatora. Spróbuj innej metody.', 'error');
      return;
    }
    if (paymentSimulation === '3ds_interrupted') {
      addToast('Weryfikacja 3DS przerwana. Spróbuj ponownie.', 'error');
      return;
    }
    if (paymentSimulation === 'hold_expired') {
      addToast('Blokada terminu wygasła. Wybierz termin ponownie.', 'error');
      navigate(`#/rezerwacja/${mentorId}`);
      return;
    }

    // Success
    updateDraft({ goal: goal.trim() });
    confirmBooking();
    addToast('Płatność zakończona sukcesem!', 'success');
    navigate(`#/potwierdzenie/s${Date.now()}`);
  };

  const basePrice = mentor.trialPrice;
  const discount = promoValid?.discount || 0;
  const discountedPrice = Math.round(basePrice * (1 - discount / 100));
  const serviceFee = Math.round(discountedPrice * 0.1); // 10% service fee
  const total = discountedPrice + serviceFee;

  const sessionDate = new Date(draft.startsAt!);
  const formattedDate = sessionDate.toLocaleDateString('pl-PL', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = sessionDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="layout-checkout">
      <div>
        {/* Steps */}
        <div className="steps-bar" style={{ marginBottom: '1rem' }} role="progressbar" aria-valuenow={2} aria-valuemin={1} aria-valuemax={4}>
          <span className="is-done">1. Mentor ✓</span>
          <span className="is-done">2. Termin ✓</span>
          <span className="is-active">3. Płatność</span>
          <span>4. Potwierdzenie</span>
        </div>

        {/* Mentor summary */}
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="avatar" style={{ '--h': mentor.hue, '--s': '48px' }} aria-hidden="true">
            {mentor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="type-body" style={{ margin: 0 }}>{mentor.name}</h2>
            <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.875rem' }}>
              {formattedDate} o {formattedTime} · 30 min · Sesja próbna
            </p>
          </div>
        </div>

        {/* Goal field */}
        <section style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="goal" className="type-label" style={{ display: 'block', marginBottom: '8px' }}>
            Z czym przychodzisz? (cel sesji) <span style={{ color: 'var(--status-danger-fg)' }}>*</span>
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className="textarea"
            placeholder="Np. Chcę przejść code review mojego projektu portfolio, ustalić plan nauki na najbliższe 8 tygodni i dowiedzieć się, jak przygotować się do rozmów technicznych…"
            minLength={20}
            maxLength={500}
            rows={4}
            required
          />
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            {goal.length}/500 znaków (min. 20, wymagane dla sesji próbnej)
          </p>
        </section>

        {/* Payment methods */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 className="type-label" style={{ marginBottom: '8px' }}>Metoda płatności</h3>
          <div className="pay-methods" role="radiogroup" aria-label="Metoda płatności">
            {PAYMENT_METHODS.map(method => (
              <label 
                key={method.id} 
                className={`pay-method ${selectedPayment === method.id ? '' : ''}`}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'center', padding: '12px',
                  border: `1px solid ${selectedPayment === method.id ? 'var(--action-primary)' : 'var(--border-divider)'}`,
                  borderRadius: 'var(--shape-control)', cursor: 'pointer',
                  background: selectedPayment === method.id ? 'var(--selected-bg)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPayment === method.id}
                  onChange={() => setSelectedPayment(method.id)}
                  style={{ accentColor: 'var(--action-primary)' }}
                />
                <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                <div>
                  <strong>{method.label}</strong>
                  <p className="text-muted" style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>{method.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          {/* Simulated payment embed */}
          <div className="pay-embed" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
              <strong>Symulacja bramki płatniczej</strong><br />
              W produkcji tutaj osadzone są pola operatora (Stripe Elements, BLIK widget, P24 iframe).
              Wybrana metoda: <strong>{PAYMENT_METHODS.find(m => m.id === selectedPayment)?.label}</strong>
              {paymentSimulation !== 'success' && (
                <span style={{ color: 'var(--status-danger-fg)', marginLeft: '8px' }}>
                  ⚠️ Symulacja: {paymentSimulation === 'declined' ? 'odrzucona' : paymentSimulation === '3ds_interrupted' ? '3DS przerwane' : 'wygaśnięcie hold'}
                </span>
              )}
            </p>
          </div>
        </section>

        {/* Promo code */}
        <section style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="promo" className="type-label" style={{ display: 'block', marginBottom: '8px' }}>Kod rabatowy</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="promo"
              type="text"
              value={promoCode}
              onChange={e => { setPromoCode(e.target.value); setPromoValid(null); setPromoError(''); }}
              className="input"
              placeholder="Np. KOMPAS10"
              style={{ flex: 1, textTransform: 'uppercase' }}
            />
            <button 
              type="button" 
              className="btn btn--secondary" 
              onClick={handlePromoCheck}
              disabled={!promoCode.trim()}
            >
              Sprawdź
            </button>
          </div>
          {promoValid && (
            <p className="text-status-success" style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
              ✓ Kod zaakceptowany: {promoValid.discount}% zniżki ({promoValid.description})
            </p>
          )}
          {promoError && (
            <p className="text-status-danger" style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
              ✕ {promoError}
            </p>
          )}
        </section>

        {/* Hold countdown */}
        {holdExpires && (
          <div className="hold" style={{ marginBottom: '1.5rem' }} role="timer" aria-live="polite">
            <span>⏱️</span>
            <span>
              Termin zablokowany na <strong>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong>
              {countdown < 60 && <span style={{ color: 'var(--status-danger-fg)' }}> — kończy się za chwilę!</span>}
            </span>
          </div>
        )}

        {/* Order summary */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 className="type-label" style={{ marginBottom: '8px' }}>Podsumowanie</h3>
          <div className="card">
            <dl className="dl" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', margin: 0 }}>
              <dt>Sesja próbna (30 min)</dt>
              <dd style={{ textAlign: 'right' }}>{formatMoney(basePrice)}</dd>
              {discount > 0 && (
                <>
                  <dt>Zniżka ({discount}%)</dt>
                  <dd style={{ textAlign: 'right', color: 'var(--status-success-fg)' }}>-{formatMoney(basePrice - discountedPrice)}</dd>
                </>
              )}
              <dt>Opłata serwisowa (10%)</dt>
              <dd style={{ textAlign: 'right' }}>{formatMoney(serviceFee)}</dd>
              <dt className="total">Razem do zapłaty</dt>
              <dd className="total" style={{ textAlign: 'right', fontSize: '1.1rem' }}>{formatMoney(total)}</dd>
            </dl>
          </div>
        </section>

        {/* Guarantee note */}
        <div className="guarantee" style={{ marginBottom: '1.5rem' }}>
          <span className="ic" style={{ color: 'var(--ok)' }}>✓</span>
          <span>Gwarancja: nie pasuje? Darmowa zamiana mentora lub zwrot 100%. Płatność potwierdzona po przelewie.</span>
        </div>

        {/* Pay button */}
        <button 
          className="btn btn--primary btn--block btn--lg"
          onClick={handleSubmit}
          style={{ minHeight: '56px', fontSize: '1.05rem' }}
        >
          Zapłać {formatMoney(total)} i zarezerwuj
        </button>
      </div>

      {/* Sidebar summary */}
      <aside style={{ position: 'sticky', top: '100px' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 className="type-section-title font-serif" style={{ marginBottom: '1rem', textAlign: 'center' }}>Podsumowanie</h3>
          <dl className="dl" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px', margin: 0, fontSize: '0.9rem' }}>
            <dt className="text-muted">Mentor</dt>
            <dd style={{ textAlign: 'right', fontWeight: 500 }}>{mentor.name}</dd>
            <dt className="text-muted">Termin</dt>
            <dd style={{ textAlign: 'right' }}>{formattedDate}</dd>
            <dt className="text-muted">Godzina</dt>
            <dd style={{ textAlign: 'right' }}>{formattedTime}</dd>
            <dt className="text-muted">Czas trwania</dt>
            <dd style={{ textAlign: 'right' }}>30 min</dd>
            <dt className="text-muted">Typ</dt>
            <dd style={{ textAlign: 'right' }}>Sesja próbna</dd>
            <dt className="text-muted total">Do zapłaty</dt>
            <dd className="total" style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 700 }}>{formatMoney(total)}</dd>
          </dl>
        </div>
      </aside>
    </div>
  );
}
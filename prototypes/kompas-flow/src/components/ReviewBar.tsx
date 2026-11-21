import React from 'react';
import { useDemo } from '../context/DemoContext';
import { STUDENT_PERSONAS, ROLE_LABELS } from '../utils/types';
import { REVIEW_BAR_HEIGHT } from '../utils/constants';

export function ReviewBar() {
  const { 
    role, 
    currentStudent, 
    paymentSimulation, 
    setPaymentSimulation,
    forceNextError, 
    toggleForceError,
    simulateSlotConflict, 
    toggleSlotConflict,
    simulateSessionExpiry, 
    toggleSessionExpiry,
    darkMode,
    toggleDarkMode,
  } = useDemo();

  const [activePersona, setActivePersona] = React.useState<string | null>(currentStudent?.id || null);

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const persona = STUDENT_PERSONAS.find(p => p.id === e.target.value);
    if (persona) {
      setActivePersona(persona.id);
      // The DemoContext doesn't have a direct method for this, but we can use the existing loginAsStudent
      // For now, just update the local state
    }
  };

  return (
    <div 
      className="review-bar" 
      role="region" 
      aria-label="Pasek kontrolny scenariuszy"
      style={{ height: REVIEW_BAR_HEIGHT }}
    >
      <div className="review-bar__group" style={{ borderRight: '1px solid var(--border-divider)', paddingRight: '16px' }}>
        <span className="review-bar__label">Osoba:</span>
        <select 
          className="proto-bar__select"
          value={activePersona || ''}
          onChange={handlePersonaChange}
          style={{ minWidth: '180px' }}
        >
          <option value="">— wybierz osobę —</option>
          {STUDENT_PERSONAS.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.goal.slice(0, 30)}…</option>
          ))}
        </select>
      </div>

      <div className="review-bar__group" style={{ borderRight: '1px solid var(--border-divider)', paddingRight: '16px' }}>
        <span className="review-bar__label">Płatność:</span>
        <select 
          className="proto-bar__select"
          value={paymentSimulation}
          onChange={e => setPaymentSimulation(e.target.value as any)}
          style={{ minWidth: '160px' }}
        >
          <option value="success">✅ Sukces</option>
          <option value="declined">❌ Odrzucona</option>
          <option value="3ds_interrupted">🔄 3DS przerwane</option>
          <option value="hold_expired">⏱️ Wygaśnięcie hold</option>
        </select>
      </div>

      <div className="review-bar__group" style={{ borderRight: '1px solid var(--border-divider)', paddingRight: '16px' }}>
        <label className="review-bar__toggle">
          <input 
            type="checkbox" 
            checked={forceNextError} 
            onChange={toggleForceError}
          />
          <span className="review-bar__label">Błąd następnego żądania</span>
        </label>
      </div>

      <div className="review-bar__group" style={{ borderRight: '1px solid var(--border-divider)', paddingRight: '16px' }}>
        <label className="review-bar__toggle">
          <input 
            type="checkbox" 
            checked={simulateSlotConflict} 
            onChange={toggleSlotConflict}
          />
          <span className="review-bar__label">Konflikt slota (409)</span>
        </label>
      </div>

      <div className="review-bar__group" style={{ borderRight: '1px solid var(--border-divider)', paddingRight: '16px' }}>
        <label className="review-bar__toggle">
          <input 
            type="checkbox" 
            checked={simulateSessionExpiry} 
            onChange={toggleSessionExpiry}
          />
          <span className="review-bar__label">Wygaśnięcie sesji</span>
        </label>
      </div>

      <div className="review-bar__group" style={{ borderRight: '1px solid var(--border-divider)', paddingRight: '16px' }}>
        <label className="review-bar__toggle">
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={toggleDarkMode}
          />
          <span className="review-bar__label">Ciemny motyw</span>
        </label>
      </div>

      <div className="review-bar__group">
        <span className="proto-bar__badge">PROTOTYP</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Rola: {ROLE_LABELS[role]}
        </span>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { sessionById, formatDateTime, DEMO_NOW } from '../utils/mocks';
import { useToast } from '../components/ToastContainer';
import { REVIEW_TAGS, REVIEW_PRIVATE_TAGS } from '../utils/constants';

export function U7Review({ id }: { id: string }) {
  const { sessions } = useDemo();
  const { addToast } = useToast();
  const session = sessions.find(s => s.id === id) || sessionById(id);
  
  if (!session) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔍</div>
        <h2 className="empty-state__title">Sesja nie znaleziona</h2>
        <a href="#/sesje" className="btn btn--primary" style={{ marginTop: '1rem' }} onClick={e => { e.preventDefault(); navigate('#/sesje'); }}>
          Moje sesje
        </a>
      </div>
    );
  }

  const mentor = session.mentorId === 'm1' ? { name: 'Kasia Nowicka', hue: 168 } : { name: 'Mentor', hue: 0 };
  const formattedDate = formatDateTime(session.startsAt, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = formatDateTime(session.startsAt, { hour: '2-digit', minute: '2-digit' });

  const [rating, setRating] = useState<number>(0);
  const [publicTags, setPublicTags] = useState<string[]>([]);
  const [publicOpinion, setPublicOpinion] = useState('');
  const [privateOpinion, setPrivateOpinion] = useState('');
  const [showPrivateTags, setShowPrivateTags] = useState(false);
  const [privateTags, setPrivateTags] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!rating) {
      addToast('Wybierz ocenę (gwiazdki)', 'error');
      return;
    }
    if (rating <= 2 && !publicOpinion.trim()) {
      addToast('Ocena ≤ 2 wymaga uzasadnienia w opinii publicznej', 'error');
      return;
    }
    if (publicOpinion.length > 0 && publicOpinion.length < 20) {
      addToast('Opinia publiczna min. 20 znaków', 'error');
      return;
    }
    addToast('Dziękujemy za ocenę! (symulacja zapisu)', 'success');
    navigate('#/sesje');
  };

  const handleContinue = (choice: 'continue' | 'replace' | 'refund') => {
    if (choice === 'continue') {
      navigate('#/plany');
    } else if (choice === 'replace') {
      addToast('Darmowa zamiana mentora — szukaj nowego (symulacja)', 'success');
      navigate('#/mentorzy');
    } else {
      addToast('Zwrot na kartę — przetwarzamy (symulacja)', 'success');
      navigate('#/sesje');
    }
  };

  return (
    <div className="narrow" style={{ maxWidth: '640px' }}>
      {/* Session header */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div className="avatar" style={{ '--h': mentor.hue, '--s': '56px' }} aria-hidden="true">
            {mentor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="type-page-title font-serif" style={{ marginBottom: '0.5rem' }}>{session.goal || 'Sesja'}</h1>
            <p className="text-muted" style={{ margin: 0 }}>
              {mentor.name} • {formattedDate} o {formattedTime} • {session.durationMin} min • Sesja próbna
            </p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Jak oceniasz tę sesję?</h2>
        
        <fieldset className="star-input" style={{ marginBottom: '1rem' }}>
          <legend className="type-label" style={{ textAlign: 'left', marginBottom: '8px' }}>Twoja ocena</legend>
          {[5,4,3,2,1].map(star => (
            <label key={star} style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <span 
                role="radio" 
                aria-checked={rating === star}
                style={{ 
                  fontSize: '2.3rem', 
                  color: rating >= star ? 'var(--action-primary)' : 'var(--border-divider)', 
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={() => {
                  // Hover effect handled by CSS sibling selector
                }}
              >
                ★
              </span>
            </label>
          ))}
        </fieldset>
        
        {rating > 0 && (
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {rating === 5 ? 'Doskonała!' : rating === 4 ? 'Bardzo dobra' : rating === 3 ? 'Średnia' : rating === 2 ? 'Słaba' : 'Bardzo słaba'}
          </p>
        )}
      </section>

      {/* Public tags */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Tagi (widoczne publicznie)
          <button className="btn btn--ghost btn--s" onClick={() => setShowPrivateTags(!showPrivateTags)}>
            {showPrivateTags ? 'Ukryj prywatne' : 'Dodaj prywatne'}
          </button>
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {REVIEW_TAGS.map(tag => (
            <button
              key={tag}
              className={`chip ${publicTags.includes(tag) ? 'chip--on' : ''}`}
              onClick={() => setPublicTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              style={{ background: publicTags.includes(tag) ? 'var(--selected-bg)' : 'var(--surface-panel)', borderColor: publicTags.includes(tag) ? 'var(--selected-border)' : 'var(--border-divider)', color: publicTags.includes(tag) ? 'var(--selected-border)' : 'var(--text-default)' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Private tags */}
      {showPrivateTags && (
        <section style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--status-warning-bg)', border: '1px solid var(--status-warning-fg)', borderRadius: 'var(--shape-control)' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--status-warning-fg)' }}>🔒</span>
            Tagi prywatne (tylko dla mentora)
          </h2>
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Te tagi nie pojawią się w opinii publicznej.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {REVIEW_PRIVATE_TAGS.map(tag => (
              <button
                key={tag}
                className={`chip ${privateTags.includes(tag) ? 'chip--on' : ''}`}
                onClick={() => setPrivateTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                style={{ background: privateTags.includes(tag) ? 'var(--status-warning-fg)' : 'var(--surface-panel)', borderColor: privateTags.includes(tag) ? 'var(--status-warning-fg)' : 'var(--border-divider)', color: privateTags.includes(tag) ? '#fff' : 'var(--text-default)' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Public opinion */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '0.5rem' }}>
          Opinia publiczna {rating <= 2 && <span style={{ color: 'var(--status-danger-fg)' }}>*</span>}
        </h2>
        {rating <= 2 && <p className="text-status-danger" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Ocena ≤ 2 wymaga uzasadnienia.</p>}
        <textarea
          value={publicOpinion}
          onChange={e => setPublicOpinion(e.target.value)}
          className="textarea"
          placeholder="Jak ocenisz tę sesję? Co było dobre, a co można poprawić? (min. 20 znaków, max 1000)"
          maxLength={1000}
          rows={4}
        />
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{publicOpinion.length}/1000 znaków</p>
      </section>

      {/* Private opinion */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 className="type-section-title font-serif" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--status-warning-fg)' }}>🔒</span>
          Uwagi prywatne dla mentora (niepubliczne)
        </h2>
        <textarea
          value={privateOpinion}
          onChange={e => setPrivateOpinion(e.target.value)}
          className="textarea"
          placeholder="Co chciałbyś przekazać mentorowi prywatnie? (opcjonalnie, max 1000 znaków)"
          maxLength={1000}
          rows={3}
        />
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>{privateOpinion.length}/1000 znaków</p>
      </section>

      {/* Continue choice - only for trial sessions */}
      {session.type === 'trial' && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Co dalej?</h2>
          <div className="choice" role="radiogroup" aria-label="Wybór kontynuacji">
            <label className="choice__opt">
              <input type="radio" name="continue" value="continue" />
              <div>
                <strong>Kontynuuj z {mentor.name}</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Wybierz plan i kontynuuj naukę</p>
              </div>
            </label>
            <label className="choice__opt">
              <input type="radio" name="continue" value="replace" />
              <div>
                <strong>Spróbuj z innym mentorem</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Darmowa zamiana mentora (gwarancja sesji próbnej)</p>
              </div>
            </label>
            <label className="choice__opt">
              <input type="radio" name="continue" value="refund" />
              <div>
                <strong>Zwrot na kartę</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Rezygnujesz z mentoringu, zwracamy pieniądze</p>
              </div>
            </label>
          </div>
        </section>
      )}

      {/* Submit */}
      <button 
        className="btn btn--primary btn--block btn--lg"
        onClick={handleSubmit}
        disabled={!rating || (rating <= 2 && !publicOpinion.trim())}
        style={{ minHeight: '52px', fontSize: '1rem' }}
      >
        {session.type === 'trial' ? 'Zapisz ocenę i wybierz dalszy krok' : 'Zapisz ocenę'}
      </button>

      <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
        Możesz edytować opinię do 7 dni po sesji. Opinia publiczna widoczna na profilu mentora.
      </p>
    </div>
  );
}
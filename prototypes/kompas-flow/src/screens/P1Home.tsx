import React from 'react';
import { useDemo } from '../context/DemoContext';
import { navigate } from '../utils/router';
import { CATEGORIES, MENTORS } from '../utils/mocks';
import { formatMoney } from '../utils/types';

export function P1Home() {
  const { role, setRole, loginAsStudent } = useDemo();
  const [searchQuery, setSearchQuery] = React.useState('');

  const featuredMentors = MENTORS.filter(m => m.verified && m.acceptingNew).slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`#/mentorzy?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="type-display font-serif" style={{ marginBottom: '0.5rem' }}>
          Znajdź mentora, który pomoże Ci ruszyć do przodu
        </h1>
        <p className="lead" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
          Mentoring 1:1 online — IT, kariera, biznes, design. Sesja próbna 30 min, plan sesji tygodniowo, saldo kredytów, przełożenia bez kosztów do 12 h.
        </p>
        
        <form onSubmit={handleSearch} className="searchbar" style={{ maxWidth: '600px' }}>
          <label htmlFor="home-search" className="visually-hidden">Szukaj mentora po temacie</label>
          <input
            id="home-search"
            type="search"
            placeholder="Np. React, TypeScript, prowadzenie zespołu, ML…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 0', fontSize: '1rem', minWidth: 0 }}
            autoComplete="off"
            aria-label="Szukaj mentora po temacie"
          />
          <button type="submit" className="btn btn--primary" style={{ padding: '10px 20px' }}>
            Szukaj
          </button>
        </form>
      </section>

      {/* How it works */}
      <section aria-labelledby="steps-title" className="steps" style={{ marginTop: '3rem' }}>
        <h2 id="steps-title" className="type-section-title font-serif" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Jak to działa
        </h2>
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="card stack" style={{ borderTop: '3px solid var(--action-primary)', paddingTop: '1.5rem' }}>
            <div className="steps__n" style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.6rem', color: 'var(--action-primary)' }}>01</div>
            <h3 className="type-body" style={{ fontWeight: 600 }}>Znajdź mentora</h3>
            <p className="text-muted">Przeglądaj profile z wideo, opiniami i kalendarzem dostępności. Filtruj po temacie, cenie, języku.</p>
          </div>
          <div className="card stack" style={{ borderTop: '3px solid var(--action-primary)', paddingTop: '1.5rem' }}>
            <div className="steps__n" style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.6rem', color: 'var(--action-primary)' }}>02</div>
            <h3 className="type-body" style={{ fontWeight: 600 }}>Sesja próbna 30 min</h3>
            <p className="text-muted">Zarezerwuj termin, opłać w obniżonej cenie. Jeśli nie pasuje — darmowa zamiana mentora lub zwrot.</p>
          </div>
          <div className="card stack" style={{ borderTop: '3px solid var(--action-primary)', paddingTop: '1.5rem' }}>
            <div className="steps__n" style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.6rem', color: 'var(--action-primary)' }}>03</div>
            <h3 className="type-body" style={{ fontWeight: 600 }}>Wybierz plan</h3>
            <p className="text-muted">N sesji tygodniowo, rozliczane co 4 tygodnie. Sesje trafiają do salda u mentora. Przełóż lub anuluj do 12 h przed.</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="categories-title" style={{ marginTop: '3rem' }}>
        <h2 id="categories-title" className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>
          Popularne kategorie
        </h2>
        <div className="chips" style={{ gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <a
              key={cat}
              href={`#/mentorzy?topic=${encodeURIComponent(cat)}`}
              onClick={e => { e.preventDefault(); navigate(`#/mentorzy?topic=${encodeURIComponent(cat)}`); }}
              className="chip"
            >
              {cat}
            </a>
          ))}
        </div>
      </section>

      {/* Featured mentors */}
      <section aria-labelledby="featured-title" style={{ marginTop: '3rem' }}>
        <div className="page-head" style={{ marginBottom: '1rem' }}>
          <h2 id="featured-title" className="type-page-title font-serif">Wyróżnieni mentorzy</h2>
          <a href="#/mentorzy" className="btn btn--ghost btn--s">Wszyscy mentorzy →</a>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {featuredMentors.map(mentor => (
            <article key={mentor.id} className="card--mini" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <a href={`#/mentorzy/${mentor.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${mentor.id}`); }} style={{ flexShrink: 0 }}>
                  <div className="avatar" style={{ '--h': mentor.hue, '--s': '64px' }} aria-hidden="true">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </a>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a href={`#/mentorzy/${mentor.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${mentor.id}`); }} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 className="mentor-card__headline" style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>{mentor.name}</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem', margin: '4px 0 0' }}>{mentor.headline}</p>
                  </a>
                  <div className="tags" style={{ marginTop: '8px' }}>
                    {mentor.categories.slice(0, 3).map(c => (
                      <span key={c} className="tag">{c}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span className="rating" style={{ color: 'var(--action-primary)' }}>
                      {'★'.repeat(Math.floor(mentor.rating))}{'☆'.repeat(5 - Math.floor(mentor.rating))}
                      <span className="text-muted" style={{ fontWeight: 400, marginLeft: '4px' }}>{mentor.rating} ({mentor.reviewsCount})</span>
                    </span>
                    <span className="price" style={{ fontFamily: 'var(--font-family-serif)', color: 'var(--text-default)' }}>
                      {formatMoney(mentor.trialPrice)}/30 min
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        {featuredMentors.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">👥</div>
            <h3 className="empty-state__title">Brak wyróżnionych mentorów</h3>
            <p className="empty-state__text">Kiedy mentorzy przejdą weryfikację, pojawią się tutaj.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="cta-band" style={{ marginTop: '3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Chcesz dzielić się wiedzą?</h2>
          <p style={{ color: '#e7f0ec', marginBottom: '1.5rem' }}>
            Zostań mentorem na Kompasie. Przejdź onboarding, wypełnij profil i zacznij zarabiać na swojej ekspertyzie.
          </p>
          <a href="#/mentor/onboarding/1" className="btn btn--light btn--lg" onClick={e => { e.preventDefault(); navigate('#/mentor/onboarding/1'); }}>
            Zostań mentorem
          </a>
        </div>
      </section>
    </div>
  );
}
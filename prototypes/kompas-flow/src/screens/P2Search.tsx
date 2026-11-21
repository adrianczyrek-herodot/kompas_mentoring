import React, { useState, useMemo, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { navigate } from '../utils/router';
import { MENTORS, CATEGORIES, weekSlots } from '../utils/mocks';
import { formatMoney } from '../utils/types';
import { Mentor } from '../utils/mocks';

export function P2Search() {
  const { role, favorites, toggleFavorite, viewState } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'sessions'>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeFilterToClear, setActiveFilterToClear] = useState<string | null>(null);

  // Get topic from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const topic = params.get('topic');
    if (topic) {
      setSelectedTopic(topic);
      setSearchQuery(topic);
    }
    const q = params.get('q');
    if (q) setSearchQuery(q);
  }, []);

  const filteredMentors = useMemo(() => {
    let result = MENTORS.filter(m => m.verified && m.acceptingNew);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.headline.toLowerCase().includes(q) ||
        m.categories.some(c => c.toLowerCase().includes(q)) ||
        m.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedTopic) {
      result = result.filter(m => m.categories.includes(selectedTopic));
    }

    result = result.filter(m => m.rate60 >= priceRange[0] && m.rate60 <= priceRange[1]);

    if (selectedLanguages.length > 0) {
      result = result.filter(m => selectedLanguages.every(l => m.languages.includes(l)));
    }

    if (minExperience > 0) {
      result = result.filter(m => m.yearsExp >= minExperience);
    }

    if (onlyVerified) {
      result = result.filter(m => m.verified);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.rate60 - b.rate60);
        break;
      case 'price_desc':
        result.sort((a, b) => b.rate60 - a.rate60);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'sessions':
        result.sort((a, b) => b.sessions - a.sessions);
        break;
    }

    return result;
  }, [searchQuery, selectedTopic, priceRange, selectedLanguages, minExperience, onlyVerified, sortBy]);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters: { label: string; key: string; clear: () => void }[] = [];
    if (searchQuery.trim()) filters.push({ label: `Szukano: "${searchQuery}"`, key: 'search', clear: () => setSearchQuery('') });
    if (selectedTopic) filters.push({ label: `Temat: ${selectedTopic}`, key: 'topic', clear: () => setSelectedTopic('') });
    if (priceRange[0] > 0 || priceRange[1] < 1000) filters.push({ label: `Cena: ${priceRange[0]}–${priceRange[1]} zł/60min`, key: 'price', clear: () => setPriceRange([0, 1000]) });
    if (selectedLanguages.length > 0) filters.push({ label: `Języki: ${selectedLanguages.join(', ')}`, key: 'lang', clear: () => setSelectedLanguages([]) });
    if (minExperience > 0) filters.push({ label: `Doświadczenie: ≥${minExperience} lat`, key: 'exp', clear: () => setMinExperience(0) });
    if (onlyVerified) filters.push({ label: 'Tylko zweryfikowani', key: 'verified', clear: () => setOnlyVerified(false) });
    return filters;
  }, [searchQuery, selectedTopic, priceRange, selectedLanguages, minExperience, onlyVerified]);

  const mostRestrictiveFilter = useMemo(() => {
    // Simplified: return the filter that reduces results the most
    if (activeFilters.length === 0) return null;
    return activeFilters[0]; // In real app, compute properly
  }, [activeFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is reactive, just close mobile filters
    setMobileFiltersOpen(false);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTopic('');
    setPriceRange([0, 1000]);
    setSelectedLanguages([]);
    setMinExperience(0);
    setOnlyVerified(false);
  };

  return (
    <div>
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Wyszukiwarka mentorów</h1>
        <button 
          className="btn btn--ghost btn--s only-mobile"
          onClick={() => setMobileFiltersOpen(true)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="filters-panel"
        >
          🔍 Filtry
        </button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="searchbar" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="search-input" className="visually-hidden">Szukaj mentora</label>
        <input
          id="search-input"
          type="search"
          placeholder="Wpisz temat, nazwę, technologię…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 0', fontSize: '1rem', minWidth: 0 }}
          autoComplete="off"
        />
        <button type="submit" className="btn btn--primary" style={{ padding: '10px 20px' }}>
          Szukaj
        </button>
      </form>

      {/* Active filters chips */}
      {activeFilters.length > 0 && (
        <div className="chips" style={{ marginBottom: '1rem', gap: '8px', flexWrap: 'wrap' }}>
          {activeFilters.map(f => (
            <span key={f.key} className="chip chip--check" style={{ borderColor: 'var(--action-primary)', background: 'var(--brand-soft)', color: 'var(--brand)' }}>
              {f.label}
              <button 
                onClick={f.clear}
                aria-label={`Usuń filtr: ${f.label}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: 'inherit', fontSize: '1rem', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
          <button onClick={clearAllFilters} className="btn btn--ghost btn--s" style={{ padding: '4px 10px' }}>
            Wyczyść wszystko
          </button>
        </div>
      )}

      {/* Results count */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <p className="text-muted" style={{ margin: 0 }}>
          {filteredMentors.length === 0 && activeFilters.length > 0
            ? `Brak mentorów dla tych filtrów. ${mostRestrictiveFilter ? `Najbardziej zawężający filtr: "${mostRestrictiveFilter.label}" — wyczyść go, by rozszerzyć wyniki.` : ''}`
            : filteredMentorCountMessage(filteredMentors.length)
          }
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="sort-select" className="text-muted" style={{ fontSize: '0.875rem' }}>Sortuj:</label>
          <select
            id="sort-select"
            className="select-s"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="relevance">Trafność</option>
            <option value="price_asc">Cena: najniższa</option>
            <option value="price_desc">Cena: najwyższa</option>
            <option value="rating">Ocena</option>
            <option value="sessions">Liczba sesji</option>
          </select>
        </div>
      </div>

      {/* Layout: sidebar filters + mentor list */}
      <div className="layout-side">
        {/* Sidebar Filters */}
        <aside 
          id="filters-panel"
          className={`side ${mobileFiltersOpen ? 'side--open' : ''} only-desktop side--static`}
          style={{ 
            display: 'none',
            position: 'sticky',
            top: '100px',
          }}
        >
          <div className="filters">
            <div>
              <h3 className="type-label" style={{ marginBottom: '8px' }}>Temat</h3>
              <input
                type="text"
                placeholder="Filtruj tematy…"
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className="input"
                list="topic-suggestions"
              />
              <datalist id="topic-suggestions">
                {CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <h3 className="type-label" style={{ marginBottom: '8px' }}>
                Cena za 60 min: {priceRange[0]}–{priceRange[1]} zł
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[0]}
                  onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  style={{ flex: 1 }}
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div>
              <h3 className="type-label" style={{ marginBottom: '8px' }}>Język sesji</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['polski', 'angielski', 'niemiecki', 'francuski', 'espański'].map(lang => (
                  <label key={lang} className="check">
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang)}
                      onChange={e => setSelectedLanguages(e.target.checked 
                        ? [...selectedLanguages, lang] 
                        : selectedLanguages.filter(l => l !== lang))}
                    />
                    <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="type-label" style={{ marginBottom: '8px' }}>Lata doświadczenia</h3>
              <select className="input" value={minExperience} onChange={e => setMinExperience(parseInt(e.target.value))}>
                <option value={0}>Dowolne</option>
                <option value={1}>≥ 1 rok</option>
                <option value={3}>≥ 3 lata</option>
                <option value={5}>≥ 5 lat</option>
                <option value={10}>≥ 10 lat</option>
              </select>
            </div>

            <div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={e => setOnlyVerified(e.target.checked)}
                />
                <span>Tylko zweryfikowani mentorzy</span>
              </label>
            </div>

            {mobileFiltersOpen && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-divider)' }}>
                <button className="btn btn--primary btn--block" onClick={() => setMobileFiltersOpen(false)}>Zastosuj</button>
                <button className="btn btn--ghost btn--block" onClick={clearAllFilters}>Wyczyść</button>
              </div>
            )}
          </div>
        </aside>

        {/* Mentor list */}
        <div style={{ flex: 1 }}>
          {viewState === 'loading' && (
            <div className="skeleton-wrap" role="status" aria-label="Wczytywanie mentorów">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="sk sk--card" style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: '14px' }} aria-hidden="true">
                  <div className="sk" style={{ width: '88px', height: '88px', borderRadius: 'var(--shape-panel)' }} />
                  <div>
                    <div className="sk sk--line" style={{ width: '60%' }} />
                    <div className="sk sk--line" style={{ width: '40%', marginTop: '8px' }} />
                    <div className="sk sk--line" style={{ width: '80%', marginTop: '12px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewState !== 'loading' && filteredMentors.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3 className="empty-state__title">Brak mentorów dla tych filtrów</h3>
              <p className="empty-state__text">
                {mostRestrictiveFilter 
                  ? `Najbardziej zawężający filtr: "${mostRestrictiveFilter.label}". Wyczyść go, by rozszerzyć wyniki.`
                  : 'Spróbuj poluzować filtry lub zmień zapytanie.'
                }
              </p>
              <button className="btn btn--primary" onClick={clearAllFilters}>Wyczyść wszystkie filtry</button>
            </div>
          )}

          {viewState !== 'loading' && filteredMentors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMentors.map(mentor => (
                <MentorCard key={mentor.id} mentor={mentor} isFavorite={favorites.has(mentor.id)} onToggleFavorite={() => toggleFavorite(mentor.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters bottom sheet */}
      {mobileFiltersOpen && (
        <div className="modal-backdrop" onClick={() => setMobileFiltersOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <button className="modal__close" onClick={() => setMobileFiltersOpen(false)} aria-label="Zamknij">×</button>
            <h2 className="type-page-title font-serif" style={{ marginBottom: '1rem' }}>Filtry</h2>
            <div className="filters" style={{ padding: 0 }}>
              <div>
                <h3 className="type-label" style={{ marginBottom: '8px' }}>Temat</h3>
                <input
                  type="text"
                  placeholder="Filtruj tematy…"
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="input"
                  list="topic-suggestions-mobile"
                />
                <datalist id="topic-suggestions-mobile">
                  {CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div>
                <h3 className="type-label" style={{ marginBottom: '8px' }}>Cena za 60 min: {priceRange[0]}–{priceRange[1]} zł</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="range" min="0" max="1000" step="50" value={priceRange[0]} onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])} style={{ flex: 1 }} />
                  <input type="range" min="0" max="1000" step="50" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} style={{ flex: 1 }} />
                </div>
              </div>
              <div>
                <h3 className="type-label" style={{ marginBottom: '8px' }}>Język sesji</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['polski', 'angielski', 'niemiecki', 'francuski', 'espański'].map(lang => (
                    <label key={lang} className="check">
                      <input type="checkbox" checked={selectedLanguages.includes(lang)} onChange={e => setSelectedLanguages(e.target.checked ? [...selectedLanguages, lang] : selectedLanguages.filter(l => l !== lang))} />
                      <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="type-label" style={{ marginBottom: '8px' }}>Lata doświadczenia</h3>
                <select className="input" value={minExperience} onChange={e => setMinExperience(parseInt(e.target.value))}>
                  <option value={0}>Dowolne</option>
                  <option value={1}>≥ 1 rok</option>
                  <option value={3}>≥ 3 lata</option>
                  <option value={5}>≥ 5 lat</option>
                  <option value={10}>≥ 10 lat</option>
                </select>
              </div>
              <div>
                <label className="check">
                  <input type="checkbox" checked={onlyVerified} onChange={e => setOnlyVerified(e.target.checked)} />
                  <span>Tylko zweryfikowani mentorzy</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-divider)' }}>
                <button className="btn btn--primary btn--block" onClick={() => setMobileFiltersOpen(false)}>Zastosuj</button>
                <button className="btn btn--ghost btn--block" onClick={clearAllFilters}>Wyczyść</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mentorCountMessage(count: number): string {
  if (count === 1) return 'Znaleziono 1 mentora';
  if (count < 5) return `Znaleziono ${count} mentorów`;
  return `Znaleziono ${count} mentorów`;
}

// MentorCard component
function MentorCard({ mentor, isFavorite, onToggleFavorite }: { mentor: Mentor; isFavorite: boolean; onToggleFavorite: () => void }) {
  const slots = weekSlots(mentor, 0).flatMap(d => d.slots);
  const freeSlots = slots.filter(s => !s.taken).length;

  return (
    <article className="mentor-card card" style={{ display: 'grid', gridTemplateColumns: '88px 1fr 190px', gap: '14px', alignItems: 'start' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <a href={`#/mentorzy/${mentor.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${mentor.id}`); }} className="mentor-card__media" style={{ width: '88px', height: '88px', borderRadius: 'var(--shape-panel)', overflow: 'hidden', background: `hsl(${mentor.hue} 45% 86%)`, display: 'grid', placeItems: 'center' }}>
          <span className="avatar" style={{ '--h': mentor.hue, '--s': '88px' }} aria-hidden="true">{mentor.name.split(' ').map(n => n[0]).join('')}</span>
        </a>
        {mentor.verified && (
          <span className="badge badge--success" style={{ fontSize: '0.7rem' }}>✓ Zweryfikowany</span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <a href={`#/mentorzy/${mentor.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${mentor.id}`); }} className="h3link" style={{ textDecoration: 'none', color: 'inherit' }}>
              {mentor.name}
              {mentor.verified && <span className="verified" aria-label="Zweryfikowany">✓</span>}
            </a>
            <p className="mentor-card__headline text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>{mentor.headline}</p>
          </div>
          <button
            onClick={onToggleFavorite}
            className={`fav ${isFavorite ? 'fav--on' : ''}`}
            aria-label={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        </div>

        <div className="tags" style={{ marginTop: '8px' }}>
          {mentor.categories.slice(0, 3).map(c => (
            <span key={c} className="tag">{c}</span>
          ))}
          {mentor.categories.length > 3 && <span className="tag tag--soft">+{mentor.categories.length - 3} więcej</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap', fontSize: '0.875rem' }}>
          <span className="rating" style={{ color: 'var(--action-primary)' }}>
            {'★'.repeat(Math.floor(mentor.rating))}{'☆'.repeat(5 - Math.floor(mentor.rating))}
            <span className="text-muted" style={{ fontWeight: 400, marginLeft: '4px' }}>{mentor.rating} ({mentor.reviewsCount})</span>
          </span>
          <span className="text-muted">•</span>
          <span className="text-muted">{mentor.sessions} sesji</span>
          <span className="text-muted">•</span>
          <span className="text-muted">{mentor.returningPct}% powracających</span>
          <span className="text-muted">•</span>
          <span className="text-muted">odpowiada w {mentor.responseHours} h</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', borderLeft: '1px solid var(--border-divider)', paddingLeft: '16px' }}>
        <div className="price" style={{ fontFamily: 'var(--font-family-serif)', color: 'var(--text-default)' }}>
          {formatMoney(mentor.rate60)}
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}> / 60 min</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href={`#/mentorzy/${mentor.id}`} onClick={e => { e.preventDefault(); navigate(`#/mentorzy/${mentor.id}`); }} className="btn btn--ghost btn--s" style={{ minWidth: 'auto', padding: '8px 12px' }}>
            Profil
          </a>
          <a href={`#/rezerwacja/${mentor.id}`} onClick={e => { e.preventDefault(); navigate(`#/rezerwacja/${mentor.id}`); }} className="btn btn--primary btn--s" style={{ minWidth: 'auto', padding: '8px 12px' }}>
            {mentor.trialPrice > 0 ? `Próbna ${formatMoney(mentor.trialPrice)}` : 'Próbna gratis'}
          </a>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          {freeSlots} wolnych terminów w tym tygodniu
        </div>
      </div>
    </article>
  );
}
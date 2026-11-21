import React, { useState } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../components/ToastContainer';
import { CATEGORIES, DEMO_NOW } from '../utils/mocks';

const STEPS = [
  { id: 1, title: 'O mnie', fields: ['name', 'country', 'languages'] },
  { id: 2, title: 'Kompetencje', fields: ['categories', 'tags', 'yearsExp', 'companies'] },
  { id: 3, title: 'Opis i wideo', fields: ['headline', 'bio', 'videoUrl'] },
  { id: 4, title: 'Stawka', fields: ['rate60'] },
  { id: 5, title: 'Dostępność', fields: ['availability'] },
  { id: 6, title: 'Weryfikacja', fields: ['linkedin', 'kyc', 'payout'] },
] as const;

export function M1Onboarding({ krok }: { krok: string }) {
  const stepNum = parseInt(krok) || 1;
  const step = STEPS.find(s => s.id === stepNum) || STEPS[0];
  const { onboarding, toggleFavorite } = useDemo();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: 'Jan Kowalski',
    country: 'Polska',
    languages: ['polski', 'angielski'],
    categories: ['Frontend', 'Kariera w IT'],
    tags: ['React', 'TypeScript', 'Next.js'],
    yearsExp: 5,
    companies: ['Firma Sp. z o.o.'],
    headline: 'Senior Developer · React, TypeScript',
    bio: 'Od 5 lat buduję aplikacje webowe. Pomagam juniorom...',
    videoUrl: 'https://youtube.com/watch?v=example',
    rate60: 150,
    availability: new Set(['0-9', '0-10', '1-17', '2-9', '3-17', '4-8']),
    linkedin: 'https://linkedin.com/in/jankowalski',
    kycDoc: '',
    iban: '',
    tin: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    const d = formData;
    if (stepNum === 1) {
      if (!d.name || d.name.length < 2) newErrors.name = 'Imię min. 2 znaki';
      if (!d.country) newErrors.country = 'Wybierz kraj';
      if (!d.languages.length) newErrors.languages = 'Min. 1 język';
    }
    if (stepNum === 2) {
      if (!d.categories.length || d.categories.length > 5) newErrors.categories = '1–5 kategorii';
      if (!d.tags.length || d.tags.length < 3 || d.tags.length > 15) newErrors.tags = '3–15 tagów';
      if (d.yearsExp < 1 || d.yearsExp > 50) newErrors.yearsExp = '1–50 lat';
      if (!d.companies.length) newErrors.companies = 'Min. 1 firma';
    }
    if (stepNum === 3) {
      if (!d.headline || d.headline.length < 20 || d.headline.length > 80) newErrors.headline = 'Headline 20–80 znaków';
      if (!d.bio || d.bio.length < 300 || d.bio.length > 2000) newErrors.bio = 'Opis 300–2000 znaków';
      if (d.videoUrl && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/.test(d.videoUrl)) newErrors.videoUrl = 'Tylko YouTube/Vimeo';
    }
    if (stepNum === 4) {
      if (d.rate60 < 40 || d.rate60 > 1000) newErrors.rate60 = 'Stawka 40–1000 zł';
    }
    if (stepNum === 5) {
      if (d.availability.size < 3) newErrors.availability = 'Min. 3 h tygodniowo (min. 3 sloty)';
    }
    if (stepNum === 6) {
      if (!d.linkedin || !/linkedin\.com/.test(d.linkedin)) newErrors.linkedin = 'Wpisz poprawny URL LinkedIn';
      if (!d.kycDoc) newErrors.kycDoc = 'Wymagany dokument tożsamości';
      if (!d.iban || !/^[A-Z]{2}\d{2}/.test(d.iban)) newErrors.iban = 'Wpisz poprawny IBAN';
      if (!d.tin) newErrors.tin = 'Wymagany NIP/TIN';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (stepNum < 6) {
      navigate(`#/mentor/onboarding/${stepNum + 1}`);
    } else {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        addToast('Wniosek wysłany do weryfikacji! (symulacja)', 'success');
        navigate('#/mentor');
      }, 1500);
    }
  };

  const handlePrev = () => {
    if (stepNum > 1) navigate(`#/mentor/onboarding/${stepNum - 1}`);
  };

  const progress = (stepNum / 6) * 100;

  const earningsPreview = Math.round((formData.rate60 * 0.67) * 4 * 4); // 4 sesje/tydz * 4 tyg * 67% po prowizji 33%

  return (
    <div className="narrow" style={{ maxWidth: '720px' }}>
      {/* Stepper */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="progress" style={{ marginBottom: '1rem' }}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <ol className="stepper" style={{ display: 'flex', gap: '8px', listStyle: 'none', padding: 0, margin: 0, overflowX: 'auto' }}>
          {STEPS.map(s => (
            <li key={s.id} className={`${s.id < stepNum ? 'is-done' : ''} ${s.id === stepNum ? 'is-active' : ''}`} style={{ whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: '999px', background: s.id < stepNum ? 'var(--brand-soft)' : s.id === stepNum ? 'var(--brand)' : 'var(--line-2)', color: s.id < stepNum ? 'var(--brand)' : s.id === stepNum ? '#fff' : 'var(--ink-3)', fontWeight: 600, fontSize: '0.875rem', cursor: s.id <= stepNum ? 'pointer' : 'default' }}>
              {s.id}. {s.title}
            </li>
          ))}
        </ol>
      </div>

      <h1 className="type-page-title font-serif" style={{ marginBottom: '0.5rem' }}>{step.title}</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Krok {stepNum} z 6</p>

      {/* Step 1: O mnie */}
      {stepNum === 1 && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="name" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Imię i nazwisko <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
            <input id="name" type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="input" aria-invalid={!!errors.name} placeholder="Jan Kowalski" />
            {errors.name && <p className="field__err" role="alert">{errors.name}</p>}
          </div>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="country" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Kraj <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
            <select id="country" value={formData.country} onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))} className="input">
              <option value="Polska">Polska</option>
              <option value="Niemcy">Niemcy</option>
              <option value="Wielka Brytania">Wielka Brytania</option>
              <option value="USA">USA</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Języki sesji <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['polski', 'angielski', 'niemiecki', 'francuski', 'espański'].map(lang => (
                <label key={lang} className="check" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: formData.languages.includes(lang) ? 'var(--selected-bg)' : 'var(--surface-sunken)', borderRadius: 'var(--shape-control)', border: `1px solid ${formData.languages.includes(lang) ? 'var(--selected-border)' : 'var(--border-divider)'}`, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.languages.includes(lang)} onChange={e => setFormData(prev => ({ ...prev, languages: e.target.checked ? [...prev.languages, lang] : prev.languages.filter(l => l !== lang) }))} />
                  <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                </label>
              ))}
            </div>
            {errors.languages && <p className="field__err" role="alert">{errors.languages}</p>}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={handlePrev} disabled={stepNum === 1}>Wstecz</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Wysyłanie…' : 'Dalej'}</button>
          </div>
        </form>
      )}

      {/* Step 2: Kompetencje */}
      {stepNum === 2 && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Kategorie <span style={{ color: 'var(--status-danger-fg)' }}>*</span> (1–5)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map(cat => (
                <label key={cat} className="chip" style={{ background: formData.categories.includes(cat) ? 'var(--selected-bg)' : 'var(--surface-panel)', borderColor: formData.categories.includes(cat) ? 'var(--selected-border)' : 'var(--border-divider)', color: formData.categories.includes(cat) ? 'var(--selected-border)' : 'var(--text-default)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.categories.includes(cat)} onChange={e => setFormData(prev => ({ ...prev, categories: e.target.checked ? [...prev.categories, cat] : prev.categories.filter(c => c !== cat) }))} style={{ marginRight: '6px' }} />
                  {cat}
                </label>
              ))}
            </div>
            {errors.categories && <p className="field__err" role="alert">{errors.categories}</p>}
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Tagi (technologie, specjalizacje) <span style={{ color: 'var(--status-danger-fg)' }}>*</span> (3–15)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {['React', 'TypeScript', 'Next.js', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL', 'Kubernetes', 'Java', 'Kotlin', 'Go', 'Rust', 'Vue', 'Svelte', 'Figma', 'UX Research', 'System Design', 'Leadership'].map(tag => (
                <label key={tag} className="chip" style={{ background: formData.tags.includes(tag) ? 'var(--selected-bg)' : 'var(--surface-panel)', borderColor: formData.tags.includes(tag) ? 'var(--selected-border)' : 'var(--border-divider)', color: formData.tags.includes(tag) ? 'var(--selected-border)' : 'var(--text-default)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.tags.includes(tag)} onChange={e => setFormData(prev => ({ ...prev, tags: e.target.checked ? [...prev.tags, tag] : prev.tags.filter(t => t !== tag) }))} style={{ marginRight: '6px' }} />
                  {tag}
                </label>
              ))}
            </div>
            {errors.tags && <p className="field__err" role="alert">{errors.tags}</p>}
          </div>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <div className="field">
              <label htmlFor="yearsExp" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Lata doświadczenia <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
              <input id="yearsExp" type="number" min="1" max="50" value={formData.yearsExp} onChange={e => setFormData(prev => ({ ...prev, yearsExp: parseInt(e.target.value) || 0 }))} className="input" />
              {errors.yearsExp && <p className="field__err" role="alert">{errors.yearsExp}</p>}
            </div>
            <div className="field">
              <label htmlFor="companies" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Firmy (po przecinku) <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
              <input id="companies" type="text" value={formData.companies.join(', ')} onChange={e => setFormData(prev => ({ ...prev, companies: e.target.value.split(',').map(c => c.trim()).filter(Boolean) }))} className="input" placeholder="Allegro, Brainly, Netguru" />
              {errors.companies && <p className="field__err" role="alert">{errors.companies}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={handlePrev}>Wstecz</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Wysyłanie…' : 'Dalej'}</button>
          </div>
        </form>
      )}

      {/* Step 3: Opis i wideo */}
      {stepNum === 3 && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="headline" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Headline (tytuł profilu) <span style={{ color: 'var(--status-danger-fg)' }}>*</span> (20–80 znaków)</label>
            <input id="headline" type="text" value={formData.headline} onChange={e => setFormData(prev => ({ ...prev, headline: e.target.value }))} className="input" maxLength={80} />
            <p className="field__meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span className="text-muted">{formData.headline.length}/80</span>
            </p>
            {errors.headline && <p className="field__err" role="alert">{errors.headline}</p>}
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="bio" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Opis profilu <span style={{ color: 'var(--status-danger-fg)' }}>*</span> (300–2000 znaków)</label>
            <textarea id="bio" value={formData.bio} onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))} className="textarea" rows={8} maxLength={2000} />
            <p className="field__meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span className="text-muted">{formData.bio.length}/2000 (min. 300)</span>
            </p>
            {errors.bio && <p className="field__err" role="alert">{errors.bio}</p>}
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="videoUrl" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Link do wideo (YouTube/Vimeo)</label>
            <input id="videoUrl" type="url" value={formData.videoUrl} onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))} className="input" placeholder="https://youtube.com/watch?v=... lub https://vimeo.com/..." />
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Wideo 30s–3min. Możesz też nagrać później.</p>
            {errors.videoUrl && <p className="field__err" role="alert">{errors.videoUrl}</p>}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={handlePrev}>Wstecz</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Wysyłanie…' : 'Dalej'}</button>
          </div>
        </form>
      )}

      {/* Step 4: Stawka */}
      {stepNum === 4 && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="rate60" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Stawka za 60 min <span style={{ color: 'var(--status-danger-fg)' }}>*</span> (40–1000 zł)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input id="rate60" type="number" min="40" max="1000" step="10" value={formData.rate60} onChange={e => setFormData(prev => ({ ...prev, rate60: parseInt(e.target.value) || 0 }))} className="input" style={{ width: '160px' }} />
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>PLN / 60 min</span>
            </div>
            {errors.rate60 && <p className="field__err" role="alert">{errors.rate60}</p>}
          </div>

          <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--surface-sunken)' }}>
            <h3 className="type-label" style={{ marginBottom: '1rem' }}>Podgląd zarobków (szacunkowy)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--brand-soft)', borderRadius: 'var(--shape-control)', padding: '1rem' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Przychód brutto (4 sesje/tydz × 4 tyg)</div>
                <div className="price" style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.5rem' }}>
                  {formData.rate60 * 1 * 4 * 4} PLN
                </div>
              </div>
              <div style={{ background: 'var(--status-success-bg)', borderRadius: 'var(--shape-control)', padding: '1rem', border: '1px solid var(--status-success-fg)' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem', color: 'var(--status-success-fg)' }}>Twój dochód po prowizji (33%)</div>
                <div className="price" style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.5rem', color: 'var(--status-success-fg)' }}>
                  {Math.round(formData.rate60 * 0.67 * 1 * 4 * 4)} PLN
                </div>
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Prowizja maleje z liczbą przepracowanych godzin: do 20h: 33%, 20–50h: 28%, 50–200h: 20%, powyżej 200h: 18%. Sesja próbna w całości dla platformy.</p>
          </div>

          {errors.rate60 && <p className="field__err" role="alert">{errors.rate60}</p>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={handlePrev}>Wstecz</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Wysyłanie…' : 'Dalej'}</button>
          </div>
        </form>
      )}

      {/* Step 5: Dostępność */}
      {stepNum === 5 && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="type-label" style={{ marginBottom: '1rem' }}>Edytor dostępności tygodniowej</h3>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Kliknij w kratkę, by dodać/usunąć slot. Minimum 3 godziny tygodniowo (3 sloty po 1h).</p>
            
            <div className="avail" style={{ overflowX: 'auto' }}>
              <div className="avail__row avail__head">
                <span style={{ textAlign: 'right', paddingRight: '4px', width: '44px' }}>Godz.</span>
                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map((d, i) => (
                  <span key={d} style={{ textAlign: 'center', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--ink-2)', fontWeight: 600 }}>{d}</span>
                ))}
              </div>
              {Array.from({ length: 12 }, (_, h) => 8 + h).map(hour => (
                <div key={hour} className="avail__row">
                  <span className="avail__h">{hour}:00</span>
                  {[0,1,2,3,4,5,6].map(day => (
                    <button
                      key={`${day}-${hour}`}
                      className={`avail__cell ${formData.availability.has(`${day}-${hour}`) ? 'is-on' : ''}`}
                      onClick={() => setFormData(prev => {
                        const newAvail = new Set(prev.availability);
                        const key = `${day}-${hour}`;
                        if (newAvail.has(key)) newAvail.delete(key);
                        else newAvail.add(key);
                        return { ...prev, availability: newAvail };
                      })}
                      style={{ background: formData.availability.has(`${day}-${hour}`) ? 'var(--brand-soft)' : '#fbfaf6', borderColor: formData.availability.has(`${day}-${hour}`) ? '#bcd8cd' : 'var(--line-2)' }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="legend" style={{ marginTop: '1rem' }}>
              <span className="lg lg--free" />
              <span>Wolny</span>
              <span className="lg lg--off" style={{ marginLeft: '1rem' }} />
              <span>Niedostępny</span>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Minimalne wyprzedzenie rezerwacji</label>
            <select className="input" style={{ maxWidth: '200px' }}>
              <option value="2">2 godziny</option>
              <option value="6" selected>6 godzin</option>
              <option value="12">12 godzin</option>
              <option value="24">24 godziny</option>
              <option value="48">48 godzin</option>
            </select>
          </div>

          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Bufor między sesjami</label>
            <select className="input" style={{ maxWidth: '200px' }}>
              <option value="0" selected>Brak</option>
              <option value="5">5 minut</option>
              <option value="10">10 minut</option>
              <option value="15">15 minut</option>
              <option value="30">30 minut</option>
            </select>
          </div>

          {errors.availability && <p className="field__err" role="alert">{errors.availability}</p>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={handlePrev}>Wstecz</button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Wysyłanie…' : 'Dalej'}</button>
          </div>
        </form>
      )}

      {/* Step 6: Weryfikacja */}
      {stepNum === 6 && (
        <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
          <h2 className="type-section-title font-serif" style={{ marginBottom: '0.5rem' }}>Weryfikacja tożsamości i wypłat</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Wymagane przez regulaminy KYC, DAC7 i AML. Dane są szyfrowane.</p>

          <div className="verify-list">
            <div className="verify-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={!!formData.linkedin} disabled />
                <span><strong>LinkedIn</strong></span>
              </div>
              <div className="field" style={{ marginTop: '8px' }}>
                <label htmlFor="linkedin" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Profil LinkedIn <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                <input id="linkedin" type="url" value={formData.linkedin} onChange={e => setFormData(prev => ({ ...prev, linkedin: e.target.value }))} className="input" placeholder="https://linkedin.com/in/twojprofil" />
                {errors.linkedin && <p className="field__err" role="alert">{errors.linkedin}</p>}
              </div>
            </div>

            <div className="verify-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={!!formData.kycDoc} disabled />
                <span><strong>Dokument tożsamości</strong></span>
              </div>
              <div className="field" style={{ marginTop: '8px' }}>
                <label className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Dowód osobisty / paszport <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                <div className="upload" style={{ cursor: 'pointer' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--ink-2)', marginBottom: '8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p>{formData.kycDoc ? 'Wybrano plik (symulacja)' : 'Przeciągnij lub kliknij, by wybrać plik (JPG/PNG/PDF, max 10 MB)'}</p>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>W produkcji: upload przez presigned URL do S3/R2</p>
                </div>
                {errors.kycDoc && <p className="field__err" role="alert">{errors.kycDoc}</p>}
              </div>
            </div>

            <div className="verify-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={!!formData.iban && !!formData.tin} disabled />
                <span><strong>Dane do wypłat (DAC7)</strong></span>
              </div>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div className="field">
                  <label htmlFor="iban" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>IBAN <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                  <input id="iban" type="text" value={formData.iban} onChange={e => setFormData(prev => ({ ...prev, iban: e.target.value.toUpperCase().replace(/\s/g, '') }))} className="input" placeholder="PL60 1020 0000 0000 0000 0000 0000" />
                  {errors.iban && <p className="field__err" role="alert">{errors.iban}</p>}
                </div>
                <div className="field">
                  <label htmlFor="tin" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>NIP / TIN <span style={{ color: 'var(--status-danger-fg)' }}>*</span></label>
                  <input id="tin" type="text" value={formData.tin} onChange={e => setFormData(prev => ({ ...prev, tin: e.target.value }))} className="input" placeholder="123-456-78-90" />
                  {errors.tin && <p className="field__err" role="alert">{errors.tin}</p>}
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '8px' }}>Data urodzenia i kraj zamieszkania pobieramy z dokumentu tożsamości.</p>
            </div>
          </div>

          {errors.iban && <p className="field__err" role="alert">{errors.iban}</p>}
          {errors.tin && <p className="field__err" role="alert">{errors.tin}</p>}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn--ghost" onClick={handlePrev}>Wstecz</button>
            <button type="submit" className="btn btn--primary btn--lg" disabled={submitting} style={{ minHeight: '52px', fontSize: '1rem' }}>
              {submitting ? 'Wysyłanie wniosku…' : 'Wyślij wniosek do weryfikacji'}
            </button>
          </div>

          <p className="text-muted" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
            Po wysłaniu wniosek trafi do zespołu zaufania. Weryfikacja do 2 dni roboczych.
          </p>
        </form>
      )}
    </div>
  );
}
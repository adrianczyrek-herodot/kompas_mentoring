import React, { useState } from 'react';
import { useParams, navigate } from '../utils/router';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../components/ToastContainer';
import { ROLE_LABELS } from '../utils/types';

export function P4Auth({ params }: { params: { mode?: string } }) {
  const { role, setRole, loginAsStudent, returnTo, loggedIn } = useDemo();
  const { addToast } = useToast();
  const [mode, setMode] = useState<'logowanie' | 'rejestracja'>(params?.mode === 'rejestracja' ? 'rejestracja' : 'logowanie');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'uczyc' | 'mentorowac'>('uczyc');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Wpisz poprawny adres e-mail';
    }
    if (mode === 'logowanie') {
      if (!password) newErrors.password = 'Wpisz hasło';
    } else {
      if (!name || name.length < 2) newErrors.name = 'Imię musi mieć co najmniej 2 znaki';
      if (!password || password.length < 10) newErrors.password = 'Hasło musi mieć min. 10 znaków';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Hasła nie są identyczne';
      if (!acceptTerms) newErrors.terms = 'Musisz zaakceptować regulamin';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check for "occupied" email
    if (email === 'zajety@kompas.pl') {
      setErrors({ email: 'Ten e-mail jest już zarejestrowany. Zaloguj się lub zresetuj hasło.' });
      setIsSubmitting(false);
      return;
    }
    
    // Force error simulation
    const { forceNextError } = useDemo.getState?.() || { forceNextError: false };
    if (forceNextError) {
      setErrors({ form: 'Symulowany błąd serwera. Spróbuj ponownie.' });
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
    
    if (mode === 'logowanie') {
      loginAsStudent();
      addToast('Zalogowano pomyślnie!', 'success');
    } else {
      loginAsStudent();
      addToast('Konto utworzone! Zalogowano automatycznie.', 'success');
    }
    
    // Redirect
    const target = returnTo || '#/sesje';
    navigate(target);
  };

  const handleSocialLogin = (provider: 'google' | 'linkedin') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      loginAsStudent();
      addToast(`Zalogowano przez ${provider === 'google' ? 'Google' : 'LinkedIn'} (symulacja)`, 'success');
      navigate(returnTo || '#/sesje');
    }, 800);
  };

  const passwordStrength = React.useMemo(() => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: score, label: 'Słabe', color: 'var(--status-danger-fg)' };
    if (score <= 3) return { level: score, label: 'Średnie', color: 'var(--status-warning-fg)' };
    if (score <= 4) return { level: score, label: 'Dobre', color: 'var(--action-primary)' };
    return { level: score, label: 'Bardzo dobre', color: 'var(--status-success-fg)' };
  }, [password]);

  return (
    <div className="narrow" style={{ maxWidth: '480px' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <a href="#/" className="logo" style={{ fontSize: '1.5rem', justifyContent: 'center' }}>
          <span className="logo__mark" style={{ color: 'var(--action-primary)' }}>✦</span>kompas
        </a>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          {mode === 'logowanie' ? 'Witaj z powrotem!' : 'Utwórz konto, by zacząć'}
        </p>
      </div>

      <div className="tabs" role="tablist" aria-label="Tryb uwierzytelniania">
        <button
          role="tab"
          aria-selected={mode === 'logowanie'}
          className={`tab ${mode === 'logowanie' ? 'is-active' : ''}`}
          onClick={() => { setMode('logowanie'); setErrors({}); }}
        >
          Logowanie
        </button>
        <button
          role="tab"
          aria-selected={mode === 'rejestracja'}
          className={`tab ${mode === 'rejestracja' ? 'is-active' : ''}`}
          onClick={() => { setMode('rejestracja'); setErrors({}); }}
        >
          Rejestracja
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {mode === 'rejestracja' && (
          <>
            <div className="field">
              <label htmlFor="name" className="field__label">Imię</label>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                placeholder="Jan"
              />
              {errors.name && <p id="name-error" className="field__err" role="alert">{errors.name}</p>}
            </div>

            <fieldset className="field">
              <legend className="field__label">Chcę…</legend>
              <div className="segmented" role="radiogroup" aria-label="Rola">
                <label>
                  <input type="radio" name="role" value="uczyc" checked={selectedRole === 'uczyc'} onChange={e => setSelectedRole('uczyc')} />
                  <span>🎓 Uczę się</span>
                </label>
                <label>
                  <input type="radio" name="role" value="mentorowac" checked={selectedRole === 'mentorowac'} onChange={e => setSelectedRole('mentorowac')} />
                  <span>🎯 Mentoruję</span>
                </label>
              </div>
            </fieldset>
          </>
        )}

        <div className="field">
          <label htmlFor="email" className="field__label">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete={mode === 'logowanie' ? 'email' : 'email'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="jan@kowalski.pl"
          />
          {errors.email && <p id="email-error" className="field__err" role="alert">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="password" className="field__label">Hasło</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'logowanie' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              placeholder="Min. 10 znaków"
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('password') as HTMLInputElement;
                if (input) input.type = input.type === 'password' ? 'text' : 'password';
              }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
              aria-label="Pokaż/ukryj hasło"
            >
              👁️
            </button>
          </div>
          {errors.password && <p id="password-error" className="field__err" role="alert">{errors.password}</p>}
          <div id="password-hint" className="field__meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '20px' }}>
            <div style={{ flex: 1, height: '4px', background: 'var(--border-divider)', borderRadius: '2px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${(passwordStrength.level / 5) * 100}%`, 
                  height: '100%', 
                  background: passwordStrength.color,
                  transition: 'width 0.3s, background 0.3s',
                }} 
              />
            </div>
            <span className="type-meta" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
          </div>
        </div>

        {mode === 'rejestracja' && (
          <div className="field">
            <label htmlFor="confirmPassword" className="field__label">Powtórz hasło</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              placeholder="Powtórz hasło"
            />
            {errors.confirmPassword && <p id="confirm-error" className="field__err" role="alert">{errors.confirmPassword}</p>}
          </div>
        )}

        {errors.form && (
          <div className="alert alert--danger" role="alert" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span>⚠️</span>
            <span>{errors.form}</span>
          </div>
        )}

        {mode === 'rejestracja' && (
          <>
            <fieldset className="field">
              <legend className="field__label">Zgody</legend>
              <div className="check">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                />
                <label htmlFor="terms" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Akceptuję <a href="#" style={{ color: 'var(--text-link)' }}>Regulamin</a> (wymagane)
                </label>
              </div>
              <div className="check">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={e => setAcceptMarketing(e.target.checked)}
                />
                <label htmlFor="marketing" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Chcę otrzymywać newslettera i oferty marketingowe (opcjonalne)
                </label>
              </div>
              {errors.terms && <p className="field__err" role="alert">{errors.terms}</p>}
            </fieldset>
          </>
        )}

        <button 
          type="submit" 
          className="btn btn--primary btn--block" 
          disabled={isSubmitting}
          style={{ marginTop: '0.5rem', minHeight: '48px' }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" style={{ width: '18px', height: '18px' }} aria-hidden="true" />
              {mode === 'logowanie' ? 'Logowanie…' : 'Tworzenie konta…'}
            </>
          ) : (
            mode === 'logowanie' ? 'Zaloguj się' : 'Załóż konto'
          )}
        </button>
      </form>

      <div className="divider" style={{ margin: '1.5rem 0' }}>
        <span>lub kontynuuj z</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          className="btn btn--social"
          onClick={() => handleSocialLogin('google')}
          disabled={isSubmitting}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button
          type="button"
          className="btn btn--social"
          onClick={() => handleSocialLogin('linkedin')}
          disabled={isSubmitting}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          LinkedIn
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {mode === 'logowanie' ? (
          <>
            Nie masz konta? <a href="#/rejestracja" onClick={e => { e.preventDefault(); navigate('#/rejestracja'); }} className="link">Załóż je</a>
            {' · '}
            <a href="#" className="link">Nie pamiętasz hasła?</a>
          </>
        ) : (
          <>
            Masz konto? <a href="#/logowanie" onClick={e => { e.preventDefault(); navigate('#/logowanie'); }} className="link">Zaloguj się</a>
          </>
        )}
      </p>
    </div>
  );
}
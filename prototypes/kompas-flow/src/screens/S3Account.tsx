import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { useToast } from '../components/ToastContainer';
import { navigate } from '../utils/router';
import { TIMEZONES } from '../utils/constants';

export function S3Account() {
  const { role, currentStudent, logout, toggleDarkMode, darkMode } = useDemo();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profil' | 'bezpieczenstwo' | 'powiadomienia' | 'platnosci' | 'zgody' | 'dane'>('profil');
  const [name, setName] = useState(currentStudent?.name || '');
  const [email, setEmail] = useState('adrian@kowalski.pl');
  const [timezone, setTimezone] = useState('Europe/Warsaw');
  const [currency, setCurrency] = useState('PLN');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const tabs = [
    { id: 'profil', label: 'Profil', icon: '👤' },
    { id: 'bezpieczenstwo', label: 'Bezpieczeństwo', icon: '🔒' },
    { id: 'powiadomienia', label: 'Powiadomienia', icon: '🔔' },
    { id: 'platnosci', label: 'Płatności', icon: '💳' },
    { id: 'zgody', label: 'Zgody', icon: '📋' },
    { id: 'dane', label: 'Dane osobowe', icon: '📄' },
  ];

  const handleSaveProfile = () => {
    addToast('Profil zaktualizowany (symulacja)', 'success');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'USUŃ') {
      addToast('Wpisz "USUŃ" aby potwierdzić', 'error');
      return;
    }
    logout();
    addToast('Konto usunięte (symulacja)', 'success');
    navigate('#/');
  };

  return (
    <div className="narrow" style={{ maxWidth: '640px' }}>
      <div className="page-head" style={{ marginBottom: '1rem' }}>
        <h1 className="type-page-title font-serif">Konto i ustawienia</h1>
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Zakładki ustawień" style={{ overflow: 'auto', marginBottom: '1.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profil */}
      {activeTab === 'profil' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Dane profilowe</h2>
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="name" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Imię i nazwisko</label>
              <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Jan Kowalski" />
            </div>
            <div className="field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>E-mail</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" disabled />
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>Zmiana e-maila wymaga weryfikacji (symulacja)</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="field" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
                <label htmlFor="timezone" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Strefa czasowa</label>
                <select id="timezone" value={timezone} onChange={e => setTimezone(e.target.value)} className="input">
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="field" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                <label htmlFor="currency" className="type-label" style={{ display: 'block', marginBottom: '4px' }}>Waluta</label>
                <select id="currency" value={currency} onChange={e => setCurrency(e.target.value)} className="input">
                  <option value="PLN">PLN</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <button className="btn btn--primary" onClick={handleSaveProfile} style={{ marginTop: '1rem' }}>Zapisz zmiany</button>
          </div>

          <div className="card" style={{ background: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-fg)' }}>
            <h3 className="type-label" style={{ marginBottom: '0.5rem', color: 'var(--status-warning-fg)' }}>Rola: {role === 'student' ? 'Uczeń' : role === 'mentor' ? 'Mentor' : 'Admin'}</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
              {role === 'student' && (
                <>
                  Jesteś uczniem. Możesz przełączyć się na rolę mentora, aby prowadzić sesje.
                  <button className="btn btn--ghost btn--s" style={{ marginLeft: '8px' }} onClick={() => { logout(); navigate('#/mentor/onboarding/1'); }}>Przełącz na mentora</button>
                </>
              )}
              {role === 'mentor' && (
                <>
                  Jesteś mentorem. Możesz przełączyć się na rolę ucznia.
                  <button className="btn btn--ghost btn--s" style={{ marginLeft: '8px' }} onClick={() => { logout(); navigate('#/sesje'); }}>Przełącz na ucznia</button>
                </>
              )}
            </p>
          </div>
        </section>
      )}

      {/* Bezpieczeństwo */}
      {activeTab === 'bezpieczenstwo' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Hasło i dostęp</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong>Zmień hasło</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Twoje obecne hasło jest bezpieczne. Ostatnia zmiana: 2026-09-15.</p>
                <button className="btn btn--secondary" style={{ marginTop: '8px' }}>Zmień hasło (symulacja)</button>
              </div>
              <div>
                <strong>Weryfikacja dwuskładnikowa (2FA)</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Wyłączona. Zalecamy włączenie dla większego bezpieczeństwa.</p>
                <button className="btn btn--primary" style={{ marginTop: '8px' }}>Włącz 2FA (symulacja)</button>
              </div>
              <div>
                <strong>Aktywne sesje</strong>
                <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>1 aktywna sesja (to urządzenie). Ostatnia aktywność: teraz.</p>
                <button className="btn btn--ghost" style={{ marginTop: '8px' }}>Wyloguj wszystkie inne (symulacja)</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Powiadomienia */}
      {activeTab === 'powiadomienia' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Preferencje powiadomień</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={true} />
                <div style={{ flex: 1 }}>
                  <strong>E-mail: przypomnienia o sesjach</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>24h i 1h przed sesją</p>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={true} />
                <div style={{ flex: 1 }}>
                  <strong>E-mail: nowe wiadomości</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Gdy mentor napisze do Ciebie</p>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={false} />
                <div style={{ flex: 1 }}>
                  <strong>E-mail: odnowienie planu</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Przed kolejnym obciążeniem</p>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={true} />
                <div style={{ flex: 1 }}>
                  <strong>Push: sesja zaczyna się za 5 min</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Tylko w aplikacji mobilnej</p>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={false} />
                <div style={{ flex: 1 }}>
                  <strong>Push: nowe wiadomości</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Tylko w aplikacji mobilnej</p>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={false} />
                <div style={{ flex: 1 }}>
                  <strong>Marketing: newsletter i oferty</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Maksymalnie 1/tydzień, łatwa rezygnacja</p>
                </div>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Płatności */}
      {activeTab === 'platnosci' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Metody płatności
              <button className="btn btn--ghost btn--s">Dodaj kartę (symulacja)</button>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <span style={{ fontSize: '1.5rem' }}>💳</span>
                <div style={{ flex: 1 }}>
                  <strong>Visa •••• 4242</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Wygasa 12/2028 • Domyślna</p>
                </div>
                <button className="btn btn--ghost btn--s">Usuń (symulacja)</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <span style={{ fontSize: '1.5rem' }}>📱</span>
                <div style={{ flex: 1 }}>
                  <strong>BLIK</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Skonfigurowany</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Historia płatności</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Opis</th>
                    <th style={{ textAlign: 'right' }}>Kwota</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>2026-10-06</td><td>Odnowienie planu (Kasia Nowicka)</td><td style={{ textAlign: 'right' }}>720 PLN</td><td style={{ textAlign: 'right' }}><span className="badge badge--success">Opłacone</span></td></tr>
                  <tr><td>2026-09-08</td><td>Sesja próbna (Kasia Nowicka)</td><td style={{ textAlign: 'right' }}>49 PLN</td><td style={{ textAlign: 'right' }}><span className="badge badge--success">Opłacone</span></td></tr>
                  <tr><td>2026-09-01</td><td>Odnowienie planu (Kasia Nowicka)</td><td style={{ textAlign: 'right' }}>720 PLN</td><td style={{ textAlign: 'right' }}><span className="badge badge--success">Opłacone</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Zgody */}
      {activeTab === 'zgody' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem' }}>Zgody prawne</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label className="check" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={true} disabled />
                <div style={{ flex: 1 }}>
                  <strong>Regulamin platformy (wymagane)</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Zaakceptowano: 2026-09-01. Wersja 2.1</p>
                  <a href="#" className="link" style={{ fontSize: '0.875rem' }}>Przeczytaj regulamin</a>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={true} />
                <div style={{ flex: 1 }}>
                  <strong>Polityka prywatności (wymagane)</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Zaakceptowano: 2026-09-01. Wersja 1.3</p>
                  <a href="#" className="link" style={{ fontSize: '0.875rem' }}>Przeczytaj politykę</a>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={false} />
                <div style={{ flex: 1 }}>
                  <strong>Marketing: newsletter i oferty (opcjonalne)</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Możesz wycofać zgodę w dowolnym momencie.</p>
                </div>
              </label>
              <label className="check" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '1rem', background: 'var(--surface-sunken)', borderRadius: 'var(--shape-control)' }}>
                <input type="checkbox" checked={true} />
                <div style={{ flex: 1 }}>
                  <strong>Przetwarzanie danych do celów analitycznych (opcjonalne)</strong>
                  <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>Anonimowe dane używane do ulepszania platformy.</p>
                </div>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Dane osobowe */}
      {activeTab === 'dane' && (
        <section>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Dane osobowe (RODO)
              <button className="btn btn--primary btn--s">Eksportuj wszystkie dane (symulacja)</button>
            </h2>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Masz prawo żądać kopii swoich danych, ich sprostowania lub usunięcia (prawo do bycia zapomnianym).</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn--primary" onClick={() => addToast('Przygotowywanie eksportu... (symulacja)', 'success')}>Pobierz kopię danych (JSON)</button>
              <button className="btn btn--secondary">Sprostuj dane (symulacja)</button>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--status-danger-bg)', borderColor: 'var(--status-danger-fg)', marginBottom: '1.5rem' }}>
            <h2 className="type-section-title font-serif" style={{ marginBottom: '1rem', color: 'var(--status-danger-fg)' }}>Usuń konto</h2>
            <p style={{ marginBottom: '1rem', lineHeight: 1.6, color: 'var(--status-danger-fg)' }}>
              Usunięcie konta jest nieodwracalne. Zostaną usunięte:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2, color: 'var(--status-danger-fg)' }}>
              <li>Wszystkie dane osobowe i profil</li>
              <li>Historia sesji, wiadomości i notatki</li>
              <li>Saldo sesji i aktywne plany</li>
              <li>Metody płatności</li>
            </ul>
            <p style={{ margin: '1rem 0 0', color: 'var(--status-danger-fg)' }}>
              Wpisz <strong>USUŃ</strong> aby potwierdzić:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              className="input"
              style={{ marginTop: '0.5rem', maxWidth: '200px', textTransform: 'uppercase' }}
              placeholder="USUŃ"
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(''); }}>Anuluj</button>
              <button className="btn btn--danger" onClick={handleDeleteAccount} disabled={deleteConfirm !== 'USUŃ'}>Usuń konto na zawsze</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
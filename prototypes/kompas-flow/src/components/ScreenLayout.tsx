import { useDemo } from '../context/DemoContext';
import { ROLE_NAV } from '../utils/types';
import { PROTO_BAR_HEIGHT } from '../utils/constants';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastContainer } from './ToastContainer';

interface ScreenLayoutProps {
  screenId: string;
  screenTitle: string;
  viewState: 'success' | 'loading' | 'empty' | 'error';
  isLoading?: boolean;
  children: React.ReactNode;
  bare?: boolean; // For full-screen screens like room
}

export function ScreenLayout({ screenId, screenTitle, viewState, isLoading, children, bare }: ScreenLayoutProps) {
  const { role } = useDemo();
  const nav = ROLE_NAV[role] || [];
  // screenId and screenTitle are used for context but not directly in this component
  
  // Show loading skeleton
  if (isLoading && viewState !== 'error') {
    return (
      <div className="skeleton-wrap" style={{ padding: 'var(--space-section) var(--space-group)', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <div className="sk sk--hero" style={{ height: '200px' }} aria-hidden="true" />
        <div className="sk sk--card" aria-hidden="true" />
        <div className="sk sk--card" aria-hidden="true" />
        <div className="sk sk--card" aria-hidden="true" />
      </div>
    );
  }

  // Show error state
  if (viewState === 'error') {
    return (
      <main className="main" style={{ paddingTop: bare ? 0 : PROTO_BAR_HEIGHT }}>
        <div className="screen-container">
          <div className="error-state screen-enter">
            <div className="error-state__icon">⚠️</div>
            <h2 className="error-state__title">Wystąpił błąd</h2>
            <p className="error-state__text">Nie udało się wczytać tego ekranu. Spróbuj ponownie.</p>
            <button className="btn btn--primary" onClick={() => window.location.reload()}>
              Ponów
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Show empty state
  if (viewState === 'empty') {
    return (
      <main className="main" style={{ paddingTop: bare ? 0 : PROTO_BAR_HEIGHT }}>
        <div className="screen-container">
          <div className="empty-state screen-enter">
            <div className="empty-state__icon">📭</div>
            <h2 className="empty-state__title">Brak danych</h2>
            <p className="empty-state__text">Ten ekran nie ma jeszcze danych do wyświetlenia.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {!bare && <Header role={role} nav={nav} screenTitle={screenTitle} />}
      {!bare && <BottomNav role={role} nav={nav} />}
      <main 
        className={`main ${role !== 'guest' ? 'has-bottomnav' : ''}`}
        style={{ paddingTop: bare ? 0 : PROTO_BAR_HEIGHT, paddingBottom: bare ? 0 : 96 }}
      >
        <div className="screen-container">
          <div className="screen-enter">
            {children}
          </div>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}
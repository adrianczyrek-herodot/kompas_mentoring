import { useEffect, useState, Suspense, lazy } from 'react';
import { DemoProvider, useDemo } from './context/DemoContext';
import { ReviewProvider, useReview } from './context/ReviewContext';
import { parseHash, matchRoute, canAccess, getRedirectPath, getCurrentScreenId } from './utils/router';
import { PROTO_BAR_HEIGHT, REVIEW_BAR_HEIGHT } from './utils/constants';
import { ToastProvider } from './components/ToastContainer';
import './styles/index.css';

// Lazy load screen components
const P1Home = lazy(() => import('./screens/P1Home').then(m => ({ default: m.P1Home })));
const P2Search = lazy(() => import('./screens/P2Search').then(m => ({ default: m.P2Search })));
const P3Profile = lazy(() => import('./screens/P3Profile').then(m => ({ default: m.P3Profile })));
const P4Auth = lazy(() => import('./screens/P4Auth').then(m => ({ default: m.P4Auth })));
const U1PickSlot = lazy(() => import('./screens/U1PickSlot').then(m => ({ default: m.U1PickSlot })));
const U2Checkout = lazy(() => import('./screens/U2Checkout').then(m => ({ default: m.U2Checkout })));
const U3Confirmation = lazy(() => import('./screens/U3Confirmation').then(m => ({ default: m.U3Confirmation })));
const U4Sessions = lazy(() => import('./screens/U4Sessions').then(m => ({ default: m.U4Sessions })));
const U5SessionDetail = lazy(() => import('./screens/U5SessionDetail').then(m => ({ default: m.U5SessionDetail })));
const U6Room = lazy(() => import('./screens/U6Room').then(m => ({ default: m.U6Room })));
const U7Review = lazy(() => import('./screens/U7Review').then(m => ({ default: m.U7Review })));
const U8Plans = lazy(() => import('./screens/U8Plans').then(m => ({ default: m.U8Plans })));
const U9Progress = lazy(() => import('./screens/U9Progress').then(m => ({ default: m.U9Progress })));
const S1Messages = lazy(() => import('./screens/S1Messages').then(m => ({ default: m.S1Messages })));
const S2Notifications = lazy(() => import('./screens/S2Notifications').then(m => ({ default: m.S2Notifications })));
const S3Account = lazy(() => import('./screens/S3Account').then(m => ({ default: m.S3Account })));
const M1Onboarding = lazy(() => import('./screens/M1Onboarding').then(m => ({ default: m.M1Onboarding })));
const M2Dashboard = lazy(() => import('./screens/M2Dashboard').then(m => ({ default: m.M2Dashboard })));
const M3Calendar = lazy(() => import('./screens/M3Calendar').then(m => ({ default: m.M3Calendar })));
const M4Students = lazy(() => import('./screens/M4Students').then(m => ({ default: m.M4Students })));
const M5Earnings = lazy(() => import('./screens/M5Earnings').then(m => ({ default: m.M5Earnings })));
const A1Verification = lazy(() => import('./screens/A1Verification').then(m => ({ default: m.A1Verification })));
const A2Disputes = lazy(() => import('./screens/A2Disputes').then(m => ({ default: m.A2Disputes })));

import { ProtoBar } from './components/ProtoBar';
import { ReviewBar } from './components/ReviewBar';
import { ReviewSidebar } from './components/ReviewSidebar';
import { ScreenLayout } from './components/ScreenLayout';
import { LoadingFallback } from './components/LoadingFallback';

function ScreenRenderer() {
  const { role, darkMode, setActiveScreen } = useDemo();
  const { sidebarOpen } = useReview();
  const [currentPath, setCurrentPath] = useState(window.location.hash);
  
  useEffect(() => {
    const handler = () => {
      const newPath = window.location.hash;
      setCurrentPath(newPath);
      const screenId = getCurrentScreenId();
      if (screenId) setActiveScreen(screenId);
    };
    window.addEventListener('hashchange', handler);
    handler(); // Initial
    return () => window.removeEventListener('hashchange', handler);
  }, [setActiveScreen]);

  const { path, query } = parseHash();
  const match = matchRoute(path);
  const screen = match?.screen;
  const params = match?.params ?? {};
  const forcedState = query.get('state') as 'success' | 'loading' | 'empty' | 'error' | null;

  // Check access
  const accessDenied = screen && !canAccess(screen, role);
  const redirectPath = screen && accessDenied ? getRedirectPath(screen, role) : null;

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show loading state on navigation
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!forcedState) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentPath, forcedState]);

  const screenComponents: Record<string, React.ComponentType<any>> = {
    P1: P1Home, P2: P2Search, P3: P3Profile, P4: P4Auth,
    U1: U1PickSlot, U2: U2Checkout, U3: U3Confirmation, U4: U4Sessions,
    U5: U5SessionDetail, U6: U6Room, U7: U7Review, U8: U8Plans, U9: U9Progress,
    S1: S1Messages, S2: S2Notifications, S3: S3Account,
    M1: M1Onboarding, M2: M2Dashboard, M3: M3Calendar, M4: M4Students, M5: M5Earnings,
    A1: A1Verification, A2: A2Disputes,
  };

  const ScreenComponent = screen ? screenComponents[screen.id] : null;

  return (
    <div className="app" style={{ minHeight: '100vh' }}>
      <ProtoBar />
      
      <div 
        className={`main-content ${sidebarOpen ? 'main-content--with-sidebar' : ''}`}
        style={{ 
          marginTop: PROTO_BAR_HEIGHT, 
          marginBottom: REVIEW_BAR_HEIGHT,
          transition: 'padding-right 0.2s ease',
          paddingRight: sidebarOpen ? 360 : 0,
        }}
      >
        {redirectPath && !window.location.hash.includes('logowanie') && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Ten ekran wymaga innej roli. Przekierowuję...</p>
            <script dangerouslySetInnerHTML={{ __html: `setTimeout(() => { window.location.href = "${redirectPath}"; }, 1000);` }} />
          </div>
        )}
        
        {screen && !accessDenied && (
          <Suspense fallback={<LoadingFallback />}>
            <ScreenLayout 
              screenId={screen.id}
              screenTitle={screen.title}
              viewState={forcedState || 'success'}
              isLoading={isLoading}
            >
              {ScreenComponent ? (
                <ScreenComponent {...params} />
              ) : (
                <div className="screen-enter">
                  <h1 className="type-page-title font-serif">{screen.title}</h1>
                  <p className="text-muted" style={{ marginTop: '1rem' }}>Ekran w budowie</p>
                </div>
              )}
            </ScreenLayout>
          </Suspense>
        )}
        
        {!screen && !redirectPath && (
          <ScreenLayout screenId="404" screenTitle="Nie znaleziono" viewState="error">
            <div className="screen-enter empty-state">
              <div className="empty-state__icon">🔍</div>
              <h2 className="empty-state__title">Strona nie istnieje</h2>
              <p className="empty-state__text">Nie ma takiej strony w prototypie.</p>
              <a href="#/" className="btn btn--primary" style={{ marginTop: '1rem' }}>Wróć na stronę główną</a>
            </div>
          </ScreenLayout>
        )}
      </div>

      <ReviewBar />
      <ReviewSidebar />
    </div>
  );
}

function App() {
  return (
    <DemoProvider>
      <ReviewProvider>
        <ToastProvider>
          <ScreenRenderer />
        </ToastProvider>
      </ReviewProvider>
    </DemoProvider>
  );
}

export default App;
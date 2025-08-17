import {StrictMode, Suspense, lazy} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css';
import './scss/core/index.scss'; // our scss entry
import './scss/core/bulma.sass';
// Import cleanup manager to prevent memory leaks
import './libs/cleanup'

// Lazy load components for better code splitting
const Main = lazy(() => import('./components/Main').then(module => ({ default: module.Main })));
const TermsOfServicePage = lazy(() => import('./components/TermsOfService'));
const PasswordReset = lazy(() => import('./components/PasswordReset'));

// Register service worker (if using vite-plugin-pwa)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
}

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="main-load">
    <div className="container main-loadingcard">
      <div className="main-vcenter">
        <div className="main-center">
          <center className="loading-txt">
            Loading... <br />
            <i className="fa fa-spin fa-2x fa-circle-o-notch loadingscreenwheel" />
          </center>
        </div>
      </div>
    </div>
  </div>
);

// Simple router component with lazy loading
const AppRouter = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode');
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {path === '/terms-of-service' ? (
        <TermsOfServicePage />
      ) : mode === 'resetPassword' ? (
        <PasswordReset />
      ) : (
        <div id="app">
          <Main />
        </div>
      )}
    </Suspense>
  );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRouter />
    </StrictMode>,
)
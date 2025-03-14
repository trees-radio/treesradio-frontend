import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css';
import './scss/core/index.scss'; // our scss entry
import './scss/core/bulma.sass';
import {Main} from './components/Main'
import TermsOfServicePage from './components/TermsOfService'

// Register service worker (if using vite-plugin-pwa)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
    })
}

// Simple router component
const AppRouter = () => {
  const path = window.location.pathname;
  
  // Return the Terms page if on that route
  if (path === '/terms-of-service') {
    return <TermsOfServicePage />;
  }
  
  // Otherwise return the main app
  return (
    <div id="app">
      <Main />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppRouter />
    </StrictMode>,
)
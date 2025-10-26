import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ProductionApp from './App-production';
import ErrorBoundary from './components/ErrorBoundary';

console.log('🔧 TutLabs bundle loaded', {
  PROD: import.meta.env.PROD,
  VITE_SUPABASE_URL: Boolean(import.meta.env.VITE_SUPABASE_URL),
  VITE_SUPABASE_ANON_KEY: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
});

// Global error handlers to avoid silent blank screens
window.addEventListener('error', (ev) => {
  console.error('Global error:', (ev as ErrorEvent).error || (ev as ErrorEvent).message, ev);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', (ev as PromiseRejectionEvent).reason);
});

// Choose the safest app to render:
// - In development: render App
// - In production: if VITE_SUPABASE_* are present render App, otherwise render ProductionApp
const selectApp = () => {
  if (!import.meta.env.PROD) return App;
  const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  return hasSupabase ? App : ProductionApp;
};

const SelectedApp = selectApp();

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('No #root element found in DOM');
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <SelectedApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
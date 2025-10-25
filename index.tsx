import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/errors/ErrorBoundary';
// FIX: Import global type definitions. This single import at the application's entry point
// makes global types, such as for 'ion-icon' and `import.meta.env`, available project-wide,
// removing the need for redundant imports in individual components.
import './types';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('🔧 Debug: React app starting to mount...');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('🔧 Debug: React app mounted successfully');

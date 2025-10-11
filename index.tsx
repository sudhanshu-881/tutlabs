import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// FIX: Importing 'types.ts' here ensures that global type declarations, such as for 'ion-icon',
// are loaded at the application's entry point and are available throughout the entire component tree.
import './types';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
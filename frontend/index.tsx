import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Changed import to point to the correct file path.
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
// FIX: Changed import to point to the correct file path.
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
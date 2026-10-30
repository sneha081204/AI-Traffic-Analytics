import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<App />);
  }
} catch (err) {
  console.error('Fatal initialization error:', err);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:#fff;font-family:sans-serif;text-align:center;padding:2rem;">
        <div>
          <h2 style="color:#ef4444;margin-bottom:1rem;">Application Startup Notice</h2>
          <p style="color:#94a3b8;margin-bottom:1.5rem;">${err.message || 'Error initializing application'}</p>
          <a href="/login" style="background:#2563eb;color:#fff;padding:0.6rem 1.2rem;border-radius:6px;text-decoration:none;font-weight:bold;">Go to Login</a>
        </div>
      </div>
    `;
  }
}

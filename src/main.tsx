import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeMonitoring } from './lib/monitoring';
import { initializePerformanceMonitoring } from './lib/performance';
import { logger } from './lib/logger';

initializeMonitoring();
initializePerformanceMonitoring();

logger.info('Application starting', {
  version: import.meta.env.VITE_SENTRY_RELEASE,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise,
    performance: getPerformanceMetrics()
  });
});

window.addEventListener('error', (event) => {
  logger.error('Unhandled Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    performance: getPerformanceMetrics()
  });
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        logger.info('ServiceWorker registered:', registration);
      })
      .catch(error => {
        logger.error('ServiceWorker registration failed:', error);
      });
  });
}
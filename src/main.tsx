import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/context/ToastContext';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);

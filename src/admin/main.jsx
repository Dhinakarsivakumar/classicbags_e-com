import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './App';
import ErrorBoundary from '../shared/components/ErrorBoundary';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AdminApp />
    </ErrorBoundary>
  </React.StrictMode>
);

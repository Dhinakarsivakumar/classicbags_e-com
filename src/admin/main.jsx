import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);

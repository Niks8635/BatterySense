import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AgentStatusProvider } from './context/AgentStatusProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AgentStatusProvider>
        <App />
      </AgentStatusProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

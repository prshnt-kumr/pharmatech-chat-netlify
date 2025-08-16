import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ChatAgent from './ChatAgent';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChatAgent />
  </React.StrictMode>
);
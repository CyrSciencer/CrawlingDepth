import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./reset.css";

// Get the root DOM element and create React root
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the main App component in strict mode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 
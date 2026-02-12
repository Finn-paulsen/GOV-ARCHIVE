import React, { useState } from 'react';

import FensterManager from './components/FensterManager';
import LoginModal from './components/LoginModal';
import DeepDesktop from './components/DeepDesktop';

export default function App() {
  // Login und Schicht-State
  const [loginComplete, setLoginComplete] = useState(false);
  const [deepMode, setDeepMode] = useState(false);

  function handleLogout() {
    setLoginComplete(false);
    setDeepMode(false);
  }

  // Umschalten auf DeepDesktop
  function handleDeepAccess() {
    setDeepMode(true);
  }

  return (
    <div className="app-container">
      {/* Login-Dialog */}
      {!loginComplete && (
        <LoginModal onSuccess={() => setLoginComplete(true)} />
      )}

      {/* Geheimer Desktop */}
      {loginComplete && deepMode && (
        <DeepDesktop onLogout={() => setDeepMode(false)} />
      )}

      {/* Normaler Desktop */}
      {loginComplete && !deepMode && (
        <FensterManager bootComplete={true} onLogout={handleLogout} onDeepAccess={handleDeepAccess} />
      )}
    </div>
  );
}

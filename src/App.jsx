import React, { useState } from 'react';
import FensterManager from './components/FensterManager';
import LoginModal from './components/LoginModal';

export default function App() {
  // Lokale States für Login und View
  const [loginComplete, setLoginComplete] = useState(false);
  const [view, setView] = useState('desktop');

  function handleLogout() {
    setLoginComplete(false);
  }

  return (
    <div className="app-container">
      {/* Login-Dialog */}
      {!loginComplete && (
        <LoginModal onSuccess={() => setLoginComplete(true)} />
      )}

      {/* Desktop nach Login */}
      {loginComplete && (
        <FensterManager view={view} onChange={setView} bootComplete={true} onLogout={handleLogout} />
      )}
    </div>
  );
}

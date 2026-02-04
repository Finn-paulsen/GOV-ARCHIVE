
import React, { useState } from 'react';
// BootSequence entfernt
import Desktop from './components/Desktop';
import LoginModal from './components/LoginModal';

export default function App() {
  const [view, setView] = useState('bio');
  const [loginComplete, setLoginComplete] = useState(false);

  function handleLogout() {
    setLoginComplete(false);
  }

  return (
    <div className="app-shell">
      {/* Login-Dialog */}
      {!loginComplete && (
        <LoginModal onSuccess={() => setLoginComplete(true)} />
      )}

      {/* Desktop nach Login */}
      {loginComplete && (
        <Desktop view={view} onChange={setView} bootComplete={true} onLogout={handleLogout} />
      )}
    </div>
  );
}

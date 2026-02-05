

import React from 'react';
import Desktop from './components/Desktop';
import LoginModal from './components/LoginModal';
import { useAppStore } from './store';

export default function App() {
  const loginComplete = useAppStore(s => s.loginComplete)
  const setLoginComplete = useAppStore(s => s.setLoginComplete)
  const view = useAppStore(s => s.view)
  const setView = useAppStore(s => s.setView)

  function handleLogout() {
    setLoginComplete(false)
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
  )
}

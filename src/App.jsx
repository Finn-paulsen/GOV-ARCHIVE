import React, { useState } from 'react';
import LoadingOverlay from './components/LoadingOverlay';
import Toast from './components/Toast';

import FensterManager from './components/FensterManager';
import LoginModal from './components/LoginModal';
import DeepDesktop from './components/DeepDesktop';
import MailClient from './components/MailClient';

export default function App() {
  // Login und Schicht-State
  const [loginComplete, setLoginComplete] = useState(false);
  const [deepMode, setDeepMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  function handleLogout() {
    setLoginComplete(false);
    setDeepMode(false);
  }

  // Umschalten auf DeepDesktop
  function handleDeepAccess() {
    setDeepMode(true);
  }

  // Demo: Lade-Overlay nach Login
  React.useEffect(() => {
    if (loginComplete && !deepMode) {
      setLoading(true);
      setTimeout(() => setLoading(false), 1200);
      setTimeout(() => setToast({ show: true, message: 'Hinweis: Netzwerkverbindung instabil.', type: 'error' }), 5000);
    }
  }, [loginComplete, deepMode]);

  return (
    <div className="app-container">
      <LoadingOverlay show={loading} text="Bitte warten..." />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      {/* Login-Dialog */}
      {!loginComplete && (
        <LoginModal onSuccess={() => setLoginComplete(true)} />
      )}

      {/* Geheimer Desktop */}
      {loginComplete && deepMode && (
        <DeepDesktop onLogout={() => setDeepMode(false)} />
      )}

      {/* Normaler Desktop */}
      {loginComplete && !deepMode && !loading && (
        <FensterManager bootComplete={true} onLogout={handleLogout} onDeepAccess={handleDeepAccess} />
      )}
      {!loading && <MailClient />}
    </div>
  );
}

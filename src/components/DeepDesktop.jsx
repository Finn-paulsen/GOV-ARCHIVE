import React, { useState } from "react";
import './DeepDesktop.css';

const DEEP_PROGRAMS = [
  { name: "Secure Terminal", icon: "🖥️" },
  { name: "Encrypted Docs", icon: "📄" },
  { name: "Server Connect", icon: "🔗" },
  { name: "Test Environment", icon: "🧪" },
];

export default function DeepDesktop({ onLogout }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    // Simulierter Zugang
      if (user === "deepagent" && pass === "strengeheim") {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Access Denied: Invalid credentials.");
    }
  }

  if (!loggedIn) {
    return (
      <div className="deep-login-bg">
          <form className="deep-login-form" onSubmit={handleLogin}>
            <pre className="deep-login-banner">
  {`
  ------------------------------------------------------------
    Internes Anmeldemodul (AuthGate/BA-III)  [Build 2.14.7]
    Referenz: BA-INT-SEC-2003/17
    Terminalzugriff wird nicht aktiv unterstützt.
    Protokollierung aktiviert. [VS-NfD]
  ------------------------------------------------------------
  `}
            </pre>
            <div className="deep-login-title">Dienstkontenverwaltung – Anmeldung erforderlich</div>
            <input
              type="text"
              placeholder="Benutzername"
              value={user}
              onChange={e => setUser(e.target.value)}
              autoFocus
            />
            <input
              type="password"
              placeholder="Zugangscode"
              value={pass}
              onChange={e => setPass(e.target.value)}
            />
            <button type="submit">Anmelden</button>
            {error && <div className="deep-login-error">{error}</div>}
          </form>
        </div>
    );
  }

  return (
    <div className="deep-desktop-bg">
      <div className="deep-desktop-header">STRIKT GEHEIME SCHICHT - Bundesarchiv</div>
      <div className="deep-desktop-icons">
        {DEEP_PROGRAMS.map(p => (
          <div className="deep-desktop-icon" key={p.name}>
            <span className="deep-icon-symbol">{p.icon}</span>
            <span className="deep-icon-label">{p.name}</span>
          </div>
        ))}
      </div>
      <div className="deep-taskbar">
        <button className="deep-taskbar-logout" onClick={onLogout}>Logout</button>
        <span className="deep-taskbar-label">Clearance: STRENG GEHEIM</span>
      </div>
    </div>
  );
}

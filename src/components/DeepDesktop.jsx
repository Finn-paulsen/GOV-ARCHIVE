import React, { useState } from "react";
import { writeAuditLog } from "../utils/auditLog";
import './DeepDesktop.css';
import TerminalIcon from '@mui/icons-material/Terminal';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LanIcon from '@mui/icons-material/Lan';

const DEEP_PROGRAMS = [
  { name: "Systemkonsole (BA-III Shell)", icon: <TerminalIcon fontSize="large" /> },
  { name: "Aktenverwaltung", icon: <FolderIcon fontSize="large" /> },
  { name: "Datenbank (BA-DB/INT)", icon: <StorageIcon fontSize="large" /> },
  { name: "Benutzerverwaltung", icon: <PersonIcon fontSize="large" /> },
  { name: "Beratungsmodul (Dialogsystem)", icon: <SupportAgentIcon fontSize="large" /> },
  { name: "Systemmonitor", icon: <AssessmentIcon fontSize="large" /> },
  { name: "Schnittstellenverwaltung", icon: <LanIcon fontSize="large" /> },
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
      writeAuditLog({ action: 'login', user: user });
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
            <span className="deep-icon-symbol" style={{ color: '#00ff00' }}>{p.icon}</span>
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

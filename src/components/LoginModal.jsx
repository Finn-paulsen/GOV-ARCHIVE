import React, { useEffect, useRef, useState } from 'react'
import { getUsers, updateUser } from '../utils/userStore'
import { writeAuditLog } from "../utils/auditLog";
import ForcePasswordChangeModal from './ForcePasswordChangeModal';
import './terminal.css'
import seal from '../assets/seal.svg'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import localforage from 'localforage'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Tooltip } from 'react-tooltip'
import { motion } from 'framer-motion'

// Demo creds
const VALID_USER = 'demo'
const VALID_PASS = 'demo'
// Benutzerliste für Login kommt jetzt aus dem UserStore

// Small WebAudio helpers
function makeClickAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  return (volume = 0.02, freq = 1200) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'square'
    o.frequency.value = freq
    g.gain.value = volume
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    o.start(now)
    g.gain.setValueAtTime(volume, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
    o.stop(now + 0.06)
  }
}

function makeBeepAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  return (freq = 800, ms = 200) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.value = freq
    g.gain.value = 0.001
    o.connect(g)
    g.connect(ctx.destination)
    const now = ctx.currentTime
    g.gain.exponentialRampToValueAtTime(0.06, now + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000)
    o.start(now)
    o.stop(now + ms / 1000 + 0.02)
  }
}

export default function LoginModal({ onSuccess }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failCount, setFailCount] = useState(0)
  const [forcePwUser, setForcePwUser] = useState(null);
  const [lockdown, setLockdown] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  const userRef = useRef(null)
  const click = useRef(null)
  const beep = useRef(null)

  // session id + clock
  const sessionId = useRef(uuidv4())
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    click.current = makeClickAudio()
    beep.current = makeBeepAudio()
    // focus with small delay for old machine feel
    setTimeout(() => userRef.current && userRef.current.focus(), 250)
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function playKey() {
    try { click.current && click.current(0.008, 900) } catch (e) {}
  }

  async function simulateDelay(ms) {
    return new Promise(r => setTimeout(r, ms))
  }


  // Audit-Log-Eintrag zusätzlich in localStorage für UserManager-Tab
  function writeAudit(entry) {
    try {
      writeAuditLog({
        action: entry.action,
        user: entry.user,
        targetUser: entry.targetUser,
        info: entry.info
      });
    } catch (e) { console.error('audit log failed', e); }
  }

  async function fetchIp() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch {
      return '-';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('Verbindung herstellen...');
    await simulateDelay(700 + Math.random() * 500);
    setMessage('Authentifizierung läuft');
    for (let i = 0; i < 3; i++) {
      await simulateDelay(450);
      setMessage(prev => prev + '.');
      beep.current && beep.current(500, 60);
    }
    await simulateDelay(700);
    const ts = new Date().toISOString();
    const ip = await fetchIp();
    const users = getUsers();
    const found = users.find(u =>
      (u.username?.toLowerCase() === user.toLowerCase() || u.name?.toLowerCase() === user.toLowerCase())
    );
    // Account gesperrt?
    if (found && found.accountLocked) {
      setMessage('Account gesperrt. Bitte wenden Sie sich an den Administrator.');
      setBusy(false);
      return;
    }
    // Passwort prüfen
    const pwOk = found && found.password === pass;
    if ((user === VALID_USER && pass === VALID_PASS)) {
      setMessage('Zugriff gewährt. Initialisiere System...');
      beep.current && beep.current(1000, 140);
      writeAudit({ ts, user, action: 'login', result: 'success', info: navigator.userAgent, ip });
      await simulateDelay(900);
      onSuccess && onSuccess();
      setFailCount(0);
    } else if (found && pwOk) {
      if (found.mustChangePassword) {
        setForcePwUser(found);
        setBusy(false);
        setMessage('');
        setPass('');
        return;
      }
      // Anmeldeversuche und letztes Login speichern
      const updated = {
        ...found,
        loginAttempts: 0,
        lastLogin: ts,
        lastLoginIp: ip
      };
      updateUser(updated);
      setMessage('Zugriff gewährt. Initialisiere System...');
      beep.current && beep.current(1000, 140);
      writeAudit({ ts, user, action: 'login', result: 'success', info: navigator.userAgent, ip });
      await simulateDelay(900);
      onSuccess && onSuccess();
      setFailCount(0);
    } else if (found) {
      // Fehlversuch zählen, ggf. sperren
      const fails = (found.loginAttempts || 0) + 1;
      const locked = fails >= 5;
      const updated = {
        ...found,
        loginAttempts: fails,
        accountLocked: locked
      };
      updateUser(updated);
      setFailCount(fails);
      setMessage(locked ? 'Account gesperrt nach zu vielen Fehlversuchen.' : 'Authentifizierung fehlgeschlagen. Bitte erneut.');
      beep.current && beep.current(240, 120);
      writeAudit({ ts, user: user || '(leer)', action: locked ? 'lock-account' : 'login', result: 'failure', info: navigator.userAgent, ip });
      setBusy(false);
      await simulateDelay(400);
      setPass('');
      userRef.current && userRef.current.focus();
      if (fails >= 3 && !locked) {
        setLockdown(true);
        setAlertMsg('ALARM: Mehrfache unbefugte Zugriffsversuche erkannt! Der Vorfall wurde an die Sicherheitszentrale übermittelt. Die Vernichtung von Datenträgern ist strengstens untersagt. Alle Aktivitäten werden forensisch gesichert.');
        beep.current && beep.current(120, 600);
        toast.error('Sicherheitsalarm: Unbefugter Zugriff gemeldet!', { position: 'top-center', autoClose: 8000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: false });
      }
    } else {
      const newFail = failCount + 1;
      setFailCount(newFail);
      setMessage('Authentifizierung fehlgeschlagen. Bitte erneut.');
      beep.current && beep.current(240, 120);
      writeAudit({ ts, user: user || '(leer)', action: 'login', result: 'failure', info: navigator.userAgent, ip });
      setBusy(false);
      await simulateDelay(400);
      setPass('');
      userRef.current && userRef.current.focus();
      if (newFail >= 3) {
        setLockdown(true);
        setAlertMsg('ALARM: Mehrfache unbefugte Zugriffsversuche erkannt! Der Vorfall wurde an die Sicherheitszentrale übermittelt. Die Vernichtung von Datenträgern ist strengstens untersagt. Alle Aktivitäten werden forensisch gesichert.');
        beep.current && beep.current(120, 600);
        toast.error('Sicherheitsalarm: Unbefugter Zugriff gemeldet!', { position: 'top-center', autoClose: 8000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: false });
      }
    }
  }

  if (forcePwUser) {
    return <ForcePasswordChangeModal user={forcePwUser} onChangePassword={async (newPass) => {
      // Update User
      const updated = { ...forcePwUser, password: newPass, mustChangePassword: false };
      updateUser(updated);
      setForcePwUser(null);
      setUser(updated.username);
      setPass("");
      setMessage("Passwort erfolgreich geändert. Bitte erneut anmelden.");
    }} />;
  }
  return (
    <div className="login-overlay" role="dialog" aria-modal="true">
      <div className="terminal-login-box">
        <div className="terminal-header">
          <div className="terminal-title">BUNDESARCHIV</div>
          <div className="terminal-subtitle">Zugangskontrolle</div>
          <div className="terminal-meta">
            <span>Session: {sessionId.current}</span> | <span>{format(now, 'dd.MM.yyyy HH:mm:ss')}</span>
          </div>
        </div>
        <div className="terminal-warning">
          <div className="terminal-warning-title">ZUTRITT NUR FÜR AUTORISIERTE PERSONEN</div>
          <div className="terminal-warning-text">
            Jeder Zugriff wird protokolliert und überprüft.<br />
            Unbefugte Nutzung ist strafbar (§202 StGB).
          </div>
        </div>
        {!lockdown ? (
          <form onSubmit={handleSubmit} className="terminal-login-form" style={{ alignItems: 'center' }}>
            <label htmlFor="login-username" style={{ width: '100%', textAlign: 'left', marginBottom: '8px' }}>Benutzername:
              <input
                id="login-username"
                ref={userRef}
                className="terminal-input"
                name="username"
                value={user}
                onChange={e => { setUser(e.target.value); playKey() }}
                disabled={busy}
                autoComplete="username"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>
            <label htmlFor="login-password" style={{ width: '100%', textAlign: 'left', marginBottom: '8px' }}>Passwort:
              <input
                id="login-password"
                type="password"
                className="terminal-input"
                name="password"
                value={pass}
                onChange={e => { setPass(e.target.value); playKey() }}
                disabled={busy}
                autoComplete="current-password"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>
            <button className="terminal-btn" type="submit" disabled={busy || !user || !pass} style={{ width: '100%', marginTop: '16px' }}>ANMELDEN</button>
          </form>
        ) : (
          <div className="terminal-lockdown">
            <div className="terminal-lockdown-title">SICHERHEITSALARM</div>
            <div className="terminal-lockdown-msg">{alertMsg}</div>
          </div>
        )}
        <div className="terminal-message">{message}</div>
        <div className="terminal-countdown">
          {lockdown ? "Zugang gesperrt" : `Sperre nach ${3 - failCount} Fehlversuchen`}
        </div>
      </div>
    </div>
  )
}
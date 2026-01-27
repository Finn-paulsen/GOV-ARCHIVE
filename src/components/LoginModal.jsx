import React, { useEffect, useRef, useState } from 'react'
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

  async function writeAudit(entry){
    try{
      const key = 'audit_log_v1'
      const cur = (await localforage.getItem(key)) || []
      cur.push(entry)
      await localforage.setItem(key, cur)
    }catch(e){ console.error('audit log failed', e) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('Verbindung herstellen...')
    await simulateDelay(700 + Math.random() * 500)
    setMessage('Authentifizierung läuft')
    // dot animation
    for (let i = 0; i < 3; i++){
      await simulateDelay(450)
      setMessage(prev => prev + '.')
      beep.current && beep.current(500, 60)
    }

    // final check
    await simulateDelay(700)
    const ts = new Date().toISOString()
    if (user === VALID_USER && pass === VALID_PASS) {
      setMessage('Zugriff gewährt. Initialisiere System...')
      beep.current && beep.current(1000, 140)
      writeAudit({ts, user, action: 'login', result: 'success', info: navigator.userAgent})
      await simulateDelay(900)
      onSuccess && onSuccess()
      setFailCount(0)
    } else {
      const newFail = failCount + 1
      setFailCount(newFail)
  setMessage('Authentifizierung fehlgeschlagen. Bitte erneut.')
      beep.current && beep.current(240, 120)
      writeAudit({ts, user: user || '(leer)', action: 'login', result: 'failure', info: navigator.userAgent})
      setBusy(false)
      await simulateDelay(400)
      setPass('')
      userRef.current && userRef.current.focus()
      if (newFail >= 3) {
        setLockdown(true)
        setAlertMsg('ALARM: Mehrfache unbefugte Zugriffsversuche erkannt! Der Vorfall wurde an die Sicherheitszentrale übermittelt. Die Vernichtung von Datenträgern ist strengstens untersagt. Alle Aktivitäten werden forensisch gesichert.')
        beep.current && beep.current(120, 600)
        toast.error('Sicherheitsalarm: Unbefugter Zugriff gemeldet!', { position: 'top-center', autoClose: 8000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: false })
      }
    }
  }

  return (
    <div className="login-overlay" role="dialog" aria-modal="true">
      <ToastContainer />
      <motion.div className="login-modal" initial={{ scale: 0.98, opacity: 0.8 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <img src={seal} alt="Bundessiegel" className="login-seal" style={{width: 72, marginBottom: 18}} />
        <div className="login-header" style={{textAlign: 'center', marginBottom: 18}}>
          <div className="login-org" style={{fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.08em', color: '#cfeadf'}}>BUNDESREPUBLIK DEUTSCHLAND</div>
          <div className="login-title" style={{fontWeight: 900, fontSize: '1.09rem', letterSpacing: '0.13em', color: '#e0e0e0', marginTop: 2}}>REGIERUNGSARCHIV — ZUGANGSKONTROLLE</div>
          <div className="login-meta" style={{marginTop: 8, fontSize: '0.97rem', color: '#b0b0b0'}}>
            <span className="login-session">Session-ID: {sessionId.current}</span> &nbsp;|&nbsp;
            <span className="login-time">{format(now, 'dd.MM.yyyy HH:mm:ss')}</span>
          </div>
        </div>
        <div className="login-warning" style={{background: '#1a232b', border: '2px solid #cfeadf', borderRadius: 6, padding: '18px 22px', marginBottom: 18, color: '#e0e0e0', fontSize: '1.01rem', boxShadow: '0 2px 18px #011217'}}>
          <div style={{fontWeight: 900, fontSize: '1.09rem', color: '#cfeadf', marginBottom: 8, letterSpacing: '0.09em'}}>ZUTRITT NUR FÜR AUTORISIERTE PERSONEN</div>
          <div style={{marginBottom: 8}}>
            <strong>Hinweis:</strong> Unbefugter Zugriff auf dieses System ist strengstens untersagt.<br />
            Jeder Anmeldeversuch, jede Eingabe und jede Benutzeraktivität wird protokolliert und überprüft.<br />
            Verstöße gegen <strong>§202 StGB</strong> (Computerkriminalität) und Bundesrecht werden strafrechtlich verfolgt.<br />
          </div>
          <div style={{fontSize: '0.97rem', color: '#b0b0b0', marginBottom: 6}}>
            <span>IP-Adresse: <span style={{color:'#cfeadf', fontWeight:700}}>192.168.0.1</span></span> &nbsp;|&nbsp;
            <span>Standort: <span style={{color:'#cfeadf', fontWeight:700}}>DEU</span></span>
          </div>
          <div style={{fontSize: '0.99rem', color: '#cfeadf', fontWeight:700, marginTop: 8}}>
            Verbindung: <span style={{background:'#cfeadf', color:'#011217', padding:'2px 8px', borderRadius:4, fontWeight:900, margin:'0 2px'}}>Verschlüsselt</span>
          </div>
          <div className={`login-countdown${lockdown ? ' login-countdown-alarm' : ''}`} style={{marginTop: 10}}>
            Zugang wird nach <span className="login-countdown-timer">{3 - failCount}</span> Fehlversuchen gesperrt
          </div>
          {lockdown && (
            <motion.div className="login-lockdown" initial={{ scale: 0.95, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
              <span className="login-lockdown-title">SICHERHEITSALARM</span>
              <span className="login-lockdown-msg">{alertMsg}</span>
            </motion.div>
          )}
        </div>
        {!lockdown && (
          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-label">Benutzername</label>
            <input ref={userRef} className="login-input" value={user} onChange={e => { setUser(e.target.value); playKey() }} disabled={busy} />
            <label className="login-label">Passwort</label>
            <input type="password" className="login-input" value={pass} onChange={e => { setPass(e.target.value); playKey() }} disabled={busy} />
            <div className="login-actions">
              <button className="login-btn" type="submit" disabled={busy || !user || !pass}>Anmelden</button>
            </div>
          </form>
        )}
        <div className="login-message">{message}</div>
      </motion.div>
    </div>
  )
}

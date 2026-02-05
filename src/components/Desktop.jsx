
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store'
import SurveillanceCenter from './SurveillanceCenter'
import ArchiveViewer from './ArchiveViewer'
import Explorer from './Explorer'
import FileEditor from './FileEditor'

function makeId(){return Math.random().toString(36).slice(2,9)}

export default function Desktop({ bootComplete, onLogout }) {
  const [windows, setWindows] = useState([])
  const [zCounter, setZCounter] = useState(10)
  const [clock, setClock] = useState(new Date())
  const [showStart, setShowStart] = useState(false)
  const [modal, setModal] = useState(null)
  const view = useAppStore(s => s.view)
  const setView = useAppStore(s => s.setView)

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  function openWindow(opts) {
    const id = makeId()
    const z = zCounter + 1
    setZCounter(z)
    const w = {
      id,
      title: opts.title || 'Fenster',
      content: opts.content || '',
      minimized: false,
      z,
    }
    setWindows(ws => [...ws, w])
    return id
  }

  // Öffnet Datei in Editor-Fenster
  function handleOpenFile({ name, path, content }) {
    openWindow({
      title: name,
      content: <FileEditor name={name} content={content} />,
    })
  }

  function closeWindow(id) {
    setWindows(ws => ws.filter(w => w.id !== id))
  }

  function focusWindow(id) {
    setZCounter(z => {
      const newZ = z + 1
      setWindows(ws =>
        ws.map(w =>
          w.id === id ? { ...w, z: newZ, minimized: false } : w
        )
      )
      return newZ
    })
  }

  function toggleMinimize(id) {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w))
  }

  function handleLogout() {
    setShowStart(false)
    if (onLogout) onLogout()
    setView('bio')
  }

  function handleRestart() {
    setShowStart(false)
    setModal({ type: 'restart' })
  }

  function handleShutdown() {
    setShowStart(false)
    setModal({ type: 'shutdown' })
  }

  function confirmRestart() {
    setModal(null)
    window.location.reload()
  }

  function confirmShutdown() {
    setModal(null)
    // Versuche Fenster zu schließen, falls nicht möglich: Heruntergefahren-Bildschirm anzeigen
    if (window.close) window.close()
    // Fallback: Bildschirm anzeigen
    document.body.innerHTML = '<div style="background:#181818;color:#ffbf47;display:flex;align-items:center;justify-content:center;height:100vh;font-size:2rem;font-family:monospace;">System wurde heruntergefahren.</div>'
  }

  if (!bootComplete) return null

  return (
    <div className="gov-desktop-bg">
      {/* Desktop Icons (optional) */}
      <div className="gov-desktop-icons">
        {/* Texteditor-Icon */}
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'Texteditor', content: 'Willkommen im Bundesarchiv-Terminal.' })}>
          <span className="gov-icon-symbol">■</span>
          <span className="gov-icon-label">Texteditor</span>
        </div>
        {/* Kamera-Icon */}
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'Überwachungszentrale', content: <SurveillanceCenter /> })}>
          <span className="gov-icon-symbol">📷</span>
          <span className="gov-icon-label">Überwachung</span>
        </div>
        {/* Archiv-Icon */}
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'Videoarchiv', content: <ArchiveViewer /> })}>
          <span className="gov-icon-symbol">🗄️</span>
          <span className="gov-icon-label">Archiv</span>
        </div>
        {/* Datei-Explorer-Icon */}
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'Datei-Explorer', content: <Explorer /> })}>
          <span className="gov-icon-symbol">📁</span>
          <span className="gov-icon-label">Dateien</span>
        </div>
        
      </div>

      {/* Fenster (mit Framer Motion Animation) */}
      <AnimatePresence>
        {windows.map(w => !w.minimized && (
          <motion.div
            key={w.id}
            className="gov-window"
            style={{ zIndex: w.z, position: 'absolute' }}
            onMouseDown={() => focusWindow(w.id)}
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="gov-window-titlebar">
              <span className="gov-window-title">{w.title}</span>
              <div className="gov-window-controls">
                <button onClick={() => toggleMinimize(w.id)} title="Minimieren">_</button>
                <button onClick={() => closeWindow(w.id)} title="Schließen">×</button>
              </div>
            </div>
            <div className="gov-window-content">{w.content}</div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Startmenü */}
      {showStart && (
        <div className="gov-startmenu">
          <button onClick={handleLogout}>Abmelden</button>
          <button onClick={handleRestart}>Neustarten</button>
          <button onClick={handleShutdown}>Herunterfahren</button>
        </div>
      )}

      {/* Modale Fenster für Neustart/Shutdown */}
      {modal?.type === 'restart' && (
        <div className="gov-modal-bg">
          <div className="gov-modal">
            <div className="gov-modal-title">Systemneustart</div>
            <div className="gov-modal-content">Das System wird neu gestartet. Nicht gespeicherte Daten gehen verloren.<br />Fortfahren?</div>
            <div className="gov-modal-actions">
              <button onClick={confirmRestart}>Neustart</button>
              <button onClick={() => setModal(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      {modal?.type === 'shutdown' && (
        <div className="gov-modal-bg">
          <div className="gov-modal">
            <div className="gov-modal-title">System herunterfahren</div>
            <div className="gov-modal-content">Das System wird heruntergefahren.<br />Fortfahren?</div>
            <div className="gov-modal-actions">
              <button onClick={confirmShutdown}>Herunterfahren</button>
              <button onClick={() => setModal(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="gov-taskbar">
        <div className="gov-taskbar-left">
          <button className="gov-taskbar-menu" onClick={() => setShowStart(s => !s)}>Start</button>
        </div>
        <div className="gov-taskbar-windows">
          {windows.map(w => (
            <button
              key={w.id}
              className={`gov-taskbar-window-btn${w.minimized ? ' minimized' : ''}`}
              onClick={() => toggleMinimize(w.id)}
            >{w.title}</button>
          ))}
        </div>
        <div className="gov-taskbar-clock">
          {clock.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

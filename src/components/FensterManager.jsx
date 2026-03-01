import { motion, AnimatePresence } from 'framer-motion';
import FileEditor from './FileEditor';
import FileExplorer from './FileExplorer';
import GovTerminal from './GovTerminal.jsx';
import MailClient from './MailClient';
import UserManager from './UserManager';
import HiveMindWindow from './HiveMindWindow';
import DatabaseBrowser from './DatabaseBrowser';
import ExploitLab from './ExploitLab';
import React, { useState, useRef, useEffect } from 'react';
import DraggableWindow from './DraggableWindow';

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function FensterManager({ bootComplete, onLogout, onDeepAccess }) {
  const [windows, setWindows] = useState([]);
  const [clock, setClock] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [modal, setModal] = useState(null);
  const [explorerData, setExplorerData] = useState(null);

  // Z-Index als Ref – kein Stale-Closure-Problem mehr
  const zRef = useRef(10);

  const updateExplorerData = (newData) => {
    setExplorerData(newData);
  };

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function openWindow(opts) {
    const z = ++zRef.current;
    setWindows(ws => {
      // Fenster gleichen Typs: in Vordergrund holen und wiederherstellen
      const existing = ws.find(w => w.type === (opts.type ?? 'custom'));
      if (existing) {
        return ws.map(w =>
          w.id === existing.id ? { ...w, minimized: false, z } : w
        );
      }
      // Versatz: neue Fenster leicht gestaffelt öffnen
      const offset = ws.length * 24;
      return [
        ...ws,
        {
          id: makeId(),
          title: opts.title,
          type: opts.type ?? 'custom',
          content: opts.content,
          pos: { x: 100 + offset, y: 80 + offset },
          z,
          minimized: false,
          maximized: false,
        },
      ];
    });
  }

  function focusWindow(id) {
    const z = ++zRef.current;
    setWindows(ws => ws.map(w => w.id === id ? { ...w, z } : w));
  }

  function toggleMinimize(id) {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
  }

  function toggleMaximize(id) {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  }

  // Callback für Terminal: Fenster per Typ öffnen
  function handleOpenWindowFromTerminal(type) {
    if (type === 'database') {
      openWindow({ title: 'Datenbank-Browser – POLIZEI-DB-NRW', type: 'database' });
    } else if (type === 'exploitlab') {
      openWindow({ title: 'Exploit-Entwicklungslabor', type: 'exploitlab' });
    }
  }

  // Refs für spezielle Fenster
  const userManagerRef = useRef();

  const [pendingCloseId, setPendingCloseId] = useState(null);
  const [showLdapModal, setShowLdapModal] = useState(false);

  function closeWindow(id) {
    const win = windows.find(w => w.id === id);
    if (win?.type === 'users' && userManagerRef.current?.dirty) {
      setPendingCloseId(id);
      setShowLdapModal(true);
      return;
    }
    setWindows(ws => ws.filter(w => w.id !== id));
  }

  function updateFileContent(file, newContent) {
    function updateNode(node, path = 'root') {
      if (node.name === file.name && path === file.path) {
        return { ...node, content: newContent };
      }
      if (node.type === 'folder' && node.children) {
        return {
          ...node,
          children: node.children.map(child =>
            updateNode(child, path + '/' + child.name)
          ),
        };
      }
      return node;
    }
    updateExplorerData(updateNode(explorerData));
  }

  function handleOpenFile(file) {
    openWindow({
      title: `Datei: ${file.name}`,
      content: (
        <FileEditor
          name={file.name}
          content={file.content || ''}
          onSave={content => updateFileContent(file, content)}
        />
      ),
    });
  }

  function getWindowContent(w) {
    if (w.type === 'explorer') return <FileExplorer />;
    if (w.type === 'terminal') {
      return (
        <GovTerminal
          onDeepAccess={onDeepAccess}
          onOpenWindow={handleOpenWindowFromTerminal}
        />
      );
    }
    if (w.type === 'mail') return <MailClient />;
    if (w.type === 'users') return <UserManager onRequestClose={{ ref: userManagerRef }} />;
    if (w.type === 'hivemind') return <HiveMindWindow />;
    if (w.type === 'database') return <DatabaseBrowser />;
    if (w.type === 'exploitlab') return <ExploitLab />;
    return typeof w.content === 'function' ? w.content() : w.content;
  }

  function handleLogout() { onLogout(); }
  function handleRestart() { setModal({ type: 'restart' }); }
  function handleShutdown() { setModal({ type: 'shutdown' }); }

  function confirmRestart() {
    setModal(null);
    window.location.reload();
  }

  function confirmShutdown() {
    setModal(null);
    document.body.innerHTML =
      '<div style="background:#0b0f14;color:#c49030;display:flex;align-items:center;justify-content:center;height:100vh;font-size:1.4rem;font-family:Consolas,monospace;">System wurde heruntergefahren.</div>';
  }

  if (!bootComplete) return null;

  return (
    <div className="gov-desktop-bg">
      <div className="gov-desktop-icons">
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'Datei-Explorer', type: 'explorer' })}>
          <span className="gov-icon-symbol">📁</span>
          <span className="gov-icon-label">Dateien</span>
        </div>
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'E-Mail', type: 'mail' })}>
          <span className="gov-icon-symbol">✉️</span>
          <span className="gov-icon-label">E-Mail</span>
        </div>
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'Benutzerverwaltung', type: 'users' })}>
          <span className="gov-icon-symbol">👤</span>
          <span className="gov-icon-label">Benutzer</span>
        </div>
        <div className="gov-desktop-icon" onDoubleClick={() => openWindow({ title: 'GOV-Terminal', type: 'terminal' })}>
          <span className="gov-icon-symbol">🖥️</span>
          <span className="gov-icon-label">Terminal</span>
        </div>
      </div>

      <AnimatePresence>
        {windows.map(w => !w.minimized && (
          <DraggableWindow
            key={w.id}
            window={w}
            getWindowContent={getWindowContent}
            onFocus={() => focusWindow(w.id)}
            onMove={pos => setWindows(ws =>
              ws.map(win =>
                win.id === w.id
                  ? { ...win, pos: { x: Math.round(pos.x), y: Math.round(pos.y) } }
                  : win
              )
            )}
            onClose={() => closeWindow(w.id)}
            onMinimize={() => toggleMinimize(w.id)}
            onMaximize={() => toggleMaximize(w.id)}
            z={w.z}
          />
        ))}
      </AnimatePresence>

      {/* LDAP-Sync-Modal */}
      {showLdapModal && (
        <div className="gov-modal-bg">
          <div className="gov-modal">
            <div className="gov-modal-title">LDAP Sync erforderlich</div>
            <div className="gov-modal-content">
              Es wurden Änderungen an der Benutzerverwaltung vorgenommen.
              Bitte führen Sie einen LDAP-Sync durch, bevor Sie das Fenster schließen.
            </div>
            <div className="gov-modal-actions">
              <button onClick={() => setShowLdapModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Startmenü */}
      {showStart && (
        <div className="gov-startmenu">
          <button onClick={handleLogout}>Abmelden</button>
          <button onClick={handleRestart}>Neustarten</button>
          <button onClick={handleShutdown}>Herunterfahren</button>
        </div>
      )}

      {/* Neustart-Bestätigung */}
      {modal?.type === 'restart' && (
        <div className="gov-modal-bg">
          <div className="gov-modal">
            <div className="gov-modal-title">Systemneustart</div>
            <div className="gov-modal-content">
              Das System wird neu gestartet. Nicht gespeicherte Daten gehen verloren.<br />
              Fortfahren?
            </div>
            <div className="gov-modal-actions">
              <button onClick={confirmRestart}>Neustart</button>
              <button onClick={() => setModal(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {/* Herunterfahren-Bestätigung */}
      {modal?.type === 'shutdown' && (
        <div className="gov-modal-bg">
          <div className="gov-modal">
            <div className="gov-modal-title">System herunterfahren</div>
            <div className="gov-modal-content">
              Das System wird heruntergefahren.<br />
              Fortfahren?
            </div>
            <div className="gov-modal-actions">
              <button onClick={confirmShutdown}>Herunterfahren</button>
              <button onClick={() => setModal(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {/* Taskleiste */}
      <div className="gov-taskbar">
        <div className="gov-taskbar-left">
          <button
            className="gov-taskbar-menu"
            onClick={() => setShowStart(s => !s)}
          >
            Start
          </button>
        </div>
        <div className="gov-taskbar-windows">
          {windows.map(w => (
            <button
              key={w.id}
              className={`gov-taskbar-window-btn${w.minimized ? ' minimized' : ''}`}
              onClick={() => toggleMinimize(w.id)}
            >
              {w.title}
            </button>
          ))}
        </div>
        <div className="gov-taskbar-clock">
          {clock.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

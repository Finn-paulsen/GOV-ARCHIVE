import React from 'react';
import Console from 'react-console-emulator';

export default function GovReactTerminal({ onClose }) {
  return (
    <div className="gov-terminal-window" style={{ position: 'fixed', left: '20vw', top: '10vh', width: 600, height: 400, zIndex: 1000 }}>
      <div className="gov-terminal-header">
        <span>GOV-Terminal</span>
        <button className="gov-terminal-close" onClick={onClose}>×</button>
      </div>
      <div className="gov-terminal-body" style={{ padding: 0, height: '100%', background: '#181c1f' }}>
        <Console
          promptLabel={'C:/GOV-ARCHIVE> '}
          noDefaults={true}
          commands={{
            help: {
              description: 'Zeigt verfügbare Befehle',
              usage: 'help',
              fn: () => 'Verfügbare Befehle: help, clear, echo, dir, exit'
            },
            clear: {
              description: 'Terminal leeren',
              usage: 'clear',
              fn: function() { this.clear(); return ''; }
            },
            echo: {
              description: 'Text ausgeben',
              usage: 'echo <text>',
              fn: (text) => text
            },
            dir: {
              description: 'Zeigt Verzeichnis',
              usage: 'dir',
              fn: () => '[public]\n[src]\nREADME.md\nindex.html'
            },
            exit: {
              description: 'Terminal schließen',
              usage: 'exit',
              fn: () => { onClose && onClose(); return 'Terminal geschlossen.'; }
            }
          }}
          welcomeMessage={'Willkommen im GOV-ARCHIVE Terminal'}
          autoFocus
          style={{ background: '#181c1f', color: '#e0e0e0', fontFamily: 'Fira Mono, Consolas, monospace', fontSize: 16, height: '100%' }}
        />
      </div>
    </div>
  );
}

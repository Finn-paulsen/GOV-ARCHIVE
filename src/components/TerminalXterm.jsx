
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import './terminal.css';

const TerminalXterm = ({ onClose }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);

  useEffect(() => {
    const xterm = new Terminal({
      cursorBlink: true,
      fontFamily: 'Fira Mono, Consolas, monospace',
      fontSize: 16,
      theme: {
        background: '#181c1f',
        foreground: '#e0e0e0',
        cursor: '#6cf',
        selection: '#333',
      },
      windowsMode: true,
      disableStdin: false,
    });
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();
    xterm.loadAddon(fitAddon);
    xterm.loadAddon(webLinksAddon);
    xterm.loadAddon(searchAddon);
    xterm.open(terminalRef.current);
    fitAddon.fit();
    xterm.write('\x1b[1;36mWillkommen im GOV-ARCHIVE Terminal\x1b[0m\r\n');
    xterm.write('C:/GOV-ARCHIVE> ');
    xtermRef.current = xterm;
    return () => xterm.dispose();
  }, []);

  return (
    <div className="gov-terminal-window" style={{ position: 'fixed', left: '20vw', top: '10vh', width: 600, height: 400, zIndex: 1000 }}>
      <div className="gov-terminal-header">
        <span>GOV-Terminal</span>
        <button className="gov-terminal-close" onClick={onClose}>×</button>
      </div>
      <div className="gov-terminal-body" style={{ padding: 0, height: '100%', background: '#181c1f' }}>
        <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default TerminalXterm;

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import React, { useEffect, useRef } from 'react';


const TerminalXterm = ({ onClose, terminalState }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);

  const PROMPT = 'C:/GOV-ARCHIVE> ';
  // Input und History im Fenster-Objekt
  const inputRef = useRef(terminalState.input);

  function showPrompt() {
    if (xtermRef.current) {
      xtermRef.current.write(`\r\n${PROMPT}`);
      inputRef.current = '';
      terminalState.input = '';
    }
  }

  function handleCommand(cmd) {
    if (!xtermRef.current) return;
    if (!cmd.trim()) return;
    terminalState.history.push(PROMPT + cmd);
    if (cmd === 'help') {
      xtermRef.current.write('\r\nVerfügbare Befehle: help, clear, echo, dir, exit');
      terminalState.history.push('Verfügbare Befehle: help, clear, echo, dir, exit');
    } else if (cmd === 'clear') {
      xtermRef.current.clear();
      terminalState.history = [];
    } else if (cmd.startsWith('echo ')) {
      xtermRef.current.write(`\r\n${cmd.slice(5)}`);
      terminalState.history.push(cmd.slice(5));
    } else if (cmd === 'dir') {
      xtermRef.current.write('\r\n Volume in Laufwerk C: GOV-ARCHIVE\r\n Verzeichnis von C:/GOV-ARCHIVE\r\n\r\n[public]\r\n[src]\r\nREADME.md\r\nindex.html\r\n');
      terminalState.history.push('Volume in Laufwerk C: GOV-ARCHIVE\nVerzeichnis von C:/GOV-ARCHIVE\n[public]\n[src]\nREADME.md\nindex.html');
    } else if (cmd === 'exit') {
      xtermRef.current.write('\r\nTerminal geschlossen.');
      setTimeout(() => { if (onClose) onClose(); }, 500);
    } else {
      xtermRef.current.write('\r\nUnbekannter Befehl. Tippe "help".');
      terminalState.history.push('Unbekannter Befehl. Tippe "help".');
    }
  }

  useEffect(() => {
    if (!terminalRef.current) return;
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
    xtermRef.current = xterm;
    // Schreibe History ins Terminal
    if (terminalState.history && terminalState.history.length > 0) {
      terminalState.history.forEach(line => xterm.write(`\r\n${line}`));
    } else {
      xterm.write('\x1b[1;36mWillkommen im GOV-ARCHIVE Terminal\x1b[0m\r\n');
    }
    showPrompt();

    function handleResize() {
      fitAddon.fit();
    }
    window.addEventListener('resize', handleResize);

    xterm.onKey(e => {
      const ev = e.domEvent;
      const key = e.key;
      if (ev.key === 'Enter') {
        handleCommand(inputRef.current);
        terminalState.input = '';
        showPrompt();
      } else if (ev.key === 'Backspace') {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          terminalState.input = inputRef.current;
          xterm.write('\b \b');
        }
      } else if (ev.key.length === 1 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        inputRef.current += key;
        terminalState.input = inputRef.current;
        xterm.write(key);
      }
    });

    setTimeout(() => xterm.focus(), 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      xterm.dispose();
    };
  }, [onClose, terminalState]);

  return (
    <div className="gov-terminal-window" style={{ position: 'fixed', left: '20vw', top: '10vh', width: 600, height: 400, zIndex: 1000 }}>
      <div className="gov-terminal-header">
        <span>GOV-Terminal</span>
        <button className="gov-terminal-close" onClick={onClose}>×</button>
      </div>
      <div className="gov-terminal-body" style={{ padding: 0, height: '100%', background: '#181c1f' }}>
        <div ref={terminalRef} style={{ width: '100%', height: '100%' }}></div>
      </div>
    </div>
  );
};

export default TerminalXterm;

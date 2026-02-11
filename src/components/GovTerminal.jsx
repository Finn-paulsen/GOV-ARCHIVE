

import React, { useState, useRef, useEffect } from "react";
import "./govTerminal.css";

const PROMPT = "gov-user@archive:~$";
const COMMANDS = {
  help: [
    "Verfügbare Befehle:",
    "help   - Zeigt diese Hilfe",
    "clear  - Löscht das Terminal",
    "info   - Informationen zum System"
  ],
  info: [
    "GOV-ARCHIVE Terminal v1.0",
    "Behörden-Terminal Simulation (1998-2005)."
  ]
};

export default function GovTerminal() {
  const [lines, setLines] = useState([
    "Willkommen im GOV-ARCHIVE Terminal.",
    "Geben Sie 'help' für verfügbare Befehle ein."
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const terminalRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Fokus auf Terminal-Div bei Mount
  useEffect(() => {
    terminalRef.current && terminalRef.current.focus();
  }, []);

  // Blinker für Cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Fokus bei Klick
  function handleBodyClick() {
    terminalRef.current && terminalRef.current.focus();
  }

  function handleCommand(cmd) {
    if (cmd === "clear") {
      setLines([]);
      setError("");
      setHistory(h => h.length ? h : []);
      setHistoryIndex(-1);
      return;
    }
    if (cmd.length > 0) {
      setHistory(h => [...h, cmd]);
      setHistoryIndex(-1);
    }
    if (COMMANDS[cmd]) {
      setLines(l => [...l, PROMPT + " " + cmd, ...COMMANDS[cmd]]);
      setError("");
    } else if (cmd.length > 0) {
      setLines(l => [...l, PROMPT + " " + cmd]);
      setError(`Unbekannter Befehl: ${cmd}`);
    }
  }

  function handleKeyDown(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "Enter") {
      handleCommand(input.trim());
      setInput("");
      setHistoryIndex(-1);
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace") {
      setInput(i => i.slice(0, -1));
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp") {
      if (history.length > 0) {
        setHistoryIndex(idx => {
          const newIdx = idx < 0 ? history.length - 1 : Math.max(0, idx - 1);
          setInput(history[newIdx] || "");
          return newIdx;
        });
      }
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      if (history.length > 0) {
        setHistoryIndex(idx => {
          const newIdx = idx < 0 ? -1 : Math.min(history.length - 1, idx + 1);
          setInput(newIdx >= 0 ? history[newIdx] : "");
          return newIdx;
        });
      }
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !e.repeat) {
      setInput(i => i + e.key);
      setHistoryIndex(-1);
      e.preventDefault();
      return;
    }
  }

  return (
    <div
      className="gov-terminal-body"
      tabIndex={0}
      ref={terminalRef}
      onClick={handleBodyClick}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      autoFocus
    >
      {lines.map((line, idx) => (
        <div key={idx} className="gov-terminal-line">{line}</div>
      ))}
      {error && <div className="gov-terminal-error">{error}</div>}
      <div className="gov-terminal-input-row">
        <span className="gov-terminal-prompt">{PROMPT}</span>
        <span className="gov-terminal-input-sim">
          {input}
          <span className={"gov-terminal-cursor" + (cursorVisible ? "" : " gov-terminal-cursor-hide")}></span>
        </span>
      </div>
    </div>
  );
}
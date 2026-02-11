

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
  const [selection, setSelection] = useState({ start: null, end: null });
  const [cursorPos, setCursorPos] = useState(null);

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
    // Copy/Paste
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      if (selection.start !== null && selection.end !== null && selection.start !== selection.end) {
        const sel = input.slice(Math.min(selection.start, selection.end), Math.max(selection.start, selection.end));
        navigator.clipboard.writeText(sel);
      }
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "v") {
      navigator.clipboard.readText().then(text => {
        if (text) {
          const pos = cursorPos ?? input.length;
          setInput(i => i.slice(0, pos) + text + i.slice(pos));
          setSelection({ start: null, end: null });
          setCursorPos(pos + text.length);
        }
      });
      e.preventDefault();
      return;
    }
    // Auswahl mit Shift + Pfeil
    if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      let pos = cursorPos ?? input.length;
      if (e.key === "ArrowLeft") pos = Math.max(0, pos - 1);
      if (e.key === "ArrowRight") pos = Math.min(input.length, pos + 1);
      setSelection(sel => ({ start: sel.start === null ? pos : sel.start, end: pos }));
      setCursorPos(pos);
      e.preventDefault();
      return;
    }
    // Pfeiltasten ohne Shift
    if (!e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      let pos = cursorPos ?? input.length;
      if (e.key === "ArrowLeft") pos = Math.max(0, pos - 1);
      if (e.key === "ArrowRight") pos = Math.min(input.length, pos + 1);
      setSelection({ start: null, end: null });
      setCursorPos(pos);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowUp") {
      if (history.length > 0) {
        setHistoryIndex(idx => {
          const newIdx = idx < 0 ? history.length - 1 : Math.max(0, idx - 1);
          setInput(history[newIdx] || "");
          setSelection({ start: null, end: null });
          setCursorPos((history[newIdx] || "").length);
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
          setSelection({ start: null, end: null });
          setCursorPos(newIdx >= 0 ? (history[newIdx] || "").length : 0);
          return newIdx;
        });
      }
      e.preventDefault();
      return;
    }
    // Enter
    if (e.key === "Enter") {
      handleCommand(input.trim());
      setInput("");
      setHistoryIndex(-1);
      setSelection({ start: null, end: null });
      setCursorPos(0);
      e.preventDefault();
      return;
    }
    // Backspace
    if (e.key === "Backspace") {
      let pos = cursorPos ?? input.length;
      if (pos > 0) {
        setInput(i => i.slice(0, pos - 1) + i.slice(pos));
        setCursorPos(pos - 1);
      }
      setSelection({ start: null, end: null });
      e.preventDefault();
      return;
    }
    // Zeichen
    if (e.key.length === 1 && !e.repeat) {
      let pos = cursorPos ?? input.length;
      setInput(i => i.slice(0, pos) + e.key + i.slice(pos));
      setHistoryIndex(-1);
      setSelection({ start: null, end: null });
      setCursorPos(pos + 1);
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
            {(() => {
              const selActive = selection.start !== null && selection.end !== null && selection.start !== selection.end;
              const pos = cursorPos ?? input.length;
              const left = input.slice(0, selActive ? Math.min(selection.start, selection.end) : pos);
              const sel = selActive ? input.slice(Math.min(selection.start, selection.end), Math.max(selection.start, selection.end)) : "";
              const right = selActive ? input.slice(Math.max(selection.start, selection.end)) : input.slice(pos);
              return <>
                {left}
                {selActive && <span className="gov-terminal-selection">{sel}</span>}
                <span className={"gov-terminal-cursor" + (cursorVisible ? "" : " gov-terminal-cursor-hide")}></span>
                {right}
              </>;
            })()}
          </span>
        </div>
    </div>
  );
}
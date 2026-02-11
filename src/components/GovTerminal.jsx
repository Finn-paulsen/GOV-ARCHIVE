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
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);

  function handleCommand(cmd) {
    if (cmd === "clear") {
      setLines([]);
      setError("");
      return;
    }
    if (COMMANDS[cmd]) {
      setLines(l => [...l, PROMPT + " " + cmd, ...COMMANDS[cmd]]);
      setError("");
    } else if (cmd.length > 0) {
      setLines(l => [...l, PROMPT + " " + cmd]);
      setError(`Befehl nicht gefunden: ${cmd}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleCommand(input.trim());
      setInput("");
    }
  }

  return (
    <div className="gov-terminal-window">
      <div className="gov-terminal-header">GOV-ARCHIVE TERMINAL</div>
      <div className="gov-terminal-body" onClick={() => inputRef.current && inputRef.current.focus()}>
        {lines.map((line, idx) => (
          <div key={idx} className="gov-terminal-line">{line}</div>
        ))}
        {error && <div className="gov-terminal-error">{error}</div>}
        <div className="gov-terminal-input-row">
          <span className="gov-terminal-prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            className="gov-terminal-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
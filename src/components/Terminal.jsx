
import React, { useRef, useState, useEffect } from "react";
import "./terminal.css";

const DEFAULT_PROMPT = "C:/GOV-ARCHIVE>";

const COMMANDS = {
  help: {
    output: `Verfügbare Befehle:\nhelp, clear, echo, dir, exit`,
    description: "Zeigt diese Hilfe an."
  },
  clear: {
    output: "__CLEAR__",
    description: "Leert das Terminal."
  },
  echo: {
    output: (args) => args.join(" "),
    description: "Gibt Text aus."
  },
  dir: {
    output: ` Volume in Laufwerk C: GOV-ARCHIVE\n Verzeichnis von C:/GOV-ARCHIVE\n\n[public]\n[src]\nREADME.md\nindex.html\n` ,
    description: "Listet Dateien/Ordner auf."
  },
  exit: {
    output: "Terminal geschlossen.",
    description: "Schließt das Terminal."
  }
};

function parseCommand(input) {
  const [cmd, ...args] = input.trim().split(/\s+/);
  return { cmd: cmd?.toLowerCase(), args };
}

export default function Terminal({ onClose }) {
  const [history, setHistory] = useState([
    { type: "output", text: "Willkommen im GOV-Terminal. Tippe 'help' für Hilfe." }
  ]);
  const [input, setInput] = useState("");
  const [closed, setClosed] = useState(false);
  const inputRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    if (!closed) inputRef.current?.focus();
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history, closed]);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const { cmd, args } = parseCommand(input);
    let output = "Unbekannter Befehl. Tippe 'help'.";
    if (COMMANDS[cmd]) {
      if (cmd === "clear") {
        setHistory([]);
        setInput("");
        return;
      }
      if (cmd === "echo") {
        output = COMMANDS[cmd].output(args);
      } else {
        output = COMMANDS[cmd].output;
      }
      if (cmd === "exit") {
        setClosed(true);
        if (onClose) onClose();
      }
    }
    setHistory((h) => [
      ...h,
      { type: "input", text: `${DEFAULT_PROMPT} ${input}` },
      { type: "output", text: output }
    ]);
    setInput("");
  };

  return (
    <div className="gov-terminal-window">
      <div className="gov-terminal-header">
        <span>GOV-Terminal</span>
        <button className="gov-terminal-close" onClick={onClose}>×</button>
      </div>
      <div className="gov-terminal-body" ref={scrollRef}>
        {history.map((entry, i) => (
          <div key={i} className={`gov-terminal-${entry.type}`}>{entry.text}</div>
        ))}
        {!closed && (
          <form className="gov-terminal-form" onSubmit={handleCommand}>
            <span className="gov-terminal-prompt">{DEFAULT_PROMPT}</span>
            <input
              ref={inputRef}
              className="gov-terminal-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              autoComplete="off"
              disabled={closed}
            />
          </form>
        )}
      </div>
    </div>
  );
}

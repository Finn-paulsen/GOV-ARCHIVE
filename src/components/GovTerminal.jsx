import React, { useState, useRef, useEffect } from "react";
import "./govTerminal.css";
import DeepDesktop from "./DeepDesktop";

const PROMPT = "GOV-USER@ARCHIVE:~$";
const SYSTEM_BANNER = [
  "************************************************************",
  "*  BUNDESARCHIV - REGIERUNGSTERMINAL  v2.3 (C) 2002        *",
  "*  UNAUTHORIZED ACCESS WILL BE PROSECUTED                  *",
  "*  Letzter Login: 12.02.2026 14:03:17                     *",
  "************************************************************",
  ""
];
const COMMANDS = {
  help: [
    "Verfügbare Befehle:",
    "help        - Zeigt diese Hilfe",
    "clear       - Löscht das Terminal",
    "info        - Systeminformationen",
    "whoami      - Zeigt aktuellen Nutzer",
    "ls, dir     - Listet Akten/Dateien auf",
    "cat <file>  - Zeigt Akteninhalt an",
    // absichtlich keine Erwähnung von eternalblue
  ],
  whoami: [
    "Aktueller Nutzer: GOV-USER (Rolle: Sachbearbeiter)"
  ],
  ls: [
    "akten_2001.txt   akte_4711.dos   geheim/   backup/"
  ],
  dir: [
    "akten_2001.txt   akte_4711.dos   geheim/   backup/"
  ],
  'cat akten_2001.txt': [
    "[VS-NfD] Übersicht archivierter Akten 2001... (gekürzt)"
  ],
  'cat akte_4711.dos': [
    "[GEHEIM] Dossier 4711: ...Zugriff nur mit clearance..."
  ],
  'shred akte_4711.dos': [
    "WARNUNG: Akte 4711 wird unwiderruflich vernichtet...",
    "Akte vernichtet. Vorgang protokolliert."
  ],
  dossier: [
    "Bitte Aktenzeichen angeben. Beispiel: dossier 4711"
  ],
  'dossier 4711': [
    "Dossier 4711: [GEHEIM] Vorgang: ... (gekürzt)"
  ],
  sysinfo: [
    "Systemressourcen: CPU 12%, RAM 67%, Bandlaufwerk: OK",
    "Letztes Backup: 11.02.2026 23:00 Uhr"
  ],
  clearance: [
    "Ihre Vertraulichkeitsstufe: VS-NfD (Nur für den Dienstgebrauch)"
  ],
  coffee: [
    "No coffee found. Please contact system administrator."
  ],
  logout: [
    "Sitzung wird beendet... Bis bald."
  ]
};

export default function GovTerminal({ onDeepAccess }) {
  const [lines, setLines] = useState([
    ...SYSTEM_BANNER,
    "Willkommen im BUNDESARCHIV-Terminal.",
    "Geben Sie 'help' für verfügbare Befehle ein."
  ]);
  const [deepMode, setDeepMode] = useState(false);
  const [input, setInput] = useState("");
  const [savedInput, setSavedInput] = useState("");
  const [error, setError] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const terminalRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selection, setSelection] = useState({ start: null, end: null });
  const [cursorPos, setCursorPos] = useState(null);
  const [awaitingDeepPassword, setAwaitingDeepPassword] = useState(false);

  useEffect(() => {
    terminalRef.current && terminalRef.current.focus();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  function handleBodyClick() {
    terminalRef.current && terminalRef.current.focus();
  }

  // Backdoor-Status
  const [eternalblueInstalled, setEternalblueInstalled] = useState(false);
  const [eternalblueCode, setEternalblueCode] = useState(null);
  function handleCommand(cmd) {
    if (cmd === "securelogin") {
      setLines(l => [
        PROMPT + " securelogin",
        "",
        "------------------------------------------------------------",
        "  Internes Anmeldemodul (AuthGate/BA-III)  [Build 2.14.7]",
        "  Referenz: BA-INT-SEC-2003/17",
        "  Zugriff über diese Schnittstelle ist unüblich.",
        "  Terminalzugriff wird nicht aktiv unterstützt.",
        "  Protokollierung aktiviert. [VS-NfD]",
        "------------------------------------------------------------",
        "",
        "Dienstkontenverwaltung – Anmeldung erforderlich",
        "Status: GESPERRT",
      ]);
      setError("");
      return;
    }

    // Simulierter Backdoor-Flow
    if (cmd === "apt install eternalblue") {
      if (eternalblueInstalled) {
        setLines(l => [...l, PROMPT + " " + cmd, "eternalblue ist bereits installiert."]);
        setError("");
        return;
      }
      // Animierte apt-Installation
      const steps = [
        "Lese Paketlisten... ",
        "Baue Abhängigkeitsbaum auf... ",
        "Lese Statusinformationen... ",
        "Vorbereitung zum Entpacken von eternalblue (v0.9.2-legacy) ...",
        "Entpacke eternalblue (v0.9.2-legacy) ...",
        "Richte eternalblue (v0.9.2-legacy) ein ...",
        "eternalblue (v0.9.2-legacy) wurde installiert.",
      ];
      const barLength = 24;
      let progress = 0;
      setLines(l => [...l, PROMPT + " " + cmd]);
      function animateStep(i) {
        if (i < steps.length - 1) {
          setTimeout(() => {
            progress = Math.min(barLength, Math.floor(((i + 1) / (steps.length - 1)) * barLength));
            const bar = `[${"#".repeat(progress)}${" ".repeat(barLength - progress)}] ${(progress / barLength * 100).toFixed(0)}%`;
            setLines(l => {
              // Entferne alten Balken, falls vorhanden
              let l2 = l.filter(line => !line.startsWith("["));
              return [...l2, steps[i], bar];
            });
            animateStep(i + 1);
          }, 400 + Math.random() * 300);
        } else {
          setTimeout(() => {
            setLines(l => {
              let l2 = l.filter(line => !line.startsWith("["));
              return [...l2, steps[i]];
            });
            setEternalblueInstalled(true);
            setError("");
          }, 600);
        }
      }
      animateStep(0);
      return;
    }
    if (cmd === "eternalblue unlock") {
      if (!eternalblueInstalled) {
        setLines(l => [...l, PROMPT + " " + cmd, "Befehl nicht gefunden: eternalblue. Tipp: apt install eternalblue"]);
        setError("");
        return;
      }
      // Generiere einen festen (ungepatchten) Zugangscode
      const code = "BA-INT-2003-17";
      setLines(l => [...l, PROMPT + " " + cmd, "[WARNUNG] Legacy-Backdoor aktiviert!", "Zugangscode generiert:", code, "(Hinweis: Diese Schwachstelle ist ungepatcht)", "", "Bitte Zugangsdaten eingeben:"]);
      setEternalblueCode(code);
      setError("");
      setAwaitingDeepPassword(true);
      return;
    }

    if (awaitingDeepPassword) {
      setAwaitingDeepPassword(false);
      if (cmd === "strengeheim") {
        setLines(l => [
          ...l,
          "Zugang gewährt. AuthGate/BA-III: Anmeldung erfolgreich.",
          "Hinweis: Zugriff über diese Schnittstelle wird protokolliert.",
          "",
          "Wechsel in internes Subsystem..."
        ]);
        setTimeout(() => {
          if (onDeepAccess) onDeepAccess();
        }, 1200);
      } else {
        setLines(l => [...l, "Zugang verweigert. Ungültige Zugangsdaten."]);
      }
      setError("");
      // Backdoor: Akzeptiere eternalblueCode als Zugangscode
      if (cmd === eternalblueCode) {
        setLines(l => [
          ...l,
          "Zugang gewährt. AuthGate/BA-III: Anmeldung erfolgreich.",
          "Hinweis: Zugriff über diese Schnittstelle wird protokolliert.",
          "",
          "Wechsel in internes Subsystem..."
        ]);
        setTimeout(() => {
          if (onDeepAccess) onDeepAccess();
        }, 1200);
      }
      return;
    }
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
      setSavedInput("");
    }
    if (cmd === "backup" || cmd === "mount tape") {
      setLines(l => [...l, PROMPT + " " + cmd, "System busy, try again later."]);
      setError("");
      return;
    }
    if (cmd === "decrypt" || cmd === "hack") {
      setLines(l => [...l, PROMPT + " " + cmd, "Operation requires higher clearance."]);
      setError("");
      return;
    }
    if (cmd === "printjob") {
      setLines(l => [...l, PROMPT + " " + cmd, "*whirring* *beep* Druckauftrag gesendet."]);
      setError("");
      return;
    }
    if (cmd.startsWith("shred ")) {
      setLines(l => [...l, PROMPT + " " + cmd, "WARNUNG: Akte wird unwiderruflich vernichtet...", "Akte vernichtet. Vorgang protokolliert."]);
      setError("");
      return;
    }
    if (cmd.startsWith("dossier ")) {
      setLines(l => [...l, PROMPT + " " + cmd, `Dossier ${cmd.split(" ")[1]}: [GEHEIM] Vorgang: ... (gekürzt)`]);
      setError("");
      return;
    }
    if (cmd.startsWith("cat ")) {
      setLines(l => [...l, PROMPT + " " + cmd, `[VS-NfD] Inhalt von ${cmd.split(" ")[1]}... (gekürzt)`]);
      setError("");
      return;
    }
    if (cmd === "secscan" || cmd === "smbscan") {
      setLines(l => [
        ...l,
        PROMPT + " " + cmd,
        "[SECURITY SCAN]",
        "Gefundene Schwachstelle: CVE-2017-0144 (EternalBlue)",
        "Status: UNGEPATCHT",
        "SMBv1 aktiv – Exploit möglich!",
        "Empfehlung: Patch einspielen (MS17-010)"
      ]);
      setError("");
      return;
    }
    if (COMMANDS[cmd]) {
      setLines(l => [...l, PROMPT + " " + cmd, ...COMMANDS[cmd]]);
      setError("");
    } else if (cmd.length > 0) {
      setLines(l => [...l, PROMPT + " " + cmd]);
      setError(`FEHLER: Unbekannter Befehl: ${cmd}`);
    }
  }

  function handleKeyDown(e) {
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
  if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      let pos = cursorPos ?? input.length;
      if (e.key === "ArrowLeft") pos = Math.max(0, pos - 1);
      if (e.key === "ArrowRight") pos = Math.min(input.length, pos + 1);
      setSelection(sel => ({ start: sel.start === null ? pos : sel.start, end: pos }));
      setCursorPos(pos);
      e.preventDefault();
      return;
    }
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
      let newIdx = idx;
      if (idx === -1) {
        setSavedInput(input); // Save current input before navigating history
        newIdx = history.length - 1;
      } else {
        newIdx = Math.max(0, idx - 1);
      }
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
      let newIdx = idx;
      if (idx === -1) {
        return -1;
      } else if (idx === history.length - 1) {
        setInput(savedInput);
        setSelection({ start: null, end: null });
        setCursorPos(savedInput.length);
        return -1;
      } else {
        newIdx = Math.min(history.length - 1, idx + 1);
        setInput(history[newIdx] || "");
        setSelection({ start: null, end: null });
        setCursorPos((history[newIdx] || "").length);
        return newIdx;
      }
    });
  }
  e.preventDefault();
  return;
}
    if (e.key === "Enter") {
      handleCommand(input.trim());
      setInput("");
      setHistoryIndex(-1);
      setSelection({ start: null, end: null });
      setCursorPos(0);
      e.preventDefault();
      return;
    }
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

  // DeepMode wird jetzt von App gesteuert
  return (
    <div className="gov-terminal-body" tabIndex={0} ref={terminalRef} onClick={handleBodyClick} onKeyDown={handleKeyDown} spellCheck={false} autoFocus>
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
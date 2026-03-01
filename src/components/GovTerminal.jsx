import React, { useState, useRef, useEffect } from "react";
import "./govTerminal.css";

const PROMPT = "GOV-USER@BARCH-SYS:~$";

// Helper to create typed line objects
function ln(text, type = 'normal') {
  return { text, type };
}

// Completable commands for Tab-Completion
const COMPLETABLE_COMMANDS = [
  "help", "clear", "cls", "whoami", "ls", "dir", "info", "sysinfo",
  "date", "uptime", "status", "netstat", "ps", "ping", "clearance",
  "logout", "dossier", "cat", "shred", "backup", "printjob",
  "secscan", "smbscan", "securelogin", "dbconnect", "exploitlab",
  "apt install eternalblue", "eternalblue unlock",
];

// Helper: find last index matching predicate (no ES2023 required)
function findLastIdx(arr, pred) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i])) return i;
  }
  return -1;
}

// Helper: sleep
const delay = ms => new Promise(r => setTimeout(r, ms));

const SYSTEM_BANNER = [
  ln("************************************************************"),
  ln("*  BUNDESARCHIV - REGIERUNGSTERMINAL  v2.3  [C] 2002      *"),
  ln("*  Unbefugter Zugriff wird gem. §202a StGB verfolgt.      *"),
  ln("*  Letzter Login: 12.02.2026 14:03:17   Terminal: tty1   *"),
  ln("************************************************************"),
  ln(""),
];

export default function GovTerminal({ onDeepAccess, onOpenWindow }) {
  const [lines, setLines] = useState([
    ...SYSTEM_BANNER,
    ln("Willkommen im BUNDESARCHIV-Terminal."),
    ln("Geben Sie 'help' für verfügbare Befehle ein."),
    ln(""),
  ]);
  const [input, setInput] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedInput, setSavedInput] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [selection, setSelection] = useState({ start: null, end: null });

  // Multi-step flow states: null | 'apt-confirm' | 'deep-password'
  const [flowState, setFlowState] = useState(null);
  const [masked, setMasked] = useState(false); // Passwort-Eingabe maskieren

  const [eternalblueInstalled, setEternalblueInstalled] = useState(false);
  const [sequenceRunning, setSequenceRunning] = useState(false);

  const terminalRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-Scroll ans Ende
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [lines]);

  // Cursor-Blinken
  useEffect(() => {
    const iv = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(iv);
  }, []);

  // Fokus beim Öffnen
  useEffect(() => {
    terminalRef.current?.focus();
  }, []);

  // Zeile anhängen (state-funktional, kein Stale-Closure)
  function addLine(text, type = 'normal') {
    setLines(l => [...l, { text, type }]);
  }

  function addLines(newLines) {
    setLines(l => [
      ...l,
      ...newLines.map(nl => typeof nl === 'string' ? ln(nl) : nl),
    ]);
  }

  // Fortschrittsbalken-Zeile in-place ersetzen
  function replaceProgressLine(prefix, newLine) {
    setLines(l => {
      const idx = findLastIdx(l, line => line.text.startsWith(prefix));
      if (idx === -1) return [...l, newLine];
      const result = [...l];
      result[idx] = newLine;
      return result;
    });
  }

  // Tab-Completion
  function handleTab() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const matches = COMPLETABLE_COMMANDS.filter(c => c.startsWith(trimmed));
    if (matches.length === 1) {
      const completed = matches[0];
      setInput(completed + " ");
      setCursorPos(completed.length + 1);
    } else if (matches.length > 1) {
      addLine(PROMPT + " " + input, 'prompt');
      addLine(matches.join("    "), 'dim');
    }
  }

  // APT-Install-Sequenz (async, vollautomatisch — kein Benutzereingabe)
  async function runAptInstall() {
    setSequenceRunning(true);

    // Phase 1: Paketauflösung
    const resolveSteps = [
      { text: "Paketlisten werden gelesen... Fertig", delay: 900 },
      { text: "Abhängigkeitsbaum wird aufgebaut... Fertig", delay: 900 },
      { text: "Statusinformationen werden eingelesen... Fertig", delay: 600 },
      { text: "", delay: 100 },
      { text: "Hinweis: Paket 'eternalblue' ist nicht im offiziellen Repository.", type: 'warning', delay: 400 },
      { text: "WARNUNG: Paket stammt aus nicht vertrauenswürdiger Quelle.", type: 'warning', delay: 500 },
      { text: "WARNUNG: Signaturprüfung fehlgeschlagen.", type: 'warning', delay: 300 },
      { text: "", delay: 200 },
      { text: "Vorgang erfordert erhöhte Systemrechte.", delay: 400 },
      { text: "Privilegienerweiterung wird angefordert...", delay: 800 },
      { text: "[BARCH-SUDO-LAYER] Legacy-Autorisierung aktiv.", delay: 500 },
      { text: "[BARCH-SUDO-LAYER] Berechtigungscode: SUDO-ELVT-7791", delay: 400 },
      { text: "[BARCH-SUDO-LAYER] Erhöhte Rechte erteilt.", type: 'success', delay: 600 },
      { text: "", delay: 200 },
      { text: "Folgende Pakete werden installiert:", delay: 300 },
      { text: "  eternalblue (0.9.2-legacy)  libexploit-common (2.1.4)  python3-payloads (1.0.8)", delay: 300 },
      { text: "Benötigter Speicherplatz: 3,6 MB", delay: 400 },
      { text: "", delay: 200 },
    ];

    for (const step of resolveSteps) {
      addLine(step.text, step.type);
      if (step.delay) await delay(step.delay);
    }

    const downloadSteps = [
      { text: "Hole:1 http://repo.bwarchiv.mil/internal amd64 eternalblue 0.9.2-legacy [1.024 kB]", delay: 700 },
      { text: "Hole:2 http://repo.bwarchiv.mil/internal amd64 libexploit-common 2.1.4 [245 kB]", delay: 700 },
      { text: "Hole:3 http://repo.bwarchiv.mil/internal amd64 python3-payloads 1.0.8 [512 kB]", delay: 700 },
      { text: "1.781 kB in 2 Sekunden heruntergeladen (890 kB/s)", delay: 600 },
    ];

    for (const step of downloadSteps) {
      addLine(step.text);
      await delay(step.delay);
    }

    // Animierter Fortschrittsbalken
    const barLen = 30;
    for (let i = 0; i <= barLen; i++) {
      const pct = Math.floor((i / barLen) * 100);
      const eta = Math.max(0, Math.floor((barLen - i) * 0.28));
      const bar = `Entpacken: [${"#".repeat(i)}${" ".repeat(barLen - i)}] ${pct}%  ETA: ${eta}s`;
      replaceProgressLine("Entpacken:", { text: bar, type: 'normal' });
      await delay(100 + Math.random() * 80);
    }

    const installSteps = [
      { text: "Entpacken von eternalblue (0.9.2-legacy) ...", delay: 450 },
      { text: "Entpacken von libexploit-common (2.1.4) ...", delay: 500 },
      { text: "Entpacken von python3-payloads (1.0.8) ...", delay: 450 },
      { text: "Richte eternalblue (0.9.2-legacy) ein ...", delay: 500 },
      { text: "Richte libexploit-common (2.1.4) ein ...", delay: 450 },
      { text: "Richte python3-payloads (1.0.8) ein ...", delay: 450 },
      { text: "Verarbeite Trigger für man-db (2.8.3-2) ...", delay: 400 },
      { text: "Verarbeite Trigger für libc-bin (2.31-0) ...", delay: 400 },
      { text: "", delay: 200 },
      { text: "Installation erfolgreich abgeschlossen.", type: 'success', delay: 100 },
      { text: "", delay: 50 },
      { text: "Installierte Pakete:", delay: 50 },
      { text: "  eternalblue         0.9.2-legacy", delay: 50 },
      { text: "  libexploit-common   2.1.4", delay: 50 },
      { text: "  python3-payloads    1.0.8", delay: 200 },
      { text: "", delay: 50 },
      { text: "Verwenden Sie 'eternalblue unlock' zum Aktivieren.", delay: 50 },
    ];

    for (const step of installSteps) {
      addLine(step.text, step.type);
      if (step.delay) await delay(step.delay);
    }

    setEternalblueInstalled(true);
    setSequenceRunning(false);
  }

  function handleCommand(cmd) {
    const trimmed = cmd.trim();

    // ── FLOW: Deep-Password ───────────────────────────────────
    if (flowState === 'deep-password') {
      setFlowState(null);
      setMasked(false);
      // Passwort-Echo maskiert anzeigen
      addLine(PROMPT + " " + "●".repeat(trimmed.length), 'prompt');
      if (trimmed === "strengeheim") {
        addLines([
          ln("Zugang gewährt."),
          ln("Hinweis: Zugriff über diese Schnittstelle wird protokolliert.", 'dim'),
          ln(""),
          ln("Wechsel in internes Subsystem...", 'dim'),
        ]);
        setTimeout(() => onDeepAccess?.(), 1400);
      } else {
        addLine("Zugang verweigert. Ungültige Zugangsdaten.", 'error');
      }
      return;
    }

    // ── Normales Befehls-Echo ─────────────────────────────────
    if (trimmed.length > 0) {
      addLine(PROMPT + " " + trimmed, 'prompt');
      setHistory(h => [...h, trimmed]);
      setHistoryIndex(-1);
      setSavedInput("");
    }

    if (!trimmed) return;

    // ── BEFEHLE ───────────────────────────────────────────────

    if (trimmed === "clear" || trimmed === "cls") {
      setLines([]);
      return;
    }

    if (trimmed === "help") {
      addLines([
        ln("Verfügbare Befehle:"),
        ln(""),
        ln("  help            Zeigt diese Hilfe"),
        ln("  clear           Löscht den Bildschirm"),
        ln("  info            Systeminformationen"),
        ln("  whoami          Aktuelle Benutzersitzung"),
        ln("  ls / dir        Verzeichnisinhalt"),
        ln("  cat <datei>     Dateiinhalt anzeigen"),
        ln("  date            Aktuelles Systemdatum"),
        ln("  uptime          Systemlaufzeit"),
        ln("  status          Systemstatus"),
        ln("  netstat         Netzwerkverbindungen"),
        ln("  ps              Aktive Prozesse"),
        ln("  ping <host>     Verbindungstest"),
        ln("  dossier <nr>    Akte abrufen"),
        ln("  shred <datei>   Datei sicher löschen"),
        ln("  clearance       Sicherheitsfreigabe anzeigen"),
        ln("  logout          Sitzung beenden"),
        ln(""),
        ln("  [Tab]           Befehl vervollständigen", 'dim'),
        ln("  [Pfeil hoch]    Befehlshistorie", 'dim'),
        ln(""),
      ]);
      return;
    }

    if (trimmed === "whoami") {
      addLines([
        ln("Benutzerkonto  : GOV-USER"),
        ln("Rolle          : Sachbearbeiter (Klasse II)"),
        ln("Abteilung      : Archiv / Dokumentenverwaltung"),
        ln("Sicherheitsstufe: VS-NfD"),
        ln("Sitzungs-ID    : SID-" + Math.random().toString(36).slice(2, 10).toUpperCase()),
      ]);
      return;
    }

    if (trimmed === "ls" || trimmed === "dir") {
      addLines([
        ln("Inhalt von /home/gov-user:"),
        ln(""),
        ln("  [VERZ]  geheim/              Klasse: VS-GEHEIM"),
        ln("  [VERZ]  backup/              Letzte Sicherung: 11.02.2026"),
        ln("  [DATEI] akten_2001.txt       VS-NfD    18.432 Bytes"),
        ln("  [DATEI] akte_4711.dos        GEHEIM     4.096 Bytes"),
        ln("  [DATEI] systemlog_jan.txt    VS-NfD    92.160 Bytes"),
        ln(""),
      ]);
      return;
    }

    if (trimmed === "date") {
      const d = new Date();
      addLine(
        `Systemdatum: ${d.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${d.toLocaleTimeString('de-DE')}`
      );
      return;
    }

    if (trimmed === "uptime") {
      addLine("Systemlaufzeit: 14 Tage, 7 Stunden, 23 Minuten.   Last: 0.12, 0.08, 0.05");
      return;
    }

    if (trimmed === "status") {
      addLines([
        ln("Systemstatus"),
        ln("────────────────────────────────────────"),
        ln("  BARCH-CORE       aktiv"),
        ln("  ARCH-DB          aktiv"),
        ln("  NET-MON          aktiv"),
        ln("  BACKUP-SVC       wartet"),
        ln("  Bandlaufwerk     bereit"),
        ln("  Netzwerk         verbunden (LAN, 100 Mbit)"),
        ln("  Letzte Sicherung 11.02.2026  23:00 Uhr"),
        ln("────────────────────────────────────────"),
      ]);
      return;
    }

    if (trimmed === "info" || trimmed === "sysinfo") {
      addLines([
        ln("Systeminformationen"),
        ln("────────────────────────────────────────"),
        ln("  Hostname      BARCH-SYS-04"),
        ln("  Betriebssys.  BARCH/OS 3.1  (Kernel 2.4.20)"),
        ln("  CPU           Intel Pentium III, 733 MHz"),
        ln("  Arbeitsspeicher  512 MB  (Auslastung: 67%)"),
        ln("  Festplatte    /dev/hda  40 GB  (Frei: 12,4 GB)"),
        ln("  Bandlaufwerk  DAT-72, bereit"),
        ln("────────────────────────────────────────"),
      ]);
      return;
    }

    if (trimmed === "netstat") {
      addLines([
        ln("Aktive Netzwerkverbindungen"),
        ln("──────────────────────────────────────────────────────────"),
        ln("  Proto  Lokal                 Remote               Status"),
        ln("  TCP    0.0.0.0:22            0.0.0.0:*            LISTEN"),
        ln("  TCP    0.0.0.0:445           0.0.0.0:*            LISTEN"),
        ln("  TCP    10.0.0.4:22           10.0.0.1:52841       HERGESTELLT"),
        ln("  TCP    10.0.0.4:445          10.0.0.1:49234       HERGESTELLT"),
        ln("──────────────────────────────────────────────────────────"),
      ]);
      return;
    }

    if (trimmed === "ps") {
      addLines([
        ln("Aktive Prozesse"),
        ln("──────────────────────────────────────────────"),
        ln("  PID    Nutzer      Befehl"),
        ln("  1      root        /sbin/init"),
        ln("  347    root        syslogd"),
        ln("  391    root        klogd"),
        ln("  402    root        crond"),
        ln("  514    root        sshd"),
        ln("  1203   gov-user    bash"),
        ln("  1247   gov-user    govterm"),
        ln("──────────────────────────────────────────────"),
      ]);
      return;
    }

    if (trimmed.startsWith("ping ")) {
      const host = trimmed.slice(5).trim();
      addLine(`PING ${host}: 56 Datenbytes`);
      setTimeout(() => addLine(`64 Bytes von ${host}: icmp_seq=0 ttl=64 Zeit=1.23 ms`), 700);
      setTimeout(() => addLine(`64 Bytes von ${host}: icmp_seq=1 ttl=64 Zeit=0.89 ms`), 1400);
      setTimeout(() => addLine(`64 Bytes von ${host}: icmp_seq=2 ttl=64 Zeit=1.01 ms`), 2100);
      setTimeout(() => addLine(`--- ${host} Statistik ---`), 2500);
      setTimeout(() => addLine("Pakete: Gesendet=3, Erhalten=3, Verloren=0 (0% Verlust)"), 2600);
      return;
    }

    if (trimmed === "clearance") {
      addLines([
        ln("Vertraulichkeitsstufe : VS-NfD (Nur für den Dienstgebrauch)"),
        ln("Zugriffsebene          : II von V"),
        ln("Letzte Überprüfung     : 01.09.2025"),
        ln("Nächste Überprüfung    : 01.09.2026"),
      ]);
      return;
    }

    if (trimmed === "logout") {
      addLines([
        ln("Sitzung wird beendet..."),
        ln("Auf Wiedersehen.", 'dim'),
      ]);
      return;
    }

    if (trimmed === "printjob") {
      addLine("*Rattern* *Piep* – Druckauftrag an DRUCKER-03 gesendet.");
      return;
    }

    if (trimmed === "backup" || trimmed === "mount tape") {
      addLine("System ausgelastet. Bitte später erneut versuchen.", 'warning');
      return;
    }

    if (trimmed === "decrypt" || trimmed === "hack") {
      addLine("Vorgang erfordert höhere Sicherheitsfreigabe.", 'error');
      return;
    }

    if (trimmed.startsWith("shred ")) {
      const file = trimmed.slice(6).trim();
      addLine(`WARNUNG: Datei '${file}' wird unwiderruflich vernichtet...`, 'warning');
      setTimeout(() => {
        addLine(`Datei '${file}' wurde sicher überschrieben (7-Pass DoD 5220.22-M).`, 'success');
        addLine("Vorgang wurde protokolliert.");
      }, 1200);
      return;
    }

    if (trimmed.startsWith("dossier ")) {
      const nr = trimmed.slice(8).trim();
      addLines([
        ln(`Dossier ${nr}`),
        ln("────────────────────────────────"),
        ln("[GEHEIM] Klassifizierte Inhalte."),
        ln("Vollständiger Zugriff erfordert Clearance-Stufe III.", 'warning'),
      ]);
      return;
    }

    if (trimmed.startsWith("cat ")) {
      const file = trimmed.slice(4).trim();
      addLines([
        ln(`[VS-NfD] Inhalt von '${file}':`),
        ln("────────────────────────────────"),
        ln("... (Inhalte für Clearance-Stufe II teilweise geschwärzt) ..."),
      ]);
      return;
    }

    if (trimmed === "secscan" || trimmed === "smbscan") {
      addLines([
        ln("[SICHERHEITSSCAN]"),
        ln("────────────────────────────────────────"),
        ln("Gefundene Schwachstelle : CVE-2017-0144"),
        ln("Betroffenes Protokoll   : SMBv1"),
        ln("Status                  : UNGEPATCHT", 'warning'),
        ln("Empfehlung              : Patch MS17-010 unverzüglich einspielen"),
        ln("────────────────────────────────────────"),
      ]);
      return;
    }

    if (trimmed === "securelogin") {
      addLines([
        ln(""),
        ln("────────────────────────────────────────────────────────────"),
        ln("  Internes Anmeldemodul (AuthGate/BA-III)  [Build 2.14.7]"),
        ln("  Referenz: BA-INT-SEC-2003/17"),
        ln("  Terminalzugriff wird nicht aktiv unterstützt."),
        ln("  Protokollierung aktiviert. [VS-NfD]"),
        ln("────────────────────────────────────────────────────────────"),
        ln(""),
        ln("Dienstkontenverwaltung – Status: GESPERRT"),
        ln(""),
      ]);
      return;
    }

    // ── apt install eternalblue ───────────────────────────────
    if (trimmed === "apt install eternalblue") {
      if (eternalblueInstalled) {
        addLine("eternalblue ist bereits installiert. Version: 0.9.2-legacy");
        return;
      }
      runAptInstall();
      return;
    }

    // ── eternalblue unlock ────────────────────────────────────
    if (trimmed === "eternalblue unlock") {
      if (!eternalblueInstalled) {
        addLine("Befehl nicht gefunden: eternalblue.  Hinweis: apt install eternalblue", 'error');
        return;
      }
      addLines([
        ln(""),
        ln("[WARNUNG] Legacy-Backdoor wird aktiviert.", 'warning'),
        ln("Generierter Zugangscode: BA-INT-2003-17"),
        ln("Hinweis: Diese Schwachstelle ist ungepatcht.", 'dim'),
        ln(""),
        ln("Zugangsdaten eingeben:"),
      ]);
      setMasked(true);
      setFlowState('deep-password');
      return;
    }

    // ── dbconnect ─────────────────────────────────────────────
    if (trimmed === "dbconnect" || trimmed === "db-connect") {
      addLines([
        ln("Initialisiere Datenbankverbindung..."),
        ln("Suche verfügbare SQL-Server im Netzwerk..."),
        ln("Gefunden: POLIZEI-DB-NRW  (192.168.1.247:1433)"),
        ln("Öffne Datenbank-Browser..."),
      ]);
      setTimeout(() => onOpenWindow?.('database'), 1500);
      return;
    }

    // ── exploitlab ────────────────────────────────────────────
    if (trimmed === "exploitlab" || trimmed === "exploit-lab") {
      addLines([
        ln("Starte Analyseumgebung..."),
        ln("Lade Vorlagen..."),
        ln("Öffne Exploit-Labor..."),
      ]);
      setTimeout(() => onOpenWindow?.('exploitlab'), 1500);
      return;
    }

    // ── Unbekannter Befehl ────────────────────────────────────
    addLine(`${trimmed}: Befehl nicht gefunden. Geben Sie 'help' für eine Übersicht ein.`, 'error');
  }

  function handleKeyDown(e) {
    // Tab-Completion
    if (e.key === "Tab") {
      e.preventDefault();
      if (!sequenceRunning) handleTab();
      return;
    }

    // Ctrl+C: Selektion kopieren
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      if (selection.start !== null && selection.end !== null && selection.start !== selection.end) {
        const sel = input.slice(
          Math.min(selection.start, selection.end),
          Math.max(selection.start, selection.end)
        );
        navigator.clipboard.writeText(sel);
      }
      e.preventDefault();
      return;
    }

    // Ctrl+V: Einfügen
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

    // Shift+Pfeil: Selektion
    if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      let pos = cursorPos ?? input.length;
      if (e.key === "ArrowLeft") pos = Math.max(0, pos - 1);
      if (e.key === "ArrowRight") pos = Math.min(input.length, pos + 1);
      setSelection(sel => ({ start: sel.start === null ? pos : sel.start, end: pos }));
      setCursorPos(pos);
      e.preventDefault();
      return;
    }

    // Pfeil: Cursor bewegen
    if (!e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      let pos = cursorPos ?? input.length;
      if (e.key === "ArrowLeft") pos = Math.max(0, pos - 1);
      if (e.key === "ArrowRight") pos = Math.min(input.length, pos + 1);
      setSelection({ start: null, end: null });
      setCursorPos(pos);
      e.preventDefault();
      return;
    }

    // Pfeil hoch: Historie
    if (e.key === "ArrowUp") {
      if (history.length > 0) {
        setHistoryIndex(idx => {
          let newIdx = idx;
          if (idx === -1) {
            setSavedInput(input);
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

    // Pfeil runter: Historie
    if (e.key === "ArrowDown") {
      if (history.length > 0) {
        setHistoryIndex(idx => {
          if (idx === -1) return -1;
          if (idx === history.length - 1) {
            setInput(savedInput);
            setSelection({ start: null, end: null });
            setCursorPos(savedInput.length);
            return -1;
          }
          const newIdx = Math.min(history.length - 1, idx + 1);
          setInput(history[newIdx] || "");
          setSelection({ start: null, end: null });
          setCursorPos((history[newIdx] || "").length);
          return newIdx;
        });
      }
      e.preventDefault();
      return;
    }

    // Enter: Befehl ausführen
    if (e.key === "Enter") {
      if (!sequenceRunning || flowState) {
        handleCommand(input.trim());
        setInput("");
        setHistoryIndex(-1);
        setSelection({ start: null, end: null });
        setCursorPos(0);
      }
      e.preventDefault();
      return;
    }

    // Backspace
    if (e.key === "Backspace") {
      const pos = cursorPos ?? input.length;
      if (pos > 0) {
        setInput(i => i.slice(0, pos - 1) + i.slice(pos));
        setCursorPos(pos - 1);
      }
      setSelection({ start: null, end: null });
      e.preventDefault();
      return;
    }

    // Normales Zeichen eingeben
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
      const pos = cursorPos ?? input.length;
      setInput(i => i.slice(0, pos) + e.key + i.slice(pos));
      setHistoryIndex(-1);
      setSelection({ start: null, end: null });
      setCursorPos(pos + 1);
      e.preventDefault();
      return;
    }
  }

  // Eingabezeile rendern (mit Masking und Selektion)
  function renderInputDisplay() {
    const selActive =
      selection.start !== null &&
      selection.end !== null &&
      selection.start !== selection.end;
    const pos = cursorPos ?? input.length;
    const display = masked ? "●".repeat(input.length) : input;

    const selMin = selActive ? Math.min(selection.start, selection.end) : pos;
    const selMax = selActive ? Math.max(selection.start, selection.end) : pos;

    const left = display.slice(0, selActive ? selMin : pos);
    const sel = selActive ? display.slice(selMin, selMax) : "";
    const right = selActive ? display.slice(selMax) : display.slice(pos);

    return (
      <>
        {left}
        {selActive && <span className="gov-terminal-selection">{sel}</span>}
        <span className={"gov-terminal-cursor" + (cursorVisible ? "" : " gov-terminal-cursor-hide")} />
        {right}
      </>
    );
  }

  return (
    <div
      className="gov-terminal-body"
      tabIndex={0}
      ref={terminalRef}
      onClick={() => terminalRef.current?.focus()}
      onKeyDown={handleKeyDown}
      spellCheck={false}
    >
      {lines.map((lineObj, idx) => (
        <div
          key={idx}
          className={`gov-terminal-line gov-terminal-line--${lineObj.type || 'normal'}`}
        >
          {lineObj.text}
        </div>
      ))}

      <div className="gov-terminal-input-row">
        <span className="gov-terminal-prompt">{PROMPT}</span>
        <span className="gov-terminal-input-sim">{renderInputDisplay()}</span>
      </div>

      {/* Anker für Auto-Scroll */}
      <div ref={bottomRef} />
    </div>
  );
}

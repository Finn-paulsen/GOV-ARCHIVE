import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DatabaseBrowser.css';

// Simulated police database with realistic records
const POLICE_DATABASE = {
  name: "POLIZEI-DB-NRW",
  tables: [
    {
      name: "PERSONEN",
      columns: ["ID", "NAME", "GEBURTSDATUM", "ADRESSE", "STATUS", "AKTENZEICHEN"],
      rows: [
        ["P-2024-001", "Müller, Hans", "15.03.1985", "Hauptstr. 42, 50667 Köln", "GESUCHT", "AZ-K-2024-1547"],
        ["P-2024-002", "Schmidt, Anna", "22.07.1990", "Bahnhofstr. 18, 40210 Düsseldorf", "ÜBERWACHT", "AZ-D-2024-892"],
        ["P-2024-003", "Weber, Thomas", "08.11.1978", "Parkweg 7, 45127 Essen", "VERDÄCHTIG", "AZ-E-2024-2341"],
        ["P-2024-004", "Fischer, Julia", "30.01.1995", "Marktplatz 3, 44135 Dortmund", "BEOBACHTET", "AZ-DO-2024-678"],
        ["P-2024-005", "Meyer, Klaus", "17.09.1982", "Rheinufer 55, 53111 Bonn", "HAFTBEFEHL", "AZ-BN-2024-4892"],
        ["P-2024-006", "Becker, Sarah", "04.06.1988", "Lindenallee 12, 40477 Düsseldorf", "ZEUGE", "AZ-D-2024-1103"],
        ["P-2024-007", "Hoffmann, Peter", "26.12.1976", "Waldstr. 89, 50823 Köln", "VERDÄCHTIG", "AZ-K-2024-3456"],
        ["P-2024-008", "Koch, Maria", "11.04.1993", "Bergweg 23, 42103 Wuppertal", "ÜBERWACHT", "AZ-W-2024-789"],
      ]
    },
    {
      name: "FAHNDUNGEN",
      columns: ["ID", "PERSON_ID", "DELIKT", "DATUM", "PRIORITY", "DETAILS"],
      rows: [
        ["F-001", "P-2024-001", "Betrug", "2024-01-15", "HOCH", "Versicherungsbetrug, Schaden: €45.000"],
        ["F-002", "P-2024-005", "Körperverletzung", "2024-02-03", "MITTEL", "Schwere Körperverletzung, Täter flüchtig"],
        ["F-003", "P-2024-003", "Diebstahl", "2024-01-28", "NIEDRIG", "Ladendiebstahl, Serientäter"],
        ["F-004", "P-2024-007", "Cyberkriminalität", "2024-02-12", "SEHR HOCH", "Datendiebstahl, Firmennetzwerk kompromittiert"],
      ]
    },
    {
      name: "AKTEN",
      columns: ["AKTENZEICHEN", "BETREFF", "ERSTELLT", "STATUS", "KLASSIFIZIERUNG"],
      rows: [
        ["AZ-K-2024-1547", "Ermittlung Versicherungsbetrug GmbH", "2024-01-10", "OFFEN", "VERTRAULICH"],
        ["AZ-D-2024-892", "Observation Verdacht Geldwäsche", "2024-01-20", "LAUFEND", "GEHEIM"],
        ["AZ-E-2024-2341", "Seriendiebstahl Einzelhandel", "2024-01-15", "OFFEN", "INTERN"],
        ["AZ-DO-2024-678", "Zeuge Bankraub Hauptfiliale", "2024-02-01", "ABGESCHLOSSEN", "VERTRAULICH"],
        ["AZ-BN-2024-4892", "Körperverletzung mit Todesfolge", "2024-02-03", "HAFTBEFEHL ERLASSEN", "STRENG GEHEIM"],
      ]
    }
  ]
};

export default function DatabaseBrowser({ onClose }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [log, setLog] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  useEffect(() => {
    // Auto-connect on mount
    handleConnect();
  }, []);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [...prev, { timestamp, message, type }]);
  };

  const handleConnect = () => {
    setConnecting(true);
    addLog('Verbindung wird hergestellt...', 'info');
    
    setTimeout(() => {
      addLog('TCP-Verbindung zu 192.168.1.247:1433 aufgebaut', 'success');
      setTimeout(() => {
        addLog('Authentifizierung mit gestohlenen Credentials...', 'info');
        setTimeout(() => {
          addLog('SQL Server Version: Microsoft SQL Server 2019 (RTM) - 15.0.2000.5', 'success');
          addLog('Datenbankzugriff gewährt: POLIZEI-DB-NRW', 'success');
          addLog('WARNUNG: Unbefugter Zugriff wird protokolliert!', 'warning');
          setConnected(true);
          setConnecting(false);
        }, 800);
      }, 600);
    }, 1000);
  };

  const handleExecuteQuery = () => {
    if (!query.trim()) {
      addLog('Fehler: Leere Abfrage', 'error');
      return;
    }

    addLog(`Ausführen: ${query}`, 'info');
    
    // Simple query parser
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('select * from personen')) {
      const table = POLICE_DATABASE.tables.find(t => t.name === 'PERSONEN');
      setResults(table);
      addLog(`${table.rows.length} Datensätze gefunden`, 'success');
    } else if (lowerQuery.includes('select * from fahndungen')) {
      const table = POLICE_DATABASE.tables.find(t => t.name === 'FAHNDUNGEN');
      setResults(table);
      addLog(`${table.rows.length} Datensätze gefunden`, 'success');
    } else if (lowerQuery.includes('select * from akten')) {
      const table = POLICE_DATABASE.tables.find(t => t.name === 'AKTEN');
      setResults(table);
      addLog(`${table.rows.length} Datensätze gefunden`, 'success');
    } else if (lowerQuery.includes('show tables')) {
      setResults({
        name: 'TABLES',
        columns: ['TABLE_NAME', 'ROWS'],
        rows: POLICE_DATABASE.tables.map(t => [t.name, t.rows.length.toString()])
      });
      addLog('Tabellenliste abgerufen', 'success');
    } else {
      addLog('Fehler: Unbekannte SQL-Syntax', 'error');
    }
  };

  const handleQuickQuery = (tableName) => {
    const table = POLICE_DATABASE.tables.find(t => t.name === tableName);
    if (table) {
      setQuery(`SELECT * FROM ${tableName}`);
      setResults(table);
      setSelectedTable(tableName);
      addLog(`Tabelle ${tableName} geladen - ${table.rows.length} Einträge`, 'success');
    }
  };

  const handleExportSelected = () => {
    if (selectedRows.size === 0) {
      addLog('Keine Zeilen ausgewählt', 'error');
      return;
    }

    addLog(`Exportiere ${selectedRows.size} Datensätze...`, 'info');
    
    setTimeout(() => {
      const filename = `polizei_export_${Date.now()}.txt`;
      addLog(`Datei erstellt: ${filename}`, 'success');
      addLog(`Speicherort: /home/user/downloads/${filename}`, 'success');
      addLog('Export abgeschlossen - Daten wurden in Ihr Dateisystem kopiert', 'success');
      
      // Simulate file system addition (would integrate with FileExplorer)
      const exportData = Array.from(selectedRows).map(idx => {
        if (results && results.rows[idx]) {
          return results.rows[idx].join(' | ');
        }
        return '';
      }).join('\n');
      
      console.log('Exported data:', exportData);
    }, 1500);
  };

  const toggleRowSelection = (idx) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(idx)) {
      newSelection.delete(idx);
    } else {
      newSelection.add(idx);
    }
    setSelectedRows(newSelection);
  };

  return (
    <div className="database-browser xp-window-content">
      <div className="db-toolbar">
        <button 
          className="xp-button" 
          onClick={handleConnect} 
          disabled={connected || connecting}
        >
          {connecting ? '🔄 Verbinden...' : connected ? '✓ Verbunden' : '🔌 Verbinden'}
        </button>
        <div className="db-status">
          <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></span>
          <span>{connected ? 'POLIZEI-DB-NRW (192.168.1.247)' : 'Nicht verbunden'}</span>
        </div>
      </div>

      <div className="db-main">
        <div className="db-sidebar xp-panel">
          <div className="db-section-title">Tabellen</div>
          {POLICE_DATABASE.tables.map(table => (
            <div
              key={table.name}
              className={`db-table-item ${selectedTable === table.name ? 'active' : ''}`}
              onClick={() => handleQuickQuery(table.name)}
            >
              📊 {table.name} ({table.rows.length})
            </div>
          ))}
          
          <div className="db-section-title" style={{ marginTop: 16 }}>Schnellabfragen</div>
          <button className="xp-button" style={{ width: '100%', marginBottom: 4 }} onClick={() => setQuery('SHOW TABLES')}>
            Alle Tabellen
          </button>
          <button className="xp-button" style={{ width: '100%', marginBottom: 4 }} onClick={() => setQuery('SELECT * FROM PERSONEN WHERE STATUS = \'GESUCHT\'')}>
            Gesuchte Personen
          </button>
          <button className="xp-button" style={{ width: '100%', marginBottom: 4 }} onClick={() => setQuery('SELECT * FROM FAHNDUNGEN WHERE PRIORITY = \'SEHR HOCH\'')}>
            Priorität: Sehr Hoch
          </button>
        </div>

        <div className="db-content">
          <div className="db-query-panel xp-groupbox">
            <div className="xp-groupbox-title">SQL Abfrage</div>
            <textarea
              className="xp-textarea db-query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM tablename"
              rows="3"
              disabled={!connected}
            />
            <div className="db-query-actions">
              <button className="xp-button primary" onClick={handleExecuteQuery} disabled={!connected}>
                ▶ Ausführen
              </button>
              <button className="xp-button" onClick={() => setQuery('')}>
                🗑 Löschen
              </button>
              <button 
                className="xp-button" 
                onClick={handleExportSelected}
                disabled={selectedRows.size === 0}
              >
                💾 Export ({selectedRows.size})
              </button>
            </div>
          </div>

          <div className="db-results xp-groupbox">
            <div className="xp-groupbox-title">Ergebnisse</div>
            {results ? (
              <div className="db-table-container xp-scrollbar">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <input 
                          type="checkbox" 
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(new Set(results.rows.map((_, idx) => idx)));
                            } else {
                              setSelectedRows(new Set());
                            }
                          }}
                        />
                      </th>
                      {results.columns.map((col, idx) => (
                        <th key={idx}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.rows.map((row, rowIdx) => (
                      <tr 
                        key={rowIdx} 
                        className={selectedRows.has(rowIdx) ? 'selected' : ''}
                        onClick={() => toggleRowSelection(rowIdx)}
                      >
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedRows.has(rowIdx)}
                            onChange={() => toggleRowSelection(rowIdx)}
                          />
                        </td>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="db-no-results">
                Keine Daten. Führen Sie eine Abfrage aus.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="db-log xp-panel">
        <div className="db-section-title">Aktivitätsprotokoll</div>
        <div className="db-log-content xp-scrollbar">
          {log.map((entry, idx) => (
            <div key={idx} className={`db-log-entry ${entry.type}`}>
              <span className="log-time">[{entry.timestamp}]</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

DatabaseBrowser.propTypes = {
  onClose: PropTypes.func
};

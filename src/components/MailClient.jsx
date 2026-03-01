import React, { useState } from "react";
import './MailClient.css';

const mails = [
  {
    id: '1',
    from: 'Dr. H. Keller',
    fromFull: 'Dr. H. Keller – Ref4B / Archivaufsicht <hkeller@gov.local>',
    subject: 'Archivzugang bestätigt (Ref4B)',
    date: '13.02.2026',
    body: `Sehr geehrte/r Nutzer/in,

Ihr Zugang zum GOV-ARCHIVE wurde durch das Referat 4B (Archivaufsicht) bestätigt.
Bitte beachten Sie die aktuellen Sicherheitsrichtlinien (siehe Anlage).

Mit freundlichen Grüßen
Dr. H. Keller
Ref4B / Archivaufsicht`,
    attachments: ['DOK-SICH-2026-02.pdf'],
  },
  {
    id: '2',
    from: 'M. Schröder',
    fromFull: 'M. Schröder – IT-OPS / Infrastrukturkoordination <mschroeder@gov.local>',
    subject: 'Systemwartung am Wochenende (IT-OPS)',
    date: '12.02.2026',
    body: `Wartungsankündigung (ZK-21)

Das System wird am 15.02.2026 ab 22:00 Uhr gewartet. Archivzugriffe sind währenddessen eingeschränkt.
Bitte sichern Sie Ihre laufenden Arbeiten rechtzeitig.

Mit freundlichen Grüßen
M. Schröder
IT-Betrieb / Infrastrukturkoordination`,
    attachments: ['Protokoll_Ref4B_12-02-2026.pdf'],
  },
  {
    id: '3',
    from: 'A. Weber',
    fromFull: 'A. Weber – Stabsstelle Datenhaltung & Compliance <aweber@gov.local>',
    subject: 'Neue Richtlinie zur Datenarchivierung (StDHK)',
    date: '10.02.2026',
    body: `Ab sofort gilt die Verschlüsselungspflicht für alle archivierten Dokumente (vgl. Anlage).
Bitte setzen Sie die Vorgaben bis spätestens 20.02.2026 um.

Mit freundlichen Grüßen
A. Weber
Stabsstelle Datenhaltung & Compliance (StDHK)`,
    attachments: ['DOK-Verschl-2026-04.pdf'],
  },
  {
    id: '4',
    from: 'Leitung / ZK-21',
    fromFull: 'Leitung – Zentrale Koordination <leitung@gov.local>',
    subject: 'Reminder: Backup der Archive (ZK-21)',
    date: '09.02.2026',
    body: `Erinnerung: Das monatliche Backup der Archive ist bis spätestens 16.02.2026 durchzuführen.
Bitte bestätigen Sie die Durchführung im System.

Mit freundlichen Grüßen
Leitung / Zentrale Koordination (ZK-21)`,
  },
  {
    id: '5',
    from: 'IT-Protokoll',
    fromFull: 'IT-Protokoll – IT-OPS <protokoll@gov.local>',
    subject: 'Zugriffsprotokoll: Ungewöhnliche Aktivitäten (IT-OPS)',
    date: '08.02.2026',
    body: `Im System wurden ungewöhnliche Zugriffsversuche festgestellt (siehe Anlage).
Bitte prüfen Sie Ihre letzten Aktivitäten und melden Sie Unregelmäßigkeiten an Ref4B.

Mit freundlichen Grüßen
IT-Protokoll / IT-OPS`,
    attachments: ['LOG-ZUGR-2026-02.txt'],
  },
  {
    id: '6',
    from: 'S. Berger',
    fromFull: 'S. Berger – Ref4B / Sonderzugriffe <sberger@gov.local>',
    subject: 'Vertraulich: Zugang zu Postfach X genehmigt (Ref4B)',
    date: '07.02.2026',
    body: `Sie haben temporären Zugriff auf das Postfach X (internes Kürzel: PF-X-2026).
Bitte beachten Sie die Vertraulichkeit der enthaltenen Informationen.

Mit freundlichen Grüßen
S. Berger
Ref4B / Sonderzugriffe`,
  },
  {
    id: '7',
    from: 'Archivsystem',
    fromFull: 'Archivsystem – Systemmeldung <archiv@gov.local>',
    subject: 'Archivstatus: Veraltet (SYS-ARCH)',
    date: '06.02.2026',
    body: `Einige Archivdaten sind veraltet und müssen überprüft werden.
Kontaktieren Sie die Leitung (ZK-21) für weitere Informationen.

Systemmeldung: SYS-ARCH-2026-02`,
  },
  {
    id: '8',
    from: 'J. Brandt',
    fromFull: 'J. Brandt – StDHK <jbrandt@gov.local>',
    subject: 'Interner Memo: Verschlüsselungspflicht (StDHK)',
    date: '05.02.2026',
    body: `Bitte beachten Sie, dass ab sofort alle neuen Dokumente verschlüsselt werden müssen.
Rückfragen an StDHK (Stabsstelle Datenhaltung & Compliance).

Mit freundlichen Grüßen
J. Brandt
StDHK`,
  },
  {
    id: '9',
    from: 'Sicherheitsdienst',
    fromFull: 'Sicherheitsdienst – IT-OPS <security@gov.local>',
    subject: 'Warnung: Systemupdate erforderlich (IT-OPS)',
    date: '04.02.2026',
    body: `Das letzte Sicherheitsupdate wurde nicht installiert.
Bitte aktualisieren Sie Ihr System bis spätestens 14.02.2026.

Mit freundlichen Grüßen
IT-OPS / Sicherheitsdienst`,
  },
  {
    id: '10',
    from: 'M. Vogt',
    fromFull: 'M. Vogt – Ref4B <mvogt@gov.local>',
    subject: 'Unbeantwortet: Anfrage Archivzugriff (Ref4B)',
    date: '03.02.2026',
    body: `Ihre Anfrage zum erweiterten Archivzugriff (DOK-ARCH-2026-01) ist noch offen.
Bitte reichen Sie die fehlenden Unterlagen nach.

Mit freundlichen Grüßen
M. Vogt
Ref4B`,
  },
];

export default function MailClient() {
  const [selectedMail, setSelectedMail] = useState(null);

  return (
    <div className="mail-client">
      {/* Posteingang-Seitenleiste */}
      <aside className="mail-list">
        <h2>Posteingang ({mails.length})</h2>
        <ul>
          {mails.map(mail => (
            <li
              key={mail.id}
              className={selectedMail?.id === mail.id ? 'active' : ''}
              onClick={() => setSelectedMail(mail)}
            >
              <span className="mail-subject">{mail.subject}</span>
              <span className="mail-from">{mail.from}</span>
              <span className="mail-date">{mail.date}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Detailansicht */}
      <section className="mail-detail">
        {selectedMail ? (
          <div className="mail-detail-inner">
            <div className="mail-detail-header">
              <h3>{selectedMail.subject}</h3>
              <div className="mail-meta">
                <span>Von: {selectedMail.fromFull}</span>
                <span>Datum: {selectedMail.date}</span>
              </div>
            </div>

            <div className="mail-body">{selectedMail.body}</div>

            {selectedMail.attachments?.length > 0 && (
              <div className="mail-attachments">
                <strong>Anlagen:</strong>
                <ul style={{ margin: '4px 0 4px 16px', padding: 0 }}>
                  {selectedMail.attachments.map(att => (
                    <li key={att}>
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          alert('Anlagen-Download nicht verfügbar.\nDas Modul MOD-ANLAGE ist nicht aktiv.');
                        }}
                      >
                        📎 {att}
                      </a>
                    </li>
                  ))}
                </ul>
                <span style={{ color: '#888', fontSize: '11px' }}>
                  Hinweis: Modul MOD-ANLAGE derzeit nicht verfügbar.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="mail-empty">Wählen Sie eine Nachricht aus dem Posteingang.</div>
        )}
      </section>
    </div>
  );
}

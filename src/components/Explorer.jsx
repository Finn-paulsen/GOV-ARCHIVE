import { useState, useEffect } from 'react';
import BrowserFS from 'browserfs';

// Minimaler, moderner Explorer: Grundstruktur
export default function Explorer() {
  // Handler-Funktionen
  function handleOpenFile(name) {
    if (!fs) return;
    const path = cwd === '/' ? `/${name}` : `${cwd}/${name}`;
    fs.readFile(path, 'utf8', (err, content) => {
      setFileView({ name, path, content });
      setFileEdit(content);
    });
  }
  function handleSaveFile() {
    if (!fs || !fileView) return;
    fs.writeFile(fileView.path, fileEdit, () => {
      setFileView(null);
      setFileEdit('');
      setRefresh(r => r + 1);
    });
  }
  function handleCreate() {
    if (!newName.trim() || !fs) return;
    const path = cwd === '/' ? `/${newName}` : `${cwd}/${newName}`;
    fs.stat(path, (err, stat) => {
      if (!err) {
        alert('Name existiert bereits!');
        return;
      }
      if (mode === 'newFile') {
        fs.writeFile(path, '', () => {
          setMode(null);
          setNewName('');
          setRefresh(r => r + 1);
        });
      } else if (mode === 'newFolder') {
        fs.mkdir(path, () => {
          setMode(null);
          setNewName('');
          setRefresh(r => r + 1);
        });
      }
    });
  }
  function handleDelete(name) {
    if (!fs) return;
    const path = cwd === '/' ? `/${name}` : `${cwd}/${name}`;
    fs.unlink(path, () => {
      setRefresh(r => r + 1);
    });
  }
  function handleInlineRename(name) {
    setInlineEdit({ name });
    setNewName(name);
    setContextMenu(null);
  }
  function handleInlineRenameConfirm(name) {
    if (!newName.trim() || newName === name || !fs) {
      setInlineEdit(null);
      setNewName('');
      return;
    }
    const oldPath = cwd === '/' ? `/${name}` : `${cwd}/${name}`;
    const newPath = cwd === '/' ? `/${newName}` : `${cwd}/${newName}`;
    fs.stat(newPath, (err, stat) => {
      if (!err) {
        alert('Name existiert bereits!');
        return;
      }
      fs.rename(oldPath, newPath, () => {
        setRefresh(r => r + 1);
        setInlineEdit(null);
        setNewName('');
      });
    });
  }
  function handleInlineEditKey(e, name) {
    if (e.key === 'Enter') handleInlineRenameConfirm(name);
    if (e.key === 'Escape') { setInlineEdit(null); setNewName(''); }
  }
  // Drag & Drop Logik
  function handleDragStart(e, entry) {
    setDragged(entry);
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e, entry) {
    if (entry.type === 'folder') e.preventDefault();
  }
  function handleDrop(e, entry) {
    e.preventDefault();
    if (!dragged || entry.name === dragged.name || entry.type !== 'folder' || !fs) return;
    const fromPath = cwd === '/' ? `/${dragged.name}` : `${cwd}/${dragged.name}`;
    const toPath = cwd === '/' ? `/${entry.name}` : `${cwd}/${entry.name}`;
    fs.stat(`${toPath}/${dragged.name}`, (err, stat) => {
      if (!err) {
        alert('Im Zielordner existiert bereits eine Datei/ein Ordner mit diesem Namen!');
        setDragged(null);
        return;
      }
      fs.rename(fromPath, `${toPath}/${dragged.name}`, () => {
        setRefresh(r => r + 1);
        setDragged(null);
      });
    });
  }
  function handleDragEnd() { setDragged(null); }
  // Kontextmenü-Aktionen
  function handleMenuAction(action) {
    const entry = contextMenu.entry;
    if (!entry) return;
    if (action === 'open') entry.type === 'folder' ? setCWD(cwd === '/' ? `/${entry.name}` : `${cwd}/${entry.name}`) : null;
    if (action === 'rename') handleInlineRename(entry.name);
    if (action === 'delete') handleDelete(entry.name);
    setContextMenu(null);
  }
  // Datei-View/Edit State
  const [fileView, setFileView] = useState(null); // {name, path, content}
  const [fileEdit, setFileEdit] = useState('');
  // Drag & Drop State
  const [dragged, setDragged] = useState(null); // {name, type}
  // Modale und Inline-Edit States
  const [mode, setMode] = useState(null); // 'newFile'|'newFolder'
  const [newName, setNewName] = useState('');
  const [inlineEdit, setInlineEdit] = useState(null); // {name}
  const [contextMenu, setContextMenu] = useState(null); // {x, y, entry}
  const [fs, setFS] = useState(null);
  const [fsReady, setFSReady] = useState(false);
  const [cwd, setCWD] = useState('/');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);

  // Initialisiere BrowserFS
  useEffect(() => {
    BrowserFS.configure({ fs: 'IndexedDB', options: {} }, err => {
      if (err) {
        setError(err);
        setFSReady(false);
      } else {
        const fsInstance = BrowserFS.BFSRequire('fs');
        setFS(fsInstance);
        setFSReady(true);
        // Initialstruktur anlegen
        fsInstance.readdir('/', (e, files) => {
          if (!files || files.length === 0) {
            fsInstance.mkdir('/Dokumente', () => {});
            fsInstance.mkdir('/Bilder', () => {});
            fsInstance.writeFile('/info.txt', 'Willkommen im Explorer.', () => {});
            fsInstance.writeFile('/Dokumente/Testdatei.txt', 'Dies ist eine Testdatei.', () => {});
            fsInstance.writeFile('/Bilder/bild1.png', 'PNG-FAKE', () => {});
          }
        });
      }
    });
  }, []);

  // Verzeichnisinhalt abrufen
  useEffect(() => {
    if (fsReady && fs) {
      fs.readdir(cwd, (err, files) => {
        if (err) {
          setEntries([]);
        } else {
          Promise.all(
            files.map(name =>
              new Promise(resolve => {
                fs.stat(cwd === '/' ? `/${name}` : `${cwd}/${name}`, (e, stat) => {
                  resolve({ name, type: stat && stat.isDirectory() ? 'folder' : 'file' });
                });
              })
            )
          ).then(setEntries);
        }
      });
    }
  }, [fsReady, fs, cwd, refresh]);

  // UI
  if (error) {
    return <div className="bg-error text-error-content p-4 rounded">Dateisystem-Fehler: {error.message || error.toString()}</div>;
  }
  if (!fsReady) {
    return <div className="bg-base-200 text-base-content p-4 rounded">Dateisystem wird geladen...</div>;
  }

  return (
    <div className="explorer bg-base-200 rounded shadow p-4 min-w-[420px] min-h-[320px] border-2 border-primary flex flex-col">
      <div className="explorer-header text-lg font-bold mb-2 flex items-center gap-2">
        <span className="inline-block"><svg width="22" height="22" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2" fill="#e3e3e3"/><rect x="2" y="6" width="20" height="3" rx="1" fill="#b3b3b3"/></svg></span>
        Explorer
      </div>
      <nav className="flex items-center text-sm mb-2">
        <button className="btn btn-xs btn-ghost" onClick={() => setCWD('/')}>Computer</button>
        {/* Breadcrumbs */}
        {cwd !== '/' && cwd.split('/').filter(Boolean).map((p, i, arr) => {
          const path = '/' + arr.slice(0, i + 1).join('/');
          return (
            <>
              <span key={'sep'+i} className="mx-1">/</span>
              <button key={'btn'+i} className="btn btn-xs btn-ghost" onClick={() => setCWD(path)}>{p}</button>
            </>
          );
        })}
      </nav>
      <div className="flex gap-2 mb-2">
        <button className="btn btn-sm btn-primary" onClick={() => { setMode('newFile'); setNewName(''); }}>Neue Datei</button>
        <button className="btn btn-sm btn-secondary" onClick={() => { setMode('newFolder'); setNewName(''); }}>Neuer Ordner</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Typ</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-base-content">Keine Dateien oder Ordner gefunden.</td>
              </tr>
            ) : (
              entries.map(entry => (
                <tr
                  key={entry.name}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, entry }); }}
                  draggable
                  onDragStart={e => handleDragStart(e, entry)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => handleDragOver(e, entry)}
                  onDrop={e => handleDrop(e, entry)}
                  style={dragged && dragged.name === entry.name ? { opacity: 0.5 } : {}}
                >
                  <td className="cursor-pointer"
                      onDoubleClick={() => entry.type === 'folder' ? setCWD(cwd === '/' ? `/${entry.name}` : `${cwd}/${entry.name}`) : entry.type === 'file' ? handleOpenFile(entry.name) : null}>
                    {entry.type === 'folder' ? '📁' : '📄'}{' '}
                    {inlineEdit && inlineEdit.name === entry.name ? (
                      <input
                        autoFocus
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onBlur={() => handleInlineRenameConfirm(entry.name)}
                        onKeyDown={e => handleInlineEditKey(e, entry.name)}
                        style={{ width: '70%' }}
                      />
                    ) : (
                      <span>{entry.name}</span>
                    )}
                  </td>
                  <td>{entry.type}</td>
                  <td>
                    <button className="btn btn-xs btn-outline" onClick={() => entry.type === 'folder' ? setCWD(cwd === '/' ? `/${entry.name}` : `${cwd}/${entry.name}`) : null}>Öffnen</button>
                    <button className="btn btn-xs btn-accent" onClick={() => handleInlineRename(entry.name)}>Umbenennen</button>
                    <button className="btn btn-xs btn-error" onClick={() => handleDelete(entry.name)}>Löschen</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Datei-View/Edit Modal */}
      {fileView && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{fileView.name}</h3>
            <textarea className="textarea textarea-bordered w-full mt-2 mb-2" rows={8} value={fileEdit} onChange={e => setFileEdit(e.target.value)} />
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleSaveFile}>Speichern</button>
              <button className="btn" onClick={() => setFileView(null)}>Schließen</button>
            </div>
          </div>
        </div>
      )}
      {/* Kontextmenü */}
      {contextMenu && (
        <div
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#fff', border: '1px solid #b3b3b3', zIndex: 1000, color: '#222', minWidth: 140, boxShadow: '0 2px 8px #0002', borderRadius: 6 }}
          onClick={e => e.stopPropagation()}>
          <div style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleMenuAction('open')}>Öffnen</div>
          <div style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #eee' }} onClick={() => handleMenuAction('rename')}>Umbenennen</div>
          <div style={{ padding: 10, cursor: 'pointer' }} onClick={() => handleMenuAction('delete')}>Löschen</div>
        </div>
      )}
    </div>
  );
}

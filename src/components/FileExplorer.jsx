
import { useEffect, useRef, useState } from 'react'

export default function FileExplorer({ onOpenFile }) {
  const [cwd, setCWD] = useState('/')
  const [selected, setSelected] = useState(null)
  const [newName, setNewName] = useState('')
  const [mode, setMode] = useState(null) // 'newFile'|'newFolder'
  const [refresh, setRefresh] = useState(0)
  const [contextMenu, setContextMenu] = useState(null) // {x, y, entry}
  const [inlineEdit, setInlineEdit] = useState(null) // {name}
  const [dragged, setDragged] = useState(null) // {name, type}
  const [fsReady, setFSReady] = useState(false)
  const [fsError, setFSError] = useState(null)
  const fsRef = useRef(null)

  // --- Eigenes JS-Dateisystem (persistiert in localStorage) ---
  function getInitialFS() {
    return {
      '/': {
        type: 'folder',
        children: {
          'Dokumente': { type: 'folder', children: {
            'Testdatei.txt': { type: 'file', content: 'Dies ist eine Testdatei.' }
          } },
          'Bilder': { type: 'folder', children: {
            'bild1.png': { type: 'file', content: 'PNG-FAKE' }
          } },
          'info.txt': { type: 'file', content: 'Willkommen im Behörden-Dateisystem.' }
        }
      }
    }
  }

  // Lade/Initialisiere Dateisystem aus localStorage
  useEffect(() => {
    let fs = null
    try {
      const raw = localStorage.getItem('gov_fs_v1')
      fs = raw ? JSON.parse(raw) : getInitialFS()
    } catch (e) {
      fs = getInitialFS()
    }
    fsRef.current = fs
    setFSReady(true)
    setRefresh(r => r + 1)
  }, [])

  function saveFS() {
    localStorage.setItem('gov_fs_v1', JSON.stringify(fsRef.current))
  }

  function getNode(path) {
    const parts = path.split('/').filter(Boolean)
    let node = fsRef.current['/']
    for (const p of parts) {
      if (!node.children[p]) return null
      node = node.children[p]
    }
    return node
  }

  function listDir(path) {
    if (!fsRef.current) return []
    const node = getNode(path)
    if (!node || node.type !== 'folder') return []
    const all = Object.entries(node.children).map(([name, entry]) => ({ name, type: entry.type }))
    return all.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1)
  }
  const entries = fsReady ? listDir(cwd) : []

  function handleOpen(name) {
    if (!fsRef.current) return
    const path = cwd === '/' ? `/${name}` : `${cwd}/${name}`
    const node = getNode(path)
    if (!node) return
    if (node.type === 'folder') {
      setCWD(path)
      setSelected(null)
    } else {
      const content = node.content
      if (onOpenFile) {
        onOpenFile({ name, path, content })
      } else {
        setSelected({ name, path, type: 'file', content })
      }
    }
    setContextMenu(null)
  }

  function handleBack() {
    if (cwd === '/') return
    const parts = cwd.split('/').filter(Boolean)
    parts.pop()
    setCWD(parts.length ? '/' + parts.join('/') : '/')
    setSelected(null)
  }

  function handleNew(type) {
    setMode(type)
    setNewName('')
  }

  function handleCreate() {
    if (!newName.trim() || !fsRef.current) return
    const node = getNode(cwd)
    if (!node || node.type !== 'folder') return
    if (node.children[newName]) {
      alert('Name existiert bereits!')
      return
    }
    if (mode === 'newFile') node.children[newName] = { type: 'file', content: '' }
    else if (mode === 'newFolder') node.children[newName] = { type: 'folder', children: {} }
    saveFS()
    setRefresh(r => r + 1)
    setMode(null)
    setNewName('')
  }

  function handleDelete(name) {
    if (!fsRef.current) return
    const node = getNode(cwd)
    if (!node || node.type !== 'folder') return
    delete node.children[name]
    saveFS()
    setRefresh(r => r + 1)
    setSelected(null)
  }

  function handleInlineRename(name) {
    setInlineEdit({ name })
    setNewName(name)
    setContextMenu(null)
  }

  function handleInlineRenameConfirm(name) {
    if (!newName.trim() || newName === name || !fsRef.current) {
      setInlineEdit(null)
      setNewName('')
      return
    }
    const node = getNode(cwd)
    if (!node || node.type !== 'folder') return
    if (node.children[newName]) {
      alert('Name existiert bereits!')
      return
    }
    node.children[newName] = node.children[name]
    delete node.children[name]
    saveFS()
    setRefresh(r => r + 1)
    setInlineEdit(null)
    setNewName('')
  }

  // Kontextmenü-Handler
  function handleContextMenu(e, entry) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, entry })
  }

  // Drag & Drop
  function handleDragStart(e, entry) {
    setDragged(entry)
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleDragOver(e, entry) {
    if (entry.type === 'folder') e.preventDefault()
  }
  function handleDrop(e, entry) {
    e.preventDefault()
    if (!dragged || entry.name === dragged.name || entry.type !== 'folder' || !fsRef.current) return
    // Quelle und Ziel ermitteln
    const fromNode = getNode(cwd)
    const toNode = getNode(cwd === '/' ? `/${entry.name}` : `${cwd}/${entry.name}`)
    if (!fromNode || !toNode || fromNode.type !== 'folder' || toNode.type !== 'folder') return
    if (toNode.children[dragged.name]) {
      alert('Im Zielordner existiert bereits eine Datei/ein Ordner mit diesem Namen!')
      setDragged(null)
      return
    }
    toNode.children[dragged.name] = fromNode.children[dragged.name]
    delete fromNode.children[dragged.name]
    saveFS()
    setRefresh(r => r + 1)
    setDragged(null)
  }
  function handleDragEnd() { setDragged(null) }

  // Kontextmenü-Aktionen
  function handleMenuAction(action) {
    const entry = contextMenu.entry
    if (!entry) return
    if (action === 'open') handleOpen(entry.name)
    if (action === 'rename') handleInlineRename(entry.name)
    if (action === 'delete') handleDelete(entry.name)
    setContextMenu(null)
  }

  // Inline-Edit: Enter/Blur
  function handleInlineEditKey(e, name) {
    if (e.key === 'Enter') handleInlineRenameConfirm(name)
    if (e.key === 'Escape') { setInlineEdit(null); setNewName('') }
  }

  // Klick außerhalb Kontextmenü schließt es
  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">DATEIEXPLORER</div>
      <div className="file-explorer-main">
        <div className="file-explorer-tree">
          <button onClick={handleBack} disabled={cwd === '/'}>Zurück</button>
          <div className="file-explorer-path">{cwd}</div>
          <button onClick={() => handleNew('newFile')}>Neue Datei</button>
          <button onClick={() => handleNew('newFolder')}>Neuer Ordner</button>
        </div>
        <div className="file-explorer-list">
          {mode === 'newFile' && (
            <div className="file-explorer-modal">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Dateiname" />
              <button onClick={handleCreate}>Erstellen</button>
              <button onClick={() => setMode(null)}>Abbrechen</button>
            </div>
          )}
          {mode === 'newFolder' && (
            <div className="file-explorer-modal">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ordnername" />
              <button onClick={handleCreate}>Erstellen</button>
              <button onClick={() => setMode(null)}>Abbrechen</button>
            </div>
          )}
          <div className="file-explorer-table">
            <div className="file-explorer-table-head">
              <div>Name</div>
              <div>Typ</div>
              <div>Aktionen</div>
            </div>
            {entries.map(entry => (
              <div
                className="file-explorer-table-row"
                key={entry.name}
                onContextMenu={e => handleContextMenu(e, entry)}
                draggable
                onDragStart={e => handleDragStart(e, entry)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, entry)}
                onDrop={e => handleDrop(e, entry)}
                style={dragged && dragged.name === entry.name ? { opacity: 0.5 } : {}}
              >
                <div className="file-explorer-table-cell file-explorer-name" onDoubleClick={() => handleOpen(entry.name)}>
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
                    <span onClick={() => setInlineEdit({ name: entry.name })}>{entry.name}</span>
                  )}
                </div>
                <div className="file-explorer-table-cell">{entry.type}</div>
                <div className="file-explorer-table-cell">
                  <button onClick={() => handleOpen(entry.name)}>Öffnen</button>
                  <button onClick={() => handleInlineRename(entry.name)}>Umbenennen</button>
                  <button onClick={() => handleDelete(entry.name)}>Löschen</button>
                </div>
              </div>
            ))}
          </div>
          {selected && selected.type === 'file' && (
            <div className="file-explorer-fileview">
              <div className="file-explorer-fileview-head">{selected.name}</div>
              <div className="file-explorer-fileview-content">{selected.content || <i>(Leer)</i>}</div>
              <button onClick={() => setSelected(null)}>Schließen</button>
            </div>
          )}
          {contextMenu && (
            <div
              style={{
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x,
                background: '#181818',
                border: '1px solid #ffbf47',
                zIndex: 1000,
                color: '#ffbf47',
                minWidth: 120,
                boxShadow: '0 2px 8px #0008',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: 8, cursor: 'pointer' }} onClick={() => handleMenuAction('open')}>Öffnen</div>
              <div style={{ padding: 8, cursor: 'pointer' }} onClick={() => handleMenuAction('rename')}>Umbenennen</div>
              <div style={{ padding: 8, cursor: 'pointer' }} onClick={() => handleMenuAction('delete')}>Löschen</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

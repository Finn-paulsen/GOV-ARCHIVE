import React, { useState, useEffect } from "react";
import GovContextMenu from "./GovContextMenu";
import "./govContextMenu.css";
import "./govExplorer.css";

// Beispiel-Datenstruktur (kann später dynamisch geladen werden)
const initialData = {
  id: "root",
  name: "GOV-ARCHIVE",
  isFolder: true,
  items: [
    {
      id: "1",
      name: "public",
      isFolder: true,
      items: [
        { id: "2", name: "index.html", isFolder: false, items: [] },
        { id: "3", name: "hello.txt", isFolder: false, items: [] }
      ]
    },
    {
      id: "4",
      name: "src",
      isFolder: true,
      items: [
        { id: "5", name: "main.jsx", isFolder: false, items: [] }
      ]
    }
  ]
};

function Folder({ explorer, onAdd, onOpenFile, onContextMenu, renderLabel }) {
  const [expanded, setExpanded] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isFolder, setIsFolder] = useState(true);

  const handleAdd = (e) => {
    e.stopPropagation();
    setShowInput(true);
    setIsFolder(true);
  };
  const handleAddFile = (e) => {
    e.stopPropagation();
    setShowInput(true);
    setIsFolder(false);
  };
  const handleInput = (e) => {
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue) {
      onAdd(explorer.id, inputValue, isFolder);
      setShowInput(false);
      setInputValue("");
    }
    if (e.key === "Escape") {
      setShowInput(false);
      setInputValue("");
    }
  };

  // Doppelklick auf Ordner: öffnen/schließen
  const handleFolderDoubleClick = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  // Doppelklick auf Datei: Editor öffnen, wenn .txt oder .html
  const handleFileDoubleClick = (item) => {
    if (!item.isFolder && /\.(txt|html?)$/i.test(item.name)) {
      onOpenFile && onOpenFile(item);
    }
  };

  return (
    <>
      <div className="gov-folder">
        <div
          className="gov-folder-label"
          onDoubleClick={handleFolderDoubleClick}
          onContextMenu={onContextMenu ? (e) => { e.stopPropagation(); onContextMenu(e, explorer); } : undefined}
        >
          {renderLabel ? renderLabel(explorer, <span>{expanded ? "📂" : "📁"} {explorer.name}</span>) : <span>{expanded ? "📂" : "📁"} {explorer.name}</span>}
        </div>
        {showInput && (
          <div className="gov-input-row">
            <input
              className="gov-input"
              autoFocus
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={isFolder ? "Neuer Ordner" : "Neue Datei"}
            />
          </div>
        )}
        {expanded && (
          <div className="gov-folder-children">
            {explorer.items.map((item) =>
              item.isFolder ? (
                <Folder key={item.id} explorer={item} onAdd={onAdd} onOpenFile={onOpenFile} onContextMenu={onContextMenu} renderLabel={renderLabel} />
              ) : (
                <div
                  className="gov-file"
                  key={item.id}
                  onDoubleClick={() => handleFileDoubleClick(item)}
                  title={/\.(txt|html?)$/i.test(item.name) ? 'Bearbeiten' : ''}
                  style={{ cursor: /\.(txt|html?)$/i.test(item.name) ? 'pointer' : 'default' }}
                  onContextMenu={onContextMenu ? (e) => { e.stopPropagation(); onContextMenu(e, item); } : undefined}
                >
                  {renderLabel ? renderLabel(item, <>🗄 {item.name}</>) : <>🗄 {item.name}</>}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

function insertNode(tree, folderId, name, isFolder) {
  if (tree.id === folderId && tree.isFolder) {
    return {
      ...tree,
      items: [
        ...tree.items,
        {
          id: Date.now().toString(),
          name,
          isFolder,
          items: []
        }
      ]
    };
  }
  return {
    ...tree,
    items: tree.items.map((item) =>
      item.isFolder ? insertNode(item, folderId, name, isFolder) : item
    )
  };
}

import FileEditor from './FileEditor';

export default function FileExplorer() {
  // Initialisierung: versuche aus localStorage zu laden
  const [explorerData, setExplorerData] = useState(() => {
    const saved = localStorage.getItem('gov-archive-explorer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialData;
      }
    }
    return initialData;
  });
  // Bei jeder Änderung explorerData in localStorage speichern
  useEffect(() => {
    localStorage.setItem('gov-archive-explorer', JSON.stringify(explorerData));
  }, [explorerData]);
  const [editorFile, setEditorFile] = useState(null);
  const [editorContent, setEditorContent] = useState("");

  const handleAdd = (folderId, name, isFolder) => {
    setExplorerData((prev) => insertNode(prev, folderId, name, isFolder));
  };

  const handleOpenFile = (file) => {
    setEditorFile(file);
    setEditorContent(file.content || "");
  };

  const handleSaveFile = (newContent) => {
    function updateContent(node) {
      if (node.id === editorFile.id) {
        return { ...node, content: newContent };
      }
      if (node.isFolder && node.items) {
        return { ...node, items: node.items.map(updateContent) };
      }
      return node;
    }
    setExplorerData((prev) => updateContent(prev));
    setEditorContent(newContent);
  };

  const handleBack = () => {
    setEditorFile(null);
    setEditorContent("");
  };

  // Kontextmenü-Logik
  const [contextMenu, setContextMenu] = useState(null); // {x, y, target}

  const handleContextMenu = (e, target) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      target,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Umbenennen-Status
  const [renameTarget, setRenameTarget] = useState(null); // {id, name, isFolder}
  const [renameValue, setRenameValue] = useState("");

  const startRename = (target) => {
    setRenameTarget(target);
    setRenameValue(target.name);
    closeContextMenu();
  };

  const handleRenameChange = (e) => setRenameValue(e.target.value);

  const handleRenameSubmit = () => {
    if (!renameTarget || !renameValue.trim()) {
      setRenameTarget(null);
      setRenameValue("");
      return;
    }
    // Rekursiv im Explorer-Baum umbenennen
    const updateName = (node) => {
      if (node.id === renameTarget.id) {
        return { ...node, name: renameValue };
      }
      if (node.items) {
        return { ...node, items: node.items.map(updateName) };
      }
      return node;
    };
    setExplorerData((prev) => updateName(prev));
    setRenameTarget(null);
    setRenameValue("");
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") {
      setRenameTarget(null);
      setRenameValue("");
    }
  };

  // Hilfsfunktion: Knoten rekursiv entfernen
  function removeNode(tree, id) {
    if (!tree.items) return tree;
    return {
      ...tree,
      items: tree.items
        .filter((item) => item.id !== id)
        .map((item) => item.isFolder ? removeNode(item, id) : item)
    };
  }

  // Kopieren/Einfügen-Logik
  const [clipboard, setClipboard] = useState(null); // {node, isFolder}
  // Neu-Funktion: Status für Zielordner, Typ und Input
  const [newTarget, setNewTarget] = useState(null); // {id, isFolder}
  const [newType, setNewType] = useState(null); // 'file' | 'folder'
  const [newInputValue, setNewInputValue] = useState("");

  // Hilfsfunktion: Knoten im Baum suchen
  function findNode(tree, id) {
    if (tree.id === id) return tree;
    if (!tree.items) return null;
    for (const item of tree.items) {
      const found = item.isFolder ? findNode(item, id) : (item.id === id ? item : null);
      if (found) return found;
    }
    return null;
  }

  // Hilfsfunktion: Tiefe Kopie mit neuem ID
  function deepCopyWithNewIds(node) {
    const newId = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    if (node.isFolder) {
      return {
        ...node,
        id: newId,
        name: node.name + '_copy',
        items: node.items ? node.items.map(deepCopyWithNewIds) : []
      };
    } else {
      return { ...node, id: newId, name: node.name + '_copy' };
    }
  }

  // Hilfsfunktion: Einfügen in Ordner
  function insertNodeCopy(tree, folderId, nodeCopy) {
    if (tree.id === folderId && tree.isFolder) {
      return {
        ...tree,
        items: [...tree.items, nodeCopy]
      };
    }
    return {
      ...tree,
      items: tree.items.map((item) =>
        item.isFolder ? insertNodeCopy(item, folderId, nodeCopy) : item
      )
    };
  }

  const contextOptions = contextMenu && contextMenu.target ? [
    {
      label: 'Umbenennen',
      onClick: () => startRename(contextMenu.target),
      disabled: false,
    },
    {
      label: 'Löschen',
      onClick: () => {
        setExplorerData((prev) => removeNode(prev, contextMenu.target.id));
        closeContextMenu();
      },
      disabled: false,
    },
    {
      label: 'Kopieren',
      onClick: () => {
        const node = findNode(explorerData, contextMenu.target.id);
        if (node) setClipboard(node);
        closeContextMenu();
      },
      disabled: false,
    },
    {
      label: 'Einfügen',
      onClick: () => {
        if (clipboard && contextMenu.target.isFolder) {
          const nodeCopy = deepCopyWithNewIds(clipboard);
          setExplorerData((prev) => insertNodeCopy(prev, contextMenu.target.id, nodeCopy));
        }
        closeContextMenu();
      },
      disabled: !(clipboard && contextMenu.target && contextMenu.target.isFolder),
    },
    {
      label: 'Neu',
      onClick: () => {
        // Auswahl: Datei oder Ordner
        setNewTarget(contextMenu.target);
        closeContextMenu();
      },
      disabled: !(contextMenu.target && contextMenu.target.isFolder),
    },
  ] : [];

  // Label-Renderer für Umbenennen- und Neu-Input überall
  const renderLabel = (item, defaultLabel) => {
    // Umbenennen
    if (renameTarget && renameTarget.id === item.id) {
      return (
        <input
          className="gov-input gov-rename-input"
          autoFocus
          value={renameValue}
          onChange={handleRenameChange}
          onBlur={handleRenameSubmit}
          onKeyDown={handleRenameKeyDown}
          style={{ width: Math.max(80, renameValue.length * 8) }}
        />
      );
    }
    // Neu
    if (newTarget && newTarget.id === item.id && item.isFolder) {
      if (newType) {
        return (
          <input
            className="gov-input gov-rename-input"
            autoFocus
            placeholder={newType === 'folder' ? 'Neuer Ordner' : 'Neue Datei.txt'}
            value={newInputValue}
            onChange={e => setNewInputValue(e.target.value)}
            onBlur={() => {
              if (newInputValue.trim()) {
                handleAdd(item.id, newInputValue, newType === 'folder');
              }
              setNewInputValue("");
              setNewTarget(null);
              setNewType(null);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && newInputValue.trim()) {
                handleAdd(item.id, newInputValue, newType === 'folder');
                setNewInputValue("");
                setNewTarget(null);
                setNewType(null);
              }
              if (e.key === 'Escape') {
                setNewInputValue("");
                setNewTarget(null);
                setNewType(null);
              }
            }}
            style={{ width: Math.max(80, newInputValue.length * 8) }}
          />
        );
      }
      // Auswahl Buttons
      return (
        <span>
          <button className="gov-btn" onClick={e => { e.stopPropagation(); setNewType('file'); setNewInputValue(""); }}>+ Datei</button>
          <button className="gov-btn" onClick={e => { e.stopPropagation(); setNewType('folder'); setNewInputValue(""); }}>+ Ordner</button>
        </span>
      );
    }
    return defaultLabel;
  };

  return (
    <div className="gov-explorer-container">
      {editorFile ? (
        <FileEditor
          name={editorFile.name}
          content={editorContent}
          onSave={handleSaveFile}
          onBack={handleBack}
        />
      ) : (
        <Folder
          explorer={explorerData}
          onAdd={handleAdd}
          onOpenFile={handleOpenFile}
          onContextMenu={handleContextMenu}
          renderLabel={renderLabel}
        />
      )}
      {contextMenu && (
        <GovContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          options={contextOptions}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
}

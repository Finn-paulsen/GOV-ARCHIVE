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

  const contextOptions = contextMenu && contextMenu.target ? [
    {
      label: 'Umbenennen',
      onClick: () => startRename(contextMenu.target),
      disabled: false,
    },
    {
      label: 'Löschen',
      onClick: () => {
        // TODO: Löschen-Logik
        closeContextMenu();
      },
      disabled: false,
    },
    {
      label: 'Kopieren',
      onClick: () => {
        // TODO: Kopieren-Logik
        closeContextMenu();
      },
      disabled: false,
    },
    {
      label: 'Einfügen',
      onClick: () => {
        // TODO: Einfügen-Logik
        closeContextMenu();
      },
      disabled: false,
    },
    {
      label: 'Neu',
      onClick: () => {
        // TODO: Neu-Logik (Datei/Ordner)
        closeContextMenu();
      },
      disabled: false,
    },
  ] : [];

  // Label-Renderer für Umbenennen-Input überall
  const renderLabel = (item, defaultLabel) => {
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

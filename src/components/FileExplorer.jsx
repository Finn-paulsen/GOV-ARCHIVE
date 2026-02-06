// Einfache rekursive Komponente für einen Datei-/Ordner-Knoten
function FileNode({ node, onFileClick, onFileDoubleClick, focusedPath, setFocusedPath, parentPath, onMove, dragOverPath, setDragOverPath }) {
  if (!node) return null;
  const path = parentPath ? parentPath + '/' + node.name : node.name;
  // Highlight nur für exakt dieses Element
  const isFocused = focusedPath === path;
  const isDragOver = dragOverPath === path;
  
const handleClick = (e) => {
  e.stopPropagation();
  onFileClick && onFileClick(path, node);
  setFocusedPath && setFocusedPath(path);
};

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onFileDoubleClick && onFileDoubleClick(node);
  };
  return (
    <div
      style={{
        paddingLeft: 16,
        background: isFocused ? '#e0e7ef' : isDragOver ? '#ffeeba' : undefined,
        cursor: 'pointer',
        fontWeight: node.type === 'folder' ? 'bold' : 'normal',
      }}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {node.type === 'folder' ? '📁 ' : '📄 '}{node.name}
      {node.type === 'folder' && node.children && node.children.map(child => (
        <FileNode
          key={child.name}
          node={child}
          onFileClick={onFileClick}
          onFileDoubleClick={onFileDoubleClick}
          focusedPath={focusedPath}
          setFocusedPath={setFocusedPath}
          parentPath={path}
          onMove={onMove}
          dragOverPath={dragOverPath}
          setDragOverPath={setDragOverPath}
        />
      ))}
    </div>
  );
}
// Filtert den Dateibaum nach dem Suchbegriff (rekursiv)
function filterTree(node, search) {
  if (!search) return node;
  if (node.type === 'file') {
    return node.name.toLowerCase().includes(search.toLowerCase()) ? node : null;
  }
  // Ordner: Kinder filtern
  const filteredChildren = (node.children || [])
    .map(child => filterTree(child, search))
    .filter(Boolean);
  if (filteredChildren.length > 0 || node.name.toLowerCase().includes(search.toLowerCase())) {
    return { ...node, children: filteredChildren };
  }
  return null;
}
import React, { useState, useRef, useEffect } from "react";

// Beispiel-Datenstruktur (kann später dynamisch geladen werden)
const defaultData = {
  name: "root",
  type: "folder",
  children: [
    {
      name: "Dokumente",
      type: "folder",
      children: [
        { name: "Testdatei.txt", type: "file" },
        { name: "Notizen.md", type: "file" },
      ],
    },
    {
      name: "Bilder",
      type: "folder",
      children: [
        { name: "bild1.png", type: "file" },
        { name: "bild2.jpg", type: "file" },
      ],
    },
    { name: "info.txt", type: "file" },
  ],
};
function FileExplorer({ onOpenFile, data: propsData, setData: propsSetData }) {
  // Wenn Props übergeben werden, diese verwenden, sonst lokalen State
  const [internalData, internalSetData] = useState(() => {
    const saved = localStorage.getItem("fileexplorer-data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  });
  const data = propsData !== undefined ? propsData : internalData;
  const setData = propsSetData !== undefined ? propsSetData : internalSetData;
 
const [selectedFilePath, setSelectedFilePath] = useState(null);
function getSelectedFile() {
  if (!selectedFilePath) return null;
  function findNode(node, path, parent = "") {
    const currentPath = parent ? parent + "/" + node.name : node.name;
    if (currentPath === path) return node;
    if (node.type === "folder" && node.children) {
      for (let child of node.children) {
        const found = findNode(child, path, currentPath);
        if (found) return found;
      }
    }
    return null;
  }
  return findNode(data, selectedFilePath);
}
const selectedFile = getSelectedFile();

  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedPath, setFocusedPath] = useState("root");
  const [dragOverPath, setDragOverPath] = useState(null);
  const [clipboard, setClipboard] = useState(null); // { node, type: 'copy'|'cut', fromPath }
  const [renameMode, setRenameMode] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Flache Liste aller sichtbaren Pfade für Tastatur-Navigation
  function flattenTree(node, parentPath = "") {
    const path = parentPath ? parentPath + "/" + node.name : node.name;
    let arr = [{ path, node }];
    if (node.type === "folder" && node.children) {
      node.children.forEach((child) => {
        arr = arr.concat(flattenTree(child, path));
      });
    }
    return arr;
  }

  const filteredTree = filterTree(data, search) || {
    name: "leer",
    type: "folder",
    children: [],
  };
  const flatList = flattenTree(filteredTree);
  const focusIndex = flatList.findIndex((e) => e.path === focusedPath);

  // Tastatur-Navigation (global für Explorer)
  function handleKeyDown(e) {
    if (e.target.tagName === "INPUT") return;
    if (e.key === "ArrowDown") {
      if (focusIndex < flatList.length - 1)
        setFocusedPath(flatList[focusIndex + 1].path);
    }
    if (e.key === "ArrowUp") {
      if (focusIndex > 0) setFocusedPath(flatList[focusIndex - 1].path);
    }
    if (e.key === "Backspace") {
      // Zum Parent-Ordner springen
      const parts = focusedPath.split("/");
      if (parts.length > 1) setFocusedPath(parts.slice(0, -1).join("/"));
    }
  }

  // Drag & Drop: Datei/Ordner verschieben
  function moveNode(fromPath, toPath) {
    if (fromPath === toPath) return;
    // Knoten aus Baum entfernen und an neuer Stelle einfügen
    function removeNode(node, path, parent = null) {
      if (!node) return null;
      const currentPath = parent ? parent + "/" + node.name : node.name;
      if (currentPath === path) return null;
      if (node.type === "folder" && node.children) {
        node.children = node.children
          .map((child) => removeNode(child, path, currentPath))
          .filter(Boolean);
      }
      return node;
    }
    function findNode(node, path, parent = null) {
      const currentPath = parent ? parent + "/" + node.name : node.name;
      if (currentPath === path) return node;
      if (node.type === "folder" && node.children) {
        for (let child of node.children) {
          const found = findNode(child, path, currentPath);
          if (found) return found;
        }
      }
      return null;
    }
    function insertNode(node, path, insertNode) {
      const currentPath = node.name;
      if (currentPath === path && node.type === "folder") {
        node.children = node.children || [];
        node.children.push(insertNode);
      } else if (node.type === "folder" && node.children) {
        node.children.forEach((child) => insertNode(child, path, insertNode));
      }
    }
    // Deep copy
    let newTree = JSON.parse(JSON.stringify(data));
    const movingNode = findNode(newTree, fromPath);
    newTree = removeNode(newTree, fromPath);
    insertNode(newTree, toPath, movingNode);
    setData(newTree);
  }

  // Hilfsfunktionen für Aktionen
  function getCurrentFolderPath() {
    // Wenn Datei ausgewählt, gib Parent zurück, sonst Ordner selbst
    if (!selectedFile) return focusedPath;
    const parts = focusedPath.split("/");
    if (selectedFile.type === "folder") return focusedPath;
    return parts.slice(0, -1).join("/") || "root";
  }

  function handleNewFile() {
    const folderPath = getCurrentFolderPath();
    const name = prompt("Dateiname?");
    if (!name) return;
    // Deep copy
    let newTree = JSON.parse(JSON.stringify(data));
    function insertFile(node, path) {
      const currentPath = node.name === "root" ? "root" : path;
      if (currentPath === folderPath && node.type === "folder") {
        node.children = node.children || [];
        node.children.push({ name, type: "file" });
      } else if (node.type === "folder" && node.children) {
        node.children.forEach((child) =>
          insertFile(child, currentPath + "/" + child.name),
        );
      }
    }
    insertFile(newTree, "root");
    setData(newTree);
  }

  function handleCopy() {
    if (!selectedFile) return;
    setClipboard({ node: selectedFile, type: "copy", fromPath: focusedPath });
  }
  function handleCut() {
    if (!selectedFile) return;
    setClipboard({ node: selectedFile, type: "cut", fromPath: focusedPath });
  }
  function handlePaste() {
    if (!clipboard) return;
    const folderPath = getCurrentFolderPath();
    let newTree = JSON.parse(JSON.stringify(data));
    // Füge node in Zielordner ein
    function insertNode(node, path, insertNode) {
      if (
        node.name === "root"
          ? "root"
          : path === folderPath && node.type === "folder"
      ) {
        node.children = node.children || [];
        // Bei Copy: neuen Namen, falls schon vorhanden
        let baseName = insertNode.name;
        let name = baseName;
        let i = 1;
        while (node.children.some((child) => child.name === name)) {
          name = baseName + " (" + i + ")";
          i++;
        }
        node.children.push({ ...insertNode, name });
      } else if (node.type === "folder" && node.children) {
        node.children.forEach((child) =>
          insertNode(child, path + "/" + child.name, insertNode),
        );
      }
    }
    insertNode(newTree, "root", clipboard.node);
    // Bei Cut: Original entfernen
    if (clipboard.type === "cut") {
      function removeNode(node, path, parent = null) {
        const currentPath = parent ? parent + "/" + node.name : node.name;
        if (currentPath === clipboard.fromPath) return null;
        if (node.type === "folder" && node.children) {
          node.children = node.children
            .map((child) => removeNode(child, currentPath))
            .filter(Boolean);
        }
        return node;
      }
      newTree = removeNode(newTree, "root");
    }
    setData(newTree);
    setClipboard(null);
  }

  function handleRename() {
    if (!selectedFile) return;
    setRenameMode(true);
    setRenameValue(selectedFile.name);
  }
  function confirmRename() {
    if (!renameValue.trim() || !selectedFile) {
      setRenameMode(false);
      return;
    }
    let newTree = JSON.parse(JSON.stringify(data));
    let newPath = null;
    function renameNode(node, path) {
      const currentPath = path;
      if (currentPath === focusedPath) {
        node.name = renameValue;
        newPath = path.split("/").slice(0, -1).concat(renameValue).join("/");
      } else if (node.type === "folder" && node.children) {
        node.children.forEach((child) =>
          renameNode(child, currentPath + "/" + child.name),
        );
      }
    }
    renameNode(newTree, "root");
    setData(newTree);
    setRenameMode(false);
    // Nach Umbenennen: Fokus und Auswahl auf neuen Namen setzen
    if (newPath) {
      setFocusedPath(newPath);
      // Suche das neue File-Objekt im Baum
      function findNode(node, path, parent = "") {
        const currentPath = parent ? parent + "/" + node.name : node.name;
        if (currentPath === newPath) return node;
        if (node.type === "folder" && node.children) {
          for (let child of node.children) {
            const found = findNode(child, path, currentPath);
            if (found) return found;
          }
        }
        return null;
      }
      const updatedFile = findNode(newTree, newPath);
      setSelectedFile(updatedFile);
    }
  }

  // Datei im Editor öffnen
  function handleOpenFile(fileNode, filePath) {
    setEditMode(true);
    if (onOpenFile) {
      onOpenFile({
        name: fileNode.name,
        path: filePath,
        content: fileNode.content || "",
      });
    }
  }


  return (
    <div
      className="bg-base-200 rounded shadow p-4 min-w-[340px] min-h-[320px] border-2 border-primary flex flex-col"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
    >
      <div className="text-lg font-bold mb-2 flex items-center gap-2">
        <span className="inline-block">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <rect x="2" y="6" width="20" height="12" rx="2" fill="#e3e3e3" />
            <rect x="2" y="6" width="20" height="3" rx="1" fill="#b3b3b3" />
          </svg>
        </span>
        File Explorer
      </div>
      <input
        className="input input-bordered mb-2"
        placeholder="Suchen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ maxWidth: 220 }}
      />
      <div className="flex-1 overflow-y-auto">
        
<FileNode
  node={filteredTree}
  onFileClick={(path, node) => {
    setSelectedFilePath(path);
  }}

          onFileDoubleClick={(node) => {
            if (node.type === "file") {
              function findPath(n, target, path = "root") {
                if (n === target) return path;
                if (n.type === "folder" && n.children) {
                  for (let child of n.children) {
                    const p = findPath(child, target, path + "/" + child.name);
                    if (p) return p;
                  }
                }
                return null;
              }
              const filePath = findPath(data, node);
              handleOpenFile(node, filePath);
            }
          }}
          focusedPath={focusedPath}
          setFocusedPath={setFocusedPath}
          parentPath={""}
          onMove={moveNode}
          dragOverPath={dragOverPath}
          setDragOverPath={setDragOverPath}
        />
      </div>
      {/* Aktionsleiste */}
      <div className="flex gap-2 mt-3">
        <button className="btn btn-xs btn-primary" onClick={handleNewFile}>
          Neue Datei
        </button>
        <button
          className="btn btn-xs btn-secondary"
          onClick={handleCopy}
          disabled={!selectedFile}
        >
          Kopieren
        </button>
        <button
          className="btn btn-xs btn-accent"
          onClick={handleCut}
          disabled={!selectedFile}
        >
          Ausschneiden
        </button>
        <button
          className="btn btn-xs btn-success"
          onClick={handlePaste}
          disabled={!clipboard}
        >
          Einfügen
        </button>
        <button
          className="btn btn-xs btn-warning"
          onClick={handleRename}
          disabled={!selectedFile}
        >
          Umbenennen
        </button>
      </div>
      {/* Umbenennen-Dialog */}
      {renameMode && (
        <div className="mt-2 flex gap-2 items-center">
          <input
            className="input input-bordered input-sm"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
          <button className="btn btn-xs btn-primary" onClick={confirmRename}>
            OK
          </button>
          <button className="btn btn-xs" onClick={() => setRenameMode(false)}>
            Abbrechen
          </button>
        </div>
      )}
      {selectedFile && !renameMode && (
        <div className="mt-4 p-2 bg-base-100 border rounded">
          <div className="font-semibold">Datei ausgewählt:</div>
          <div>{selectedFile.name}</div>
        </div>
      )}
    </div>
  );
}

export default FileExplorer;

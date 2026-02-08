import React, { useState, useRef, useEffect } from "react";
export default function FileExplorer({
  onOpenFile,
  data: propsData,
  setData: propsSetData,
}) {
  // Einfache rekursive Komponente für einen Datei-/Ordner-Knoten
  function FileNode({
    node,
    onFileClick,
    onFileDoubleClick,
    focusedPath,
    setFocusedPath,
    parentPath,
    onMove,
    dragOverPath,
    setDragOverPath,
  }) {
    if (!node) return null;
    const path = parentPath ? parentPath + "/" + node.name : node.name;
    // Highlight nur für exakt dieses Element
    const isFocused = focusedPath === path;
    const isDragOver = dragOverPath === path;
    // Windows/Linux-like Highlight
    const highlightColor = isFocused
      ? "linear-gradient(90deg, #cce6ff 0%, #b3d1ff 100%)" // Windows-like
      : isDragOver
        ? "#ffeeba"
        : undefined;

    const handleClick = (e) => {
      e.stopPropagation();
      onFileClick && onFileClick(path, node);
      setFocusedPath && setFocusedPath(path);
    };

    const handleDoubleClick = (e) => {
      e.stopPropagation();
      onFileDoubleClick && onFileDoubleClick(node);
    };
    // Ordner öffnen/schließen
    const [openFolders, setOpenFolders] = React.useState([]);
    const isOpen = node.type === "folder" && openFolders.includes(path);
    return (
      <div>
        <div
          style={{
            paddingLeft: 16,
            background: highlightColor,
            cursor: "pointer",
            fontWeight: node.type === "folder" ? "bold" : "normal",
            borderRadius: isFocused ? 4 : 0,
            color: isFocused ? "#1a1a1a" : undefined,
            boxShadow: isFocused ? "0 0 0 2px #3399ff33" : undefined,
            transition: "background 0.2s, box-shadow 0.2s",
          }}
          tabIndex={0}
          onClick={handleClick}
          onDoubleClick={(e) => {
            handleDoubleClick(e);
            if (node.type === "folder") {
              if (isOpen) {
                setOpenFolders(openFolders.filter((f) => f !== path));
              } else {
                setOpenFolders([...openFolders, path]);
              }
            }
          }}
        >
          {node.type === "folder"
            ? isOpen
              ? "📂 "
              : "🗂️ "
            : node.type === "file" && /\.(jpg|png|gif)$/i.test(node.name)
              ? "🖼️ "
              : "📄 "}
          {node.name}
        </div>
        {node.type === "folder" &&
          isOpen &&
          node.children &&
          node.children.map((child) => (
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
              openFolders={openFolders}
              setOpenFolders={setOpenFolders}
            />
          ))}
      </div>
    );
  }
  // Filtert den Dateibaum nach dem Suchbegriff (rekursiv)
  function filterTree(node, search) {
    if (!search) return node;
    if (node.type === "file") {
      return node.name.toLowerCase().includes(search.toLowerCase())
        ? node
        : null;
    }
    // Ordner: Kinder filtern
    const filteredChildren = (node.children || [])
      .map((child) => filterTree(child, search))
      .filter(Boolean);
    if (
      filteredChildren.length > 0 ||
      node.name.toLowerCase().includes(search.toLowerCase())
    ) {
      return { ...node, children: filteredChildren };
    }
    return null;
  }

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
  function FileExplorer({
    onOpenFile,
    data: propsData,
    setData: propsSetData,
  }) {
    const [editorFile, setEditorFile] = useState(null);
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
    // Tastatur-Navigation (global für Explorer)
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT") return;
      const flatList = flattenTree(filteredTree);
      const focusIndex = flatList.findIndex((e) => e.path === focusedPath);
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
    const [openFolders, setOpenFolders] = useState(["root"]); // geöffnete Ordner
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

    // ...existing code...

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

    // Standard-Explorer-Ansicht
    return (
      <div
        className="gov-explorer-container"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ outline: "none" }}
      >
        <div className="gov-explorer-header">
          <span className="gov-explorer-icon">🖥️</span>
          <span className="gov-explorer-title">GOV-ARCHIVE EXPLORER</span>
        </div>

        <input
          className="gov-explorer-search"
          placeholder="Suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />

<div className="gov-explorer-list">
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

        if (onOpenFile) {
          onOpenFile({
            name: node.name,
            path: filePath,
            content: node.content || "",
          });
        }
      }
    }}
    focusedPath={focusedPath}
    setFocusedPath={setFocusedPath}
    parentPath=""
    onMove={moveNode}
    dragOverPath={dragOverPath}
    setDragOverPath={setDragOverPath}
  />
</div>

<div className="gov-explorer-actions">
  <button className="gov-btn" onClick={handleNewFile}>Neue Datei</button>
  <button className="gov-btn" onClick={handleCopy} disabled={!selectedFile}>Kopieren</button>
  <button className="gov-btn" onClick={handleCut} disabled={!selectedFile}>Ausschneiden</button>
  <button className="gov-btn" onClick={handlePaste} disabled={!clipboard}>Einfügen</button>
  <button className="gov-btn" onClick={handleRename} disabled={!selectedFile}>Umbenennen</button>
</div>

{renameMode && (
  <div className="gov-explorer-rename">
    <input
      className="gov-explorer-search"
      value={renameValue}
      onChange={(e) => setRenameValue(e.target.value)}
    />
    <button className="gov-btn" onClick={confirmRename}>OK</button>
    <button className="gov-btn" onClick={() => setRenameMode(false)}>Abbrechen</button>
  </div>
)}

{selectedFile && !renameMode && (
  <div className="gov-explorer-selected">
    <div className="gov-explorer-selected-label">Datei ausgewählt:</div>
    <div className="gov-explorer-selected-name">{selectedFile.name}</div>
  </div>
)}
</div>
);
}
}

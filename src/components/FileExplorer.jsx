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
    openFolders: propsOpenFolders,
    setOpenFolders: propsSetOpenFolders,
  }) {
    if (!node) return null;
    const path = parentPath ? parentPath + "/" + node.name : node.name;
    const isFocused = focusedPath === path;
    const isDragOver = dragOverPath === path;
    // Dezentes Highlight (Windows-ähnlich, nicht grell)
    const highlightColor = isFocused
      ? "rgba(0, 120, 215, 0.2)"
      : isDragOver
        ? "rgba(0, 120, 215, 0.12)"
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

    const [localOpenFolders, setLocalOpenFolders] = React.useState([]);
    const openFolders = propsOpenFolders !== undefined ? propsOpenFolders : localOpenFolders;
    const setOpenFolders = propsSetOpenFolders !== undefined ? propsSetOpenFolders : setLocalOpenFolders;
    const isOpen = node.type === "folder" && openFolders.includes(path);

    return (
      <div>
        <div
          style={{
            paddingLeft: 16,
            background: highlightColor,
            cursor: "pointer",
            fontWeight: node.type === "folder" ? "bold" : "normal",
            borderRadius: isFocused ? 2 : 0,
            color: isFocused ? "#e3e3e3" : undefined,
            outline: isFocused ? "1px solid rgba(0, 120, 215, 0.5)" : "none",
            transition: "background 0.15s, outline 0.15s",
          }}
          tabIndex={0}
          onClick={handleClick}
          onDoubleClick={(e) => {
            e.stopPropagation();
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
  // ...existing code...

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
  // Aktueller Ordner: Fokus ist Ordner → dieser; ist Datei → übergeordneter Ordner
  function getCurrentFolderPath() {
    if (!focusedPath || focusedPath === "root") return "root";
    const node = (function find(n, path, parent) {
      const current = parent ? parent + "/" + n.name : n.name;
      if (current === focusedPath) return n;
      if (n.type === "folder" && n.children) {
        for (const c of n.children) {
          const found = find(c, path, current);
          if (found) return found;
        }
      }
      return null;
    })(data, focusedPath, "");
    if (!node) return "root";
    if (node.type === "folder") return focusedPath;
    return focusedPath.split("/").slice(0, -1).join("/") || "root";
  }

  const [editorFile, setEditorFile] = useState(null);

  function doInsertNewItem(name, type) {
    const folderPath = getCurrentFolderPath();
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    const sourceTree = data && data.name ? data : defaultData;
    let newTree = JSON.parse(JSON.stringify(sourceTree));
    function insertItem(node, path) {
      const currentPath = node.name === "root" ? "root" : path;
      if (currentPath === folderPath && node.type === "folder") {
        node.children = node.children || [];
        node.children.push(
          type === "file"
            ? { name: trimmed, type: "file" }
            : { name: trimmed, type: "folder", children: [] }
        );
        return true;
      }
      if (node.type === "folder" && node.children) {
        for (const child of node.children) {
          if (insertItem(child, currentPath + "/" + child.name)) return true;
        }
      }
      return false;
    }
    if (insertItem(newTree, "root")) {
      setData(newTree);
      if (propsSetData === undefined) {
        localStorage.setItem("fileexplorer-data", JSON.stringify(newTree));
      }
    }
    setNewItemMode(null);
    setNewItemName("");
  }

  function handleNewFile() {
    setNewItemMode("file");
    setNewItemName("");
  }

  function handleNewFolder() {
    setNewItemMode("folder");
    setNewItemName("");
  }

  function confirmNewItem() {
    if (!newItemName.trim()) return;
    doInsertNewItem(newItemName, newItemMode);
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
      function insertAtPath(treeNode, currentPath, targetPath, nodeToInsert) {
        if (currentPath === targetPath && treeNode.type === "folder") {
          treeNode.children = treeNode.children || [];
          treeNode.children.push(nodeToInsert);
        } else if (treeNode.type === "folder" && treeNode.children) {
          treeNode.children.forEach((child) =>
            insertAtPath(
              child,
              currentPath + "/" + child.name,
              targetPath,
              nodeToInsert
            )
          );
        }
      }
      let newTree = JSON.parse(JSON.stringify(data));
      const movingNode = findNode(newTree, fromPath);
      if (!movingNode) return;
      newTree = removeNode(newTree, fromPath);
      insertAtPath(newTree, "root", toPath, movingNode);
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
    const rawData = propsData !== undefined ? propsData : internalData;
    // Immer einen gültigen Baum haben (null/undefined → defaultData)
    const data = rawData && rawData.name ? rawData : defaultData;
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
    // ...existing code...
    const [focusedPath, setFocusedPath] = useState("root");
    const [dragOverPath, setDragOverPath] = useState(null);
    const [clipboard, setClipboard] = useState(null); // { node, type: 'copy'|'cut', fromPath }
    const [renameMode, setRenameMode] = useState(false);
    const [renameValue, setRenameValue] = useState("");
    const [listKey, setListKey] = useState(0);
    const [newItemMode, setNewItemMode] = useState(null); // null | 'file' | 'folder'
    const [newItemName, setNewItemName] = useState("");

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

    // Kein Filter mehr, zeige immer den kompletten Baum
    const filteredTree = data;

    // ...existing code...

  function handleCopy() {
    if (!selectedFile) return;
    setClipboard({
      node: JSON.parse(JSON.stringify(selectedFile)),
      type: "copy",
      fromPath: focusedPath,
    });
  }
  function handleCut() {
    if (!selectedFile) return;
    setClipboard({
      node: JSON.parse(JSON.stringify(selectedFile)),
      type: "cut",
      fromPath: focusedPath,
    });
  }

  function handlePaste() {
    if (!clipboard) return;
    const folderPath = getCurrentFolderPath();
    let newTree = JSON.parse(JSON.stringify(data));
    function insertAtPath(treeNode, currentPath, targetPath, nodeToInsert) {
      if (currentPath === targetPath && treeNode.type === "folder") {
        treeNode.children = treeNode.children || [];
        let baseName = nodeToInsert.name;
        let name = baseName;
        let i = 1;
        while (treeNode.children.some((c) => c.name === name)) {
          name = baseName + " (" + i + ")";
          i++;
        }
        treeNode.children.push(
          JSON.parse(JSON.stringify({ ...nodeToInsert, name }))
        );
      } else if (treeNode.type === "folder" && treeNode.children) {
        treeNode.children.forEach((child) =>
          insertAtPath(
            child,
            currentPath + "/" + child.name,
            targetPath,
            nodeToInsert
          )
        );
      }
    }
    insertAtPath(newTree, "root", folderPath, clipboard.node);
    if (clipboard.type === "cut") {
      function removeNodeAt(treeNode, pathToRemove, parent = null) {
        const currentPath = parent ? parent + "/" + treeNode.name : treeNode.name;
        if (currentPath === pathToRemove) return null;
        if (treeNode.type === "folder" && treeNode.children) {
          treeNode.children = treeNode.children
            .map((child) => removeNodeAt(child, pathToRemove, currentPath))
            .filter(Boolean);
        }
        return treeNode;
      }
      newTree = removeNodeAt(newTree, clipboard.fromPath, null);
    }
    setData(newTree);
    setClipboard(null);
  }

  function handleDelete() {
    if (!selectedFile || !focusedPath || focusedPath === "root") return;
    if (!confirm(`"${selectedFile.name}" wirklich löschen?`)) return;
    let newTree = JSON.parse(JSON.stringify(data));
    function removeNodeAt(treeNode, pathToRemove, parent = null) {
      const currentPath = parent ? parent + "/" + treeNode.name : treeNode.name;
      if (currentPath === pathToRemove) return null;
      if (treeNode.type === "folder" && treeNode.children) {
        treeNode.children = treeNode.children
          .map((child) => removeNodeAt(child, pathToRemove, currentPath))
          .filter(Boolean);
      }
      return treeNode;
    }
    newTree = removeNodeAt(newTree, focusedPath, null);
    setData(newTree);
    setSelectedFilePath(null);
    setFocusedPath("root");
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
        setSelectedFilePath(newPath);
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

        {/* Suchfeld entfernt */}

<div className="gov-explorer-list" key={listKey}>
  <FileNode
    node={filteredTree}
    onFileClick={(path) => {
      setSelectedFilePath(path);
      setFocusedPath(path);
    }}
    onFileDoubleClick={(node) => {
      if (node.type === "file" && onOpenFile) {
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
        onOpenFile({
          name: node.name,
          path: filePath,
          content: node.content || "",
        });
      }
    }}
    focusedPath={focusedPath}
    setFocusedPath={setFocusedPath}
    parentPath=""
    onMove={moveNode}
    dragOverPath={dragOverPath}
    setDragOverPath={setDragOverPath}
    openFolders={openFolders}
    setOpenFolders={setOpenFolders}
  />
</div>

<div className="gov-explorer-actions" role="toolbar" aria-label="Aktionen">
  <button type="button" className="gov-btn" onClick={handleNewFile} title="Neue Datei erstellen">Neue Datei</button>
  <button type="button" className="gov-btn" onClick={handleNewFolder} title="Neuen Ordner erstellen">Neuer Ordner</button>
  <button type="button" className="gov-btn" onClick={handleCopy} disabled={!selectedFile} title="Kopieren">Kopieren</button>
  <button type="button" className="gov-btn" onClick={handleCut} disabled={!selectedFile} title="Ausschneiden">Ausschneiden</button>
  <button type="button" className="gov-btn" onClick={handlePaste} disabled={!clipboard} title="Einfügen">Einfügen</button>
  <button type="button" className="gov-btn" onClick={handleDelete} disabled={!selectedFile || focusedPath === "root"} title="Löschen">Löschen</button>
  <button type="button" className="gov-btn" onClick={handleRename} disabled={!selectedFile} title="Umbenennen">Umbenennen</button>
  <button type="button" className="gov-btn" onClick={() => setListKey((k) => k + 1)} title="Ansicht aktualisieren">Aktualisieren</button>
</div>

{newItemMode && (
  <div className="gov-explorer-rename">
    <span className="gov-explorer-rename-label">
      {newItemMode === "file" ? "Dateiname:" : "Ordnername:"}
    </span>
    <input
      value={newItemName}
      onChange={(e) => setNewItemName(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") confirmNewItem();
        if (e.key === "Escape") setNewItemMode(null);
      }}
      placeholder={newItemMode === "file" ? "z.B. readme.txt" : "z.B. Neuer Ordner"}
      autoFocus
    />
    <button type="button" className="gov-btn" onClick={confirmNewItem}>OK</button>
    <button type="button" className="gov-btn" onClick={() => { setNewItemMode(null); setNewItemName(""); }}>Abbrechen</button>
  </div>
)}

{renameMode && (
  <div className="gov-explorer-rename">
    <input
      value={renameValue}
      onChange={(e) => setRenameValue(e.target.value)}
    />
    <button type="button" className="gov-btn" onClick={confirmRename}>OK</button>
    <button type="button" className="gov-btn" onClick={() => setRenameMode(false)}>Abbrechen</button>
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

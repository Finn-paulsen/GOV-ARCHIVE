import React, { useState, useEffect, useRef } from 'react';

export default function FileEditor({ name, content, onSave }) {
  const [value, setValue] = useState(content ?? '');
  const [saved, setSaved] = useState(true);
  const [charCount, setCharCount] = useState((content ?? '').length);
  const [lineCount, setLineCount] = useState((content ?? '').split('\n').length);
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleChange(e) {
    const v = e.target.value;
    setValue(v);
    setSaved(false);
    setCharCount(v.length);
    setLineCount(v.split('\n').length);
  }

  function handleSave() {
    onSave?.(value);
    setSaved(true);
  }

  function handleKeyDown(e) {
    // Ctrl+S speichern
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    // Tab → 4 Leerzeichen einfügen statt Fokus verlieren
    if (e.key === 'Tab') {
      e.preventDefault();
      const pos = e.target.selectionStart;
      const before = value.slice(0, pos);
      const after = value.slice(e.target.selectionEnd);
      const newVal = before + '    ' + after;
      setValue(newVal);
      setSaved(false);
      // Cursor nach dem Tab setzen
      setTimeout(() => {
        textareaRef.current.selectionStart = pos + 4;
        textareaRef.current.selectionEnd = pos + 4;
      }, 0);
    }
  }

  return (
    <div style={styles.container}>
      {/* Titelleiste */}
      <div style={styles.toolbar}>
        <span style={styles.filename}>
          {name || 'Neue Datei'}
          {!saved && <span style={styles.unsaved}> ●</span>}
        </span>
        <button style={styles.saveBtn} onClick={handleSave}>
          Speichern  (Strg+S)
        </button>
      </div>

      {/* Editorbereich */}
      <div style={styles.editorWrap}>
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Statusleiste */}
      <div style={styles.statusbar}>
        <span>{lineCount} Zeilen</span>
        <span>{charCount} Zeichen</span>
        <span style={{ marginLeft: 'auto', color: saved ? '#5a8858' : '#c49030' }}>
          {saved ? 'Gespeichert' : 'Nicht gespeichert'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f5f4f0',
    fontFamily: "'Consolas', 'Courier New', monospace",
    fontSize: '13px',
    color: '#1a1a1a',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#dcdad4',
    borderBottom: '1px solid #b0ada6',
    padding: '6px 12px',
    flexShrink: 0,
  },
  filename: {
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontSize: '13px',
  },
  unsaved: {
    color: '#c49030',
    fontWeight: 'bold',
  },
  saveBtn: {
    background: '#e4e2dc',
    border: '1px solid #a0a0a0',
    borderRadius: '2px',
    padding: '3px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    color: '#1a1a1a',
    fontFamily: 'inherit',
  },
  editorWrap: {
    flex: '1 1 auto',
    display: 'flex',
    minHeight: 0,
    overflow: 'hidden',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: 'none',
    outline: 'none',
    background: '#faf9f6',
    color: '#1a1a1a',
    fontFamily: "'Consolas', 'Courier New', monospace",
    fontSize: '13px',
    lineHeight: '1.6',
    padding: '12px 16px',
    overflow: 'auto',
    whiteSpace: 'pre',
    overflowWrap: 'normal',
  },
  statusbar: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    background: '#dcdad4',
    borderTop: '1px solid #b0ada6',
    padding: '4px 12px',
    fontSize: '11px',
    color: '#555',
    flexShrink: 0,
  },
};

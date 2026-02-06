// Echter Editor für Dateiinhalt mit Speichern
import React, { useState } from 'react';

export default function FileEditor({ name, content, onSave }) {
  const [value, setValue] = useState(content || '');

  // Speichere sofort beim Tippen
  function handleChange(e) {
    const newValue = e.target.value;
    setValue(newValue);
    if (onSave) onSave(newValue);
  }

  return (
    <div className="file-editor">
      <div className="file-editor-head">{name || 'Neue Datei'}</div>
      <textarea
        style={{ width: '100%', minHeight: 220, background: '#181818', color: '#ffbf47', border: '1px solid #ffbf47', fontFamily: 'monospace', fontSize: '1.05rem', padding: 8 }}
        value={value}
        onChange={handleChange}
      />
      <button className="btn btn-primary mt-2" onClick={() => onSave && onSave(value)}>
        Speichern
      </button>
    </div>
  );
}

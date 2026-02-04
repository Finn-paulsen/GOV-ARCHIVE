// Einfache Editor-Komponente für Dateiinhalt
import React from 'react'
export default function FileEditor({ name, content }) {
  return (
    <div className="file-editor">
      <div className="file-editor-head">{name}</div>
      <textarea
        style={{ width: '100%', minHeight: 220, background: '#181818', color: '#ffbf47', border: '1px solid #ffbf47', fontFamily: 'monospace', fontSize: '1.05rem', padding: 8 }}
        defaultValue={content}
        readOnly
      />
    </div>
  )
}

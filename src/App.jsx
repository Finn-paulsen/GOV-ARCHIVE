import React, { useState } from 'react'
import Terminal from './components/Terminal'
import Menu from './components/Menu'
import SwitchPanel from './components/SwitchPanel'
import Timeline from './components/Timeline'
import NetworkGraph from './components/NetworkGraph'

export default function App() {
  const [view, setView] = useState('bio')

  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="terminal-wrapper">
          <Terminal view={view} />
        </div>
        <SwitchPanel />
      </aside>

      <main className="right-panel">
        <Menu current={view} onChange={setView} />

        <section className="content-area">
          {view === 'bio' && <div className="card"><h2>Biografie</h2><p>Beispielinhalt hier.</p></div>}
          {view === 'timeline' && <Timeline />}
          {view === 'trials' && <div className="card"><h2>Gerichtsverfahren</h2><p>Beispielliste...</p></div>}
          {view === 'network' && <NetworkGraph />}
          {view === 'sources' && <div className="card"><h2>Quellen</h2><p>Quellenangaben...</p></div>}
        </section>
      </main>
    </div>
  )
}

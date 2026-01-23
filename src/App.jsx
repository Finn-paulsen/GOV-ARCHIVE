import React, { useState } from 'react'
import Terminal from './components/Terminal'
import Menu from './components/Menu'
import SwitchPanel from './components/SwitchPanel'
import Timeline from './components/Timeline'
import NetworkGraph from './components/NetworkGraph'
import BootSequence from './components/BootSequence'
import Browser from './components/Browser'
import Desktop from './components/Desktop'

export default function App() {
  const [view, setView] = useState('bio')
  const [bootComplete, setBootComplete] = useState(false)

  return (
    <div className="app-shell">
      {!bootComplete && <BootSequence onFinish={()=>setBootComplete(true)} />}
      <aside className="left-panel">
        <div className="terminal-wrapper">
          <Terminal view={view} />
        </div>
        <SwitchPanel />
      </aside>

      <main className="right-panel">
        {/* Desktop replaces the previous menu + content area to provide a logged-in desktop experience */}
        <Desktop view={view} onChange={setView} bootComplete={bootComplete} />
      </main>
    </div>
  )
}

import React, { useState } from 'react'
import BootSequence from './components/BootSequence'
import Desktop from './components/Desktop'

export default function App() {
  const [view, setView] = useState('bio')
  const [bootComplete, setBootComplete] = useState(false)

  return (
    <div className="app-shell">
      {/* Keep BootSequence until boot completes; Desktop handles fullscreen rendering when ready */}
      <BootSequence onFinish={()=>setBootComplete(true)} />
      <Desktop view={view} onChange={setView} bootComplete={bootComplete} />
    </div>
  )
}

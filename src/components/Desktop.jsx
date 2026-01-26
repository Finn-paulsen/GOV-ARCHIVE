import React, { useState, useEffect } from 'react'
// Note: legacy app components removed — the full desktop UI is provided
// via the embedded static demo (iframe) in the authenticated state.

function makeId(){return Math.random().toString(36).slice(2,9)}

export default function Desktop({ view, onChange, bootComplete }){
  const [windows, setWindows] = useState([])
  const [zCounter, setZCounter] = useState(10)
  const [archive, setArchive] = useState([])
    const [desktopItems, setDesktopItems] = useState([])
    const [dragging, setDragging] = useState(null) // {id, offsetX, offsetY}

  useEffect(()=>{
    // load archive from localStorage
    try{
      const raw = localStorage.getItem('browserArchive') || '[]'
      const list = JSON.parse(raw)
      setArchive(list)
    }catch(e){setArchive([])}
      try {
        const rawD = localStorage.getItem('desktopItems') || '[]'
        setDesktopItems(JSON.parse(rawD))
      } catch (e) { setDesktopItems([]) }
  },[])

  function openWindow(opts){
    const id = makeId()
    const z = zCounter + 1
    setZCounter(z)
    const w = {
      id, title: opts.title || 'Fenster', type: opts.type || 'viewer', app: opts.app, content: opts.content || '', minimized:false, z
    }
    setWindows(ws=>[...ws, w])
    return id
  }

  function closeWindow(id){
    setWindows(ws=>ws.filter(w=>w.id!==id))
  }

function pinToDesktop(entry) {
  const item = { id: entry.id || makeId(), title: entry.url, content: entry.html }
  const next = [item, ...desktopItems]
  setDesktopItems(next)
  localStorage.setItem('desktopItems', JSON.stringify(next))
  alert(`${entry.url} auf Desktop gepinnt`)
}

function focusWindow(id) {
  setZCounter(z => {
    const newZ = z + 1
    setWindows(ws =>
      ws.map(w =>
        w.id === id ? { ...w, z: newZ, minimized: false } : w
      )
    )
    return newZ
  })
}

  
    // dragging handlers
 useEffect(() => {
  function onMove(e) {
    if (!dragging) return
    const { id, offsetX, offsetY } = dragging
    const clientX = e.clientX
    const clientY = e.clientY
    setWindows(ws =>
      ws.map(w =>
        w.id === id ? { ...w, x: clientX - offsetX, y: clientY - offsetY } : w
      )
    )
  }

  function onUp() {
    setDragging(null)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)

  return () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
}, [dragging])

    

  function toggleMinimize(id){
    setWindows(ws=>ws.map(w=> w.id===id? {...w, minimized: !w.minimized}: w))
  }

  function openApp(app){
    if(app==='browser') openWindow({type:'app',app:'browser',title:'Browser'})
    if(app==='timeline') openWindow({type:'app',app:'timeline',title:'Timeline'})
    if(app==='network') openWindow({type:'app',app:'network',title:'Network'})
  }

  function openArchiveEntry(entry){
    openWindow({type:'archive',title:entry.url,content:entry.html})
  }

  // If boot is complete, render the external desktop demo as full-screen
  if (bootComplete) {
    return (
      <div style={{position:'fixed', top:0, left:0, right:0, bottom:0}}>
        <iframe
          title="Retro Desktop"
          src="/desktop/index.html?auth=1"
          style={{border:0, width:'100%', height:'100%'}}
        />
      </div>
    )
  }

  return (
    <div className="desktop-root">
      <div className="desktop-icons" role="toolbar" aria-label="Desktop Icons">
        <button className="desktop-icon" onDoubleClick={()=>openApp('browser')} onClick={()=>openApp('browser')}>
          <div className="icon-plate">🌐</div>
          <div className="icon-label">Browser</div>
        </button>
        <button className="desktop-icon" onClick={()=>openApp('timeline')}>
          <div className="icon-plate">📜</div>
          <div className="icon-label">Timeline</div>
        </button>
        <button className="desktop-icon" onClick={()=>openApp('network')}>
          <div className="icon-plate">🔗</div>
          <div className="icon-label">Network</div>
        </button>
        <div style={{height:8}} />
        <div className="archive-section">
          <div style={{fontSize:12,opacity:0.9,marginBottom:6}}>Archiv</div>
          {archive.length===0 && <div style={{fontSize:12,opacity:0.6}}>leer</div>}
          {archive.slice(0,6).map(a=> (
            <button key={a.id || a.ts} className="desktop-icon archive-icon" onClick={()=>openArchiveEntry(a)}>
              <div className="icon-plate">�</div>
              <div className="icon-label">{a.url}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="desktop-window" style={{position:'relative'}}>
        {!bootComplete && <div className="card"><h3>Login erforderlich</h3></div>}
        {bootComplete && (
          // Render the 1:1 desktop UI inside an isolated iframe so styles and scripts don't collide
          <iframe
            title="Retro Desktop"
            src="/desktop/index.html?auth=1"
            style={{position:'absolute', left:0, top:0, width:'100%', height:'100%', border:0}}
          />
        )}
      </div>
    </div>
  )
}

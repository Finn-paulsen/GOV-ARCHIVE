import React, { useState, useEffect } from 'react'
// Note: legacy app components removed — the full desktop UI is provided
// via the embedded static demo (iframe) in the authenticated state.

function makeId(){return Math.random().toString(36).slice(2,9)}

export default function Desktop({ view, onChange, bootComplete }){
  const [iframeLoaded, setIframeLoaded] = useState(false)
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
  // While boot is running we render nothing here — BootSequence covers the screen.
  if (!bootComplete) return null

  // After boot completes render the desktop demo as fullscreen iframe only.
  function handleIFrameLoad(){
    // small delay to allow inner styles to paint, then hide overlay
    setTimeout(()=> setIframeLoaded(true), 80)
  }

  return (
    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0}}>
      {/* loading overlay covers the screen until iframe reports loaded */}
      <div
        aria-hidden={iframeLoaded}
        style={{
          position:'absolute', inset:0, background:'#011217',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#cfeadf', fontFamily:'sans-serif', fontSize:16,
          transition:'opacity 320ms ease',
          opacity: iframeLoaded? 0 : 1,
          pointerEvents: iframeLoaded? 'none' : 'auto',
          zIndex: 99999
        }}
      >
        <div style={{textAlign:'center'}}>
          <div style={{fontWeight:700, marginBottom:8}}>GOV‑ARCHIVE — Desktop wird geladen…</div>
          <div style={{width:220, height:8, background:'rgba(255,255,255,0.06)', borderRadius:6, overflow:'hidden'}}>
            <div style={{width: '28%', height:'100%', background:'linear-gradient(90deg,#9fbf8f,#cfeadf)', animation:'loadBar 1.6s linear infinite'}} />
          </div>
        </div>
      </div>

      <iframe
        title="Retro Desktop"
        src="/desktop/index.html?auth=1"
        onLoad={handleIFrameLoad}
        style={{border:0, width:'100%', height:'100%'}}
      />

      <style>{`@keyframes loadBar{0%{transform:translateX(-10%)}100%{transform:translateX(220%)}}`}</style>
    </div>
  )
}

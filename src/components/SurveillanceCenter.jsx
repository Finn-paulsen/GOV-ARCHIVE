import React, { useState, useRef } from 'react'


// 36 Kameras mit realistischen Namen und Platzhalter-Feeds
const CAMS = [
  { name: 'Treppenhaus', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Fahrstuhl', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Parkplatz', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Hausflur', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Garten', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Lobby', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Kantine', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Serverraum', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Empfang', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Archiv', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Straßenkreuzung', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Bushaltestelle', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'U-Bahn', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Büro', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Lager', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Werkstatt', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Keller', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Dach', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Innenhof', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Garage', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Supermarkt', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Eingang', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Ausgang', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Brücke', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Tunnel', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Kreisel', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Ampel', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Schule', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Spielplatz', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Park', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Tankstelle', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Bäckerei', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Bank', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' },
  { name: 'Apotheke', src: 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif', type: 'gif' },
  { name: 'Krankenhaus', src: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', type: 'gif' },
  { name: 'Polizei', src: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif', type: 'gif' }
]


export default function SurveillanceCenter() {
  const [selected, setSelected] = useState(null) // Index der ausgewählten Kamera oder null für Raster
  const [playing, setPlaying] = useState(true)
  const videoRef = useRef(null)

  // Controls für Einzelansicht
  function handlePlay() {
    setPlaying(true)
    if (videoRef.current) videoRef.current.play()
  }
  function handlePause() {
    setPlaying(false)
    if (videoRef.current) videoRef.current.pause()
  }
  function handleStop() {
    setPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }
  function handleRewind() {
    if (videoRef.current) videoRef.current.currentTime = 0
  }
  function handleForward() {
    if (videoRef.current) videoRef.current.currentTime += 5
  }
  function handleLive() {
    if (videoRef.current) videoRef.current.currentTime = videoRef.current.duration || 0
    setPlaying(true)
    if (videoRef.current) videoRef.current.play()
  }
  function handleSave() {
    alert('Speichern-Funktion ist in dieser Demo nicht implementiert.')
  }

  // Rasteransicht
  if (selected === null) {
    return (
      <div className="surveillance-center">
        <div className="surveillance-header">ÜBERWACHUNGSZENTRALE</div>
        <div className="surveillance-grid">
          {CAMS.map((cam, i) => (
            <div className="surveillance-tile" key={cam.name} onClick={() => setSelected(i)}>
              <div className="surveillance-tile-name">{cam.name}</div>
              <div className="surveillance-tile-feed">
                <img src={cam.src} alt={cam.name} style={{width:'100%',height:'100%',objectFit:'cover',background:'#232323'}} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Einzelansicht
  const cam = CAMS[selected]
  return (
    <div className="surveillance-center">
      <div className="surveillance-header">
        <button className="surveillance-back" onClick={() => setSelected(null)} title="Zurück zum Raster">←</button>
        {cam.name}
      </div>
      <div className="surveillance-feed surveillance-feed-large">
        {cam.type === 'gif' ? (
          <img src={cam.src} alt={cam.name} style={{width:'100%',maxHeight:340,objectFit:'cover',background:'#232323'}} />
        ) : (
          <video ref={videoRef} src={cam.src} controls={false} autoPlay={playing} loop style={{width:'100%',maxHeight:340,objectFit:'cover',background:'#232323'}} />
        )}
      </div>
      <div className="surveillance-controls">
        <button onClick={handlePlay}>▶</button>
        <button onClick={handlePause}>⏸</button>
        <button onClick={handleStop}>⏹</button>
        <button onClick={handleRewind}>⏪</button>
        <button onClick={handleForward}>⏩</button>
        <button onClick={handleLive}>Live</button>
        <button onClick={handleSave}>Speichern</button>
      </div>
    </div>
  )
}

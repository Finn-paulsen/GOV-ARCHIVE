import React, { useState, useRef } from "react";
import "./SurveillanceCenter.css";

// --- KAMERALISTE ---
const CAMS = [
  { name: "Treppenhaus", src: "...", type: "gif", status: "online" },
  { name: "Fahrstuhl", src: "...", type: "gif", status: "online" },
  { name: "Parkplatz", src: "...", type: "gif", status: "online" },
  { name: "Hausflur", src: "...", type: "gif", status: "online" },
  { name: "Garten", src: "...", type: "gif", status: "online" },
  { name: "Lobby", src: "...", type: "gif", status: "online" },

  { name: "Kantine", src: "...", type: "gif", status: "online" },
  { name: "Serverraum", src: "...", type: "gif", status: "online" },
  { name: "Empfang", src: "...", type: "gif", status: "online" },
  { name: "Archiv", src: "...", type: "gif", status: "online" },
  { name: "Straßenkreuzung", src: "...", type: "gif", status: "online" },
  { name: "Bushaltestelle", src: "...", type: "gif", status: "online" },

  { name: "U-Bahn", src: "...", type: "gif", status: "online" },
  { name: "Büro", src: "...", type: "gif", status: "online" },
  { name: "Lager", src: "...", type: "gif", status: "online" },
  { name: "Werkstatt", src: "...", type: "gif", status: "online" },
  { name: "Keller", src: "...", type: "gif", status: "online" },
  { name: "Dach", src: "...", type: "gif", status: "online" },

  { name: "Innenhof", src: "...", type: "gif", status: "online" },
  { name: "Garage", src: "...", type: "gif", status: "online" },
  { name: "Supermarkt", src: "...", type: "gif", status: "online" },
  { name: "Eingang", src: "...", type: "gif", status: "online" },
  { name: "Ausgang", src: "...", type: "gif", status: "online" },
  { name: "Brücke", src: "...", type: "gif", status: "online" },

  { name: "Tunnel", src: "...", type: "gif", status: "online" },
  { name: "Kreisel", src: "...", type: "gif", status: "online" },
  { name: "Ampel", src: "...", type: "gif", status: "online" },
  { name: "Schule", src: "...", type: "gif", status: "online" },
  { name: "Spielplatz", src: "...", type: "gif", status: "online" },
  { name: "Park", src: "...", type: "gif", status: "online" },

  { name: "Tankstelle", src: "...", type: "gif", status: "online" },
  { name: "Bahnhof", src: "...", type: "gif", status: "online" },
  { name: "Hafen", src: "...", type: "gif", status: "online" },
  { name: "Zolltor", src: "...", type: "gif", status: "online" },
  { name: "Grenzposten", src: "...", type: "gif", status: "online" },
  { name: "Kontrollpunkt", src: "...", type: "gif", status: "online" },
];

export default function SurveillanceCenter() {
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(false);
  const videoRef = useRef(null);

  // --- VIDEO CONTROLS ---
  const play = () => videoRef.current?.play();
  const pause = () => videoRef.current?.pause();
  const stop = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };
  const rewind = () => {
    if (videoRef.current) videoRef.current.currentTime -= 5;
  };
  const forward = () => {
    if (videoRef.current) videoRef.current.currentTime += 5;
  };
  const live = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = videoRef.current.duration || 0;
    videoRef.current.play();
  };

  // --- RASTERANSICHT ---
  if (selected === null) {
    return (
      <div className="surveillance-grid">
        {CAMS.map((cam, i) => (
          <div
            key={i}
            className="surveillance-tile"
            onClick={() => setSelected(i)}
          >
            <div className={`surveillance-led ${cam.status}`}></div>

            <div className="surveillance-hud">
              <span className="hud-id">#{String(i + 1).padStart(2, '0')}</span>
              <span className="hud-dot" />
              <span className="hud-fps">24 FPS</span>
              <span className="hud-dot" />
              <span className="hud-bitrate">2.1 Mbps</span>
            </div>

            <div className="surveillance-tile-feed">
              <img
                src={cam.src}
                alt={cam.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "contrast(1.15) brightness(0.9)",
                }}
              />
            </div>

            {cam.status === "offline" && (
              <div className="signal-lost">SIGNAL LOST</div>
            )}

            <div className="surveillance-tile-name">{cam.name}</div>
          </div>
        ))}
      </div>
    );
  }

  // --- EINZELANSICHT ---
  const cam = CAMS[selected];

  return (
    <div className="surveillance-center">
      <div className="surveillance-header">
        <button className="surveillance-back" onClick={() => setSelected(null)}>
          ← Zurück
        </button>
        {cam.name}
      </div>

      <div
        className={`zoomable ${zoom ? "zoomed" : ""}`}
        onDoubleClick={() => setZoom(z => !z)}
        onWheel={(e) => {
          if (e.deltaY < 0) setZoom(true);
          else setZoom(false);
        }}
      >
        {cam.type === "gif" ? (
          <img
            src={cam.src}
            alt={cam.name}
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "cover",
              background: "#232323",
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={cam.src}
            autoPlay
            loop
            style={{
              width: "100%",
              maxHeight: 380,
              objectFit: "cover",
              background: "#232323",
            }}
          />
        )}
      </div>

      <div className="surveillance-controls">
        <button onClick={play}>▶</button>
        <button onClick={pause}>⏸</button>
        <button onClick={stop}>⏹</button>
        <button onClick={rewind}>⏪</button>
        <button onClick={forward}>⏩</button>
        <button onClick={live}>LIVE</button>
      </div>
    </div>
  );
}
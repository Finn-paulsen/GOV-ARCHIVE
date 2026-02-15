import React, { useState } from "react";

import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import europeGeo from '../assets/europe.json';

export default function HiveMindMap({ onClose }) {
  const [position, setPosition] = useState({ coordinates: [10, 50], zoom: 2.2 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  return (
    <div style={{
      background: "#142d14",
      border: "3px solid #3aff3a",
      borderRadius: 10,
      boxShadow: "0 0 32px #0f0a",
      padding: 24,
      maxWidth: 900,
      margin: "40px auto",
      fontFamily: "'Fira Mono', 'Consolas', monospace",
      color: "#baffb0",
      position: "relative"
    }}>
      <button onClick={onClose} style={{position: 'absolute', right: 16, top: 16, background: '#1a3d1a', color: '#baffb0', border: '1px solid #3aff3a', borderRadius: 4, fontFamily: 'inherit', cursor: 'pointer'}}>X</button>
      <h2 style={{textAlign: 'center', color: '#baffb0', letterSpacing: 2, fontWeight: 700, marginBottom: 12}}>HIVE MIND</h2>
      <div style={{background: '#0c1c0c', border: '2px solid #3aff3a', borderRadius: 8, overflow: 'hidden'}}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 400 }}
          style={{ width: "100%", height: 500, background: "#0c1c0c" }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={pos => setPosition(pos)}
            onMoveStart={pos => setPosition(pos)}
          >
            <Geographies geography={europeGeo}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: "#1a3d1a",
                        stroke: "#3aff3a",
                        strokeWidth: 0.7,
                        outline: "none"
                      },
                      hover: {
                        fill: "#3aff3a",
                        stroke: "#baffb0",
                        strokeWidth: 1.2,
                        outline: "none"
                      },
                      pressed: {
                        fill: "#baffb0",
                        stroke: "#3aff3a",
                        outline: "none"
                      }
                    }}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div style={{marginTop: 10, fontSize: 15, color: '#baffb0', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between'}}>
        <span>center: {position.coordinates[1].toFixed(3)}, {position.coordinates[0].toFixed(3)}</span>
        <span>zoom: {position.zoom.toFixed(2)}</span>
        <span>mouse: {mouse.y.toFixed(3)}, {mouse.x.toFixed(3)}</span>
      </div>
      <div style={{marginTop: 8, fontSize: 13, color: '#3aff3a', textAlign: 'center'}}>Karte: Open Data, Stil: Retro-Terminal</div>
    </div>
  );
}

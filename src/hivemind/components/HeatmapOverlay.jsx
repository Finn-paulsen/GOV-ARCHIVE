import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * HeatmapOverlay zeigt eine Heatmap für Standorte mit Wert (z.B. Auslastung, Störung).
 * Erwartet ein Array von Objekten mit position: [lat, lng] und intensity (0-1).
 */
export function HeatmapOverlay({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const heatLayer = L.heatLayer(
      points.map(p => [...p.position, p.intensity || 0.5]),
      { radius: 25, blur: 18, maxZoom: 8, minOpacity: 0.2 }
    ).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);
  return null;
}

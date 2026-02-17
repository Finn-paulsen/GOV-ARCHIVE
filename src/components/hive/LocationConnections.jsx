import { Polyline } from 'react-leaflet';


// Beispielhafte Verbindungen zwischen Standorten (über IDs)
const CONNECTIONS = [
  ['power-1', 'base-1'],
  ['base-1', 'server-1'],
  ['power-1', 'server-1'],
];


function getPositionById(id, locations) {
  if (!Array.isArray(locations)) return null;
  const loc = locations.find(l => l.id === id);
  return loc ? loc.position : null;
}

export function LocationConnections({ locations }) {
  return (
    <>
      {CONNECTIONS.map(([from, to], idx) => {
        const fromPos = getPositionById(from, locations || []);
        const toPos = getPositionById(to, locations || []);
        if (!fromPos || !toPos) return null;
        return (
          <Polyline
            key={idx}
            positions={[fromPos, toPos]}
            pathOptions={{ color: '#b0b7c3', weight: 2, dashArray: '6 6' }}
          />
        );
      })}
    </>
  );
}

import { Marker, Popup } from 'react-leaflet';
import { FaTrain } from 'react-icons/fa';
import { Button, Typography, Divider } from '@mui/material';

const STATIONS = [
  {
    id: 'station-berlin',
    name: 'Berlin Hauptbahnhof',
    position: [52.5251, 13.3694],
    infoUrl: 'https://de.wikipedia.org/wiki/Berlin_Hauptbahnhof',
    description: 'Größter Kreuzungsbahnhof Europas, eröffnet 2006.'
  },
  {
    id: 'station-munich',
    name: 'München Hbf',
    position: [48.1402, 11.5586],
    infoUrl: 'https://de.wikipedia.org/wiki/M%C3%BCnchen_Hauptbahnhof',
    description: 'Wichtiger Fern- und Regionalbahnhof in Süddeutschland.'
  },
  {
    id: 'station-frankfurt',
    name: 'Frankfurt (Main) Hbf',
    position: [50.1071, 8.6638],
    infoUrl: 'https://de.wikipedia.org/wiki/Frankfurt_(Main)_Hauptbahnhof',
    description: 'Drehkreuz im deutschen Bahnnetz, eröffnet 1888.'
  },
  {
    id: 'station-hamburg',
    name: 'Hamburg Hbf',
    position: [53.5526, 10.0067],
    infoUrl: 'https://de.wikipedia.org/wiki/Hamburg_Hauptbahnhof',
    description: 'Größter Bahnhof Norddeutschlands.'
  },
];

export function StationMarkers() {
  return (
    <>
      {STATIONS.map(st => (
        <Marker key={st.id} position={st.position}>
          <Popup>
            <div style={{ minWidth: 200 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2a4a7b', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaTrain style={{ marginRight: 6 }} /> {st.name}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>{st.description}</Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ color: '#2a4a7b', borderColor: '#2a4a7b' }}
                href={st.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Mehr Infos
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

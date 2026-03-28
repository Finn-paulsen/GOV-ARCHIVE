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
  // ...Implementierung folgt...
  return null;
}

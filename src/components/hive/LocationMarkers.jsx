import { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { FaBolt, FaBuilding, FaServer } from 'react-icons/fa';
import { Button, Typography, Divider } from '@mui/material';

// Terminal Components
import TerminalModal from './terminals/TerminalModal';
import PowerPlantTerminal from './terminals/terminals/PowerPlantTerminal';
import AirportTerminal from './terminals/terminals/AirportTerminal';
import MilitaryBaseTerminal from './terminals/terminals/MilitaryBaseTerminal';
import ServerFarmTerminal from './terminals/terminals/ServerFarmTerminal';
import WaterTreatmentTerminal from './terminals/terminals/WaterTreatmentTerminal';
import HospitalTerminal from './terminals/terminals/HospitalTerminal';
import FireStationTerminal from './terminals/terminals/FireStationTerminal';
import PoliceStationTerminal from './terminals/terminals/PoliceStationTerminal';
import GovernmentTerminal from './terminals/terminals/GovernmentTerminal';
import SchoolTerminal from './terminals/terminals/SchoolTerminal';
import CityHallTerminal from './terminals/terminals/CityHallTerminal';
import BridgeTerminal from './terminals/terminals/BridgeTerminal';
import PortTerminal from './terminals/terminals/PortTerminal';
import EnergyTerminal from './terminals/terminals/EnergyTerminal';
import MetroTerminal from './terminals/terminals/MetroTerminal';
import UniversityTerminal from './terminals/terminals/UniversityTerminal';
import ControlTerminal from './terminals/terminals/ControlTerminal';

// Beispielhafte Standorte und Typen
// Standorte werden jetzt dynamisch über props.locations übergeben

const typeIcon = {
  power: <FaBolt color="#2a4a7b" />,
  base: <FaBuilding color="#2a4a7b" />,
  server: <FaServer color="#2a4a7b" />,
  gov: <FaBuilding color="#2a4a7b" />,
  airport: <FaBuilding color="#2a4a7b" />,
  water: <FaBuilding color="#2a4a7b" />,
  control: <FaBuilding color="#2a4a7b" />,
  hospital: <FaBuilding color="#2a4a7b" />,
  fire: <FaBuilding color="#2a4a7b" />,
  police: <FaBuilding color="#2a4a7b" />,
  school: <FaBuilding color="#2a4a7b" />,
  cityhall: <FaBuilding color="#2a4a7b" />,
  bridge: <FaBuilding color="#2a4a7b" />,
  port: <FaBuilding color="#2a4a7b" />,
  energy: <FaBolt color="#2a4a7b" />,
  metro: <FaBuilding color="#2a4a7b" />,
  university: <FaBuilding color="#2a4a7b" />,
};

const statusLabel = {
  active: 'Aktiv',
  critical: 'Kritisch',
  offline: 'Offline',
};

const buttonLabel = {
  power: 'Kraftwerk-Kontrolle öffnen',
  airport: 'Flughafen-Kontrolle öffnen',
  base: 'Militärbasis-Kontrolle öffnen',
  server: 'Serverfarm-Kontrolle öffnen',
  water: 'Wasserwerk-Kontrolle öffnen',
  hospital: 'Krankenhaus-Kontrolle öffnen',
  fire: 'Feuerwache-Kontrolle öffnen',
  police: 'Polizeistation-Kontrolle öffnen',
  gov: 'Regierungs-Kontrolle öffnen',
  school: 'Schul-Kontrolle öffnen',
  cityhall: 'Rathaus-Kontrolle öffnen',
  bridge: 'Brücken-Kontrolle öffnen',
  port: 'Hafen-Kontrolle öffnen',
  energy: 'Energie-Kontrolle öffnen',
  metro: 'Metro-Kontrolle öffnen',
  university: 'Universitäts-Kontrolle öffnen',
  control: 'Kontrollzentrum öffnen',
};

export function LocationMarkers({ typeFilter, locations, filters }) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const handleOpenTerminal = (location) => {
    setSelectedFacility(location);
    setTerminalOpen(true);
  };

  const handleCloseTerminal = () => {
    setTerminalOpen(false);
    setSelectedFacility(null);
  };

  const renderTerminal = () => {
    if (!selectedFacility) return null;

    const terminalComponents = {
      power: PowerPlantTerminal,
      airport: AirportTerminal,
      base: MilitaryBaseTerminal,
      server: ServerFarmTerminal,
      water: WaterTreatmentTerminal,
      hospital: HospitalTerminal,
      fire: FireStationTerminal,
      police: PoliceStationTerminal,
      gov: GovernmentTerminal,
      school: SchoolTerminal,
      cityhall: CityHallTerminal,
      bridge: BridgeTerminal,
      port: PortTerminal,
      energy: EnergyTerminal,
      metro: MetroTerminal,
      university: UniversityTerminal,
      control: ControlTerminal,
    };

    const TerminalComponent = terminalComponents[selectedFacility.type] || ControlTerminal;

    return (
      <TerminalModal isOpen={terminalOpen} onClose={handleCloseTerminal}>
        <TerminalComponent location={selectedFacility} onClose={handleCloseTerminal} />
      </TerminalModal>
    );
  };
  // Multi-criteria filtering
  const filtered = (locations || []).filter(loc => {
    // Legacy single type filter (if provided)
    if (typeFilter && loc.type !== typeFilter) {
      return false;
    }
    
    // New multi-filter support
    if (filters) {
      // Type filter
      if (filters.types && filters.types.length > 0 && !filters.types.includes(loc.type)) {
        return false;
      }
      
      // Status filter
      if (filters.statuses && filters.statuses.length > 0 && !filters.statuses.includes(loc.status)) {
        return false;
      }
      
      // Country filter
      if (filters.countries && filters.countries.length > 0 && !filters.countries.includes(loc.country)) {
        return false;
      }
      
      // Search filter
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        const matchesName = loc.name.toLowerCase().includes(searchLower);
        const matchesDescription = loc.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }
    }
    
    return true;
  });

  return (
    <>
      <MarkerClusterGroup>
        {filtered.map(loc => (
          <Marker key={loc.id} position={loc.position}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2a4a7b', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {typeIcon[loc.type]} {loc.name}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Status: <b style={{ color: '#2a4a7b' }}>{statusLabel[loc.status]}</b>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{loc.description}</Typography>
                {Array.isArray(loc.history) && loc.history.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Status-Verlauf:</Typography>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      {loc.history.map((h, idx) => (
                        <li key={idx} style={{ fontSize: 13, color: '#2a4a7b' }}>
                          {new Date(h.timestamp).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}: <b>{statusLabel[h.status] || h.status}</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: '#2a4a7b', color: '#fff', boxShadow: 'none', '&:hover': { backgroundColor: '#1a2a4a' } }}
                    onClick={() => handleOpenTerminal(loc)}
                  >
                    {buttonLabel[loc.type] || 'Kontrolle öffnen'}
                  </Button>
                  {loc.infoUrl && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ color: '#2a4a7b', borderColor: '#2a4a7b' }}
                      href={loc.infoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Mehr Infos
                    </Button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
      {renderTerminal()}
    </>
  );
}

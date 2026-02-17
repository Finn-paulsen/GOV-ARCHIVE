import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';

export default function UniversityTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('campus');
  
  // Campus state
  const [studentsOnCampus, setStudentsOnCampus] = useState(8247);
  const [facultyPresent, setFacultyPresent] = useState(342);
  const [buildings, setBuildings] = useState({
    mainHall: true,
    scienceBuilding: true,
    library: true,
    engineering: true,
    dormitories: false
  });
  
  // Research state
  const [labsActive] = useState(24);
  const [experiments, setExperiments] = useState(47);
  const [computeCluster, setComputeCluster] = useState(true);
  const [researchFacilities, setResearchFacilities] = useState({
    physics: true,
    chemistry: true,
    biology: false,
    computing: true
  });
  
  // Library state
  const [libraryOccupancy, setLibraryOccupancy] = useState(487);
  const [booksCheckedOut] = useState(1247);
  const [studyRooms, setStudyRooms] = useState({
    room1: true,
    room2: true,
    room3: false,
    room4: true
  });
  const [digitalAccess, setDigitalAccess] = useState(true);
  
  // Systems state
  const [networkLoad, setNetworkLoad] = useState(67);
  const [hvacStatus, setHvacStatus] = useState(true);
  const [security, setSecurity] = useState(true);
  const [campusWide, setCampusWide] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudentsOnCampus(prev => Math.max(0, Math.min(12000, prev + Math.floor(Math.random() * 100 - 50))));
      setFacultyPresent(prev => Math.max(0, Math.min(500, prev + Math.floor(Math.random() * 10 - 5))));
      setExperiments(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)));
      setLibraryOccupancy(prev => Math.max(0, Math.min(800, prev + Math.floor(Math.random() * 20 - 10))));
      setNetworkLoad(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'campus', label: 'Campus' },
    { id: 'research', label: 'Forschung' },
    { id: 'library', label: 'Bibliothek' },
    { id: 'systems', label: 'Systeme' }
  ];

  const handleBuildingToggle = (building) => {
    setBuildings(prev => ({
      ...prev,
      [building]: !prev[building]
    }));
  };

  const handleResearchToggle = (facility) => {
    setResearchFacilities(prev => ({
      ...prev,
      [facility]: !prev[facility]
    }));
  };

  const handleStudyRoomToggle = (room) => {
    setStudyRooms(prev => ({
      ...prev,
      [room]: !prev[room]
    }));
  };

  const renderCampusControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Studenten auf Campus"
        value={studentsOnCampus.toLocaleString()}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Fakultätsmitglieder"
        value={facultyPresent.toString()}
        color="blue"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Gebäude</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Hauptgebäude"
            active={buildings.mainHall}
            onChange={() => handleBuildingToggle('mainHall')}
          />
          <ToggleSwitch
            label="Naturwissenschaften"
            active={buildings.scienceBuilding}
            onChange={() => handleBuildingToggle('scienceBuilding')}
          />
          <ToggleSwitch
            label="Bibliothek"
            active={buildings.library}
            onChange={() => handleBuildingToggle('library')}
          />
          <ToggleSwitch
            label="Ingenieurwesen"
            active={buildings.engineering}
            onChange={() => handleBuildingToggle('engineering')}
          />
          <ToggleSwitch
            label="Wohnheime"
            active={buildings.dormitories}
            onChange={() => handleBuildingToggle('dormitories')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Campus Einrichtungen</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Hörsäle" color="green" />
          <LEDIndicator label="Mensa" color="green" />
          <LEDIndicator label="Sporthalle" color="green" />
          <LEDIndicator label="Parkplätze" color="yellow" />
        </div>
      </div>
    </div>
  );

  const renderResearchControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktive Labore"
        value={`${labsActive} / 32`}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Laufende Experimente"
        value={experiments.toString()}
        color="blue"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Rechencluster</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="HPC Cluster"
            active={computeCluster}
            onChange={setComputeCluster}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Cluster 1" color="green" />
          <LEDIndicator label="Cluster 2" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Forschungseinrichtungen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Physik Labor"
            active={researchFacilities.physics}
            onChange={() => handleResearchToggle('physics')}
          />
          <ToggleSwitch
            label="Chemie Labor"
            active={researchFacilities.chemistry}
            onChange={() => handleResearchToggle('chemistry')}
          />
          <ToggleSwitch
            label="Biologie Labor"
            active={researchFacilities.biology}
            onChange={() => handleResearchToggle('biology')}
          />
          <ToggleSwitch
            label="Rechenzentrum"
            active={researchFacilities.computing}
            onChange={() => handleResearchToggle('computing')}
          />
        </div>
      </div>
    </div>
  );

  const renderLibraryControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={libraryOccupancy}
        min={0}
        max={800}
        unit=""
        label="Bibliothek Belegung"
        zones={[
          { max: 600, color: '#33ff33' },
          { max: 750, color: '#ffaa00' },
          { max: 800, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Ausgeliehene Bücher"
        value={booksCheckedOut.toLocaleString()}
        color="blue"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Digital</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Online Zugang"
            active={digitalAccess}
            onChange={setDigitalAccess}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Katalog" color="green" />
          <LEDIndicator label="E-Books" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Lernräume</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Raum 1"
            active={studyRooms.room1}
            onChange={() => handleStudyRoomToggle('room1')}
          />
          <ToggleSwitch
            label="Raum 2"
            active={studyRooms.room2}
            onChange={() => handleStudyRoomToggle('room2')}
          />
          <ToggleSwitch
            label="Raum 3"
            active={studyRooms.room3}
            onChange={() => handleStudyRoomToggle('room3')}
          />
          <ToggleSwitch
            label="Raum 4"
            active={studyRooms.room4}
            onChange={() => handleStudyRoomToggle('room4')}
          />
        </div>
      </div>
    </div>
  );

  const renderSystemsControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={networkLoad}
        min={0}
        max={100}
        unit="%"
        label="Netzwerk Auslastung"
        zones={[
          { max: 70, color: '#33ff33' },
          { max: 90, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Systeme</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="HVAC"
            active={hvacStatus}
            onChange={setHvacStatus}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Sicherheit"
              active={security}
              onChange={setSecurity}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Campus WiFi"
              active={campusWide}
              onChange={setCampusWide}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Universität Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Campus" 
            color={studentsOnCampus > 5000 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Forschung" 
            color={labsActive > 20 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Bibliothek" 
            color={digitalAccess ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Netzwerk" 
            color={networkLoad < 90 && campusWide ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Sicherheit" 
            color={security ? 'green' : 'red'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Universität: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'campus' && renderCampusControls()}
      {activeTab === 'research' && renderResearchControls()}
      {activeTab === 'library' && renderLibraryControls()}
      {activeTab === 'systems' && renderSystemsControls()}
    </BaseTerminal>
  );
}

UniversityTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

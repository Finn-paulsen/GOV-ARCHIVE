import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';

export default function SchoolTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('attendance');
  
  // Attendance state
  const [studentsPresent, setStudentsPresent] = useState(487);
  const [staffPresent] = useState(42);
  const [attendance, setAttendance] = useState(94.5);
  
  // Classrooms state
  const [classroomsActive] = useState(18);
  const [wings, setWings] = useState({
    mainBuilding: true,
    scienceWing: true,
    artsWing: true,
    gymWing: false
  });
  
  // Security state
  const [entrancesOpen, setEntrancesOpen] = useState({
    mainDoor: true,
    sideDoor: false,
    emergencyExit: false
  });
  const [lockdownMode] = useState(false);
  const [camerasOnline] = useState(24);
  
  // Facilities state
  const [cafeteriaOpen, setCafeteriaOpen] = useState(true);
  const [libraryOccupancy, setLibraryOccupancy] = useState(32);
  const [hvacStatus, setHvacStatus] = useState(true);
  const [temperature, setTemperature] = useState(21);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudentsPresent(prev => Math.max(0, Math.min(520, prev + Math.floor(Math.random() * 5 - 2))));
      setAttendance((studentsPresent / 520) * 100);
      setLibraryOccupancy(prev => Math.max(0, Math.min(50, prev + Math.floor(Math.random() * 3 - 1))));
      setTemperature(20 + Math.random() * 3);
    }, 4000);

    return () => clearInterval(interval);
  }, [studentsPresent]);

  const tabs = [
    { id: 'attendance', label: 'Anwesenheit' },
    { id: 'classrooms', label: 'Klassenräume' },
    { id: 'security', label: 'Sicherheit' },
    { id: 'facilities', label: 'Einrichtungen' }
  ];

  const handleWingToggle = (wing) => {
    setWings(prev => ({
      ...prev,
      [wing]: !prev[wing]
    }));
  };

  const handleEntranceToggle = (entrance) => {
    setEntrancesOpen(prev => ({
      ...prev,
      [entrance]: !prev[entrance]
    }));
  };

  const renderAttendanceControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Schüler Anwesend"
        value={`${studentsPresent} / 520`}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Personal Anwesend"
        value={`${staffPresent} / 45`}
        color="green"
      />
      
      <AnalogGauge
        value={attendance}
        min={0}
        max={100}
        unit="%"
        label="Anwesenheitsquote"
        zones={[
          { max: 80, color: '#ff3333' },
          { max: 90, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Tagesstatus</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Unterricht" color="green" />
          <LEDIndicator label="Pause" color="off" />
          <LEDIndicator label="Mittagessen" color="off" />
        </div>
      </div>
    </div>
  );

  const renderClassroomsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktive Klassenräume"
        value={`${classroomsActive} / 24`}
        color="green"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Gebäudeflügel</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Hauptgebäude"
            active={wings.mainBuilding}
            onChange={() => handleWingToggle('mainBuilding')}
          />
          <ToggleSwitch
            label="Naturwissenschaften"
            active={wings.scienceWing}
            onChange={() => handleWingToggle('scienceWing')}
          />
          <ToggleSwitch
            label="Kunst & Musik"
            active={wings.artsWing}
            onChange={() => handleWingToggle('artsWing')}
          />
          <ToggleSwitch
            label="Sporthalle"
            active={wings.gymWing}
            onChange={() => handleWingToggle('gymWing')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Fachbereiche</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Mathematik" color="green" />
          <LEDIndicator label="Sprachen" color="green" />
          <LEDIndicator label="Wissenschaften" color="green" />
          <LEDIndicator label="Sport" color="yellow" />
        </div>
      </div>
    </div>
  );

  const renderSecurityControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Kameras Online"
        value={`${camerasOnline} / 28`}
        color={camerasOnline < 24 ? 'yellow' : 'green'}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Eingänge</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Haupteingang"
            active={entrancesOpen.mainDoor}
            onChange={() => handleEntranceToggle('mainDoor')}
            disabled={lockdownMode}
          />
          <ToggleSwitch
            label="Seiteneingang"
            active={entrancesOpen.sideDoor}
            onChange={() => handleEntranceToggle('sideDoor')}
            disabled={lockdownMode}
          />
          <ToggleSwitch
            label="Notausgang"
            active={entrancesOpen.emergencyExit}
            onChange={() => handleEntranceToggle('emergencyExit')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Sicherheitsstatus</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Zutrittskontrolle" color="green" />
          <LEDIndicator label="Feueralarm" color="off" />
          <LEDIndicator label="Lockdown" color={lockdownMode ? 'red' : 'off'} pulse={lockdownMode} />
        </div>
      </div>
    </div>
  );

  const renderFacilitiesControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={libraryOccupancy}
        min={0}
        max={50}
        unit=""
        label="Bibliothek Belegung"
        zones={[
          { max: 40, color: '#33ff33' },
          { max: 48, color: '#ffaa00' },
          { max: 50, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={temperature}
        min={0}
        max={30}
        unit="°C"
        label="Temperatur"
        zones={[
          { max: 19, color: '#3399ff' },
          { max: 24, color: '#33ff33' },
          { max: 30, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Einrichtungen</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Cafeteria Geöffnet"
            active={cafeteriaOpen}
            onChange={setCafeteriaOpen}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Klimaanlage"
              active={hvacStatus}
              onChange={setHvacStatus}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Bereiche</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Bibliothek" color="green" />
          <LEDIndicator label="Cafeteria" color={cafeteriaOpen ? 'green' : 'off'} />
          <LEDIndicator label="Auditorium" color="off" />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Schule: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'attendance' && renderAttendanceControls()}
      {activeTab === 'classrooms' && renderClassroomsControls()}
      {activeTab === 'security' && renderSecurityControls()}
      {activeTab === 'facilities' && renderFacilitiesControls()}
    </BaseTerminal>
  );
}

SchoolTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

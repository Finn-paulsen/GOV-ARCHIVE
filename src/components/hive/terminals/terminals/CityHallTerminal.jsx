import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';

export default function CityHallTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('admin');
  
  // Administration state
  const [citizenServices, setCitizenServices] = useState(47);
  const [permitsIssued, setPermitsIssued] = useState(12);
  const [publicMeetings, UNUSED_setPublicMeetings] = useState(2);
  
  // Departments state
  const [departments, setDepartments] = useState({
    administration: true,
    planning: true,
    finance: true,
    publicWorks: true
  });
  const [staffPresent, UNUSED_setStaffPresent] = useState(127);
  
  // Records state
  const [recordsAccessed, setRecordsAccessed] = useState(234);
  const [archiveSystem, setArchiveSystem] = useState(true);
  const [databaseLoad, setDatabaseLoad] = useState(45);
  
  // Building state
  const [publicAccess, setPublicAccess] = useState(true);
  const [councilChamber, setCouncilChamber] = useState(false);
  const [temperature, setTemperature] = useState(22);
  const [occupancy, setOccupancy] = useState(312);

  useEffect(() => {
    const interval = setInterval(() => {
      setCitizenServices(prev => Math.max(0, prev + Math.floor(Math.random() * 5 - 2)));
      setPermitsIssued(_prev => _prev + Math.floor(Math.random() * 2));
      setRecordsAccessed(_prev => _prev + Math.floor(Math.random() * 10));
      setDatabaseLoad(_prev => Math.max(0, Math.min(100, _prev + (Math.random() - 0.5) * 5)));
      setTemperature(_prev => 21 + Math.random() * 2);
      setOccupancy(_prev => Math.max(0, Math.min(500, _prev + Math.floor(Math.random() * 10 - 5))));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'admin', label: 'Verwaltung' },
    { id: 'departments', label: 'Abteilungen' },
    { id: 'records', label: 'Archiv' },
    { id: 'building', label: 'Gebäude' }
  ];

  const handleDepartmentToggle = (dept) => {
    setDepartments(prev => ({
      ...prev,
      [dept]: !prev[dept]
    }));
  };

  const renderAdminControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Bürgerservices Aktiv"
        value={citizenServices.toString()}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Genehmigungen Heute"
        value={permitsIssued.toString()}
        color="blue"
      />
      
      <DigitalDisplay
        label="Öffentliche Sitzungen"
        value={publicMeetings.toString()}
        color={publicMeetings > 0 ? 'green' : 'off'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Services</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Bürgerbüro" color="green" />
          <LEDIndicator label="Standesamt" color="green" />
          <LEDIndicator label="Bauamt" color="green" />
        </div>
      </div>
    </div>
  );

  const renderDepartmentsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Personal Anwesend"
        value={`${staffPresent} / 145`}
        color="green"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Abteilungen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Verwaltung"
            active={departments.administration}
            onChange={() => handleDepartmentToggle('administration')}
          />
          <ToggleSwitch
            label="Stadtplanung"
            active={departments.planning}
            onChange={() => handleDepartmentToggle('planning')}
          />
          <ToggleSwitch
            label="Finanzen"
            active={departments.finance}
            onChange={() => handleDepartmentToggle('finance')}
          />
          <ToggleSwitch
            label="Tiefbau"
            active={departments.publicWorks}
            onChange={() => handleDepartmentToggle('publicWorks')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Abteilungsstatus</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Personal" color="green" />
          <LEDIndicator label="IT Systeme" color="green" />
          <LEDIndicator label="Telefonie" color="green" />
          <LEDIndicator label="Netzwerk" color="green" />
        </div>
      </div>
    </div>
  );

  const renderRecordsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Zugriffe Heute"
        value={recordsAccessed.toLocaleString()}
        color="blue"
        size="large"
      />
      
      <AnalogGauge
        value={databaseLoad}
        min={0}
        max={100}
        unit="%"
        label="Datenbank Auslastung"
        zones={[
          { max: 70, color: '#33ff33' },
          { max: 90, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Archivsystem</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Online Archiv"
            active={archiveSystem}
            onChange={setArchiveSystem}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Datenbank" color={archiveSystem ? 'green' : 'red'} />
          <LEDIndicator label="Backup" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Archive</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Bauakten" color="green" />
          <LEDIndicator label="Personenstand" color="green" />
          <LEDIndicator label="Grundbuch" color="green" />
        </div>
      </div>
    </div>
  );

  const renderBuildingControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={occupancy}
        min={0}
        max={500}
        unit=""
        label="Gebäude Belegung"
        zones={[
          { max: 400, color: '#33ff33' },
          { max: 475, color: '#ffaa00' },
          { max: 500, color: '#ff3333' }
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
        <div className="terminal-panel-header">Zugang</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Öffentlicher Zugang"
            active={publicAccess}
            onChange={setPublicAccess}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Ratssaal"
              active={councilChamber}
              onChange={setCouncilChamber}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Systeme</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="HVAC" color="green" />
          <LEDIndicator label="Aufzüge" color="green" />
          <LEDIndicator label="Sicherheit" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Rathaus Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Bürgerservices" 
            color={citizenServices > 0 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Abteilungen" 
            color="green" 
          />
          <LEDIndicator 
            label="Archiv" 
            color={archiveSystem ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Gebäude" 
            color={publicAccess ? 'green' : 'yellow'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Rathaus: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'admin' && renderAdminControls()}
      {activeTab === 'departments' && renderDepartmentsControls()}
      {activeTab === 'records' && renderRecordsControls()}
      {activeTab === 'building' && renderBuildingControls()}
    </BaseTerminal>
  );
}

CityHallTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

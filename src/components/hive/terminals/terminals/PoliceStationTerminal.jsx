import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function PoliceStationTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('dispatch');
  
  // Dispatch state
  const [activeCalls, setActiveCalls] = useState(8);
  const [unitsOnPatrol] = useState(12);
  const [unitsAvailable] = useState(6);
  const [priority1Calls, setPriority1Calls] = useState(2);
  
  // Surveillance state
  const [camerasOnline, setCamerasOnline] = useState(47);
  const [alertZones, setAlertZones] = useState({
    downtown: true,
    residential: false,
    industrial: true,
    commercial: true
  });
  const [facialRecognition, setFacialRecognition] = useState(true);
  
  // Holding state
  const [cellsOccupied] = useState(8);
  const [detainees, setDetainees] = useState(11);
  const [processingQueue] = useState(3);
  
  // Systems state
  const [databaseOnline, setDatabaseOnline] = useState(true);
  const [radioSystem, setRadioSystem] = useState(true);
  const [lockdownMode, setLockdownMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCalls(prev => Math.max(0, Math.min(30, prev + Math.floor(Math.random() * 3 - 1))));
      setPriority1Calls(prev => Math.max(0, Math.min(10, prev + Math.floor(Math.random() * 2 - 0.5))));
      setCamerasOnline(prev => Math.max(0, Math.min(50, prev + Math.floor(Math.random() * 3 - 1))));
      setDetainees(prev => Math.max(0, prev + Math.floor(Math.random() * 2 - 0.5)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dispatch', label: 'Leitstelle' },
    { id: 'surveillance', label: 'Überwachung' },
    { id: 'holding', label: 'Gewahrsam' },
    { id: 'systems', label: 'Systeme' }
  ];

  const handleZoneToggle = (zone) => {
    setAlertZones(prev => ({
      ...prev,
      [zone]: !prev[zone]
    }));
  };

  const handleLockdown = () => {
    setLockdownMode(true);
  };

  const renderDispatchControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktive Einsätze"
        value={activeCalls.toString()}
        color={activeCalls > 20 ? 'red' : activeCalls > 10 ? 'yellow' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="Priorität 1"
        value={priority1Calls.toString()}
        color={priority1Calls > 5 ? 'red' : priority1Calls > 0 ? 'yellow' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="Streifen im Einsatz"
        value={`${unitsOnPatrol} / ${unitsOnPatrol + unitsAvailable}`}
        color={unitsAvailable < 3 ? 'red' : 'green'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Einsatztypen</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Einbruch" color="yellow" />
          <LEDIndicator label="Verkehr" color="green" />
          <LEDIndicator label="Notfall" color={priority1Calls > 0 ? 'red' : 'off'} pulse={priority1Calls > 0} />
        </div>
      </div>
    </div>
  );

  const renderSurveillanceControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Kameras Online"
        value={`${camerasOnline} / 50`}
        color={camerasOnline < 40 ? 'yellow' : 'green'}
        size="large"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Gesichtserkennung</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="FR System"
            active={facialRecognition}
            onChange={setFacialRecognition}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Alarmzonen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Innenstadt"
            active={alertZones.downtown}
            onChange={() => handleZoneToggle('downtown')}
          />
          <ToggleSwitch
            label="Wohngebiet"
            active={alertZones.residential}
            onChange={() => handleZoneToggle('residential')}
          />
          <ToggleSwitch
            label="Industriegebiet"
            active={alertZones.industrial}
            onChange={() => handleZoneToggle('industrial')}
          />
          <ToggleSwitch
            label="Gewerbegebiet"
            active={alertZones.commercial}
            onChange={() => handleZoneToggle('commercial')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Kamera Bereiche</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Straßen" color="green" />
          <LEDIndicator label="Parks" color="green" />
          <LEDIndicator label="Gebäude" color="green" />
          <LEDIndicator label="Parkplätze" color="green" />
        </div>
      </div>
    </div>
  );

  const renderHoldingControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={cellsOccupied}
        min={0}
        max={12}
        unit=""
        label="Belegte Zellen"
        zones={[
          { max: 8, color: '#33ff33' },
          { max: 10, color: '#ffaa00' },
          { max: 12, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Inhaftierte"
        value={detainees.toString()}
        color={detainees > 15 ? 'red' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="In Bearbeitung"
        value={processingQueue.toString()}
        color={processingQueue > 5 ? 'yellow' : 'green'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Gewahrsam Status</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Block A" color="green" />
          <LEDIndicator label="Block B" color="yellow" />
          <LEDIndicator label="Isolation" color="off" />
        </div>
      </div>
    </div>
  );

  const renderSystemsControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header" style={{ color: lockdownMode ? '#ff3333' : undefined }}>
          Sicherheitssysteme
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
          <PushButton
            label="Lockdown"
            variant="danger"
            requireConfirm={true}
            confirmText="LOCKDOWN AKTIVIEREN?\n\nAlle Zugänge werden gesperrt!"
            onClick={handleLockdown}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ToggleSwitch
              label="Datenbank Online"
              active={databaseOnline}
              onChange={setDatabaseOnline}
            />
            <ToggleSwitch
              label="Funksystem"
              active={radioSystem}
              onChange={setRadioSystem}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Revier Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Einsatzbereit" 
            color={unitsAvailable > 3 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Kameras" 
            color={camerasOnline > 40 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Datenbank" 
            color={databaseOnline ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Funk" 
            color={radioSystem ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Lockdown" 
            color={lockdownMode ? 'red' : 'off'} 
            pulse={lockdownMode}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Polizeirevier: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'dispatch' && renderDispatchControls()}
      {activeTab === 'surveillance' && renderSurveillanceControls()}
      {activeTab === 'holding' && renderHoldingControls()}
      {activeTab === 'systems' && renderSystemsControls()}
    </BaseTerminal>
  );
}

PoliceStationTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function FireStationTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('dispatch');
  
  // Dispatch state
  const [activeAlarms, setActiveAlarms] = useState(2);
  const [unitsDeployed, UNUSED_setUnitsDeployed] = useState(3);
  const [availableUnits, UNUSED_UNUSED_setAvailableUnits] = useState(8);
  const [responseTime, setResponseTime] = useState(4.2);
  
  // Apparatus state
  const [engines, setEngines] = useState({
    engine1: true,
    engine2: true,
    engine3: false,
    engine4: true
  });
  const [trucks, setTrucks] = useState({
    ladder1: true,
    ladder2: false,
    rescue1: true
  });
  
  // Personnel state
  const [onDuty, UNUSED_setOnDuty] = useState(24);
  const [available, UNUSED_setAvailable] = useState(21);
  const [scbaUnits, UNUSED_setScbaUnits] = useState(18);
  
  // Equipment state
  const [waterSupply, setWaterSupply] = useState(85);
  const [foamAgent, setFoamAgent] = useState(72);
  const [fuelLevel, UNUSED_setFuelLevel] = useState(68);
  const [equipmentReady, setEquipmentReady] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlarms(_prev => Math.max(0, Math.min(10, _prev + Math.floor(Math.random() * 3 - 1))));
      setResponseTime(_prev => 3 + Math.random() * 3);
      setWaterSupply(_prev => Math.max(0, Math.min(100, _prev + (Math.random() - 0.5) * 2)));
      setFoamAgent(_prev => Math.max(0, Math.min(100, _prev + (Math.random() - 0.5) * 1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dispatch', label: 'Einsatzleitstelle' },
    { id: 'apparatus', label: 'Fahrzeuge' },
    { id: 'personnel', label: 'Personal' },
    { id: 'equipment', label: 'Ausrüstung' }
  ];

  const handleEngineToggle = (engine) => {
    setEngines(prev => ({
      ...prev,
      [engine]: !prev[engine]
    }));
  };

  const handleTruckToggle = (truck) => {
    setTrucks(prev => ({
      ...prev,
      [truck]: !prev[truck]
    }));
  };

  const renderDispatchControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktive Alarme"
        value={activeAlarms.toString()}
        color={activeAlarms > 5 ? 'red' : activeAlarms > 2 ? 'yellow' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="Einheiten im Einsatz"
        value={`${unitsDeployed} / ${unitsDeployed + availableUnits}`}
        color={availableUnits < 3 ? 'red' : 'green'}
      />
      
      <AnalogGauge
        value={responseTime}
        min={0}
        max={10}
        unit="min"
        label="Anfahrtszeit"
        zones={[
          { max: 5, color: '#33ff33' },
          { max: 8, color: '#ffaa00' },
          { max: 10, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Einsatzarten</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Brand" color={activeAlarms > 0 ? 'red' : 'off'} pulse={activeAlarms > 0} />
          <LEDIndicator label="THL" color="yellow" />
          <LEDIndicator label="Rettung" color="off" />
        </div>
      </div>
    </div>
  );

  const renderApparatusControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Löschfahrzeuge</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="LF 1"
            active={engines.engine1}
            onChange={() => handleEngineToggle('engine1')}
          />
          <ToggleSwitch
            label="LF 2"
            active={engines.engine2}
            onChange={() => handleEngineToggle('engine2')}
          />
          <ToggleSwitch
            label="LF 3"
            active={engines.engine3}
            onChange={() => handleEngineToggle('engine3')}
          />
          <ToggleSwitch
            label="LF 4"
            active={engines.engine4}
            onChange={() => handleEngineToggle('engine4')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Sonderfahrzeuge</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Drehleiter 1"
            active={trucks.ladder1}
            onChange={() => handleTruckToggle('ladder1')}
          />
          <ToggleSwitch
            label="Drehleiter 2"
            active={trucks.ladder2}
            onChange={() => handleTruckToggle('ladder2')}
          />
          <ToggleSwitch
            label="Rüstwagen"
            active={trucks.rescue1}
            onChange={() => handleTruckToggle('rescue1')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Fahrzeugstatus</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Einsatzbereit" color="green" />
          <LEDIndicator label="Im Einsatz" color="red" pulse={true} />
          <LEDIndicator label="Wartung" color="yellow" />
        </div>
      </div>
    </div>
  );

  const renderPersonnelControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Diensthabend"
        value={onDuty.toString()}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Verfügbar"
        value={available.toString()}
        color={available < 15 ? 'red' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="SCBA Geräte"
        value={`${scbaUnits} / 20`}
        color={scbaUnits < 10 ? 'yellow' : 'green'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Schichten</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="A-Schicht" color="green" />
          <LEDIndicator label="B-Schicht" color="off" />
          <LEDIndicator label="C-Schicht" color="off" />
        </div>
      </div>
    </div>
  );

  const renderEquipmentControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={waterSupply}
        min={0}
        max={100}
        unit="%"
        label="Wasservorrat"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 70, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <AnalogGauge
        value={foamAgent}
        min={0}
        max={100}
        unit="%"
        label="Schaummittel"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 70, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <AnalogGauge
        value={fuelLevel}
        min={0}
        max={100}
        unit="%"
        label="Kraftstoff"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 70, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Ausrüstung</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Equipment Ready"
            active={equipmentReady}
            onChange={setEquipmentReady}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Schläuche" color="green" />
          <LEDIndicator label="Werkzeug" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Wache Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Einsatzbereit" 
            color={availableUnits > 5 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Personal OK" 
            color={available > 15 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Ausrüstung OK" 
            color={equipmentReady ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Vorräte OK" 
            color={waterSupply > 70 && foamAgent > 70 ? 'green' : 'yellow'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Feuerwache: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'dispatch' && renderDispatchControls()}
      {activeTab === 'apparatus' && renderApparatusControls()}
      {activeTab === 'personnel' && renderPersonnelControls()}
      {activeTab === 'equipment' && renderEquipmentControls()}
    </BaseTerminal>
  );
}

FireStationTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function HospitalTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('emergency');
  
  // Emergency state
  const [emergencyPatients, setEmergencyPatients] = useState(12);
  const [erBeds, UNUSED_setErBeds] = useState(8);
  const [ambulancesAvailable, UNUSED_setAmbulancesAvailable] = useState(3);
  const [traumaBays, setTraumaBays] = useState({
    bay1: true,
    bay2: false,
    bay3: true,
    bay4: false
  });
  
  // ICU state
  const [icuOccupancy, setIcuOccupancy] = useState(18);
  const [ventilators, UNUSED_setVentilators] = useState(12);
  const [ventilatorsInUse, UNUSED_setVentilatorsInUse] = useState(9);
  const [criticalPatients, UNUSED_setCriticalPatients] = useState(7);
  
  // Operating state
  const [activeORs] = useState(4);
  const [scheduledSurgeries] = useState(8);
  const [operatingRooms, setOperatingRooms] = useState({
    or1: true,
    or2: true,
    or3: true,
    or4: true,
    or5: false
  });
  
  // Systems state
  const [oxygenPressure, setOxygenPressure] = useState(55);
  const [backupPower, setBackupPower] = useState(false);
  const [hvacStatus, setHvacStatus] = useState(true);
  const [temperature, setTemperature] = useState(21);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmergencyPatients(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)));
      setIcuOccupancy(prev => Math.max(0, Math.min(24, prev + Math.floor(Math.random() * 3 - 1))));
      UNUSED_setVentilatorsInUse(prev => Math.max(0, Math.min(ventilators, prev + Math.floor(Math.random() * 2 - 0.5))));
      setOxygenPressure(prev => Math.max(0, prev + (Math.random() - 0.5) * 2));
      setTemperature(20 + Math.random() * 3);
    }, 4000);

    return () => clearInterval(interval);
  }, [ventilators]);

  const tabs = [
    { id: 'emergency', label: 'Notaufnahme' },
    { id: 'icu', label: 'Intensivstation' },
    { id: 'operating', label: 'OP-Bereiche' },
    { id: 'systems', label: 'Systeme' }
  ];

  const handleTraumaBayToggle = (bay) => {
    setTraumaBays(prev => ({
      ...prev,
      [bay]: !prev[bay]
    }));
  };

  const handleORToggle = (room) => {
    setOperatingRooms(prev => ({
      ...prev,
      [room]: !prev[room]
    }));
  };

  const renderEmergencyControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Notfallpatienten"
        value={emergencyPatients.toString()}
        color={emergencyPatients > 15 ? 'red' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="Verfügbare ER Betten"
        value={`${erBeds} / 16`}
        color={erBeds < 5 ? 'red' : 'green'}
      />
      
      <DigitalDisplay
        label="Krankenwagen Bereit"
        value={ambulancesAvailable.toString()}
        color={ambulancesAvailable > 0 ? 'green' : 'red'}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Trauma Bereiche</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Trauma 1"
            active={traumaBays.bay1}
            onChange={() => handleTraumaBayToggle('bay1')}
          />
          <ToggleSwitch
            label="Trauma 2"
            active={traumaBays.bay2}
            onChange={() => handleTraumaBayToggle('bay2')}
          />
          <ToggleSwitch
            label="Trauma 3"
            active={traumaBays.bay3}
            onChange={() => handleTraumaBayToggle('bay3')}
          />
          <ToggleSwitch
            label="Trauma 4"
            active={traumaBays.bay4}
            onChange={() => handleTraumaBayToggle('bay4')}
          />
        </div>
      </div>
    </div>
  );

  const renderICUControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={icuOccupancy}
        min={0}
        max={24}
        unit=""
        label="ICU Belegung"
        zones={[
          { max: 18, color: '#33ff33' },
          { max: 22, color: '#ffaa00' },
          { max: 24, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Beatmungsgeräte"
        value={`${ventilatorsInUse} / ${ventilators}`}
        color={ventilatorsInUse >= ventilators ? 'red' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="Kritische Patienten"
        value={criticalPatients.toString()}
        color={criticalPatients > 10 ? 'red' : 'yellow'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">ICU Stationen</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="ICU Nord" color="green" />
          <LEDIndicator label="ICU Süd" color="green" />
          <LEDIndicator label="NICU" color="green" />
        </div>
      </div>
    </div>
  );

  const renderOperatingControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktive OPs"
        value={`${activeORs} / 6`}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Geplante Operationen"
        value={scheduledSurgeries.toString()}
        color="blue"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">OP-Säle</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="OP 1"
            active={operatingRooms.or1}
            onChange={() => handleORToggle('or1')}
          />
          <ToggleSwitch
            label="OP 2"
            active={operatingRooms.or2}
            onChange={() => handleORToggle('or2')}
          />
          <ToggleSwitch
            label="OP 3"
            active={operatingRooms.or3}
            onChange={() => handleORToggle('or3')}
          />
          <ToggleSwitch
            label="OP 4"
            active={operatingRooms.or4}
            onChange={() => handleORToggle('or4')}
          />
          <ToggleSwitch
            label="OP 5"
            active={operatingRooms.or5}
            onChange={() => handleORToggle('or5')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">OP Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Anästhesie" color="green" />
          <LEDIndicator label="Chirurgie" color="green" />
          <LEDIndicator label="Aufwachraum" color="green" />
        </div>
      </div>
    </div>
  );

  const renderSystemsControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={oxygenPressure}
        min={0}
        max={100}
        unit="PSI"
        label="Sauerstoffdruck"
        zones={[
          { max: 40, color: '#ff3333' },
          { max: 70, color: '#33ff33' },
          { max: 100, color: '#ffaa00' }
        ]}
      />
      
      <AnalogGauge
        value={temperature}
        min={0}
        max={30}
        unit="°C"
        label="Raumtemperatur"
        zones={[
          { max: 19, color: '#3399ff' },
          { max: 24, color: '#33ff33' },
          { max: 30, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Kritische Systeme</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Notstromgenerator"
            active={backupPower}
            onChange={setBackupPower}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="HVAC System"
              active={hvacStatus}
              onChange={setHvacStatus}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Versorgung</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Strom" color="green" />
          <LEDIndicator label="Wasser" color="green" />
          <LEDIndicator label="Med. Gase" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Krankenhaus Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Notaufnahme" 
            color={emergencyPatients < 15 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="ICU" 
            color={icuOccupancy < 22 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="OP-Säle" 
            color="green" 
          />
          <LEDIndicator 
            label="Systeme" 
            color={hvacStatus && oxygenPressure > 40 ? 'green' : 'red'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Krankenhaus: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'emergency' && renderEmergencyControls()}
      {activeTab === 'icu' && renderICUControls()}
      {activeTab === 'operating' && renderOperatingControls()}
      {activeTab === 'systems' && renderSystemsControls()}
    </BaseTerminal>
  );
}

HospitalTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

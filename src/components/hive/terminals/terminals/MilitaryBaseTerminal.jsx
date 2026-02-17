import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function MilitaryBaseTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('security');
  
  // Security state
  const [threatLevel, UNUSED_setThreatLevel] = useState(2);
  const [perimeter, setPerimeter] = useState({
    north: true,
    south: true,
    east: true,
    west: true
  });
  const [personnelCount, setPersonnelCount] = useState(847);
  const [accessPoints, setAccessPoints] = useState({
    mainGate: true,
    vehicleGate: true,
    airfield: true,
    bunker: false
  });
  
  // Radar state
  const [airTargets, setAirTargets] = useState(3);
  const [groundTargets] = useState(0);
  const [radarMode] = useState('scan');
  const [jamming, setJamming] = useState(false);
  
  // Arsenal state
  const [readyAircraft] = useState(12);
  const [readyVehicles] = useState(45);
  const [ammunitionLevel, setAmmunitionLevel] = useState(87);
  const [fuelReserves, setFuelReserves] = useState(92);
  
  // Command state
  const [defcon, UNUSED_setDefcon] = useState(5);
  const [commLink, setCommLink] = useState(true);
  const [siloStatus, setSiloStatus] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAirTargets(prev => Math.max(0, Math.min(20, prev + Math.floor(Math.random() * 3 - 1))));
      setPersonnelCount(840 + Math.floor(Math.random() * 20));
      setAmmunitionLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 0.5)));
      setFuelReserves(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 0.3)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'security', label: 'Sicherheit' },
    { id: 'radar', label: 'Überwachung' },
    { id: 'arsenal', label: 'Arsenal' },
    { id: 'command', label: 'Kommando' }
  ];

  const handlePerimeterToggle = (sector) => {
    setPerimeter(prev => ({
      ...prev,
      [sector]: !prev[sector]
    }));
  };

  const handleAccessToggle = (point) => {
    setAccessPoints(prev => ({
      ...prev,
      [point]: !prev[point]
    }));
  };

  const renderSecurityControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={threatLevel}
        min={0}
        max={5}
        unit=""
        label="Bedrohungsstufe"
        zones={[
          { max: 2, color: '#33ff33' },
          { max: 3, color: '#ffaa00' },
          { max: 5, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Personal vor Ort"
        value={personnelCount.toString()}
        color="blue"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Perimeter Sensoren</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Nord"
            active={perimeter.north}
            onChange={() => handlePerimeterToggle('north')}
          />
          <ToggleSwitch
            label="Süd"
            active={perimeter.south}
            onChange={() => handlePerimeterToggle('south')}
          />
          <ToggleSwitch
            label="Ost"
            active={perimeter.east}
            onChange={() => handlePerimeterToggle('east')}
          />
          <ToggleSwitch
            label="West"
            active={perimeter.west}
            onChange={() => handlePerimeterToggle('west')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Zugangspunkte</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Haupttor"
            active={accessPoints.mainGate}
            onChange={() => handleAccessToggle('mainGate')}
          />
          <ToggleSwitch
            label="Fahrzeugtor"
            active={accessPoints.vehicleGate}
            onChange={() => handleAccessToggle('vehicleGate')}
          />
          <ToggleSwitch
            label="Flugfeld"
            active={accessPoints.airfield}
            onChange={() => handleAccessToggle('airfield')}
          />
          <ToggleSwitch
            label="Bunker"
            active={accessPoints.bunker}
            onChange={() => handleAccessToggle('bunker')}
          />
        </div>
      </div>
    </div>
  );

  const renderRadarControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Luftziele"
        value={airTargets.toString()}
        color={airTargets > 10 ? 'red' : 'green'}
        size="large"
      />
      
      <DigitalDisplay
        label="Bodenziele"
        value={groundTargets.toString()}
        color={groundTargets > 0 ? 'yellow' : 'green'}
        size="large"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Radar Modus</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator 
            label="Scan" 
            color={radarMode === 'scan' ? 'green' : 'off'} 
          />
          <LEDIndicator 
            label="Track" 
            color={radarMode === 'track' ? 'green' : 'off'} 
          />
          <LEDIndicator 
            label="Lock" 
            color={radarMode === 'lock' ? 'red' : 'off'} 
          />
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Gegenmaßnahmen</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="ECM Jamming"
            active={jamming}
            onChange={setJamming}
          />
        </div>
      </div>
    </div>
  );

  const renderArsenalControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Einsatzbereite Flugzeuge"
        value={`${readyAircraft} / 18`}
        color="green"
      />
      
      <DigitalDisplay
        label="Einsatzbereite Fahrzeuge"
        value={`${readyVehicles} / 60`}
        color="green"
      />
      
      <AnalogGauge
        value={ammunitionLevel}
        min={0}
        max={100}
        unit="%"
        label="Munitionsvorrat"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 60, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <AnalogGauge
        value={fuelReserves}
        min={0}
        max={100}
        unit="%"
        label="Treibstoffreserven"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 60, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
    </div>
  );

  const renderCommandControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header" style={{ color: '#ff3333' }}>
          Kommandozentrale
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
          <DigitalDisplay
            label="DEFCON Level"
            value={defcon.toString()}
            color={defcon <= 2 ? 'red' : defcon <= 3 ? 'yellow' : 'green'}
            size="large"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ToggleSwitch
              label="Kommlink Aktiv"
              active={commLink}
              onChange={setCommLink}
            />
            <ToggleSwitch
              label="Silo Bereit"
              active={siloStatus}
              onChange={setSiloStatus}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Status Übersicht</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Perimeter" 
            color={Object.values(perimeter).every(p => p) ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Radar" 
            color={airTargets < 10 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Arsenal" 
            color={ammunitionLevel > 60 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Kommlink" 
            color={commLink ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Alarm" 
            color={threatLevel > 3 ? 'red' : 'off'} 
            pulse={threatLevel > 3}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Militärbasis: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'security' && renderSecurityControls()}
      {activeTab === 'radar' && renderRadarControls()}
      {activeTab === 'arsenal' && renderArsenalControls()}
      {activeTab === 'command' && renderCommandControls()}
    </BaseTerminal>
  );
}

MilitaryBaseTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

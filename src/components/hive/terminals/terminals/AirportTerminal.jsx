import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function AirportTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('tower');
  
  // Tower state
  const [windSpeed, setWindSpeed] = useState(15);
  const [windDirection, setWindDirection] = useState(270);
  const [visibility, setVisibility] = useState(10);
  const [ceiling, setCeiling] = useState(2500);
  const [activeRunways, setActiveRunways] = useState({
    runway09L: true,
    runway09R: false,
    runway27L: true,
    runway27R: false
  });
  
  // Radar state
  const [aircraftTracked, setAircraftTracked] = useState(24);
  const [radarRange, _setRadarRange] = useState(60);
  const [transponderSignals, setTransponderSignals] = useState(22);
  
  // Gates state
  const [gatesOccupied, _setGatesOccupied] = useState(18);
  const [jetbridges, setJetbridges] = useState({
    gateA1: true,
    gateA2: false,
    gateB1: true,
    gateB2: true,
    gateC1: false
  });
  
  // Emergency state
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [fireServices, setFireServices] = useState(true);
  const [runwayLights, setRunwayLights] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!emergencyMode) {
        setWindSpeed(prev => Math.max(0, prev + (Math.random() - 0.5) * 2));
        setWindDirection(prev => (prev + (Math.random() - 0.5) * 5 + 360) % 360);
        setVisibility(prev => Math.max(0, Math.min(20, prev + (Math.random() - 0.5) * 0.5)));
        setCeiling(prev => Math.max(0, prev + (Math.random() - 0.5) * 100));
        setAircraftTracked(prev => Math.max(0, Math.min(50, prev + Math.floor(Math.random() * 3 - 1))));
        setTransponderSignals(prev => Math.min(aircraftTracked, prev + Math.floor(Math.random() * 2)));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [emergencyMode, aircraftTracked]);

  const tabs = [
    { id: 'tower', label: 'Tower' },
    { id: 'radar', label: 'Radar' },
    { id: 'gates', label: 'Gates' },
    { id: 'emergency', label: 'Notfall' }
  ];

  const handleRunwayToggle = (runway) => {
    setActiveRunways(prev => ({
      ...prev,
      [runway]: !prev[runway]
    }));
  };

  const handleJetbridgeToggle = (gate) => {
    setJetbridges(prev => ({
      ...prev,
      [gate]: !prev[gate]
    }));
  };

  const handleEmergencyAlert = () => {
    setEmergencyMode(true);
    setActiveRunways({
      runway09L: false,
      runway09R: false,
      runway27L: false,
      runway27R: false
    });
  };

  const renderTowerControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={windSpeed}
        min={0}
        max={50}
        unit="kt"
        label="Windgeschwindigkeit"
        zones={[
          { max: 25, color: '#33ff33' },
          { max: 40, color: '#ffaa00' },
          { max: 50, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={windDirection}
        min={0}
        max={360}
        unit="°"
        label="Windrichtung"
        zones={[
          { max: 360, color: '#3399ff' }
        ]}
      />
      
      <AnalogGauge
        value={visibility}
        min={0}
        max={20}
        unit="km"
        label="Sichtweite"
        zones={[
          { max: 5, color: '#ff3333' },
          { max: 10, color: '#ffaa00' },
          { max: 20, color: '#33ff33' }
        ]}
      />
      
      <DigitalDisplay
        label="Wolkenuntergrenze"
        value={ceiling.toFixed(0) + ' ft'}
        color={ceiling < 1000 ? 'red' : 'green'}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Runways</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="09L"
            active={activeRunways.runway09L}
            onChange={() => handleRunwayToggle('runway09L')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="09R"
            active={activeRunways.runway09R}
            onChange={() => handleRunwayToggle('runway09R')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="27L"
            active={activeRunways.runway27L}
            onChange={() => handleRunwayToggle('runway27L')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="27R"
            active={activeRunways.runway27R}
            onChange={() => handleRunwayToggle('runway27R')}
            disabled={emergencyMode}
          />
        </div>
      </div>
    </div>
  );

  const renderRadarControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Verfolgte Flugzeuge"
        value={aircraftTracked.toString()}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Transponder Signale"
        value={transponderSignals.toString()}
        color="blue"
        size="large"
      />
      
      <AnalogGauge
        value={radarRange}
        min={0}
        max={100}
        unit="NM"
        label="Radarreichweite"
        zones={[
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Radar Status</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Primär Radar" color="green" />
          <LEDIndicator label="Sekundär Radar" color="green" />
          <LEDIndicator label="Wetter Radar" color="green" />
        </div>
      </div>
    </div>
  );

  const renderGatesControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Belegte Gates"
        value={`${gatesOccupied} / 32`}
        color="blue"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Fluggastbrücken</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Gate A1"
            active={jetbridges.gateA1}
            onChange={() => handleJetbridgeToggle('gateA1')}
          />
          <ToggleSwitch
            label="Gate A2"
            active={jetbridges.gateA2}
            onChange={() => handleJetbridgeToggle('gateA2')}
          />
          <ToggleSwitch
            label="Gate B1"
            active={jetbridges.gateB1}
            onChange={() => handleJetbridgeToggle('gateB1')}
          />
          <ToggleSwitch
            label="Gate B2"
            active={jetbridges.gateB2}
            onChange={() => handleJetbridgeToggle('gateB2')}
          />
          <ToggleSwitch
            label="Gate C1"
            active={jetbridges.gateC1}
            onChange={() => handleJetbridgeToggle('gateC1')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Terminal Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Terminal A" color="green" />
          <LEDIndicator label="Terminal B" color="green" />
          <LEDIndicator label="Terminal C" color="yellow" />
          <LEDIndicator label="Gepäckförderung" color="green" />
        </div>
      </div>
    </div>
  );

  const renderEmergencyControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header" style={{ color: '#ff3333' }}>
          Notfallsysteme
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20 }}>
          <PushButton
            label="Notfall Alarm"
            variant="danger"
            requireConfirm={true}
            confirmText="NOTFALL ALARM AUSLÖSEN?\n\nAlle Runways werden geschlossen!"
            onClick={handleEmergencyAlert}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ToggleSwitch
              label="Feuerwehr Bereit"
              active={fireServices}
              onChange={setFireServices}
            />
            <ToggleSwitch
              label="Runway Beleuchtung"
              active={runwayLights}
              onChange={setRunwayLights}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Status Übersicht</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Wetter OK" 
            color={windSpeed < 40 && visibility > 5 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Runways Aktiv" 
            color={Object.values(activeRunways).some(r => r) ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Radar OK" 
            color="green" 
          />
          <LEDIndicator 
            label="Gates OK" 
            color="green" 
          />
          <LEDIndicator 
            label="Notfall" 
            color={emergencyMode ? 'red' : 'off'} 
            pulse={emergencyMode}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Flughafen: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'tower' && renderTowerControls()}
      {activeTab === 'radar' && renderRadarControls()}
      {activeTab === 'gates' && renderGatesControls()}
      {activeTab === 'emergency' && renderEmergencyControls()}
    </BaseTerminal>
  );
}

AirportTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

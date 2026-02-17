import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import Slider from '../controls/Slider';

export default function BridgeTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('traffic');
  
  // Traffic state
  const [vehiclesPerHour, setVehiclesPerHour] = useState(1247);
  const [averageSpeed, setAverageSpeed] = useState(65);
  const [lanes, setLanes] = useState({
    lane1North: true,
    lane2North: true,
    lane1South: true,
    lane2South: true
  });
  const [trafficLevel, UNUSED_setTrafficLevel] = useState(2);
  
  // Structure state
  const [cableTension, setCableTension] = useState(87);
  const [deckVibration, setDeckVibration] = useState(2.1);
  const [windSpeed, setWindSpeed] = useState(18);
  const [temperature, setTemperature] = useState(15);
  
  // Systems state
  const [lighting, setLighting] = useState(true);
  const [tollSystem, setTollSystem] = useState(true);
  const [cameras, UNUSED_setCameras] = useState(16);
  const [drawbridge, setDrawbridge] = useState(false);
  
  // Safety state
  const [iceWarning, setIceWarning] = useState(false);
  const [windWarning, setWindWarning] = useState(false);
  const [emergencyMode, UNUSED_setEmergencyMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehiclesPerHour(prev => Math.max(0, prev + Math.floor(Math.random() * 100 - 50)));
      setAverageSpeed(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setCableTension(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setDeckVibration(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.3));
      setWindSpeed(prev => Math.max(0, prev + (Math.random() - 0.5) * 3));
      setTemperature(prev => prev + (Math.random() - 0.5) * 1);
      
      setWindWarning(windSpeed > 50);
      setIceWarning(temperature < 2);
    }, 3000);

    return () => clearInterval(interval);
  }, [windSpeed, temperature]);

  const tabs = [
    { id: 'traffic', label: 'Verkehr' },
    { id: 'structure', label: 'Struktur' },
    { id: 'systems', label: 'Systeme' },
    { id: 'safety', label: 'Sicherheit' }
  ];

  const handleLaneToggle = (lane) => {
    setLanes(prev => ({
      ...prev,
      [lane]: !prev[lane]
    }));
  };

  const renderTrafficControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Fahrzeuge/Stunde"
        value={vehiclesPerHour.toLocaleString()}
        color="green"
        size="large"
      />
      
      <AnalogGauge
        value={averageSpeed}
        min={0}
        max={120}
        unit="km/h"
        label="Durchschnittsgeschwindigkeit"
        zones={[
          { max: 80, color: '#33ff33' },
          { max: 100, color: '#ffaa00' },
          { max: 120, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={trafficLevel}
        min={0}
        max={5}
        unit=""
        label="Verkehrsdichte"
        zones={[
          { max: 2, color: '#33ff33' },
          { max: 4, color: '#ffaa00' },
          { max: 5, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Fahrspuren</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Spur 1 Nord"
            active={lanes.lane1North}
            onChange={() => handleLaneToggle('lane1North')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="Spur 2 Nord"
            active={lanes.lane2North}
            onChange={() => handleLaneToggle('lane2North')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="Spur 1 Süd"
            active={lanes.lane1South}
            onChange={() => handleLaneToggle('lane1South')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="Spur 2 Süd"
            active={lanes.lane2South}
            onChange={() => handleLaneToggle('lane2South')}
            disabled={emergencyMode}
          />
        </div>
      </div>
    </div>
  );

  const renderStructureControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={cableTension}
        min={0}
        max={100}
        unit="%"
        label="Seilspannung"
        zones={[
          { max: 95, color: '#33ff33' },
          { max: 98, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={deckVibration}
        min={0}
        max={10}
        unit="mm"
        label="Fahrbahn Vibration"
        zones={[
          { max: 5, color: '#33ff33' },
          { max: 8, color: '#ffaa00' },
          { max: 10, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={windSpeed}
        min={0}
        max={100}
        unit="km/h"
        label="Windgeschwindigkeit"
        zones={[
          { max: 50, color: '#33ff33' },
          { max: 80, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Temperatur"
        value={temperature.toFixed(1) + ' °C'}
        color={temperature < 2 ? 'red' : 'green'}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Strukturüberwachung</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Kabel OK" 
            color={cableTension < 98 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Fundament OK" 
            color="green" 
          />
          <LEDIndicator 
            label="Fahrbahn OK" 
            color={deckVibration < 8 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Sensoren OK" 
            color="green" 
          />
        </div>
      </div>
    </div>
  );

  const renderSystemsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Kameras Online"
        value={`${cameras} / 18`}
        color={cameras < 15 ? 'yellow' : 'green'}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Systeme</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Beleuchtung"
            active={lighting}
            onChange={setLighting}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Mautsystem"
              active={tollSystem}
              onChange={setTollSystem}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Zugbrücke"
              active={drawbridge}
              onChange={setDrawbridge}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Systemstatus</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Beleuchtung" 
            color={lighting ? 'green' : 'off'} 
          />
          <LEDIndicator 
            label="Maut" 
            color={tollSystem ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Kameras" 
            color="green" 
          />
          <LEDIndicator 
            label="Kommunikation" 
            color="green" 
          />
        </div>
      </div>
    </div>
  );

  const renderSafetyControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header" style={{ color: emergencyMode ? '#ff3333' : undefined }}>
          Sicherheitswarnungen
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Eiswarnung" 
            color={iceWarning ? 'red' : 'off'} 
            pulse={iceWarning}
          />
          <LEDIndicator 
            label="Windwarnung" 
            color={windWarning ? 'red' : 'off'} 
            pulse={windWarning}
          />
          <LEDIndicator 
            label="Sperrung" 
            color={emergencyMode ? 'red' : 'off'} 
            pulse={emergencyMode}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Brücken Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Verkehr OK" 
            color={Object.values(lanes).some(l => l) ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Struktur OK" 
            color={cableTension < 98 && deckVibration < 8 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Systeme OK" 
            color={lighting && tollSystem ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Wetter OK" 
            color={!iceWarning && !windWarning ? 'green' : 'red'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Brücke: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'traffic' && renderTrafficControls()}
      {activeTab === 'structure' && renderStructureControls()}
      {activeTab === 'systems' && renderSystemsControls()}
      {activeTab === 'safety' && renderSafetyControls()}
    </BaseTerminal>
  );
}

BridgeTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

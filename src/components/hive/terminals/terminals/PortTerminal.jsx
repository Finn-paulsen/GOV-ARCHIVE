import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';

export default function PortTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('harbor');
  
  // Harbor state
  const [shipsInPort, setShipsInPort] = useState(8);
  const [berths, setBerths] = useState({
    berth1: true,
    berth2: true,
    berth3: false,
    berth4: true,
    berth5: false
  });
  const [tideLevel, setTideLevel] = useState(3.2);
  const [waveHeight, setWaveHeight] = useState(1.2);
  
  // Cargo state
  const [containersLoaded, setContainersLoaded] = useState(847);
  const [containersUnloaded, setContainersUnloaded] = useState(923);
  const [cranes, setCranes] = useState({
    crane1: true,
    crane2: true,
    crane3: false,
    crane4: true
  });
  
  // Security state
  const [gateControlActive, setGateControlActive] = useState(true);
  const [customsOperational, setCustomsOperational] = useState(true);
  const [securityZones, setSecurityZones] = useState({
    commercial: true,
    restricted: true,
    fuel: false
  });
  
  // Navigation state
  const [lighthouseActive, setLighthouseActive] = useState(true);
  const [radarRange] = useState(25);
  const [channelDepth] = useState(12.5);
  const [vesselsTracked, setVesselsTracked] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setShipsInPort(prev => Math.max(0, Math.min(12, prev + Math.floor(Math.random() * 3 - 1))));
      setTideLevel(2 + Math.sin(Date.now() / 10000) * 2);
      setWaveHeight(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.3));
      setContainersLoaded(prev => prev + Math.floor(Math.random() * 10));
      setContainersUnloaded(prev => prev + Math.floor(Math.random() * 12));
      setVesselsTracked(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'harbor', label: 'Hafen' },
    { id: 'cargo', label: 'Fracht' },
    { id: 'security', label: 'Sicherheit' },
    { id: 'navigation', label: 'Navigation' }
  ];

  const handleBerthToggle = (berth) => {
    setBerths(prev => ({
      ...prev,
      [berth]: !prev[berth]
    }));
  };

  const handleCraneToggle = (crane) => {
    setCranes(prev => ({
      ...prev,
      [crane]: !prev[crane]
    }));
  };

  const handleSecurityZoneToggle = (zone) => {
    setSecurityZones(prev => ({
      ...prev,
      [zone]: !prev[zone]
    }));
  };

  const renderHarborControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Schiffe im Hafen"
        value={`${shipsInPort} / 12`}
        color={shipsInPort > 10 ? 'yellow' : 'green'}
        size="large"
      />
      
      <AnalogGauge
        value={tideLevel}
        min={0}
        max={6}
        unit="m"
        label="Gezeitenpegel"
        zones={[
          { max: 6, color: '#3399ff' }
        ]}
      />
      
      <AnalogGauge
        value={waveHeight}
        min={0}
        max={5}
        unit="m"
        label="Wellenhöhe"
        zones={[
          { max: 2, color: '#33ff33' },
          { max: 3, color: '#ffaa00' },
          { max: 5, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Liegeplätze</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Pier 1"
            active={berths.berth1}
            onChange={() => handleBerthToggle('berth1')}
          />
          <ToggleSwitch
            label="Pier 2"
            active={berths.berth2}
            onChange={() => handleBerthToggle('berth2')}
          />
          <ToggleSwitch
            label="Pier 3"
            active={berths.berth3}
            onChange={() => handleBerthToggle('berth3')}
          />
          <ToggleSwitch
            label="Pier 4"
            active={berths.berth4}
            onChange={() => handleBerthToggle('berth4')}
          />
          <ToggleSwitch
            label="Pier 5"
            active={berths.berth5}
            onChange={() => handleBerthToggle('berth5')}
          />
        </div>
      </div>
    </div>
  );

  const renderCargoControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Container Geladen"
        value={containersLoaded.toLocaleString()}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Container Entladen"
        value={containersUnloaded.toLocaleString()}
        color="blue"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Containerkräne</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Kran 1"
            active={cranes.crane1}
            onChange={() => handleCraneToggle('crane1')}
          />
          <ToggleSwitch
            label="Kran 2"
            active={cranes.crane2}
            onChange={() => handleCraneToggle('crane2')}
          />
          <ToggleSwitch
            label="Kran 3"
            active={cranes.crane3}
            onChange={() => handleCraneToggle('crane3')}
          />
          <ToggleSwitch
            label="Kran 4"
            active={cranes.crane4}
            onChange={() => handleCraneToggle('crane4')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Fracht Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Be-/Entladung" color="green" />
          <LEDIndicator label="Lagerhaus" color="green" />
          <LEDIndicator label="Transport" color="green" />
        </div>
      </div>
    </div>
  );

  const renderSecurityControls = () => (
    <div className="terminal-grid">
      <div className="terminal-panel">
        <div className="terminal-panel-header">Kontrollen</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Torkontrolle"
            active={gateControlActive}
            onChange={setGateControlActive}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Zoll"
              active={customsOperational}
              onChange={setCustomsOperational}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Sicherheitszonen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Handelszone"
            active={securityZones.commercial}
            onChange={() => handleSecurityZoneToggle('commercial')}
          />
          <ToggleSwitch
            label="Sperrgebiet"
            active={securityZones.restricted}
            onChange={() => handleSecurityZoneToggle('restricted')}
          />
          <ToggleSwitch
            label="Treibstoffdepot"
            active={securityZones.fuel}
            onChange={() => handleSecurityZoneToggle('fuel')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Sicherheit</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="CCTV" color="green" />
          <LEDIndicator label="Perimeter" color="green" />
          <LEDIndicator label="Zutritt" color={gateControlActive ? 'green' : 'red'} />
          <LEDIndicator label="Zoll" color={customsOperational ? 'green' : 'red'} />
        </div>
      </div>
    </div>
  );

  const renderNavigationControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Verfolgte Schiffe"
        value={vesselsTracked.toString()}
        color="green"
        size="large"
      />
      
      <AnalogGauge
        value={radarRange}
        min={0}
        max={50}
        unit="NM"
        label="Radarreichweite"
        zones={[
          { max: 50, color: '#33ff33' }
        ]}
      />
      
      <AnalogGauge
        value={channelDepth}
        min={0}
        max={20}
        unit="m"
        label="Fahrrinne Tiefe"
        zones={[
          { max: 10, color: '#ff3333' },
          { max: 20, color: '#33ff33' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Navigation</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Leuchtturm"
            active={lighthouseActive}
            onChange={setLighthouseActive}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Radar" color="green" />
          <LEDIndicator label="AIS" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Hafen Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Hafen" 
            color={shipsInPort < 10 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Fracht" 
            color="green" 
          />
          <LEDIndicator 
            label="Sicherheit" 
            color={gateControlActive && customsOperational ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Navigation" 
            color={lighthouseActive ? 'green' : 'red'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Hafen: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'harbor' && renderHarborControls()}
      {activeTab === 'cargo' && renderCargoControls()}
      {activeTab === 'security' && renderSecurityControls()}
      {activeTab === 'navigation' && renderNavigationControls()}
    </BaseTerminal>
  );
}

PortTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

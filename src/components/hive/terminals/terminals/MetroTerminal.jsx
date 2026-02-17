import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';

export default function MetroTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('trains');
  
  // Trains state
  const [trainsActive, setTrainsActive] = useState(24);
  const [passengersPerHour, setPassengersPerHour] = useState(12400);
  const [averageSpeed, setAverageSpeed] = useState(45);
  const [lines, setLines] = useState({
    lineRed: true,
    lineBlue: true,
    lineGreen: true,
    lineYellow: false
  });
  
  // Stations state
  const [stationsOpen] = useState(18);
  const [escalators, setEscalators] = useState({
    escalator1: true,
    escalator2: true,
    escalator3: false,
    escalator4: true
  });
  const [elevators] = useState(12);
  
  // Track state
  const [trackCondition, setTrackCondition] = useState(95);
  const [signalSystem, setSignalSystem] = useState(true);
  const [powerRail, setPowerRail] = useState(750);
  const [tunnelVentilation, setTunnelVentilation] = useState(true);
  
  // Control state
  const [automaticControl, setAutomaticControl] = useState(true);
  const [emergencyBrake, setEmergencyBrake] = useState(false);
  const [centralControl, setCentralControl] = useState(true);
  const [delayMinutes, setDelayMinutes] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrainsActive(prev => Math.max(0, Math.min(32, prev + Math.floor(Math.random() * 3 - 1))));
      setPassengersPerHour(prev => Math.max(0, prev + Math.floor(Math.random() * 500 - 250)));
      setAverageSpeed(prev => Math.max(0, Math.min(80, prev + (Math.random() - 0.5) * 3)));
      setTrackCondition(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 1)));
      setPowerRail(740 + Math.random() * 20);
      setDelayMinutes(prev => Math.max(0, prev + (Math.random() - 0.6) * 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'trains', label: 'Züge' },
    { id: 'stations', label: 'Stationen' },
    { id: 'track', label: 'Gleise' },
    { id: 'control', label: 'Steuerung' }
  ];

  const handleLineToggle = (line) => {
    setLines(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  const handleEscalatorToggle = (esc) => {
    setEscalators(prev => ({
      ...prev,
      [esc]: !prev[esc]
    }));
  };

  const renderTrainsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktive Züge"
        value={`${trainsActive} / 32`}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Fahrgäste/Stunde"
        value={passengersPerHour.toLocaleString()}
        color="blue"
        size="large"
      />
      
      <AnalogGauge
        value={averageSpeed}
        min={0}
        max={80}
        unit="km/h"
        label="Durchschnittsgeschwindigkeit"
        zones={[
          { max: 60, color: '#33ff33' },
          { max: 75, color: '#ffaa00' },
          { max: 80, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Linien</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Rote Linie"
            active={lines.lineRed}
            onChange={() => handleLineToggle('lineRed')}
          />
          <ToggleSwitch
            label="Blaue Linie"
            active={lines.lineBlue}
            onChange={() => handleLineToggle('lineBlue')}
          />
          <ToggleSwitch
            label="Grüne Linie"
            active={lines.lineGreen}
            onChange={() => handleLineToggle('lineGreen')}
          />
          <ToggleSwitch
            label="Gelbe Linie"
            active={lines.lineYellow}
            onChange={() => handleLineToggle('lineYellow')}
          />
        </div>
      </div>
    </div>
  );

  const renderStationsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Geöffnete Stationen"
        value={`${stationsOpen} / 24`}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Aufzüge Aktiv"
        value={`${elevators} / 16`}
        color={elevators < 12 ? 'yellow' : 'green'}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Rolltreppen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Hauptbahnhof"
            active={escalators.escalator1}
            onChange={() => handleEscalatorToggle('escalator1')}
          />
          <ToggleSwitch
            label="Zentrum"
            active={escalators.escalator2}
            onChange={() => handleEscalatorToggle('escalator2')}
          />
          <ToggleSwitch
            label="Nord"
            active={escalators.escalator3}
            onChange={() => handleEscalatorToggle('escalator3')}
          />
          <ToggleSwitch
            label="Süd"
            active={escalators.escalator4}
            onChange={() => handleEscalatorToggle('escalator4')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Stationen Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Ticketautomaten" color="green" />
          <LEDIndicator label="Information" color="green" />
          <LEDIndicator label="Sicherheit" color="green" />
          <LEDIndicator label="Beleuchtung" color="green" />
        </div>
      </div>
    </div>
  );

  const renderTrackControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={trackCondition}
        min={0}
        max={100}
        unit="%"
        label="Gleiszustand"
        zones={[
          { max: 80, color: '#ff3333' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <AnalogGauge
        value={powerRail}
        min={0}
        max={1000}
        unit="V"
        label="Stromschiene"
        zones={[
          { max: 700, color: '#ff3333' },
          { max: 800, color: '#33ff33' },
          { max: 1000, color: '#ffaa00' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Systeme</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Signalsystem"
            active={signalSystem}
            onChange={setSignalSystem}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Tunnel Belüftung"
              active={tunnelVentilation}
              onChange={setTunnelVentilation}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Gleis Status</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Gleis 1" color="green" />
          <LEDIndicator label="Gleis 2" color="green" />
          <LEDIndicator label="Gleis 3" color="green" />
        </div>
      </div>
    </div>
  );

  const renderControlControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Durchschnittliche Verspätung"
        value={delayMinutes.toFixed(1) + ' min'}
        color={delayMinutes > 5 ? 'red' : delayMinutes > 2 ? 'yellow' : 'green'}
        size="large"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Steuerung</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Automatik"
            active={automaticControl}
            onChange={setAutomaticControl}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Zentrale Kontrolle"
              active={centralControl}
              onChange={setCentralControl}
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Notbremse"
              active={emergencyBrake}
              onChange={setEmergencyBrake}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">System Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Züge" 
            color={trainsActive > 20 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Stationen" 
            color={stationsOpen > 15 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Gleise" 
            color={trackCondition > 95 && signalSystem ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Steuerung" 
            color={automaticControl && centralControl ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Notbremse" 
            color={emergencyBrake ? 'red' : 'off'} 
            pulse={emergencyBrake}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`U-Bahn: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'trains' && renderTrainsControls()}
      {activeTab === 'stations' && renderStationsControls()}
      {activeTab === 'track' && renderTrackControls()}
      {activeTab === 'control' && renderControlControls()}
    </BaseTerminal>
  );
}

MetroTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

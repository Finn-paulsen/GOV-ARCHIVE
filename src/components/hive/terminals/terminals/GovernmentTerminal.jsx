import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function GovernmentTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('security');
  
  // Security state
  const [securityLevel, UNUSED_setSecurityLevel2] = useState(2);
  const [accessGates, setAccessGates] = useState({
    mainEntrance: true,
    staffEntrance: true,
    garageGate: false,
    secureWing: false
  });
  const [badgesActive, setBadgesActive] = useState(247);
  
  // Communications state
  const [encryptedLines, UNUSED_setEncryptedLines] = useState(12);
  const [activeCalls, setActiveCalls] = useState(8);
  const [satelliteLink, setSatelliteLink] = useState(true);
  const [secureNetwork, setSecureNetwork] = useState(true);
  
  // Operations state
  const [documentsProcessed, setDocumentsProcessed] = useState(1247);
  const [pendingApprovals, UNUSED_setPendingApprovals] = useState(34);
  const [meetingsActive, UNUSED_setMeetingsActive] = useState(6);
  
  // Infrastructure state
  const [powerBackup, setPowerBackup] = useState(false);
  const [hvacSystem, setHvacSystem] = useState(true);
  const [serverRoomTemp, setServerRoomTemp] = useState(22);

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgesActive((_prev) => Math.max(0, _prev + Math.floor(Math.random() * 10 - 5)));
      setActiveCalls((_prev) => Math.max(0, _prev + Math.floor(Math.random() * 3 - 1)));
      setDocumentsProcessed((_prev) => _prev + Math.floor(Math.random() * 5));
      setServerRoomTemp((_prev) => 20 + Math.random() * 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'security', label: 'Sicherheit' },
    { id: 'communications', label: 'Kommunikation' },
    { id: 'operations', label: 'Betrieb' },
    { id: 'infrastructure', label: 'Infrastruktur' }
  ];

  const handleGateToggle = (gate) => {
    setAccessGates((prev) => ({
      ...prev,
      [gate]: !prev[gate]
    }));
  };

  const renderSecurityControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={securityLevel}
        min={0}
        max={5}
        unit=""
        label="Sicherheitsstufe"
        zones={[
          { max: 2, color: '#33ff33' },
          { max: 3, color: '#ffaa00' },
          { max: 5, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Aktive Ausweise"
        value={badgesActive.toString()}
        color="green"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Zugangskontrolle</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Haupteingang"
            active={accessGates.mainEntrance}
            onChange={() => handleGateToggle('mainEntrance')}
          />
          <ToggleSwitch
            label="Personaleingang"
            active={accessGates.staffEntrance}
            onChange={() => handleGateToggle('staffEntrance')}
          />
          <ToggleSwitch
            label="Tiefgarage"
            active={accessGates.garageGate}
            onChange={() => handleGateToggle('garageGate')}
          />
          <ToggleSwitch
            label="Sicherheitsbereich"
            active={accessGates.secureWing}
            onChange={() => handleGateToggle('secureWing')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Überwachung</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="CCTV" color="green" />
          <LEDIndicator label="Zutrittskontrolle" color="green" />
          <LEDIndicator label="Perimeter" color="green" />
          <LEDIndicator label="Alarm" color="off" />
        </div>
      </div>
    </div>
  );

  const renderCommunicationsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Verschlüsselte Leitungen"
        value={`${encryptedLines} / 16`}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Aktive Gespräche"
        value={activeCalls.toString()}
        color="blue"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Verbindungen</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Satellitenlink"
            active={satelliteLink}
            onChange={setSatelliteLink}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Sicheres Netzwerk"
              active={secureNetwork}
              onChange={setSecureNetwork}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Kommunikationsstatus</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Intern" color="green" />
          <LEDIndicator label="Extern" color="green" />
          <LEDIndicator label="Notfall" color="green" />
        </div>
      </div>
    </div>
  );

  const renderOperationsControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Dokumente Verarbeitet"
        value={documentsProcessed.toLocaleString()}
        color="blue"
        size="large"
      />
      
      <DigitalDisplay
        label="Ausstehende Genehmigungen"
        value={pendingApprovals.toString()}
        color={pendingApprovals > 50 ? 'yellow' : 'green'}
      />
      
      <DigitalDisplay
        label="Laufende Besprechungen"
        value={meetingsActive.toString()}
        color="green"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Abteilungen</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Verwaltung" color="green" />
          <LEDIndicator label="Finanzen" color="green" />
          <LEDIndicator label="Personal" color="green" />
        </div>
      </div>
    </div>
  );

  const renderInfrastructureControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={serverRoomTemp}
        min={0}
        max={40}
        unit="°C"
        label="Serverraum Temperatur"
        zones={[
          { max: 25, color: '#33ff33' },
          { max: 30, color: '#ffaa00' },
          { max: 40, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Systeme</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Notstrom"
            active={powerBackup}
            onChange={setPowerBackup}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Klimaanlage"
              active={hvacSystem}
              onChange={setHvacSystem}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Gebäude Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Stromversorgung" 
            color="green" 
          />
          <LEDIndicator 
            label="HVAC" 
            color={hvacSystem ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Aufzüge" 
            color="green" 
          />
          <LEDIndicator 
            label="Brandschutz" 
            color="green" 
          />
          <LEDIndicator 
            label="IT Systeme" 
            color={secureNetwork ? 'green' : 'red'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Regierung: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'security' && renderSecurityControls()}
      {activeTab === 'communications' && renderCommunicationsControls()}
      {activeTab === 'operations' && renderOperationsControls()}
      {activeTab === 'infrastructure' && renderInfrastructureControls()}
    </BaseTerminal>
  );
}

GovernmentTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

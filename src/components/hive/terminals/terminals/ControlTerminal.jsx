import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import StatusBoard from '../controls/StatusBoard';

export default function ControlTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Overview state
  const [systemStatus, setSystemStatus] = useState(98);
  const [activeConnections, setActiveConnections] = useState(147);
  const [dataFlow, setDataFlow] = useState(2847);
  
  // Systems state
  const [subsystems, setSubsystems] = useState({
    primary: true,
    secondary: true,
    backup: false,
    monitoring: true
  });
  const [cpuLoad, setCpuLoad] = useState(42);
  const [memoryUsage, setMemoryUsage] = useState(58);
  
  // Network state
  const [bandwidth, setBandwidth] = useState(847);
  const [latency, setLatency] = useState(8);
  const [firewallActive, setFirewallActive] = useState(true);
  const [encryption, setEncryption] = useState(true);
  
  // Security state
  const [securityLevel, UNUSED_setSecurityLevel] = useState(3);
  const [accessControl, setAccessControl] = useState(true);
  const [auditLog, setAuditLog] = useState(true);
  const [intrusion, UNUSED_setIntrusion] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setActiveConnections(prev => Math.max(0, prev + Math.floor(Math.random() * 10 - 5)));
      setDataFlow(prev => Math.max(0, prev + Math.floor(Math.random() * 200 - 100)));
      setCpuLoad(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setMemoryUsage(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3)));
      setBandwidth(prev => Math.max(0, prev + Math.floor(Math.random() * 100 - 50)));
      setLatency(prev => Math.max(1, prev + (Math.random() - 0.5) * 2));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'systems', label: 'Systeme' },
    { id: 'network', label: 'Netzwerk' },
    { id: 'security', label: 'Sicherheit' }
  ];

  const handleSubsystemToggle = (system) => {
    setSubsystems(prev => ({
      ...prev,
      [system]: !prev[system]
    }));
  };

  const renderOverviewControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={systemStatus}
        min={0}
        max={100}
        unit="%"
        label="System Status"
        size={220}
        zones={[
          { max: 80, color: '#ff3333' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <DigitalDisplay
        label="Aktive Verbindungen"
        value={activeConnections.toString()}
        color="green"
        size="large"
      />
      
      <DigitalDisplay
        label="Datenfluss"
        value={dataFlow.toLocaleString() + ' MB/s'}
        color="blue"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Systemübersicht</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Online" color="green" />
          <LEDIndicator label="Verbunden" color="green" />
          <LEDIndicator label="Gesichert" color="green" />
          <LEDIndicator label="Überwacht" color="green" />
        </div>
      </div>
    </div>
  );

  const renderSystemsControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={cpuLoad}
        min={0}
        max={100}
        unit="%"
        label="CPU Auslastung"
        zones={[
          { max: 70, color: '#33ff33' },
          { max: 90, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={memoryUsage}
        min={0}
        max={100}
        unit="%"
        label="Speicher Nutzung"
        zones={[
          { max: 80, color: '#33ff33' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Untersysteme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Primär"
            active={subsystems.primary}
            onChange={() => handleSubsystemToggle('primary')}
          />
          <ToggleSwitch
            label="Sekundär"
            active={subsystems.secondary}
            onChange={() => handleSubsystemToggle('secondary')}
          />
          <ToggleSwitch
            label="Backup"
            active={subsystems.backup}
            onChange={() => handleSubsystemToggle('backup')}
          />
          <ToggleSwitch
            label="Überwachung"
            active={subsystems.monitoring}
            onChange={() => handleSubsystemToggle('monitoring')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Hardware Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="Prozessor" color="green" />
          <LEDIndicator label="Speicher" color="green" />
          <LEDIndicator label="Festplatten" color="green" />
          <LEDIndicator label="Netzwerkkarten" color="green" />
        </div>
      </div>
    </div>
  );

  const renderNetworkControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Bandbreite"
        value={bandwidth + ' Mbps'}
        color="green"
        size="large"
      />
      
      <AnalogGauge
        value={latency}
        min={0}
        max={100}
        unit="ms"
        label="Latenz"
        zones={[
          { max: 20, color: '#33ff33' },
          { max: 50, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Netzwerk Sicherheit</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Firewall"
            active={firewallActive}
            onChange={setFirewallActive}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Verschlüsselung"
              active={encryption}
              onChange={setEncryption}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Verbindungen</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="LAN" color="green" />
          <LEDIndicator label="WAN" color="green" />
          <LEDIndicator label="VPN" color="green" />
        </div>
      </div>
    </div>
  );

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
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Sicherheit</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Zugriffskontrolle"
            active={accessControl}
            onChange={setAccessControl}
          />
          <div style={{ marginTop: 12 }}>
            <ToggleSwitch
              label="Audit Log"
              active={auditLog}
              onChange={setAuditLog}
            />
          </div>
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Sicherheitsstatus</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Firewall" 
            color={firewallActive ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Verschlüsselung" 
            color={encryption ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Zugriffskontrolle" 
            color={accessControl ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Intrusion" 
            color={intrusion ? 'red' : 'off'} 
            pulse={intrusion}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Kontrollzentrale: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'overview' && renderOverviewControls()}
      {activeTab === 'systems' && renderSystemsControls()}
      {activeTab === 'network' && renderNetworkControls()}
      {activeTab === 'security' && renderSecurityControls()}
    </BaseTerminal>
  );
}

ControlTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

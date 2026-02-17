import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import WaveformDisplay from '../controls/WaveformDisplay';

export default function ServerFarmTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('compute');
  
  // Compute state
  const [cpuLoad, setCpuLoad] = useState(67);
  const [memoryUsage, setMemoryUsage] = useState(72);
  const [activeServers] = useState(248);
  const [serverClusters, setServerClusters] = useState({
    clusterA: true,
    clusterB: true,
    clusterC: false,
    clusterD: true
  });
  
  // Network state
  const [bandwidth, setBandwidth] = useState(8500);
  const [latency, setLatency] = useState(12);
  const [packetsPerSec] = useState(2400000);
  const [firewallActive, setFirewallActive] = useState(true);
  
  // Storage state
  const [storageUsed] = useState(847);
  const [iops, setIops] = useState(125000);
  const [raidArrays, setRaidArrays] = useState({
    array1: true,
    array2: true,
    array3: true,
    array4: false
  });
  
  // Cooling state
  const [tempZone1, setTempZone1] = useState(22);
  const [tempZone2, setTempZone2] = useState(23);
  const [humidity, setHumidity] = useState(45);
  const [UNUSED_coolingMode, UNUSED_setCoolingMode] = useState('auto');

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setMemoryUsage(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3)));
      setBandwidth(prev => Math.max(0, prev + (Math.random() - 0.5) * 500));
      setLatency(prev => Math.max(1, prev + (Math.random() - 0.5) * 2));
      setIops(prev => Math.max(0, prev + (Math.random() - 0.5) * 5000));
      setTempZone1(20 + Math.random() * 5);
      setTempZone2(21 + Math.random() * 5);
      setHumidity(40 + Math.random() * 10);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'compute', label: 'Rechenleistung' },
    { id: 'network', label: 'Netzwerk' },
    { id: 'storage', label: 'Speicher' },
    { id: 'cooling', label: 'Kühlung' }
  ];

  const handleClusterToggle = (cluster) => {
    setServerClusters(prev => ({
      ...prev,
      [cluster]: !prev[cluster]
    }));
  };

  const handleArrayToggle = (array) => {
    setRaidArrays(prev => ({
      ...prev,
      [array]: !prev[array]
    }));
  };

  const renderComputeControls = () => (
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
        label="RAM Nutzung"
        zones={[
          { max: 80, color: '#33ff33' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Aktive Server"
        value={`${activeServers} / 256`}
        color="green"
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Server Cluster</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Cluster A"
            active={serverClusters.clusterA}
            onChange={() => handleClusterToggle('clusterA')}
          />
          <ToggleSwitch
            label="Cluster B"
            active={serverClusters.clusterB}
            onChange={() => handleClusterToggle('clusterB')}
          />
          <ToggleSwitch
            label="Cluster C"
            active={serverClusters.clusterC}
            onChange={() => handleClusterToggle('clusterC')}
          />
          <ToggleSwitch
            label="Cluster D"
            active={serverClusters.clusterD}
            onChange={() => handleClusterToggle('clusterD')}
          />
        </div>
      </div>
    </div>
  );

  const renderNetworkControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={bandwidth}
        min={0}
        max={10000}
        unit="Mbps"
        label="Bandbreite"
        zones={[
          { max: 8000, color: '#33ff33' },
          { max: 9500, color: '#ffaa00' },
          { max: 10000, color: '#ff3333' }
        ]}
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
      
      <DigitalDisplay
        label="Pakete/Sekunde"
        value={packetsPerSec.toLocaleString()}
        color="blue"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Netzwerk Status</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Firewall Aktiv"
            active={firewallActive}
            onChange={setFirewallActive}
          />
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
            <LEDIndicator label="Uplink 1" color="green" />
            <LEDIndicator label="Uplink 2" color="green" />
            <LEDIndicator label="Backup" color="yellow" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStorageControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Speicher Belegt"
        value={`${storageUsed} / 1024 TB`}
        color="blue"
        size="large"
      />
      
      <DigitalDisplay
        label="IOPS"
        value={iops.toLocaleString()}
        color="green"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">RAID Arrays</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Array 1"
            active={raidArrays.array1}
            onChange={() => handleArrayToggle('array1')}
          />
          <ToggleSwitch
            label="Array 2"
            active={raidArrays.array2}
            onChange={() => handleArrayToggle('array2')}
          />
          <ToggleSwitch
            label="Array 3"
            active={raidArrays.array3}
            onChange={() => handleArrayToggle('array3')}
          />
          <ToggleSwitch
            label="Array 4"
            active={raidArrays.array4}
            onChange={() => handleArrayToggle('array4')}
          />
        </div>
      </div>
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Speicher Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator label="SSD Pool" color="green" />
          <LEDIndicator label="HDD Pool" color="green" />
          <LEDIndicator label="Backup System" color="green" />
        </div>
      </div>
    </div>
  );

  const renderCoolingControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={tempZone1}
        min={0}
        max={40}
        unit="°C"
        label="Temperatur Zone 1"
        zones={[
          { max: 25, color: '#33ff33' },
          { max: 30, color: '#ffaa00' },
          { max: 40, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={tempZone2}
        min={0}
        max={40}
        unit="°C"
        label="Temperatur Zone 2"
        zones={[
          { max: 25, color: '#33ff33' },
          { max: 30, color: '#ffaa00' },
          { max: 40, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={humidity}
        min={0}
        max={100}
        unit="%"
        label="Luftfeuchtigkeit"
        zones={[
          { max: 30, color: '#ffaa00' },
          { max: 60, color: '#33ff33' },
          { max: 100, color: '#ffaa00' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Kühlsystem</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="HVAC 1" color="green" />
          <LEDIndicator label="HVAC 2" color="green" />
          <LEDIndicator label="HVAC 3" color="green" />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Serverfarm: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'compute' && renderComputeControls()}
      {activeTab === 'network' && renderNetworkControls()}
      {activeTab === 'storage' && renderStorageControls()}
      {activeTab === 'cooling' && renderCoolingControls()}
    </BaseTerminal>
  );
}

ServerFarmTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

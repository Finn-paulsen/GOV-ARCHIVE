import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import Slider from '../controls/Slider';

export default function EnergyTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('generation');
  
  // Generation state
  const [totalOutput, setTotalOutput] = useState(4500);
  const [sources, setSources] = useState({
    coal: true,
    gas: true,
    nuclear: false,
    hydro: true,
    wind: true,
    solar: true
  });
  const [efficiency, UNUSED_setEfficiency] = useState(87);
  
  // Distribution state
  const [gridLoad, setGridLoad] = useState(72);
  const [voltage, setVoltage] = useState(400);
  const [frequency, setFrequency] = useState(50.0);
  const [substations, setSubstations] = useState({
    subA: true,
    subB: true,
    subC: false,
    subD: true
  });
  
  // Storage state
  const [batteryCharge, setBatteryCharge] = useState(68);
  const [batteryOutput, UNUSED_setBatteryOutput] = useState(250);
  const [capacitorBank, setCapacitorBank] = useState(true);
  
  // Grid state
  const [peakDemand, UNUSED_setPeakDemand] = useState(5200);
  const [currentDemand, setCurrentDemand] = useState(4100);
  const [gridStability, setGridStability] = useState(98);
  const [blackoutRisk, setBlackoutRisk] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalOutput(_prev => Math.max(0, _prev + (Math.random() - 0.5) * 100));
      setGridLoad(_prev => Math.max(0, Math.min(100, _prev + (Math.random() - 0.5) * 3)));
      setVoltage(_prev => 395 + Math.random() * 10);
      setFrequency(_prev => 49.9 + Math.random() * 0.2);
      setCurrentDemand(_prev => Math.max(0, _prev + (Math.random() - 0.5) * 50));
      setGridStability(_prev => Math.max(0, Math.min(100, _prev + (Math.random() - 0.5) * 2)));
      setBatteryCharge(_prev => Math.max(0, Math.min(100, _prev + (Math.random() - 0.5) * 1)));
      
      setBlackoutRisk(gridLoad > 95 || gridStability < 80);
    }, 2000);

    return () => clearInterval(interval);
  }, [gridLoad, gridStability]);

  const tabs = [
    { id: 'generation', label: 'Erzeugung' },
    { id: 'distribution', label: 'Verteilung' },
    { id: 'storage', label: 'Speicherung' },
    { id: 'grid', label: 'Netz' }
  ];

  const handleSourceToggle = (source) => {
    setSources(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleSubstationToggle = (sub) => {
    setSubstations(prev => ({
      ...prev,
      [sub]: !prev[sub]
    }));
  };

  const renderGenerationControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={totalOutput}
        min={0}
        max={6000}
        unit="MW"
        label="Gesamtleistung"
        size={220}
        zones={[
          { max: 5000, color: '#33ff33' },
          { max: 5500, color: '#ffaa00' },
          { max: 6000, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={efficiency}
        min={0}
        max={100}
        unit="%"
        label="Wirkungsgrad"
        zones={[
          { max: 70, color: '#ff3333' },
          { max: 85, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Energiequellen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Kohle"
            active={sources.coal}
            onChange={() => handleSourceToggle('coal')}
          />
          <ToggleSwitch
            label="Gas"
            active={sources.gas}
            onChange={() => handleSourceToggle('gas')}
          />
          <ToggleSwitch
            label="Nuklear"
            active={sources.nuclear}
            onChange={() => handleSourceToggle('nuclear')}
          />
          <ToggleSwitch
            label="Wasser"
            active={sources.hydro}
            onChange={() => handleSourceToggle('hydro')}
          />
          <ToggleSwitch
            label="Wind"
            active={sources.wind}
            onChange={() => handleSourceToggle('wind')}
          />
          <ToggleSwitch
            label="Solar"
            active={sources.solar}
            onChange={() => handleSourceToggle('solar')}
          />
        </div>
      </div>
    </div>
  );

  const renderDistributionControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={gridLoad}
        min={0}
        max={100}
        unit="%"
        label="Netzauslastung"
        zones={[
          { max: 80, color: '#33ff33' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#ff3333' }
        ]}
      />
      
      <DigitalDisplay
        label="Netzspannung"
        value={voltage.toFixed(1) + ' kV'}
        color="blue"
      />
      
      <DigitalDisplay
        label="Frequenz"
        value={frequency.toFixed(2) + ' Hz'}
        color={Math.abs(frequency - 50) > 0.1 ? 'yellow' : 'green'}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Umspannwerke</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Station A"
            active={substations.subA}
            onChange={() => handleSubstationToggle('subA')}
          />
          <ToggleSwitch
            label="Station B"
            active={substations.subB}
            onChange={() => handleSubstationToggle('subB')}
          />
          <ToggleSwitch
            label="Station C"
            active={substations.subC}
            onChange={() => handleSubstationToggle('subC')}
          />
          <ToggleSwitch
            label="Station D"
            active={substations.subD}
            onChange={() => handleSubstationToggle('subD')}
          />
        </div>
      </div>
    </div>
  );

  const renderStorageControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={batteryCharge}
        min={0}
        max={100}
        unit="%"
        label="Batterieladung"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 70, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <DigitalDisplay
        label="Batterie Leistung"
        value={batteryOutput + ' MW'}
        color="green"
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Speichersysteme</div>
        <div style={{ marginTop: 12 }}>
          <ToggleSwitch
            label="Kondensatorbank"
            active={capacitorBank}
            onChange={setCapacitorBank}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Batterie 1" color="green" />
          <LEDIndicator label="Batterie 2" color="green" />
        </div>
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Speicher Status</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="Laden" color={batteryCharge < 95 ? 'green' : 'off'} />
          <LEDIndicator label="Entladen" color={batteryOutput > 0 ? 'yellow' : 'off'} />
          <LEDIndicator label="Bereit" color="green" />
        </div>
      </div>
    </div>
  );

  const renderGridControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Aktueller Bedarf"
        value={currentDemand.toLocaleString() + ' MW'}
        color="blue"
        size="large"
      />
      
      <DigitalDisplay
        label="Spitzenbedarf"
        value={peakDemand.toLocaleString() + ' MW'}
        color="yellow"
      />
      
      <AnalogGauge
        value={gridStability}
        min={0}
        max={100}
        unit="%"
        label="Netzstabilität"
        zones={[
          { max: 80, color: '#ff3333' },
          { max: 95, color: '#ffaa00' },
          { max: 100, color: '#33ff33' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Netz Status</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="Erzeugung" 
            color={totalOutput > currentDemand ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Verteilung" 
            color={gridLoad < 95 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Speicher" 
            color={batteryCharge > 30 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Stabilität" 
            color={gridStability > 95 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Blackout Risiko" 
            color={blackoutRisk ? 'red' : 'off'} 
            pulse={blackoutRisk}
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Energienetz: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'generation' && renderGenerationControls()}
      {activeTab === 'distribution' && renderDistributionControls()}
      {activeTab === 'storage' && renderStorageControls()}
      {activeTab === 'grid' && renderGridControls()}
    </BaseTerminal>
  );
}

EnergyTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

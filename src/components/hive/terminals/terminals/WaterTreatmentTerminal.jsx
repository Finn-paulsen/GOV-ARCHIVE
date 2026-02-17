import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import Slider from '../controls/Slider';

export default function WaterTreatmentTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('intake');
  
  // Intake state
  const [flowRate, setFlowRate] = useState(12500);
  const [inletPressure, setInletPressure] = useState(4.2);
  const [turbidity, setTurbidity] = useState(8.5);
  const [intakePumps, setIntakePumps] = useState({
    pump1: true,
    pump2: true,
    pump3: false,
    pump4: false
  });
  
  // Treatment state
  const [chlorineLevel, setChlorineLevel] = useState(1.2);
  const [phLevel, setPhLevel] = useState(7.4);
  const [filterPressure, setFilterPressure] = useState(3.1);
  const [uvIntensity] = useState(85);
  
  // Distribution state
  const [reservoirLevel, setReservoirLevel] = useState(78);
  const [outputPressure, setOutputPressure] = useState(5.5);
  const [distributionValves, setDistributionValves] = useState({
    zone1: true,
    zone2: true,
    zone3: true,
    zone4: false
  });
  
  // Quality state
  const [bacteriaCount] = useState(0);
  const [hardness] = useState(145);
  const [waterQuality] = useState('excellent');

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowRate(prev => Math.max(0, prev + (Math.random() - 0.5) * 200));
      setInletPressure(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.2));
      setTurbidity(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.5));
      setPhLevel(prev => Math.max(6, Math.min(8.5, prev + (Math.random() - 0.5) * 0.1)));
      setFilterPressure(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.15));
      setReservoirLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 1)));
      setOutputPressure(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.2));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'intake', label: 'Einlass' },
    { id: 'treatment', label: 'Aufbereitung' },
    { id: 'distribution', label: 'Verteilung' },
    { id: 'quality', label: 'Qualität' }
  ];

  const handlePumpToggle = (pump) => {
    setIntakePumps(prev => ({
      ...prev,
      [pump]: !prev[pump]
    }));
  };

  const handleValveToggle = (valve) => {
    setDistributionValves(prev => ({
      ...prev,
      [valve]: !prev[valve]
    }));
  };

  const renderIntakeControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={flowRate}
        min={0}
        max={20000}
        unit="m³/h"
        label="Durchflussrate"
        zones={[
          { max: 15000, color: '#33ff33' },
          { max: 18000, color: '#ffaa00' },
          { max: 20000, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={inletPressure}
        min={0}
        max={10}
        unit="bar"
        label="Eingangsdruck"
        zones={[
          { max: 6, color: '#33ff33' },
          { max: 8, color: '#ffaa00' },
          { max: 10, color: '#ff3333' }
        ]}
      />
      
      <AnalogGauge
        value={turbidity}
        min={0}
        max={20}
        unit="NTU"
        label="Trübung"
        zones={[
          { max: 10, color: '#33ff33' },
          { max: 15, color: '#ffaa00' },
          { max: 20, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Einlasspumpen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Pumpe 1"
            active={intakePumps.pump1}
            onChange={() => handlePumpToggle('pump1')}
          />
          <ToggleSwitch
            label="Pumpe 2"
            active={intakePumps.pump2}
            onChange={() => handlePumpToggle('pump2')}
          />
          <ToggleSwitch
            label="Pumpe 3"
            active={intakePumps.pump3}
            onChange={() => handlePumpToggle('pump3')}
          />
          <ToggleSwitch
            label="Pumpe 4"
            active={intakePumps.pump4}
            onChange={() => handlePumpToggle('pump4')}
          />
        </div>
      </div>
    </div>
  );

  const renderTreatmentControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={phLevel}
        min={0}
        max={14}
        unit="pH"
        label="pH-Wert"
        zones={[
          { max: 6.5, color: '#ffaa00' },
          { max: 8.5, color: '#33ff33' },
          { max: 14, color: '#ffaa00' }
        ]}
      />
      
      <AnalogGauge
        value={filterPressure}
        min={0}
        max={6}
        unit="bar"
        label="Filterdruck"
        zones={[
          { max: 4, color: '#33ff33' },
          { max: 5, color: '#ffaa00' },
          { max: 6, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">Chlorierung</div>
        <Slider
          label="Chlor Dosierung"
          value={chlorineLevel}
          min={0}
          max={5}
          step={0.1}
          unit="mg/L"
          onChange={setChlorineLevel}
        />
      </div>
      
      <div className="terminal-panel">
        <div className="terminal-panel-header">UV Desinfektion</div>
        <DigitalDisplay
          label="UV Intensität"
          value={uvIntensity.toFixed(0) + '%'}
          color={uvIntensity > 80 ? 'green' : 'yellow'}
        />
        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around', marginTop: 12 }}>
          <LEDIndicator label="UV Bank 1" color="green" />
          <LEDIndicator label="UV Bank 2" color="green" />
        </div>
      </div>
    </div>
  );

  const renderDistributionControls = () => (
    <div className="terminal-grid">
      <AnalogGauge
        value={reservoirLevel}
        min={0}
        max={100}
        unit="%"
        label="Speicherfüllstand"
        zones={[
          { max: 30, color: '#ff3333' },
          { max: 80, color: '#33ff33' },
          { max: 100, color: '#ffaa00' }
        ]}
      />
      
      <AnalogGauge
        value={outputPressure}
        min={0}
        max={10}
        unit="bar"
        label="Ausgangsdruck"
        zones={[
          { max: 7, color: '#33ff33' },
          { max: 9, color: '#ffaa00' },
          { max: 10, color: '#ff3333' }
        ]}
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Verteilungsventile</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Zone 1 Nord"
            active={distributionValves.zone1}
            onChange={() => handleValveToggle('zone1')}
          />
          <ToggleSwitch
            label="Zone 2 Ost"
            active={distributionValves.zone2}
            onChange={() => handleValveToggle('zone2')}
          />
          <ToggleSwitch
            label="Zone 3 Süd"
            active={distributionValves.zone3}
            onChange={() => handleValveToggle('zone3')}
          />
          <ToggleSwitch
            label="Zone 4 West"
            active={distributionValves.zone4}
            onChange={() => handleValveToggle('zone4')}
          />
        </div>
      </div>
    </div>
  );

  const renderQualityControls = () => (
    <div className="terminal-grid">
      <DigitalDisplay
        label="Bakterienanzahl"
        value={bacteriaCount + ' CFU/100mL'}
        color={bacteriaCount === 0 ? 'green' : 'red'}
        size="large"
      />
      
      <DigitalDisplay
        label="Wasserhärte"
        value={hardness + ' mg/L CaCO₃'}
        color="blue"
      />
      
      <DigitalDisplay
        label="Gesamtqualität"
        value={waterQuality.toUpperCase()}
        color={waterQuality === 'excellent' ? 'green' : waterQuality === 'good' ? 'yellow' : 'red'}
        size="large"
      />
      
      <div className="terminal-panel" style={{ gridColumn: '1 / -1' }}>
        <div className="terminal-panel-header">Qualitätsindikatoren</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'space-around', marginTop: 16 }}>
          <LEDIndicator 
            label="pH OK" 
            color={phLevel >= 6.5 && phLevel <= 8.5 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="Chlor OK" 
            color={chlorineLevel >= 0.5 && chlorineLevel <= 2 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Trübung OK" 
            color={turbidity < 10 ? 'green' : 'yellow'} 
          />
          <LEDIndicator 
            label="Bakterien OK" 
            color={bacteriaCount === 0 ? 'green' : 'red'} 
          />
          <LEDIndicator 
            label="UV OK" 
            color={uvIntensity > 80 ? 'green' : 'yellow'} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Wasserwerk: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      {activeTab === 'intake' && renderIntakeControls()}
      {activeTab === 'treatment' && renderTreatmentControls()}
      {activeTab === 'distribution' && renderDistributionControls()}
      {activeTab === 'quality' && renderQualityControls()}
    </BaseTerminal>
  );
}

WaterTreatmentTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

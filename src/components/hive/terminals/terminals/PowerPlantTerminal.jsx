import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import BaseTerminal from '../BaseTerminal';
import AnalogGauge from '../controls/AnalogGauge';
import ToggleSwitch from '../controls/ToggleSwitch';
import PushButton from '../controls/PushButton';
import LEDIndicator from '../controls/LEDIndicator';
import DigitalDisplay from '../controls/DigitalDisplay';
import Slider from '../controls/Slider';
import StatusBoard from '../controls/StatusBoard';
import AuditLog from '../controls/AuditLog';
import SaveRevertButtons from '../controls/SaveRevertButtons';

export default function PowerPlantTerminal({ location, onClose }) {
  const [activeTab, setActiveTab] = useState('reactor');
  
  // Track changes for save/revert functionality
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedState, setSavedState] = useState(null);
  const [auditLog, setAuditLog] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      message: 'Terminal session started',
      user: 'Administrator',
      type: 'info'
    }
  ]);
  
  // Reactor state
  const [coreTemp, setCoreTemp] = useState(320);
  const [controlRodPosition, setControlRodPosition] = useState(65);
  const [neutronFlux, setNeutronFlux] = useState(75);
  const [coolantPressure, setCoolantPressure] = useState(155);
  const [radiationLevel, setRadiationLevel] = useState(0.5);
  
  // Turbine state
  const [turbineRPM, setTurbineRPM] = useState(3000);
  const [steamPressure, setSteamPressure] = useState(180);
  const [generatorFreq, setGeneratorFreq] = useState(50.0);
  const [vibrationLevel, setVibrationLevel] = useState(2.5);
  
  // Grid state
  const [powerOutput, setPowerOutput] = useState(1200);
  const [gridVoltage, setGridVoltage] = useState(400);
  const [circuitBreakers, setCircuitBreakers] = useState({
    main: true,
    backup: false,
    grid1: true,
    grid2: true,
    grid3: false
  });
  
  // Emergency state
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [backupGenerator, setBackupGenerator] = useState(false);
  const [fireSuppressionArmed, setFireSuppressionArmed] = useState(true);

  // Simulate realistic data changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!emergencyMode) {
        // Normal operation variations
        setCoreTemp(prev => prev + (Math.random() - 0.5) * 2);
        setNeutronFlux(prev => Math.max(60, Math.min(90, prev + (Math.random() - 0.5) * 3)));
        setCoolantPressure(prev => prev + (Math.random() - 0.5) * 1);
        setRadiationLevel(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.1));
        
        setTurbineRPM(prev => prev + (Math.random() - 0.5) * 10);
        setSteamPressure(prev => prev + (Math.random() - 0.5) * 2);
        setGeneratorFreq(49.9 + Math.random() * 0.2);
        setVibrationLevel(2 + Math.random() * 1);
        
        setPowerOutput(prev => prev + (Math.random() - 0.5) * 20);
        setGridVoltage(395 + Math.random() * 10);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [emergencyMode]);

  // Control rod position directly affects temperature and flux
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => {
    const newTemp = emergencyMode ? 100 : 250 + (controlRodPosition * 10);
    const newFlux = emergencyMode ? 0 : controlRodPosition * 1.2;
    
    // Only update if values changed significantly
    if (Math.abs(coreTemp - newTemp) > 0.1) {
      setCoreTemp(newTemp);
    }
    if (Math.abs(neutronFlux - newFlux) > 0.1) {
      setNeutronFlux(newFlux);
    }
  }, [controlRodPosition, emergencyMode]);

  // Helper function to add audit log entry
  const addLogEntry = (message, type = 'info') => {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      user: 'Administrator',
      type
    };
    setAuditLog(prev => [...prev, entry]);
    
    // Show toast notification
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.info(message);
    }
  };

  // Save current state as baseline
  const saveCurrentState = () => {
    const state = {
      coreTemp,
      controlRodPosition,
      neutronFlux,
      coolantPressure,
      turbineRPM,
      powerOutput,
      circuitBreakers
    };
    setSavedState(state);
    setHasUnsavedChanges(false);
    addLogEntry('Configuration saved successfully');
  };

  // Revert to saved state
  const revertToSavedState = () => {
    if (savedState) {
      setCoreTemp(savedState.coreTemp);
      setControlRodPosition(savedState.controlRodPosition);
      setNeutronFlux(savedState.neutronFlux);
      setCoolantPressure(savedState.coolantPressure);
      setTurbineRPM(savedState.turbineRPM);
      setPowerOutput(savedState.powerOutput);
      setCircuitBreakers(savedState.circuitBreakers);
      setHasUnsavedChanges(false);
      addLogEntry('Configuration reverted to last saved state', 'warning');
    }
  };

  // Initialize saved state on mount with initial values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initialState = {
      coreTemp,
      controlRodPosition,
      neutronFlux,
      coolantPressure,
      turbineRPM,
      powerOutput,
      circuitBreakers
    };
    setSavedState(initialState);
  }, []);

  const tabs = [
    { id: 'reactor', label: 'Reaktorkern' },
    { id: 'turbine', label: 'Turbinenhalle' },
    { id: 'grid', label: 'Stromnetz' },
    { id: 'emergency', label: 'Notfall' }
  ];

  const handleEmergencyShutdown = () => {
    setEmergencyMode(true);
    setControlRodPosition(0);
    setCoreTemp(100);
    setPowerOutput(0);
    setCircuitBreakers({
      main: false,
      backup: false,
      grid1: false,
      grid2: false,
      grid3: false
    });
    setHasUnsavedChanges(true);
    addLogEntry('EMERGENCY SHUTDOWN initiated', 'error');
  };

  const handleCircuitBreakerToggle = (breaker) => {
    setCircuitBreakers(prev => ({
      ...prev,
      [breaker]: !prev[breaker]
    }));
    setHasUnsavedChanges(true);
    addLogEntry(`Circuit breaker ${breaker} ${!circuitBreakers[breaker] ? 'engaged' : 'disengaged'}`);
  };

  const handleControlRodChange = (newValue) => {
    setControlRodPosition(newValue);
    setHasUnsavedChanges(true);
    addLogEntry(`Control rod position set to ${newValue}%`);
  };

  const renderReactorControls = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', padding: '16px' }}>
      {/* Primary Reactor Gauges */}
      <AnalogGauge
        value={coreTemp}
        min={0}
        max={3000}
        unit="°C"
        label="Kerntemperatur"
        zones={[
          { max: 500, color: '#4caf50' },
          { max: 800, color: '#ff9800' },
          { max: 3000, color: '#f44336' }
        ]}
      />
      
      <AnalogGauge
        value={neutronFlux}
        min={0}
        max={100}
        unit="%"
        label="Neutronenfluss"
        zones={[
          { max: 80, color: '#4caf50' },
          { max: 95, color: '#ff9800' },
          { max: 100, color: '#f44336' }
        ]}
      />
      
      <AnalogGauge
        value={coolantPressure}
        min={0}
        max={200}
        unit="bar"
        label="Kühlmitteldruck"
        zones={[
          { max: 170, color: '#4caf50' },
          { max: 185, color: '#ff9800' },
          { max: 200, color: '#f44336' }
        ]}
      />

      {/* Additional Reactor Monitoring Gauges */}
      <AnalogGauge
        value={coreTemp * 0.85}
        min={0}
        max={2500}
        unit="°C"
        label="Kühlmittel Einlass"
        zones={[
          { max: 400, color: '#4caf50' },
          { max: 600, color: '#ff9800' },
          { max: 2500, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={coreTemp * 1.1}
        min={0}
        max={3500}
        unit="°C"
        label="Kühlmittel Auslass"
        zones={[
          { max: 550, color: '#4caf50' },
          { max: 900, color: '#ff9800' },
          { max: 3500, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={coolantPressure * 0.6}
        min={0}
        max={150}
        unit="bar"
        label="Primärkreislauf"
        zones={[
          { max: 120, color: '#4caf50' },
          { max: 135, color: '#ff9800' },
          { max: 150, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={coolantPressure * 0.4}
        min={0}
        max={100}
        unit="bar"
        label="Sekundärkreislauf"
        zones={[
          { max: 80, color: '#4caf50' },
          { max: 90, color: '#ff9800' },
          { max: 100, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={radiationLevel * 1000}
        min={0}
        max={2000}
        unit="μSv"
        label="Gamma Strahlung"
        zones={[
          { max: 1000, color: '#4caf50' },
          { max: 1500, color: '#ff9800' },
          { max: 2000, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={radiationLevel * 800}
        min={0}
        max={1600}
        unit="μSv"
        label="Neutronen"
        zones={[
          { max: 800, color: '#4caf50' },
          { max: 1200, color: '#ff9800' },
          { max: 1600, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={50 + Math.random() * 100}
        min={0}
        max={200}
        unit="l/s"
        label="Kühlmittelfluss"
        zones={[
          { max: 160, color: '#4caf50' },
          { max: 180, color: '#ff9800' },
          { max: 200, color: '#f44336' }
        ]}
      />

      {/* Digital Displays Row */}
      <DigitalDisplay
        label="Strahlungslevel"
        value={radiationLevel.toFixed(2) + ' mSv/h'}
        color={radiationLevel > 1 ? 'red' : 'green'}
      />

      <DigitalDisplay
        label="Reaktor Status"
        value={emergencyMode ? 'NOTFALL' : 'BETRIEB'}
        color={emergencyMode ? 'red' : 'green'}
      />

      <DigitalDisplay
        label="Brennelement"
        value="ELEMENT-47A"
        color="blue"
      />

      <DigitalDisplay
        label="Betriebsstunden"
        value="14,287 h"
        color="green"
      />

      <DigitalDisplay
        label="Reaktivität"
        value={(neutronFlux * 0.95).toFixed(1) + '%'}
        color="blue"
      />

      {/* Control Rod Panel */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Steuerstäbe Bank A</div>
        <Slider
          label="Position"
          value={controlRodPosition}
          min={0}
          max={100}
          step={1}
          unit="%"
          onChange={handleControlRodChange}
          disabled={emergencyMode}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'space-around' }}>
          <LEDIndicator label="Stab 1" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
          <LEDIndicator label="Stab 2" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
          <LEDIndicator label="Stab 3" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
          <LEDIndicator label="Stab 4" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
        </div>
      </div>

      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Steuerstäbe Bank B</div>
        <Slider
          label="Position"
          value={controlRodPosition * 0.9}
          min={0}
          max={100}
          step={1}
          unit="%"
          disabled={true}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'space-around' }}>
          <LEDIndicator label="Stab 5" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
          <LEDIndicator label="Stab 6" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
          <LEDIndicator label="Stab 7" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
          <LEDIndicator label="Stab 8" color={controlRodPosition < 50 ? 'green' : 'yellow'} />
        </div>
      </div>

      {/* Safety Systems Status Panel */}
      <div className="terminal-panel" style={{ gridColumn: 'span 1' }}>
        <div className="terminal-panel-header">Sicherheitssysteme</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <LEDIndicator label="ECCS" color="green" />
          <LEDIndicator label="Containment" color="green" />
          <LEDIndicator label="Backup Power" color="green" />
          <LEDIndicator label="Core Cooling" color="green" />
        </div>
      </div>

      {/* Reactor Zone Temperatures */}
      <div className="terminal-panel" style={{ gridColumn: 'span 3' }}>
        <div className="terminal-panel-header">Reaktorzone Temperaturen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
          <DigitalDisplay label="Zone 1" value={(coreTemp * 0.95).toFixed(0) + '°C'} color="green" />
          <DigitalDisplay label="Zone 2" value={(coreTemp * 1.02).toFixed(0) + '°C'} color="green" />
          <DigitalDisplay label="Zone 3" value={(coreTemp * 0.98).toFixed(0) + '°C'} color="green" />
          <DigitalDisplay label="Zone 4" value={(coreTemp * 1.01).toFixed(0) + '°C'} color="green" />
        </div>
      </div>

      {/* Alarm Status Panel */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Alarme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
          <LEDIndicator label="Hoch Temp" color="off" />
          <LEDIndicator label="Hoch Druck" color="off" />
          <LEDIndicator label="Niedrig Fluss" color="off" />
          <LEDIndicator label="Strahlung" color="off" />
          <LEDIndicator label="Ventilation" color="off" />
          <LEDIndicator label="Leckage" color="off" />
        </div>
      </div>
    </div>
  );

  const renderTurbineControls = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px' }}>
      {/* Primary Turbine Gauges */}
      <AnalogGauge
        value={turbineRPM}
        min={0}
        max={3600}
        unit="RPM"
        label="Turbine 1 Drehzahl"
        zones={[
          { max: 3200, color: '#4caf50' },
          { max: 3500, color: '#ff9800' },
          { max: 3600, color: '#f44336' }
        ]}
      />
      
      <AnalogGauge
        value={turbineRPM * 0.98}
        min={0}
        max={3600}
        unit="RPM"
        label="Turbine 2 Drehzahl"
        zones={[
          { max: 3200, color: '#4caf50' },
          { max: 3500, color: '#ff9800' },
          { max: 3600, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={turbineRPM * 1.01}
        min={0}
        max={3600}
        unit="RPM"
        label="Turbine 3 Drehzahl"
        zones={[
          { max: 3200, color: '#4caf50' },
          { max: 3500, color: '#ff9800' },
          { max: 3600, color: '#f44336' }
        ]}
      />
      
      <AnalogGauge
        value={steamPressure}
        min={0}
        max={250}
        unit="bar"
        label="Dampfdruck HD"
        zones={[
          { max: 200, color: '#4caf50' },
          { max: 230, color: '#ff9800' },
          { max: 250, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={steamPressure * 0.6}
        min={0}
        max={150}
        unit="bar"
        label="Dampfdruck MD"
        zones={[
          { max: 120, color: '#4caf50' },
          { max: 135, color: '#ff9800' },
          { max: 150, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={steamPressure * 0.3}
        min={0}
        max={80}
        unit="bar"
        label="Dampfdruck ND"
        zones={[
          { max: 65, color: '#4caf50' },
          { max: 72, color: '#ff9800' },
          { max: 80, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={450 + Math.random() * 50}
        min={0}
        max={600}
        unit="°C"
        label="Dampf Temperatur"
        zones={[
          { max: 500, color: '#4caf50' },
          { max: 550, color: '#ff9800' },
          { max: 600, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={vibrationLevel}
        min={0}
        max={10}
        unit="mm/s"
        label="Vibration Lager A"
        zones={[
          { max: 5, color: '#4caf50' },
          { max: 8, color: '#ff9800' },
          { max: 10, color: '#f44336' }
        ]}
      />

      {/* Generator Panels */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Generator 1</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
          <DigitalDisplay label="Frequenz" value={generatorFreq.toFixed(2) + ' Hz'} color="green" />
          <DigitalDisplay label="Leistung" value={(powerOutput * 0.4).toFixed(0) + ' MW'} color="green" />
          <DigitalDisplay label="Spannung" value="22.5 kV" color="blue" />
          <DigitalDisplay label="Strom" value="18.2 kA" color="blue" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-around' }}>
          <LEDIndicator label="Online" color="green" />
          <LEDIndicator label="Synced" color="green" />
          <LEDIndicator label="Exc OK" color="green" />
        </div>
      </div>

      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Generator 2</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
          <DigitalDisplay label="Frequenz" value={generatorFreq.toFixed(2) + ' Hz'} color="green" />
          <DigitalDisplay label="Leistung" value={(powerOutput * 0.6).toFixed(0) + ' MW'} color="green" />
          <DigitalDisplay label="Spannung" value="22.5 kV" color="blue" />
          <DigitalDisplay label="Strom" value="27.3 kA" color="blue" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'space-around' }}>
          <LEDIndicator label="Online" color="green" />
          <LEDIndicator label="Synced" color="green" />
          <LEDIndicator label="Exc OK" color="green" />
        </div>
      </div>

      {/* Turbine Status Indicators */}
      <div className="terminal-panel" style={{ gridColumn: 'span 4' }}>
        <div className="terminal-panel-header">Turbinen & Lager Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginTop: 8 }}>
          <LEDIndicator label="Turb 1 Run" color="green" />
          <LEDIndicator label="Turb 2 Run" color="green" />
          <LEDIndicator label="Turb 3 Run" color={powerOutput > 1000 ? 'green' : 'yellow'} />
          <LEDIndicator label="Lager 1 OK" color="green" />
          <LEDIndicator label="Lager 2 OK" color="green" />
          <LEDIndicator label="Lager 3 OK" color="green" />
          <LEDIndicator label="Öldruck OK" color="green" />
          <LEDIndicator label="Kondensator" color="green" />
        </div>
      </div>

      {/* Steam System */}
      <div className="terminal-panel" style={{ gridColumn: 'span 4' }}>
        <div className="terminal-panel-header">Dampfsystem</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 8 }}>
          <DigitalDisplay label="Frischdampf" value={steamPressure.toFixed(0) + ' bar'} color="green" />
          <DigitalDisplay label="Speisewasser" value={(steamPressure * 1.1).toFixed(0) + ' bar'} color="blue" />
          <DigitalDisplay label="Kondensatdruck" value="2.5 bar" color="blue" />
          <DigitalDisplay label="Vakuum" value="0.05 bar" color="green" />
          <DigitalDisplay label="HD Bypass" value="CLOSED" color="green" />
          <DigitalDisplay label="ND Bypass" value="CLOSED" color="green" />
        </div>
      </div>
    </div>
  );

  const renderGridControls = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '16px' }}>
      {/* Main Power Output Gauges */}
      <div style={{ gridColumn: 'span 1' }}>
        <AnalogGauge
          value={powerOutput}
          min={0}
          max={1500}
          unit="MW"
          label="Netzleistung Total"
          zones={[
            { max: 1200, color: '#4caf50' },
            { max: 1400, color: '#ff9800' },
            { max: 1500, color: '#f44336' }
          ]}
        />
      </div>

      <AnalogGauge
        value={gridVoltage}
        min={0}
        max={500}
        unit="kV"
        label="Netzspannung L1"
        zones={[
          { max: 420, color: '#4caf50' },
          { max: 460, color: '#ff9800' },
          { max: 500, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={gridVoltage * 0.99}
        min={0}
        max={500}
        unit="kV"
        label="Netzspannung L2"
        zones={[
          { max: 420, color: '#4caf50' },
          { max: 460, color: '#ff9800' },
          { max: 500, color: '#f44336' }
        ]}
      />

      <AnalogGauge
        value={gridVoltage * 1.01}
        min={0}
        max={500}
        unit="kV"
        label="Netzspannung L3"
        zones={[
          { max: 420, color: '#4caf50' },
          { max: 460, color: '#ff9800' },
          { max: 500, color: '#f44336' }
        ]}
      />

      {/* Circuit Breaker Panel */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Hauptleistungsschalter</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Hauptschalter"
            active={circuitBreakers.main}
            onChange={() => handleCircuitBreakerToggle('main')}
            disabled={emergencyMode}
          />
          <ToggleSwitch
            label="Backup"
            active={circuitBreakers.backup}
            onChange={() => handleCircuitBreakerToggle('backup')}
          />
          <ToggleSwitch
            label="Netz 1"
            active={circuitBreakers.grid1}
            onChange={() => handleCircuitBreakerToggle('grid1')}
          />
          <ToggleSwitch
            label="Netz 2"
            active={circuitBreakers.grid2}
            onChange={() => handleCircuitBreakerToggle('grid2')}
          />
          <ToggleSwitch
            label="Netz 3"
            active={circuitBreakers.grid3}
            onChange={() => handleCircuitBreakerToggle('grid3')}
          />
          <ToggleSwitch
            label="Reserve"
            active={false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Transformer Status */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Transformatoren Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
          <LEDIndicator label="Trafo 1" color="green" />
          <LEDIndicator label="Trafo 2" color="green" />
          <LEDIndicator label="Trafo 3" color="green" />
          <LEDIndicator label="Trafo 4" color="green" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 8 }}>
          <DigitalDisplay label="Trafo 1 Temp" value="75°C" color="green" />
          <DigitalDisplay label="Trafo 2 Temp" value="78°C" color="green" />
        </div>
      </div>

      {/* Grid Sync Panel */}
      <div className="terminal-panel" style={{ gridColumn: 'span 4' }}>
        <div className="terminal-panel-header">Netzsynchronisation</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginTop: 8 }}>
          <DigitalDisplay label="Frequenz" value={generatorFreq.toFixed(2) + ' Hz'} color="green" />
          <DigitalDisplay label="Phase L1" value="0.0°" color="blue" />
          <DigitalDisplay label="Phase L2" value="120.0°" color="blue" />
          <DigitalDisplay label="Phase L3" value="240.0°" color="blue" />
          <DigitalDisplay label="PF" value="0.98" color="green" />
          <DigitalDisplay label="Wirkl." value={(powerOutput * 0.98).toFixed(0) + ' MW'} color="green" />
          <DigitalDisplay label="Blindl." value={(powerOutput * 0.15).toFixed(0) + ' MVAr'} color="blue" />
          <DigitalDisplay label="Scheinl." value={powerOutput.toFixed(0) + ' MVA'} color="blue" />
        </div>
      </div>

      {/* Load Distribution */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Lastverteilung</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--terminal-label)' }}>Netz Nord:</span>
            <span style={{ fontSize: '14px', color: 'var(--terminal-text)', fontWeight: 'bold' }}>{(powerOutput * 0.4).toFixed(0)} MW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--terminal-label)' }}>Netz Süd:</span>
            <span style={{ fontSize: '14px', color: 'var(--terminal-text)', fontWeight: 'bold' }}>{(powerOutput * 0.35).toFixed(0)} MW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--terminal-label)' }}>Netz Ost:</span>
            <span style={{ fontSize: '14px', color: 'var(--terminal-text)', fontWeight: 'bold' }}>{(powerOutput * 0.25).toFixed(0)} MW</span>
          </div>
        </div>
      </div>

      {/* Protection Systems */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Schutzsysteme</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
          <LEDIndicator label="ÜStrom" color="off" />
          <LEDIndicator label="Kurzschl" color="off" />
          <LEDIndicator label="Erdschl" color="off" />
          <LEDIndicator label="ÜSpann" color="off" />
          <LEDIndicator label="USpann" color="off" />
          <LEDIndicator label="FreqAbw" color="off" />
          <LEDIndicator label="RückLst" color="off" />
          <LEDIndicator label="DiffStr" color="off" />
          <LEDIndicator label="Distanz" color="off" />
        </div>
      </div>

      {/* Busbar Status */}
      <div className="terminal-panel" style={{ gridColumn: 'span 4' }}>
        <div className="terminal-panel-header">Sammelschienen Status</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 8 }}>
          <LEDIndicator label="Bus A1" color="green" />
          <LEDIndicator label="Bus A2" color="green" />
          <LEDIndicator label="Bus B1" color="green" />
          <LEDIndicator label="Bus B2" color="green" />
          <LEDIndicator label="Kupplung" color="green" />
          <LEDIndicator label="Reserve" color="yellow" />
        </div>
      </div>
    </div>
  );

  const renderEmergencyControls = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px' }}>
      {/* Emergency Shutdown Panel */}
      <div className="terminal-panel" style={{ gridColumn: 'span 3', backgroundColor: 'rgba(139, 0, 0, 0.1)' }}>
        <div className="terminal-panel-header" style={{ color: '#f44336', borderColor: '#f44336' }}>
          NOTFALLSYSTEME - KRITISCHE STEUERUNG
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 20, padding: '16px' }}>
          <PushButton
            label="REAKTOR SCHNELLABSCHALTUNG"
            variant="danger"
            requireConfirm={true}
            confirmText="NOTABSCHALTUNG INITIIEREN?\n\nDies wird den Reaktor sofort herunterfahren!"
            onClick={handleEmergencyShutdown}
          />
          <PushButton
            label="TURBINE TRIP"
            variant="danger"
            requireConfirm={false}
            onClick={() => {}}
          />
          <PushButton
            label="GENERATOR TRIP"
            variant="danger"
            requireConfirm={false}
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Backup Power Systems */}
      <div className="terminal-panel">
        <div className="terminal-panel-header">Notstromversorgung</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Diesel Gen 1"
            active={backupGenerator}
            onChange={setBackupGenerator}
          />
          <ToggleSwitch
            label="Diesel Gen 2"
            active={false}
            onChange={() => {}}
          />
          <ToggleSwitch
            label="Batterie Bank"
            active={true}
            onChange={() => {}}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <LEDIndicator label="USV Aktiv" color="green" />
          <DigitalDisplay label="Batterie" value="98%" color="green" />
        </div>
      </div>

      {/* Fire Suppression */}
      <div className="terminal-panel">
        <div className="terminal-panel-header">Brandschutzsysteme</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <ToggleSwitch
            label="Löschanlage scharf"
            active={fireSuppressionArmed}
            onChange={setFireSuppressionArmed}
          />
          <ToggleSwitch
            label="CO2 System"
            active={true}
            onChange={() => {}}
          />
          <ToggleSwitch
            label="Sprinkler"
            active={true}
            onChange={() => {}}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
          <LEDIndicator label="Zone 1" color="green" />
          <LEDIndicator label="Zone 2" color="green" />
          <LEDIndicator label="Zone 3" color="green" />
          <LEDIndicator label="Zone 4" color="green" />
        </div>
      </div>

      {/* Containment */}
      <div className="terminal-panel">
        <div className="terminal-panel-header">Containment</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <LEDIndicator label="Integrity OK" color="green" />
          <LEDIndicator label="Isolation" color={emergencyMode ? 'red' : 'green'} />
          <LEDIndicator label="Pressure OK" color="green" />
          <DigitalDisplay label="Druck" value="1.02 bar" color="green" />
          <DigitalDisplay label="Temp" value="28°C" color="green" />
        </div>
      </div>

      {/* Cooling Systems */}
      <div className="terminal-panel" style={{ gridColumn: 'span 2' }}>
        <div className="terminal-panel-header">Notkühlung (ECCS)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--terminal-label)', marginBottom: 8 }}>High Pressure</div>
            <LEDIndicator label="Pumpe 1" color="green" />
            <LEDIndicator label="Pumpe 2" color="green" />
            <ToggleSwitch label="Auto" active={true} onChange={() => {}} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--terminal-label)', marginBottom: 8 }}>Low Pressure</div>
            <LEDIndicator label="Pumpe 1" color="green" />
            <LEDIndicator label="Pumpe 2" color="green" />
            <ToggleSwitch label="Auto" active={true} onChange={() => {}} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--terminal-label)', marginBottom: 8 }}>Residual Heat</div>
            <LEDIndicator label="Pumpe 1" color="green" />
            <LEDIndicator label="Pumpe 2" color="green" />
            <ToggleSwitch label="Auto" active={true} onChange={() => {}} />
          </div>
        </div>
      </div>

      {/* Radiation Monitoring */}
      <div className="terminal-panel">
        <div className="terminal-panel-header">Strahlungsüberwachung</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 }}>
          <DigitalDisplay label="Raum 1" value="0.5 μSv/h" color="green" />
          <DigitalDisplay label="Raum 2" value="0.6 μSv/h" color="green" />
          <DigitalDisplay label="Raum 3" value="0.4 μSv/h" color="green" />
          <DigitalDisplay label="Außen" value="0.1 μSv/h" color="green" />
        </div>
        <div style={{ marginTop: 12 }}>
          <LEDIndicator label="Monitor OK" color="green" />
          <LEDIndicator label="Alarm" color="off" />
        </div>
      </div>

      {/* Ventilation */}
      <div className="terminal-panel" style={{ gridColumn: 'span 3' }}>
        <div className="terminal-panel-header">Lüftung & Filtration</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 12 }}>
          <div>
            <LEDIndicator label="Lüftung 1" color="green" />
            <DigitalDisplay label="Flow" value="100%" color="green" />
          </div>
          <div>
            <LEDIndicator label="Lüftung 2" color="green" />
            <DigitalDisplay label="Flow" value="100%" color="green" />
          </div>
          <div>
            <LEDIndicator label="HEPA 1" color="green" />
            <DigitalDisplay label="ΔP" value="85 Pa" color="green" />
          </div>
          <div>
            <LEDIndicator label="HEPA 2" color="green" />
            <DigitalDisplay label="ΔP" value="82 Pa" color="green" />
          </div>
          <div>
            <LEDIndicator label="Iodfilter" color="green" />
            <DigitalDisplay label="Sat." value="45%" color="green" />
          </div>
          <div>
            <LEDIndicator label="Kamin" color="green" />
            <DigitalDisplay label="Draft" value="OK" color="green" />
          </div>
        </div>
      </div>

      {/* Emergency Status */}
      <div className="terminal-panel" style={{ gridColumn: 'span 3', backgroundColor: emergencyMode ? 'rgba(244, 67, 54, 0.1)' : 'transparent' }}>
        <div className="terminal-panel-header">Notfallstatus</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginTop: 12 }}>
          <LEDIndicator label="Reaktor" color={emergencyMode ? 'red' : 'green'} />
          <LEDIndicator label="Turbine" color="green" />
          <LEDIndicator label="Generator" color="green" />
          <LEDIndicator label="Kühlung" color="green" />
          <LEDIndicator label="Strom" color="green" />
          <LEDIndicator label="Contain." color="green" />
          <LEDIndicator label="Lüftung" color="green" />
          <LEDIndicator label="Schutz" color="green" />
        </div>
      </div>
    </div>
  );

  return (
    <BaseTerminal
      title={`Kraftwerk: ${location.name}`}
      status={location.status}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Save/Revert Buttons Bar */}
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #CCCCCC',
          backgroundColor: '#F0F0F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <SaveRevertButtons
            hasChanges={hasUnsavedChanges}
            onSave={saveCurrentState}
            onRevert={revertToSavedState}
          />
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'reactor' && renderReactorControls()}
          {activeTab === 'turbine' && renderTurbineControls()}
          {activeTab === 'grid' && renderGridControls()}
          {activeTab === 'emergency' && renderEmergencyControls()}
        </div>

        {/* Audit Log at Bottom */}
        <div style={{ borderTop: '1px solid #CCCCCC', padding: '8px' }}>
          <AuditLog entries={auditLog} maxEntries={8} />
        </div>
      </div>
    </BaseTerminal>
  );
}

PowerPlantTerminal.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

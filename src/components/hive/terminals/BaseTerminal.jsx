import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './styles/Terminal.css';
import './styles/Animations.css';

export default function BaseTerminal({ 
  title = 'TERMINAL', 
  status = 'active',
  tabs = [], 
  activeTab, 
  onTabChange, 
  onClose,
  children
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPowerOn, setIsPowerOn] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Power-on animation
  useEffect(() => {
    setTimeout(() => setIsPowerOn(true), 50);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatusClass = () => {
    switch (status) {
      case 'active': return 'terminal-status-active';
      case 'critical': return 'terminal-status-critical';
      case 'offline': return 'terminal-status-offline';
      default: return 'terminal-status-active';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'critical': return 'CRITICAL';
      case 'offline': return 'OFFLINE';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className={`terminal-modal-content ${isPowerOn ? 'terminal-power-on' : ''}`}>
      {/* Windows-style Header */}
      <div className="terminal-header">
        <h1 className="terminal-title">
          Facility Control Panel - {title}
          <span className={`terminal-status-badge ${getStatusClass()}`}>
            {getStatusLabel()}
          </span>
        </h1>
        <div className="terminal-timestamp">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Menu Bar */}
      <div style={{ 
        display: 'flex', 
        gap: 0, 
        padding: '2px 8px', 
        background: '#F0F0F0',
        borderBottom: '1px solid #CCCCCC',
        fontSize: '11px'
      }}>
        <button style={{
          padding: '4px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'Arial, Tahoma, sans-serif',
          fontSize: '11px'
        }}>File</button>
        <button style={{
          padding: '4px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'Arial, Tahoma, sans-serif',
          fontSize: '11px'
        }}>Edit</button>
        <button style={{
          padding: '4px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'Arial, Tahoma, sans-serif',
          fontSize: '11px'
        }}>Controls</button>
        <button style={{
          padding: '4px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'Arial, Tahoma, sans-serif',
          fontSize: '11px'
        }}>Reports</button>
        <button style={{
          padding: '4px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'Arial, Tahoma, sans-serif',
          fontSize: '11px'
        }}>Help</button>
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="terminal-tabs">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`terminal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}

      {/* Screen */}
      <div className="terminal-screen">
        <div className="terminal-screen-inner">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="terminal-footer">
        <div className="terminal-system-info">
          <span>Infrastructure Monitoring System v2.1</span>
          <span>|</span>
          <span>Status: OK</span>
          <span>|</span>
          <span>Last Update: {new Date().toLocaleTimeString()}</span>
        </div>
        <button className="terminal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

BaseTerminal.propTypes = {
  title: PropTypes.string,
  status: PropTypes.oneOf(['active', 'critical', 'offline']),
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node
};

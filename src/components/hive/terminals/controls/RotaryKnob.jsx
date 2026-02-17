import { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function RotaryKnob({ 
  label = '', 
  value = 0, 
  min = 0, 
  max = 100,
  step = 1,
  unit = '',
  onChange,
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  const rotation = ((value - min) / (max - min)) * 270 - 135; // -135 to +135 degrees

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;
    
    const deltaY = startY - e.clientY; // Inverted: up increases value
    const sensitivity = 2;
    const deltaValue = (deltaY / sensitivity) * ((max - min) / 100);
    let newValue = startValue + deltaValue;
    
    // Apply step
    newValue = Math.round(newValue / step) * step;
    
    // Clamp to min/max
    newValue = Math.max(min, Math.min(max, newValue));
    
    if (onChange && newValue !== value) {
      onChange(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global listeners for mouse move/up
  useState(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="rotary-knob">
      <div className="rotary-knob-label">{label}</div>
      <div 
        className="rotary-knob-control"
        onMouseDown={handleMouseDown}
        style={{ 
          transform: `rotate(${rotation}deg)`,
          cursor: disabled ? 'not-allowed' : 'grab',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <div className="rotary-knob-indicator" />
      </div>
      <div className="rotary-knob-value">
        {value.toFixed(0)} {unit}
      </div>
    </div>
  );
}

RotaryKnob.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  unit: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

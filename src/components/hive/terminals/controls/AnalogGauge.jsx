import { useMemo } from 'react';
import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function AnalogGauge({ 
  value, 
  min = 0, 
  max = 100, 
  unit = '', 
  label = '', 
  zones = [],
  size = 180 
}) {
  // Calculate needle rotation (-90deg to +90deg for a 180-degree gauge)
  const rotation = useMemo(() => {
    const percentage = (value - min) / (max - min);
    return -90 + (percentage * 180);
  }, [value, min, max]);

  // Determine current zone color
  const zoneColor = useMemo(() => {
    for (const zone of zones) {
      if (value <= zone.max) {
        return zone.color;
      }
    }
    return '#33ff33'; // default green
  }, [value, zones]);

  // Generate gauge markings
  const markings = useMemo(() => {
    const marks = [];
    const steps = 9; // 0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100
    for (let i = 0; i <= steps; i++) {
      const angle = -90 + (i * 180 / steps);
      const markValue = min + (i * (max - min) / steps);
      marks.push({ angle, value: Math.round(markValue) });
    }
    return marks;
  }, [min, max]);

  return (
    <div className="analog-gauge">
      <div className="gauge-container" style={{ width: size, height: size }}>
        <svg className="gauge-background" viewBox="0 0 200 200">
          {/* Outer circle */}
          <circle cx="100" cy="100" r="90" fill="#1a2a3a" stroke="#2a4a5a" strokeWidth="2"/>
          
          {/* Zone arcs */}
          {zones.map((zone, idx) => {
            const prevMax = idx === 0 ? min : zones[idx - 1].max;
            const startAngle = -90 + ((prevMax - min) / (max - min)) * 180;
            const endAngle = -90 + ((zone.max - min) / (max - min)) * 180;
            
            return (
              <path
                key={idx}
                d={describeArc(100, 100, 75, startAngle, endAngle)}
                fill="none"
                stroke={zone.color}
                strokeWidth="8"
                opacity="0.3"
              />
            );
          })}
          
          {/* Tick marks and labels */}
          {markings.map((mark, idx) => {
            const isLarge = idx % 2 === 0;
            const innerRadius = isLarge ? 65 : 70;
            const outerRadius = 75;
            const angle = mark.angle * (Math.PI / 180);
            
            const x1 = 100 + innerRadius * Math.cos(angle);
            const y1 = 100 + innerRadius * Math.sin(angle);
            const x2 = 100 + outerRadius * Math.cos(angle);
            const y2 = 100 + outerRadius * Math.sin(angle);
            
            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#66ff66"
                  strokeWidth={isLarge ? 2 : 1}
                />
                {isLarge && (
                  <text
                    x={100 + 55 * Math.cos(angle)}
                    y={100 + 55 * Math.sin(angle)}
                    fill="#66ff66"
                    fontSize="10"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {mark.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Needle */}
        <div 
          className="gauge-needle" 
          style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            background: zoneColor,
            boxShadow: `0 0 10px ${zoneColor}`
          }}
        />
        
        {/* Center dot */}
        <div className="gauge-center-dot" />
      </div>
      
      <div className="gauge-label">{label}</div>
      <div className="gauge-value" style={{ color: zoneColor }}>
        {value.toFixed(1)} {unit}
      </div>
    </div>
  );
}

// Helper function to describe SVG arc
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

AnalogGauge.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  unit: PropTypes.string,
  label: PropTypes.string,
  zones: PropTypes.arrayOf(PropTypes.shape({
    max: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired
  })),
  size: PropTypes.number
};

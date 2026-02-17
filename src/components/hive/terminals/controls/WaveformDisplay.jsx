import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function WaveformDisplay({ 
  data = [], // Array of values
  color = '#33ff33',
  label = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    if (data.length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const stepX = width / (data.length - 1 || 1);
      const maxValue = Math.max(...data);
      const minValue = Math.min(...data);
      const range = maxValue - minValue || 1;

      data.forEach((value, index) => {
        const x = index * stepX;
        const y = height - ((value - minValue) / range) * (height - 20) - 10;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.stroke();
    }
  }, [data, color]);

  return (
    <div className="waveform-display">
      <div className="waveform-grid" />
      <canvas ref={canvasRef} className="waveform-canvas" />
      {label && (
        <div style={{ 
          position: 'absolute', 
          top: 8, 
          left: 8, 
          fontSize: 11, 
          color: '#66ff66',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

WaveformDisplay.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.string,
  label: PropTypes.string
};

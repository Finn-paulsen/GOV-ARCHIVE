import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function LEDIndicator({ 
  label = '', 
  color = 'green', // green, red, yellow, blue, off
  pulse = false 
}) {
  return (
    <div className="led-indicator">
      <div className={`led-light ${color} ${pulse ? 'pulse' : ''}`} />
      <div className="led-label">{label}</div>
    </div>
  );
}

LEDIndicator.propTypes = {
  label: PropTypes.string,
  color: PropTypes.oneOf(['green', 'red', 'yellow', 'blue', 'off']),
  pulse: PropTypes.bool
};

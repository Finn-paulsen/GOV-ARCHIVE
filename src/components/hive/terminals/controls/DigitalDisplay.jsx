import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function DigitalDisplay({ 
  label = '', 
  value = '0', 
  color = 'red' // red, green, blue
}) {
  return (
    <div className="digital-display">
      <div className="digital-display-label">{label}</div>
      <div className={`digital-display-screen ${color}`}>
        {value}
      </div>
    </div>
  );
}

DigitalDisplay.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.oneOf(['red', 'green', 'blue'])
};

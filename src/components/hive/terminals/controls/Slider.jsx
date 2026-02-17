import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function Slider({ 
  label = '', 
  value = 0, 
  min = 0, 
  max = 100, 
  step = 1,
  unit = '',
  onChange,
  disabled = false
}) {
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(parseFloat(e.target.value));
    }
  };

  return (
    <div className="slider-control">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-value">{value.toFixed(1)} {unit}</span>
      </div>
      <input
        type="range"
        className="slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

Slider.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  unit: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function ToggleSwitch({ label = '', active = false, onChange, disabled = false }) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!active);
    }
  };

  return (
    <div className="toggle-switch">
      <div className="toggle-switch-label">{label}</div>
      <div 
        className={`toggle-switch-control ${active ? 'active' : ''}`}
        onClick={handleClick}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        <div className="toggle-switch-handle" />
      </div>
    </div>
  );
}

ToggleSwitch.propTypes = {
  label: PropTypes.string,
  active: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

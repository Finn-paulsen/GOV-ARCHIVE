import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function PushButton({ 
  label = '', 
  onClick, 
  variant = 'danger', // danger, warning, success
  disabled = false,
  requireConfirm = false,
  confirmText = 'Sind Sie sicher?'
}) {
  const handleClick = () => {
    if (disabled) return;
    
    if (requireConfirm) {
      if (window.confirm(confirmText)) {
        onClick?.();
      }
    } else {
      onClick?.();
    }
  };

  return (
    <div className="push-button">
      <div className="push-button-label">{label}</div>
      <div 
        className={`push-button-control ${variant}`}
        onClick={handleClick}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        {variant === 'danger' && 'STOP'}
        {variant === 'warning' && 'WARN'}
        {variant === 'success' && 'START'}
      </div>
    </div>
  );
}

PushButton.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['danger', 'warning', 'success']),
  disabled: PropTypes.bool,
  requireConfirm: PropTypes.bool,
  confirmText: PropTypes.string
};

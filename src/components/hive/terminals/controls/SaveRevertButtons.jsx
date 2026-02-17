import { useState } from 'react';
import PropTypes from 'prop-types';

export default function SaveRevertButtons({ 
  hasChanges = false, 
  onSave, 
  onRevert,
  disabled = false 
}) {
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);

  const handleSave = () => {
    if (showSaveConfirm) {
      onSave?.();
      setShowSaveConfirm(false);
    } else {
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 3000);
    }
  };

  const handleRevert = () => {
    if (showRevertConfirm) {
      onRevert?.();
      setShowRevertConfirm(false);
    } else {
      setShowRevertConfirm(true);
      setTimeout(() => setShowRevertConfirm(false), 3000);
    }
  };

  const buttonStyle = {
    padding: '6px 16px',
    fontSize: '11px',
    fontFamily: 'Arial, Tahoma, sans-serif',
    border: '1px solid #CCCCCC',
    borderRadius: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: '#F0F0F0',
    color: '#000000',
    boxShadow: '1px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 0 rgba(0, 0, 0, 0.1)',
    transition: 'all 0.1s'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: hasChanges ? '#FFFFFF' : '#F0F0F0',
    borderColor: hasChanges ? '#003366' : '#CCCCCC'
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {hasChanges && (
        <span style={{
          fontSize: '11px',
          color: '#CC6600',
          fontWeight: 'bold',
          fontFamily: 'Arial, Tahoma, sans-serif'
        }}>
          ⚠ UNSAVED CHANGES
        </span>
      )}
      <button
        onClick={handleSave}
        disabled={!hasChanges || disabled}
        style={{
          ...activeButtonStyle,
          opacity: (!hasChanges || disabled) ? 0.5 : 1
        }}
        title={showSaveConfirm ? 'Click again to confirm' : 'Save changes'}
      >
        {showSaveConfirm ? 'Confirm Save?' : 'Apply'}
      </button>
      <button
        onClick={handleRevert}
        disabled={!hasChanges || disabled}
        style={{
          ...buttonStyle,
          opacity: (!hasChanges || disabled) ? 0.5 : 1
        }}
        title={showRevertConfirm ? 'Click again to confirm' : 'Revert changes'}
      >
        {showRevertConfirm ? 'Confirm Revert?' : 'Revert'}
      </button>
    </div>
  );
}

SaveRevertButtons.propTypes = {
  hasChanges: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onRevert: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

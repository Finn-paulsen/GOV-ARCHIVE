import PropTypes from 'prop-types';

export default function AuditLog({ entries = [], maxEntries = 10 }) {
  const displayEntries = entries.slice(-maxEntries).reverse();

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #CCCCCC',
      borderRadius: 0,
      padding: '8px',
      maxHeight: '150px',
      overflowY: 'auto',
      fontFamily: 'Courier New, monospace',
      fontSize: '10px'
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 'bold',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '1px solid #CCCCCC',
        fontFamily: 'Arial, Tahoma, sans-serif',
        color: '#003366'
      }}>
        Activity Log
      </div>
      {displayEntries.length === 0 ? (
        <div style={{ color: '#666666', fontStyle: 'italic', padding: '8px' }}>
          No recent activity
        </div>
      ) : (
        displayEntries.map((entry, index) => (
          <div
            key={index}
            style={{
              padding: '4px 0',
              borderBottom: index < displayEntries.length - 1 ? '1px solid #F0F0F0' : 'none',
              color: entry.type === 'error' ? '#CC0000' : entry.type === 'warning' ? '#CC6600' : '#000000'
            }}
          >
            <span style={{ color: '#666666' }}>{entry.timestamp}</span> - {entry.message}
            {entry.user && <span style={{ color: '#003366' }}> [{entry.user}]</span>}
          </div>
        ))
      )}
    </div>
  );
}

AuditLog.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      user: PropTypes.string,
      type: PropTypes.oneOf(['info', 'warning', 'error'])
    })
  ),
  maxEntries: PropTypes.number
};

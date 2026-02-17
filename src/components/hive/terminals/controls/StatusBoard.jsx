import PropTypes from 'prop-types';
import '../styles/Controls.css';

export default function StatusBoard({ 
  title = '', 
  items = [], // Array of { id, label, status: 'online'|'warning'|'error'|'offline' }
  columns = 8
}) {
  return (
    <div className="status-board">
      <div className="status-board-header">{title}</div>
      <div 
        className="status-board-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {items.map((item) => (
          <div 
            key={item.id}
            className={`status-cell ${item.status}`}
            title={item.label || item.id}
          >
            {item.label || item.id}
          </div>
        ))}
      </div>
    </div>
  );
}

StatusBoard.propTypes = {
  title: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string,
    status: PropTypes.oneOf(['online', 'warning', 'error', 'offline']).isRequired
  })),
  columns: PropTypes.number
};

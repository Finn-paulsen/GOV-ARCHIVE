import './ModuleTabs.css';

export function ModuleTabs({ active, onChange }) {
  const modules = [
    { key: 'control', label: 'Schaltzentrale' },
    { key: 'terminal', label: 'Terminal' },
    { key: 'exploit', label: 'Exploit Lab' },
  ];
  return (
    <div className="module-tabs">
      {modules.map(m => (
        <button
          key={m.key}
          className={active === m.key ? 'active' : ''}
          onClick={() => onChange(m.key)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

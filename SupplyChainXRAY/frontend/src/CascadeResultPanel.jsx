export default function CascadeResultPanel({ result }) {
  if (!result) return null;
  const { failed_supplier, disruption_percent, impacted_suppliers, estimated_shortage } = result;

  const severity = disruption_percent > 40 ? 'critical' : disruption_percent > 15 ? 'high' : 'moderate';
  const sevColor = severity === 'critical' ? '#ff3355' : severity === 'high' ? '#ffaa00' : '#00d4ff';

  return (
    <div className="card fade-in critical-pulse"
      style={{ borderColor: `${sevColor}33`, background: `rgba(8,17,31,0.8)` }}>

      {/* Header */}
      <div className="card-title" style={{ color: sevColor }}>
        <span className="card-title-icon">💥</span>
        CASCADE FAILURE SIMULATION
        <span style={{ marginLeft: 'auto' }}>
          <span className="badge" style={{
            background: `${sevColor}15`,
            color: sevColor,
            border: `1px solid ${sevColor}40`,
          }}>
            {severity.toUpperCase()}
          </span>
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: 22 }}>
        {[
          {
            label: 'Network Disruption',
            value: `${disruption_percent}%`,
            color: sevColor,
            icon: '📡',
            sub: 'of supply chain affected'
          },
          {
            label: 'Impacted Suppliers',
            value: (impacted_suppliers || []).length,
            color: '#ffaa00',
            icon: '🏭',
            sub: 'downstream nodes'
          },
          {
            label: 'Shortage Estimate',
            value: `${(estimated_shortage / 1000).toFixed(1)}K`,
            color: '#a78bfa',
            icon: '📦',
            sub: 'units affected'
          },
        ].map(s => (
          <div key={s.label} style={{
            background: `rgba(${s.color === '#ff3355' ? '255,51,85' : s.color === '#ffaa00' ? '255,170,0' : '124,58,237'},0.05)`,
            border: `1px solid ${s.color}22`,
            borderRadius: 12, padding: '16px',
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{s.icon}</div>
            <div style={{
              fontSize: '2rem', fontWeight: 900, color: s.color,
              fontFamily: 'var(--font-mono)',
              textShadow: `0 0 20px ${s.color}`,
              letterSpacing: '-0.03em'
            }}>{s.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--t-muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Disruption fill bar */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--t-muted)' }}>Disruption Severity Index</span>
          <span style={{ color: sevColor, fontWeight: 700 }}>{disruption_percent}%</span>
        </div>
        <div className="progress-track progress-track-thick">
          <div className="progress-fill" style={{
            width: `${Math.min(disruption_percent, 100)}%`,
            background: `linear-gradient(90deg, ${sevColor}66, ${sevColor})`,
            boxShadow: `0 0 16px ${sevColor}66`
          }} />
        </div>
      </div>

      {/* Alert */}
      <div className="alert alert-danger" style={{ borderColor: `${sevColor}44`, color: sevColor, marginBottom: 16 }}>
        <span style={{ fontSize: '1.1rem' }}>⚠️</span>
        <div>
          Failure of <strong style={{ color: '#fff' }}>{failed_supplier}</strong> cascades downstream,
          affecting <strong>{(impacted_suppliers || []).length}</strong> supplier nodes and creating
          an estimated <strong>{Math.round(estimated_shortage).toLocaleString()}</strong> unit supply shortage.
        </div>
      </div>

      {/* Affected nodes */}
      {(impacted_suppliers || []).length > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Affected Nodes ({(impacted_suppliers || []).length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {(impacted_suppliers || []).slice(0, 24).map(s => (
              <span key={s} style={{
                padding: '3px 9px',
                background: 'rgba(255,51,85,0.08)',
                border: '1px solid rgba(255,51,85,0.2)',
                borderRadius: 6,
                fontSize: '0.68rem',
                color: '#ff3355',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>{s}</span>
            ))}
            {(impacted_suppliers || []).length > 24 && (
              <span style={{
                padding: '3px 9px',
                background: 'rgba(107,140,170,0.08)',
                border: '1px solid rgba(107,140,170,0.2)',
                borderRadius: 6,
                fontSize: '0.68rem',
                color: 'var(--t-secondary)',
                fontFamily: 'var(--font-mono)'
              }}>+{(impacted_suppliers || []).length - 24} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

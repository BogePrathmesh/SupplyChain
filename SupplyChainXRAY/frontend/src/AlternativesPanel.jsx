const RANK_COLORS = [
  'linear-gradient(135deg,#00d4ff,#0066ff)',
  'linear-gradient(135deg,#00ff88,#00b35f)',
  'linear-gradient(135deg,#a78bfa,#7c3aed)',
  'linear-gradient(135deg,#ffaa00,#ff6600)',
  'linear-gradient(135deg,#ff0080,#ff3355)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
];

export default function AlternativesPanel({ alternatives, loading }) {
  if (loading) return (
    <div className="card">
      <div className="loading-center">
        <div className="spinner" />
        <span>Scanning alternative suppliers…</span>
      </div>
    </div>
  );
  if (!alternatives) return null;

  const list = alternatives.alternatives || [];

  return (
    <div className="card fade-in">
      <div className="card-title">
        <span className="card-title-icon">🔄</span>
        Alternative Suppliers
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          FOR: <span style={{ color: 'var(--cyan)' }}>{alternatives.failed_supplier}</span>
        </span>
      </div>

      {list.length === 0 ? (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <span>No direct alternatives found for this supplier type and tier.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.slice(0, 6).map((alt, i) => (
            <div key={alt.supplier_id} className="alt-card">
              {/* Rank badge */}
              <div className="alt-rank" style={{ background: RANK_COLORS[i % RANK_COLORS.length] }}>
                #{i + 1}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>{alt.name}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', color: 'var(--t-muted)', fontFamily: 'var(--font-mono)' }}>
                  <span>🌍 {alt.country}</span>
                  <span>·</span>
                  <span>⚡ {alt.capacity?.toLocaleString()} units</span>
                </div>
              </div>

              {/* Tags + Score */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {alt.geographic_diversification && (
                    <span className="badge badge-info">GEO-DIV</span>
                  )}
                  <span className={`badge ${alt.risk_score > 60 ? 'badge-low' : alt.risk_score > 40 ? 'badge-medium' : 'badge-high'}`}>
                    {alt.risk_score > 60 ? 'LOW RISK' : alt.risk_score > 40 ? 'MEDIUM' : 'HIGH RISK'}
                  </span>
                </div>
                <div style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: alt.risk_score > 60 ? 'var(--green)' : alt.risk_score > 40 ? 'var(--amber)' : 'var(--red)',
                  fontFamily: 'var(--font-mono)',
                  textShadow: `0 0 14px currentColor`
                }}>
                  {alt.risk_score?.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

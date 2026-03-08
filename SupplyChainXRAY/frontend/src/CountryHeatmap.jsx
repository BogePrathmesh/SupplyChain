const COUNTRIES = {
  USA:     { flag: '🇺🇸', color: '#3b8bff', risk: 80 },
  India:   { flag: '🇮🇳', color: '#ff7f50', risk: 62 },
  China:   { flag: '🇨🇳', color: '#ff3355', risk: 40 },
  Germany: { flag: '🇩🇪', color: '#a78bfa', risk: 88 },
  Brazil:  { flag: '🇧🇷', color: '#00ff88', risk: 50 },
};

export default function CountryHeatmap({ nodes }) {
  if (!nodes?.length) return null;

  const counts = {};
  nodes.forEach(n => {
    counts[n.country] = (counts[n.country] || 0) + 1;
  });
  const total = nodes.length;

  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">🌍</span>
        Country Risk Heatmap
      </div>

      {/* Heatmap Cells */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Object.keys(counts).length}, 1fr)`,
        gap: 8,
        marginBottom: 20,
      }}>
        {Object.entries(counts).map(([country, count]) => {
          const c = COUNTRIES[country] || { flag: '🌐', color: '#6b8caa', risk: 50 };
          const concentration = count / total;
          const riskColor = c.risk > 70 ? 'var(--green)' : c.risk > 45 ? 'var(--amber)' : 'var(--red)';

          return (
            <div key={country} style={{
              background: `${c.color}12`,
              border: `1px solid ${c.color}30`,
              borderRadius: 12,
              padding: '14px 8px',
              textAlign: 'center',
              cursor: 'default',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${c.color}22, 0 0 0 1px ${c.color}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Concentration fill (bottom bg) */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${concentration * 100}%`,
                background: `${c.color}08`,
                borderRadius: '0 0 12px 12px',
                transition: 'height 0.5s ease',
              }} />

              <div style={{ fontSize: '1.4rem', marginBottom: 5, position: 'relative' }}>{c.flag}</div>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: 2, position: 'relative' }}>{country}</div>
              <div style={{
                fontSize: '0.68rem', color: 'var(--t-muted)',
                fontFamily: 'var(--font-mono)', marginBottom: 6, position: 'relative'
              }}>{count} suppliers</div>
              <div style={{
                fontSize: '0.82rem', fontWeight: 800, color: riskColor,
                fontFamily: 'var(--font-mono)',
                textShadow: `0 0 12px ${riskColor}`,
                position: 'relative'
              }}>{c.risk}</div>
            </div>
          );
        })}
      </div>

      {/* Concentration Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Supplier Concentration
        </div>
        {Object.entries(counts).map(([country, count]) => {
          const c = COUNTRIES[country] || { flag: '🌐', color: '#6b8caa' };
          const pct = (count / total) * 100;
          return (
            <div key={country}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 5 }}>
                <span style={{ color: 'var(--t-secondary)' }}>{c.flag} {country}</span>
                <span style={{ color: c.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${c.color}88, ${c.color})`,
                  boxShadow: `0 0 8px ${c.color}44`
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

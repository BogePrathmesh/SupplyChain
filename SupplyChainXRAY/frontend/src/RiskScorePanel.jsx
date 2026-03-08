import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

const RISK_CONFIG = {
  'Low Risk':    { color: '#00ff88', glow: 'var(--glow-green)', badge: 'badge-low' },
  'Medium Risk': { color: '#ffaa00', glow: 'var(--glow-amber)', badge: 'badge-medium' },
  'High Risk':   { color: '#ff3355', glow: 'var(--glow-red)',   badge: 'badge-high' },
};

export default function RiskScorePanel({ risk, onSimulate, loading }) {
  if (!risk) return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(0,212,255,0.06)',
        border: '1px solid rgba(0,212,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem'
      }}>🎯</div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--t-primary)', fontWeight: 600, marginBottom: 4 }}>No Supplier Selected</div>
        <div style={{ color: 'var(--t-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
          Click a node on the graph or choose from the dropdown
        </div>
      </div>
    </div>
  );

  const cfg = RISK_CONFIG[risk.level] || RISK_CONFIG['High Risk'];
  const score = risk.score;
  const C = 2 * Math.PI * 48;

  const radarData = Object.entries(risk.metrics || {}).map(([k, v]) => ({
    subject: k.replace(/([A-Z])/g, ' $1').trim().split(' ').slice(0, 2).join('\n'),
    value: Math.round(v),
  }));

  return (
    <div className="card fade-in">
      {/* Header */}
      <div className="card-title">
        <span className="card-title-icon">📊</span>
        Resilience Score
        <span style={{ marginLeft: 'auto' }}>
          <span className={`badge ${cfg.badge}`}>{risk.level}</span>
        </span>
      </div>

      {/* Score Ring + Supplier ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 22 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" className="score-ring">
            {/* Track */}
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            {/* Progress */}
            <circle cx="60" cy="60" r="48" fill="none"
              stroke={cfg.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (score / 100) * C}
              transform="rotate(-90 60 60)"
              style={{
                transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)',
                filter: `drop-shadow(0 0 8px ${cfg.color})`
              }}
            />
            {/* Inner glow ring */}
            <circle cx="60" cy="60" r="38" fill="none"
              stroke={cfg.color} strokeWidth="0.5" strokeOpacity="0.2" />
            {/* Score text */}
            <text x="60" y="53" textAnchor="middle"
              fill={cfg.color} fontSize="26" fontWeight="900"
              fontFamily="Inter, sans-serif"
              style={{ filter: `drop-shadow(0 0 8px ${cfg.color})` }}>
              {Math.round(score)}
            </text>
            <text x="60" y="70" textAnchor="middle"
              fill="rgba(107,140,170,1)" fontSize="9"
              fontFamily="JetBrains Mono, monospace">
              OUT OF 100
            </text>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--t-muted)',
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>Supplier ID</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: cfg.color,
            marginBottom: 16,
            textShadow: `0 0 16px ${cfg.color}`
          }}>{risk.supplier_id}</div>

          <button className="btn btn-danger" onClick={onSimulate} disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}>
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing…</>
              : '💥  SIMULATE FAILURE'
            }
          </button>
        </div>
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
              <PolarGrid stroke="rgba(0,212,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b8caa', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke={cfg.color} fill={cfg.color} fillOpacity={0.12}
                strokeWidth={1.5} dot={{ r: 3, fill: cfg.color, stroke: cfg.color }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Metric Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(risk.metrics || {}).map(([key, val]) => (
          <div key={key}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.72rem', marginBottom: 5
            }}>
              <span style={{ color: 'var(--t-secondary)', fontFamily: 'var(--font-mono)' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span style={{ fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-mono)' }}>
                {Math.round(val)}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill"
                style={{
                  width: `${val}%`,
                  background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
                  boxShadow: `0 0 8px ${cfg.color}44`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

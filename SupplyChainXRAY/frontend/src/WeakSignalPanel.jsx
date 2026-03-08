import { useState } from 'react';
import { simulateWeakSignals } from './api';

const SIGNALS = [
  { name: 'sentiment',  label: 'News Sentiment', icon: '📰', desc: 'Negative = trade/political/pandemic news', colorPos: '#00ff88', colorNeg: '#ff3355' },
  { name: 'volatility', label: 'Trade Volatility', icon: '📈', desc: 'High = tariffs, export bans, sanctions',    colorPos: '#00ff88', colorNeg: '#ffaa00' },
  { name: 'congestion', label: 'Logistics Congestion', icon: '🚢', desc: 'High = port delays, shipping bottlenecks', colorPos: '#00ff88', colorNeg: '#ff3355' },
];

export default function WeakSignalPanel() {
  const [values, setValues] = useState({ sentiment: 0.5, volatility: 0.3, congestion: 0.2 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await simulateWeakSignals(values);
      setResult(r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <div className="card-title">
        <span className="card-title-icon">📡</span>
        Weak Signal Detection
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--t-muted)', fontFamily: 'var(--font-mono)' }}>
          ISOLATION FOREST ML
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 }}>
        {SIGNALS.map(s => {
          const v = values[s.name];
          const isNeg = v < 0;
          const color = isNeg ? s.colorNeg : s.colorPos;
          const pct = ((v + 1) / 2) * 100;

          return (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', align: 'center', gap: 6 }}>
                  <span>{s.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{s.label}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color,
                  textShadow: `0 0 12px ${color}`,
                  minWidth: 44,
                  textAlign: 'right'
                }}>
                  {v > 0 ? '+' : ''}{v.toFixed(2)}
                </div>
              </div>

              {/* Custom slider track */}
              <div style={{ position: 'relative', height: 6, marginBottom: 5 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'var(--surface-2)',
                  borderRadius: 3,
                }} />
                {/* Center line */}
                <div style={{
                  position: 'absolute', left: '50%', top: '50%',
                  width: 1, height: '140%',
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translate(-50%,-50%)'
                }} />
                {/* Fill from center */}
                <div style={{
                  position: 'absolute',
                  top: 0, bottom: 0,
                  left: v < 0 ? `${pct}%` : '50%',
                  width: `${Math.abs(v) * 50}%`,
                  background: `linear-gradient(${v < 0 ? '270deg' : '90deg'}, ${color}44, ${color})`,
                  borderRadius: 3,
                  boxShadow: `0 0 8px ${color}66`,
                  transition: 'all 0.1s'
                }} />
                <input
                  type="range" min={-1} max={1} step={0.01}
                  value={v}
                  onChange={e => setValues(prev => ({ ...prev, [s.name]: parseFloat(e.target.value) }))}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', margin: 0,
                    opacity: 0, cursor: 'pointer', height: '100%'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--t-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>−1.0 NEGATIVE</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--t-muted)', maxWidth: 180, textAlign: 'center' }}>{s.desc}</span>
                <span>POSITIVE +1.0</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn btn-primary"
        onClick={run}
        disabled={loading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {loading
          ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analyzing Signals…</>
          : '🔍  RUN ANOMALY DETECTION'
        }
      </button>

      {result && (
        <div className={`alert ${result.anomaly ? 'alert-danger' : 'alert-success'}`}
          style={{ marginTop: 16, flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.3rem' }}>{result.anomaly ? '🚨' : '✅'}</span>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>
              {result.anomaly ? 'ANOMALY DETECTED' : 'SYSTEM NORMAL'}
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>{result.message}</div>
          {result.anomaly && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px',
              background: 'rgba(255,51,85,0.08)',
              borderRadius: 8,
              border: '1px solid rgba(255,51,85,0.2)'
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem' }}>
                {result.disruption_probability.toFixed(1)}%
              </span>
              <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>disruption probability</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

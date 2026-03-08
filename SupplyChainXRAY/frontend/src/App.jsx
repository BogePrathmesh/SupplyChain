import { useState, useEffect, useCallback } from 'react';
import './index.css';
import {
  fetchSuppliers, fetchRiskScore, simulateDisruption,
  fetchCriticalNodes, fetchAlternatives
} from './api';
import GraphVisualization from './GraphVisualization';
import RiskScorePanel from './RiskScorePanel';
import CascadeResultPanel from './CascadeResultPanel';
import AlternativesPanel from './AlternativesPanel';
import CountryHeatmap from './CountryHeatmap';
import WeakSignalPanel from './WeakSignalPanel';

const NAV = [
  { id: 'overview',      label: 'Overview',       icon: '◈', section: 'MONITOR' },
  { id: 'graph',         label: 'Supply Graph',   icon: '⬡', section: 'MONITOR' },
  { id: 'risk',          label: 'Risk Analysis',  icon: '◎', section: 'ANALYZE' },
  { id: 'simulate',      label: 'Cascade Sim',    icon: '⚡', section: 'ANALYZE' },
  { id: 'critical',      label: 'Critical Nodes', icon: '⚠', section: 'ANALYZE' },
  { id: 'alternatives',  label: 'Alternatives',   icon: '↻', section: 'RESPOND' },
  { id: 'signals',       label: 'Weak Signals',   icon: '◉', section: 'RESPOND' },
];

export default function App() {
  const [view, setView] = useState('overview');
  const [graphData, setGraphData] = useState(null);
  const [criticalNodes, setCriticalNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [cascadeResult, setCascadeResult] = useState(null);
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState({ graph: true, risk: false, cascade: false, alts: false });
  const [error, setError] = useState(null);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [gRes, cRes] = await Promise.all([fetchSuppliers(), fetchCriticalNodes()]);
        setGraphData(gRes.data);
        setCriticalNodes(cRes.data || []);
        setBackendReady(true);
      } catch {
        setError('Backend offline — run: python main.py');
      } finally {
        setLoading(l => ({ ...l, graph: false }));
      }
    })();
  }, []);

  const handleNodeClick = useCallback(async (node) => {
    setSelectedNode(node.id);
    setCascadeResult(null);
    setAlternatives(null);
    setLoading(l => ({ ...l, risk: true }));
    try {
      const r = await fetchRiskScore(node.id);
      setRiskData(r.data);
    } finally {
      setLoading(l => ({ ...l, risk: false }));
    }
  }, []);

  const handleSimulate = useCallback(async () => {
    if (!selectedNode) return;
    setLoading(l => ({ ...l, cascade: true }));
    try {
      const r = await simulateDisruption(selectedNode);
      setCascadeResult(r.data);
      setView('simulate');
    } finally {
      setLoading(l => ({ ...l, cascade: false }));
    }
  }, [selectedNode]);

  const handleGetAlternatives = useCallback(async (id) => {
    const sid = id || selectedNode;
    if (!sid) return;
    setLoading(l => ({ ...l, alts: true }));
    try {
      const r = await fetchAlternatives(sid);
      setAlternatives(r.data);
      setView('alternatives');
    } finally {
      setLoading(l => ({ ...l, alts: false }));
    }
  }, [selectedNode]);

  const totalSuppliers = graphData?.nodes?.length || 0;
  const tier1Count = graphData?.nodes?.filter(n => n.tier === 1).length || 0;
  const criticalCount = criticalNodes.length;
  const highRiskCount = graphData?.nodes?.filter(n => ['China', 'Brazil'].includes(n.country)).length || 0;
  const currentNav = NAV.find(n => n.id === view);

  /* ── Toolbar for supplier selection ── */
  const SupplierToolbar = () => (
    <div className="toolbar">
      <span className="toolbar-label">TARGET_NODE</span>
      <div style={{ flex: 1, maxWidth: 300 }}>
        <select
          className="select"
          value={selectedNode || ''}
          onChange={e => e.target.value && handleNodeClick({ id: e.target.value })}
        >
          <option value="">— SELECT SUPPLIER —</option>
          {(graphData?.nodes || []).map(n => (
            <option key={n.id} value={n.id}>
              {n.id}  ·  T{n.tier}  ·  {n.country}
            </option>
          ))}
        </select>
      </div>
      {selectedNode && (
        <>
          <button className="btn btn-danger btn-sm" onClick={handleSimulate} disabled={loading.cascade}>
            {loading.cascade ? '⏳' : '💥'} SIMULATE
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => handleGetAlternatives()} disabled={loading.alts}>
            ↻ ALTERNATIVES
          </button>
        </>
      )}
    </div>
  );

  /* ── Sections for sidebar ── */
  const sections = [...new Set(NAV.map(n => n.section))];

  return (
    <div className="app-layout">
      {/* ════ SIDEBAR ════ */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-badge">
            <div className="logo-dot" />
            PHARMA // SUPPLY INTEL
          </div>
          <h1>
            SupplyChain
            <span>X-Ray</span>
          </h1>
          <div className="sidebar-tagline">CASCADE RISK ANALYZER v1.0</div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {NAV.filter(n => n.section === section).map(n => (
                <button
                  key={n.id}
                  className={`nav-item ${view === n.id ? 'active' : ''}`}
                  onClick={() => setView(n.id)}
                >
                  <span className="nav-icon" style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                    {n.icon}
                  </span>
                  {n.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Stats */}
        <div className="sidebar-stats">
          <div className="sidebar-stats-row">
            <span>NODES</span>
            <span className="sidebar-stats-val">{totalSuppliers}</span>
          </div>
          <div className="sidebar-stats-row">
            <span>EDGES</span>
            <span className="sidebar-stats-val">{graphData?.links?.length || 0}</span>
          </div>
          <div className="sidebar-stats-row">
            <span>CRITICAL</span>
            <span className="sidebar-stats-val" style={{ color: 'var(--red)' }}>{criticalCount}</span>
          </div>
          <div className="sidebar-stats-row">
            <span>STATUS</span>
            <span className="sidebar-stats-val" style={{ color: backendReady ? 'var(--green)' : 'var(--red)' }}>
              {backendReady ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-left">
            <div>
              <div className="topbar-title">
                {currentNav?.icon} {currentNav?.label || 'Dashboard'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--t-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                PHARMACEUTICAL_API_CHAIN // MVP_DEMO
              </div>
            </div>
          </div>
          <div className="topbar-right">
            {selectedNode && (
              <div style={{
                padding: '4px 12px',
                background: 'rgba(0,212,255,0.06)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 8,
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--cyan)',
              }}>
                ACTIVE: {selectedNode}
              </div>
            )}
            <div className={`status-pill ${backendReady ? '' : 'offline'}`}>
              <div className="status-dot" />
              {backendReady ? 'API_CONNECTED' : 'BACKEND_OFFLINE'}
            </div>
          </div>
        </div>

        {/* Page */}
        <div className="page">
          {error && (
            <div className="alert alert-warning" style={{ marginBottom: 22 }}>
              <span>⚠️</span>
              <span>{error} — <code style={{ fontFamily: 'var(--font-mono)' }}>cd backend && python main.py</code></span>
            </div>
          )}

          {/* ═══ OVERVIEW ═══ */}
          {view === 'overview' && (
            <div className="fade-in">
              {/* Stats */}
              <div className="grid-4 stagger" style={{ marginBottom: 22 }}>
                {[
                  { label: 'Total Suppliers',      value: totalSuppliers, color: 'var(--cyan)',        icon: '🏭', sub: 'across 5 countries', statColor: '#00d4ff' },
                  { label: 'Tier 1 Pharma',        value: tier1Count,    color: 'var(--amber)',       icon: '💊', sub: 'direct manufacturers', statColor: '#ffaa00' },
                  { label: 'Critical Nodes',        value: criticalCount, color: 'var(--red)',          icon: '⚠️', sub: 'systemic risk nodes', statColor: '#ff3355' },
                  { label: 'High Risk Exposure',    value: highRiskCount, color: '#a78bfa',             icon: '🌍', sub: 'China + Brazil nodes', statColor: '#7c3aed' },
                ].map(s => (
                  <div key={s.label} className="stat-card fade-in" style={{ '--stat-color': s.statColor }}>
                    <div className="stat-label">
                      <span>{s.icon}</span>
                      {s.label}
                    </div>
                    <div className="stat-value" style={{ color: s.color, fontFamily: 'var(--font-mono)' }}>
                      {loading.graph ? '—' : s.value}
                    </div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              {loading.graph ? (
                <div className="loading-center"><div className="spinner" />Loading supply chain data…</div>
              ) : (
                <>
                  <GraphVisualization
                    graphData={graphData}
                    selectedNode={selectedNode}
                    criticalNodes={criticalNodes}
                    onNodeClick={node => { handleNodeClick(node); setView('risk'); }}
                  />

                  <div className="grid-2">
                    <CountryHeatmap nodes={graphData?.nodes || []} />

                    {/* Critical nodes summary */}
                    <div className="card">
                      <div className="card-title">
                        <span className="card-title-icon">⚠</span>
                        Systemic Risk Nodes
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Supplier</th>
                            <th>Centrality</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {criticalNodes.slice(0, 8).map((n, i) => (
                            <tr key={n.supplier_id}>
                              <td style={{ color: 'var(--t-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{i + 1}</td>
                              <td>
                                <span style={{ color: 'var(--red)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                                  {n.supplier_id}
                                </span>
                              </td>
                              <td>
                                <div className="progress-track" style={{ marginBottom: 3 }}>
                                  <div className="progress-fill" style={{
                                    width: `${n.score * 1000}%`,
                                    background: 'linear-gradient(90deg, #ff335544, #ff3355)',
                                    boxShadow: '0 0 8px rgba(255,51,85,0.4)'
                                  }} />
                                </div>
                                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--t-muted)' }}>
                                  {(n.score * 100).toFixed(2)}%
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-ghost btn-sm" onClick={() => {
                                  setSelectedNode(n.supplier_id);
                                  handleNodeClick({ id: n.supplier_id });
                                  setView('risk');
                                }}>ANALYZE</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ GRAPH ═══ */}
          {view === 'graph' && (
            <div className="fade-in">
              <SupplierToolbar />
              {loading.graph ? (
                <div className="loading-center"><div className="spinner" />Rendering graph…</div>
              ) : (
                <GraphVisualization
                  graphData={graphData}
                  selectedNode={selectedNode}
                  criticalNodes={criticalNodes}
                  onNodeClick={handleNodeClick}
                />
              )}
            </div>
          )}

          {/* ═══ RISK ═══ */}
          {view === 'risk' && (
            <div className="fade-in">
              <SupplierToolbar />
              <div className="grid-2">
                <RiskScorePanel risk={riskData} onSimulate={handleSimulate} loading={loading.cascade} />
                <CountryHeatmap nodes={graphData?.nodes || []} />
              </div>
            </div>
          )}

          {/* ═══ CASCADE SIM ═══ */}
          {view === 'simulate' && (
            <div className="fade-in">
              <SupplierToolbar />
              {!cascadeResult && (
                <div className="alert alert-info">
                  <span>ℹ️</span>
                  <span>Select a supplier and click <strong>SIMULATE</strong> to run cascade failure analysis.</span>
                </div>
              )}
              {cascadeResult && (
                <>
                  <CascadeResultPanel result={cascadeResult} />
                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-primary" onClick={() => handleGetAlternatives()}>
                      ↻ FIND ALTERNATIVE SUPPLIERS
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══ CRITICAL NODES ═══ */}
          {view === 'critical' && (
            <div className="fade-in">
              <div className="section-header">
                <div>
                  <div className="section-title">⚠ Systemic Risk Nodes</div>
                  <div className="section-sub">
                    Identified via Betweenness Centrality · NetworkX Graph Algorithm
                  </div>
                </div>
              </div>

              <div className="card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Supplier ID</th>
                      <th>Betweenness Score</th>
                      <th>Impact Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalNodes.map((n, i) => (
                      <tr key={n.supplier_id}>
                        <td style={{ color: 'var(--t-muted)', fontFamily: 'var(--font-mono)' }}>{String(i + 1).padStart(2, '0')}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>{n.supplier_id}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', marginTop: 2 }}>{n.reason}</div>
                        </td>
                        <td>
                          <div className="progress-track" style={{ marginBottom: 5 }}>
                            <div className="progress-fill" style={{
                              width: `${n.score * 1000}%`,
                              background: 'linear-gradient(90deg, #ff335544, #ff3355)',
                              boxShadow: '0 0 8px rgba(255,51,85,0.4)'
                            }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)' }}>
                            {(n.score * 100).toFixed(3)}%
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${n.score > 0.05 ? 'badge-high' : n.score > 0.02 ? 'badge-medium' : 'badge-info'}`}>
                            {n.score > 0.05 ? 'CRITICAL' : n.score > 0.02 ? 'HIGH' : 'MEDIUM'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => {
                              setSelectedNode(n.supplier_id);
                              handleNodeClick({ id: n.supplier_id });
                              setView('risk');
                            }}>RISK</button>
                            <button className="btn btn-danger btn-sm" onClick={async () => {
                              setSelectedNode(n.supplier_id);
                              setLoading(l => ({ ...l, cascade: true }));
                              try {
                                const r = await simulateDisruption(n.supplier_id);
                                setCascadeResult(r.data);
                                setView('simulate');
                              } finally {
                                setLoading(l => ({ ...l, cascade: false }));
                              }
                            }}>SIM</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ ALTERNATIVES ═══ */}
          {view === 'alternatives' && (
            <div className="fade-in">
              <SupplierToolbar />
              <AlternativesPanel alternatives={alternatives} loading={loading.alts} />
            </div>
          )}

          {/* ═══ WEAK SIGNALS ═══ */}
          {view === 'signals' && (
            <div className="fade-in">
              <div className="section-header">
                <div>
                  <div className="section-title">◉ Weak Signal Detection</div>
                  <div className="section-sub">
                    ML-powered early warning · Isolation Forest anomaly detection
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <WeakSignalPanel />

                <div className="card">
                  <div className="card-title">
                    <span className="card-title-icon">📋</span>
                    Signal Intelligence Guide
                  </div>
                  {[
                    { icon: '📰', title: 'News Sentiment', body: 'Strongly negative values indicate bearish news about trade, geopolitics, or pandemic disruption. Values below −0.5 represent serious deterioration.', color: 'var(--cyan)' },
                    { icon: '📈', title: 'Trade Volatility', body: 'High volatility (>0.7) signals active tariffs, export bans, or sanctions impacting pharmaceutical APIs. Watch China and India corridors.', color: 'var(--amber)' },
                    { icon: '🚢', title: 'Logistics Congestion', body: 'Values above 0.6 indicate port delays, shipping lane disruptions (Suez, Panama), or carrier capacity constraints.', color: '#ff7f50' },
                  ].map(s => (
                    <div key={s.title} style={{
                      padding: '12px 14px',
                      marginBottom: 10,
                      background: `rgba(0,0,0,0.2)`,
                      border: `1px solid var(--border)`,
                      borderRadius: 10,
                      borderLeft: `3px solid ${s.color}`,
                      display: 'flex', gap: 12, alignItems: 'flex-start'
                    }}>
                      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, color: s.color }}>{s.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--t-secondary)', lineHeight: 1.6 }}>{s.body}</div>
                      </div>
                    </div>
                  ))}
                  <div className="alert alert-warning" style={{ marginTop: 6 }}>
                    <span>🤖</span>
                    <div style={{ fontSize: '0.78rem' }}>
                      <strong>Production note:</strong> IsolationForest is trained on synthetic baseline data.
                      In production, integrate real-time trade intelligence APIs and NLP news feeds.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

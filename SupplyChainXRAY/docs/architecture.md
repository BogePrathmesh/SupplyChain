# SupplyChain X-Ray — Architecture

## System Overview

```
Browser (React + D3.js)
       │
 FastAPI REST API (localhost:8000)
       │
 ┌─────┴───────────────────────────────┐
 │           Processing Layer           │
 │  GraphEngine   RiskEngine  Cascade  │
 │  (NetworkX)   (Composite)  Sim BFS  │
 └─────┬───────────────────────────────┘
       │
 ┌─────┴─────────────────┐
 │     Data Layer         │
 │  suppliers.csv         │
 │  dependencies.csv      │
 │  country_risk.csv      │
 └───────────────────────┘
```

## Architecture Layers

| Layer | Technology | Purpose |
|---|---|---|
| **Data** | CSV / Pandas | Supplier, dependency, risk data |
| **Graph Engine** | NetworkX | Directed graph, centrality, PageRank |
| **Risk Engine** | NumPy formula | Composite resilience score |
| **Simulation Engine** | BFS + Monte Carlo | Cascade failure propagation |
| **Anomaly Detection** | IsolationForest | Weak signal detection |
| **API Layer** | FastAPI | REST endpoints |
| **Frontend** | React + D3.js | Interactive dashboard |

## Risk Formula

```
ResilienceScore =
  0.30 × GeographicDiversification  
+ 0.25 × PoliticalStabilityIndex    
+ 0.20 × SupplierRedundancy        
+ 0.15 × TradeVolatility (inverted)
+ 0.10 × LogisticsDelayRisk (inverted)
```

**Risk Levels:**
- 0–40 → 🔴 High Risk  
- 41–70 → 🟡 Medium Risk  
- 71–100 → 🟢 Low Risk

## Graph Algorithms Used

| Algorithm | Usage |
|---|---|
| Betweenness Centrality | Critical node detection |
| PageRank | Supplier influence score |
| BFS Propagation | Cascade simulation |
| IsolationForest | Anomaly detection |

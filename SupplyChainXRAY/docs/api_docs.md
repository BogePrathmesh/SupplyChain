# API Documentation

## Base URL
`http://localhost:8000`

## Endpoints

### `GET /suppliers`
Returns the full supply chain graph (nodes + edges).

**Response:**
```json
{
  "nodes": [{ "id": "SUP_001", "tier": 2, "country": "India", ... }],
  "links": [{ "source": "SUP_010", "target": "SUP_001", "weight": 0.7 }]
}
```

---

### `GET /risk-score/{supplier_id}`
Returns composite resilience score for a supplier.

**Response:**
```json
{
  "supplier_id": "SUP_001",
  "score": 63.4,
  "level": "Medium Risk",
  "metrics": { "GeographicDiversification": 60, ... }
}
```

---

### `POST /simulate-disruption`
Runs BFS cascade simulation from a failed supplier.

**Body:** `{ "supplier_id": "SUP_001" }`

**Response:**
```json
{
  "failed_supplier": "SUP_001",
  "impacted_suppliers": ["SUP_012", "SUP_033"],
  "disruption_percent": 12.5,
  "estimated_shortage": 45200
}
```

---

### `GET /critical-nodes`
Returns top suppliers by betweenness centrality.

---

### `GET /alternative-suppliers/{supplier_id}`
Returns ranked alternative suppliers for a failed node.

---

### `POST /simulate-weak-signals`
Runs IsolationForest anomaly detection.

**Body:** `{ "sentiment": -0.8, "volatility": 0.9, "congestion": 0.7 }`

**Response:**
```json
{
  "anomaly": true,
  "disruption_probability": 34.5,
  "message": "API supply disruption probability increased by 34.5%"
}
```

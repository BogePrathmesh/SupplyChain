from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

from graph_engine import GraphEngine
from risk_engine import RiskEngine
from cascade_simulator import CascadeSimulator
from anomaly_detection import AnomalyDetector
from supplier_recommender import SupplierRecommender
import os

app = FastAPI(title="SupplyChain X-Ray API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPLIERS_CSV = "../data/suppliers.csv"
DEPENDENCIES_CSV = "../data/dependencies.csv"
COUNTRY_RISK_CSV = "../data/country_risk.csv"

# Make sure data exists
if not os.path.exists(SUPPLIERS_CSV):
    from data_generator import generate_data
    generate_data()

graph_engine = GraphEngine(SUPPLIERS_CSV, DEPENDENCIES_CSV)
risk_engine = RiskEngine(COUNTRY_RISK_CSV, graph_engine)
cascade_simulator = CascadeSimulator(graph_engine)
anomaly_detector = AnomalyDetector()
supplier_recommender = SupplierRecommender(graph_engine, risk_engine)

@app.get("/suppliers")
async def get_suppliers():
    return graph_engine.get_graph_data()

@app.get("/risk-score/{supplier_id}")
async def get_risk_score(supplier_id: str):
    score = risk_engine.calculate_resilience(supplier_id)
    if not score:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return score

class DisruptionRequest(BaseModel):
    supplier_id: str

@app.post("/simulate-disruption")
async def simulate_disruption(req: DisruptionRequest):
    result = cascade_simulator.simulate(req.supplier_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@app.get("/critical-nodes")
async def get_critical_nodes():
    return graph_engine.get_critical_nodes()

@app.get("/alternative-suppliers/{supplier_id}")
async def get_alternative_suppliers(supplier_id: str):
    alts = supplier_recommender.get_alternatives(supplier_id)
    return {"failed_supplier": supplier_id, "alternatives": alts}

class SignalRequest(BaseModel):
    sentiment: float
    volatility: float
    congestion: float

@app.post("/simulate-weak-signals")
async def simulate_weak_signals(req: SignalRequest):
    return anomaly_detector.detect(req.sentiment, req.volatility, req.congestion)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

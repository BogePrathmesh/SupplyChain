# SupplyChain X-Ray
### Multi-Tier Supply Chain Resilience & Cascade Risk Analyzer

SupplyChain X-Ray is a graph-based supply chain intelligence platform designed to detect hidden supplier dependencies, identify systemic risk, simulate disruption cascades, and recommend alternative suppliers.

The system models supply chains as dynamic networks instead of static supplier lists, enabling organizations and policymakers to proactively detect vulnerabilities before disruptions occur.

---

# Problem Statement

Modern supply chains are deeply interconnected and highly fragile.

Most organizations only track their **Tier-1 suppliers**, while **Tier-2 and Tier-3 dependencies remain invisible**.

A disruption in a small upstream supplier can cascade across industries, causing:

• Manufacturing shutdowns  
• Medicine shortages  
• Economic losses  
• National supply instability  

Examples include disruptions caused during COVID-19, semiconductor shortages, and geopolitical conflicts.

The core challenge is the **lack of visibility into multi-tier supplier networks and systemic risk concentration**.

---

# Solution

SupplyChain X-Ray provides a **graph-based resilience analysis engine** that:

• Maps multi-tier supplier networks  
• Detects single points of failure  
• Simulates cascade disruptions  
• Calculates supplier risk scores  
• Identifies systemic choke points  
• Recommends alternative suppliers  

The platform transforms supply chain data into **network intelligence**.

---

# Key Features

## Multi-Tier Supply Chain Graph
The system models supplier dependencies using graph structures.

Nodes represent suppliers.  
Edges represent supply dependencies.

This enables advanced network analysis.

---

## Supplier Risk Scoring
Each supplier receives a resilience score calculated using multiple factors:

• Geographic concentration  
• Political stability  
• Supplier redundancy  
• Trade volatility  
• Logistics delays  

This helps identify vulnerable suppliers.

---

## Cascade Failure Simulation
The system simulates supplier failure scenarios.

When a critical supplier fails:

• Downstream dependencies are recalculated  
• Impacted suppliers are identified  
• Supply disruption percentage is estimated  

This reveals potential systemic collapse.

---

## Critical Supplier Detection
Graph algorithms identify suppliers that act as choke points.

Using centrality analysis, the system detects:

• Bottleneck suppliers  
• Highly influential nodes  
• Hidden concentration risks

These suppliers are labeled as **Systemic Risk Nodes**.

---

## Alternative Supplier Recommendation
When disruptions occur, the system identifies substitute suppliers based on:

• Similar product type  
• Production capacity  
• Risk score  
• Geographic diversification  

The system provides ranked alternatives.

---

## Weak Signal Risk Detection
Early signals of disruption are detected using anomaly detection.

Signals may include:

• News sentiment spikes  
• Trade volatility changes  
• Logistics delays  

Isolation Forest models detect abnormal patterns and generate alerts.

---

# Technology Stack

Backend

• Python  
• FastAPI  
• Pandas  
• NumPy  

Graph Modeling

• NetworkX  

Machine Learning

• Scikit-Learn  
• Isolation Forest  

Database

• PostgreSQL  

Frontend

• React  
• D3.js  

Visualization

• Plotly  

Deployment

• Docker  

---

# System Architecture

The platform is structured into modular layers.

Data Layer  
Handles supplier datasets and external risk indicators.

Processing Layer  
Performs data cleaning and feature engineering.

Graph Engine  
Builds the multi-tier supplier network.

Risk Engine  
Computes supplier resilience scores.

Simulation Engine  
Runs cascade failure simulations.

API Layer  
Exposes backend functionality through REST endpoints.

Frontend Layer  
Provides interactive visualization dashboards.

---

# Project Structure

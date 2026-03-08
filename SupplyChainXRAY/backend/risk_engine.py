import math
import pandas as pd

class RiskEngine:
    def __init__(self, country_risk_csv, graph_engine):
        self.cr_df = pd.read_csv(country_risk_csv)
        self.cr_dict = self.cr_df.set_index('country').to_dict('index')
        self.graph = graph_engine

    def calculate_resilience(self, supplier_id):
        graph_data = self.graph.get_graph_data()
        node_data = next((n for n in graph_data['nodes'] if n['id'] == supplier_id), None)
        
        if not node_data:
            return None
            
        country = node_data['country']
        c_risk = self.cr_dict.get(country, {
            "GeographicDiversification": 0.5,
            "PoliticalStabilityIndex": 0.5,
            "TradeVolatility": 0.5,
            "LogisticsDelayRisk": 0.5
        })
        
        geo_div = c_risk['GeographicDiversification'] * 100
        pol_stab = c_risk['PoliticalStabilityIndex'] * 100
        
        # Normalize redundancy (max 5)
        redundancy_score = min(node_data['redundancy'] / 5.0, 1.0) * 100
        
        trade_vol = (1.0 - c_risk['TradeVolatility']) * 100 # Invert risk for resilience
        log_delay = (1.0 - c_risk['LogisticsDelayRisk']) * 100 # Invert expected delay risk
        
        # Formula: ResilienceScore = 0.30 * Geo + 0.25 * Pol + 0.20 * Red + 0.15 * Trade + 0.10 * Log
        score = (0.30 * geo_div) + (0.25 * pol_stab) + (0.20 * redundancy_score) + (0.15 * trade_vol) + (0.10 * log_delay)
        
        risk_level = "High Risk"
        if score > 70:
            risk_level = "Low Risk"
        elif score > 40:
            risk_level = "Medium Risk"
            
        return {
            "supplier_id": supplier_id,
            "score": round(score, 2),
            "level": risk_level,
            "metrics": {
                "GeographicDiversification": geo_div,
                "PoliticalStabilityIndex": pol_stab,
                "SupplierRedundancy": redundancy_score,
                "TradeVolatility": trade_vol,
                "LogisticsDelayRisk": log_delay
            }
        }

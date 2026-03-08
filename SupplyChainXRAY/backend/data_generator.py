import pandas as pd
import numpy as np
import random
import os

def generate_data():
    os.makedirs("../data", exist_ok=True)
    
    countries = ["USA", "India", "China", "Germany", "Brazil"]
    products = [
        "Paracetamol API", "Ibuprofen API", "Amoxicillin API", 
        "Azithromycin API", "Metformin API", "Chemical Precursor A",
        "Chemical Precursor B", "Packaging Material", "Excipients",
        "Solvents"
    ]
    
    suppliers = []
    for i in range(1, 101):
        tier = random.choices([1, 2, 3], weights=[0.2, 0.4, 0.4])[0]
        supp = {
            "supplier_id": f"SUP_{i:03d}",
            "supplier_name": f"Supplier_{i}_T{tier}",
            "country": random.choice(countries),
            "tier_level": tier,
            "product_type": random.choice(products),
            "dependency_percent": round(random.uniform(5.0, 95.0), 2),
            "production_capacity": random.randint(1000, 50000),
            "lead_time_days": random.randint(5, 90)
        }
        suppliers.append(supp)
        
    df_suppliers = pd.DataFrame(suppliers)
    df_suppliers.to_csv("../data/suppliers.csv", index=False)
    
    dependencies = []
    t3 = df_suppliers[df_suppliers["tier_level"] == 3]["supplier_id"].tolist()
    t2 = df_suppliers[df_suppliers["tier_level"] == 2]["supplier_id"].tolist()
    t1 = df_suppliers[df_suppliers["tier_level"] == 1]["supplier_id"].tolist()
    
    for t2_sup in t2:
        if not t3: break
        num_deps = random.randint(1, min(3, len(t3)))
        deps = random.sample(t3, num_deps)
        for dep in deps:
            dependencies.append({"source": dep, "target": t2_sup, "weight": round(random.uniform(0.1, 1.0), 2)})
            
    for t1_sup in t1:
        if not t2: break
        num_deps = random.randint(1, min(4, len(t2)))
        deps = random.sample(t2, num_deps)
        for dep in deps:
            dependencies.append({"source": dep, "target": t1_sup, "weight": round(random.uniform(0.1, 1.0), 2)})
            
    df_deps = pd.DataFrame(dependencies)
    df_deps.to_csv("../data/dependencies.csv", index=False)
    
    country_risk = {
        "USA": {"GeographicDiversification": 0.8, "PoliticalStabilityIndex": 0.85, "TradeVolatility": 0.2, "LogisticsDelayRisk": 0.3},
        "India": {"GeographicDiversification": 0.6, "PoliticalStabilityIndex": 0.7, "TradeVolatility": 0.5, "LogisticsDelayRisk": 0.5},
        "China": {"GeographicDiversification": 0.4, "PoliticalStabilityIndex": 0.6, "TradeVolatility": 0.8, "LogisticsDelayRisk": 0.6},
        "Germany": {"GeographicDiversification": 0.7, "PoliticalStabilityIndex": 0.9, "TradeVolatility": 0.3, "LogisticsDelayRisk": 0.2},
        "Brazil": {"GeographicDiversification": 0.5, "PoliticalStabilityIndex": 0.5, "TradeVolatility": 0.7, "LogisticsDelayRisk": 0.7}
    }
    
    cr_list = []
    for k, v in country_risk.items():
        v["country"] = k
        cr_list.append(v)
        
    df_cr = pd.DataFrame(cr_list)
    df_cr.to_csv("../data/country_risk.csv", index=False)
    print("Data generated successfully.")

if __name__ == "__main__":
    generate_data()

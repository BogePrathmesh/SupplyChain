class SupplierRecommender:
    def __init__(self, graph_engine, risk_engine):
        self.ge = graph_engine
        self.re = risk_engine

    def get_alternatives(self, failed_supplier_id):
        graph_data = self.ge.get_graph_data()
        failed_node = next((n for n in graph_data['nodes'] if n['id'] == failed_supplier_id), None)
        
        if not failed_node:
            return []
            
        product_type = failed_node['product_type']
        failed_country = failed_node['country']
        failed_tier = failed_node['tier']
        
        alternatives = []
        for node in graph_data['nodes']:
            if node['id'] != failed_supplier_id and node['tier'] == failed_tier and node['product_type'] == product_type:
                risk = self.re.calculate_resilience(node['id'])
                if risk:
                    alternatives.append({
                        "supplier_id": node['id'],
                        "name": node['name'],
                        "country": node['country'],
                        "capacity": self.ge.G.nodes[node['id']].get('capacity', 0),
                        "lower_risk": risk['score'] > 50,
                        "risk_score": risk['score'],
                        "geographic_diversification": node['country'] != failed_country
                    })
                    
        # Sort by best risk score
        return sorted(alternatives, key=lambda x: x['risk_score'], reverse=True)

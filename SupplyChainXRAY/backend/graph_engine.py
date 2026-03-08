import networkx as nx
import pandas as pd
import json

class GraphEngine:
    def __init__(self, suppliers_csv, dependencies_csv):
        self.G = nx.DiGraph()
        self.suppliers_df = pd.read_csv(suppliers_csv)
        self.dependencies_df = pd.read_csv(dependencies_csv)
        self._build_graph()

    def _build_graph(self):
        for _, row in self.suppliers_df.iterrows():
            self.G.add_node(
                row['supplier_id'],
                name=row['supplier_name'],
                country=row['country'],
                tier=row['tier_level'],
                product_type=row['product_type'],
                capacity=row['production_capacity'],
                lead_time=row['lead_time_days']
            )
        
        for _, row in self.dependencies_df.iterrows():
            if self.G.has_node(row['source']) and self.G.has_node(row['target']):
                self.G.add_edge(row['source'], row['target'], weight=row['weight'])

    def get_graph_data(self):
        # Calculate centralities
        pagerank = nx.pagerank(self.G, weight='weight')
        betweenness = nx.betweenness_centrality(self.G, weight='weight')
        
        nodes = []
        for node in self.G.nodes(data=True):
            n_id = node[0]
            attrs = node[1]
            nodes.append({
                "id": n_id,
                "name": attrs.get("name"),
                "tier": attrs.get("tier"),
                "country": attrs.get("country"),
                "product_type": attrs.get("product_type"),
                "pagerank": pagerank.get(n_id, 0),
                "betweenness": betweenness.get(n_id, 0),
                "redundancy": self.G.in_degree(n_id) # Number of incoming suppliers
            })
            
        edges = [{"source": u, "target": v, "weight": d["weight"]} for u, v, d in self.G.edges(data=True)]
        return {"nodes": nodes, "links": edges}

    def get_critical_nodes(self, top_n=10):
        betweenness = nx.betweenness_centrality(self.G, weight='weight')
        sorted_nodes = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
        return [{"supplier_id": k, "score": v, "reason": "High Betweenness Centrality"} for k, v in sorted_nodes[:top_n]]

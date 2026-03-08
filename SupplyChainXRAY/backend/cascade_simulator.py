import networkx as nx

class CascadeSimulator:
    def __init__(self, graph_engine):
        self.G = graph_engine.G

    def simulate(self, failed_node_id):
        if not self.G.has_node(failed_node_id):
            return {"error": "Node not found"}

        impacted_nodes = set()
        visited = set()
        queue = [failed_node_id]
        
        # Find all downstream dependencies (BFS)
        while queue:
            current = queue.pop(0)
            if current not in visited:
                visited.add(current)
                # Successors are nodes that depend on 'current' (downstream)
                for neighbor in self.G.successors(current):
                    impacted_nodes.add(neighbor)
                    queue.append(neighbor)
                    
        total_nodes = len(self.G.nodes)
        impact_percent = (len(impacted_nodes) / total_nodes) * 100 if total_nodes > 0 else 0
        
        # Estimate shortage based on capacity of impacted nodes + failed node
        shortage = self.G.nodes[failed_node_id].get('capacity', 0)
        for n in impacted_nodes:
            shortage += self.G.nodes[n].get('capacity', 0) * 0.5 # 50% capacity loss downstream

        return {
            "failed_supplier": failed_node_id,
            "impacted_suppliers": list(impacted_nodes),
            "disruption_percent": round(impact_percent, 2),
            "estimated_shortage": round(shortage, 2)
        }

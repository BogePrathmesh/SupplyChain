from sklearn.ensemble import IsolationForest
import pandas as pd
import joblib
import os

class AnomalyDetector:
    def __init__(self, model_path="../models/isolation_forest.pkl"):
        self.model_path = model_path
        self.model = None
        self._load_or_train()

    def _load_or_train(self):
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            # Train a dummy model
            df = pd.DataFrame({
                "sentiment": [0.5, 0.4, 0.6, -0.9, 0.5, 0.4, -0.8],
                "volatility": [0.1, 0.2, 0.1, 0.9, 0.1, 0.2, 0.8],
                "congestion": [0.2, 0.3, 0.2, 0.8, 0.1, 0.2, 0.9]
            })
            self.model = IsolationForest(contamination=0.2, random_state=42)
            self.model.fit(df)
            joblib.dump(self.model, self.model_path)

    def detect(self, sentiment, volatility, congestion):
        df = pd.DataFrame([{
            "sentiment": sentiment,
            "volatility": volatility,
            "congestion": congestion
        }])
        pred = self.model.predict(df)[0]
        score = self.model.decision_function(df)[0]
        # pred is -1 for anomaly, 1 for normal
        probability = 0 if pred == 1 else min(100, abs(score) * 100 * 2)
        
        return {
            "anomaly": bool(pred == -1),
            "disruption_probability": round(probability, 2),
            "message": f"API supply disruption probability increased by {round(probability, 2)}%" if pred == -1 else "Normal conditions"
        }

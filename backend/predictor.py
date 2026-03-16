import joblib
import numpy as np
from datetime import datetime, timedelta
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "traffic_model.pkl")

class TrafficPredictor:
    def __init__(self):
        self._model = None

    @property
    def model(self):
        if self._model is None:
            self._model = joblib.load(MODEL_PATH)
        return self._model

    def predict(self, lat: float, lng: float, minutes_ahead: int = 30) -> dict:
        target = datetime.now() + timedelta(minutes=minutes_ahead)

        # Features must match exactly what you trained with in train_model.py
        # Adjust column order if your CSV has different features
        features = np.array([[
            lat,
            lng,
            target.hour,
            target.weekday(),           # 0=Mon, 6=Sun
            int(target.weekday() >= 5), # is_weekend
            target.month,
            minutes_ahead,
        ]])

        try:
            score = float(self.model.predict(features)[0])
            score = max(0.0, min(100.0, score))
        except Exception:
            # Fallback if feature shape doesn't match yet
            score = 50.0

        level = "low" if score < 40 else ("medium" if score < 70 else "heavy")
        color = {"low": "#22c55e", "medium": "#f97316", "heavy": "#ef4444"}[level]

        return {
            "score": round(score, 1),
            "level": level,
            "color": color,
            "minutes_ahead": minutes_ahead,
            "predicted_for": target.strftime("%H:%M"),
        }

predictor = TrafficPredictor()
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib, json, os

CSV_PATH   = "dataset/traffic.csv"
MODEL_PATH = "model/traffic_model.pkl"
STATS_PATH = "model/stats.json"

df = pd.read_csv(CSV_PATH)

# ── Adapt these column names to match YOUR traffic.csv headers ─────────────
# Expected columns: lat, lng, hour, weekday, is_weekend, month, congestion_score
# If your CSV uses different names, rename them here:
# df = df.rename(columns={"latitude": "lat", "longitude": "lng", ...})

# Add time features if not already present
if "hour" not in df.columns and "timestamp" in df.columns:
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"]       = df["timestamp"].dt.hour
    df["weekday"]    = df["timestamp"].dt.weekday
    df["is_weekend"] = (df["weekday"] >= 5).astype(int)
    df["month"]      = df["timestamp"].dt.month

df["minutes_ahead"] = 30  # target horizon

FEATURES = ["lat", "lng", "hour", "weekday", "is_weekend", "month", "minutes_ahead"]
TARGET   = "congestion_score"

# Drop rows with missing values
df = df.dropna(subset=FEATURES + [TARGET])

X = df[FEATURES]
y = df[TARGET]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=200, n_jobs=-1, random_state=42)
model.fit(X_train, y_train)

mae = mean_absolute_error(y_test, model.predict(X_test))
print(f"MAE: {mae:.2f}")

os.makedirs("model", exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"Model saved → {MODEL_PATH}")

# Update stats.json
stats = {
    "mae": round(mae, 2),
    "samples": len(df),
    "features": FEATURES,
    "trained_at": pd.Timestamp.now().isoformat(),
}
with open(STATS_PATH, "w") as f:
    json.dump(stats, f, indent=2)
print(f"Stats saved → {STATS_PATH}")
```

---

## Step 6 — Frontend files

Create this folder structure inside `frontend/`:
```
frontend/
  components/
    RouteSearch.tsx
    TrafficMap.tsx      ← dynamic import (no SSR)
    RoutePanel.tsx
    EmergencyFAB.tsx
    ProximityAlert.tsx
  hooks/
    useTraffic.ts
    useProximityAlert.ts
  app/
    page.tsx            ← modify this
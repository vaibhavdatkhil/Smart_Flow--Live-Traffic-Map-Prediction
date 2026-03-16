from flask import Flask, jsonify, request
from flask_cors import CORS
from predictor import predictor
from traffic_service import get_traffic_segments
import requests
from auth import auth_bp

app = Flask(__name__)
CORS(app)
##CORS(app, origins=["http://localhost:3000"])
app.register_blueprint(auth_bp, url_prefix="/auth")

# ── keep all your existing routes below this line ──────────────────────────

# ── Geocoding proxy ───────────────────────────────────────────────────────
@app.route("/api/geocode")
def geocode():
    query = request.args.get("q", "")
    resp = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": query + ", India", "format": "json", "limit": 5},
        headers={"User-Agent": "SmartFlow/1.0"},
        timeout=5,
    )

    results = [{
        "name": r["display_name"],
        "lat": float(r["lat"]),
        "lng": float(r["lon"])
    } for r in resp.json()]

    return jsonify(results)


# ── Multi-route proxy (OSRM) ──────────────────────────────────────────────
@app.route("/api/routes")
def get_routes():

    src_lat = request.args["src_lat"]
    src_lng = request.args["src_lng"]

    dst_lat = request.args["dst_lat"]
    dst_lng = request.args["dst_lng"]

    resp = requests.get(
        f"https://router.project-osrm.org/route/v1/driving/"
        f"{src_lng},{src_lat};{dst_lng},{dst_lat}",
        params={
            "overview": "full",
            "geometries": "geojson",
            "alternatives": "true",
            "steps": "false"
        },
        timeout=8,
    )

    raw = resp.json()
    routes = []

    for i, r in enumerate(raw.get("routes", [])):

        coords = [[pt[1], pt[0]] for pt in r["geometry"]["coordinates"]]

        mid = coords[len(coords)//2]
        pred = predictor.predict(mid[0], mid[1], minutes_ahead=0)

        routes.append({
            "geometry": coords,
            "distance": round(r["distance"] / 1000, 1),
            "duration": round(r["duration"] / 60),
            "summary": "Fastest route" if i == 0 else f"Alternate route {i}",
            "level": pred["level"],
            "color": pred["color"],
        })

    return jsonify({"routes": routes})


# ── Live traffic segments ─────────────────────────────────────────────────
@app.route("/api/traffic")
def traffic():

    n = float(request.args["north"])
    s = float(request.args["south"])
    e = float(request.args["east"])
    w = float(request.args["west"])

    segments = get_traffic_segments(n, s, e, w)

    return jsonify({"segments": segments})


# ── AI prediction ─────────────────────────────────────────────────────────
@app.route("/api/predict")
def predict():

    lat = float(request.args["lat"])
    lng = float(request.args["lng"])

    result = predictor.predict(lat, lng, minutes_ahead=30)

    return jsonify(result)


# ── Stats ─────────────────────────────────────────────────────────────────
@app.route("/api/stats")
def stats():

    import json, os

    path = os.path.join(os.path.dirname(__file__), "model", "stats.json")

    with open(path) as f:
        return jsonify(json.load(f))


# ── NEW: Live Traffic Dashboard API ───────────────────────────────────────

@app.route("/api/traffic-live")
def traffic_live():
    return jsonify({
        "cities": [
            {"city": "Pune", "vehicles": 320, "speed": 42, "congestion": 35},
            {"city": "Mumbai", "vehicles": 780, "speed": 22, "congestion": 70},
            {"city": "Delhi", "vehicles": 640, "speed": 30, "congestion": 55},
            {"city": "Bangalore", "vehicles": 500, "speed": 28, "congestion": 60}
        ]
    })

# ── Run server ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
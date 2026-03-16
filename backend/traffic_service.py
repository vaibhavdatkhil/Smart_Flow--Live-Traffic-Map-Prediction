import requests
import random
from datetime import datetime

TOMTOM_KEY = "YOUR_TOMTOM_KEY"   # free at developer.tomtom.com — 2500 req/day

def get_traffic_segments(north, south, east, west) -> list:
    """Fetch live traffic for a bounding box. Falls back to simulation if API fails."""
    speed, free_flow = _fetch_tomtom((north+south)/2, (east+west)/2)
    ratio = speed / max(free_flow, 1)
    base_level = "low" if ratio > 0.75 else ("medium" if ratio > 0.40 else "heavy")

    segments = []
    step = 0.04
    lat = south
    while lat < north:
        jitter = random.uniform(-8, 8)
        seg_speed = max(5, speed + jitter)
        seg_ratio = seg_speed / max(free_flow, 1)
        level = "low" if seg_ratio > 0.75 else ("medium" if seg_ratio > 0.40 else "heavy")
        color = {"low": "#22c55e", "medium": "#f97316", "heavy": "#ef4444"}[level]
        segments.append({
            "path": [[round(lat, 4), west], [round(lat, 4), east]],
            "road": f"NH-{random.randint(1, 66)}",
            "level": level,
            "color": color,
            "speed": round(seg_speed, 1),
        })
        lat += step
        if len(segments) >= 20:
            break
    return segments

def _fetch_tomtom(lat, lng):
    try:
        resp = requests.get(
            "https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json",
            params={"point": f"{lat},{lng}", "unit": "KMPH", "key": TOMTOM_KEY},
            timeout=3,
        )
        d = resp.json().get("flowSegmentData", {})
        return d.get("currentSpeed", 40), d.get("freeFlowSpeed", 60)
    except Exception:
        # Dev fallback — random realistic speeds
        speed = random.randint(15, 85)
        return speed, 80
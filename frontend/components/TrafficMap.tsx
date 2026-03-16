import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const TRAFFIC_COLORS = {
  low: "#22c55e",
  medium: "#f97316",
  heavy: "#ef4444",
};

function TrafficLayer() {
  const map = useMap();
  const [segments, setSegments] = useState<any[]>([]);

  useEffect(() => {

    const fetchTraffic = async () => {
      try {
        const bounds = map.getBounds();

        const res = await axios.get(`${API}/api/traffic`, {
          params: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          },
        });

        setSegments(res.data.segments || []);
      } catch (err) {
        console.error("Traffic fetch error:", err);
      }
    };

    fetchTraffic();

    const interval = setInterval(fetchTraffic, 5000);

    map.on("moveend", fetchTraffic);

    return () => {
      clearInterval(interval);
      map.off("moveend", fetchTraffic);
    };

  }, [map]);

  return (
    <>
      {segments.map((seg, i) => (
        <Polyline
          key={i}
          positions={seg.path}
          pathOptions={{
            color: TRAFFIC_COLORS[seg.level as keyof typeof TRAFFIC_COLORS],
            weight: 6,
            opacity: 0.8,
          }}
        >
          <Popup>
            {seg.road} — {seg.level} traffic · {seg.speed} km/h
          </Popup>
        </Polyline>
      ))}
    </>
  );
}

export default function TrafficMap({ routes }: { routes: any[] }) {

  const routeColors = ["#3b82f6", "#8b5cf6", "#06b6d4"];

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      className="h-screen w-full"
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />

      <TrafficLayer />

      {routes.map((route, i) => (
        <Polyline
          key={i}
          positions={route.geometry}
          pathOptions={{
            color: routeColors[i % routeColors.length],
            weight: i === 0 ? 5 : 3,
            dashArray: i === 0 ? undefined : "8 6",
          }}
        >
          <Popup>
            {route.summary} · {route.distance.toFixed(1)} km · {route.duration} min
          </Popup>
        </Polyline>
      ))}

    </MapContainer>
  );
}
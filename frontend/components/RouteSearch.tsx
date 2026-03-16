import { useState } from "react";
import axios from "axios";

interface RouteResult {
  geometry: [number, number][];
  distance: number;
  duration: number;
  summary: string;
}

export default function RouteSearch({ onRoutes }: { onRoutes: (r: RouteResult[]) => void }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  async function geocode(query: string): Promise<[number, number]> {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: query + ", India", format: "json", limit: 1 },
      headers: { "Accept-Language": "en" },
    });
    if (!res.data.length) throw new Error(`Location not found: ${query}`);
    return [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)];
  }

  async function fetchRoutes() {
    setLoading(true);
    try {
      const [srcCoord, dstCoord] = await Promise.all([geocode(source), geocode(destination)]);
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${srcCoord[0]},${srcCoord[1]};${dstCoord[0]},${dstCoord[1]}`,
        { params: { overview: "full", geometries: "geojson", alternatives: "true", steps: "false" } }
      );
      const routes: RouteResult[] = res.data.routes.map((r: any, i: number) => ({
        geometry: r.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
        distance: r.distance / 1000,
        duration: Math.round(r.duration / 60),
        summary: i === 0 ? "Fastest route" : `Alternate route ${i}`,
      }));
      onRoutes(routes);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-2xl shadow-lg p-4 w-[420px] flex flex-col gap-3">
      <h1 className="text-lg font-semibold text-gray-800">SmartFlow</h1>
      <input className="border rounded-xl px-4 py-2 text-sm" placeholder="From — e.g. Connaught Place, Delhi"
        value={source} onChange={e => setSource(e.target.value)} />
      <input className="border rounded-xl px-4 py-2 text-sm" placeholder="To — e.g. Bandra, Mumbai"
        value={destination} onChange={e => setDestination(e.target.value)} />
      <button
        onClick={fetchRoutes}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Searching…" : "Get Directions"}
      </button>
    </div>
  );
}
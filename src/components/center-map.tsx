import { useEffect, useState } from "react";
import type { GymCenter } from "@/services/gymService";
import { getCenterMeta } from "@/lib/center-meta";

export function CenterMap({
  centers, onSelect, height = 360,
}: { centers: GymCenter[]; onSelect: (c: GymCenter) => void; height?: number }) {
  const [mounted, setMounted] = useState(false);
  const [Mod, setMod] = useState<any>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [rl, L] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
        // @ts-expect-error css side-effect
        import("leaflet/dist/leaflet.css"),
      ]);
      const icon = L.icon({
        iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      });
      (L.Marker.prototype as any).options.icon = icon;
      if (active) { setMod({ rl, L }); setMounted(true); }
    })();
    return () => { active = false; };
  }, []);

  if (!mounted || !Mod) {
    return (
      <div className="glass grid place-items-center text-sm text-muted-foreground" style={{ height }}>
        Loading interactive map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = Mod.rl;
  const points = centers.map((c) => ({ c, ...getCenterMeta(c.name) }));
  const center: [number, number] = points.length
    ? [
        points.reduce((s, p) => s + p.lat, 0) / points.length,
        points.reduce((s, p) => s + p.lng, 0) / points.length,
      ]
    : [23.8103, 90.4125];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10" style={{ height }}>
      <MapContainer center={center} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%", background: "#0b1220" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map(({ c, lat, lng }) => (
          <Marker key={c.id} position={[lat, lng]}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{c.address}</div>
                <div style={{ marginTop: 6, fontSize: 12 }}>৳{c.monthly_fee}/month</div>
                <button
                  onClick={() => onSelect(c)}
                  style={{
                    marginTop: 8, padding: "6px 10px", borderRadius: 8,
                    background: "linear-gradient(135deg,#22c55e,#06b6d4)", color: "#0b1220",
                    fontWeight: 700, fontSize: 12, border: 0, cursor: "pointer",
                  }}
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

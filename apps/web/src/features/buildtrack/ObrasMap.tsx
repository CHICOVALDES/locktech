import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Project } from "@bali-moto-track/shared-types";

// Mapa de las obras: un marcador por construcción en sus coordenadas, con el ícono
// del proyecto (hotel/obra/beach club) y un pulso según el estado. Click en el
// marcador abre el detalle. Reusa el mismo estilo de tiles que el mapa de tracking.
const BALI_CENTER: [number, number] = [115.15, -8.6];

export function ObrasMap({ projects, onOpen }: { projects: Project[]; onOpen: (id: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const [loaded, setLoaded] = useState(false);

  // Init del mapa una sola vez.
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: BALI_CENTER,
      zoom: 9,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("load", () => setLoaded(true));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // (Re)dibuja los marcadores cuando llegan/cambian las obras.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || projects.length === 0) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    for (const project of projects) {
      const el = document.createElement("div");
      el.className = `bt-map-pin bt-map-pin--${project.status}`;
      el.innerHTML = `<span class="bt-map-pin__icon">${project.icon ?? "🏗️"}</span><span class="bt-map-pin__label">${project.name}</span>`;
      el.addEventListener("click", () => onOpenRef.current(project.id));

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([project.longitude, project.latitude])
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([project.longitude, project.latitude]);
    }

    // Encaja todas las obras en la vista (con margen); si hay una sola, centra.
    if (projects.length === 1) {
      map.easeTo({ center: [projects[0].longitude, projects[0].latitude], zoom: 13 });
    } else {
      map.fitBounds(bounds, { padding: 70, maxZoom: 12, duration: 600 });
    }
  }, [projects, loaded]);

  return (
    <div className="bt-map">
      <div ref={containerRef} className="bt-map__canvas" />
      <span className="bt-map__badge">🏗️ Obras en el mapa</span>
    </div>
  );
}

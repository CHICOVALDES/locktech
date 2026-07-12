import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Position } from "@bali-moto-track/shared-types";
import { vehiclePhotoMarkerHtml } from "../../components/vehiclePhotoMarker.js";
import { DEFAULT_CUSTOMIZATION, LIVERY_PRESETS, type VehicleCustomization } from "../customization/presets.js";

interface LiveMapProps {
  positions: Position[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  customizations: Record<string, VehicleCustomization>;
  /** "home" hace que la cámara vuele a Casa y se quede ahí, sin seguir motos */
  cameraTarget: "home" | null;
}

const BALI_CENTER: [number, number] = [115.15, -8.66];
// Placeholder cerca de Tumbak Bayuh, Canggu (zona de BMA) — reemplazar por la
// dirección/coordenadas reales de la casa cuando las tengas.
const HOME_LOCATION: [number, number] = [115.1505, -8.6295];
const TRAIL_SOURCE_ID = "moto-trail";
const TRAIL_MAX_POINTS = 24;
const CHASE_PITCH = 62;
const CHASE_ZOOM = 17.3;

function iconStyleFor(vehicleId: string, customizations: Record<string, VehicleCustomization>) {
  const customization = customizations[vehicleId] ?? DEFAULT_CUSTOMIZATION;
  const preset = LIVERY_PRESETS.find((p) => p.id === customization.liveryId) ?? LIVERY_PRESETS[0];
  return { primary: preset.primary, secondary: preset.secondary, kit: customization.kit, iconId: customization.iconId };
}

export function LiveMap({ positions, selectedVehicleId, onSelectVehicle, customizations, cameraTarget }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const trailRef = useRef<[number, number][]>([]);
  const styleLoadedRef = useRef(false);
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: BALI_CENTER,
      zoom: 16,
      pitch: CHASE_PITCH,
      bearing: 0,
      antialias: true,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      styleLoadedRef.current = true;

      try {
        map.addLayer({
          id: "3d-buildings",
          source: "openmaptiles",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": "#141821",
            "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8],
            "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
            "fill-extrusion-opacity": 0.9,
          },
        });
      } catch {
        // el estilo puede cambiar de nombre de fuente/capa entre versiones; los
        // edificios 3D son un detalle cosmético, no debe romper el resto del mapa.
      }

      try {
        map.addSource(TRAIL_SOURCE_ID, {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
        });
        map.addLayer({
          id: "moto-trail-glow",
          type: "line",
          source: TRAIL_SOURCE_ID,
          paint: {
            "line-color": "#c41e2a",
            "line-width": 10,
            "line-blur": 6,
            "line-opacity": 0.45,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
        map.addLayer({
          id: "moto-trail-core",
          type: "line",
          source: TRAIL_SOURCE_ID,
          paint: {
            "line-color": "#c41e2a",
            "line-width": 3,
            "line-opacity": 0.9,
          },
          layout: { "line-cap": "round", "line-join": "round" },
        });
      } catch {
        // idem: la estela es decorativa, se ignora si el estilo no la soporta
      }

      const homeEl = document.createElement("div");
      homeEl.className = "home-marker";
      homeEl.innerHTML = "🏠";
      new maplibregl.Marker({ element: homeEl })
        .setLngLat(HOME_LOCATION)
        .setPopup(new maplibregl.Popup({ offset: 20 }).setText("Casa"))
        .addTo(map);
    });

    return () => map.remove();
  }, []);

  // Swoop de cámara al cambiar de moto seleccionada, o al ir a Casa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (cameraTarget === "home") {
      if (lastSelectedRef.current === "home") return;
      lastSelectedRef.current = "home";
      map.flyTo({ center: HOME_LOCATION, bearing: 0, pitch: 45, zoom: 17, duration: 1500 });
      return;
    }

    if (!selectedVehicleId || lastSelectedRef.current === selectedVehicleId) return;
    lastSelectedRef.current = selectedVehicleId;
    trailRef.current = [];

    const position = positions.find((p) => p.vehicleId === selectedVehicleId);
    if (!position) return;

    map.flyTo({
      center: [position.longitude, position.latitude],
      bearing: position.heading,
      pitch: CHASE_PITCH,
      zoom: CHASE_ZOOM,
      duration: 1500,
    });
  }, [selectedVehicleId, cameraTarget, positions]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const position of positions) {
      const isSelected = position.vehicleId === selectedVehicleId;
      const { primary } = iconStyleFor(position.vehicleId, customizations);
      const existing = markersRef.current[position.vehicleId];

      if (existing) {
        existing.setLngLat([position.longitude, position.latitude]);
        const el = existing.getElement();
        const heading = el.querySelector<HTMLElement>(".moto-marker__heading");
        if (heading) heading.style.transform = `rotate(${position.heading}deg)`;
        const photo = el.querySelector<HTMLImageElement>(".moto-marker__photo");
        if (photo) {
          photo.style.borderColor = primary;
          photo.classList.toggle("moto-marker__photo--selected", isSelected);
        }
      } else {
        const el = document.createElement("div");
        el.className = "moto-marker";
        el.innerHTML = vehiclePhotoMarkerHtml(position.vehicleId, primary, isSelected);
        el.querySelector<HTMLElement>(".moto-marker__heading")!.style.transform = `rotate(${position.heading}deg)`;
        el.addEventListener("click", () => onSelectVehicle(position.vehicleId));

        const marker = new maplibregl.Marker({ element: el }).setLngLat([position.longitude, position.latitude]).addTo(map);

        markersRef.current[position.vehicleId] = marker;
      }

      if (isSelected && cameraTarget !== "home") {
        // Cámara chase-cam: sigue a la moto seleccionada, inclinada y rotando con su rumbo
        map.easeTo({
          center: [position.longitude, position.latitude],
          bearing: position.heading,
          duration: 1400,
          easing: (t) => t,
        });

        if (styleLoadedRef.current) {
          const nextPoint: [number, number] = [position.longitude, position.latitude];
          trailRef.current = [...trailRef.current, nextPoint].slice(-TRAIL_MAX_POINTS);
          const source = map.getSource(TRAIL_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
          source?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: trailRef.current } });
          for (const layerId of ["moto-trail-glow", "moto-trail-core"]) {
            if (map.getLayer(layerId)) map.setPaintProperty(layerId, "line-color", primary);
          }
        }
      }
    }
  }, [positions, selectedVehicleId, onSelectVehicle, customizations, cameraTarget]);

  return <div ref={containerRef} className="live-map" />;
}

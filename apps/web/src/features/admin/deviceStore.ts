import { useCallback, useState } from "react";

// Registro de dispositivos (GPS + cámaras) que el admin da de alta. Persiste en
// localStorage para la demo. En Fase 1 esto se reemplaza por endpoints del backend:
// el GPS crea el device en Traccar + fila en `vehicles`; la cámara guarda su config
// de stream (nunca la contraseña en texto plano — se cifra o se guarda en un vault).

export type TrackerProtocol = "teltonika" | "gt06" | "h02" | "tag-sim";

export const TRACKER_PROTOCOLS: { id: TrackerProtocol; label: string }[] = [
  { id: "teltonika", label: "Teltonika (Codec8)" },
  { id: "gt06", label: "GT06 / Concox (clon)" },
  { id: "h02", label: "H02 (SinoTrack ST-901)" },
  { id: "tag-sim", label: "Tag con SIM / celular" },
];

// Tipo de activo que lleva el equipo: vehículo o inmueble.
export type AssetType = "auto" | "moto" | "casa";

export const ASSET_TYPES: { id: AssetType; label: string }[] = [
  { id: "moto", label: "Moto" },
  { id: "auto", label: "Auto" },
  { id: "casa", label: "Casa / inmueble" },
];

export interface GpsDevice {
  id: string;
  vehicleId: string; // patente o identificador visible, ej. RM-XMAX-180
  assetType: AssetType;
  brand: string; // marca, ej. Yamaha
  model: string; // modelo, ej. NMAX 155
  imei: string;
  protocol: TrackerProtocol;
  clientUsername: string;
  createdAt: string;
}

export type CameraType = "hikvision" | "onvif" | "rtsp";

export const CAMERA_TYPES: { id: CameraType; label: string }[] = [
  { id: "hikvision", label: "Hikvision (IP)" },
  { id: "onvif", label: "ONVIF genérica" },
  { id: "rtsp", label: "RTSP manual" },
];

export interface Camera {
  id: string;
  name: string;
  type: CameraType;
  host: string;
  port: number;
  username: string;
  password: string;
  channel: number; // Hikvision
  stream: "main" | "sub"; // Hikvision
  path: string; // ONVIF/RTSP: ruta después del host
  rtspUrl: string;
  clientUsername: string;
  createdAt: string;
}

// Construye la URL RTSP según el tipo de cámara.
export function buildRtspUrl(input: {
  type: CameraType;
  host: string;
  port: number;
  username: string;
  password: string;
  channel: number;
  stream: "main" | "sub";
  path: string;
}): string {
  const auth = input.username ? `${input.username}:${input.password}@` : "";
  const base = `rtsp://${auth}${input.host}:${input.port}`;
  if (input.type === "hikvision") {
    // Formato Hikvision: /Streaming/Channels/<canal>0<1=main|2=sub>  (ej. 101 = canal 1 main)
    const streamDigit = input.stream === "main" ? "1" : "2";
    return `${base}/Streaming/Channels/${input.channel}0${streamDigit}`;
  }
  const path = input.path.replace(/^\//, "");
  return `${base}/${path}`;
}

// ---------- NVR (grabador de varios canales) ----------

export type NvrBrand = "hikvision" | "dahua" | "xm" | "onvif";

export const NVR_BRANDS: { id: NvrBrand; label: string }[] = [
  { id: "hikvision", label: "Hikvision / HiLook" },
  { id: "dahua", label: "Dahua / Imou" },
  { id: "xm", label: "XM · XMEye (genérica china)" },
  { id: "onvif", label: "ONVIF / RTSP genérico" },
];

export interface Nvr {
  id: string;
  name: string; // ej. "NVR Oficina"
  brand: NvrBrand;
  host: string; // IP del grabador, ej. 192.168.1.10
  port: number; // puerto RTSP, típico 554
  username: string;
  password: string;
  channels: number; // cantidad de canales del grabador
  clientUsername: string;
  createdAt: string;
}

// Construye la URL RTSP de UN canal del NVR según la marca.
// Hikvision: /Streaming/Channels/<canal>0<1=main|2=sub>
// Dahua/XM:  /cam/realmonitor?channel=<canal>&subtype=<0=main|1=sub>
export function buildNvrChannelRtsp(input: {
  brand: NvrBrand;
  host: string;
  port: number;
  username: string;
  password: string;
  channel: number;
  stream: "main" | "sub";
}): string {
  const auth = input.username ? `${input.username}:${input.password}@` : "";
  const base = `rtsp://${auth}${input.host}:${input.port}`;
  switch (input.brand) {
    case "hikvision": {
      const streamDigit = input.stream === "main" ? "1" : "2";
      return `${base}/Streaming/Channels/${input.channel}0${streamDigit}`;
    }
    case "dahua":
    case "xm": {
      const subtype = input.stream === "main" ? 0 : 1;
      return `${base}/cam/realmonitor?channel=${input.channel}&subtype=${subtype}`;
    }
    default:
      return `${base}/ch${input.channel}/${input.stream === "main" ? 0 : 1}`;
  }
}

const GPS_KEY = "bmt.devices.gps";
const CAM_KEY = "bmt.devices.cameras";
const NVR_KEY = "bmt.devices.nvr";

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, value: T[]): T[] {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`;
}

export function useDevices() {
  const [gps, setGps] = useState<GpsDevice[]>(() => load<GpsDevice>(GPS_KEY));
  const [cameras, setCameras] = useState<Camera[]>(() => load<Camera>(CAM_KEY));
  const [nvrs, setNvrs] = useState<Nvr[]>(() => load<Nvr>(NVR_KEY));

  const addGps = useCallback((device: Omit<GpsDevice, "id" | "createdAt">) => {
    setGps((prev) => save(GPS_KEY, [...prev, { ...device, id: uid(), createdAt: new Date().toISOString() }]));
  }, []);

  const removeGps = useCallback((id: string) => {
    setGps((prev) => save(GPS_KEY, prev.filter((d) => d.id !== id)));
  }, []);

  const addCamera = useCallback((camera: Omit<Camera, "id" | "createdAt">) => {
    setCameras((prev) => save(CAM_KEY, [...prev, { ...camera, id: uid(), createdAt: new Date().toISOString() }]));
  }, []);

  const removeCamera = useCallback((id: string) => {
    setCameras((prev) => save(CAM_KEY, prev.filter((c) => c.id !== id)));
  }, []);

  const addNvr = useCallback((nvr: Omit<Nvr, "id" | "createdAt">) => {
    setNvrs((prev) => save(NVR_KEY, [...prev, { ...nvr, id: uid(), createdAt: new Date().toISOString() }]));
  }, []);

  const removeNvr = useCallback((id: string) => {
    setNvrs((prev) => save(NVR_KEY, prev.filter((n) => n.id !== id)));
  }, []);

  return { gps, cameras, nvrs, addGps, removeGps, addCamera, removeCamera, addNvr, removeNvr };
}

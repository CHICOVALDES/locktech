export interface Position {
  vehicleId: string;
  tenantId: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  ignition: boolean | null;
  batteryLevel: number | null;
  recordedAt: string;
}

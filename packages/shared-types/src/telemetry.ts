export interface MotoTelemetry {
  vehicleId: string;
  rpm: number;
  fuelPct: number;
  engineTempC: number;
  odometerKm: number;
  checkEngine: boolean;
  /** simulada, para el tema "animal" cuando el ícono elegido es un ave */
  altitudeM: number;
}

export type AlertType = "geofence_exit" | "unauthorized_movement";
export type AlertSeverity = "low" | "medium" | "high";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface AlertEvent {
  id: string;
  tenantId: string;
  vehicleId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  positionSnapshot: {
    latitude: number;
    longitude: number;
    recordedAt: string;
  };
  createdAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

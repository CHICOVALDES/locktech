export type VehicleStatus = "active" | "maintenance" | "retired";

export interface Vehicle {
  id: string;
  tenantId: string;
  traccarDeviceId: number;
  plateNumber: string;
  model: string | null;
  status: VehicleStatus;
  createdAt: string;
}

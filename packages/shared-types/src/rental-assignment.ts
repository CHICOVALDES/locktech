export type RentalAssignmentStatus = "active" | "completed" | "cancelled";

export interface RentalAssignment {
  id: string;
  tenantId: string;
  vehicleId: string;
  customerId: string;
  startAt: string;
  endAt: string | null;
  status: RentalAssignmentStatus;
}

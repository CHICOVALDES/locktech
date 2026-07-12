export interface GeofencePolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Geofence {
  id: string;
  tenantId: string;
  name: string;
  polygon: GeofencePolygon;
  createdAt: string;
}

export type TransitMode = 'bus' | 'rapid' | 'rail';

export type VehicleStatus = 'on_time' | 'approaching' | 'delayed' | 'scheduled';

export type OccupancyLevel = 'low' | 'moderate' | 'high' | 'crowded';

export interface Station {
  id: string;
  code: string;
  name: string;
  zone: string;
  coords: { x: number; y: number; lat: number; lng: number };
  routesServed: string[];
  isTransfer: boolean;
  wheelchairAccessible: boolean;
  bikeRack: boolean;
  fareZone: string;
}

export interface RoutePathPoint {
  x: number;
  y: number;
}

export interface Route {
  id: string;
  code: string;
  name: string;
  mode: TransitMode;
  color: string;
  badgeTextColor: string;
  directionA: string;
  directionB: string;
  frequencyMin: number;
  pathPoints: RoutePathPoint[];
  stationIds: string[];
  description: string;
  fare: string;
  operatingHours: string;
}

export interface VehicleTelemetry {
  id: string;
  vehicleNumber: string;
  routeId: string;
  routeCode: string;
  mode: TransitMode;
  currentCoord: { x: number; y: number };
  headingAngle: number; // degrees 0-360
  speedMph: number;
  direction: string;
  nextStopId: string;
  nextStopName: string;
  occupancyPercent: number;
  occupancyStatus: OccupancyLevel;
  status: VehicleStatus;
  delayMinutes: number;
  pathProgress: number; // 0 to 1 along the line
  driverId: string;
}

export interface Arrival {
  id: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  mode: TransitMode;
  color: string;
  destination: string;
  direction: string;
  stationId: string;
  stationName: string;
  platform: string;
  etaSeconds: number; // dynamic countdown
  status: VehicleStatus;
  delayMinutes: number;
  vehicleId: string;
  wheelchairAccessible: boolean;
  bikeRack: boolean;
}

export interface TransitAlert {
  id: string;
  routeIds: string[];
  severity: 'advisory' | 'warning' | 'severe';
  title: string;
  description: string;
  time: string;
  impactedStops: string[];
}

export interface TripItinerary {
  originStation: Station;
  destinationStation: Station;
  totalDurationMin: number;
  transfersCount: number;
  fare: string;
  carbonSavedKg: number;
  departureTime: string;
  arrivalTime: string;
  legs: {
    routeId?: string;
    routeCode?: string;
    mode: TransitMode | 'walk';
    color?: string;
    instruction: string;
    durationMin: number;
    fromStop: string;
    toStop: string;
    stopsCount?: number;
  }[];
}

export interface LTABus {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: 'SEA' | 'SDA' | 'LSD' | string; // Seats Available, Standing Available, Limited Standing
  Feature: 'WAB' | string; // Wheelchair Accessible
  Type: 'SD' | 'DD' | 'BD' | string; // Single Deck, Double Deck, Bendy
}

export interface LTAService {
  ServiceNo: string;
  Operator: string;
  NextBus?: LTABus;
  NextBus2?: LTABus;
  NextBus3?: LTABus;
}

export interface LTABusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: LTAService[];
  dataSource?: 'lta_datamall' | 'demo_fallback' | 'lta_datamall_error' | 'network_error';
  timestamp?: string;
  message?: string;
  error?: string;
}

export interface APIHealthResponse {
  status: string;
  timestamp: string;
  service: string;
  environment: string;
  ltaKeyConfigured: boolean;
  uptimeSeconds: number | null;
}

/**
 * Fetch bus arrival data from the proxy endpoint /api/bus-arrival
 */
export async function fetchLTABusArrival(
  busStopCode: string = '04121',
  serviceNo?: string
): Promise<LTABusArrivalResponse> {
  const url = new URL('/api/bus-arrival', window.location.origin);
  url.searchParams.set('BusStopCode', busStopCode.trim());
  if (serviceNo && serviceNo.trim()) {
    url.searchParams.set('ServiceNo', serviceNo.trim());
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API returned HTTP ${res.status}: ${errText}`);
  }

  return res.json();
}

/**
 * Check health status of the API gateway /api/health
 */
export async function checkAPIHealth(): Promise<APIHealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Utility to compute arrival minutes from ISO string
 */
export function getMinutesUntilArrival(isoDateString?: string): { minutes: number; isNow: boolean; isPassed: boolean; display: string } {
  if (!isoDateString) {
    return { minutes: -1, isNow: false, isPassed: true, display: 'N/A' };
  }

  const arrivalMs = new Date(isoDateString).getTime();
  const nowMs = Date.now();
  const diffSec = Math.round((arrivalMs - nowMs) / 1000);

  if (diffSec < -60) {
    return { minutes: -1, isNow: false, isPassed: true, display: 'Departed' };
  }
  if (diffSec <= 45) {
    return { minutes: 0, isNow: true, isPassed: false, display: 'Arr' };
  }

  const min = Math.max(1, Math.round(diffSec / 60));
  return { minutes: min, isNow: false, isPassed: false, display: `${min} min` };
}

/**
 * Utility to describe LTA bus load
 */
export function getLoadDescription(loadCode?: string): { label: string; color: string; badgeBg: string } {
  switch (loadCode) {
    case 'SEA':
      return { label: 'Seats Avail', color: '#10B981', badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    case 'SDA':
      return { label: 'Standing Avail', color: '#F59E0B', badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    case 'LSD':
      return { label: 'Limited Standing', color: '#EF4444', badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30' };
    default:
      return { label: 'Nominal', color: '#94A3B8', badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  }
}

/**
 * Utility to describe LTA bus vehicle type
 */
export function getBusTypeDescription(typeCode?: string): string {
  switch (typeCode) {
    case 'DD':
      return 'Double Deck';
    case 'BD':
      return 'Bendy';
    case 'SD':
    default:
      return 'Single Deck';
  }
}

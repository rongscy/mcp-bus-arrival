import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Station, Route, VehicleTelemetry, TransitAlert, TransitMode, Arrival } from '../types/transit';
import { STATIONS, ROUTES, INITIAL_VEHICLES, TRANSIT_ALERTS } from '../data/transitNetwork';
import { transitAudio } from '../utils/audio';

interface TransitContextType {
  stations: Station[];
  routes: Route[];
  vehicles: VehicleTelemetry[];
  alerts: TransitAlert[];
  selectedStation: Station;
  setSelectedStationId: (id: string) => void;
  selectedVehicle: VehicleTelemetry | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedRoute: Route;
  setSelectedRouteId: (id: string) => void;
  activeTab: 'radar' | 'map' | 'lines' | 'planner' | 'alerts';
  setActiveTab: (tab: 'radar' | 'map' | 'lines' | 'planner' | 'alerts') => void;
  modeFilter: TransitMode | 'all';
  setModeFilter: (mode: TransitMode | 'all') => void;
  accessibilityFilter: boolean;
  setAccessibilityFilter: (val: boolean) => void;
  bikeFilter: boolean;
  setBikeFilter: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  simSpeed: number;
  setSimSpeed: (speed: number) => void;
  userCoords: { lat: number; lng: number; name: string } | null;
  isLocatingUser: boolean;
  locateUser: () => void;
  favoriteStationIds: string[];
  toggleFavoriteStation: (id: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  triggerSimulatedDelay: () => void;
  stationArrivals: Arrival[];
  allLiveArrivals: Arrival[];
}

const TransitContext = createContext<TransitContextType | null>(null);

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations] = useState<Station[]>(STATIONS);
  const [routes] = useState<Route[]>(ROUTES);
  const [vehicles, setVehicles] = useState<VehicleTelemetry[]>(INITIAL_VEHICLES);
  const [alerts, setAlerts] = useState<TransitAlert[]>(TRANSIT_ALERTS);

  const [selectedStationId, setSelectedStationId] = useState<string>('ST-01');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('CYAN-L');
  const [activeTab, setActiveTab] = useState<'radar' | 'map' | 'lines' | 'planner' | 'alerts'>('radar');

  const [modeFilter, setModeFilter] = useState<TransitMode | 'all'>('all');
  const [accessibilityFilter, setAccessibilityFilter] = useState<boolean>(false);
  const [bikeFilter, setBikeFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);

  // Favorites in localStorage
  const [favoriteStationIds, setFavoriteStationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('metropulse_fav_stations');
      return saved ? JSON.parse(saved) : ['ST-01', 'ST-06'];
    } catch {
      return ['ST-01', 'ST-06'];
    }
  });

  const toggleFavoriteStation = useCallback((id: string) => {
    setFavoriteStationIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('metropulse_fav_stations', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    const newState = transitAudio.toggleSound();
    setSoundEnabled(newState);
  }, []);

  // Browser Geolocation integration
  const locateUser = useCallback(() => {
    setIsLocatingUser(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocatingUser(false);
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'Current Device Location',
          });
          // Pick closest station by Euclidean distance approximation
          let closestId = 'ST-01';
          let minDistance = Infinity;
          STATIONS.forEach(st => {
            const dLat = (st.coords.lat - pos.coords.latitude);
            const dLng = (st.coords.lng - pos.coords.longitude);
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < minDistance) {
              minDistance = dist;
              closestId = st.id;
            }
          });
          setSelectedStationId(closestId);
        },
        () => {
          // Fallback location near Midtown Grand Terminal
          setIsLocatingUser(false);
          setUserCoords({
            lat: 40.7527,
            lng: -73.9772,
            name: 'Central Midtown GPS',
          });
          setSelectedStationId('ST-01');
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setIsLocatingUser(false);
      setUserCoords({
        lat: 40.7527,
        lng: -73.9772,
        name: 'Central Midtown GPS',
      });
      setSelectedStationId('ST-01');
    }
  }, []);

  // Trigger simulated traffic incident
  const triggerSimulatedDelay = useCallback(() => {
    setVehicles(prev =>
      prev.map(v => {
        if (v.routeId === 'M15-SBS' || v.routeId === '72-CROSS') {
          return {
            ...v,
            status: 'delayed',
            delayMinutes: Math.min(v.delayMinutes + 3, 9),
            speedMph: Math.max(10, v.speedMph - 8),
          };
        }
        return v;
      })
    );
    setAlerts(prev => [
      {
        id: `ALT-SIM-${Date.now()}`,
        routeIds: ['M15-SBS', '72-CROSS'],
        severity: 'warning',
        title: 'Live Simulated Congestion Wave: Downtown Signal Priority Active',
        description: 'Buses experiencing 3-6 minute delays. Dispatch priority algorithms have extended green lights.',
        time: 'Just now',
        impactedStops: ['ST-01', 'ST-02', 'ST-06'],
      },
      ...prev,
    ]);
  }, []);

  // Main simulation tick: vehicle movement along polyline
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMs = 1000 / simSpeed;
    const timer = setInterval(() => {
      setVehicles(prevVehicles =>
        prevVehicles.map(v => {
          const route = ROUTES.find(r => r.id === v.routeId);
          if (!route || route.pathPoints.length < 2) return v;

          // Advance progress along route
          const step = (0.0035 * (v.speedMph / 35)) * simSpeed;
          let newProgress = v.pathProgress + step;
          if (newProgress >= 1) {
            newProgress = 0.02; // loop back
          }

          // Compute interpolated coordinate
          const totalSegments = route.pathPoints.length - 1;
          const scaledPos = newProgress * totalSegments;
          const segIndex = Math.min(Math.floor(scaledPos), totalSegments - 1);
          const segProgress = scaledPos - segIndex;

          const p1 = route.pathPoints[segIndex];
          const p2 = route.pathPoints[segIndex + 1] || p1;

          const currentX = p1.x + (p2.x - p1.x) * segProgress;
          const currentY = p1.y + (p2.y - p1.y) * segProgress;

          // Compute heading angle
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const heading = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

          // Update upcoming stop
          const stopIndex = Math.min(
            Math.floor(newProgress * route.stationIds.length),
            route.stationIds.length - 1
          );
          const nextStopId = route.stationIds[stopIndex];
          const nextStation = STATIONS.find(s => s.id === nextStopId);

          // Slight fluctuation in speed and occupancy for organic realism
          const speedDelta = (Math.random() - 0.5) * 1.5;
          const updatedSpeed = Math.round(Math.max(12, Math.min(65, v.speedMph + speedDelta)));

          return {
            ...v,
            currentCoord: { x: Math.round(currentX), y: Math.round(currentY) },
            headingAngle: heading,
            pathProgress: newProgress,
            nextStopId,
            nextStopName: nextStation ? nextStation.name : v.nextStopName,
            speedMph: updatedSpeed,
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimulating, simSpeed]);

  // Derived selected Station
  const selectedStation = useMemo(() => {
    return STATIONS.find(s => s.id === selectedStationId) || STATIONS[0];
  }, [selectedStationId]);

  // Derived selected Vehicle
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Derived selected Route
  const selectedRoute = useMemo(() => {
    return ROUTES.find(r => r.id === selectedRouteId) || ROUTES[0];
  }, [selectedRouteId]);

  // Dynamic Arrival Countdown calculation
  // Computes precise real-time countdown arrivals for any station based on vehicle positions & line schedules
  const allLiveArrivals = useMemo(() => {
    const list: Arrival[] = [];

    STATIONS.forEach(station => {
      station.routesServed.forEach(routeCode => {
        const route = ROUTES.find(r => r.code === routeCode || r.id === routeCode);
        if (!route) return;

        // Check if there is an active vehicle on this route heading towards this station
        const routeVehicles = vehicles.filter(v => v.routeId === route.id);
        
        routeVehicles.forEach((v, idx) => {
          // Station index on route
          const stIndex = route.stationIds.indexOf(station.id);
          if (stIndex === -1) return;

          // Distance estimate along progress
          const stationProgress = stIndex / Math.max(1, route.stationIds.length - 1);
          let progressDiff = stationProgress - v.pathProgress;
          if (progressDiff < 0) {
            progressDiff += 1.0; // Next cycle
          }

          // Convert progress diff to ETA seconds (e.g. 1.0 = ~route frequency * 60)
          const etaSec = Math.max(
            15,
            Math.round(progressDiff * (route.frequencyMin * 60) + (v.delayMinutes * 60))
          );

          let status: 'on_time' | 'approaching' | 'delayed' | 'scheduled' = 'on_time';
          if (v.status === 'delayed') {
            status = 'delayed';
          } else if (etaSec <= 120) {
            status = 'approaching';
          }

          list.push({
            id: `arr-${station.id}-${route.id}-${v.id}-${idx}`,
            routeId: route.id,
            routeCode: route.code,
            routeName: route.name,
            mode: route.mode,
            color: route.color,
            destination: v.direction.includes('North') || v.direction.includes('East') ? route.directionA : route.directionB,
            direction: v.direction,
            stationId: station.id,
            stationName: station.name,
            platform: `Platform ${((stIndex % 3) + 1)}`,
            etaSeconds: etaSec,
            status,
            delayMinutes: v.delayMinutes,
            vehicleId: v.vehicleNumber,
            wheelchairAccessible: station.wheelchairAccessible,
            bikeRack: station.bikeRack,
          });
        });

        // Add a scheduled backup arrival if fewer than 2 active arrivals
        if (routeVehicles.length === 0 || list.filter(a => a.stationId === station.id && a.routeId === route.id).length < 2) {
          list.push({
            id: `arr-${station.id}-${route.id}-sched`,
            routeId: route.id,
            routeCode: route.code,
            routeName: route.name,
            mode: route.mode,
            color: route.color,
            destination: route.directionA,
            direction: route.directionA,
            stationId: station.id,
            stationName: station.name,
            platform: 'Bay 2',
            etaSeconds: route.frequencyMin * 60 + 180,
            status: 'scheduled',
            delayMinutes: 0,
            vehicleId: '#SCHED',
            wheelchairAccessible: true,
            bikeRack: true,
          });
        }
      });
    });

    return list;
  }, [vehicles]);

  // Filtered arrivals for the selected station
  const stationArrivals = useMemo(() => {
    let arrs = allLiveArrivals.filter(a => a.stationId === selectedStation.id);

    if (modeFilter !== 'all') {
      arrs = arrs.filter(a => a.mode === modeFilter);
    }
    if (accessibilityFilter) {
      arrs = arrs.filter(a => a.wheelchairAccessible);
    }
    if (bikeFilter) {
      arrs = arrs.filter(a => a.bikeRack);
    }

    // Sort by ETA ascending
    return arrs.sort((a, b) => a.etaSeconds - b.etaSeconds);
  }, [allLiveArrivals, selectedStation.id, modeFilter, accessibilityFilter, bikeFilter]);

  return (
    <TransitContext.Provider
      value={{
        stations,
        routes,
        vehicles,
        alerts,
        selectedStation,
        setSelectedStationId,
        selectedVehicle,
        setSelectedVehicleId,
        selectedRoute,
        setSelectedRouteId,
        activeTab,
        setActiveTab,
        modeFilter,
        setModeFilter,
        accessibilityFilter,
        setAccessibilityFilter,
        bikeFilter,
        setBikeFilter,
        searchQuery,
        setSearchQuery,
        isSimulating,
        setIsSimulating,
        simSpeed,
        setSimSpeed,
        userCoords,
        isLocatingUser,
        locateUser,
        favoriteStationIds,
        toggleFavoriteStation,
        soundEnabled,
        toggleSound,
        triggerSimulatedDelay,
        stationArrivals,
        allLiveArrivals,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
};

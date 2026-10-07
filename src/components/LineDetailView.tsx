import React from 'react';
import { Clock, DollarSign, Activity, Users, ArrowRight, MapPin, Gauge } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { RouteBadge } from './RouteBadge';
import { StatusIndicator } from './StatusIndicator';

export const LineDetailView: React.FC = () => {
  const {
    routes,
    selectedRoute,
    setSelectedRouteId,
    stations,
    setSelectedStationId,
    vehicles,
    setSelectedVehicleId,
    setActiveTab,
  } = useTransit();

  // Active vehicles on this route
  const lineVehicles = vehicles.filter(v => v.routeId === selectedRoute.id);

  // Stations on this route
  const lineStations = selectedRoute.stationIds
    .map(stId => stations.find(s => s.id === stId))
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-5">
      {/* 1. ROUTE SWITCHER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {routes.map(r => {
          const isSelected = selectedRoute.id === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRouteId(r.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-display transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-white text-[#090D16] border-white shadow-md'
                  : 'bg-white/[0.04] text-[#94A3B8] border-white/10 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {r.code}
            </button>
          );
        })}
      </div>

      {/* 2. ROUTE BANNER & SPECS */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <RouteBadge
              code={selectedRoute.code}
              mode={selectedRoute.mode}
              color={selectedRoute.color}
              size="lg"
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F8FAFC]">
                {selectedRoute.name}
              </h2>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                {selectedRoute.directionA} ↔ {selectedRoute.directionB}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className="px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#4cd7f6] hover:bg-[#06B6D4]/25 text-xs font-semibold font-display transition-colors cursor-pointer"
          >
            Track Route on Map
          </button>
        </div>

        <p className="text-sm text-[#bbcabf] mt-3 leading-relaxed">
          {selectedRoute.description}
        </p>

        {/* Technical Specification Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
          <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Frequency
            </div>
            <div className="text-sm font-bold text-[#4edea3] font-display tabular-nums mt-0.5">
              Every {selectedRoute.frequencyMin} min
            </div>
          </div>

          <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Standard Fare
            </div>
            <div className="text-sm font-bold text-[#F8FAFC] font-display tabular-nums mt-0.5">
              {selectedRoute.fare}
            </div>
          </div>

          <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Operating Hours
            </div>
            <div className="text-xs font-semibold text-[#F8FAFC] mt-1 truncate">
              {selectedRoute.operatingHours}
            </div>
          </div>

          <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Active Vehicles
            </div>
            <div className="text-sm font-bold text-[#4cd7f6] font-display tabular-nums mt-0.5">
              {lineVehicles.length} Units Online
            </div>
          </div>
        </div>
      </div>

      {/* 3. SCHEMATIC LINE STRIP MAP */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#F8FAFC]">
            Station-by-Station Strip Map
          </h3>
          <span className="text-xs text-[#94A3B8]">
            {lineStations.length} Stations in Order
          </span>
        </div>

        <div className="relative pl-6 space-y-5">
          {/* Vertical Backbone Track Line */}
          <div
            className="absolute left-[11px] top-3 bottom-3 w-1 rounded-full"
            style={{ backgroundColor: selectedRoute.color }}
          />

          {lineStations.map((station, index) => {
            if (!station) return null;
            // Check if any vehicle is currently approaching this station
            const approachingVeh = lineVehicles.find(v => v.nextStopId === station.id);

            return (
              <div
                key={station.id}
                onClick={() => {
                  setSelectedStationId(station.id);
                  setActiveTab('radar');
                }}
                className="group relative flex items-start justify-between p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                {/* Station Node Marker on Track */}
                <div
                  className="absolute -left-6 top-3.5 w-3.5 h-3.5 rounded-full border-2 border-[#090D16] bg-white group-hover:scale-125 transition-transform"
                  style={{
                    boxShadow: `0 0 0 2px ${selectedRoute.color}`,
                  }}
                />

                <div className="ml-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#4edea3] transition-colors">
                      {station.name}
                    </span>
                    {station.isTransfer && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-white/10 text-white/90">
                        Transfer
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">
                    {station.zone} · Zone {station.fareZone}
                  </div>

                  {/* Transfer Line Badges */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {station.routesServed
                      .filter(rc => rc !== selectedRoute.code)
                      .map(rc => (
                        <span
                          key={rc}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#dae2fd]"
                        >
                          {rc}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Approaching Vehicle Tag if live nearby */}
                {approachingVeh && (
                  <div className="flex items-center gap-2 bg-[#10B981]/15 border border-[#10B981]/40 px-2.5 py-1 rounded-lg shrink-0">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#4edea3]">
                      {approachingVeh.vehicleNumber}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE LINE FLEET TELEMETRY TABLE */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-5 shadow-lg">
        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#F8FAFC] mb-3">
          Active Fleet Telemetry
        </h3>

        {lineVehicles.length === 0 ? (
          <div className="text-xs text-[#94A3B8] py-4 text-center">
            No live vehicles currently reporting on this route.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#94A3B8]">
                  <th className="py-2.5 px-3 font-semibold">Vehicle</th>
                  <th className="py-2.5 px-3 font-semibold">Direction</th>
                  <th className="py-2.5 px-3 font-semibold">Speed</th>
                  <th className="py-2.5 px-3 font-semibold">Occupancy</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {lineVehicles.map(veh => (
                  <tr key={veh.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#F8FAFC]">
                      {veh.vehicleNumber}
                    </td>
                    <td className="py-3 px-3 text-[#dae2fd] max-w-[150px] truncate">
                      {veh.direction}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-[#4cd7f6]">
                      {veh.speedMph} mph
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono tabular-nums text-white/90">
                        {veh.occupancyPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusIndicator
                        status={veh.status}
                        delayMinutes={veh.delayMinutes}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVehicleId(veh.id);
                          setActiveTab('map');
                        }}
                        className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-[#4edea3]/20 hover:text-[#4edea3] text-white font-medium transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

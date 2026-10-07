import React from 'react';
import { Star, MapPin, Radio, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { SearchAndFilters } from './SearchAndFilters';
import { ArrivalCard } from './ArrivalCard';
import { RouteBadge } from './RouteBadge';

export const LiveRadarView: React.FC = () => {
  const {
    selectedStation,
    stationArrivals,
    setSelectedVehicleId,
    setSelectedRouteId,
    setActiveTab,
    favoriteStationIds,
    toggleFavoriteStation,
    triggerSimulatedDelay,
    routes,
  } = useTransit();

  const isFavorite = favoriteStationIds.includes(selectedStation.id);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* 1. SEARCH & FILTERS MODULE */}
      <SearchAndFilters />

      {/* 2. SELECTED STATION HERO CARD */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <MapPin className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>{selectedStation.zone}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{selectedStation.code}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedStation.fareZone}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F8FAFC] tracking-tight mt-1">
              {selectedStation.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => toggleFavoriteStation(selectedStation.id)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              isFavorite
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                : 'bg-white/[0.03] border-white/10 text-[#94A3B8] hover:text-white'
            }`}
            title={isFavorite ? 'Remove from favorite hubs' : 'Pin to favorite hubs'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Lines served by this station */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#64748B] font-medium mr-1">Lines:</span>
            {selectedStation.routesServed.map(routeCode => {
              const r = routes.find(route => route.code === routeCode || route.id === routeCode);
              return (
                <button
                  key={routeCode}
                  type="button"
                  onClick={() => {
                    if (r) {
                      setSelectedRouteId(r.id);
                      setActiveTab('lines');
                    }
                  }}
                  className="transition-transform active:scale-95 cursor-pointer"
                >
                  <RouteBadge
                    code={routeCode}
                    mode={r?.mode}
                    color={r?.color}
                    size="sm"
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span>Live Telemetry Active</span>
          </div>
        </div>
      </div>

      {/* 3. LIVE UPCOMING ARRIVALS HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[#F8FAFC]">
            Upcoming Arrivals
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#94A3B8]">
            {stationArrivals.length}
          </span>
        </div>

        <button
          type="button"
          onClick={triggerSimulatedDelay}
          className="text-xs text-[#4cd7f6] hover:text-[#acedff] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          title="Simulate temporary transit delay to view real-time countdown recalculation"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simulate Delay</span>
        </button>
      </div>

      {/* 4. ARRIVAL CARDS FEED */}
      <div className="space-y-3">
        {stationArrivals.length === 0 ? (
          <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
            <div className="text-base font-semibold text-[#F8FAFC]">No matching arrivals</div>
            <div className="text-xs text-[#94A3B8] mt-1">
              Try adjusting your mode or accessibility filters above.
            </div>
          </div>
        ) : (
          stationArrivals.map(arr => (
            <ArrivalCard
              key={arr.id}
              arrival={arr}
              onSelectOnMap={(a) => {
                const veh = a.vehicleId.startsWith('#')
                  ? a.vehicleId
                  : undefined;
                if (veh) {
                  // highlight vehicle
                }
                setActiveTab('map');
              }}
              onSelectLine={(routeId) => {
                setSelectedRouteId(routeId);
                setActiveTab('lines');
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

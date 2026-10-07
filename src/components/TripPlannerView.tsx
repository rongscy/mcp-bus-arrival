import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Navigation, Clock, DollarSign, Leaf, MapPin, Footprints, Train, ArrowRight } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { RouteBadge } from './RouteBadge';
import { Station } from '../types/transit';

export const TripPlannerView: React.FC = () => {
  const { stations, routes, setActiveTab, setSelectedStationId } = useTransit();

  const [originId, setOriginId] = useState<string>('ST-01'); // Central Grand Terminal
  const [destId, setDestId] = useState<string>('ST-17'); // International Airport

  const originStation = stations.find(s => s.id === originId) || stations[0];
  const destStation = stations.find(s => s.id === destId) || stations[1];

  const handleSwap = () => {
    setOriginId(destId);
    setDestId(originId);
  };

  // Compute calculated trip itinerary
  const itinerary = useMemo(() => {
    if (originId === destId) return null;

    // Direct route check
    const directRoute = routes.find(
      r => r.stationIds.includes(originId) && r.stationIds.includes(destId)
    );

    const now = new Date();
    const departStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (directRoute) {
      const idxA = directRoute.stationIds.indexOf(originId);
      const idxB = directRoute.stationIds.indexOf(destId);
      const stopsCount = Math.abs(idxB - idxA);
      const durationMin = stopsCount * 3 + 4; // ~3 min per station + wait
      const arrivalDate = new Date(now.getTime() + durationMin * 60000);
      const arrivalStr = arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        totalDurationMin: durationMin,
        transfers: 0,
        fare: directRoute.fare,
        carbonSavedKg: Number((stopsCount * 0.35 + 0.4).toFixed(1)),
        departureTime: departStr,
        arrivalTime: arrivalStr,
        legs: [
          {
            type: 'walk',
            instruction: `Walk to ${originStation.name} Platform`,
            durationMin: 2,
          },
          {
            type: 'transit',
            route: directRoute,
            from: originStation.name,
            to: destStation.name,
            stopsCount,
            durationMin: durationMin - 4,
          },
          {
            type: 'walk',
            instruction: `Arrive at ${destStation.name} - Concourse Exit`,
            durationMin: 2,
          },
        ],
      };
    } else {
      // 1 transfer route via Central Terminal or Midtown
      const transferStation =
        stations.find(s => s.id === 'ST-01' || s.id === 'ST-06') || stations[0];
      const leg1Route =
        routes.find(r => r.stationIds.includes(originId) && r.stationIds.includes(transferStation.id)) ||
        routes[0];
      const leg2Route =
        routes.find(r => r.stationIds.includes(transferStation.id) && r.stationIds.includes(destId)) ||
        routes[1];

      const durationMin = 26;
      const arrivalDate = new Date(now.getTime() + durationMin * 60000);
      const arrivalStr = arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        totalDurationMin: durationMin,
        transfers: 1,
        fare: '$2.90 (Free Transfer)',
        carbonSavedKg: 2.1,
        departureTime: departStr,
        arrivalTime: arrivalStr,
        legs: [
          {
            type: 'walk',
            instruction: `Enter ${originStation.name}`,
            durationMin: 2,
          },
          {
            type: 'transit',
            route: leg1Route,
            from: originStation.name,
            to: transferStation.name,
            stopsCount: 3,
            durationMin: 11,
          },
          {
            type: 'transfer',
            instruction: `Transfer at ${transferStation.name} (Cross-Platform Connection)`,
            durationMin: 3,
          },
          {
            type: 'transit',
            route: leg2Route,
            from: transferStation.name,
            to: destStation.name,
            stopsCount: 4,
            durationMin: 8,
          },
          {
            type: 'walk',
            instruction: `Arrive at ${destStation.name}`,
            durationMin: 2,
          },
        ],
      };
    }
  }, [originId, destId, routes, originStation, destStation, stations]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-5">
      {/* 1. ORIGIN & DESTINATION SELECTOR */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-5 shadow-lg space-y-3">
        <h2 className="text-base font-bold font-display uppercase tracking-wider text-[#F8FAFC]">
          Optimal Transit Navigator
        </h2>

        <div className="space-y-2 relative">
          {/* Origin Input */}
          <div className="flex items-center gap-2.5 bg-[#171f33] border border-white/10 rounded-xl px-3.5 py-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] uppercase font-semibold text-[#94A3B8] block">Origin</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {stations.map(st => (
                  <option key={`orig-${st.id}`} value={st.id} className="bg-[#171f33] text-white">
                    {st.name} ({st.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button in center */}
          <button
            type="button"
            onClick={handleSwap}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[#222a3d] border border-white/15 text-[#dae2fd] hover:text-[#4edea3] hover:border-[#4edea3]/40 shadow-lg transition-transform active:rotate-180 cursor-pointer"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Destination Input */}
          <div className="flex items-center gap-2.5 bg-[#171f33] border border-white/10 rounded-xl px-3.5 py-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6] shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] uppercase font-semibold text-[#94A3B8] block">Destination</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {stations.map(st => (
                  <option key={`dest-${st.id}`} value={st.id} className="bg-[#171f33] text-white">
                    {st.name} ({st.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ITINERARY RESULTS */}
      {itinerary && (
        <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-5 shadow-lg space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Total Time</div>
              <div className="text-lg font-bold font-display text-[#4edea3] tabular-nums mt-0.5">
                {itinerary.totalDurationMin} min
              </div>
            </div>

            <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Schedule</div>
              <div className="text-sm font-bold text-[#F8FAFC] tabular-nums mt-0.5">
                {itinerary.departureTime} → {itinerary.arrivalTime}
              </div>
            </div>

            <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Estimated Fare</div>
              <div className="text-sm font-bold text-[#4cd7f6] font-display tabular-nums mt-0.5">
                {itinerary.fare}
              </div>
            </div>

            <div className="bg-[#171f33]/80 rounded-lg p-2.5 border border-white/5">
              <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Carbon Saved</div>
              <div className="text-sm font-bold text-[#10B981] font-display tabular-nums mt-0.5 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>{itinerary.carbonSavedKg} kg CO₂</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Directions Timeline */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
              Route Directions
            </h3>

            <div className="space-y-4 relative pl-6 border-l-2 border-white/10 ml-2">
              {itinerary.legs.map((leg, idx) => (
                <div key={idx} className="relative">
                  {/* Node icon on line */}
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#171f33] border-2 border-white/40 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                  </div>

                  {leg.type === 'walk' && (
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <div className="flex items-center gap-2">
                        <Footprints className="w-3.5 h-3.5 text-white/50" />
                        <span>{leg.instruction}</span>
                      </div>
                      <span className="font-mono text-[11px]">{leg.durationMin} min</span>
                    </div>
                  )}

                  {leg.type === 'transfer' && (
                    <div className="p-2.5 rounded-lg bg-[#222a3d] border border-white/10 text-xs">
                      <div className="font-semibold text-amber-400">
                        {leg.instruction}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] mt-0.5">
                        Follow signpost markings on level concourse. Transfer window ~{leg.durationMin} mins.
                      </div>
                    </div>
                  )}

                  {leg.type === 'transit' && leg.route && (
                    <div className="p-3 rounded-lg bg-[#171f33] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RouteBadge
                            code={leg.route.code}
                            mode={leg.route.mode}
                            color={leg.route.color}
                            size="sm"
                          />
                          <span className="text-xs font-semibold text-[#F8FAFC]">
                            {leg.route.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#4edea3]">
                          {leg.durationMin} min
                        </span>
                      </div>

                      <div className="text-xs text-[#94A3B8] pl-1">
                        Board at <strong className="text-white">{leg.from}</strong> → Ride {leg.stopsCount} stops → Alight at <strong className="text-white">{leg.to}</strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedStationId(originId);
              setActiveTab('map');
            }}
            className="w-full py-2.5 rounded-lg bg-[#4edea3] hover:bg-[#6ffbbe] text-[#090D16] font-bold font-display text-xs transition-colors cursor-pointer"
          >
            Track Route on Live Map
          </button>
        </div>
      )}
    </div>
  );
};

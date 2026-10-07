import React from 'react';
import { X, Gauge, Users, Compass, ShieldCheck, MapPin, Radio, AlertTriangle } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { RouteBadge } from './RouteBadge';
import { StatusIndicator } from './StatusIndicator';

export const VehicleTelemetryDrawer: React.FC = () => {
  const { selectedVehicle, setSelectedVehicleId, routes, stations, setSelectedStationId } = useTransit();

  if (!selectedVehicle) return null;

  const route = routes.find(r => r.id === selectedVehicle.routeId);

  // Compute upcoming stops on this route
  const upcomingStops = route
    ? route.stationIds.map((stId, index) => {
        const station = stations.find(s => s.id === stId);
        const isCurrentTarget = selectedVehicle.nextStopId === stId;
        return {
          station,
          index,
          isCurrentTarget,
        };
      })
    : [];

  // Occupancy color
  const occupancyColor =
    selectedVehicle.occupancyPercent > 80
      ? 'bg-[#EF4444]'
      : selectedVehicle.occupancyPercent > 50
      ? 'bg-[#F59E0B]'
      : 'bg-[#10B981]';

  return (
    <div className="absolute bottom-4 right-4 z-30 w-84 sm:w-96 bg-[#171f33]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
      {/* Header with Route Badge & Vehicle Number */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <RouteBadge
            code={selectedVehicle.routeCode}
            mode={selectedVehicle.mode}
            color={route?.color}
            size="md"
          />
          <div>
            <div className="text-sm font-bold text-[#F8FAFC] font-display flex items-center gap-1.5">
              <span>{selectedVehicle.vehicleNumber}</span>
              <span className="text-[11px] font-mono text-[#4cd7f6] px-1.5 py-0.2 rounded bg-[#06B6D4]/15">
                LIVE GPS
              </span>
            </div>
            <div className="text-[11px] text-[#94A3B8] truncate max-w-[190px]">
              {selectedVehicle.direction}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedVehicleId(null)}
          className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 my-3">
        {/* Speedometer */}
        <div className="bg-[#0F172A]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#06B6D4]/15 text-[#4cd7f6]">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Telemetry Speed
            </div>
            <div className="text-base font-bold text-[#F8FAFC] font-display tabular-nums">
              {selectedVehicle.speedMph} <span className="text-xs font-normal text-[#94A3B8]">mph</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#0F172A]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#10B981]/15 text-[#10B981]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-semibold">
              Service Status
            </div>
            <div className="mt-0.5">
              <StatusIndicator
                status={selectedVehicle.status}
                delayMinutes={selectedVehicle.delayMinutes}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Capacity Gauge */}
      <div className="bg-[#0F172A]/80 border border-white/5 rounded-xl p-3 my-2.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5 text-[#94A3B8]">
            <Users className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">Passenger Load</span>
          </div>
          <span className="font-mono font-bold text-[#F8FAFC] text-[11px]">
            {selectedVehicle.occupancyPercent}% ({selectedVehicle.occupancyStatus.toUpperCase()})
          </span>
        </div>
        <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${occupancyColor} transition-all duration-500`}
            style={{ width: `${selectedVehicle.occupancyPercent}%` }}
          />
        </div>
      </div>

      {/* Driver ID & Headway */}
      <div className="flex items-center justify-between text-[11px] text-[#94A3B8] px-1 py-1 border-t border-white/5">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#10B981]" />
          <span>Operator: <span className="font-mono text-white/80">{selectedVehicle.driverId}</span></span>
        </div>
        <div className="font-mono text-[#4cd7f6]">
          Heading {selectedVehicle.headingAngle}°
        </div>
      </div>

      {/* Upcoming Stop Callout */}
      <div className="mt-2.5 pt-2 border-t border-white/10">
        <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Next Approaching Stop</span>
          <span className="text-[#4edea3] text-[10px] font-bold">NEXT IN LINE</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedStationId(selectedVehicle.nextStopId);
          }}
          className="w-full text-left p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4edea3]" />
            <span className="text-xs font-semibold text-[#F8FAFC]">
              {selectedVehicle.nextStopName}
            </span>
          </div>
          <span className="text-xs font-display font-bold text-[#4edea3]">
            View Stop
          </span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Accessibility, Bike, Navigation, Bell, BellRing, Compass } from 'lucide-react';
import { Arrival } from '../types/transit';
import { RouteBadge } from './RouteBadge';
import { StatusIndicator } from './StatusIndicator';
import { transitAudio } from '../utils/audio';

interface ArrivalCardProps {
  arrival: Arrival;
  onSelectOnMap?: (arrival: Arrival) => void;
  onSelectLine?: (routeId: string) => void;
}

export const ArrivalCard: React.FC<ArrivalCardProps> = ({
  arrival,
  onSelectOnMap,
  onSelectLine,
}) => {
  const [reminded, setReminded] = useState(false);

  // Compute countdown string and imminent status
  const minutes = Math.floor(arrival.etaSeconds / 60);
  const seconds = arrival.etaSeconds % 60;
  const isImminent = arrival.etaSeconds <= 180; // Less than 3 minutes
  const isNow = arrival.etaSeconds <= 35;

  let countdownDisplay = `${minutes} min`;
  if (isNow) {
    countdownDisplay = 'NOW';
  } else if (minutes === 0) {
    countdownDisplay = `${seconds}s`;
  }

  // Scheduled absolute time approximation
  const currentTime = new Date();
  const arrivalTime = new Date(currentTime.getTime() + arrival.etaSeconds * 1000);
  const formattedTime = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleRemindClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReminded(!reminded);
    transitAudio.playArrivalChime();
  };

  return (
    <div
      onClick={() => onSelectOnMap?.(arrival)}
      className={`group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
        isImminent
          ? 'bg-[#131b2e] border-[#10B981]/30 hover:border-[#10B981]/60 shadow-[0_0_24px_-4px_rgba(16,185,129,0.18)]'
          : 'bg-[#0F172A] border-white/[0.08] hover:border-white/20 hover:bg-[#171f33]'
      }`}
    >
      {/* Imminent accent glow border on left */}
      {isImminent && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#10B981] rounded-r-full" />
      )}

      {/* LEFT ZONE: Route Badge, Headsign, Direction, Platform */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 pr-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectLine?.(arrival.routeId);
          }}
          title="View full line details & timetable"
          className="shrink-0 transition-transform active:scale-95 hover:opacity-90 cursor-pointer"
        >
          <RouteBadge
            code={arrival.routeCode}
            mode={arrival.mode}
            color={arrival.color}
            size="md"
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[16px] font-semibold text-[#F8FAFC] tracking-tight truncate">
              {arrival.destination}
            </h4>
            <span className="text-[12px] font-medium text-[#94A3B8] uppercase tracking-wider shrink-0">
              · {arrival.platform}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[13px] text-[#94A3B8] flex-wrap">
            <span className="truncate">{arrival.direction}</span>
            <span className="text-white/20">/</span>
            <span className="font-mono text-white/50 text-[11px]">{arrival.vehicleId}</span>

            {/* Accessibility & Bike Icons */}
            <div className="flex items-center gap-1.5 ml-1 text-[#64748B]">
              {arrival.wheelchairAccessible && (
                <span title="Wheelchair Accessible" className="inline-flex items-center">
                  <Accessibility className="w-3.5 h-3.5 text-[#4edea3]/80" />
                </span>
              )}
              {arrival.bikeRack && (
                <span title="Equipped with Bike Rack" className="inline-flex items-center">
                  <Bike className="w-3.5 h-3.5 text-[#4cd7f6]/80" />
                </span>
              )}
            </div>
          </div>

          {/* Operational Status indicator below */}
          <div className="mt-2 flex items-center gap-3">
            <StatusIndicator
              status={arrival.status}
              delayMinutes={arrival.delayMinutes}
            />
            <span className="text-[11px] font-mono text-[#64748B]">
              ETA {formattedTime}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT ZONE: Countdown Metric & Quick Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/[0.06] pt-3 sm:pt-0 mt-3 sm:mt-0 sm:pl-4 shrink-0 gap-1.5">
        <div className="flex items-baseline gap-1.5 sm:text-right">
          <span
            className={`font-display text-[26px] sm:text-[30px] font-bold leading-none tracking-tight tabular-nums ${
              isNow
                ? 'text-[#10B981] animate-pulse drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : isImminent
                ? 'text-[#4edea3] drop-shadow-[0_0_8px_rgba(78,222,163,0.3)]'
                : 'text-[#F8FAFC]'
            }`}
          >
            {countdownDisplay}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={handleRemindClick}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              reminded
                ? 'bg-[#10B981]/20 border-[#10B981]/50 text-[#10B981]'
                : 'bg-white/[0.04] border-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.08]'
            }`}
            title={reminded ? 'Reminder active' : 'Alert me when approaching'}
          >
            {reminded ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium hidden sm:inline">
              {reminded ? 'Alert Set' : 'Remind'}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectOnMap?.(arrival);
            }}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-[#94A3B8] hover:text-[#4cd7f6] hover:border-[#4cd7f6]/40 transition-colors"
            title="Locate live vehicle on map"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

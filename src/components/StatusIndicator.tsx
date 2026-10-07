import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { VehicleStatus } from '../types/transit';

interface StatusIndicatorProps {
  status: VehicleStatus;
  showLabel?: boolean;
  delayMinutes?: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showLabel = true,
  delayMinutes = 0,
}) => {
  if (status === 'approaching') {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-amber-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F59E0B]"></span>
        </span>
        {showLabel && (
          <span className="text-[12px] font-semibold text-[#F59E0B] tracking-wide uppercase">
            Approaching
          </span>
        )}
      </div>
    );
  }

  if (status === 'delayed') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
        {showLabel && (
          <span className="text-[12px] font-semibold text-[#EF4444] tracking-wide uppercase">
            Delayed {delayMinutes > 0 ? `+${delayMinutes}m` : ''}
          </span>
        )}
      </div>
    );
  }

  if (status === 'scheduled') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-[#64748B]" />
        {showLabel && (
          <span className="text-[12px] font-medium text-[#94A3B8] tracking-wide uppercase">
            Scheduled
          </span>
        )}
      </div>
    );
  }

  // Default: On Time
  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
      </span>
      {showLabel && (
        <span className="text-[12px] font-semibold text-[#10B981] tracking-wide uppercase">
          On Time
        </span>
      )}
    </div>
  );
};

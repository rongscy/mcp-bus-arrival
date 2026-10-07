import React from 'react';
import { TransitMode } from '../types/transit';

interface RouteBadgeProps {
  code: string;
  mode?: TransitMode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RouteBadge: React.FC<RouteBadgeProps> = ({
  code,
  mode = 'rapid',
  color,
  size = 'md',
  className = '',
}) => {
  // Determine badge styling based on mode and color
  let bgClass = 'bg-[#06B6D4] text-[#003640]'; // Default Cyan
  let customStyle: React.CSSProperties = {};

  if (color) {
    customStyle = {
      backgroundColor: color,
      color: ['#10B981', '#34D399', '#06B6D4', '#38BDF8', '#4EDEA3'].includes(color.toUpperCase())
        ? '#00281b'
        : '#ffffff',
    };
  } else {
    if (mode === 'bus') {
      bgClass = 'bg-[#10B981] text-[#003824]';
    } else if (mode === 'rail') {
      bgClass = 'bg-[#6366F1] text-white';
    } else {
      bgClass = 'bg-[#06B6D4] text-[#003640]';
    }
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wider font-semibold rounded-full',
    md: 'text-[13px] px-2.5 py-1 tracking-wide font-bold rounded-full',
    lg: 'text-[15px] px-3.5 py-1.5 tracking-wider font-bold rounded-full',
  };

  return (
    <span
      style={customStyle}
      className={`inline-flex items-center justify-center font-display uppercase whitespace-nowrap shadow-sm select-none border border-white/10 ${bgClass} ${sizeClasses[size]} ${className}`}
    >
      {code}
    </span>
  );
};

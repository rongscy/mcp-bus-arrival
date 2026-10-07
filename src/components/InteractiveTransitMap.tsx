import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  MapPin,
  Navigation2,
  Crosshair,
  Bus,
  Train,
  Check,
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { Station, VehicleTelemetry, Route } from '../types/transit';

export const InteractiveTransitMap: React.FC = () => {
  const {
    stations,
    routes,
    vehicles,
    selectedStation,
    setSelectedStationId,
    selectedVehicle,
    setSelectedVehicleId,
    userCoords,
    setActiveTab,
  } = useTransit();

  // SVG Pan & Zoom state
  const [viewBox, setViewBox] = useState({ x: 180, y: 80, width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showVehicles, setShowVehicles] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<VehicleTelemetry | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const resetView = useCallback(() => {
    setViewBox({ x: 180, y: 80, width: 800, height: 600 });
  }, []);

  // Zoom by factor centered around current view center
  const handleZoom = (factor: number) => {
    setViewBox(prev => {
      const newWidth = Math.max(300, Math.min(1400, prev.width * factor));
      const newHeight = Math.max(225, Math.min(1050, prev.height * factor));
      const dx = (prev.width - newWidth) / 2;
      const dy = (prev.height - newHeight) / 2;
      return {
        x: prev.x + dx,
        y: prev.y + dy,
        width: newWidth,
        height: newHeight,
      };
    });
  };

  // Center on selected station
  const centerOnStation = useCallback((station: Station) => {
    setViewBox(prev => ({
      x: station.coords.x - prev.width / 2,
      y: station.coords.y - prev.height / 2,
      width: prev.width,
      height: prev.height,
    }));
  }, []);

  // Center on selected vehicle
  const centerOnVehicle = useCallback((veh: VehicleTelemetry) => {
    setViewBox(prev => ({
      x: veh.currentCoord.x - prev.width / 2,
      y: veh.currentCoord.y - prev.height / 2,
      width: prev.width,
      height: prev.height,
    }));
  }, []);

  // Center whenever selectedStation changes explicitly by user selection
  useEffect(() => {
    if (selectedStation) {
      centerOnStation(selectedStation);
    }
  }, [selectedStation.id]);

  // Pan event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !svgRef.current) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / svgRect.width;
    const scaleY = viewBox.height / svgRect.height;

    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx * scaleX,
      y: prev.y - dy * scaleY,
    }));
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    handleZoom(zoomFactor);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-[#090D16] overflow-hidden select-none">
      {/* MAP SVG VIEWPORT */}
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Glowing filters for transit lines */}
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Radial gradient for selected station pulse */}
          <radialGradient id="station-halo">
            <stop offset="0%" stopColor="#4edea3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. BACKGROUND CARTOGRAPHY & WATERWAYS */}
        {/* Subtle grid pattern */}
        <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={`gx-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="900" />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`gy-${i}`} x1="0" y1={i * 50} x2="1500" y2={i * 50} />
          ))}
        </g>

        {/* East River & Harbor Channel */}
        <path
          d="M 590 0 C 610 200, 640 400, 580 600 C 530 740, 480 850, 450 900 L 750 900 C 780 750, 830 500, 800 250 C 780 120, 750 0, 750 0 Z"
          fill="#08101e"
          stroke="#111c33"
          strokeWidth="1.5"
        />

        {/* Harbor basin */}
        <path
          d="M 220 500 C 260 520, 310 570, 310 650 C 310 740, 240 820, 180 900 L 400 900 C 430 820, 430 680, 380 580 Z"
          fill="#08101e"
          stroke="#111c33"
          strokeWidth="1.5"
        />

        {/* District Boundaries & Subtle Urban Zones */}
        <g opacity="0.4" pointerEvents="none">
          <text x="490" y="340" fill="#64748B" fontSize="11" fontFamily="Space Grotesk" letterSpacing="0.1em" fontWeight="600">
            DOWNTOWN CIVIC CORE
          </text>
          <text x="640" y="110" fill="#64748B" fontSize="10" fontFamily="Space Grotesk" letterSpacing="0.1em" fontWeight="600">
            TECH CORRIDOR
          </text>
          <text x="240" y="520" fill="#64748B" fontSize="10" fontFamily="Space Grotesk" letterSpacing="0.1em" fontWeight="600">
            MARITIME HARBOR
          </text>
          <text x="760" y="360" fill="#64748B" fontSize="10" fontFamily="Space Grotesk" letterSpacing="0.1em" fontWeight="600">
            EAST RIVER LOGISTICS
          </text>
          <text x="830" y="660" fill="#64748B" fontSize="10" fontFamily="Space Grotesk" letterSpacing="0.1em" fontWeight="600">
            AEROPARK & INTL AIRPORT
          </text>
        </g>

        {/* 2. TRANSIT ROUTE POLYLINES */}
        {routes.map(route => {
          // Construct SVG path points
          const pathD = route.pathPoints.reduce((acc, pt, idx) => {
            return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
          }, '');

          // Check if selected station is on this route
          const isRouteActive = route.stationIds.includes(selectedStation.id);

          return (
            <g key={route.id} className="transition-opacity duration-300">
              {/* Outer Glow Line */}
              <path
                d={pathD}
                fill="none"
                stroke={route.color}
                strokeWidth={isRouteActive ? '8' : '5'}
                strokeOpacity={isRouteActive ? '0.35' : '0.15'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Core Solid Line */}
              <path
                d={pathD}
                fill="none"
                stroke={route.color}
                strokeWidth={isRouteActive ? '4.5' : '3'}
                strokeOpacity={isRouteActive ? '0.95' : '0.6'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Directional animated flow dash for active route */}
              {isRouteActive && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="4 16"
                  strokeOpacity="0.75"
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}

        {/* 3. STATIONS / STOP NODES */}
        {showStations &&
          stations.map(station => {
            const isSelected = selectedStation.id === station.id;
            const isHovered = hoveredStation?.id === station.id;
            const servesSelectedRoute = station.routesServed.some(rc =>
              routes.find(r => r.code === rc)?.stationIds.includes(selectedStation.id)
            );

            return (
              <g
                key={station.id}
                transform={`translate(${station.coords.x}, ${station.coords.y})`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStationId(station.id);
                }}
                onMouseEnter={() => setHoveredStation(station)}
                onMouseLeave={() => setHoveredStation(null)}
              >
                {/* Expanding Halo when selected */}
                {isSelected && (
                  <circle
                    r="24"
                    fill="url(#station-halo)"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Outer halo boundary */}
                <circle
                  r={isSelected ? 14 : station.isTransfer ? 10 : 7}
                  fill="#0F172A"
                  stroke={
                    isSelected
                      ? '#4edea3'
                      : isHovered
                      ? '#4cd7f6'
                      : station.isTransfer
                      ? '#ffffff'
                      : '#64748B'
                  }
                  strokeWidth={isSelected ? 3 : station.isTransfer ? 2.5 : 1.5}
                  className="transition-all duration-200"
                />

                {/* Inner Center Node */}
                <circle
                  r={isSelected ? 6 : station.isTransfer ? 4 : 2.5}
                  fill={
                    isSelected
                      ? '#4edea3'
                      : station.isTransfer
                      ? '#dae2fd'
                      : '#334155'
                  }
                />

                {/* Transfer Station concentric ring badge */}
                {station.isTransfer && !isSelected && (
                  <circle
                    r="6.5"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                  />
                )}

                {/* Station Label */}
                {showLabels && (
                  <g transform="translate(14, 4)" pointerEvents="none">
                    <rect
                      x="-2"
                      y="-12"
                      width={station.name.length * 6.5 + 8}
                      height="16"
                      rx="3"
                      fill="#0B1326"
                      fillOpacity={isSelected ? 0.9 : 0.75}
                      stroke={isSelected ? '#4edea3' : 'rgba(255,255,255,0.08)'}
                      strokeWidth="0.8"
                    />
                    <text
                      x="2"
                      y="0"
                      fill={isSelected ? '#4edea3' : isHovered ? '#ffffff' : '#dae2fd'}
                      fontSize="10"
                      fontWeight={isSelected ? '700' : '500'}
                      fontFamily="Space Grotesk"
                      letterSpacing="0.01em"
                    >
                      {station.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

        {/* 4. LIVE VEHICLE MARKERS */}
        {showVehicles &&
          vehicles.map(veh => {
            const isVehSelected = selectedVehicle?.id === veh.id;
            const route = routes.find(r => r.id === veh.routeId);
            const vehColor = route?.color || '#06B6D4';

            return (
              <g
                key={veh.id}
                transform={`translate(${veh.currentCoord.x}, ${veh.currentCoord.y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVehicleId(veh.id);
                }}
                onMouseEnter={() => setHoveredVehicle(veh)}
                onMouseLeave={() => setHoveredVehicle(null)}
              >
                {/* Heading Direction Chevron Tail */}
                <g transform={`rotate(${veh.headingAngle})`}>
                  <polygon
                    points="0,-16 -6,-9 6,-9"
                    fill={vehColor}
                    stroke="#0B1326"
                    strokeWidth="1"
                    className="drop-shadow-md"
                  />
                </g>

                {/* Radiating pulse for approaching / live */}
                {veh.status === 'approaching' && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Pin micro-badge body */}
                <circle
                  r={isVehSelected ? 13 : 11}
                  fill="#0B1326"
                  stroke={isVehSelected ? '#ffffff' : vehColor}
                  strokeWidth={isVehSelected ? 2.5 : 2}
                  className="transition-transform active:scale-125"
                />

                {/* Vehicle Mode Icon or Short Tag inside the pin */}
                <text
                  x="0"
                  y="3.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="Space Grotesk"
                  pointerEvents="none"
                >
                  {veh.routeCode.split('-')[0]}
                </text>
              </g>
            );
          })}

        {/* 5. USER GPS LOCATION PIN */}
        {userCoords && (
          <g transform={`translate(500, 380)`} pointerEvents="none">
            <circle r="20" fill="#4cd7f6" fillOpacity="0.25" className="animate-ping" />
            <circle r="7" fill="#4cd7f6" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* FLOATING MAP TOOLBAR & CONTROLS (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <div className="bg-[#171f33]/90 backdrop-blur-md rounded-xl border border-white/10 p-1 flex flex-col shadow-xl">
          <button
            type="button"
            onClick={() => handleZoom(0.8)}
            className="p-2 text-[#dae2fd] hover:text-[#4edea3] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.25)}
            className="p-2 text-[#dae2fd] hover:text-[#4edea3] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-2 text-[#dae2fd] hover:text-[#4cd7f6] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            title="Reset Map Bounds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => centerOnStation(selectedStation)}
            className="p-2 text-[#dae2fd] hover:text-[#4edea3] hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            title="Center on Selected Station"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Layer toggle button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-2.5 bg-[#171f33]/90 backdrop-blur-md rounded-xl border border-white/10 text-[#dae2fd] hover:text-[#4cd7f6] shadow-xl transition-colors cursor-pointer"
            title="Map Layers & Overlays"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-12 w-48 bg-[#171f33] border border-white/15 rounded-xl p-2 shadow-2xl z-30">
              <div className="text-[11px] font-semibold text-[#94A3B8] px-2 py-1 uppercase tracking-wider">
                Map Layers
              </div>
              <button
                type="button"
                onClick={() => setShowVehicles(!showVehicles)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#dae2fd] hover:bg-white/[0.06] rounded-lg"
              >
                <span>Live Vehicles</span>
                {showVehicles && <Check className="w-3.5 h-3.5 text-[#4edea3]" />}
              </button>
              <button
                type="button"
                onClick={() => setShowStations(!showStations)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#dae2fd] hover:bg-white/[0.06] rounded-lg"
              >
                <span>Transit Stations</span>
                {showStations && <Check className="w-3.5 h-3.5 text-[#4edea3]" />}
              </button>
              <button
                type="button"
                onClick={() => setShowLabels(!showLabels)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#dae2fd] hover:bg-white/[0.06] rounded-lg"
              >
                <span>Station Names</span>
                {showLabels && <Check className="w-3.5 h-3.5 text-[#4edea3]" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING BOTTOM MAP METRICS OVERLAY (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-[#0F172A]/90 backdrop-blur-md rounded-xl border border-white/10 px-3.5 py-2.5 flex items-center gap-3 text-xs shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-radar-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="font-semibold text-white">GIS Telemetry</span>
          </div>
          <span className="text-white/20">|</span>
          <span className="font-mono text-[#94A3B8] text-[11px]">
            {vehicles.length} Vehicles Online
          </span>
          <span className="text-white/20">|</span>
          <span className="font-mono text-[#4edea3] text-[11px]">
            {stations.length} Monitored Stops
          </span>
        </div>
      </div>

      {/* HOVER TOOLTIP FOR VEHICLE OR STATION */}
      {hoveredVehicle && (
        <div
          className="absolute z-30 pointer-events-none bg-[#1E293B] border border-white/20 rounded-lg p-2.5 shadow-2xl text-xs"
          style={{
            left: '50%',
            top: '20px',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-bold text-[#F8FAFC] flex items-center gap-2">
            <span>{hoveredVehicle.vehicleNumber}</span>
            <span className="text-[#4cd7f6]">({hoveredVehicle.routeCode})</span>
          </div>
          <div className="text-[#94A3B8] text-[11px] mt-0.5">
            Next: {hoveredVehicle.nextStopName} · {hoveredVehicle.speedMph} mph
          </div>
        </div>
      )}
    </div>
  );
};

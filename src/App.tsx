import React, { useState } from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { TopBar } from './components/TopBar';
import { InteractiveTransitMap } from './components/InteractiveTransitMap';
import { LiveRadarView } from './components/LiveRadarView';
import { LineDetailView } from './components/LineDetailView';
import { TripPlannerView } from './components/TripPlannerView';
import { ServiceAlertsView } from './components/ServiceAlertsView';
import { VehicleTelemetryDrawer } from './components/VehicleTelemetryDrawer';
import { ChevronUp, ChevronDown, Compass, Radio, Map, Route, Navigation, Bell } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, selectedStation, stationArrivals } = useTransit();

  // Mobile bottom sheet state: 'collapsed' (130px) | 'half' (50vh) | 'expanded' (85vh)
  const [mobileSheetState, setMobileSheetState] = useState<'collapsed' | 'half' | 'expanded'>('half');

  // Next immediate arrival for collapsed mobile peek
  const nextArrival = stationArrivals[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B1326] text-[#dae2fd] overflow-hidden select-none font-body">
      {/* 1. TOP BAR (Strict 3-zone contract) */}
      <TopBar />

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <div className="relative flex flex-1 w-full h-[calc(100vh-64px)] overflow-hidden">
        {/* DESKTOP / TABLET PERSISTENT MODULAR DRAWER (420px) */}
        <aside
          className={`hidden md:flex flex-col w-[420px] shrink-0 h-full bg-[#0B1326] border-r border-white/[0.08] z-20 transition-all duration-300 ${
            activeTab === 'map' ? 'w-0 overflow-hidden border-r-0' : 'w-[420px]'
          }`}
        >
          {activeTab === 'radar' && <LiveRadarView />}
          {activeTab === 'lines' && <LineDetailView />}
          {activeTab === 'planner' && <TripPlannerView />}
          {activeTab === 'alerts' && <ServiceAlertsView />}
        </aside>

        {/* FLUID FULL-CANVAS MAP VIEWPORT */}
        <main className="relative flex-1 h-full w-full overflow-hidden bg-[#090D16]">
          <InteractiveTransitMap />

          {/* Vehicle Telemetry Drawer when a vehicle is selected */}
          <VehicleTelemetryDrawer />
        </main>

        {/* MOBILE BOTTOM SHEET (< 768px) */}
        <div
          className={`md:hidden absolute left-0 right-0 bottom-0 z-30 bg-[#0F172A] border-t border-white/15 rounded-t-2xl shadow-2xl transition-all duration-300 flex flex-col ${
            mobileSheetState === 'collapsed'
              ? 'h-28'
              : mobileSheetState === 'half'
              ? 'h-[55vh]'
              : 'h-[88vh]'
          }`}
        >
          {/* Drag Handle & Snapping Header */}
          <div
            onClick={() => {
              if (mobileSheetState === 'collapsed') setMobileSheetState('half');
              else if (mobileSheetState === 'half') setMobileSheetState('expanded');
              else setMobileSheetState('collapsed');
            }}
            className="w-full pt-2 pb-1.5 px-4 flex flex-col items-center justify-center cursor-pointer border-b border-white/[0.06] bg-[#171f33]/50 rounded-t-2xl"
          >
            <div className="w-10 h-1 bg-white/30 rounded-full mb-1" />
            <div className="w-full flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-display font-semibold text-white truncate max-w-[220px]">
                {selectedStation.name}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-[#4edea3]">
                {mobileSheetState === 'collapsed' ? (
                  <>
                    <span>Expand</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Collapse</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {mobileSheetState === 'collapsed' && nextArrival ? (
              <div className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#94A3B8]">Next approaching:</div>
                  <div className="text-sm font-bold text-white truncate max-w-[200px]">
                    {nextArrival.destination}
                  </div>
                </div>
                <div className="text-xl font-bold font-display text-[#4edea3] tabular-nums">
                  {Math.floor(nextArrival.etaSeconds / 60)} min
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'radar' && <LiveRadarView />}
                {activeTab === 'lines' && <LineDetailView />}
                {activeTab === 'planner' && <TripPlannerView />}
                {activeTab === 'alerts' && <ServiceAlertsView />}
                {activeTab === 'map' && (
                  <div className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => setMobileSheetState('collapsed')}
                      className="px-4 py-2 rounded-lg bg-[#4edea3] text-[#090D16] font-bold text-xs font-display"
                    >
                      View Fullscreen Map
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="h-14 border-t border-white/10 bg-[#0B1326] flex items-center justify-around px-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('radar');
                if (mobileSheetState === 'collapsed') setMobileSheetState('half');
              }}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold ${
                activeTab === 'radar' ? 'text-[#4edea3]' : 'text-[#94A3B8]'
              }`}
            >
              <Radio className="w-4 h-4 mb-0.5" />
              <span>Radar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('map');
                setMobileSheetState('collapsed');
              }}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold ${
                activeTab === 'map' ? 'text-[#4edea3]' : 'text-[#94A3B8]'
              }`}
            >
              <Map className="w-4 h-4 mb-0.5" />
              <span>Map</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('lines');
                if (mobileSheetState === 'collapsed') setMobileSheetState('half');
              }}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold ${
                activeTab === 'lines' ? 'text-[#4edea3]' : 'text-[#94A3B8]'
              }`}
            >
              <Route className="w-4 h-4 mb-0.5" />
              <span>Lines</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('planner');
                if (mobileSheetState === 'collapsed') setMobileSheetState('half');
              }}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold ${
                activeTab === 'planner' ? 'text-[#4edea3]' : 'text-[#94A3B8]'
              }`}
            >
              <Navigation className="w-4 h-4 mb-0.5" />
              <span>Planner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('alerts');
                if (mobileSheetState === 'collapsed') setMobileSheetState('half');
              }}
              className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold ${
                activeTab === 'alerts' ? 'text-[#4edea3]' : 'text-[#94A3B8]'
              }`}
            >
              <Bell className="w-4 h-4 mb-0.5" />
              <span>Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <TransitProvider>
      <MainLayout />
    </TransitProvider>
  );
}

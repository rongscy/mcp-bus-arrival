import React from 'react';
import { Volume2, VolumeX, Play, Pause, AlertOctagon } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

export const TopBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSimulating,
    setIsSimulating,
    soundEnabled,
    toggleSound,
    locateUser,
    isLocatingUser,
    triggerSimulatedDelay,
  } = useTransit();

  const navItems: { id: 'radar' | 'map' | 'lines' | 'planner' | 'alerts'; label: string }[] = [
    { id: 'radar', label: 'Live Radar' },
    { id: 'map', label: 'Network Map' },
    { id: 'lines', label: 'Lines & Timetable' },
    { id: 'planner', label: 'Trip Planner' },
    { id: 'alerts', label: 'Service Alerts' },
  ];

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#0B1326] border-b border-white/[0.08] flex items-center justify-between shrink-0 z-30 select-none">
      {/* Zone 1: Single text wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('radar');
        }}
        className="text-xl font-display font-bold tracking-tight text-[#4edea3] hover:text-[#6ffbbe] transition-colors shrink-0 flex items-center gap-2"
      >
        <span>MetroPulse</span>
      </a>

      {/* Zone 2: 4-6 text navigation links */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap transition-colors py-1 relative cursor-pointer ${
              activeTab === item.id
                ? 'text-[#F8FAFC] font-semibold'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {item.label}
            {activeTab === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4edea3] rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Audio notification toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-white/[0.05] border-white/10 text-[#4edea3]'
              : 'bg-white/[0.02] border-white/5 text-[#64748B]'
          }`}
          title={soundEnabled ? 'Arrival chime sound active' : 'Chime muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Live Simulation Play/Pause Toggle */}
        <button
          type="button"
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold font-display flex items-center gap-1.5 transition-colors cursor-pointer ${
            isSimulating
              ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#4edea3]'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
          }`}
          title="Toggle live telemetry feed simulation"
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isSimulating ? 'Live Feed' : 'Paused'}</span>
        </button>

        {/* Primary Action Button: Locate Station */}
        <button
          type="button"
          onClick={locateUser}
          disabled={isLocatingUser}
          className="px-3.5 py-1.5 text-xs font-bold font-display text-[#090D16] bg-[#4edea3] hover:bg-[#6ffbbe] rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isLocatingUser ? 'Locating...' : 'Locate Me'}
        </button>
      </div>
    </header>
  );
};

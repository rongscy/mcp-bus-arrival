import React, { useState } from 'react';
import { Search, Navigation, Accessibility, Bike, Sparkles, X, MapPin } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { TransitMode } from '../types/transit';

export const SearchAndFilters: React.FC = () => {
  const {
    stations,
    selectedStation,
    setSelectedStationId,
    modeFilter,
    setModeFilter,
    accessibilityFilter,
    setAccessibilityFilter,
    bikeFilter,
    setBikeFilter,
    locateUser,
    isLocatingUser,
    favoriteStationIds,
    toggleFavoriteStation,
  } = useTransit();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredStations = stations.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* 1. FLOATING SEARCH & STOP LOCATOR INPUT */}
      <div className="relative">
        <div
          className={`relative flex items-center bg-[#1E293B]/90 backdrop-blur-md rounded-xl transition-all duration-200 border ${
            isFocused
              ? 'border-[#10B981] shadow-[0_0_15px_-2px_rgba(16,185,129,0.3)]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="pl-3.5 pr-2 text-[#94A3B8]">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search stops, stations, or lines..."
            className="w-full bg-transparent py-2.5 text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none font-body"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1.5 text-[#94A3B8] hover:text-white mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* "Near Me" GPS Geolocation Trigger */}
          <button
            type="button"
            onClick={locateUser}
            disabled={isLocatingUser}
            className="shrink-0 mr-1.5 px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#4cd7f6] border border-[#06B6D4]/30 text-xs font-semibold font-display flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Locate nearest transit station"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
            <span>Near Me</span>
          </button>
        </div>

        {/* Dropdown station search results if active search query */}
        {searchTerm && isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#171f33] border border-white/15 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto">
            {filteredStations.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#94A3B8]">No stations found</div>
            ) : (
              filteredStations.map(station => (
                <button
                  key={station.id}
                  type="button"
                  onMouseDown={() => {
                    setSelectedStationId(station.id);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-white/[0.08] flex items-center justify-between border-b border-white/[0.04] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#4edea3]" />
                    <div>
                      <div className="text-sm font-semibold text-[#F8FAFC]">{station.name}</div>
                      <div className="text-[11px] text-[#94A3B8]">{station.zone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {station.routesServed.slice(0, 3).map(r => (
                      <span key={r} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                        {r.split('-')[0]}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 2. FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {/* All Modes */}
        <button
          type="button"
          onClick={() => setModeFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
            modeFilter === 'all'
              ? 'bg-white text-[#090D16] font-semibold shadow-sm'
              : 'bg-white/[0.05] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.1] border border-white/[0.06]'
          }`}
        >
          All Lines
        </button>

        {/* Rapid Rail */}
        <button
          type="button"
          onClick={() => setModeFilter('rapid')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            modeFilter === 'rapid'
              ? 'bg-[#06B6D4] text-[#003640] font-bold shadow-sm'
              : 'bg-white/[0.05] text-[#94A3B8] hover:text-[#4cd7f6] hover:bg-white/[0.1] border border-white/[0.06]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#06B6D4]"></span>
          Rapid Transit
        </button>

        {/* Metro Bus */}
        <button
          type="button"
          onClick={() => setModeFilter('bus')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            modeFilter === 'bus'
              ? 'bg-[#10B981] text-[#003824] font-bold shadow-sm'
              : 'bg-white/[0.05] text-[#94A3B8] hover:text-[#4edea3] hover:bg-white/[0.1] border border-white/[0.06]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          Bus Express
        </button>

        {/* Regional Rail */}
        <button
          type="button"
          onClick={() => setModeFilter('rail')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            modeFilter === 'rail'
              ? 'bg-[#6366F1] text-white font-bold shadow-sm'
              : 'bg-white/[0.05] text-[#94A3B8] hover:text-[#c0c1ff] hover:bg-white/[0.1] border border-white/[0.06]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#6366F1]"></span>
          Regional Rail
        </button>

        {/* Accessibility Toggle */}
        <button
          type="button"
          onClick={() => setAccessibilityFilter(!accessibilityFilter)}
          className={`p-1.5 px-2.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            accessibilityFilter
              ? 'bg-[#4edea3]/20 border border-[#4edea3] text-[#4edea3]'
              : 'bg-white/[0.05] text-[#94A3B8] hover:text-white border border-white/[0.06]'
          }`}
          title="Wheelchair Step-Free Access"
        >
          <Accessibility className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Accessible</span>
        </button>

        {/* Bike Rack Toggle */}
        <button
          type="button"
          onClick={() => setBikeFilter(!bikeFilter)}
          className={`p-1.5 px-2.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            bikeFilter
              ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6] text-[#4cd7f6]'
              : 'bg-white/[0.05] text-[#94A3B8] hover:text-white border border-white/[0.06]'
          }`}
          title="Bicycle Carrier Equipped"
        >
          <Bike className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bike Rack</span>
        </button>
      </div>

      {/* 3. QUICK FAVORITE STATIONS BAR */}
      <div className="flex items-center gap-2 pt-0.5 overflow-x-auto scrollbar-none text-[12px]">
        <span className="text-[#64748B] shrink-0 font-medium">Quick Hubs:</span>
        {favoriteStationIds.map(favId => {
          const st = stations.find(s => s.id === favId);
          if (!st) return null;
          const isSelected = selectedStation.id === st.id;
          return (
            <button
              key={favId}
              type="button"
              onClick={() => setSelectedStationId(favId)}
              className={`px-2.5 py-1 rounded-md transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#10B981]/20 text-[#4edea3] border border-[#10B981]/40 font-semibold'
                  : 'bg-white/[0.03] text-[#94A3B8] hover:text-white hover:bg-white/[0.08] border border-white/[0.05]'
              }`}
            >
              <span>{st.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Accessibility,
  Clock,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  fetchLTABusArrival,
  checkAPIHealth,
  LTABusArrivalResponse,
  APIHealthResponse,
  getMinutesUntilArrival,
  getLoadDescription,
  getBusTypeDescription,
} from '../services/ltaService';
import { RouteBadge } from './RouteBadge';

const PRESET_STOPS = [
  { code: '04121', name: 'Bras Basah Rd (Raffles Hotel / City Hall)' },
  { code: '01012', name: 'Victoria St (Bugis Junction Stn)' },
  { code: '04111', name: 'Stamford Rd (SMU / Capitol Piazza)' },
  { code: '09048', name: 'Orchard Blvd (Opp Orchard Stn)' },
  { code: '80011', name: 'Marine Parade Rd (Parkway Parade)' },
];

export const LTABusArrivalView: React.FC = () => {
  const [busStopCode, setBusStopCode] = useState<string>('04121');
  const [serviceNo, setServiceNo] = useState<string>('');
  const [data, setData] = useState<LTABusArrivalResponse | null>(null);
  const [health, setHealth] = useState<APIHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 20-second refresh countdown (as requested in prompt)
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState<number>(20);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);

  // Load API health
  const checkHealth = useCallback(async () => {
    try {
      const h = await checkAPIHealth();
      setHealth(h);
    } catch {
      setHealth(null);
    }
  }, []);

  // Fetch bus arrival data
  const loadData = useCallback(async (stop: string, svc?: string) => {
    if (!stop.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLTABusArrival(stop, svc);
      setData(res);
      setRefreshSecondsLeft(20);
    } catch (err: any) {
      setError(err?.message || 'Failed to load LTA bus arrival data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    loadData(busStopCode, serviceNo);
  }, []);

  // 20s interval ticker
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setRefreshSecondsLeft(prev => {
        if (prev <= 1) {
          loadData(busStopCode, serviceNo);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, busStopCode, serviceNo, loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(busStopCode, serviceNo);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4">
      {/* 1. API GATEWAY HEALTH & LTA STATUS BANNER */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#06B6D4]/15 text-[#4cd7f6]">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display text-[#F8FAFC]">
                  LTA DataMall v3 Gateway
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#dae2fd]">
                  GET /api/bus-arrival
                </span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                Official Singapore Land Transport Authority live arrival telemetries
              </div>
            </div>
          </div>

          {/* Health monitor status */}
          <div className="flex items-center gap-2 text-xs">
            {health?.ltaKeyConfigured ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>LTA_ACCOUNT_KEY Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold" title="Add LTA_ACCOUNT_KEY in Vercel environment variables">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Sandbox Demo (Key Pending)</span>
              </div>
            )}
          </div>
        </div>

        {/* 20s Refresh Tracker */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Refreshes every 20s:</span>
            <span className="font-mono font-bold text-[#4edea3] tabular-nums">
              {refreshSecondsLeft}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
              className="text-[11px] text-[#94A3B8] hover:text-white underline cursor-pointer"
            >
              {autoRefreshEnabled ? 'Pause auto-refresh' : 'Resume auto-refresh'}
            </button>
            <button
              type="button"
              onClick={() => loadData(busStopCode, serviceNo)}
              disabled={loading}
              className="p-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[#dae2fd] transition-colors cursor-pointer"
              title="Refresh now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. PARAMETERS CONTROLLER (BusStopCode & ServiceNo) */}
      <form onSubmit={handleSearchSubmit} className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-4 shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* BusStopCode Input */}
          <div>
            <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
              BusStopCode <span className="text-[#4edea3]">(Required)</span>
            </label>
            <div className="flex items-center bg-[#171f33] border border-white/10 rounded-lg px-3 py-2 focus-within:border-[#4edea3]">
              <input
                type="text"
                value={busStopCode}
                onChange={(e) => setBusStopCode(e.target.value)}
                placeholder="e.g. 04121"
                className="w-full bg-transparent text-sm font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          {/* ServiceNo Input */}
          <div>
            <label className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
              ServiceNo <span className="text-white/40">(Optional, e.g. 7)</span>
            </label>
            <div className="flex items-center bg-[#171f33] border border-white/10 rounded-lg px-3 py-2 focus-within:border-[#4edea3]">
              <input
                type="text"
                value={serviceNo}
                onChange={(e) => setServiceNo(e.target.value)}
                placeholder="e.g. 7 (Leave blank for all)"
                className="w-full bg-transparent text-sm font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-[#64748B] shrink-0 font-medium">Quick Stops:</span>
          {PRESET_STOPS.map(p => (
            <button
              key={p.code}
              type="button"
              onClick={() => {
                setBusStopCode(p.code);
                loadData(p.code, serviceNo);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer ${
                busStopCode === p.code
                  ? 'bg-[#10B981]/20 text-[#4edea3] border border-[#10B981]/40 font-semibold'
                  : 'bg-white/[0.04] text-[#94A3B8] hover:text-white border border-white/[0.06]'
              }`}
            >
              <span className="font-mono">{p.code}</span>
              <span className="hidden sm:inline"> - {p.name.split('(')[0]}</span>
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-[#4edea3] hover:bg-[#6ffbbe] text-[#090D16] font-bold font-display text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? 'Querying LTA DataMall...' : `Query Bus Stop ${busStopCode}`}</span>
        </button>
      </form>

      {/* 3. ERROR MESSAGE IF ANY */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. RESULTS SECTION */}
      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F8FAFC]">Stop #{data.BusStopCode}</span>
              <span>·</span>
              <span>{data.Services?.length || 0} Bus Services Operating</span>
            </div>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              data.dataSource === 'lta_datamall'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/10 text-white/70'
            }`}>
              Source: {data.dataSource === 'lta_datamall' ? 'LTA DataMall Live' : 'Sandbox Demo'}
            </span>
          </div>

          {data.Services?.length === 0 ? (
            <div className="p-8 text-center bg-[#0F172A] border border-white/[0.08] rounded-xl text-xs text-[#94A3B8]">
              No active bus services found for stop {data.BusStopCode}.
            </div>
          ) : (
            data.Services?.map(svc => {
              const next1 = getMinutesUntilArrival(svc.NextBus?.EstimatedArrival);
              const next2 = getMinutesUntilArrival(svc.NextBus2?.EstimatedArrival);
              const next3 = getMinutesUntilArrival(svc.NextBus3?.EstimatedArrival);

              const load1 = getLoadDescription(svc.NextBus?.Load);
              const type1 = getBusTypeDescription(svc.NextBus?.Type);

              return (
                <div
                  key={svc.ServiceNo}
                  className="bg-[#0F172A] border border-white/[0.08] hover:border-white/20 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Service badge and operator */}
                    <div className="flex items-center gap-3">
                      <RouteBadge
                        code={svc.ServiceNo}
                        mode="bus"
                        color="#10B981"
                        size="md"
                      />
                      <div>
                        <div className="text-sm font-bold text-[#F8FAFC]">
                          Service {svc.ServiceNo}
                        </div>
                        <div className="text-xs text-[#94A3B8] flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-white/5">
                            {svc.Operator}
                          </span>
                          <span>·</span>
                          <span>Dest: {svc.NextBus?.DestinationCode || 'Terminal'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Imminent Primary Arrival Countdown */}
                    <div className="text-right">
                      <div
                        className={`font-display text-2xl font-bold tabular-nums leading-none ${
                          next1.isNow
                            ? 'text-[#10B981] animate-pulse'
                            : next1.minutes <= 3
                            ? 'text-[#4edea3]'
                            : 'text-[#F8FAFC]'
                        }`}
                      >
                        {next1.display}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono mt-1">
                        Next Bus
                      </div>
                    </div>
                  </div>

                  {/* Attributes of Next Bus: Load, Type, Wheelchair */}
                  {svc.NextBus && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Load Badge */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${load1.badgeBg}`}>
                          {load1.label}
                        </span>

                        {/* Bus Type */}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#dae2fd]">
                          {type1}
                        </span>

                        {/* Wheelchair Accessible */}
                        {svc.NextBus.Feature === 'WAB' && (
                          <span className="flex items-center gap-1 text-[10px] text-[#4edea3]">
                            <Accessibility className="w-3 h-3" />
                            <span>Wheelchair OK</span>
                          </span>
                        )}
                      </div>

                      {/* Subsequent NextBus2 & NextBus3 follow-up pills */}
                      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                        {next2.minutes > 0 && (
                          <span className="bg-white/[0.04] px-2 py-0.5 rounded font-mono">
                            2nd: {next2.display}
                          </span>
                        )}
                        {next3.minutes > 0 && (
                          <span className="bg-white/[0.04] px-2 py-0.5 rounded font-mono">
                            3rd: {next3.display}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

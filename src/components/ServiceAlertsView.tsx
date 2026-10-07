import React, { useState } from 'react';
import { AlertTriangle, Info, AlertOctagon, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { RouteBadge } from './RouteBadge';

export const ServiceAlertsView: React.FC = () => {
  const { alerts, routes, stations, setSelectedStationId, setSelectedRouteId, setActiveTab, triggerSimulatedDelay } = useTransit();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'advisory'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'all') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-5">
      {/* 1. STATUS HEADER */}
      <div className="bg-[#0F172A] border border-white/[0.08] rounded-xl p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#10B981] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>96.4% Network Operating Within Nominal Headway</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[#F8FAFC] tracking-tight mt-1">
              Service Bulletins & Transit Advisories
            </h2>
          </div>

          <button
            type="button"
            onClick={triggerSimulatedDelay}
            className="px-3.5 py-2 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/25 text-xs font-semibold font-display flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Simulate Traffic Disruption</span>
          </button>
        </div>

        {/* Severity filter buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              severityFilter === 'all'
                ? 'bg-white text-[#090D16] font-semibold'
                : 'bg-white/[0.04] text-[#94A3B8] hover:text-white'
            }`}
          >
            All Bulletins ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              severityFilter === 'warning'
                ? 'bg-[#EF4444] text-white font-semibold'
                : 'bg-white/[0.04] text-[#94A3B8] hover:text-white'
            }`}
          >
            Warnings & Delays
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('advisory')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              severityFilter === 'advisory'
                ? 'bg-[#06B6D4] text-[#003640] font-bold'
                : 'bg-white/[0.04] text-[#94A3B8] hover:text-white'
            }`}
          >
            Station Advisories
          </button>
        </div>
      </div>

      {/* 2. BULLETIN CARDS */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                isWarning
                  ? 'bg-[#1a1215] border-[#EF4444]/30'
                  : 'bg-[#0F172A] border-white/[0.08]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    isWarning ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#06B6D4]/15 text-[#4cd7f6]'
                  }`}>
                    {isWarning ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isWarning ? 'bg-[#EF4444]/20 text-[#ffb4ab]' : 'bg-[#06B6D4]/20 text-[#acedff]'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-[#94A3B8]">{alert.time}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#F8FAFC] font-display mt-1.5">
                      {alert.title}
                    </h3>

                    <p className="text-xs text-[#bbcabf] mt-1.5 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Impacted Routes and Stations */}
              <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#64748B] font-semibold">Impacted Lines:</span>
                  {alert.routeIds.map(rId => {
                    const r = routes.find(route => route.id === rId);
                    return (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => {
                          setSelectedRouteId(rId);
                          setActiveTab('lines');
                        }}
                        className="transition-transform active:scale-95 cursor-pointer"
                      >
                        <RouteBadge
                          code={r ? r.code : rId}
                          mode={r?.mode}
                          color={r?.color}
                          size="sm"
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <span>Stops:</span>
                  {alert.impactedStops.map(stId => {
                    const st = stations.find(s => s.id === stId);
                    return (
                      <button
                        key={stId}
                        type="button"
                        onClick={() => {
                          setSelectedStationId(stId);
                          setActiveTab('radar');
                        }}
                        className="underline hover:text-[#4edea3] cursor-pointer"
                      >
                        {st?.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

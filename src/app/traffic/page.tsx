'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { MapWrapper } from '@/components/Map/MapWrapper';
import { TrafficIncident, DataStatus } from '@/lib/types';
import {
  Radio,
  RefreshCw,
  AlertTriangle,
  Flame,
  Construction,
  ShieldCheck,
  Filter,
  Clock,
  Navigation,
  Car,
  TrendingUp,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
};

export default function LiveTrafficPage() {
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [trafficData, setTrafficData] = useState<any>(null);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const loadTrafficData = useCallback(async () => {
    setIsLoading(true);
    const coords = CITY_COORDINATES[selectedCity] || CITY_COORDINATES['Bengaluru'];
    try {
      const [trafficRes, incidentsRes] = await Promise.all([
        fetch(`/api/traffic?city=${selectedCity}&lat=${coords.lat}&lng=${coords.lng}`),
        fetch(`/api/traffic/incidents?minLat=${coords.lat - 0.2}&maxLat=${coords.lat + 0.2}&minLng=${coords.lng - 0.2}&maxLng=${coords.lng + 0.2}`),
      ]);

      if (trafficRes.ok) {
        const tData = await trafficRes.json();
        setTrafficData(tData);
      }
      if (incidentsRes.ok) {
        const iData = await incidentsRes.json();
        setIncidents(iData.incidents || []);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error refreshing traffic:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    loadTrafficData();
  }, [loadTrafficData]);

  // Filter incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (typeFilter !== 'all' && inc.type !== typeFilter) return false;
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 mb-2">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Real-Time Geospatial Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Live Traffic Flow & Incident Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verified road incidents, flow speeds, and congestion telemetry across urban metropolitan networks.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-card border border-border text-foreground"
          >
            {Object.keys(CITY_COORDINATES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={loadTrafficData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Freshness & Status Strip */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-card border border-border text-xs gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground">Data Freshness:</span>
          {trafficData ? (
            <StatusBadge status={trafficData.dataStatus as DataStatus} />
          ) : (
            <StatusBadge status="DEMO" />
          )}
          <span className="text-muted-foreground">
            Engine: <strong>QuantumRoute Flow Telemetry</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Last refresh: {lastRefreshed || 'Just now'}</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Congestion Index
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {trafficData?.congestionIndex ?? 35}%
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {trafficData?.congestionLevel ?? 'Moderate'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Slowdown relative to free-flow conditions</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Average Flow Speed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {trafficData?.averageSpeedKmh ?? 31}
            </span>
            <span className="text-xs text-muted-foreground">km/h</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Free-flow baseline: {trafficData?.freeFlowSpeedKmh ?? 48} km/h
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Verified Incidents
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {incidents.length}
            </span>
            <span className="text-xs text-muted-foreground">reports</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Accidents, construction & bottlenecks</p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Avg Delay Per 10 km
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              +{trafficData?.delayPer10KmMin ?? 4.8}
            </span>
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Additional travel time over free flow</p>
        </div>
      </div>

      {/* Live Metropolitan Traffic Map Canvas */}
      <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-quantum-500 animate-pulse" />
              Live Incident & Congestion Radar ({selectedCity})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive geospatial plotting of verified incidents, congestion zones, and flow velocities across metropolitan corridors.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 self-start sm:self-auto">
            {filteredIncidents.length} Verified Incidents Plotted
          </span>
        </div>

        <div className="h-[360px] sm:h-[440px] lg:h-[480px] w-full rounded-2xl overflow-hidden border border-border shadow-inner">
          <MapWrapper
            center={CITY_COORDINATES[selectedCity] || CITY_COORDINATES['Bengaluru']}
            zoom={12}
            incidents={filteredIncidents}
            showIncidents={true}
            showTrafficFlow={true}
            tomtomTrafficTileUrl={trafficData?.flowTileUrl || ''}
          />
        </div>
      </div>

      {/* Corridor Breakdown & Incidents Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Corridor Flow Status */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Navigation className="h-4 w-4 text-quantum-600 dark:text-quantum-400" />
            Key Arterial Corridors ({selectedCity})
          </h2>
          <div className="space-y-3">
            {trafficData?.segmentsSummary?.map((seg: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-foreground">{seg.corridor}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Current speed: <strong>{seg.speedKmh} km/h</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      seg.status === 'Smooth'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : seg.status === 'Moderate'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {seg.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">+{seg.delayMin} min delay</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Verified Incidents with Filters */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Verified Traffic Incidents & Road Hazards
            </h2>

            {/* Filter controls */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs"
              >
                <option value="all">All Incident Types</option>
                <option value="accident">Accidents</option>
                <option value="congestion">Congestion</option>
                <option value="construction">Construction</option>
                <option value="closure">Road Closures</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs"
              >
                <option value="all">All Severities</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major / Critical</option>
              </select>
            </div>
          </div>

          {/* Incident cards */}
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-2 rounded-2xl bg-muted/30 border border-dashed border-border">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <p className="font-bold text-foreground text-sm">No Active Road Incidents Reported ({selectedCity})</p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Arterial corridors are currently operating under baseline flow conditions. Live verified incident tracking is active and connects automatically when an external traffic provider key is present.
                </p>
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          inc.severity === 'critical'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                            : inc.severity === 'major'
                            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-800'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {inc.type} • {inc.severity}
                      </span>
                      <StatusBadge status={inc.dataStatus} showIcon={false} className="text-[9px] py-0 px-1.5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{inc.roadName}</h3>
                    <p className="text-xs text-muted-foreground">{inc.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                      +{Math.round(inc.delaySeconds / 60)} min
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Span: ~{inc.lengthMeters} m
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Telemetry Architecture Overview */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-quantum-500" /> Real-Time Traffic & Incident Telemetry Network
              </span>
              <p className="text-[11px] text-muted-foreground">
                Continuous arterial flow monitoring, congestion segment extraction, and active bottleneck detection.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Telemetry Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

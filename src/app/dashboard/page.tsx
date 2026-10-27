'use client';

import React, { useState, useEffect } from 'react';
import { MapWrapper } from '@/components/Map/MapWrapper';
import { RouteCard } from '@/components/RouteCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  LatLng,
  RouteAlternative,
  TrafficIncident,
  VehicleType,
  OptimizationObjective,
  WeatherCondition,
  AirQualityData,
  EVChargingStation,
} from '@/lib/types';
import { saveRoute } from '@/lib/storage';
import {
  Search,
  ArrowUpDown,
  Navigation,
  Compass,
  Sliders,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BookmarkPlus,
  RefreshCw,
  Check,
  Zap,
  Wind,
  BatteryCharging,
  Fuel,
  Plus,
  X,
  Sparkles,
  MapPin,
  Car,
  ChevronRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { formatCurrency, formatDistance, formatDuration, formatEmissions } from '@/lib/utils';

export default function DashboardPage() {
  // Endpoints state
  const [origin, setOrigin] = useState<LatLng>({
    lat: 12.9352,
    lng: 77.6245,
    label: 'Koramangala, Bengaluru',
  });
  const [destination, setDestination] = useState<LatLng>({
    lat: 12.9698,
    lng: 77.7500,
    label: 'Whitefield ITPL, Bengaluru',
  });

  // Search input states
  const [originQuery, setOriginQuery] = useState('Koramangala, Bengaluru');
  const [destQuery, setDestQuery] = useState('Whitefield ITPL, Bengaluru');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [stops, setStops] = useState<Array<{ id: string; lat: number; lng: number; label: string; query: string; suggestions: any[] }>>([]);

  // Navigation settings (Default: Petrol, Balanced)
  const [vehicleType, setVehicleType] = useState<VehicleType>('petrol');
  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [showEVChargers, setShowEVChargers] = useState(false);
  const [showTrafficFlow, setShowTrafficFlow] = useState(false);
  const [tomtomTileUrl, setTomtomTileUrl] = useState('');

  // UI state for clutter reduction & mobile bottom sheet
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);

  // Results state
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [chargingStations, setChargingStations] = useState<EVChargingStation[]>([]);
  const [fuelInfo, setFuelInfo] = useState<{ petrol: number; diesel: number; isLive: boolean } | null>(null);

  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Initial fetch on mount
  useEffect(() => {
    fetchRouteData();
    fetchIncidentData();
    fetchWeatherData(origin.lat, origin.lng);
    fetchAirQualityData(origin.lat, origin.lng);
    fetchChargingData(origin.lat, origin.lng);
    fetchFuelPriceData();
  }, []);

  // Fetch routes from API
  const fetchRouteData = async () => {
    setIsLoadingRoutes(true);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          stops: stops.filter((s) => s.lat && s.lng).map((s) => ({ lat: s.lat, lng: s.lng, label: s.label })),
          vehicleType,
          objective,
          avoidTolls,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoutes(data.routes || []);
        if (data.routes?.length > 0) {
          const rec = data.routes.find((r: RouteAlternative) => r.isRecommended) || data.routes[0];
          setSelectedRouteId(rec.id);
        }
      }
    } catch (e) {
      console.error('Failed to calculate routes:', e);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const fetchIncidentData = async () => {
    try {
      const res = await fetch('/api/traffic/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (e) {
      console.error('Failed to fetch incidents:', e);
    }
  };

  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data.weather);
      }
    } catch (e) {
      console.error('Failed to fetch weather:', e);
    }
  };

  const fetchAirQualityData = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setAirQuality(data.airQuality);
      }
    } catch (e) {
      console.error('Failed to fetch air quality:', e);
    }
  };

  const fetchChargingData = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/charging-stations?lat=${lat}&lng=${lng}&distanceKm=25`);
      if (res.ok) {
        const data = await res.json();
        setChargingStations(data.stations || []);
      }
    } catch (e) {
      console.error('Failed to fetch EV chargers:', e);
    }
  };

  const fetchFuelPriceData = async () => {
    try {
      const res = await fetch('/api/fuel-prices?state=Karnataka');
      if (res.ok) {
        const data = await res.json();
        setFuelInfo({
          petrol: data.prices.petrol,
          diesel: data.prices.diesel,
          isLive: data.dataStatus === 'LIVE',
        });
      }
    } catch (e) {}
  };

  const handleOriginSearch = async (val: string) => {
    setOriginQuery(val);
    if (val.trim().length >= 2) {
      setIsSearchingOrigin(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setOriginSuggestions(data.results || []);
        }
      } catch (e) {}
      setIsSearchingOrigin(false);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestSearch = async (val: string) => {
    setDestQuery(val);
    if (val.trim().length >= 2) {
      setIsSearchingDest(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          setDestSuggestions(data.results || []);
        }
      } catch (e) {}
      setIsSearchingDest(false);
    } else {
      setDestSuggestions([]);
    }
  };

  const addIntermediateStop = () => {
    if (stops.length >= 3) return;
    setStops([
      ...stops,
      {
        id: `stop-${Date.now()}`,
        lat: 0,
        lng: 0,
        label: '',
        query: '',
        suggestions: [],
      },
    ]);
  };

  const removeIntermediateStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopSearch = async (index: number, val: string) => {
    const nextStops = [...stops];
    nextStops[index].query = val;
    setStops(nextStops);

    if (val.trim().length >= 2) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(val)}`);
        if (res.ok) {
          const data = await res.json();
          const updated = [...stops];
          if (updated[index]) {
            updated[index].suggestions = data.results || [];
            setStops(updated);
          }
        }
      } catch (e) {}
    } else {
      const updated = [...stops];
      if (updated[index]) {
        updated[index].suggestions = [];
        setStops(updated);
      }
    }
  };

  const selectStopLocation = (index: number, item: any) => {
    const nextStops = [...stops];
    nextStops[index].lat = item.lat;
    nextStops[index].lng = item.lng;
    nextStops[index].label = item.name;
    nextStops[index].query = item.name;
    nextStops[index].suggestions = [];
    setStops(nextStops);
  };

  const swapEndpoints = () => {
    const tempOrigin = { ...origin };
    const tempOriginQuery = originQuery;
    setOrigin(destination);
    setOriginQuery(destQuery);
    setDestination(tempOrigin);
    setDestQuery(tempOriginQuery);
  };

  const handleGeolocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const loc: LatLng = { lat: userLat, lng: userLng, label: 'Your Current Location' };
          setOrigin(loc);
          setOriginQuery('Your Current Location');
          fetchWeatherData(userLat, userLng);
          fetchAirQualityData(userLat, userLng);
          fetchChargingData(userLat, userLng);
        },
        (err) => {
          alert('Unable to retrieve location: ' + err.message);
        }
      );
    }
  };

  const handleSaveRoute = () => {
    const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    if (!activeRoute) return;

    saveRoute({
      title: `${origin.label || 'Origin'} to ${destination.label || 'Destination'}`,
      origin,
      destination,
      vehicleType,
      objective,
      distanceKm: activeRoute.distanceKm,
      estDurationMin: activeRoute.durationMin,
      estCostInr: activeRoute.fuelCostInr,
      notes: `Saved from Dashboard (${activeRoute.algorithmUsed})`,
    });

    setIsSavedSuccessfully(true);
    setTimeout(() => setIsSavedSuccessfully(false), 3000);
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Primary input form controls
  const renderRouteInputs = () => (
    <div className="space-y-3">
      {/* Vehicle Type Selector Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F4F6FA] dark:bg-[#101A30] border border-[#E5E9F2] dark:border-slate-800">
        {[
          { id: 'petrol', label: 'Petrol' },
          { id: 'diesel', label: 'Diesel' },
          { id: 'cng', label: 'CNG' },
          { id: 'ev', label: 'Electric (EV)' },
        ].map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setVehicleType(v.id as VehicleType)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              vehicleType === v.id
                ? 'bg-[#14B8A6] text-white shadow-xs'
                : 'text-[#0B1220]/70 dark:text-white/70 hover:text-[#0B1220] dark:hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Origin & Destination Container */}
      <div className="space-y-2 relative">
        {/* Origin Input */}
        <div className="relative">
          <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[#14B8A6]" />
          <input
            type="text"
            value={originQuery}
            onChange={(e) => handleOriginSearch(e.target.value)}
            placeholder="Starting location..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F4F6FA] dark:bg-[#101A30] border border-[#E5E9F2] dark:border-slate-800 text-[#0B1220] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#14B8A6]/40"
          />
          <button
            type="button"
            onClick={handleGeolocation}
            title="Use Current GPS"
            className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-[#14B8A6] transition-colors"
          >
            <Compass className="h-4 w-4" />
          </button>

          {/* Autocomplete */}
          {originSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0B1220] border border-[#E5E9F2] dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
              {originSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOrigin({ lat: item.lat, lng: item.lng, label: item.name });
                    setOriginQuery(item.name);
                    setOriginSuggestions([]);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F4F6FA] dark:hover:bg-slate-800/60 border-b border-[#E5E9F2]/50 last:border-0"
                >
                  <p className="font-semibold text-[#0B1220] dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap & Waypoints Toggle Row */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={addIntermediateStop}
            disabled={stops.length >= 3}
            className="text-[11px] font-semibold text-[#14B8A6] hover:underline disabled:opacity-40"
          >
            + Add Stop {stops.length > 0 ? `(${stops.length}/3)` : ''}
          </button>

          <button
            type="button"
            onClick={swapEndpoints}
            title="Swap Origin and Destination"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F4F6FA] dark:bg-slate-800 text-muted-foreground hover:text-[#0B1220] dark:hover:text-white transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            <span>Swap</span>
          </button>
        </div>

        {/* Waypoints List */}
        {stops.map((stop, sIdx) => (
          <div key={stop.id} className="relative">
            <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            <input
              type="text"
              value={stop.query}
              onChange={(e) => handleStopSearch(sIdx, e.target.value)}
              placeholder={`Stop ${sIdx + 1}...`}
              className="w-full pl-9 pr-9 py-2 rounded-xl text-xs bg-[#F4F6FA] dark:bg-[#101A30] border border-[#E5E9F2] dark:border-slate-800 text-[#0B1220] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B]"
            />
            <button
              type="button"
              onClick={() => removeIntermediateStop(sIdx)}
              className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-[#EF4444] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {stop.suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0B1220] border border-[#E5E9F2] dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                {stop.suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectStopLocation(sIdx, item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F4F6FA] dark:hover:bg-slate-800 border-b border-[#E5E9F2]/50 last:border-0"
                  >
                    <p className="font-semibold text-[#0B1220] dark:text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Destination Input */}
        <div className="relative">
          <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
          <input
            type="text"
            value={destQuery}
            onChange={(e) => handleDestSearch(e.target.value)}
            placeholder="Destination location..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F4F6FA] dark:bg-[#101A30] border border-[#E5E9F2] dark:border-slate-800 text-[#0B1220] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#14B8A6]/40"
          />

          {/* Autocomplete */}
          {destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0B1220] border border-[#E5E9F2] dark:border-slate-800 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
              {destSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setDestination({ lat: item.lat, lng: item.lng, label: item.name });
                    setDestQuery(item.name);
                    setDestSuggestions([]);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F4F6FA] dark:hover:bg-slate-800/60 border-b border-[#E5E9F2]/50 last:border-0"
                >
                  <p className="font-semibold text-[#0B1220] dark:text-white truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary CTA Button in Highlight Teal */}
      <button
        type="button"
        onClick={fetchRouteData}
        disabled={isLoadingRoutes}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-sm transition-all disabled:opacity-50"
      >
        {isLoadingRoutes ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Optimizing Corridors...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Find Best Route</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="relative flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#F4F6FA] dark:bg-[#0B1220]">
      {/* DESKTOP SIDE PANEL (Compact, Uncluttered, Maximize Map) */}
      <div className="hidden md:flex w-[380px] lg:w-[420px] flex-col h-full bg-white dark:bg-[#0B1220] border-r border-[#E5E9F2] dark:border-slate-800 shrink-0 z-20 overflow-hidden shadow-sm">
        {/* Top Input Section */}
        <div className="p-4 border-b border-[#E5E9F2] dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#0B1220] dark:text-white flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-[#14B8A6]" />
              Route Navigation
            </h2>
            <span className="text-[10px] font-semibold text-muted-foreground">QIGA Engine</span>
          </div>

          {renderRouteInputs()}
        </div>

        {/* Route Alternatives List with Loading Skeletons */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Route Alternatives ({routes.length})</span>
            {selectedRoute && (
              <button
                type="button"
                onClick={handleSaveRoute}
                className="inline-flex items-center gap-1 text-[#14B8A6] hover:underline"
              >
                {isSavedSuccessfully ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#10B981]" /> Saved!
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-3.5 w-3.5" /> Save
                  </>
                )}
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {isLoadingRoutes && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-[#E5E9F2] dark:border-slate-800 bg-white dark:bg-[#101A30] space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-28 rounded-md skeleton-shimmer" />
                    <div className="h-4 w-14 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="h-3 w-40 rounded-md skeleton-shimmer" />
                  <div className="grid grid-cols-4 gap-1.5 pt-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-8 rounded-lg skeleton-shimmer" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render Route Alternative Cards */}
          {!isLoadingRoutes &&
            routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={route.id === selectedRouteId}
                onSelect={() => setSelectedRouteId(route.id)}
              />
            ))}

          {/* Expandable Turn-by-Turn Guidance & Fleet Analytics (Only shown when requested!) */}
          {selectedRoute && !isLoadingRoutes && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAnalyticsDrawer(!showAnalyticsDrawer)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#E5E9F2] dark:border-slate-800 text-xs font-bold flex items-center justify-between text-[#0B1220] dark:text-white bg-[#F4F6FA] dark:bg-[#101A30] hover:bg-slate-100 transition-colors"
              >
                <span>Turn-by-Turn Guidance & Fleet Analytics</span>
                {showAnalyticsDrawer ? (
                  <ChevronUp className="h-4 w-4 text-[#14B8A6]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {showAnalyticsDrawer && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-[#101A30] border border-[#E5E9F2] dark:border-slate-800 space-y-3 transition-all">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Turn-by-Turn Guidance
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedRoute.instructions?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <span className="h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-[#0B1220] dark:text-white font-medium">{step.text}</p>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistance(step.distanceKm)} • {formatDuration(step.durationMin)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E9F2] dark:border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Powertrain Energy Summary
                    </span>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Estimated Fuel Consumption:</span>
                      <strong className="text-[#0B1220] dark:text-white">{selectedRoute.energyUsedUnits} units</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Estimated Carbon Footprint:</span>
                      <strong className="text-[#0B1220] dark:text-white">{formatEmissions(selectedRoute.emissionsKg)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULL-SCREEN MAP CANVAS (The Main Focus) */}
      <div className="flex-1 relative w-full h-full flex flex-col">
        {/* Floating Top Journey HUD (Sleek, uncluttered, transparent pill) */}
        {selectedRoute && (
          <div className="absolute top-3 left-3 right-3 md:left-4 md:right-auto z-20 pointer-events-none flex flex-wrap items-center gap-2">
            <div className="pointer-events-auto bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border border-[#E5E9F2] dark:border-slate-800 shadow-md rounded-xl px-3.5 py-1.5 flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="font-bold text-[#0B1220] dark:text-white">{selectedRoute.name}</span>
              </div>
              <div className="h-4 w-px bg-[#E5E9F2] dark:bg-slate-800" />
              <div className="text-muted-foreground">
                ETA: <strong className="text-[#0B1220] dark:text-white">{formatDuration(selectedRoute.durationMin)}</strong>
              </div>
              <div className="h-4 w-px bg-[#E5E9F2] dark:bg-slate-800" />
              <div className="text-muted-foreground">
                Dist: <strong className="text-[#0B1220] dark:text-white">{formatDistance(selectedRoute.distanceKm)}</strong>
              </div>
              <div className="h-4 w-px bg-[#E5E9F2] dark:bg-slate-800" />
              <div className="text-[#14B8A6] font-bold">
                {formatCurrency(selectedRoute.fuelCostInr)}
              </div>
            </div>

            {/* Subtle layer toggles */}
            <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border border-[#E5E9F2] dark:border-slate-800 px-2 py-1 rounded-xl shadow-xs text-xs">
              <button
                type="button"
                onClick={() => setShowEVChargers(!showEVChargers)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  showEVChargers
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Toggle EV Hubs"
              >
                <BatteryCharging className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">EV Hubs ({chargingStations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTrafficFlow(!showTrafficFlow)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
                  showTrafficFlow
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-[#14B8A6]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Toggle Traffic Flow"
              >
                <Wind className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Flow</span>
              </button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="w-full h-full flex-1">
          <MapWrapper
            center={origin}
            zoom={12}
            origin={origin}
            destination={destination}
            stops={stops.filter((s) => s.lat && s.lng).map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.label || s.query }))}
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            incidents={incidents}
            showIncidents={true}
            chargingStations={chargingStations}
            showChargingStations={showEVChargers}
            showTrafficFlow={showTrafficFlow}
            tomtomTrafficTileUrl={tomtomTileUrl}
          />
        </div>

        {/* MOBILE DRAGGABLE BOTTOM ROUTE PANEL */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1220]/95 backdrop-blur-md border-t border-[#E5E9F2] dark:border-slate-800 shadow-2xl rounded-t-3xl transition-all duration-300 ${
            isMobileSheetExpanded ? 'max-h-[82vh] overflow-y-auto' : 'max-h-36 overflow-hidden'
          }`}
        >
          {/* Draggable Handle */}
          <button
            type="button"
            onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
            className="w-full py-2.5 flex flex-col items-center cursor-pointer group"
            aria-label="Toggle Route Panel"
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[#14B8A6] transition-colors" />
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground mt-1">
              <span>{isMobileSheetExpanded ? 'Collapse Map View' : 'Slide Up for Route Details'}</span>
              {isMobileSheetExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </div>
          </button>

          <div className="p-4 pt-1 space-y-4">
            {/* When collapsed on mobile, show quick one-line trip summary */}
            {!isMobileSheetExpanded && selectedRoute && (
              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Selected Route</span>
                  <p className="text-xs font-bold text-[#0B1220] dark:text-white truncate max-w-[200px]">
                    {selectedRoute.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-[#14B8A6]">
                    {formatDuration(selectedRoute.durationMin)}
                  </span>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDistance(selectedRoute.distanceKm)} • {formatCurrency(selectedRoute.fuelCostInr)}
                  </p>
                </div>
              </div>
            )}

            {/* Full Expanded Mobile Panel Controls */}
            {isMobileSheetExpanded && (
              <div className="space-y-4">
                {renderRouteInputs()}

                {/* Mobile Route Alternatives */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#0B1220] dark:text-white block">
                    Route Alternatives ({routes.length})
                  </span>

                  {routes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isSelected={route.id === selectedRouteId}
                      onSelect={() => setSelectedRouteId(route.id)}
                    />
                  ))}
                </div>

                {/* Mobile Turn-by-Turn Guidance */}
                {selectedRoute && selectedRoute.instructions?.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#F4F6FA] dark:bg-[#101A30] border border-[#E5E9F2] dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-[#0B1220] dark:text-white block">
                      Turn-by-Turn Directions
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedRoute.instructions.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <span className="h-4 w-4 rounded-full bg-white dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-[#0B1220] dark:text-white font-medium">{step.text}</p>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistance(step.distanceKm)} • {formatDuration(step.durationMin)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

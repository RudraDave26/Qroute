'use client';

import React, { useState, useEffect } from 'react';
import { MapWrapper } from '@/components/Map/MapWrapper';
import { RouteCard } from '@/components/RouteCard';
import { StatusBadge } from '@/components/StatusBadge';
import { VehicleSelector } from '@/components/VehicleSelector';
import { ObjectiveSelector } from '@/components/ObjectiveSelector';
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
import { DEFAULT_VEHICLE_PROFILES } from '@/lib/algorithms/vehicleModels';
import { PRESET_LOCATIONS } from '@/lib/providers/nominatim';
import { saveRoute } from '@/lib/storage';
import {
  Search,
  ArrowUpDown,
  Navigation,
  Compass,
  Sliders,
  ChevronDown,
  ChevronUp,
  CloudSun,
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

  // Navigation settings
  const [vehicleType, setVehicleType] = useState<VehicleType>('petrol');
  const [objective, setObjective] = useState<OptimizationObjective>('balanced');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [showEVChargers, setShowEVChargers] = useState(true);
  const [showTrafficFlow, setShowTrafficFlow] = useState(false);
  const [tomtomTileUrl, setTomtomTileUrl] = useState('');

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);

  // Initial route generation on mount
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
      const res = await fetch(`/api/charging-stations?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setChargingStations(data.stations || []);
      }
    } catch (e) {
      console.error('Failed to fetch charging stations:', e);
    }
  };

  const fetchFuelPriceData = async () => {
    try {
      const res = await fetch('/api/fuel-prices?city=Bengaluru');
      if (res.ok) {
        const data = await res.json();
        const petrolQuote = data.prices?.find((p: any) => p.fuelType === 'petrol');
        const dieselQuote = data.prices?.find((p: any) => p.fuelType === 'diesel');
        if (petrolQuote && dieselQuote) {
          setFuelInfo({
            petrol: petrolQuote.priceInr,
            diesel: dieselQuote.priceInr,
            isLive: data.isLive,
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch fuel prices:', e);
    }
  };

  // Autocomplete searches
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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Left / Slide-in Panel */}
      <div
        className={`w-full lg:w-[460px] xl:w-[500px] flex flex-col h-full bg-card border-r border-border shrink-0 z-20 transition-all duration-300 ${
          isSidebarOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* Search & Inputs Section */}
        <div className="p-4 border-b border-border space-y-3 bg-card/60 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-quantum-500" /> Route Navigation
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Weather Chip */}
              {weather && (
                <div
                  title={`Weather: ${weather.description}, Wind: ${weather.windSpeedKmh} km/h`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-navy-900 border border-border text-slate-700 dark:text-slate-300"
                >
                  <CloudSun className="h-3 w-3 text-amber-500" />
                  <span>{weather.temperatureC}°C</span>
                </div>
              )}

              {/* Air Quality Chip */}
              {airQuality && (
                <div
                  title={`Air Quality Index: AQI ${airQuality.usAqi} (${airQuality.category}). PM2.5: ${airQuality.pm25} μg/m³`}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border font-semibold ${
                    airQuality.usAqi <= 50
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : airQuality.usAqi <= 100
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <Wind className="h-3 w-3" />
                  <span>AQI {airQuality.usAqi}</span>
                  <StatusBadge status={airQuality.isLive ? 'LIVE' : 'DEMO'} showIcon={false} className="py-0 px-1 text-[8px]" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Routing Preferences"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Energy Tariffs live ticker banner */}
          {fuelInfo && (
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Fuel className="h-3 w-3 text-quantum-500" />
                <span>
                  Fuel Tariffs: Petrol <strong>₹{fuelInfo.petrol}/L</strong> • Diesel <strong>₹{fuelInfo.diesel}/L</strong>
                </span>
              </div>
              <StatusBadge status={fuelInfo.isLive ? 'LIVE' : 'CACHED'} showIcon={false} className="py-0 px-1 text-[8px]" />
            </div>
          )}

          {/* National Geographic Mesh indicator */}
          <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>National Routing Mesh: 37 States & 635 Districts</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          {/* Origin and Destination Search Inputs */}
          <div className="relative space-y-2">
            {/* Origin Input */}
            <div className="relative">
              <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <input
                type="text"
                value={originQuery}
                onChange={(e) => handleOriginSearch(e.target.value)}
                placeholder="Choose starting point or landmark..."
                className="w-full pl-9 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-background border border-border focus:outline-hidden focus:ring-2 focus:ring-quantum-500"
              />
              <button
                type="button"
                onClick={handleGeolocation}
                title="Use Current GPS Location"
                className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-quantum-600 transition-colors"
              >
                <Compass className="h-3.5 w-3.5" />
              </button>

              {/* Origin Autocomplete dropdown */}
              {originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  {originSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOrigin({ lat: item.lat, lng: item.lng, label: item.name });
                        setOriginQuery(item.name);
                        setOriginSuggestions([]);
                        fetchWeatherData(item.lat, item.lng);
                        fetchAirQualityData(item.lat, item.lng);
                        fetchChargingData(item.lat, item.lng);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted border-b border-border/40 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-navy-900 border border-border text-slate-600 dark:text-slate-300 font-medium shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap & Add Multiple Stops Controls */}
            <div className="flex items-center justify-between px-1 -my-0.5">
              <button
                type="button"
                onClick={addIntermediateStop}
                disabled={stops.length >= 3}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-quantum-600 dark:text-quantum-400 hover:text-quantum-700 disabled:opacity-40 transition-colors"
                title="Add intermediate stops to your route"
              >
                <Plus className="h-3 w-3" />
                <span>+ Add Stop {stops.length > 0 ? `(${stops.length}/3)` : ''}</span>
              </button>

              <button
                type="button"
                onClick={swapEndpoints}
                title="Swap Origin and Destination"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-xs"
              >
                <ArrowUpDown className="h-2.5 w-2.5" />
                <span>Swap</span>
              </button>
            </div>

            {/* Intermediate Stops Inputs */}
            {stops.map((stop, sIdx) => (
              <div key={stop.id} className="relative">
                <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
                <input
                  type="text"
                  value={stop.query}
                  onChange={(e) => handleStopSearch(sIdx, e.target.value)}
                  placeholder={`Stop ${sIdx + 1}: add city or address...`}
                  className="w-full pl-9 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-background border border-border focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => removeIntermediateStop(sIdx)}
                  className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                  title="Remove stop"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {stop.suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {stop.suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectStopLocation(sIdx, item)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted border-b border-border/40 last:border-0"
                      >
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Destination Input */}
            <div className="relative">
              <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20" />
              <input
                type="text"
                value={destQuery}
                onChange={(e) => handleDestSearch(e.target.value)}
                placeholder="Choose destination..."
                className="w-full pl-9 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-background border border-border focus:outline-hidden focus:ring-2 focus:ring-quantum-500"
              />

              {/* Destination Autocomplete dropdown */}
              {destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  {destSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDestination({ lat: item.lat, lng: item.lng, label: item.name });
                        setDestQuery(item.name);
                        setDestSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted border-b border-border/40 last:border-0"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="font-semibold text-foreground truncate">{item.name}</p>
                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-navy-900 border border-border text-slate-600 dark:text-slate-300 font-medium shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets for Demo */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-muted-foreground scrollbar-none">
            <span className="font-semibold shrink-0">Quick Trips:</span>
            <button
              type="button"
              onClick={() => {
                const jaipur = { lat: 26.9124, lng: 75.7873, label: 'Jaipur, Rajasthan' };
                const delhi = { lat: 28.6139, lng: 77.2090, label: 'New Delhi' };
                setOrigin(jaipur);
                setOriginQuery('Jaipur, Rajasthan');
                setDestination(delhi);
                setDestQuery('New Delhi');
                fetchAirQualityData(jaipur.lat, jaipur.lng);
                fetchChargingData(jaipur.lat, jaipur.lng);
              }}
              className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-500/20 shrink-0 font-medium"
            >
              🇮🇳 Jaipur → Delhi
            </button>
            <button
              type="button"
              onClick={() => {
                setOrigin(PRESET_LOCATIONS[0]);
                setOriginQuery(PRESET_LOCATIONS[0].name);
                setDestination(PRESET_LOCATIONS[1]);
                setDestQuery(PRESET_LOCATIONS[1].name);
                fetchAirQualityData(PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lng);
                fetchChargingData(PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lng);
              }}
              className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 shrink-0"
            >
              BLR: Koramangala → ITPL
            </button>
            <button
              type="button"
              onClick={() => {
                setOrigin(PRESET_LOCATIONS[5]);
                setOriginQuery(PRESET_LOCATIONS[5].name);
                setDestination(PRESET_LOCATIONS[6]);
                setDestQuery(PRESET_LOCATIONS[6].name);
                fetchAirQualityData(PRESET_LOCATIONS[5].lat, PRESET_LOCATIONS[5].lng);
                fetchChargingData(PRESET_LOCATIONS[5].lat, PRESET_LOCATIONS[5].lng);
              }}
              className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 shrink-0"
            >
              DEL: CP → Cyber City
            </button>
            <button
              type="button"
              onClick={() => {
                const mum = { lat: 19.0760, lng: 72.8777, label: 'Mumbai, Maharashtra (IN11)' };
                const pun = { lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' };
                setOrigin(mum);
                setOriginQuery('Mumbai, Maharashtra');
                setDestination(pun);
                setDestQuery('Pune, Maharashtra');
                fetchAirQualityData(mum.lat, mum.lng);
                fetchChargingData(mum.lat, mum.lng);
              }}
              className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 shrink-0"
            >
              MUM → PUN Expressway
            </button>
          </div>

          {/* Expandable Preferences Box */}
          {showPreferences && (
            <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-3 animate-accordion-down">
              <VehicleSelector
                selectedType={vehicleType}
                onSelect={(type) => setVehicleType(type)}
                compact
              />
              <ObjectiveSelector
                selectedObjective={objective}
                onSelectObjective={(obj) => setObjective(obj)}
                showWeightsTuner={false}
              />
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avoidTolls}
                    onChange={(e) => setAvoidTolls(e.target.checked)}
                    className="rounded border-border text-quantum-500 focus:ring-quantum-500"
                  />
                  <span>Avoid Toll Roads</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-emerald-700 dark:text-emerald-300">
                  <input
                    type="checkbox"
                    checked={showEVChargers}
                    onChange={(e) => setShowEVChargers(e.target.checked)}
                    className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Show EV Fast Charging Hubs</span>
                </label>
              </div>
            </div>
          )}

          {/* Plan Route Trigger: One clear Find Best Route button */}
          <button
            type="button"
            onClick={fetchRouteData}
            disabled={isLoadingRoutes}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all disabled:opacity-50"
          >
            {isLoadingRoutes ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Computing Best Routes...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-quantum-300" />
                <span>Find Best Route</span>
              </>
            )}
          </button>
        </div>

        {/* Route Alternatives List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Route Alternatives ({routes.length})</span>
            {selectedRoute && (
              <button
                type="button"
                onClick={handleSaveRoute}
                className="inline-flex items-center gap-1 text-quantum-600 dark:text-quantum-400 hover:underline"
              >
                {isSavedSuccessfully ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Saved!
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-3.5 w-3.5" /> Save Route
                  </>
                )}
              </button>
            )}
          </div>

          {routes.length === 0 && !isLoadingRoutes && (
            <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
              <Navigation className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p>Select origin and destination and click Calculate.</p>
            </div>
          )}

          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={route.id === selectedRouteId}
              onSelect={() => setSelectedRouteId(route.id)}
            />
          ))}

          {/* Selected Route Turn-by-Turn Guidance */}
          {selectedRoute && selectedRoute.instructions?.length > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-border bg-card space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Corridor Guidance
              </h4>
              <div className="space-y-2 text-xs">
                {selectedRoute.instructions.map((step, idx) => (
                  <div key={step.id || idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="h-4 w-4 rounded-full bg-slate-200 dark:bg-navy-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{step.text}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{formatDistance(step.distanceKm)}</span>
                        <span>•</span>
                        <span>{formatDuration(step.durationMin)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Leaflet Interactive Map */}
      <div className="flex-1 relative h-full flex flex-col">
        {/* Floating Top Stats Header Overlay */}
        {selectedRoute && (
          <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
            <div className="pointer-events-auto bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-xl px-4 py-2 flex items-center gap-4 text-xs font-semibold">
              <div>
                <span className="text-[10px] text-muted-foreground block">ESTIMATED ETA</span>
                <span className="text-sm font-extrabold text-foreground">{formatDuration(selectedRoute.durationMin)}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <span className="text-[10px] text-muted-foreground block">DISTANCE</span>
                <span className="text-sm font-extrabold text-foreground">{formatDistance(selectedRoute.distanceKm)}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <span className="text-[10px] text-muted-foreground block">ENERGY COST</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedRoute.fuelCostInr)}
                </span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <span className="text-[10px] text-muted-foreground block">CO₂ EMISSIONS</span>
                <span className="text-sm font-extrabold text-foreground">
                  {formatEmissions(selectedRoute.emissionsKg)}
                </span>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border px-3 py-1.5 rounded-xl shadow-md text-xs">
              <StatusBadge status={selectedRoute.dataStatus} />
              <button
                type="button"
                onClick={() => setShowEVChargers(!showEVChargers)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] border transition-colors ${
                  showEVChargers
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
                title="Toggle EV charging stations layer"
              >
                <BatteryCharging className="h-3.5 w-3.5" />
                <span>EV Hubs ({chargingStations.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTrafficFlow(!showTrafficFlow)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] border transition-colors ${
                  showTrafficFlow
                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-400'
                    : 'bg-muted text-muted-foreground'
                }`}
                title="Toggle Live Congestion Flow Overlay"
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Traffic Flow Heatmap</span>
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
      </div>
    </div>
  );
}

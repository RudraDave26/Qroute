'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapWrapper } from '@/components/Map/MapWrapper';
import { RouteCard } from '@/components/RouteCard';
import {
  LatLng,
  RouteAlternative,
  TrafficIncident,
  VehicleType,
  OptimizationObjective,
  WeatherCondition,
  AirQualityData,
  EVChargingStation,
  IntermediatePlace,
} from '@/lib/types';
import { saveRoute } from '@/lib/storage';
import {
  ArrowUpDown,
  Navigation,
  Compass,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  RefreshCw,
  Check,
  Wind,
  BatteryCharging,
  X,
  Sparkles,
  Hotel,
  Trees,
  Plus,
  MapPin,
  Star,
} from 'lucide-react';
import { formatCurrency, formatDistance, formatDuration, formatEmissions } from '@/lib/utils';

function DashboardContent() {
  const searchParams = useSearchParams();

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

  // Results state
  const [routes, setRoutes] = useState<RouteAlternative[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [chargingStations, setChargingStations] = useState<EVChargingStation[]>([]);
  const [fuelInfo, setFuelInfo] = useState<{ petrol: number; diesel: number; isLive: boolean } | null>(null);

  // Intermediate places along route corridor (Hotels & Parks)
  const [intermediatePlaces, setIntermediatePlaces] = useState<IntermediatePlace[]>([]);
  const [showIntermediatePlaces, setShowIntermediatePlaces] = useState(true);
  const [placeFilter, setPlaceFilter] = useState<'all' | 'hotel' | 'park'>('all');
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [showPlacesSection, setShowPlacesSection] = useState(true);

  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Initial fetch on mount & URL parameter parsing
  useEffect(() => {
    let initOrigin = { ...origin };
    let initDest = { ...destination };
    let initOriginQuery = originQuery;
    let initDestQuery = destQuery;
    let initVehicle = vehicleType;
    let initObj = objective;
    let hasCustomParam = false;

    if (searchParams) {
      // 1. Direct coordinates from saved routes or external links
      const lat1 = searchParams.get('lat1');
      const lng1 = searchParams.get('lng1');
      const lat2 = searchParams.get('lat2');
      const lng2 = searchParams.get('lng2');
      const label1 = searchParams.get('label1') || searchParams.get('originLabel');
      const label2 = searchParams.get('label2') || searchParams.get('destLabel');

      if (lat1 && lng1) {
        const pLat = parseFloat(lat1);
        const pLng = parseFloat(lng1);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          initOrigin = { lat: pLat, lng: pLng, label: label1 || `Location (${pLat.toFixed(3)}, ${pLng.toFixed(3)})` };
          initOriginQuery = initOrigin.label || '';
          hasCustomParam = true;
        }
      }

      if (lat2 && lng2) {
        const pLat = parseFloat(lat2);
        const pLng = parseFloat(lng2);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          initDest = { lat: pLat, lng: pLng, label: label2 || `Location (${pLat.toFixed(3)}, ${pLng.toFixed(3)})` };
          initDestQuery = initDest.label || '';
          hasCustomParam = true;
        }
      }

      // 2. Demo trip shortcuts from landing page
      const fromParam = searchParams.get('from')?.toLowerCase();
      const toParam = searchParams.get('to')?.toLowerCase();

      if (fromParam === 'koramangala' && toParam === 'whitefield') {
        initOrigin = { lat: 12.9352, lng: 77.6245, label: 'Koramangala 4th Block, Bengaluru' };
        initDest = { lat: 12.9698, lng: 77.7500, label: 'Whitefield ITPL, Bengaluru' };
        initOriginQuery = initOrigin.label || '';
        initDestQuery = initDest.label || '';
        initVehicle = 'ev';
        hasCustomParam = true;
      } else if (fromParam === 'cp' && toParam === 'cybercity') {
        initOrigin = { lat: 28.6315, lng: 77.2167, label: 'Connaught Place, New Delhi' };
        initDest = { lat: 28.4950, lng: 77.0895, label: 'DLF Cyber City, Gurugram' };
        initOriginQuery = initOrigin.label || '';
        initDestQuery = initDest.label || '';
        initVehicle = 'petrol';
        hasCustomParam = true;
      } else if (fromParam === 'nariman' && toParam === 'bkc') {
        initOrigin = { lat: 18.9269, lng: 72.8239, label: 'Nariman Point, Mumbai' };
        initDest = { lat: 19.0657, lng: 72.8687, label: 'Bandra Kurla Complex (BKC), Mumbai' };
        initOriginQuery = initOrigin.label || '';
        initDestQuery = initDest.label || '';
        initVehicle = 'cng';
        hasCustomParam = true;
      }

      // 3. Vehicle and objective params from Route Planner (/plan)
      const vehParam = searchParams.get('vehicle');
      if (vehParam && ['petrol', 'diesel', 'cng', 'ev', 'motorcycle'].includes(vehParam)) {
        initVehicle = vehParam as VehicleType;
        hasCustomParam = true;
      }

      const objParam = searchParams.get('objective');
      if (objParam && ['fastest', 'cheapest', 'shortest', 'eco', 'balanced'].includes(objParam)) {
        initObj = objParam as OptimizationObjective;
        hasCustomParam = true;
      }
    }

    if (hasCustomParam) {
      setOrigin(initOrigin);
      setOriginQuery(initOriginQuery);
      setDestination(initDest);
      setDestQuery(initDestQuery);
      setVehicleType(initVehicle);
      setObjective(initObj);
      fetchRouteData(initOrigin, initDest, initVehicle, initObj);
      fetchWeatherData(initOrigin.lat, initOrigin.lng);
      fetchAirQualityData(initOrigin.lat, initOrigin.lng);
      fetchChargingData(initOrigin.lat, initOrigin.lng);
    } else {
      fetchRouteData(origin, destination, vehicleType, objective);
      fetchWeatherData(origin.lat, origin.lng);
      fetchAirQualityData(origin.lat, origin.lng);
      fetchChargingData(origin.lat, origin.lng);
    }

    fetchIncidentData();
    fetchFuelPriceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch routes from API
  const fetchRouteData = async (
    customOrigin?: LatLng,
    customDest?: LatLng,
    customVehicle?: VehicleType,
    customObj?: OptimizationObjective
  ) => {
    setIsLoadingRoutes(true);
    const activeOrigin = customOrigin || origin;
    const activeDest = customDest || destination;
    const activeVehicle = customVehicle || vehicleType;
    const activeObj = customObj || objective;

    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: activeOrigin,
          destination: activeDest,
          stops: stops.filter((s) => s.lat && s.lng).map((s) => ({ lat: s.lat, lng: s.lng, label: s.label })),
          vehicleType: activeVehicle,
          objective: activeObj,
          avoidTolls,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoutes(data.routes || []);
        if (data.routes?.length > 0) {
          const rec = data.routes.find((r: RouteAlternative) => r.isRecommended) || data.routes[0];
          setSelectedRouteId(rec.id);
          fetchPlacesAlongRoute(activeOrigin, activeDest, rec.coordinates || []);
        }
      }
    } catch (e) {
      console.error('Failed to calculate routes:', e);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const fetchPlacesAlongRoute = async (
    activeOrigin: LatLng,
    activeDest: LatLng,
    coords: [number, number][] = []
  ) => {
    setIsLoadingPlaces(true);
    try {
      const res = await fetch('/api/places-along-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: activeOrigin,
          destination: activeDest,
          coordinates: coords,
          category: 'all',
          maxDistanceKm: 4.5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIntermediatePlaces(data.places || []);
      }
    } catch (e) {
      console.error('Failed to fetch intermediate places:', e);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const handleAddPlaceAsStop = (place: IntermediatePlace) => {
    if (stops.length >= 3) {
      alert('Maximum of 3 intermediate stops reached. Please remove one before adding another.');
      return;
    }
    if (stops.some((s) => Math.abs(s.lat - place.lat) < 0.001 && Math.abs(s.lng - place.lng) < 0.001)) {
      return;
    }
    const newStop = {
      id: `stop-${Date.now()}`,
      lat: place.lat,
      lng: place.lng,
      label: place.name,
      query: place.name,
      suggestions: [],
    };
    const nextStops = [...stops, newStop];
    setStops(nextStops);

    setIsLoadingRoutes(true);
    fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        stops: nextStops.filter((s) => s.lat && s.lng).map((s) => ({ lat: s.lat, lng: s.lng, label: s.label })),
        vehicleType,
        objective,
        avoidTolls,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRoutes(data.routes || []);
        if (data.routes?.length > 0) {
          const rec = data.routes.find((r: RouteAlternative) => r.isRecommended) || data.routes[0];
          setSelectedRouteId(rec.id);
          fetchPlacesAlongRoute(origin, destination, rec.coordinates || []);
        }
      })
      .catch((e) => console.error('Error adding stop and rerouting:', e))
      .finally(() => setIsLoadingRoutes(false));
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
      const res = await fetch('/api/fuel-prices?city=Bengaluru');
      if (res.ok) {
        const data = await res.json();
        setFuelInfo({
          petrol: data.prices?.petrol ?? 102.86,
          diesel: data.prices?.diesel ?? 88.94,
          isLive: data.dataStatus === 'LIVE' || data.isLive === true,
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

  const filteredPlaces = useMemo(() => {
    if (placeFilter === 'all') return intermediatePlaces;
    return intermediatePlaces.filter((p) => p.category === placeFilter);
  }, [intermediatePlaces, placeFilter]);

  const hotelCount = useMemo(
    () => intermediatePlaces.filter((p) => p.category === 'hotel').length,
    [intermediatePlaces]
  );
  const parkCount = useMemo(
    () => intermediatePlaces.filter((p) => p.category === 'park').length,
    [intermediatePlaces]
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-7 sm:space-y-9">
        {/* 1. Page Header & Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-quantum-500/15 text-quantum-700 dark:text-quantum-300 border border-quantum-500/30">
                QIGA Metaheuristic Routing
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground font-medium">
                Multi-Objective Corridor Optimization
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
              Traffic Route Optimization & Corridor Navigation
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Real-time congestion avoidance, powertrain fuel consumption, carbon emissions, and intermediate stays & recreation along route.
            </p>
          </div>

          {/* Telemetry badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-foreground">Traffic Engine:</span>
              <span className="text-muted-foreground font-medium">Live OSRM</span>
            </div>
            {fuelInfo && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border shadow-xs">
                <span className="text-quantum-600 dark:text-quantum-400 font-bold">₹</span>
                <span className="font-semibold text-foreground">Petrol:</span>
                <span className="text-muted-foreground font-medium">₹{fuelInfo.petrol.toFixed(1)}/L</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Route Planning Console Card (Spacious, unified control panel) */}
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border/60">
            {/* Powertrain selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">Vehicle:</span>
              {[
                { id: 'petrol', label: 'Petrol', icon: '⛽' },
                { id: 'diesel', label: 'Diesel', icon: '🛢️' },
                { id: 'cng', label: 'CNG', icon: '🌱' },
                { id: 'ev', label: 'Electric EV', icon: '⚡' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleType(v.id as VehicleType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    vehicleType === v.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{v.icon}</span>
                  <span>{v.label}</span>
                </button>
              ))}
            </div>

            {/* Objective selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">Objective:</span>
              {[
                { id: 'balanced', label: 'Balanced ⚖️' },
                { id: 'fastest', label: 'Fastest ⚡' },
                { id: 'cheapest', label: 'Cheapest 💰' },
                { id: 'eco', label: 'Eco-Friendly 🌿' },
                { id: 'shortest', label: 'Shortest 📏' },
              ].map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => setObjective(obj.id as OptimizationObjective)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    objective === obj.id
                      ? 'bg-quantum-500/20 text-quantum-700 dark:text-quantum-300 border border-quantum-500/40 font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {obj.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Origin Input (5 cols on md) */}
            <div className="md:col-span-5 relative">
              <div className="absolute left-3.5 top-3.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <input
                type="text"
                value={originQuery}
                onChange={(e) => handleOriginSearch(e.target.value)}
                placeholder="Departure location (e.g. Koramangala, Connaught Place)..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm bg-background border border-border text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-quantum-500/40 shadow-xs"
              />
              <button
                type="button"
                onClick={handleGeolocation}
                title="Use Current GPS"
                className="absolute right-3 top-3 p-1 text-muted-foreground hover:text-quantum-600 transition-colors"
              >
                <Compass className="h-4 w-4" />
              </button>

              {originSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto">
                  {originSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setOrigin({ lat: item.lat, lng: item.lng, label: item.name });
                        setOriginQuery(item.name);
                        setOriginSuggestions([]);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-muted border-b border-border/50 last:border-0"
                    >
                      <p className="font-bold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Swap Button (1 col or centered) */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={swapEndpoints}
                title="Swap Origin and Destination"
                className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all hover:scale-110 active:scale-95 shadow-xs"
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>

            {/* Destination Input (4 cols on md) */}
            <div className="md:col-span-4 relative">
              <div className="absolute left-3.5 top-3.5 h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
              <input
                type="text"
                value={destQuery}
                onChange={(e) => handleDestSearch(e.target.value)}
                placeholder="Destination location (e.g. Whitefield, Cyber City)..."
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl text-xs sm:text-sm bg-background border border-border text-foreground font-medium focus:outline-hidden focus:ring-2 focus:ring-quantum-500/40 shadow-xs"
              />

              {destSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto">
                  {destSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDestination({ lat: item.lat, lng: item.lng, label: item.name });
                        setDestQuery(item.name);
                        setDestSuggestions([]);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-muted border-b border-border/50 last:border-0"
                    >
                      <p className="font-bold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Find Best Route CTA (2 cols on md) */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => fetchRouteData()}
                disabled={isLoadingRoutes}
                className="w-full min-h-[46px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoadingRoutes ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-quantum-300" />
                    <span>Find Best Route</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Waypoints row & Custom Stop addition */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={addIntermediateStop}
                disabled={stops.length >= 3}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-quantum-600 dark:text-quantum-400 hover:underline disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Custom Stop {stops.length > 0 ? `(${stops.length}/3)` : ''}</span>
              </button>
              <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                You can also add any Hotel 🏨 or Park 🌳 below directly into your route!
              </span>
            </div>
          </div>

          {/* Configured Waypoints List */}
          {stops.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {stops.map((stop, sIdx) => (
                <div key={stop.id} className="relative">
                  <div className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
                  <input
                    type="text"
                    value={stop.query}
                    onChange={(e) => handleStopSearch(sIdx, e.target.value)}
                    placeholder={`Stop #${sIdx + 1}...`}
                    className="w-full pl-8 pr-8 py-2 rounded-xl text-xs bg-background border border-border text-foreground font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => removeIntermediateStop(sIdx)}
                    className="absolute right-2.5 top-2.5 p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {stop.suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                      {stop.suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectStopLocation(sIdx, item)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted border-b border-border/50 last:border-0"
                        >
                          <p className="font-semibold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{item.displayName}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Interactive Map (Full-width, expansive responsive canvas) */}
        <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-border">
          {/* Floating Top Journey HUD */}
          {selectedRoute && (
            <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 pointer-events-none flex flex-wrap items-center gap-2">
              <div className="pointer-events-auto bg-card/95 backdrop-blur-md border border-border shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2 sm:gap-3 text-xs font-semibold max-w-full overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                    {selectedRoute.name}
                  </span>
                </div>
                <div className="h-3.5 w-px bg-border shrink-0" />
                <div className="text-muted-foreground shrink-0 whitespace-nowrap">
                  ETA: <strong className="text-foreground">{formatDuration(selectedRoute.durationMin)}</strong>
                </div>
                <div className="h-3.5 w-px bg-border shrink-0" />
                <div className="text-muted-foreground shrink-0 whitespace-nowrap">
                  Dist: <strong className="text-foreground">{formatDistance(selectedRoute.distanceKm)}</strong>
                </div>
                <div className="h-3.5 w-px bg-border shrink-0" />
                <div className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 whitespace-nowrap">
                  {formatCurrency(selectedRoute.fuelCostInr)}
                </div>
              </div>

              {/* Layer toggles */}
              <div className="pointer-events-auto flex items-center gap-1 bg-card/95 backdrop-blur-md border border-border px-2 py-1 rounded-2xl shadow-xs text-xs">
                <button
                  type="button"
                  onClick={() => setShowIntermediatePlaces(!showIntermediatePlaces)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                    showIntermediatePlaces
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Toggle Hotels & Parks Along Route"
                >
                  <span>🏨🌳</span>
                  <span>Places ({filteredPlaces.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEVChargers(!showEVChargers)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                    showEVChargers
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold'
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
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                    showTrafficFlow
                      ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold'
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

          {/* Map Canvas */}
          <div className="w-full h-full">
            <MapWrapper
              center={origin}
              zoom={12}
              origin={origin}
              destination={destination}
              stops={stops.filter((s) => s.lat && s.lng).map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, label: s.label || s.query }))}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => {
                setSelectedRouteId(id);
                const chosen = routes.find((r) => r.id === id);
                if (chosen) {
                  fetchPlacesAlongRoute(origin, destination, chosen.coordinates || []);
                }
              }}
              incidents={incidents}
              showIncidents={true}
              chargingStations={chargingStations}
              showChargingStations={showEVChargers}
              showTrafficFlow={showTrafficFlow}
              tomtomTrafficTileUrl={tomtomTileUrl}
              intermediatePlaces={filteredPlaces}
              showIntermediatePlaces={showIntermediatePlaces}
              onAddPlaceAsStop={handleAddPlaceAsStop}
            />
          </div>
        </div>

        {/* 4. Section: Route Alternatives & Rankings (Side-by-side Cards Grid) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground flex items-center gap-2">
                <Navigation className="h-5 w-5 text-quantum-600 dark:text-quantum-400" />
                <span>Recommended Route & Alternatives</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {routes.length} Available
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Evaluated against real traffic congestion, road topology, and vehicle powertrain models.
              </p>
            </div>

            {selectedRoute && (
              <button
                type="button"
                onClick={handleSaveRoute}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all shadow-xs shrink-0 self-start sm:self-auto"
              >
                {isSavedSuccessfully ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Route Saved!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4 text-quantum-600 dark:text-quantum-400" />
                    <span>Bookmark Route</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Loading Skeletons */}
          {isLoadingRoutes && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-32 rounded-md skeleton-shimmer" />
                    <div className="h-4 w-16 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="h-3 w-48 rounded-md skeleton-shimmer" />
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-10 rounded-xl skeleton-shimmer" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Route Cards Responsive Grid */}
          {!isLoadingRoutes && routes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={route.id === selectedRouteId}
                  onSelect={() => {
                    setSelectedRouteId(route.id);
                    fetchPlacesAlongRoute(origin, destination, route.coordinates || []);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 5. Section: Intermediate Places Along Route (Hotels 🏨 & Parks 🌳 in a Wide Responsive Grid) */}
        <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🏨🌳</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                  Places in Between (Hotels & Parks)
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-extrabold border border-purple-500/20">
                  {intermediatePlaces.length} En-Route
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Hotels, resorts, botanical gardens, and recreation spaces situated along your selected corridor (&le; 4.5 km off path). Tap &quot;+ Add Stop&quot; to divert seamlessly.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted border border-border text-xs shrink-0">
              <button
                type="button"
                onClick={() => setPlaceFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-center ${
                  placeFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({intermediatePlaces.length})
              </button>
              <button
                type="button"
                onClick={() => setPlaceFilter('hotel')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all text-center ${
                  placeFilter === 'hotel'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🏨</span>
                <span>Hotels ({hotelCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setPlaceFilter('park')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all text-center ${
                  placeFilter === 'park'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>🌳</span>
                <span>Parks ({parkCount})</span>
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoadingPlaces && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-border/70 space-y-2.5">
                  <div className="h-4 w-28 rounded-md skeleton-shimmer" />
                  <div className="h-3 w-40 rounded-md skeleton-shimmer" />
                  <div className="h-8 rounded-xl skeleton-shimmer mt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoadingPlaces && filteredPlaces.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-muted/30 border border-dashed border-border space-y-2">
              <p className="text-sm font-bold text-foreground">No places matching filter</p>
              <p className="text-xs text-muted-foreground">
                No intermediate {placeFilter === 'hotel' ? 'hotels' : placeFilter === 'park' ? 'parks' : 'places'} found directly adjacent to this corridor.
              </p>
            </div>
          )}

          {/* Places Grid: 4 columns on large screens, 3 on tablets/laptops, 2 on small tablets, 1 on mobile */}
          {!isLoadingPlaces && filteredPlaces.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlaces.map((place) => {
                const isAlreadyStop = stops.some(
                  (s) => Math.abs(s.lat - place.lat) < 0.001 && Math.abs(s.lng - place.lng) < 0.001
                );

                return (
                  <div
                    key={place.id}
                    className="group relative p-4 rounded-2xl border border-border bg-card hover:border-quantum-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      {/* Header badge & rating */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            place.category === 'hotel'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : place.category === 'park'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          <span>{place.category === 'hotel' ? '🏨 Hotel' : place.category === 'park' ? '🌳 Park' : '☕ Rest Stop'}</span>
                        </span>

                        {place.rating && (
                          <span className="text-xs font-extrabold text-amber-500 flex items-center gap-0.5">
                            ★ {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-quantum-600 dark:group-hover:text-quantum-400 transition-colors line-clamp-1" title={place.name}>
                          {place.name}
                        </h3>
                        {place.address && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{place.address}</p>
                        )}
                      </div>

                      {place.distanceFromRouteKm !== undefined && (
                        <span className="inline-block text-[11px] text-quantum-600 dark:text-quantum-400 font-semibold bg-quantum-500/10 px-2 py-0.5 rounded-md">
                          📍 {place.distanceFromRouteKm.toFixed(1)} km off corridor
                        </span>
                      )}

                      {place.amenities && place.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {place.amenities.slice(0, 3).map((amenity, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Stop Button */}
                    <div className="pt-2 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => handleAddPlaceAsStop(place)}
                        disabled={isAlreadyStop || stops.length >= 3}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isAlreadyStop
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-95'
                        } disabled:opacity-50`}
                      >
                        {isAlreadyStop ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Waypoint Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add as Waypoint Stop</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Section: Turn-by-Turn Guidance & Fleet Telemetry */}
        {selectedRoute && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Turn-by-Turn Guidance (7 cols) */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <h3 className="font-extrabold text-base sm:text-lg text-foreground flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-quantum-600 dark:text-quantum-400" />
                  <span>Turn-by-Turn Driving Directions</span>
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  {selectedRoute.instructions?.length || 0} maneuvers
                </span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                {selectedRoute.instructions?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40 text-xs sm:text-sm">
                    <span className="h-6 w-6 rounded-full bg-quantum-500/15 text-quantum-700 dark:text-quantum-300 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground leading-snug">{step.text}</p>
                      <span className="text-xs text-muted-foreground font-medium block mt-1">
                        {formatDistance(step.distanceKm)} • {formatDuration(step.durationMin)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fleet Telemetry & Weather Overview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Powertrain summary */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-md space-y-4">
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <span>⚡</span>
                  <span>Powertrain & Environmental Impact</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Energy / Fuel
                    </span>
                    <span className="text-lg font-black text-foreground block mt-1">
                      {selectedRoute.energyUsedUnits} units
                    </span>
                    <span className="text-[10px] text-muted-foreground">Estimated consumption</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Carbon Footprint
                    </span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                      {formatEmissions(selectedRoute.emissionsKg)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">CO₂ emissions</span>
                  </div>
                </div>
              </div>

              {/* Weather & Air Quality */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-md space-y-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <span>🌦️</span>
                  <span>Atmospheric Conditions</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Weather</span>
                    <span className="font-extrabold text-foreground text-sm block mt-0.5">
                      {weather ? `${Math.round(weather.temperatureC)}°C, ${weather.description}` : '24°C, Clear'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Humidity: {weather?.humidityPercent ?? 65}%</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Air Quality</span>
                    <span className="font-extrabold text-foreground text-sm block mt-0.5">
                      {airQuality ? `AQI ${airQuality.usAqi} (${airQuality.category})` : 'AQI 68 (Moderate)'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PM2.5: {airQuality?.pm25 ?? 18} µg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-quantum-500 border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-muted-foreground">Loading Route Navigation Canvas...</span>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

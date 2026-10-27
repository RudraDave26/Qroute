'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LatLng, RouteAlternative, TrafficIncident, EVChargingStation, IntermediatePlace } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration, cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Zap,
  Plus,
  Minus,
  Crosshair,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface MapStop {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

interface InteractiveMapProps {
  center?: LatLng;
  zoom?: number;
  origin?: LatLng | null;
  destination?: LatLng | null;
  stops?: MapStop[];
  routes?: RouteAlternative[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  incidents?: TrafficIncident[];
  showIncidents?: boolean;
  chargingStations?: EVChargingStation[];
  showChargingStations?: boolean;
  showTrafficFlow?: boolean;
  tomtomTrafficTileUrl?: string;
  intermediatePlaces?: IntermediatePlace[];
  showIntermediatePlaces?: boolean;
  onAddPlaceAsStop?: (place: IntermediatePlace) => void;
}

// Smooth bounds fitter when endpoints, waypoints, or route selection changes
function MapBoundsController({
  origin,
  destination,
  stops,
  routes,
  selectedRouteId,
}: {
  origin?: LatLng | null;
  destination?: LatLng | null;
  stops?: MapStop[];
  routes?: RouteAlternative[];
  selectedRouteId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const boundsPoints: [number, number][] = [];

    if (origin) boundsPoints.push([origin.lat, origin.lng]);
    if (destination) boundsPoints.push([destination.lat, destination.lng]);
    stops?.forEach((s) => boundsPoints.push([s.lat, s.lng]));

    const activeRoute = routes?.find((r) => r.id === selectedRouteId) || routes?.[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      activeRoute.coordinates.forEach((pt) => boundsPoints.push(pt));
    }

    if (boundsPoints.length >= 2) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 13, { animate: true });
    }
  }, [origin, destination, stops, routes, selectedRouteId, map]);

  return null;
}

// Floating Zoom and Recenter Controls inside the Leaflet map container
function MapFloatingControls({
  origin,
  destination,
  stops,
  routes,
  selectedRouteId,
}: {
  origin?: LatLng | null;
  destination?: LatLng | null;
  stops?: MapStop[];
  routes?: RouteAlternative[];
  selectedRouteId?: string | null;
}) {
  const map = useMap();

  const handleRecenter = () => {
    const boundsPoints: [number, number][] = [];
    if (origin) boundsPoints.push([origin.lat, origin.lng]);
    if (destination) boundsPoints.push([destination.lat, destination.lng]);
    stops?.forEach((s) => boundsPoints.push([s.lat, s.lng]));
    const activeRoute = routes?.find((r) => r.id === selectedRouteId) || routes?.[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      activeRoute.coordinates.forEach((pt) => boundsPoints.push(pt));
    }
    if (boundsPoints.length >= 2) {
      map.fitBounds(L.latLngBounds(boundsPoints), { padding: [60, 60], maxZoom: 15, animate: true });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 13, { animate: true });
    }
  };

  return (
    <div className="leaflet-bottom leaflet-right pointer-events-auto mb-36 md:mb-4 mr-3 z-[1000] flex flex-col gap-2">
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-md rounded-xl overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="p-2.5 hover:bg-muted text-foreground transition-colors border-b border-border flex items-center justify-center hover:text-quantum-600 active:scale-95"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="p-2.5 hover:bg-muted text-foreground transition-colors flex items-center justify-center hover:text-quantum-600 active:scale-95"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleRecenter}
        className="p-2.5 bg-card/95 backdrop-blur-md hover:bg-card border border-border text-foreground shadow-md rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 group"
        title="Recenter Route"
        aria-label="Recenter route"
      >
        <Crosshair className="h-4 w-4 text-quantum-600 dark:text-quantum-400 transition-transform duration-300 group-hover:rotate-45" />
      </button>
    </div>
  );
}

// Compact, elegant legend for traffic severity colours, incident markers & route corridors
function MapLegendControl() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="leaflet-bottom leaflet-left pointer-events-auto mb-36 md:mb-4 ml-3 z-[1000]">
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-md rounded-xl overflow-hidden transition-all duration-200 max-w-[210px] sm:max-w-[230px]">
        {/* Header toggle button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px] font-bold text-foreground hover:bg-muted/60 transition-colors"
          title={isExpanded ? 'Collapse Legend' : 'Expand Legend'}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-quantum-600 dark:text-quantum-400" />
            <span>Map Legend</span>
          </div>
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', isExpanded ? 'rotate-180' : '')} />
        </button>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-2.5 pt-1 space-y-2 border-t border-border/60 text-[10px]">
            {/* Traffic Delay Severity */}
            <div>
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px] block mb-1">
                Traffic Delay
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10b981] shrink-0" />
                  <span className="text-foreground font-medium">Smooth (&lt;15% delay)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b] shrink-0" />
                  <span className="text-foreground font-medium">Moderate (15–30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444] shrink-0" />
                  <span className="text-foreground font-medium">Heavy (&gt;30% delay)</span>
                </div>
              </div>
            </div>

            {/* Map & Incident Markers */}
            <div>
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px] block mb-1">
                Markers
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                    A
                  </span>
                  <span className="text-foreground font-medium">Departure Origin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                    B
                  </span>
                  <span className="text-foreground font-medium">Destination</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-md bg-amber-500 text-white font-black text-[9px] flex items-center justify-center shrink-0">
                    !
                  </span>
                  <span className="text-foreground font-medium">Incident / Hazard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-cyan-500 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                    ⚡
                  </span>
                  <span className="text-foreground font-medium">EV Fast Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                    🏨
                  </span>
                  <span className="text-foreground font-medium">Hotel / Stay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-600 text-white font-bold text-[8px] flex items-center justify-center shrink-0">
                    🌳
                  </span>
                  <span className="text-foreground font-medium">Park / Recreation</span>
                </div>
              </div>
            </div>

            {/* Route Corridors */}
            <div className="pt-1 border-t border-border/40">
              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px] block mb-1">
                Corridors
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-1 w-4 rounded-full bg-cyan-500 shrink-0 shadow-xs shadow-cyan-500/50" />
                  <span className="text-foreground font-medium">Selected Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-4 border-b border-dashed border-slate-400 shrink-0" />
                  <span className="text-foreground font-medium">Alternative</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveMap({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 12,
  origin,
  destination,
  stops = [],
  routes = [],
  selectedRouteId,
  onSelectRoute,
  incidents = [],
  showIncidents = true,
  chargingStations = [],
  showChargingStations = true,
  showTrafficFlow = false,
  tomtomTrafficTileUrl = '',
  intermediatePlaces = [],
  showIntermediatePlaces = true,
  onAddPlaceAsStop,
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Crisp, elegant static pin icons (no excessive pulsing motion)
  const originIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: #10b981; border: 2.5px solid #FFFFFF; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center;">
            <span style="color: #FFFFFF; font-size: 11px; font-weight: 800; font-family: ui-sans-serif, system-ui;">A</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  const destinationIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 26px; height: 26px; border-radius: 50%; background: #ef4444; border: 2.5px solid #FFFFFF; box-shadow: 0 3px 8px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center;">
            <span style="color: #FFFFFF; font-size: 11px; font-weight: 800; font-family: ui-sans-serif, system-ui;">B</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  const createStopIcon = (idx: number) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #f59e0b; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: center;">
            <span style="color: #FFFFFF; font-size: 10px; font-weight: 800; font-family: ui-sans-serif, system-ui;">${idx + 1}</span>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const incidentIcon = (severity: TrafficIncident['severity']) => {
    const bgColor = severity === 'critical' ? '#ef4444' : severity === 'major' ? '#f59e0b' : '#f59e0b';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="width: 22px; height: 22px; border-radius: 6px; background-color: ${bgColor}; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
          <span style="color: #FFFFFF; font-weight: 900; font-size: 11px; line-height: 1;">!</span>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  };

  const chargingIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #06b6d4; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(6, 182, 212, 0.35); display: flex; align-items: center; justify-content: center;">
          <span style="color: #FFFFFF; font-size: 10px; font-weight: bold; line-height: 1;">⚡</span>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }, []);

  const createPlaceIcon = (category: string) => {
    const isHotel = category === 'hotel';
    const isPark = category === 'park';
    const bg = isHotel ? '#7c3aed' : isPark ? '#059669' : '#0284c7';
    const iconChar = isHotel ? '🏨' : isPark ? '🌳' : '☕';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${bg}; border: 2px solid #FFFFFF; box-shadow: 0 2px 7px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <span style="font-size: 12px; line-height: 1;">${iconChar}</span>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -10],
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[450px] flex items-center justify-center bg-muted/40 rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 rounded-full border-2 border-quantum-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">Loading Map View...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden shadow-inner border border-border group">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap (OSM) Tile Layer with Verified Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors | QuantumRoute AI'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Optional Traffic Flow Raster Layer */}
        {showTrafficFlow && tomtomTrafficTileUrl && (
          <TileLayer
            attribution="&copy; TomTom Traffic Flow | QuantumRoute AI"
            url={tomtomTrafficTileUrl}
            maxZoom={19}
            opacity={0.65}
          />
        )}

        {/* Automated View Bounds Controller */}
        <MapBoundsController
          origin={origin}
          destination={destination}
          stops={stops}
          routes={routes}
          selectedRouteId={selectedRouteId}
        />

        {/* Floating Zoom & Recenter Controls */}
        <MapFloatingControls
          origin={origin}
          destination={destination}
          stops={stops}
          routes={routes}
          selectedRouteId={selectedRouteId}
        />

        {/* Compact Legend for Traffic Colours and Incident Markers */}
        <MapLegendControl />

        {/* Origin Marker (Point A) */}
        {origin && originIcon && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div className="p-1 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Departure Point (A)
                </span>
                <p className="text-xs font-bold text-foreground">{origin.label || 'Origin'}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Intermediate Stops (Waypoints) */}
        {stops &&
          stops.map((stop, sIdx) => (
            <Marker key={stop.id || sIdx} position={[stop.lat, stop.lng]} icon={createStopIcon(sIdx)}>
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                    Stop #{sIdx + 1}
                  </span>
                  <p className="text-xs font-bold text-foreground">{stop.label}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Destination Marker (Point B) */}
        {destination && destinationIcon && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="p-1 space-y-1">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  Destination (B)
                </span>
                <p className="text-xs font-bold text-foreground">{destination.label || 'Destination'}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Traffic Incidents (Strictly Traffic Severity: Red / Amber) */}
        {showIncidents &&
          incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.location.lat, inc.location.lng]}
              icon={incidentIcon(inc.severity)}
            >
              <Popup>
                <div className="p-2 max-w-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {inc.type}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600">
                      +{Math.round(inc.delaySeconds / 60)} min delay
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{inc.roadName}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{inc.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* EV Fast Charging Hubs */}
        {showChargingStations &&
          chargingIcon &&
          chargingStations.map((st) => (
            <Marker key={st.id} position={[st.lat, st.lng]} icon={chargingIcon}>
              <Popup>
                <div className="p-2 max-w-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      ⚡ {st.powerKw} kW DC
                    </span>
                    <span className="text-[10px] text-muted-foreground">{st.connectionType}</span>
                  </div>
                  <p className="text-xs font-bold text-foreground">{st.title}</p>
                  <p className="text-[11px] text-muted-foreground">{st.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Intermediate Places (Hotels, Parks & Rest Stops Along Route) */}
        {showIntermediatePlaces &&
          intermediatePlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createPlaceIcon(place.category)}
            >
              <Popup>
                <div className="p-2 max-w-[240px] sm:max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        place.category === 'hotel'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : place.category === 'park'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {place.category === 'hotel'
                        ? '🏨 Hotel / Stay'
                        : place.category === 'park'
                        ? '🌳 Park / Recreation'
                        : '☕ Rest Stop'}
                    </span>
                    {place.rating && (
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5">
                        ★ {place.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-foreground leading-snug">{place.name}</p>
                  {place.address && (
                    <p className="text-[11px] text-muted-foreground leading-snug">{place.address}</p>
                  )}
                  {place.distanceFromRouteKm !== undefined && (
                    <p className="text-[10px] text-quantum-600 dark:text-quantum-400 font-semibold">
                      📍 {place.distanceFromRouteKm.toFixed(1)} km off route corridor
                    </p>
                  )}
                  {place.amenities && place.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {place.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                  {onAddPlaceAsStop && (
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => onAddPlaceAsStop(place)}
                        className="w-full py-1.5 px-2 rounded-lg text-[11px] font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add as Waypoint Stop</span>
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Alternative Routes (Subtle Slate Dashed Lines) */}
        {routes
          .filter((r) => r.id !== selectedRouteId)
          .map((route) => (
            <Polyline
              key={route.id}
              positions={route.coordinates}
              pathOptions={{
                color: '#94a3b8',
                weight: 3.5,
                opacity: 0.65,
                dashArray: '4, 8',
              }}
              eventHandlers={{
                click: () => onSelectRoute?.(route.id),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-foreground">{route.name}</p>
                    <button
                      type="button"
                      onClick={() => onSelectRoute?.(route.id)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-quantum-500/15 text-quantum-700 dark:text-quantum-300 hover:bg-quantum-500/25"
                    >
                      Select
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-1">
                    <span>{formatDistance(route.distanceKm)}</span>
                    <span>•</span>
                    <span>{formatDuration(route.durationMin)}</span>
                    <span>•</span>
                    <span className="text-foreground font-bold">{formatCurrency(route.fuelCostInr)}</span>
                  </div>
                </div>
              </Popup>
            </Polyline>
          ))}

        {/* Selected Route (Electric Cyan Glow Casing & Core) */}
        {routes
          .filter((r) => r.id === selectedRouteId)
          .map((route) => (
            <React.Fragment key={route.id}>
              {/* Outer Cyan Halo Casing */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#06b6d4',
                  weight: 10,
                  opacity: 0.35,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Sharp Electric Cyan Core */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#0891b2',
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      Selected Route
                    </span>
                    <p className="text-xs font-bold text-foreground">{route.name}</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground pt-1">
                      <span>{formatDistance(route.distanceKm)}</span>
                      <span>•</span>
                      <span>{formatDuration(route.durationMin)}</span>
                      <span>•</span>
                      <span className="text-quantum-600 dark:text-quantum-400">{formatCurrency(route.fuelCostInr)}</span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          ))}
      </MapContainer>
    </div>
  );
}

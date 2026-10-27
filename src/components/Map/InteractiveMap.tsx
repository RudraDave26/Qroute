'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LatLng, RouteAlternative, TrafficIncident, EVChargingStation } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Zap,
  Plus,
  Minus,
  Crosshair,
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
    <div className="leaflet-bottom leaflet-right pointer-events-auto mb-4 mr-3 z-[1000] flex flex-col gap-2">
      <div className="bg-card/95 backdrop-blur-md border border-border/80 shadow-lg rounded-xl overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="p-2.5 hover:bg-muted text-foreground transition-colors border-b border-border/60 flex items-center justify-center hover:text-quantum-600"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="p-2.5 hover:bg-muted text-foreground transition-colors flex items-center justify-center hover:text-quantum-600"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleRecenter}
        className="p-2.5 bg-card/95 backdrop-blur-md hover:bg-card border border-border/80 text-foreground shadow-lg rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 group"
        title="Recenter & Fit Active Route"
        aria-label="Recenter route"
      >
        <Crosshair className="h-4 w-4 text-quantum-600 dark:text-quantum-400 group-hover:rotate-45 transition-transform" />
      </button>
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
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom Animated HTML Pin Icons
  const originIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #10b981; opacity: 0.5; animation: leaflet-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #059669; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 11px; font-weight: 800; font-family: ui-sans-serif, system-ui;">A</span>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, []);

  const destinationIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #ef4444; opacity: 0.5; animation: leaflet-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: 26px; height: 26px; border-radius: 50%; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(239,68,68,0.5); display: flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 11px; font-weight: 800; font-family: ui-sans-serif, system-ui;">B</span>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, []);

  const createStopIcon = (idx: number) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: #f59e0b; opacity: 0.45; animation: leaflet-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #d97706; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(245,158,11,0.5); display: flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 10px; font-weight: 800; font-family: ui-sans-serif, system-ui;">${idx + 1}</span>
          </div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const incidentIcon = (severity: TrafficIncident['severity']) => {
    const bgColor = severity === 'critical' ? '#dc2626' : severity === 'major' ? '#ea580c' : '#d97706';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="background-color: ${bgColor}; width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
            <span style="color: #ffffff; font-weight: 900; font-size: 12px; line-height: 1;">!</span>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const chargingIcon = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="background: linear-gradient(135deg, #059669, #0284c7); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(2,132,199,0.4);">
            <span style="color: #ffffff; font-size: 11px; font-weight: bold; line-height: 1;">⚡</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[450px] flex items-center justify-center bg-slate-100 dark:bg-navy-950 rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-quantum-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Initializing Geospatial Canvas...</span>
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
        {/* Clean Modern Vector Basemap Tile Layer */}
        <TileLayer
          attribution="&copy; QuantumRoute AI Geospatial Network"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Optional Traffic Flow Raster Layer */}
        {showTrafficFlow && tomtomTrafficTileUrl && (
          <TileLayer
            attribution="&copy; QuantumRoute AI Flow Telemetry"
            url={tomtomTrafficTileUrl}
            maxZoom={19}
            opacity={0.7}
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

        {/* Origin Marker (Point A) */}
        {origin && originIcon && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div className="p-1 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Departure Point (A)
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{origin.label || 'Origin'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    Intermediate Waypoint #{sIdx + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{stop.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Destination (B)
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{destination.label || 'Destination'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Traffic Incidents */}
        {showIncidents &&
          incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.location.lat, inc.location.lng]}
              icon={incidentIcon(inc.severity)}
            >
              <Popup>
                <div className="p-2 max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                      {inc.type}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                      +{Math.round(inc.delaySeconds / 60)} min delay
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{inc.roadName}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{inc.description}</p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-border/50">
                    Reported: {new Date(inc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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
                <div className="p-2 max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                      ⚡ {st.powerKw} kW Fast DC
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {st.connectionType}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{st.title}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{st.address}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-border/50">
                    <span>Operator: {st.operator}</span>
                    <span>{st.numberOfPoints} Bays</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Alternative Routes (Inactive Polylines) */}
        {routes
          .filter((r) => r.id !== selectedRouteId)
          .map((route, idx) => {
            const altColors = ['#94a3b8', '#a855f7', '#f59e0b'];
            const color = altColors[idx % altColors.length];
            return (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                pathOptions={{
                  color,
                  weight: 4,
                  opacity: 0.65,
                  dashArray: '5, 8',
                }}
                eventHandlers={{
                  click: () => onSelectRoute?.(route.id),
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{route.name}</p>
                      <button
                        type="button"
                        onClick={() => onSelectRoute?.(route.id)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/25"
                      >
                        Switch to this
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{route.summary}</p>
                    <div className="flex items-center gap-3 text-xs pt-1 border-t border-border/50 font-semibold text-slate-700 dark:text-slate-300">
                      <span>{formatDistance(route.distanceKm)}</span>
                      <span>•</span>
                      <span>{formatDuration(route.durationMin)}</span>
                      <span>•</span>
                      <span>{formatCurrency(route.fuelCostInr)}</span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* Selected Route (Neon Glow polyline effect) */}
        {routes
          .filter((r) => r.id === selectedRouteId)
          .map((route) => (
            <React.Fragment key={route.id}>
              {/* Outer Cyan Halo Glow */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#06b6d4',
                  weight: 12,
                  opacity: 0.35,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Sharp High-Contrast Electric Core */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#0284c7',
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
                        Active Route
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Optimal Corridor
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{route.name}</p>
                    <div className="flex items-center gap-3 text-xs pt-1 border-t border-border/50 font-bold text-slate-800 dark:text-slate-200">
                      <span>{formatDistance(route.distanceKm)}</span>
                      <span>•</span>
                      <span>{formatDuration(route.durationMin)}</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(route.fuelCostInr)}</span>
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

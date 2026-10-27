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
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-md rounded-xl overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="p-2.5 hover:bg-muted text-foreground transition-colors border-b border-border flex items-center justify-center hover:text-quantum-600"
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
        className="p-2.5 bg-card/95 backdrop-blur-md hover:bg-card border border-border text-foreground shadow-md rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 group"
        title="Recenter Route"
        aria-label="Recenter route"
      >
        <Crosshair className="h-4 w-4 text-quantum-600 dark:text-quantum-400 transition-transform duration-300 group-hover:rotate-45" />
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
        {/* OpenStreetMap (OSM) Tile Layer */}
        <TileLayer
          attribution="&copy; QuantumRoute AI Geospatial Network"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Optional Traffic Flow Raster Layer */}
        {showTrafficFlow && tomtomTrafficTileUrl && (
          <TileLayer
            attribution="&copy; QuantumRoute AI Flow Telemetry"
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

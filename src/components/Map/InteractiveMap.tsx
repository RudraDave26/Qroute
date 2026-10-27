'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LatLng, RouteAlternative, TrafficIncident, EVChargingStation } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Construction, Flame, ShieldAlert, Zap, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  center?: LatLng;
  zoom?: number;
  origin?: LatLng | null;
  destination?: LatLng | null;
  routes?: RouteAlternative[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  incidents?: TrafficIncident[];
  showIncidents?: boolean;
  chargingStations?: EVChargingStation[];
  showChargingStations?: boolean;
}

// Controller component to smoothly pan/fit bounds when routes or endpoints change
function MapBoundsController({
  origin,
  destination,
  routes,
  selectedRouteId,
}: {
  origin?: LatLng | null;
  destination?: LatLng | null;
  routes?: RouteAlternative[];
  selectedRouteId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const boundsPoints: [number, number][] = [];

    if (origin) boundsPoints.push([origin.lat, origin.lng]);
    if (destination) boundsPoints.push([destination.lat, destination.lng]);

    const activeRoute = routes?.find((r) => r.id === selectedRouteId) || routes?.[0];
    if (activeRoute && activeRoute.coordinates.length > 0) {
      activeRoute.coordinates.forEach((pt) => boundsPoints.push(pt));
    }

    if (boundsPoints.length >= 2) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 13);
    }
  }, [origin, destination, routes, selectedRouteId, map]);

  return null;
}

export default function InteractiveMap({
  center = { lat: 12.9716, lng: 77.5946 }, // Default Bengaluru central
  zoom = 12,
  origin,
  destination,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  incidents = [],
  showIncidents = true,
  chargingStations = [],
  showChargingStations = true,
}: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-100 dark:bg-navy-900 rounded-2xl border border-border">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-quantum-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Loading OpenStreetMap Canvas...</span>
        </div>
      </div>
    );
  }

  // Create custom HTML icons safely inside client
  const originIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #ffffff;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const destinationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: #ffffff;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  const incidentIcon = (severity: TrafficIncident['severity']) => {
    const bgColor = severity === 'critical' ? '#dc2626' : severity === 'major' ? '#ea580c' : '#d97706';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="background-color: ${bgColor}; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.25);">
          <span style="color: #ffffff; font-weight: bold; font-size: 14px;">!</span>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const chargingIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background: linear-gradient(135deg, #059669, #0284c7); width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(2,132,199,0.35);">
        <span style="color: #ffffff; font-size: 12px; font-weight: bold;">⚡</span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

  const mapCenterLat = origin ? origin.lat : center.lat;
  const mapCenterLng = origin ? origin.lng : center.lng;

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden shadow-inner border border-border">
      {/* OSM Direct Link Overlay in top right */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto">
        <a
          href={`https://www.openstreetmap.org/#map=14/${mapCenterLat}/${mapCenterLng}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/90 backdrop-blur-md border border-border text-xs font-semibold text-foreground hover:bg-card shadow-md transition-all"
        >
          <span>Open in OpenStreetMap</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </a>
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapBoundsController
          origin={origin}
          destination={destination}
          routes={routes}
          selectedRouteId={selectedRouteId}
        />

        {/* Origin Marker */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-xs font-bold text-emerald-600 uppercase">Departure Point</span>
                <p className="text-sm font-semibold text-slate-800">{origin.label || 'Origin'}</p>
                <p className="text-xs text-slate-500">
                  {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-xs font-bold text-rose-600 uppercase">Destination</span>
                <p className="text-sm font-semibold text-slate-800">{destination.label || 'Destination'}</p>
                <p className="text-xs text-slate-500">
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
                <div className="p-2 max-w-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      {inc.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      +{Math.round(inc.delaySeconds / 60)} min delay
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{inc.roadName}</p>
                  <p className="text-xs text-slate-600 leading-snug">{inc.description}</p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t">
                    Reported: {new Date(inc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* EV Charging Stations (Open Charge Map) */}
        {showChargingStations &&
          chargingStations.map((st) => (
            <Marker
              key={st.id}
              position={[st.lat, st.lng]}
              icon={chargingIcon}
            >
              <Popup>
                <div className="p-2 max-w-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ⚡ {st.powerKw} kW Fast DC
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {st.connectionType}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{st.title}</p>
                  <p className="text-[11px] text-slate-600 leading-snug">{st.address}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t">
                    <span>Operator: {st.operator}</span>
                    <span>{st.numberOfPoints} Bays</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Route Polylines */}
        {routes
          .filter((r) => r.id !== selectedRouteId)
          .map((route, idx) => {
            const colors = ['#64748b', '#8b5cf6', '#d97706'];
            const color = colors[idx % colors.length];
            return (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                pathOptions={{
                  color,
                  weight: 5,
                  opacity: 0.6,
                  dashArray: '4, 8',
                }}
                eventHandlers={{
                  click: () => onSelectRoute?.(route.id),
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-bold text-slate-800">{route.name}</p>
                    <p className="text-xs text-slate-600">{route.summary}</p>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      <span><strong>{formatDistance(route.distanceKm)}</strong></span>
                      <span><strong>{formatDuration(route.durationMin)}</strong></span>
                      <span><strong>{formatCurrency(route.fuelCostInr)}</strong></span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* Render selected active route */}
        {routes
          .filter((r) => r.id === selectedRouteId)
          .map((route) => (
            <React.Fragment key={route.id}>
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#083344',
                  weight: 10,
                  opacity: 0.35,
                }}
              />
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: '#06b6d4',
                  weight: 6,
                  opacity: 0.95,
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                      Active Selection
                    </span>
                    <p className="text-xs font-bold text-slate-800">{route.name}</p>
                    <div className="flex items-center gap-3 text-xs pt-1 font-semibold text-slate-700">
                      <span>{formatDistance(route.distanceKm)}</span>
                      <span>{formatDuration(route.durationMin)}</span>
                      <span>{formatCurrency(route.fuelCostInr)}</span>
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

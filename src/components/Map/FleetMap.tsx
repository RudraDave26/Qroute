'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FleetVrpProblem, FleetVrpSolution, DeliveryStop } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/utils';
import { Layers, Crosshair, Plus, Minus, Truck, Package, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface FleetMapProps {
  problem: FleetVrpProblem;
  solution: FleetVrpSolution | null;
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicleId: string) => void;
}

// Controller to smoothly fit map bounds to depot and all delivery stops
function FleetBoundsController({ problem, solution }: { problem: FleetVrpProblem; solution: FleetVrpSolution | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !problem) return;

    const points: [number, number][] = [];

    // Add depot
    if (problem.depot) {
      points.push([problem.depot.lat, problem.depot.lng]);
    }

    // Add all stops
    problem.stops.forEach((s) => {
      points.push([s.lat, s.lng]);
    });

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    } else if (problem.depot) {
      map.setView([problem.depot.lat, problem.depot.lng], 12, { animate: true });
    }
  }, [map, problem, solution]);

  return null;
}

// Custom Floating Controls
function FleetMapControls({ problem }: { problem: FleetVrpProblem }) {
  const map = useMap();

  const handleRecenter = () => {
    const points: [number, number][] = [];
    if (problem.depot) points.push([problem.depot.lat, problem.depot.lng]);
    problem.stops.forEach((s) => points.push([s.lat, s.lng]));

    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15, animate: true });
    } else if (problem.depot) {
      map.setView([problem.depot.lat, problem.depot.lng], 12, { animate: true });
    }
  };

  return (
    <div className="leaflet-bottom leaflet-right pointer-events-auto mb-5 mr-3 z-[1000] flex flex-col gap-2">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg rounded-xl overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="p-2.5 hover:bg-slate-800 text-slate-200 transition-colors border-b border-slate-700 flex items-center justify-center hover:text-cyan-400"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="p-2.5 hover:bg-slate-800 text-slate-200 transition-colors flex items-center justify-center hover:text-cyan-400"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={handleRecenter}
        className="p-2.5 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 border border-slate-700/80 text-cyan-400 shadow-lg rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
        title="Fit All Fleet Stops"
      >
        <Crosshair className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function FleetMap({ problem, solution, selectedVehicleId, onSelectVehicle }: FleetMapProps) {
  const [legendOpen, setLegendOpen] = useState(true);

  // Depot Icon
  const depotIcon = useMemo(() => {
    return L.divIcon({
      className: 'fleet-depot-icon',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(56, 189, 248, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 32px; height: 32px; border-radius: 10px; background: #0f172a; border: 2.5px solid #38bdf8; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.5); display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 16px; line-height: 1;">🏢</span>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  }, []);

  // Helper to create Stop Icon
  const createStopIcon = (color: string, seqNum: number | string, isColdChain: boolean = false) => {
    return L.divIcon({
      className: 'fleet-stop-icon',
      html: `
        <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">
            <span style="color: #ffffff; font-size: 11px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; line-height: 1;">
              ${seqNum}
            </span>
          </div>
          ${isColdChain ? `<div style="position: absolute; top: -5px; right: -5px; background: #0284c7; border: 1px solid #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 8px;">❄️</div>` : ''}
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -14],
    });
  };

  // Map of vehicleId -> color
  const vehicleColorMap = useMemo(() => {
    const map = new Map<string, string>();
    problem.vehicles.forEach((v) => {
      map.set(v.id, v.colorHex || '#3b82f6');
    });
    return map;
  }, [problem.vehicles]);

  // Build tour lines and metadata
  const tourSegments = useMemo(() => {
    if (!solution || !solution.tours) return [];

    return solution.tours.map((tour) => {
      const vehicle = problem.vehicles.find((v) => v.id === tour.vehicleId);
      const color = vehicle?.colorHex || vehicleColorMap.get(tour.vehicleId) || '#3b82f6';

      // Connect Depot -> Stop 1 -> Stop 2 -> ... -> Stop N -> Depot
      const points: [number, number][] = [];
      const depotCoord: [number, number] = [problem.depot.lat, problem.depot.lng];
      points.push(depotCoord);

      tour.stops.forEach((stop) => {
        points.push([stop.lat, stop.lng]);
      });

      // Close the loop back to depot
      if (tour.stops.length > 0) {
        points.push(depotCoord);
      }

      return {
        tour,
        vehicle,
        color,
        points,
      };
    });
  }, [solution, problem, vehicleColorMap]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={[problem.depot.lat, problem.depot.lng]}
        zoom={12}
        className="w-full h-full min-h-[500px] z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <FleetBoundsController problem={problem} solution={solution} />
        <FleetMapControls problem={problem} />

        {/* Central Depot Marker */}
        <Marker position={[problem.depot.lat, problem.depot.lng]} icon={depotIcon}>
          <Popup>
            <div className="p-2 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-sky-400">
                <span>🏢 Central Hub / Depot</span>
              </div>
              <div className="text-slate-700">Dispatch origin & return destination for all fleet vehicles.</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {problem.depot.lat.toFixed(4)}, {problem.depot.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Render Tour Routes if solution exists */}
        {tourSegments.map(({ tour, vehicle, color, points }) => {
          const isSelected = selectedVehicleId ? tour.vehicleId === selectedVehicleId : true;
          const strokeOpacity = selectedVehicleId ? (isSelected ? 0.95 : 0.25) : 0.85;
          const strokeWidth = selectedVehicleId && isSelected ? 5 : 3.5;

          return (
            <React.Fragment key={tour.vehicleId}>
              {/* Route Polyline */}
              {points.length > 1 && (
                <Polyline
                  positions={points}
                  pathOptions={{
                    color,
                    weight: strokeWidth,
                    opacity: strokeOpacity,
                    lineJoin: 'round',
                    lineCap: 'round',
                    dashArray: tour.stops.length === 0 ? '6, 8' : undefined,
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 font-bold" style={{ color }}>
                        <Truck className="w-3.5 h-3.5" />
                        <span>{tour.vehicleName}</span>
                        <span className="uppercase text-[9px] px-1 py-0.5 rounded bg-slate-100 border">
                          {tour.vehicleType}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                        <div>Stops: <span className="font-semibold">{tour.stops.length}</span></div>
                        <div>Distance: <span className="font-semibold">{formatDistance(tour.totalDistanceKm * 1000)}</span></div>
                        <div>Duration: <span className="font-semibold">{formatDuration(tour.totalDurationMin * 60)}</span></div>
                        <div>Cost: <span className="font-semibold text-emerald-600">{formatCurrency(tour.operatingCostInr)}</span></div>
                        <div>CO2: <span className="font-semibold">{tour.emissionsKg.toFixed(1)} kg</span></div>
                        <div>Payload: <span className="font-semibold">{tour.stops.reduce((s, x) => s + x.demandKg, 0)} kg</span></div>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              )}

              {/* Stop Markers in Sequence */}
              {tour.stops.map((stop, seqIdx) => {
                const stopIcon = createStopIcon(
                  color,
                  seqIdx + 1,
                  stop.requiredCapability === 'refrigerated'
                );

                return (
                  <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
                    <Popup>
                      <div className="p-2 space-y-1 text-xs max-w-[220px]">
                        <div className="flex items-center justify-between border-b pb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span
                              className="w-4 h-4 rounded-full text-white font-mono flex items-center justify-center text-[10px]"
                              style={{ backgroundColor: color }}
                            >
                              {seqIdx + 1}
                            </span>
                            {stop.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">{tour.vehicleName}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">{stop.address}</div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-amber-500" />
                            {stop.demandKg} kg
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-600" />
                            {stop.earliestArrivalMin}m - {stop.latestArrivalMin}m
                          </span>
                        </div>
                        {stop.requiredCapability === 'refrigerated' && (
                          <div className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            ❄️ Cold-chain vehicle verified
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </React.Fragment>
          );
        })}

        {/* If no solution yet, display all stops as unassigned grey pins */}
        {(!solution || solution.tours.length === 0) &&
          problem.stops.map((stop, idx) => {
            const unassignedIcon = createStopIcon('#64748b', idx + 1, stop.requiredCapability === 'refrigerated');
            return (
              <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={unassignedIcon}>
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <div className="font-bold text-slate-800">{stop.name}</div>
                    <div className="text-[11px] text-slate-600">{stop.address}</div>
                    <div className="text-[10px] text-slate-500">Demand: {stop.demandKg} kg | Window: {stop.earliestArrivalMin}-{stop.latestArrivalMin} min</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Unassigned stops warning markers if any remain after optimization */}
        {solution?.unassignedStops?.map((stop) => {
          const warningIcon = L.divIcon({
            className: 'unassigned-stop-icon',
            html: `
              <div style="width: 24px; height: 24px; border-radius: 50%; background: #ef4444; border: 2px dashed #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.6);">
                <span style="color: #ffffff; font-size: 12px; font-weight: 900;">!</span>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          return (
            <Marker key={`unassigned-${stop.id}`} position={[stop.lat, stop.lng]} icon={warningIcon}>
              <Popup>
                <div className="p-2 space-y-1 text-xs text-rose-700">
                  <div className="font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Unassigned Delivery Stop</span>
                  </div>
                  <div className="text-slate-700">{stop.name} ({stop.demandKg} kg)</div>
                  <div className="text-[10px] text-slate-500">
                    No available vehicle has remaining capacity or capability within time-window.
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Interactive Map Legend */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-xl rounded-xl overflow-hidden transition-all duration-200 max-w-[280px]">
          <button
            type="button"
            onClick={() => setLegendOpen(!legendOpen)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Fleet Dispatch Routes</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {solution?.tours ? `${solution.tours.length} tours` : `${problem.vehicles.length} vans`}
            </span>
          </button>

          {legendOpen && (
            <div className="p-3 pt-1 border-t border-slate-800 text-[11px] space-y-2">
              {/* Depot */}
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-base">🏢</span>
                <span className="font-medium text-sky-300">Depot Hub (Dispatch Point)</span>
              </div>

              {/* Vehicle list */}
              <div className="space-y-1.5 pt-1">
                {problem.vehicles.map((v) => {
                  const tour = solution?.tours.find((t) => t.vehicleId === v.id);
                  const stopCount = tour?.stops.length || 0;
                  const isSelected = selectedVehicleId === v.id;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelectVehicle?.(isSelected ? '' : v.id)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500/80 shadow'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: v.colorHex || '#3b82f6' }}
                        />
                        <div className="truncate">
                          <div className="font-medium text-slate-200 text-[11px] truncate">{v.name}</div>
                          <div className="text-[9px] text-slate-400 uppercase">{v.type} &bull; {v.capacityKg} kg</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-mono font-bold text-cyan-400">
                          {stopCount} stops
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

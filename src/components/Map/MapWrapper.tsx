'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { LatLng, RouteAlternative, TrafficIncident, EVChargingStation } from '@/lib/types';

const InteractiveMapInternal = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] flex items-center justify-center bg-slate-100 dark:bg-navy-900 rounded-2xl border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-quantum-500 border-t-transparent animate-spin" />
        <span className="text-sm font-medium text-muted-foreground">Initializing Geospatial Map Canvas...</span>
      </div>
    </div>
  ),
});

interface MapWrapperProps {
  center?: LatLng;
  zoom?: number;
  origin?: LatLng | null;
  destination?: LatLng | null;
  stops?: Array<{ id: string; lat: number; lng: number; label: string }>;
  routes?: RouteAlternative[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  incidents?: TrafficIncident[];
  showIncidents?: boolean;
  chargingStations?: EVChargingStation[];
  showChargingStations?: boolean;
  showTrafficFlow?: boolean;
  tomtomTrafficTileUrl?: string;
  defaultBasemap?: 'cyber-dark' | 'clean-light' | 'voyager' | 'standard';
}

export function MapWrapper(props: MapWrapperProps) {
  return <InteractiveMapInternal {...props} />;
}

'use client';

import React from 'react';
import { RouteAlternative } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDistance, formatDuration, formatEmissions, cn } from '@/lib/utils';
import { Clock, Fuel, Zap, Sparkles, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RouteCardProps {
  route: RouteAlternative;
  isSelected: boolean;
  onSelect: () => void;
}

export function RouteCard({ route, isSelected, onSelect }: RouteCardProps) {
  const isEV = route.dataSource?.toLowerCase().includes('ev') || false;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left',
        isSelected
          ? 'bg-quantum-500/5 dark:bg-quantum-500/10 border-quantum-500 ring-2 ring-quantum-500/20 shadow-md'
          : 'bg-card hover:bg-muted/60 border-border/80 shadow-xs'
      )}
    >
      {/* Recommendation Banner */}
      {route.isRecommended && (
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-quantum-500 text-white shadow-xs">
            <Sparkles className="h-3 w-3" />
            <span>Recommended Route</span>
          </div>
          <StatusBadge status={route.dataStatus} />
        </div>
      )}

      {!route.isRecommended && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Alternative Route
          </span>
          <StatusBadge status={route.dataStatus} />
        </div>
      )}

      {/* Title & Summary */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
            {route.name}
            {isSelected && <CheckCircle2 className="h-4 w-4 text-quantum-600 dark:text-quantum-400" />}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{route.summary}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-extrabold text-foreground">{formatDuration(route.durationMin)}</span>
          <p className="text-[11px] text-muted-foreground">{formatDistance(route.distanceKm)}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Traffic Delay</p>
            <p className={cn('font-semibold', route.trafficDelayMin > 5 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
              {route.trafficDelayMin > 0 ? `+${route.trafficDelayMin} min` : 'Clear flow'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Fuel className="h-3.5 w-3.5 text-quantum-600 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">Est. Fuel/Power</p>
            <p className="font-semibold text-foreground">{formatCurrency(route.fuelCostInr)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground">CO₂ Impact</p>
            <p className="font-semibold text-foreground">{formatEmissions(route.emissionsKg)}</p>
          </div>
        </div>
      </div>

      {/* Recommendation explanation note */}
      {route.recommendationReason && (
        <div className="mt-2.5 p-2 rounded-lg bg-slate-100/80 dark:bg-navy-900/60 text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Why this route: </span>
          {route.recommendationReason}
        </div>
      )}

      {/* Toll fee info if applicable */}
      {route.tollCostInr > 0 && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Includes estimated expressway toll:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(route.tollCostInr)}</span>
        </div>
      )}
    </div>
  );
}

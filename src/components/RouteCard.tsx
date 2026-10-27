'use client';

import React from 'react';
import { RouteAlternative } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDistance, formatDuration, formatEmissions, cn } from '@/lib/utils';
import { Clock, Fuel, Zap, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

interface RouteCardProps {
  route: RouteAlternative;
  isSelected: boolean;
  onSelect: () => void;
}

export function RouteCard({ route, isSelected, onSelect }: RouteCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left',
        isSelected
          ? 'bg-quantum-500/10 dark:bg-quantum-500/15 border-quantum-500 ring-2 ring-quantum-500/30 shadow-md'
          : 'bg-card hover:bg-muted/70 border-border/80 shadow-xs'
      )}
    >
      {/* Top Tag & Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {route.isRecommended ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-quantum-500 text-white shadow-xs">
            <Sparkles className="h-3 w-3" /> Best Choice (Recommended)
          </span>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
            Alternative Route
          </span>
        )}
        <StatusBadge status={route.dataStatus} showIcon={false} className="py-0 px-2 text-[10px]" />
      </div>

      {/* Main Headline: Time & Route Title */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors',
            isSelected ? 'border-quantum-600 bg-quantum-600' : 'border-muted-foreground/40'
          )}>
            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
          </div>
          <h3 className="text-base font-bold text-foreground">
            {route.name}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-foreground">{formatDuration(route.durationMin)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-1 ml-6">{route.summary}</p>

      {/* 3 Simple KPI Badges */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
        {/* Distance */}
        <div className="p-2 rounded-xl bg-background/80 border border-border/50 text-center">
          <span className="text-[10px] text-muted-foreground block font-medium">Distance</span>
          <span className="font-bold text-foreground">{formatDistance(route.distanceKm)}</span>
        </div>

        {/* Cost */}
        <div className="p-2 rounded-xl bg-background/80 border border-border/50 text-center">
          <span className="text-[10px] text-muted-foreground block font-medium">Est. Cost</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(route.fuelCostInr)}</span>
        </div>

        {/* Traffic Status */}
        <div className="p-2 rounded-xl bg-background/80 border border-border/50 text-center">
          <span className="text-[10px] text-muted-foreground block font-medium">Traffic</span>
          <span className={cn(
            'font-bold',
            route.trafficDelayMin > 5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
          )}>
            {route.trafficDelayMin > 0 ? `+${route.trafficDelayMin}m jam` : 'Smooth'}
          </span>
        </div>
      </div>

      {/* Plain English Reason Box */}
      {route.recommendationReason && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-100/90 dark:bg-navy-900/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-border/40">
          <strong className="text-foreground">Why this is recommended: </strong>
          {route.recommendationReason}
        </div>
      )}
    </div>
  );
}

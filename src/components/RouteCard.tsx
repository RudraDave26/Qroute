'use client';

import React from 'react';
import { RouteAlternative } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration, formatEmissions, cn } from '@/lib/utils';
import { Sparkles, Check } from 'lucide-react';

interface RouteCardProps {
  route: RouteAlternative;
  isSelected: boolean;
  onSelect: () => void;
}

export function RouteCard({ route, isSelected, onSelect }: RouteCardProps) {
  // Determine traffic severity indicator
  // Green for smooth (< 15% delay), Amber for moderate (15-30%), Red for heavy (> 30%)
  const trafficDelay = route.trafficDelayMin ?? 0;
  const isHeavy = trafficDelay > 15 || route.summary.toLowerCase().includes('heavy') || route.summary.toLowerCase().includes('congest');
  const isModerate = trafficDelay > 5 || route.summary.toLowerCase().includes('moderate');

  const trafficBadgeColor = isHeavy
    ? 'text-[#EF4444] bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50'
    : isModerate
    ? 'text-[#F59E0B] bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50'
    : 'text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50';

  const trafficLabel = isHeavy ? 'Heavy Delay' : isModerate ? 'Moderate' : 'Fast & Smooth';

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left w-full min-w-0',
        isSelected
          ? 'bg-card border-quantum-500 ring-2 ring-quantum-500/30 shadow-md'
          : 'bg-card border-border hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      )}
    >
      {/* Top Row: Route Status & Recommendation */}
      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          {route.isRecommended ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-quantum-500 text-white shrink-0">
              <Sparkles className="h-3 w-3" /> Recommended
            </span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
              Alternative
            </span>
          )}
        </div>

        {/* Traffic Severity Indicator (Green / Amber / Red specifically) */}
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap', trafficBadgeColor)}>
          {trafficLabel}
        </span>
      </div>

      {/* Main Headline: Name & Duration */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={cn(
              'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
              isSelected ? 'border-quantum-600 bg-quantum-600' : 'border-slate-300 dark:border-slate-600'
            )}
          >
            {isSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-foreground truncate" title={route.name}>
            {route.name}
          </h3>
        </div>

        <span className="text-base sm:text-lg font-extrabold text-foreground shrink-0 whitespace-nowrap">
          {formatDuration(route.durationMin)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">{route.summary}</p>

      {/* 4 KPI Metrics: 2 columns on mobile/compact panels, 4 columns on wider displays so route cards NEVER become too narrow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-border text-xs">
        <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">ETA</span>
          <span className="font-bold text-foreground text-xs sm:text-sm truncate">
            {new Date(Date.now() + route.durationMin * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Distance</span>
          <span className="font-bold text-foreground text-xs sm:text-sm truncate">
            {formatDistance(route.distanceKm)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Est. Cost</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm truncate">
            {formatCurrency(route.fuelCostInr)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-muted/60 flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wider block">Emissions</span>
          <span className="font-bold text-quantum-600 dark:text-quantum-400 text-xs sm:text-sm truncate">
            {formatEmissions(route.emissionsKg)}
          </span>
        </div>
      </div>
    </div>
  );
}

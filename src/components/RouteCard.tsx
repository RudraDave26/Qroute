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
        'group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left',
        isSelected
          ? 'bg-white dark:bg-[#0B1220] border-[#14B8A6] ring-1 ring-[#14B8A6]/40 shadow-sm'
          : 'bg-white dark:bg-[#101A30] border-[#E5E9F2] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      )}
    >
      {/* Top Row: Route Status & Recommendation */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {route.isRecommended ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14B8A6] text-white">
              <Sparkles className="h-3 w-3" /> Recommended
            </span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">
              Alternative
            </span>
          )}
        </div>

        {/* Traffic Severity Indicator (Green / Amber / Red specifically) */}
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', trafficBadgeColor)}>
          {trafficLabel}
        </span>
      </div>

      {/* Main Headline: Name & Duration */}
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected ? 'border-[#14B8A6] bg-[#14B8A6]' : 'border-slate-300 dark:border-slate-600'
            )}
          >
            {isSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
          </div>
          <h3 className="text-sm font-bold text-[#0B1220] dark:text-white">
            {route.name}
          </h3>
        </div>

        <span className="text-lg font-extrabold text-[#0B1220] dark:text-white">
          {formatDuration(route.durationMin)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">{route.summary}</p>

      {/* 4 Compact KPI Metrics: ETA, Distance, Est. Cost, Emissions */}
      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-[#E5E9F2] dark:border-slate-800 text-xs">
        <div className="p-1.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0B1220]/70 text-center">
          <span className="text-[9px] text-muted-foreground block font-medium">ETA</span>
          <span className="font-bold text-[#0B1220] dark:text-white text-[11px]">
            {new Date(Date.now() + route.durationMin * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="p-1.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0B1220]/70 text-center">
          <span className="text-[9px] text-muted-foreground block font-medium">Distance</span>
          <span className="font-bold text-[#0B1220] dark:text-white text-[11px]">
            {formatDistance(route.distanceKm)}
          </span>
        </div>

        <div className="p-1.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0B1220]/70 text-center">
          <span className="text-[9px] text-muted-foreground block font-medium">Est. Cost</span>
          <span className="font-bold text-[#14B8A6] text-[11px]">
            {formatCurrency(route.fuelCostInr)}
          </span>
        </div>

        <div className="p-1.5 rounded-xl bg-[#F4F6FA] dark:bg-[#0B1220]/70 text-center">
          <span className="text-[9px] text-muted-foreground block font-medium">Emissions</span>
          <span className="font-bold text-[#0B1220] dark:text-white text-[11px]">
            {formatEmissions(route.emissionsKg)}
          </span>
        </div>
      </div>
    </div>
  );
}

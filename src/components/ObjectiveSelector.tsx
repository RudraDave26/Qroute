'use client';

import React, { useState } from 'react';
import { OptimizationObjective, ObjectiveWeights } from '@/lib/types';
import { OBJECTIVE_PRESETS } from '@/lib/algorithms/costModel';
import { Timer, IndianRupee, Ruler, Leaf, Scale, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObjectiveSelectorProps {
  selectedObjective: OptimizationObjective;
  onSelectObjective: (obj: OptimizationObjective, weights: ObjectiveWeights) => void;
  customWeights?: ObjectiveWeights;
  onWeightsChange?: (weights: ObjectiveWeights) => void;
  showWeightsTuner?: boolean;
}

export function ObjectiveSelector({
  selectedObjective,
  onSelectObjective,
  customWeights,
  onWeightsChange,
  showWeightsTuner = true,
}: ObjectiveSelectorProps) {
  const [isTunerOpen, setIsTunerOpen] = useState(false);
  const activeWeights = customWeights || OBJECTIVE_PRESETS[selectedObjective];

  const presets: { id: OptimizationObjective; label: string; icon: any; summary: string }[] = [
    { id: 'fastest', label: 'Fastest', icon: Timer, summary: 'Min travel time' },
    { id: 'cheapest', label: 'Cheapest', icon: IndianRupee, summary: 'Min fuel & tolls' },
    { id: 'shortest', label: 'Shortest', icon: Ruler, summary: 'Min physical km' },
    { id: 'eco', label: 'Eco / Green', icon: Leaf, summary: 'Min CO₂ footprint' },
    { id: 'balanced', label: 'Balanced', icon: Scale, summary: 'Pareto-optimal' },
  ];

  const handleSliderChange = (key: keyof ObjectiveWeights, val: number) => {
    if (!onWeightsChange) return;
    const newWeights = { ...activeWeights, [key]: val };
    onWeightsChange(newWeights);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Optimization Objective
        </label>
        {showWeightsTuner && (
          <button
            type="button"
            onClick={() => setIsTunerOpen(!isTunerOpen)}
            className="text-xs font-medium text-quantum-600 dark:text-quantum-400 hover:underline inline-flex items-center gap-1"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>{isTunerOpen ? 'Hide Multi-Objective Weights' : 'Tune Weights J(r)'}</span>
            {isTunerOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedObjective === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectObjective(p.id, OBJECTIVE_PRESETS[p.id])}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                  : 'bg-card text-foreground hover:bg-muted border-border/80'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1', isSelected ? 'text-quantum-300' : 'text-muted-foreground')} />
              <span className="text-xs font-semibold">{p.label}</span>
              <span className={cn('text-[10px] mt-0.5 line-clamp-1', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {p.summary}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expandable Multi-Objective Weight Tuner */}
      {isTunerOpen && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/80 space-y-3 transition-all animate-accordion-down">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-border/50">
            <span className="font-semibold text-foreground">
              Mathematical Cost Function: <code className="text-quantum-600 font-mono">J(r) = w_t T + w_c C + w_d D + w_e E</code>
            </span>
            <span className="text-[11px] text-muted-foreground">Weights auto-normalize to 1.0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Travel Time Weight */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5 text-blue-500" /> Travel Time (w_t)</span>
                <span className="font-mono text-quantum-600">{(activeWeights.time * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activeWeights.time}
                onChange={(e) => handleSliderChange('time', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-quantum-500"
              />
            </div>

            {/* Cost Weight */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5 text-emerald-500" /> Fuel/Power Cost (w_c)</span>
                <span className="font-mono text-quantum-600">{(activeWeights.cost * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activeWeights.cost}
                onChange={(e) => handleSliderChange('cost', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-quantum-500"
              />
            </div>

            {/* Distance Weight */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5 text-amber-500" /> Physical Distance (w_d)</span>
                <span className="font-mono text-quantum-600">{(activeWeights.distance * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activeWeights.distance}
                onChange={(e) => handleSliderChange('distance', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-quantum-500"
              />
            </div>

            {/* Emissions Weight */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="flex items-center gap-1"><Leaf className="h-3.5 w-3.5 text-teal-500" /> CO₂ Emissions (w_e)</span>
                <span className="font-mono text-quantum-600">{(activeWeights.emissions * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activeWeights.emissions}
                onChange={(e) => handleSliderChange('emissions', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-quantum-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

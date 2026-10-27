'use client';

import React from 'react';
import { VehicleProfile, VehicleType } from '@/lib/types';
import { DEFAULT_VEHICLE_PROFILES } from '@/lib/algorithms/vehicleModels';
import { Car, Zap, Bike, Fuel, Settings2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface VehicleSelectorProps {
  selectedType: VehicleType;
  onSelect: (type: VehicleType, profile: VehicleProfile) => void;
  customProfile?: VehicleProfile;
  compact?: boolean;
}

export function VehicleSelector({
  selectedType,
  onSelect,
  customProfile,
  compact = false,
}: VehicleSelectorProps) {
  const options: { type: VehicleType; label: string; icon: any; desc: string }[] = [
    { type: 'petrol', label: 'Petrol Car', icon: Car, desc: '14.5 km/L • ₹105/L' },
    { type: 'diesel', label: 'Diesel Car', icon: Fuel, desc: '18.2 km/L • ₹92/L' },
    { type: 'cng', label: 'CNG Hatch', icon: Fuel, desc: '22.0 km/kg • ₹80/kg' },
    { type: 'ev', label: 'Electric (EV)', icon: Zap, desc: '7.2 km/kWh • ₹8/kWh' },
    { type: 'motorcycle', label: 'Motorcycle', icon: Bike, desc: '45.0 km/L • ₹105/L' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Vehicle Powertrain
        </label>
        <span className="text-xs font-medium text-quantum-600 dark:text-quantum-400">
          {DEFAULT_VEHICLE_PROFILES[selectedType]?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedType === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type, DEFAULT_VEHICLE_PROFILES[opt.type])}
              className={cn(
                'flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200',
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                  : 'bg-card text-foreground hover:bg-muted border-border/80'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1.5', isSelected ? 'text-quantum-300' : 'text-muted-foreground')} />
              <span className="text-xs font-semibold line-clamp-1">{opt.label}</span>
              {!compact && (
                <span className={cn('text-[10px] mt-0.5', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {opt.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

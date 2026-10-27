'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getSavedRoutes,
  deleteSavedRoute,
  renameSavedRoute,
  getUserPreferences,
  saveUserPreferences,
  UserPreferences,
} from '@/lib/storage';
import { SavedRouteItem, VehicleType, OptimizationObjective } from '@/lib/types';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/utils';
import {
  Bookmark,
  Trash2,
  Edit2,
  Check,
  X,
  Navigation,
  Sliders,
  Save,
  Fuel,
  Zap,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default function SavedRoutesPage() {
  const [routes, setRoutes] = useState<SavedRouteItem[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setRoutes(getSavedRoutes());
    setPrefs(getUserPreferences());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Delete this saved route?')) {
      deleteSavedRoute(id);
      setRoutes(getSavedRoutes());
    }
  };

  const handleStartRename = (route: SavedRouteItem) => {
    setEditingId(route.id);
    setEditTitle(route.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      renameSavedRoute(id, editTitle.trim());
      setRoutes(getSavedRoutes());
    }
    setEditingId(null);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserPreferences(prefs);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-quantum-500/10 text-quantum-700 dark:text-quantum-300 border border-quantum-500/20 mb-2">
            <Bookmark className="h-3 w-3" />
            <span>Browser Local Storage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Saved Routes & Custom System Preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage your personal commute corridors, calibrate regional fuel tariffs, and set powertrain defaults.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Saved Routes List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>Saved Commutes ({routes.length})</span>
            </h2>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-quantum-600 dark:text-quantum-400 hover:underline flex items-center gap-1"
            >
              <span>+ Plan New Route in Dashboard</span>
            </Link>
          </div>

          {routes.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-3">
              <Bookmark className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-bold text-foreground">No saved routes yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Save frequently traveled routes from the Dashboard to access them quickly here.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((route) => {
                const isEditing = editingId === route.id;
                return (
                  <div
                    key={route.id}
                    className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-quantum-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-background border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(route.id)}
                            className="p-1.5 rounded-lg bg-emerald-500 text-white"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-navy-800 text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                            {route.title}
                            <button
                              type="button"
                              onClick={() => handleStartRename(route)}
                              className="text-muted-foreground hover:text-foreground"
                              title="Rename"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {route.origin.label || 'Origin'} → {route.destination.label || 'Destination'}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard?lat1=${route.origin.lat}&lng1=${route.origin.lng}&lat2=${route.destination.lat}&lng2=${route.destination.lng}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Navigate</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(route.id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete route"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">VEHICLE</span>
                        <span className="font-semibold uppercase text-quantum-600 dark:text-quantum-400">
                          {route.vehicleType}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">DISTANCE</span>
                        <span className="font-semibold text-foreground">
                          {formatDistance(route.distanceKm)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">DURATION</span>
                        <span className="font-semibold text-foreground">
                          {formatDuration(route.estDurationMin)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">EST. COST</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(route.estCostInr)}
                        </span>
                      </div>
                    </div>

                    {route.notes && (
                      <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg italic">
                        {route.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Preferences Form */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-quantum-500" />
              Regional Fuel & Tariff Rates
            </h2>
            {savedNotice && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Default Preferred Powertrain</label>
              <select
                value={prefs.preferredVehicle}
                onChange={(e) => setPrefs({ ...prefs, preferredVehicle: e.target.value as VehicleType })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border"
              >
                <option value="ev">Electric Vehicle (EV)</option>
                <option value="petrol">Petrol Car</option>
                <option value="diesel">Diesel Sedan</option>
                <option value="cng">CNG Hatchback</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Default Optimization Goal</label>
              <select
                value={prefs.preferredObjective}
                onChange={(e) => setPrefs({ ...prefs, preferredObjective: e.target.value as OptimizationObjective })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border"
              >
                <option value="balanced">Balanced (Pareto Optimal)</option>
                <option value="fastest">Fastest Travel Time</option>
                <option value="cheapest">Cheapest Fuel/Tolls</option>
                <option value="shortest">Shortest Physical Distance</option>
                <option value="eco">Lowest Carbon Footprint</option>
              </select>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-3">
              <h3 className="font-bold text-foreground">Manual Fuel & Electricity Price Overrides</h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Petrol (INR/L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prefs.customFuelPrices.petrol}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        customFuelPrices: { ...prefs.customFuelPrices, petrol: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">Diesel (INR/L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prefs.customFuelPrices.diesel}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        customFuelPrices: { ...prefs.customFuelPrices, diesel: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">CNG (INR/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prefs.customFuelPrices.cng}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        customFuelPrices: { ...prefs.customFuelPrices, cng: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground">EV Electricity (INR/kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prefs.customFuelPrices.ev}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        customFuelPrices: { ...prefs.customFuelPrices, ev: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all"
            >
              <Save className="h-3.5 w-3.5 text-quantum-300" />
              <span>Save System Preferences</span>
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-border/60 text-[11px] text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Privacy Notice
            </span>
            <p>
              Preferences and saved routes are stored locally in your browser&apos;s private local storage space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

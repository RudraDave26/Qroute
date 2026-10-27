import { SavedRouteItem, VehicleType, OptimizationObjective } from './types';

const STORAGE_SAVED_ROUTES = 'quantumroute_saved_routes';
const STORAGE_RECENT_SEARCHES = 'quantumroute_recent_searches';
const STORAGE_PREFERENCES = 'quantumroute_user_preferences';

export interface UserPreferences {
  preferredVehicle: VehicleType;
  preferredObjective: OptimizationObjective;
  customFuelPrices: {
    petrol: number;
    diesel: number;
    cng: number;
    ev: number;
  };
  avoidTolls: boolean;
  avoidHighways: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredVehicle: 'petrol',
  preferredObjective: 'balanced',
  customFuelPrices: {
    petrol: 102.86,
    diesel: 88.94,
    cng: 82.50,
    ev: 7.80,
  },
  avoidTolls: false,
  avoidHighways: false,
};

export const INITIAL_SAMPLE_ROUTES: SavedRouteItem[] = [
  {
    id: 'sample-blr-tech',
    title: 'Daily Commute: Koramangala to Whitefield ITPL',
    origin: { lat: 12.9352, lng: 77.6245, label: 'Koramangala, Bengaluru' },
    destination: { lat: 12.9698, lng: 77.7500, label: 'Whitefield ITPL, Bengaluru' },
    vehicleType: 'ev',
    objective: 'balanced',
    distanceKm: 18.4,
    estDurationMin: 48,
    estCostInr: 20.4,
    savedAt: '2026-10-24T08:30:00.000Z',
    notes: 'QIGA selected via HAL Old Airport Road avoiding Silk Board jam.',
  },
  {
    id: 'sample-del-cyber',
    title: 'Express Route: Connaught Place to Cyber City',
    origin: { lat: 28.6315, lng: 77.2167, label: 'Connaught Place, New Delhi' },
    destination: { lat: 28.4950, lng: 77.0895, label: 'Cyber Hub, Gurugram' },
    vehicleType: 'petrol',
    objective: 'fastest',
    distanceKm: 27.2,
    estDurationMin: 52,
    estCostInr: 215.0,
    savedAt: '2026-10-25T14:15:00.000Z',
    notes: 'Via NH-48 Express corridor with live incident bypass.',
  },
  {
    id: 'sample-hyd-hitec',
    title: 'Low Emission: Banjara Hills to HITEC City',
    origin: { lat: 17.4156, lng: 78.4350, label: 'Banjara Hills, Hyderabad' },
    destination: { lat: 17.4474, lng: 78.3762, label: 'HITEC City, Hyderabad' },
    vehicleType: 'cng',
    objective: 'eco',
    distanceKm: 12.8,
    estDurationMin: 34,
    estCostInr: 46.5,
    savedAt: '2026-10-26T10:00:00.000Z',
    notes: 'Optimized for minimum gradient and stop-and-go idling.',
  },
];

export function getSavedRoutes(): SavedRouteItem[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_ROUTES;
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_ROUTES);
    if (!raw) {
      localStorage.setItem(STORAGE_SAVED_ROUTES, JSON.stringify(INITIAL_SAMPLE_ROUTES));
      return INITIAL_SAMPLE_ROUTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SAMPLE_ROUTES;
  }
}

export function saveRoute(route: Omit<SavedRouteItem, 'id' | 'savedAt'>): SavedRouteItem {
  const current = getSavedRoutes();
  const newItem: SavedRouteItem = {
    ...route,
    id: `route-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  const updated = [newItem, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SAVED_ROUTES, JSON.stringify(updated));
  }
  return newItem;
}

export function deleteSavedRoute(id: string): void {
  const current = getSavedRoutes();
  const updated = current.filter((r) => r.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SAVED_ROUTES, JSON.stringify(updated));
  }
}

export function renameSavedRoute(id: string, newTitle: string): void {
  const current = getSavedRoutes();
  const updated = current.map((r) => (r.id === id ? { ...r, title: newTitle } : r));
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_SAVED_ROUTES, JSON.stringify(updated));
  }
}

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_PREFERENCES, JSON.stringify(updated));
  }
  return updated;
}

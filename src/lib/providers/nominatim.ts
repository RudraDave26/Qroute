import { LatLng } from '../types';
import { searchIndianAdministrativeEntities } from './indianAdminData';

export interface SearchResultItem {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  badge?: string;
}

export const PRESET_LOCATIONS: SearchResultItem[] = [
  // Bengaluru
  { id: 'blr-koramangala', name: 'Koramangala, Bengaluru', displayName: 'Koramangala 4th Block, Bengaluru, Karnataka, India', lat: 12.9352, lng: 77.6245, type: 'suburb' },
  { id: 'blr-whitefield', name: 'Whitefield, Bengaluru', displayName: 'ITPL Main Rd, Whitefield, Bengaluru, Karnataka, India', lat: 12.9698, lng: 77.7500, type: 'suburb' },
  { id: 'blr-indiranagar', name: 'Indiranagar, Bengaluru', displayName: '100 Feet Road, Indiranagar, Bengaluru, Karnataka, India', lat: 12.9784, lng: 77.6408, type: 'suburb' },
  { id: 'blr-electronic-city', name: 'Electronic City, Bengaluru', displayName: 'Electronic City Phase 1, Bengaluru, Karnataka, India', lat: 12.8452, lng: 77.6602, type: 'suburb' },
  { id: 'blr-airport', name: 'Kempegowda Intl Airport, BLR', displayName: 'Kempegowda International Airport, Devanahalli, Bengaluru', lat: 13.1986, lng: 77.7066, type: 'aeroway' },
  
  // Delhi NCR
  { id: 'del-connaught', name: 'Connaught Place, New Delhi', displayName: 'Connaught Place, Central Delhi, Delhi, India', lat: 28.6315, lng: 77.2167, type: 'city' },
  { id: 'del-cyber-hub', name: 'Cyber Hub, Gurugram', displayName: 'DLF Cyber City, Gurugram, Haryana, India', lat: 28.4950, lng: 77.0895, type: 'suburb' },
  { id: 'del-noida-sec62', name: 'Sector 62, Noida', displayName: 'Sector 62, Noida, Gautam Buddha Nagar, Uttar Pradesh, India', lat: 28.6280, lng: 77.3649, type: 'suburb' },
  { id: 'del-airport', name: 'IGI Airport Terminal 3, Delhi', displayName: 'Indira Gandhi International Airport, New Delhi, Delhi, India', lat: 28.5562, lng: 77.1000, type: 'aeroway' },

  // Mumbai
  { id: 'mum-bkc', name: 'Bandra Kurla Complex, Mumbai', displayName: 'BKC, Bandra East, Mumbai, Maharashtra, India', lat: 19.0657, lng: 77.8687, type: 'suburb' },
  { id: 'mum-nariman', name: 'Nariman Point, Mumbai', displayName: 'Nariman Point, South Mumbai, Maharashtra, India', lat: 18.9269, lng: 72.8239, type: 'suburb' },
  { id: 'mum-andheri', name: 'Andheri West, Mumbai', displayName: 'Lokhandwala, Andheri West, Mumbai, Maharashtra, India', lat: 19.1363, lng: 72.8277, type: 'suburb' },
  { id: 'mum-thane', name: 'Thane West, MMR', displayName: 'Viviana Mall, Thane West, Maharashtra, India', lat: 19.2084, lng: 72.9715, type: 'city' },

  // Hyderabad
  { id: 'hyd-hitec', name: 'HITEC City, Hyderabad', displayName: 'HITEC City, Madhapur, Hyderabad, Telangana, India', lat: 17.4474, lng: 78.3762, type: 'suburb' },
  { id: 'hyd-banjara', name: 'Banjara Hills, Hyderabad', displayName: 'Road No. 12, Banjara Hills, Hyderabad, Telangana, India', lat: 17.4156, lng: 78.4350, type: 'suburb' },
  { id: 'hyd-gachibowli', name: 'Gachibowli, Hyderabad', displayName: 'Financial District, Gachibowli, Hyderabad, Telangana, India', lat: 17.4401, lng: 78.3489, type: 'suburb' },

  // Pune
  { id: 'pun-hinjawadi', name: 'Hinjawadi IT Park, Pune', displayName: 'Hinjawadi Phase 1, Pune, Maharashtra, India', lat: 18.5913, lng: 73.7389, type: 'suburb' },
  { id: 'pun-koregaon', name: 'Koregaon Park, Pune', displayName: 'North Main Road, Koregaon Park, Pune, Maharashtra, India', lat: 18.5362, lng: 73.8940, type: 'suburb' },

  // Global Presets
  { id: 'lon-trafalgar', name: 'Trafalgar Square, London', displayName: 'Trafalgar Square, Westminster, London, WC2N 5DN, UK', lat: 51.5080, lng: -0.1281, type: 'place' },
  { id: 'lon-canary', name: 'Canary Wharf, London', displayName: 'Canary Wharf, Tower Hamlets, London, E14 5AB, UK', lat: 51.5054, lng: -0.0235, type: 'commercial' },
  { id: 'nyc-times-sq', name: 'Times Square, New York', displayName: 'Times Square, Manhattan, New York, NY 10036, USA', lat: 40.7580, lng: -73.9855, type: 'tourism' },
  { id: 'nyc-wall-st', name: 'Wall Street, New York', displayName: 'Financial District, Wall St, New York, NY 10005, USA', lat: 40.7069, lng: -74.0090, type: 'commercial' },
];

export async function searchGeocode(query: string): Promise<SearchResultItem[]> {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  // 1. Fast match against presets
  const presetMatches: SearchResultItem[] = PRESET_LOCATIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(clean) ||
      item.displayName.toLowerCase().includes(clean)
  );

  // 2. Fetch matches from Indian Administrative APIs (LGD & OpenAdminData)
  let adminMatches: SearchResultItem[] = [];
  try {
    const adminEntities = await searchIndianAdministrativeEntities(clean);
    adminMatches = adminEntities.map((ent) => ({
      id: ent.id,
      name: ent.name,
      displayName: ent.displayName,
      lat: ent.lat,
      lng: ent.lng,
      type: ent.type,
      badge: ent.category,
    }));
  } catch (err) {
    // Graceful fallback if admin service is temporarily unreachable
  }

  // Combine presets and Indian Admin matches
  const localResults: SearchResultItem[] = [...presetMatches];
  for (const item of adminMatches) {
    if (!localResults.some((c) => Math.abs(c.lat - item.lat) < 0.01 && Math.abs(c.lng - item.lng) < 0.01)) {
      localResults.push(item);
    }
  }

  if (localResults.length >= 5) {
    return localResults.slice(0, 8);
  }

  // 3. Fetch from OpenStreetMap Nominatim for street-level or international queries
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&limit=5`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'QuantumRouteAI-Research-Client/1.0 (mvpmakers@quantumroute.local)',
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const nominatimResults: SearchResultItem[] = data.map((item: any) => ({
        id: `osm-${item.place_id}`,
        name: item.display_name.split(',')[0],
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type || 'place',
        badge: 'OpenStreetMap',
      }));

      // Combine local matches with OSM Nominatim results
      const combined = [...localResults];
      for (const item of nominatimResults) {
        if (!combined.some((c) => Math.abs(c.lat - item.lat) < 0.005 && Math.abs(c.lng - item.lng) < 0.005)) {
          combined.push(item);
        }
      }
      return combined.slice(0, 8);
    }
  } catch (err) {
    // Timeout or network offline: gracefully return local results
  }

  return localResults.slice(0, 6);
}

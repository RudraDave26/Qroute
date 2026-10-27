export interface AdminState {
  id: string;
  code?: string;
  nameEn: string;
  nameLocal: string;
  slug: string;
  lat: number;
  lon: number;
  population?: number;
  source: 'openadmindata' | 'lgd' | 'fallback';
}

export interface AdminDistrict {
  id: string;
  code?: string;
  nameEn: string;
  nameLocal: string;
  slug: string;
  lat: number;
  lon: number;
  parentId: string;
  parentNameEn: string;
  parentNameLocal?: string;
  population?: number;
  source: 'openadmindata' | 'fallback';
}

export interface LgdCity {
  code: string;
  name: string;
  typeCode?: string | null;
  type?: string | null;
  districtCode?: string | null;
  districtName?: string | null;
  stateCode: string;
  stateName: string;
  lat?: number;
  lon?: number;
  source: 'lgd';
}

// In-memory caching with 1-hour TTL
interface CacheStore {
  countryMetadata: any | null;
  states: AdminState[] | null;
  districts: AdminDistrict[] | null;
  districtsByState: Map<string, AdminDistrict[]>;
  lastFetched: number;
}

const cache: CacheStore = {
  countryMetadata: null,
  states: null,
  districts: null,
  districtsByState: new Map(),
  lastFetched: 0,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Fallback high-priority Indian State & UT capitals in case external endpoints are slow or offline
export const FALLBACK_INDIAN_STATES: AdminState[] = [
  { id: 'IN03', code: '07', nameEn: 'Delhi', nameLocal: 'दिल्ली', slug: 'delhi-in03', lat: 28.666, lon: 77.115, population: 16787941, source: 'fallback' },
  { id: 'IN10', code: '29', nameEn: 'Karnataka', nameLocal: 'कर्नाटक', slug: 'karnataka-in10', lat: 14.882, lon: 75.575, population: 61095297, source: 'fallback' },
  { id: 'IN11', code: '27', nameEn: 'Maharashtra', nameLocal: 'महाराष्ट्र', slug: 'maharashtra-in11', lat: 19.406, lon: 75.702, population: 112374333, source: 'fallback' },
  { id: 'IN18', code: '08', nameEn: 'Rajasthan', nameLocal: 'राजस्थान', slug: 'rajasthan-in18', lat: 26.951, lon: 73.787, population: 68548437, source: 'fallback' },
  { id: 'IN19', code: '09', nameEn: 'Uttar Pradesh', nameLocal: 'उत्तर प्रदेश', slug: 'uttar-pradesh-in19', lat: 26.880, lon: 80.570, population: 199812341, source: 'fallback' },
  { id: 'IN28', code: '33', nameEn: 'Tamil Nadu', nameLocal: 'तमिलनाडु', slug: 'tamil-nadu-in28', lat: 11.052, lon: 78.409, population: 72147030, source: 'fallback' },
  { id: 'IN29', code: '24', nameEn: 'Gujarat', nameLocal: 'गुजरात', slug: 'gujarat-in29', lat: 23.362, lon: 71.649, population: 60439692, source: 'fallback' },
  { id: 'IN35', code: '36', nameEn: 'Telangana', nameLocal: 'तेलंगाना', slug: 'telangana-in35', lat: 17.794, lon: 79.030, population: 35193978, source: 'fallback' },
  { id: 'IN22', code: '19', nameEn: 'West Bengal', nameLocal: 'पश्चिम बंगाल', slug: 'west-bengal-in22', lat: 23.270, lon: 87.816, population: 91276115, source: 'fallback' },
  { id: 'IN07', code: '32', nameEn: 'Kerala', nameLocal: 'केरल', slug: 'kerala-in07', lat: 9.791, lon: 76.747, population: 33406061, source: 'fallback' },
  { id: 'IN26', code: '23', nameEn: 'Madhya Pradesh', nameLocal: 'मध्य प्रदेश', slug: 'madhya-pradesh-in26', lat: 22.953, lon: 78.358, population: 72626809, source: 'fallback' },
  { id: 'IN23', code: '10', nameEn: 'Bihar', nameLocal: 'बिहार', slug: 'bihar-in23', lat: 25.708, lon: 85.573, population: 104099452, source: 'fallback' },
  { id: 'IN17', code: '03', nameEn: 'Punjab', nameLocal: 'पंजाब', slug: 'punjab-in17', lat: 30.754, lon: 75.522, population: 27743338, source: 'fallback' },
  { id: 'IN05', code: '06', nameEn: 'Haryana', nameLocal: 'हरियाणा', slug: 'haryana-in05', lat: 29.143, lon: 76.343, population: 25351462, source: 'fallback' },
  { id: 'IN08', code: '21', nameEn: 'Odisha', nameLocal: 'ओडिशा', slug: 'odisha-in08', lat: 20.776, lon: 84.638, population: 41974218, source: 'fallback' },
  { id: 'IN06', code: '28', nameEn: 'Andhra Pradesh', nameLocal: 'आन्ध्र प्रदेश', slug: 'andhra-pradesh-in06', lat: 14.762, lon: 78.875, population: 49386799, source: 'fallback' },
  { id: 'IN13', code: '18', nameEn: 'Assam', nameLocal: 'असम', slug: 'assam-in13', lat: 26.273, lon: 92.877, population: 31205576, source: 'fallback' },
  { id: 'IN30', code: '30', nameEn: 'Goa', nameLocal: 'गोवा', slug: 'goa-in30', lat: 15.353, lon: 74.104, population: 1458545, source: 'fallback' },
];

/**
 * 1. Fetch metadata and 37 Indian states from OpenAdminData
 * Endpoint: https://api.openadmindata.org/api/v1/in/state.json
 */
export async function getIndianStates(): Promise<AdminState[]> {
  const now = Date.now();
  if (cache.states && now - cache.lastFetched < CACHE_TTL_MS) {
    return cache.states;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.openadmindata.org/api/v1/in/state.json', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.entities)) {
        const states: AdminState[] = data.entities.map((item: any) => ({
          id: item.id,
          nameEn: item.name_en,
          nameLocal: item.name_local || item.name_en,
          slug: item.slug,
          lat: Number(item.lat),
          lon: Number(item.lon),
          population: item.population ? Number(item.population) : undefined,
          source: 'openadmindata',
        }));

        cache.states = states;
        cache.lastFetched = now;
        return states;
      }
    }
  } catch (err) {
    console.warn('[OpenAdminData] Could not fetch state.json, using fallback cache:', err);
  }

  return cache.states || FALLBACK_INDIAN_STATES;
}

/**
 * 2. Fetch all 635 Indian districts from OpenAdminData
 * Endpoint: https://api.openadmindata.org/api/v1/in/district.json
 */
export async function getIndianDistricts(parentStateId?: string): Promise<AdminDistrict[]> {
  const now = Date.now();
  if (!cache.districts || now - cache.lastFetched >= CACHE_TTL_MS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.openadmindata.org/api/v1/in/district.json', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entities)) {
          cache.districts = data.entities.map((item: any) => ({
            id: item.id,
            nameEn: item.name_en,
            nameLocal: item.name_local || item.name_en,
            slug: item.slug,
            lat: Number(item.lat),
            lon: Number(item.lon),
            parentId: item.parent_id,
            parentNameEn: item.parent_name_en,
            parentNameLocal: item.parent_name_local,
            population: item.population ? Number(item.population) : undefined,
            source: 'openadmindata',
          }));
          cache.lastFetched = now;
        }
      }
    } catch (err) {
      console.warn('[OpenAdminData] Could not fetch district.json:', err);
    }
  }

  const allDistricts = cache.districts || [];
  if (parentStateId) {
    return allDistricts.filter(
      (d) => d.parentId.toLowerCase() === parentStateId.toLowerCase()
    );
  }
  return allDistricts;
}

/**
 * 3. Fetch full India Country Metadata and hierarchy stats
 * Endpoint: https://api.openadmindata.org/api/v1/countries/in.json
 */
export async function getIndiaCountryOverview() {
  if (cache.countryMetadata) {
    return cache.countryMetadata;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.openadmindata.org/api/v1/countries/in.json', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 7200 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      cache.countryMetadata = {
        meta: data.meta,
        stats: data.meta?.stats || { state: 37, district: 635 },
        source: data.meta?.source,
        totalStatesCount: data.data?.state?.length || 37,
        totalDistrictsCount: data.data?.district?.length || 635,
      };
      return cache.countryMetadata;
    }
  } catch (err) {
    console.warn('[OpenAdminData] Could not fetch country/in.json:', err);
  }

  return {
    meta: {
      country: 'in',
      countryName: { local: 'भारत', en: 'India' },
      stats: { state: 37, district: 635 },
      source: { name: "Who's On First", license: 'CC BY' },
    },
    totalStatesCount: 37,
    totalDistrictsCount: 635,
  };
}

/**
 * 4. Query LGD Indian Cities API
 * Endpoint: https://lgd-json-api.vercel.app/api/cities?q={query}
 */
export async function searchLgdCities(query: string): Promise<LgdCity[]> {
  const clean = query.trim();
  if (!clean || clean.length < 2) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://lgd-json-api.vercel.app/api/cities?q=${encodeURIComponent(clean)}&limit=10`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return json.data.map((c: any) => ({
          code: c.code,
          name: c.name,
          typeCode: c.typeCode,
          type: c.type,
          districtCode: c.districtCode,
          districtName: c.districtName,
          stateCode: c.stateCode,
          stateName: c.stateName,
          source: 'lgd',
        }));
      }
    }
  } catch (err) {
    console.warn('[LGD-API] Error querying cities:', err);
  }

  return [];
}

/**
 * Known coordinates for major Indian municipal hubs (used when LGD returns city without explicit centroid)
 */
const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  jaipur: { lat: 26.9124, lon: 75.7873 },
  jaijaipur: { lat: 21.8488, lon: 82.8091 },
  delhi: { lat: 28.6139, lon: 77.2090 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  pune: { lat: 18.5204, lon: 73.8567 },
  hyderabad: { lat: 17.3850, lon: 78.4867 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  indore: { lat: 22.7196, lon: 75.8577 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  patna: { lat: 25.5941, lon: 85.1376 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  surat: { lat: 21.1702, lon: 72.8311 },
  vadodara: { lat: 22.3072, lon: 73.1812 },
  visakhapatnam: { lat: 17.6868, lon: 83.2185 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  varanasi: { lat: 25.3176, lon: 82.9739 },
  amritsar: { lat: 31.6340, lon: 74.8723 },
};

/**
 * Combined Indian Administrative Geosearch
 * Matches against OpenAdminData (States & 635 Districts with exact centroids)
 * and LGD Indian Cities.
 */
export async function searchIndianAdministrativeEntities(query: string) {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  const [states, districts, lgdCities] = await Promise.all([
    getIndianStates(),
    getIndianDistricts(),
    searchLgdCities(clean),
  ]);

  const matches: Array<{
    id: string;
    name: string;
    displayName: string;
    lat: number;
    lng: number;
    type: 'state' | 'district' | 'city';
    category: string;
    meta?: any;
  }> = [];

  // Match States
  for (const s of states) {
    if (s.nameEn.toLowerCase().includes(clean) || s.nameLocal.toLowerCase().includes(clean)) {
      matches.push({
        id: `geo-state-${s.id}`,
        name: s.nameEn,
        displayName: `${s.nameEn} (${s.nameLocal}), India — State`,
        lat: s.lat,
        lng: s.lon,
        type: 'state',
        category: 'State',
        meta: { id: s.id, population: s.population },
      });
    }
  }

  // Match Districts (top 4 matching)
  let districtMatches = 0;
  for (const d of districts) {
    if (
      d.nameEn.toLowerCase().includes(clean) ||
      (d.nameLocal && d.nameLocal.toLowerCase().includes(clean))
    ) {
      matches.push({
        id: `geo-district-${d.id}`,
        name: d.nameEn,
        displayName: `${d.nameEn}, ${d.parentNameEn}, India — District`,
        lat: d.lat,
        lng: d.lon,
        type: 'district',
        category: 'District',
        meta: { id: d.id, parentState: d.parentNameEn, population: d.population },
      });
      districtMatches++;
      if (districtMatches >= 4) break;
    }
  }

  // Match Cities
  for (const c of lgdCities) {
    const key = c.name.toLowerCase();
    const coords = KNOWN_CITY_COORDINATES[key];
    
    // Find parent state coordinates if city exact coordinate is missing
    let cityLat = coords?.lat;
    let cityLng = coords?.lon;

    if (!cityLat || !cityLng) {
      const matchedState = states.find(
        (s) => s.nameEn.toLowerCase() === c.stateName.toLowerCase()
      );
      if (matchedState) {
        cityLat = matchedState.lat;
        cityLng = matchedState.lon;
      } else {
        cityLat = 20.5937;
        cityLng = 78.9629;
      }
    }

    matches.push({
      id: `geo-city-${c.code}`,
      name: c.name,
      displayName: `${c.name}, ${c.districtName ? c.districtName + ', ' : ''}${c.stateName}`,
      lat: cityLat,
      lng: cityLng,
      type: 'city',
      category: 'City',
      meta: {
        code: c.code,
        state: c.stateName,
        district: c.districtName,
      },
    });
  }

  return matches;
}

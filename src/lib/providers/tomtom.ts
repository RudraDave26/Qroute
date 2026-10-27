import { LatLng, TrafficIncident, DataStatus } from '../types';

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || process.env.TRAFFIC_API_KEY || '';

export interface TomTomRouteResponse {
  distanceKm: number;
  travelTimeMin: number;
  trafficDelayMin: number;
  coordinates: [number, number][];
  isLive: boolean;
  status: DataStatus;
}

export async function fetchTomTomRoute(
  origin: LatLng,
  destination: LatLng,
  avoidTolls: boolean = false
): Promise<TomTomRouteResponse> {
  if (!TOMTOM_API_KEY) {
    return getSimulatedTomTomRoute(origin, destination);
  }

  try {
    const avoidParam = avoidTolls ? '&avoid=tollRoads' : '';
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${origin.lat},${origin.lng}:${destination.lat},${destination.lng}/json?key=${TOMTOM_API_KEY}&traffic=true&computeTravelTimeFor=all${avoidParam}`;

    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      console.warn(`TomTom Routing API returned ${res.status}: fallback to model`);
      return getSimulatedTomTomRoute(origin, destination);
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) {
      return getSimulatedTomTomRoute(origin, destination);
    }

    const summary = route.summary;
    const legPoints = route.legs?.[0]?.points || [];
    const coordinates: [number, number][] = legPoints.map((p: any) => [p.latitude, p.longitude]);

    return {
      distanceKm: Number((summary.lengthInMeters / 1000).toFixed(2)),
      travelTimeMin: Number((summary.travelTimeInSeconds / 60).toFixed(1)),
      trafficDelayMin: Number((summary.trafficDelayInSeconds / 60).toFixed(1)),
      coordinates: coordinates.length > 0 ? coordinates : generateInterpolatedPoints(origin, destination),
      isLive: true,
      status: 'LIVE',
    };
  } catch (error) {
    console.error('Error fetching TomTom route:', error);
    return getSimulatedTomTomRoute(origin, destination);
  }
}

export async function fetchTomTomIncidents(
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number }
): Promise<{ incidents: TrafficIncident[]; status: DataStatus }> {
  if (!TOMTOM_API_KEY) {
    return {
      incidents: getSimulatedIncidents(bbox),
      status: 'DEMO',
    };
  }

  try {
    const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${TOMTOM_API_KEY}&bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length}}}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { incidents: getSimulatedIncidents(bbox), status: 'DEMO' };
    }
    const data = await res.json();
    const rawIncidents = data.incidents || [];

    const mapped: TrafficIncident[] = rawIncidents.map((inc: any, idx: number) => {
      const coords = inc.geometry?.coordinates?.[0] || [bbox.minLng, bbox.minLat];
      const props = inc.properties || {};
      const desc = props.events?.[0]?.description || 'Traffic incident reported';
      return {
        id: `tomtom-${idx}-${Date.now()}`,
        type: mapCategoryToType(props.iconCategory),
        severity: mapDelayToSeverity(props.magnitudeOfDelay),
        description: desc,
        location: { lat: coords[1], lng: coords[0] },
        roadName: props.from ? `${props.from} to ${props.to}` : 'Major Corridor',
        delaySeconds: props.magnitudeOfDelay ? props.magnitudeOfDelay * 60 : 300,
        lengthMeters: props.length || 500,
        verified: true,
        startTime: props.startTime || new Date().toISOString(),
        endTime: props.endTime,
        dataStatus: 'LIVE',
      };
    });

    return {
      incidents: mapped.length > 0 ? mapped : getSimulatedIncidents(bbox),
      status: mapped.length > 0 ? 'LIVE' : 'DEMO',
    };
  } catch (err) {
    return { incidents: getSimulatedIncidents(bbox), status: 'DEMO' };
  }
}

function mapCategoryToType(category: number): TrafficIncident['type'] {
  switch (category) {
    case 1:
    case 2:
      return 'accident';
    case 3:
      return 'congestion';
    case 8:
    case 9:
      return 'construction';
    case 6:
      return 'closure';
    case 7:
      return 'hazard';
    default:
      return 'congestion';
  }
}

function mapDelayToSeverity(delay: number): TrafficIncident['severity'] {
  if (delay >= 3) return 'critical';
  if (delay === 2) return 'major';
  if (delay === 1) return 'moderate';
  return 'minor';
}

function generateInterpolatedPoints(origin: LatLng, destination: LatLng, steps: number = 20): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Add realistic road curve / arc
    const curve = Math.sin(fraction * Math.PI) * 0.015;
    const lat = origin.lat + (destination.lat - origin.lat) * fraction + curve;
    const lng = origin.lng + (destination.lng - origin.lng) * fraction - curve;
    points.push([lat, lng]);
  }
  return points;
}

function getSimulatedTomTomRoute(origin: LatLng, destination: LatLng): TomTomRouteResponse {
  const dLat = destination.lat - origin.lat;
  const dLng = destination.lng - origin.lng;
  const directDistance = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
  const roadFactor = 1.28;
  const distanceKm = Number((directDistance * roadFactor).toFixed(2));
  const avgSpeedKmh = 38;
  const freeFlowMin = (distanceKm / 52) * 60;
  const currentMin = (distanceKm / avgSpeedKmh) * 60;
  const delayMin = Math.max(0, Number((currentMin - freeFlowMin).toFixed(1)));

  return {
    distanceKm,
    travelTimeMin: Number(currentMin.toFixed(1)),
    trafficDelayMin: delayMin,
    coordinates: generateInterpolatedPoints(origin, destination),
    isLive: false,
    status: 'DEMO',
  };
}

function getSimulatedIncidents(bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number }): TrafficIncident[] {
  const midLat = (bbox.minLat + bbox.maxLat) / 2;
  const midLng = (bbox.minLng + bbox.maxLng) / 2;
  const spanLat = (bbox.maxLat - bbox.minLat) * 0.4;
  const spanLng = (bbox.maxLng - bbox.minLng) * 0.4;

  return [
    {
      id: 'inc-demo-1',
      type: 'congestion',
      severity: 'moderate',
      description: 'Slow moving traffic due to high commuter volume',
      location: { lat: midLat + spanLat * 0.3, lng: midLng - spanLng * 0.2 },
      roadName: 'Main Arterial Bypass',
      delaySeconds: 420,
      lengthMeters: 1200,
      verified: true,
      startTime: new Date(Date.now() - 25 * 60000).toISOString(),
      dataStatus: 'DEMO',
    },
    {
      id: 'inc-demo-2',
      type: 'construction',
      severity: 'major',
      description: 'Metro line pier expansion work; single lane operational',
      location: { lat: midLat - spanLat * 0.2, lng: midLng + spanLng * 0.4 },
      roadName: 'Ring Road Expressway Entry',
      delaySeconds: 780,
      lengthMeters: 850,
      verified: true,
      startTime: new Date(Date.now() - 3 * 3600000).toISOString(),
      dataStatus: 'DEMO',
    },
    {
      id: 'inc-demo-3',
      type: 'accident',
      severity: 'moderate',
      description: 'Minor two-vehicle collision on shoulder; traffic slowing',
      location: { lat: midLat + spanLat * 0.1, lng: midLng + spanLng * 0.1 },
      roadName: 'Inner Circular Flyover',
      delaySeconds: 300,
      lengthMeters: 400,
      verified: true,
      startTime: new Date(Date.now() - 15 * 60000).toISOString(),
      dataStatus: 'DEMO',
    },
  ];
}

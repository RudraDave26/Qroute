import { LatLng } from '../types';
import { haversineDistanceKm } from '../utils';

export interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number;
  speedLimitKmh: number;
  freeFlowSpeedKmh: number;
  congestionFactor: number; // 1.0 = clear, 1.5 = slow, 2.5 = heavy jam
  isToll: boolean;
  tollFeeInr: number;
  roadType: 'highway' | 'arterial' | 'residential';
  incidentPenaltyMin: number;
}

export interface RoadNetworkGraph {
  nodes: Map<string, GraphNode>;
  adjacency: Map<string, GraphEdge[]>;
}

/**
 * Creates an interconnected synthetic or localized road network between origin and destination
 * with intermediate arterial corridors, expressways, ring roads, and surface streets.
 */
export function buildRoadNetwork(
  origin: LatLng,
  destination: LatLng,
  gridDensity: number = 5,
  congestionSeed: number = 0.3
): RoadNetworkGraph {
  const nodes = new Map<string, GraphNode>();
  const adjacency = new Map<string, GraphEdge[]>();

  const minLat = Math.min(origin.lat, destination.lat);
  const maxLat = Math.max(origin.lat, destination.lat);
  const minLng = Math.min(origin.lng, destination.lng);
  const maxLng = Math.max(origin.lng, destination.lng);

  const spanLat = Math.max(0.04, Math.abs(maxLat - minLat));
  const spanLng = Math.max(0.04, Math.abs(maxLng - minLng));

  // Add origin and destination nodes
  const originNode: GraphNode = {
    id: 'origin',
    lat: origin.lat,
    lng: origin.lng,
    name: origin.label || 'Origin',
  };
  const destNode: GraphNode = {
    id: 'destination',
    lat: destination.lat,
    lng: destination.lng,
    name: destination.label || 'Destination',
  };

  nodes.set('origin', originNode);
  nodes.set('destination', destNode);
  adjacency.set('origin', []);
  adjacency.set('destination', []);

  // Generate grid corridors between origin and destination
  const layers = Math.max(3, gridDensity);
  const perLayer = 4;

  const intermediateNodes: GraphNode[] = [];

  for (let l = 1; l <= layers; l++) {
    const fraction = l / (layers + 1);
    const centerLat = origin.lat + (destination.lat - origin.lat) * fraction;
    const centerLng = origin.lng + (destination.lng - origin.lng) * fraction;

    // Perpendicular vector for width
    const perpLat = -(destination.lng - origin.lng) * 0.45;
    const perpLng = (destination.lat - origin.lat) * 0.45;

    for (let p = 0; p < perLayer; p++) {
      const spread = (p - (perLayer - 1) / 2) / ((perLayer - 1) / 2 || 1);
      const nodeId = `N_${l}_${p}`;
      const jitterLat = (Math.sin(l * 13 + p * 7) * 0.005) * spanLat;
      const jitterLng = (Math.cos(l * 17 + p * 11) * 0.005) * spanLng;

      const node: GraphNode = {
        id: nodeId,
        lat: centerLat + spread * perpLat + jitterLat,
        lng: centerLng + spread * perpLng + jitterLng,
        name: `Junction ${l}-${p + 1}`,
      };
      nodes.set(nodeId, node);
      adjacency.set(nodeId, []);
      intermediateNodes.push(node);
    }
  }

  // Connect origin to layer 1
  for (let p = 0; p < perLayer; p++) {
    const targetId = `N_1_${p}`;
    const target = nodes.get(targetId)!;
    const dist = haversineDistanceKm(originNode, target);
    addEdge(adjacency, {
      from: 'origin',
      to: targetId,
      distanceKm: dist,
      speedLimitKmh: 50,
      freeFlowSpeedKmh: 45,
      congestionFactor: 1.0 + Math.abs(Math.sin(p + congestionSeed)) * 0.6,
      isToll: false,
      tollFeeInr: 0,
      roadType: 'arterial',
      incidentPenaltyMin: 0,
    });
  }

  // Connect layer to layer + lateral edges within layer
  for (let l = 1; l < layers; l++) {
    for (let p = 0; p < perLayer; p++) {
      const uId = `N_${l}_${p}`;
      const uNode = nodes.get(uId)!;

      // Connect to adjacent layer nodes
      for (let np = Math.max(0, p - 1); np <= Math.min(perLayer - 1, p + 1); np++) {
        const vId = `N_${l + 1}_${np}`;
        const vNode = nodes.get(vId)!;
        const dist = haversineDistanceKm(uNode, vNode);

        // Highway corridor for middle lane (p === 1 or 2)
        const isHighway = (p === 1 && np === 1) || (p === 2 && np === 2);
        const freeFlow = isHighway ? 85 : 45;
        const congestion = 1.0 + Math.abs(Math.sin(l * 3 + p * 5 + congestionSeed)) * (isHighway ? 0.3 : 0.8);
        const hasToll = isHighway && l === 2;

        addEdge(adjacency, {
          from: uId,
          to: vId,
          distanceKm: dist,
          speedLimitKmh: isHighway ? 90 : 50,
          freeFlowSpeedKmh: freeFlow,
          congestionFactor: congestion,
          isToll: hasToll,
          tollFeeInr: hasToll ? 85 : 0,
          roadType: isHighway ? 'highway' : 'arterial',
          incidentPenaltyMin: (l === 2 && p === 0) ? 6 : 0, // Simulated incident on lane 0
        });
      }

      // Lateral edge (cross connection)
      if (p < perLayer - 1) {
        const vLatId = `N_${l}_${p + 1}`;
        const vLatNode = nodes.get(vLatId)!;
        const dist = haversineDistanceKm(uNode, vLatNode);
        addEdge(adjacency, {
          from: uId,
          to: vLatId,
          distanceKm: dist,
          speedLimitKmh: 40,
          freeFlowSpeedKmh: 35,
          congestionFactor: 1.2,
          isToll: false,
          tollFeeInr: 0,
          roadType: 'residential',
          incidentPenaltyMin: 0,
        });
      }
    }
  }

  // Connect last layer to destination
  for (let p = 0; p < perLayer; p++) {
    const sourceId = `N_${layers}_${p}`;
    const sourceNode = nodes.get(sourceId)!;
    const dist = haversineDistanceKm(sourceNode, destNode);
    addEdge(adjacency, {
      from: sourceId,
      to: 'destination',
      distanceKm: dist,
      speedLimitKmh: 50,
      freeFlowSpeedKmh: 45,
      congestionFactor: 1.1 + Math.abs(Math.cos(p)) * 0.4,
      isToll: false,
      tollFeeInr: 0,
      roadType: 'arterial',
      incidentPenaltyMin: 0,
    });
  }

  return { nodes, adjacency };
}

function addEdge(adj: Map<string, GraphEdge[]>, edge: GraphEdge) {
  const list = adj.get(edge.from) || [];
  list.push(edge);
  adj.set(edge.from, list);
}

import { RoadNetworkGraph, GraphEdge } from './graph';
import { ObjectiveWeights, VehicleProfile } from '../types';
import { calculateConsumptionAndCost } from './vehicleModels';

export interface PathResult {
  pathNodeIds: string[];
  coordinates: [number, number][];
  totalDistanceKm: number;
  totalDurationMin: number;
  totalCostInr: number;
  totalEmissionsKg: number;
  objectiveScore: number;
  visitedNodesCount: number;
  executionTimeMs: number;
}

export function runDijkstra(
  graph: RoadNetworkGraph,
  originId: string,
  destinationId: string,
  vehicle: VehicleProfile,
  weights: ObjectiveWeights
): PathResult {
  const startTime = performance.now();

  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: GraphEdge } | null>();
  const unvisited = new Set<string>();

  for (const nodeId of graph.nodes.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }

  distances.set(originId, 0);

  let visitedCount = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let minCost = Infinity;

    for (const nodeId of unvisited) {
      const cost = distances.get(nodeId)!;
      if (cost < minCost) {
        minCost = cost;
        currentId = nodeId;
      }
    }

    if (!currentId || minCost === Infinity || currentId === destinationId) {
      break;
    }

    unvisited.delete(currentId);
    visitedCount++;

    const edges = graph.adjacency.get(currentId) || [];
    for (const edge of edges) {
      if (!unvisited.has(edge.to)) continue;

      // Calculate edge cost based on objective weights
      const effectiveSpeed = Math.max(15, edge.freeFlowSpeedKmh / edge.congestionFactor);
      const edgeDurationMin = (edge.distanceKm / effectiveSpeed) * 60 + edge.incidentPenaltyMin;
      const consumption = calculateConsumptionAndCost(edge.distanceKm, edge.incidentPenaltyMin, vehicle);
      const edgeCostInr = consumption.totalCostInr + (edge.isToll ? edge.tollFeeInr : 0);
      const edgeEmissionsKg = consumption.emissionsKg;

      // Weighted multi-objective edge metric
      const edgeCompositeCost =
        weights.time * (edgeDurationMin / 10) +
        weights.cost * (edgeCostInr / 50) +
        weights.distance * (edge.distanceKm / 5) +
        weights.emissions * (edgeEmissionsKg / 2);

      const alt = distances.get(currentId)! + edgeCompositeCost;
      if (alt < distances.get(edge.to)!) {
        distances.set(edge.to, alt);
        previous.set(edge.to, { nodeId: currentId, edge });
      }
    }
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const edgesTaken: GraphEdge[] = [];
  let curr: string | null = destinationId;

  while (curr) {
    pathNodeIds.unshift(curr);
    const prev = previous.get(curr);
    if (!prev) break;
    edgesTaken.unshift(prev.edge);
    curr = prev.nodeId;
  }

  // If unreachable, fallback to direct path
  if (pathNodeIds.length === 0 || pathNodeIds[0] !== originId) {
    pathNodeIds.splice(0, pathNodeIds.length, originId, destinationId);
  }

  const coordinates: [number, number][] = pathNodeIds.map((id) => {
    const n = graph.nodes.get(id);
    return n ? [n.lat, n.lng] : [0, 0];
  });

  let totalDistanceKm = 0;
  let totalDurationMin = 0;
  let totalTollsInr = 0;

  for (const edge of edgesTaken) {
    totalDistanceKm += edge.distanceKm;
    const effSpeed = Math.max(15, edge.freeFlowSpeedKmh / edge.congestionFactor);
    totalDurationMin += (edge.distanceKm / effSpeed) * 60 + edge.incidentPenaltyMin;
    if (edge.isToll) totalTollsInr += edge.tollFeeInr;
  }

  if (edgesTaken.length === 0) {
    const oNode = graph.nodes.get(originId)!;
    const dNode = graph.nodes.get(destinationId)!;
    const dist = Math.sqrt(Math.pow(dNode.lat - oNode.lat, 2) + Math.pow(dNode.lng - oNode.lng, 2)) * 111;
    totalDistanceKm = dist;
    totalDurationMin = (dist / 40) * 60;
  }

  const consumption = calculateConsumptionAndCost(totalDistanceKm, 0, vehicle);
  const totalCostInr = consumption.totalCostInr + totalTollsInr;
  const totalEmissionsKg = consumption.emissionsKg;

  const executionTimeMs = performance.now() - startTime;

  return {
    pathNodeIds,
    coordinates,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalDurationMin: Number(totalDurationMin.toFixed(1)),
    totalCostInr: Number(totalCostInr.toFixed(1)),
    totalEmissionsKg: Number(totalEmissionsKg.toFixed(2)),
    objectiveScore: Number(distances.get(destinationId)?.toFixed(4) || 0),
    visitedNodesCount: visitedCount,
    executionTimeMs: Number(executionTimeMs.toFixed(2)),
  };
}

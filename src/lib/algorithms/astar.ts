import { RoadNetworkGraph, GraphEdge } from './graph';
import { ObjectiveWeights, VehicleProfile } from '../types';
import { calculateConsumptionAndCost } from './vehicleModels';
import { haversineDistanceKm } from '../utils';
import { PathResult } from './dijkstra';

export function runAStar(
  graph: RoadNetworkGraph,
  originId: string,
  destinationId: string,
  vehicle: VehicleProfile,
  weights: ObjectiveWeights
): PathResult {
  const startTime = performance.now();

  const destNode = graph.nodes.get(destinationId)!;

  // Heuristic: estimated optimistic multi-objective cost from node to destination
  const heuristic = (nodeId: string): number => {
    const node = graph.nodes.get(nodeId);
    if (!node || !destNode) return 0;
    const directKm = haversineDistanceKm(node, destNode);
    // Optimistic estimate: free flow 80 km/h, no delay, no toll
    const estMin = (directKm / 80) * 60;
    const estCost = (directKm / vehicle.efficiency) * vehicle.fuelPrice;
    const estEmissions = (directKm * vehicle.emissionFactor) / 1000;

    return (
      weights.time * (estMin / 10) +
      weights.cost * (estCost / 50) +
      weights.distance * (directKm / 5) +
      weights.emissions * (estEmissions / 2)
    );
  };

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: GraphEdge } | null>();
  const openSet = new Set<string>();

  for (const nodeId of graph.nodes.keys()) {
    gScore.set(nodeId, Infinity);
    fScore.set(nodeId, Infinity);
    previous.set(nodeId, null);
  }

  gScore.set(originId, 0);
  fScore.set(originId, heuristic(originId));
  openSet.add(originId);

  let visitedCount = 0;

  while (openSet.size > 0) {
    let currentId: string | null = null;
    let lowestF = Infinity;

    for (const nodeId of openSet) {
      const f = fScore.get(nodeId)!;
      if (f < lowestF) {
        lowestF = f;
        currentId = nodeId;
      }
    }

    if (!currentId || currentId === destinationId) {
      break;
    }

    openSet.delete(currentId);
    visitedCount++;

    const edges = graph.adjacency.get(currentId) || [];
    for (const edge of edges) {
      const effSpeed = Math.max(15, edge.freeFlowSpeedKmh / edge.congestionFactor);
      const edgeDurationMin = (edge.distanceKm / effSpeed) * 60 + edge.incidentPenaltyMin;
      const consumption = calculateConsumptionAndCost(edge.distanceKm, edge.incidentPenaltyMin, vehicle);
      const edgeCostInr = consumption.totalCostInr + (edge.isToll ? edge.tollFeeInr : 0);
      const edgeEmissionsKg = consumption.emissionsKg;

      const edgeCost =
        weights.time * (edgeDurationMin / 10) +
        weights.cost * (edgeCostInr / 50) +
        weights.distance * (edge.distanceKm / 5) +
        weights.emissions * (edgeEmissionsKg / 2);

      const tentativeG = gScore.get(currentId)! + edgeCost;

      if (tentativeG < gScore.get(edge.to)!) {
        previous.set(edge.to, { nodeId: currentId, edge });
        gScore.set(edge.to, tentativeG);
        fScore.set(edge.to, tentativeG + heuristic(edge.to));
        openSet.add(edge.to);
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
    objectiveScore: Number(gScore.get(destinationId)?.toFixed(4) || 0),
    visitedNodesCount: visitedCount,
    executionTimeMs: Number(executionTimeMs.toFixed(2)),
  };
}

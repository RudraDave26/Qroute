import { NextRequest, NextResponse } from 'next/server';
import { executeDynamicFleetReoptimization } from '@/lib/algorithms/dynamicFleetReoptimizer';
import { FleetVrpProblem, FleetVrpSolution, DynamicReoptEvent } from '@/lib/types';
import { PRESET_FLEET_PROBLEMS } from '@/lib/algorithms/fleetVrp';
import { solveFleetVrpQiga } from '@/lib/algorithms/qigaFleet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      problem = PRESET_FLEET_PROBLEMS['bengaluru-ecommerce'],
      priorSolution = null,
      event = {
        id: `event-${Date.now()}`,
        type: 'vehicle_breakdown',
        timestampMin: 45,
        targetVehicleId: 'van-blr-2',
      } as DynamicReoptEvent,
    } = body;

    const baselineSolution: FleetVrpSolution =
      priorSolution || solveFleetVrpQiga(problem);

    const reoptResult = executeDynamicFleetReoptimization(problem, baselineSolution, event);

    return NextResponse.json({
      success: true,
      result: reoptResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fleet dynamic re-optimization error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to re-optimize fleet' },
      { status: 500 }
    );
  }
}

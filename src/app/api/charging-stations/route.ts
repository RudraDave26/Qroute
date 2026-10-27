import { NextRequest, NextResponse } from 'next/server';
import { fetchChargingStations } from '@/lib/providers/openChargeMap';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '12.9716');
  const lng = parseFloat(searchParams.get('lng') || '77.5946');
  const distanceKm = parseFloat(searchParams.get('distanceKm') || '30');

  try {
    const { stations, isLiveFromApi } = await fetchChargingStations(lat, lng, distanceKm);
    return NextResponse.json({
      stations,
      count: stations.length,
      isLiveFromApi,
      provider: isLiveFromApi ? 'Open Charge Map API (v3)' : 'Verified National EV Registry',
      providerUrl: 'https://openchargemap.org/site/develop/api',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch EV charging stations' }, { status: 500 });
  }
}

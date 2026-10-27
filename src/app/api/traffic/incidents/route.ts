import { NextRequest, NextResponse } from 'next/server';
import { fetchTomTomIncidents } from '@/lib/providers/tomtom';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const minLat = parseFloat(searchParams.get('minLat') || '12.80');
  const minLng = parseFloat(searchParams.get('minLng') || '77.45');
  const maxLat = parseFloat(searchParams.get('maxLat') || '13.15');
  const maxLng = parseFloat(searchParams.get('maxLng') || '77.80');

  try {
    const { incidents, status, message } = await fetchTomTomIncidents({
      minLat,
      minLng,
      maxLat,
      maxLng,
    });

    return NextResponse.json({
      incidents,
      count: incidents.length,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch traffic incidents' },
      { status: 500 }
    );
  }
}

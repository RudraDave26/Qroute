import { NextRequest, NextResponse } from 'next/server';
import { getIntermediatePlacesAlongRoute } from '@/lib/providers/intermediatePlaces';
import { LatLng } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat1 = parseFloat(searchParams.get('lat1') || '12.9352');
  const lng1 = parseFloat(searchParams.get('lng1') || '77.6245');
  const lat2 = parseFloat(searchParams.get('lat2') || '12.9698');
  const lng2 = parseFloat(searchParams.get('lng2') || '77.7500');
  const category = searchParams.get('category') || 'all';
  const maxDistanceKm = parseFloat(searchParams.get('maxDistanceKm') || '4.0');

  const origin: LatLng = { lat: lat1, lng: lng1 };
  const destination: LatLng = { lat: lat2, lng: lng2 };

  try {
    const data = await getIntermediatePlacesAlongRoute(origin, destination, [], category, maxDistanceKm);
    return NextResponse.json({
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch intermediate places' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      origin = { lat: 12.9352, lng: 77.6245 },
      destination = { lat: 12.9698, lng: 77.7500 },
      coordinates = [],
      category = 'all',
      maxDistanceKm = 4.0,
    } = body;

    const data = await getIntermediatePlacesAlongRoute(
      origin,
      destination,
      coordinates,
      category,
      maxDistanceKm
    );

    return NextResponse.json({
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate intermediate places along route' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/providers/openmeteo';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '12.9716');
  const lng = parseFloat(searchParams.get('lng') || '77.5946');

  try {
    const weather = await fetchWeather(lat, lng);
    return NextResponse.json({ weather, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}

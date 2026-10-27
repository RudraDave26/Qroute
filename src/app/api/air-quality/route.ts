import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQuality } from '@/lib/providers/airQuality';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '12.9716');
  const lng = parseFloat(searchParams.get('lng') || '77.5946');

  try {
    const airQuality = await fetchAirQuality(lat, lng);
    return NextResponse.json({
      airQuality,
      provider: 'Open-Meteo Air Quality API (Copernicus Atmosphere Monitoring Service)',
      providerUrl: 'https://open-meteo.com/en/docs/air-quality-api',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch air quality' }, { status: 500 });
  }
}

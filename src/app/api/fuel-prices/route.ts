import { NextRequest, NextResponse } from 'next/server';
import { getFuelPrices } from '@/lib/providers/fuelPrice';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Bengaluru';

  try {
    const prices = await getFuelPrices(city);
    return NextResponse.json({
      city,
      prices,
      timestamp: new Date().toISOString(),
      note: 'Prices reflect retail benchmarks and regulatory tariffs. Manual user overrides available in Settings.',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fuel prices' }, { status: 500 });
  }
}

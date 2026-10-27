import { NextRequest, NextResponse } from 'next/server';
import { getFuelPrices } from '@/lib/providers/fuelPrice';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Bengaluru';

  try {
    const result = await getFuelPrices(city);
    return NextResponse.json({
      city,
      prices: result.prices,
      attribution: result.attribution,
      sourceDate: result.sourceDate,
      isLive: result.isLive,
      providerUrl: 'https://india-petroleum-api.vercel.app/docs',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fuel prices' }, { status: 500 });
  }
}

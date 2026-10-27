import { NextRequest, NextResponse } from 'next/server';
import { getFuelPrices } from '@/lib/providers/fuelPrice';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || searchParams.get('state') || 'Bengaluru';

  try {
    const result = await getFuelPrices(city);

    // Extract quick-lookup key-value pairs for easy consumption in UI widgets
    const petrolObj = result.prices.find((p) => p.fuelType === 'petrol');
    const dieselObj = result.prices.find((p) => p.fuelType === 'diesel');
    const cngObj = result.prices.find((p) => p.fuelType === 'cng');
    const evObj = result.prices.find((p) => p.fuelType === 'ev');

    return NextResponse.json({
      city,
      prices: {
        petrol: petrolObj?.priceInr ?? 102.86,
        diesel: dieselObj?.priceInr ?? 88.94,
        cng: cngObj?.priceInr ?? 82.50,
        ev: evObj?.priceInr ?? 7.80,
      },
      priceList: result.prices,
      dataStatus: result.isLive ? 'LIVE' : 'DEMO',
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

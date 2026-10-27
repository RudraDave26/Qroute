import { FuelPriceQuote } from '../types';

export const CITY_FUEL_RATES: Record<string, { petrol: number; diesel: number; cng: number; ev: number }> = {
  Bengaluru: { petrol: 102.86, diesel: 88.94, cng: 82.50, ev: 7.80 },
  Delhi: { petrol: 94.72, diesel: 87.62, cng: 75.09, ev: 6.50 },
  Mumbai: { petrol: 104.21, diesel: 92.15, cng: 75.00, ev: 8.50 },
  Hyderabad: { petrol: 107.41, diesel: 95.65, cng: 89.00, ev: 7.20 },
  Chennai: { petrol: 100.75, diesel: 92.34, cng: 85.00, ev: 7.50 },
  Pune: { petrol: 104.08, diesel: 90.62, cng: 86.00, ev: 8.00 },
  Kolkata: { petrol: 103.94, diesel: 90.76, cng: 83.00, ev: 7.00 },
};

export async function getFuelPrices(city: string = 'Bengaluru'): Promise<FuelPriceQuote[]> {
  const provider = process.env.FUEL_PRICE_PROVIDER || 'benchmark_market_feed';
  const apiKey = process.env.FUEL_PRICE_API_KEY;

  const defaultRates = CITY_FUEL_RATES[city] || CITY_FUEL_RATES['Bengaluru'];
  const now = new Date().toISOString();

  // If user configured a dedicated external API key and provider
  if (apiKey && provider === 'indianapi') {
    try {
      const res = await fetch(`https://indianapi.in/fuel-price-api?city=${encodeURIComponent(city)}&api_key=${apiKey}`);
      if (res.ok) {
        const data = await res.json();
        return [
          { fuelType: 'petrol', priceInr: data.petrol ?? defaultRates.petrol, unit: 'INR / L', city, provider: 'IndianAPI Feed', lastUpdated: now, isLive: true },
          { fuelType: 'diesel', priceInr: data.diesel ?? defaultRates.diesel, unit: 'INR / L', city, provider: 'IndianAPI Feed', lastUpdated: now, isLive: true },
          { fuelType: 'cng', priceInr: data.cng ?? defaultRates.cng, unit: 'INR / kg', city, provider: 'IndianAPI Feed', lastUpdated: now, isLive: true },
          { fuelType: 'ev', priceInr: defaultRates.ev, unit: 'INR / kWh', city, provider: 'State Electricity Regulatory Commission', lastUpdated: now, isLive: false },
        ];
      }
    } catch (e) {
      // Fallback to benchmark
    }
  }

  return [
    {
      fuelType: 'petrol',
      priceInr: Number(process.env.DEFAULT_PETROL_PRICE_INR) || defaultRates.petrol,
      unit: 'INR / Liter',
      city,
      provider: 'OMC Retail Price Index (IOCL/BPCL/HPCL)',
      lastUpdated: now,
      isLive: false,
    },
    {
      fuelType: 'diesel',
      priceInr: Number(process.env.DEFAULT_DIESEL_PRICE_INR) || defaultRates.diesel,
      unit: 'INR / Liter',
      city,
      provider: 'OMC Retail Price Index (IOCL/BPCL/HPCL)',
      lastUpdated: now,
      isLive: false,
    },
    {
      fuelType: 'cng',
      priceInr: Number(process.env.DEFAULT_CNG_PRICE_INR) || defaultRates.cng,
      unit: 'INR / kg',
      city,
      provider: 'City Gas Distribution (CGD) Regulatory Tariffs',
      lastUpdated: now,
      isLive: false,
    },
    {
      fuelType: 'ev',
      priceInr: Number(process.env.DEFAULT_EV_KWH_PRICE_INR) || defaultRates.ev,
      unit: 'INR / kWh',
      city,
      provider: 'State Electricity Regulatory Commission / EV Public Charging Tariffs',
      lastUpdated: now,
      isLive: false,
    },
  ];
}

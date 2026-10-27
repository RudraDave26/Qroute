import { NextResponse } from 'next/server';
import { getIndianStates, getIndiaCountryOverview } from '@/lib/providers/indianAdminData';

export async function GET() {
  try {
    const [states, countryMeta] = await Promise.all([
      getIndianStates(),
      getIndiaCountryOverview(),
    ]);

    return NextResponse.json({
      success: true,
      provider: 'OpenAdminData (api.openadmindata.org)',
      country: countryMeta.meta?.countryName || { local: 'भारत', en: 'India' },
      stats: countryMeta.stats,
      totalStates: states.length,
      data: states,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Indian administrative states' },
      { status: 500 }
    );
  }
}

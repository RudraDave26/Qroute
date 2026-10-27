import { NextRequest, NextResponse } from 'next/server';
import { searchLgdCities, searchIndianAdministrativeEntities } from '@/lib/providers/indianAdminData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({
      success: true,
      query: q || '',
      data: [],
      message: 'Query must contain at least 2 characters',
    });
  }

  try {
    const [lgdResults, unifiedResults] = await Promise.all([
      searchLgdCities(q),
      searchIndianAdministrativeEntities(q),
    ]);

    return NextResponse.json({
      success: true,
      query: q,
      provider: 'Local Government Directory (lgd-json-api.vercel.app) & OpenAdminData',
      totalLgdCities: lgdResults.length,
      totalUnifiedMatches: unifiedResults.length,
      lgdRawData: lgdResults,
      geolocatedMatches: unifiedResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search Indian cities' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getIndianDistricts } from '@/lib/providers/indianAdminData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateId = searchParams.get('stateId') || undefined;
  const q = searchParams.get('q')?.toLowerCase() || undefined;

  try {
    let districts = await getIndianDistricts(stateId);

    if (q) {
      districts = districts.filter(
        (d) =>
          d.nameEn.toLowerCase().includes(q) ||
          d.nameLocal.toLowerCase().includes(q) ||
          d.parentNameEn.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      provider: 'OpenAdminData (api.openadmindata.org)',
      total: districts.length,
      filter: { stateId: stateId || 'all', query: q || null },
      data: districts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Indian districts' },
      { status: 500 }
    );
  }
}

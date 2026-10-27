import { NextRequest, NextResponse } from 'next/server';
import { searchGeocode } from '@/lib/providers/nominatim';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchGeocode(q);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to geocode location query' },
      { status: 500 }
    );
  }
}

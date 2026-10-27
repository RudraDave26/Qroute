import { NextRequest, NextResponse } from 'next/server';
import { fetchTomTomFlowSegment, TOMTOM_API_DOCS_URL } from '@/lib/providers/tomtom';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '12.9716');
  const lng = parseFloat(searchParams.get('lng') || '77.5946');

  try {
    const flowData = await fetchTomTomFlowSegment(lat, lng);
    return NextResponse.json({
      flow: flowData,
      documentationUrl: TOMTOM_API_DOCS_URL,
      specification: 'TomTom Maps v1 Product Information / Traffic Flow API',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve flow segment data' }, { status: 500 });
  }
}

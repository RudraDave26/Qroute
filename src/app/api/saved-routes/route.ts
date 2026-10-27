import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SAMPLE_ROUTES } from '@/lib/storage';
import { SavedRouteItem } from '@/lib/types';

// In-memory fallback cache for server-side persistence during session
let inMemorySavedRoutes: SavedRouteItem[] = [...INITIAL_SAMPLE_ROUTES];

export async function GET() {
  return NextResponse.json({
    routes: inMemorySavedRoutes,
    total: inMemorySavedRoutes.length,
    storageType: 'Client LocalStorage & Session Cache',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newItem: SavedRouteItem = {
      ...body,
      id: body.id || `srv-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    inMemorySavedRoutes.unshift(newItem);
    return NextResponse.json({ success: true, route: newItem });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save route' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing route id' }, { status: 400 });
  }

  inMemorySavedRoutes = inMemorySavedRoutes.filter((r) => r.id !== id);
  return NextResponse.json({ success: true, id });
}

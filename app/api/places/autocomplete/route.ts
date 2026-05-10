// Won Vision: Places Autocomplete proxy (Places API New v1)
// GET /api/places/autocomplete?q=… — Clerk-auth guard, AU-restricted.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface Prediction {
  description: string;
  place_id: string;
}

interface NewPlacesPrediction {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
  };
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ predictions: [] });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Maps not configured' }, { status: 503 });
  }

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input: q,
      includedRegionCodes: ['au'],
      includedPrimaryTypes: ['street_address', 'premise', 'subpremise', 'route'],
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = j?.error?.message || JSON.stringify(j);
    } catch {
      detail = await res.text();
    }
    return NextResponse.json(
      { error: `Google Places (New): ${detail || `HTTP ${res.status}`}` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as { suggestions?: NewPlacesPrediction[] };
  const predictions: Prediction[] = (data.suggestions ?? [])
    .map((s) => ({
      description: s.placePrediction?.text?.text ?? '',
      place_id: s.placePrediction?.placeId ?? '',
    }))
    .filter((p) => p.place_id && p.description);

  return NextResponse.json({ predictions });
}

// app/api/admin/blob-token/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { handleClientBlobUpload } from '@/lib/blob';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const propertyId = url.searchParams.get('propertyId');
  if (!propertyId) {
    return NextResponse.json({ error: 'propertyId required' }, { status: 400 });
  }

  const body = await request.json();
  try {
    const result = await handleClientBlobUpload(body, request, {
      propertyId,
      editorId: editor.id,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload error' },
      { status: 400 }
    );
  }
}

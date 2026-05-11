// app/api/workflow/trigger/route.ts
// POST — validates CRON_SECRET, starts a processProperty workflow run, and
// writes the run ID back to the properties row so the cron backstop can skip it.

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { start } from 'workflow/api';
import { db, properties } from '@/lib/db';
import { processProperty } from '@/lib/workflow/process-property';

export async function POST(req: Request) {
  let body: { propertyId?: string; secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { propertyId, secret } = body;

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!propertyId || typeof propertyId !== 'string') {
    return NextResponse.json({ error: 'propertyId required' }, { status: 400 });
  }

  try {
    const run = await start(processProperty, [propertyId]);

    // Record the run ID so the cron backstop skips this property.
    await db
      .update(properties)
      .set({ workflowRunId: run.runId })
      .where(eq(properties.id, propertyId));

    return NextResponse.json({ ok: true, runId: run.runId });
  } catch (err) {
    console.error('workflow/trigger error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

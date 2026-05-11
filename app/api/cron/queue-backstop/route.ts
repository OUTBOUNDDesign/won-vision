// app/api/cron/queue-backstop/route.ts
// GET — invoked every 5 minutes by Vercel Cron.
// Finds properties that are stuck in 'queued' with no workflowRunId and
// kicks off a processProperty workflow run for each, writing the run ID back.

import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { start } from 'workflow/api';
import { db, properties } from '@/lib/db';
import { processProperty } from '@/lib/workflow/process-property';

export async function GET(req: Request) {
  // Vercel Cron attaches: Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization');
  if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const stuck = await db
    .select()
    .from(properties)
    .where(and(eq(properties.status, 'queued'), isNull(properties.workflowRunId)))
    .limit(10);

  const results: { id: string; ok: boolean; runId?: string; error?: string }[] = [];

  for (const p of stuck) {
    try {
      const run = await start(processProperty, [p.id]);
      await db
        .update(properties)
        .set({ workflowRunId: run.runId })
        .where(eq(properties.id, p.id));
      results.push({ id: p.id, ok: true, runId: run.runId });
    } catch (err) {
      console.error(`cron backstop failed for property ${p.id}:`, err);
      results.push({
        id: p.id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ swept: stuck.length, results });
}

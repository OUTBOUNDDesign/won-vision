// lib/intake/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db, editors, properties, photos } from '@/lib/db';
import { isStylePreset } from '@/lib/styles';

async function requireEditor() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) throw new Error('Not authorised');
  return editor;
}

const draftSchema = z.object({
  address: z.string().min(5).max(300),
  contactEmail: z.string().email(),
});

export async function createDraft(input: z.infer<typeof draftSchema>) {
  const editor = await requireEditor();
  const data = draftSchema.parse(input);

  const [row] = await db
    .insert(properties)
    .values({
      address: data.address,
      contactEmail: data.contactEmail,
      tier: 'standard',
      photoCount: 0,
      status: 'draft',
      submittedById: editor.id,
    })
    .returning({ id: properties.id });

  return { ok: true as const, propertyId: row.id };
}

const photoSchema = z.object({
  propertyId: z.string().uuid(),
  blobUrl: z.string().url(),
  filename: z.string().min(1).max(300),
  services: z.array(z.enum(['declutter', 'stage', 'dusk'])).min(0).max(3),
  style: z.string().refine(isStylePreset, 'Unknown style preset').optional(),
});

export async function attachPhoto(input: z.infer<typeof photoSchema>) {
  await requireEditor();
  const data = photoSchema.parse(input);

  await db.insert(photos).values({
    propertyId: data.propertyId,
    originalBlobUrl: data.blobUrl,
    filename: data.filename,
    services: data.services,
    style: data.style,
  });

  revalidatePath(`/admin/editor/new`);
  return { ok: true as const };
}

export async function submitProperty(propertyId: string) {
  await requireEditor();
  z.string().uuid().parse(propertyId);

  await db
    .update(properties)
    .set({ status: 'queued' })
    .where(eq(properties.id, propertyId));

  // Fire the workflow — non-blocking. Errors are logged; the cron backstop is
  // the safety net for any missed invocations.
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  fetch(`${base}/api/workflow/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId, secret: process.env.CRON_SECRET }),
  }).catch((err) =>
    console.error('workflow trigger failed (cron backstop will retry):', err),
  );

  revalidatePath('/admin/editor');
  revalidatePath(`/admin/editor/${propertyId}`);
  return { ok: true as const };
}

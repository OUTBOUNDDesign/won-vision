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
  tier: z.enum(['small', 'standard', 'large']),
  photoCount: z.number().int().min(1).max(200),
});

export async function createDraft(input: z.infer<typeof draftSchema>) {
  const editor = await requireEditor();
  const data = draftSchema.parse(input);

  const [row] = await db
    .insert(properties)
    .values({
      address: data.address,
      contactEmail: data.contactEmail,
      tier: data.tier,
      photoCount: data.photoCount,
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
  service: z.enum(['declutter', 'stage', 'dusk', 'declutter-stage']),
  style: z.string().refine(isStylePreset, 'Unknown style preset').optional(),
});

export async function attachPhoto(input: z.infer<typeof photoSchema>) {
  await requireEditor();
  const data = photoSchema.parse(input);

  await db.insert(photos).values({
    propertyId: data.propertyId,
    originalBlobUrl: data.blobUrl,
    filename: data.filename,
    service: data.service,
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

  revalidatePath('/admin/editor');
  revalidatePath(`/admin/editor/${propertyId}`);
  return { ok: true as const };
}

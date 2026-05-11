// lib/workflow/process-property.ts
//
// Property orchestrator workflow. Reads the property + photos from the DB,
// guards idempotency, ensures Dropbox folders, copies originals into
// /00 INTAKE/, then fans out per-photo workflows in parallel batches of 3.
//
// Sub-workflow composition: `start()` cannot be called inside a workflow body,
// so each sub-workflow launch is wrapped in a `'use step'` function. We await
// `run.returnValue` inside that step to synchronously await completion before
// the step itself resolves — this lets the parent workflow use `Promise.all`
// over a batch and treat each photo as a durable child.

import { eq } from 'drizzle-orm';
import { start } from 'workflow/api';
import { db, properties, photos } from '@/lib/db';
import { ensureFolder, uploadFromUrl } from '@/lib/dropbox/client';
import {
  buildIntakePath,
  buildProcessingPath,
  buildReviewPath,
} from '@/lib/dropbox/paths';
import { batch } from './helpers';
import { processPhoto } from './process-photo';

const BATCH_SIZE = 3;

// ────────────────────────────────────────────────────────────────────────────
// Steps
// ────────────────────────────────────────────────────────────────────────────

type LoadedProperty = {
  id: string;
  address: string;
  status: string;
};

type LoadedPhoto = {
  id: string;
  propertyId: string;
  originalBlobUrl: string | null;
  filename: string | null;
  services: string[];
  style: string | null;
};

async function loadProperty(propertyId: string): Promise<LoadedProperty | null> {
  'use step';
  const row = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
  });
  if (!row) return null;
  return { id: row.id, address: row.address, status: row.status };
}

async function loadPhotos(propertyId: string): Promise<LoadedPhoto[]> {
  'use step';
  const rows = await db.select().from(photos).where(eq(photos.propertyId, propertyId));
  return rows.map((p) => ({
    id: p.id,
    propertyId: p.propertyId,
    originalBlobUrl: p.originalBlobUrl,
    filename: p.filename,
    services: p.services,
    style: p.style,
  }));
}

async function markPropertyProcessing(propertyId: string) {
  'use step';
  await db
    .update(properties)
    .set({ status: 'processing', processingStartedAt: new Date() })
    .where(eq(properties.id, propertyId));
}

async function markPropertyReview(propertyId: string) {
  'use step';
  await db.update(properties).set({ status: 'review' }).where(eq(properties.id, propertyId));
}

async function ensureDropboxFolders(address: string) {
  'use step';
  await ensureFolder(buildIntakePath(address));
  await ensureFolder(buildProcessingPath(address));
  await ensureFolder(buildReviewPath(address));
}

async function intakePhoto(args: {
  photoId: string;
  address: string;
  originalBlobUrl: string;
  filename: string;
}) {
  'use step';
  const target = `${buildIntakePath(args.address)}/${args.photoId}_${args.filename}`;
  const path = await uploadFromUrl(args.originalBlobUrl, target);
  await db
    .update(photos)
    .set({ originalDropboxPath: path, status: 'queued' })
    .where(eq(photos.id, args.photoId));
}

/**
 * Launch a child `processPhoto` workflow and wait for it to complete.
 * Wrapped in a step because `start()` cannot be called directly inside the
 * parent workflow context.
 */
async function runPhotoWorkflow(args: {
  photoId: string;
  address: string;
  originalBlobUrl: string;
  filename: string;
  services: string[];
  style?: string;
}) {
  'use step';
  const run = await start(processPhoto, [args]);
  await run.returnValue;
}

// ────────────────────────────────────────────────────────────────────────────
// Workflow
// ────────────────────────────────────────────────────────────────────────────

export async function processProperty(propertyId: string): Promise<void> {
  'use workflow';

  const property = await loadProperty(propertyId);
  if (!property) throw new Error(`Property ${propertyId} not found`);

  // Idempotency: only kick off if the property is freshly queued.
  if (property.status !== 'queued') return;

  await markPropertyProcessing(propertyId);
  await ensureDropboxFolders(property.address);

  const photoRows = await loadPhotos(propertyId);

  // Copy every original blob into the Dropbox intake folder.
  for (const p of photoRows) {
    if (!p.originalBlobUrl || !p.filename) continue;
    await intakePhoto({
      photoId: p.id,
      address: property.address,
      originalBlobUrl: p.originalBlobUrl,
      filename: p.filename,
    });
  }

  // Fan out into parallel batches of 3.
  for (const group of batch(photoRows, BATCH_SIZE)) {
    await Promise.all(
      group
        .filter((p) => p.originalBlobUrl && p.filename)
        .map((p) =>
          runPhotoWorkflow({
            photoId: p.id,
            address: property.address,
            originalBlobUrl: p.originalBlobUrl!,
            filename: p.filename!,
            services: p.services,
            style: p.style ?? undefined,
          }),
        ),
    );
  }

  await markPropertyReview(propertyId);
}

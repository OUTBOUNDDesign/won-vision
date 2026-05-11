// lib/workflow/process-photo.ts
//
// Per-photo durable workflow: chains the ordered services
// (declutter → stage → dusk), runs the final service twice for two variants,
// QAs each variant with Gemini (one retry), and promotes passing variants
// from the processing folder to the editor review folder.
//
// Workflow SDK note: top-level async function with `'use workflow'`. All side
// effects (DB, fetch, fal.ai, Gemini, Dropbox) live inside `'use step'`
// functions defined below.

import { eq } from 'drizzle-orm';
import { db, photos } from '@/lib/db';
import { generate } from '@/lib/fal/client';
import { qaVariant } from '@/lib/gemini/qa';
import { uploadFromUrl, move, getTemporaryLink } from '@/lib/dropbox/client';
import { buildProcessingPath, buildReviewPath } from '@/lib/dropbox/paths';
import { orderServices } from './helpers';
import type { ServiceId } from '@/app/admin/editor/new/Intake';

const MAX_QA_ATTEMPTS = 2; // initial + 1 retry

// ────────────────────────────────────────────────────────────────────────────
// Step functions — full Node.js access. Workflow function below orchestrates.
// ────────────────────────────────────────────────────────────────────────────

async function markPhotoProcessing(photoId: string) {
  'use step';
  await db.update(photos).set({ status: 'processing' }).where(eq(photos.id, photoId));
}

async function markPhotoApproved(photoId: string) {
  'use step';
  await db.update(photos).set({ status: 'approved' }).where(eq(photos.id, photoId));
}

async function generateIntermediate(
  service: ServiceId,
  style: string | undefined,
  inputUrl: string,
): Promise<string> {
  'use step';
  const out = await generate({ service, style, inputImageUrl: inputUrl, numOutputs: 1 });
  return out[0].url;
}

async function uploadIntermediate(sourceUrl: string, targetPath: string): Promise<string> {
  'use step';
  return await uploadFromUrl(sourceUrl, targetPath);
}

async function getTempLink(path: string): Promise<string> {
  'use step';
  return await getTemporaryLink(path);
}

async function generateAndUploadVariant(
  service: ServiceId,
  style: string | undefined,
  inputUrl: string,
  targetPath: string,
): Promise<{ tempLink: string; storedPath: string }> {
  'use step';
  const out = await generate({ service, style, inputImageUrl: inputUrl, numOutputs: 1 });
  const storedPath = await uploadFromUrl(out[0].url, targetPath);
  const tempLink = await getTemporaryLink(storedPath);
  return { tempLink, storedPath };
}

async function runQa(originalUrl: string, editedUrl: string) {
  'use step';
  return await qaVariant(originalUrl, editedUrl);
}

async function recordQaAttempt(photoId: string, attempt: number) {
  'use step';
  await db.update(photos).set({ qaAttempts: attempt }).where(eq(photos.id, photoId));
}

async function promoteVariant(fromPath: string, toPath: string) {
  'use step';
  await move(fromPath, toPath);
}

async function recordVariantPass(
  photoId: string,
  variantIdx: 1 | 2,
  reviewPath: string,
  qaScore: number,
  qaIssues: string[],
) {
  'use step';
  const set =
    variantIdx === 1
      ? { variant1Path: reviewPath, qaScore, qaIssues, qaPass: true }
      : { variant2Path: reviewPath, qaScore, qaIssues, qaPass: true };
  await db.update(photos).set(set).where(eq(photos.id, photoId));
}

async function recordVariantFail(photoId: string, qaScore: number, qaIssues: string[]) {
  'use step';
  await db
    .update(photos)
    .set({ qaScore, qaIssues, qaPass: false })
    .where(eq(photos.id, photoId));
}

async function finalisePhotoStatus(photoId: string) {
  'use step';
  const row = await db.query.photos.findFirst({ where: eq(photos.id, photoId) });
  const anyPassed = !!(row?.variant1Path || row?.variant2Path);
  await db
    .update(photos)
    .set({ status: anyPassed ? 'review' : 'rejected' })
    .where(eq(photos.id, photoId));
}

// ────────────────────────────────────────────────────────────────────────────
// Workflow function — pure orchestration, no side effects.
// ────────────────────────────────────────────────────────────────────────────

export async function processPhoto(args: {
  photoId: string;
  address: string;
  originalBlobUrl: string;
  filename: string;
  services: string[];
  style?: string;
}): Promise<void> {
  'use workflow';

  const chain = orderServices(args.services);
  if (chain.length === 0) {
    await markPhotoApproved(args.photoId);
    return;
  }

  await markPhotoProcessing(args.photoId);

  let currentUrl = args.originalBlobUrl;

  // Intermediate services: 1 output each, overwrite currentUrl with the
  // Dropbox temporary link so the next service edits the latest pass.
  for (let i = 0; i < chain.length - 1; i++) {
    const service = chain[i];
    const generatedUrl = await generateIntermediate(service, args.style, currentUrl);
    const targetPath = `${buildProcessingPath(args.address)}/${args.photoId}_${service}_intermediate.jpg`;
    const storedPath = await uploadIntermediate(generatedUrl, targetPath);
    currentUrl = await getTempLink(storedPath);
  }

  // Final service: 2 variants, each with one QA retry.
  const finalService = chain[chain.length - 1] as ServiceId;

  for (const variantIdx of [1, 2] as const) {
    let attempt = 0;
    let qaScore = 0;
    let qaIssues: string[] = [];
    let qaPass = false;
    let storedPath: string | null = null;

    while (attempt < MAX_QA_ATTEMPTS && !qaPass) {
      attempt++;
      const tmpProcessingPath = `${buildProcessingPath(args.address)}/${args.photoId}_v${variantIdx}_att${attempt}.jpg`;
      const { tempLink, storedPath: sp } = await generateAndUploadVariant(
        finalService,
        args.style,
        currentUrl,
        tmpProcessingPath,
      );
      storedPath = sp;

      const qa = await runQa(args.originalBlobUrl, tempLink);
      qaScore = qa.score;
      qaIssues = qa.issues;
      qaPass = qa.pass;

      await recordQaAttempt(args.photoId, attempt);
    }

    if (qaPass && storedPath) {
      const reviewPath = `${buildReviewPath(args.address)}/${args.photoId}_v${variantIdx}.jpg`;
      await promoteVariant(storedPath, reviewPath);
      await recordVariantPass(args.photoId, variantIdx, reviewPath, qaScore, qaIssues);
    } else {
      await recordVariantFail(args.photoId, qaScore, qaIssues);
    }
  }

  await finalisePhotoStatus(args.photoId);
}

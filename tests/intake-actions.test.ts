// tests/intake-actions.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(async () => ({ userId: 'user_test' })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual<any>('drizzle-orm');
  return {
    db: {
      query: { editors: { findFirst: vi.fn() } },
      insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(async () => [{ id: 'prop_1' }]) })) })),
      update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) })),
    },
    editors: {},
    properties: {},
    photos: {},
    ...actual,
  };
});

import { createDraft, attachPhoto, submitProperty } from '@/lib/intake/actions';
import { db } from '@/lib/db';

describe('intake actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // restore auth to authenticated state before each test
    const clerkMod = await import('@clerk/nextjs/server');
    (clerkMod.auth as any) = vi.fn(async () => ({ userId: 'user_test' }));
    (db.query.editors.findFirst as any).mockResolvedValue({ id: 'editor_1', role: 'admin' });
  });

  it('createDraft inserts a property with status=draft and returns id', async () => {
    const result = await createDraft({
      address: '12 Smith St, Brunswick',
      contactEmail: 'agent@example.com',
    });
    expect(result).toEqual({ ok: true, propertyId: 'prop_1' });
    expect(db.insert).toHaveBeenCalled();
  });

  it('createDraft rejects unauthenticated callers', async () => {
    (await import('@clerk/nextjs/server')).auth = vi.fn(async () => ({ userId: null })) as any;
    await expect(
      createDraft({ address: 'x', contactEmail: 'a@b' })
    ).rejects.toThrow(/auth/i);
  });

  it('attachPhoto accepts multi-service arrays', async () => {
    // reset insert mock for photo insert (returns no id but we don't need one)
    (db.insert as any).mockReturnValueOnce({ values: vi.fn(async () => undefined) });
    const r = await attachPhoto({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      blobUrl: 'https://blob.vercel-storage.com/test.jpg',
      filename: 'test.jpg',
      services: ['declutter', 'dusk'],
    });
    expect(r).toEqual({ ok: true });
    expect(db.insert).toHaveBeenCalled();
  });

  it('attachPhoto accepts empty services array (skip)', async () => {
    (db.insert as any).mockReturnValueOnce({ values: vi.fn(async () => undefined) });
    const r = await attachPhoto({
      propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      blobUrl: 'https://blob.vercel-storage.com/test.jpg',
      filename: 'test.jpg',
      services: [],
    });
    expect(r).toEqual({ ok: true });
  });

  it('attachPhoto rejects invalid service values', async () => {
    await expect(
      attachPhoto({
        propertyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        blobUrl: 'https://blob.vercel-storage.com/test.jpg',
        filename: 'test.jpg',
        services: ['invalid-service' as any],
      })
    ).rejects.toThrow();
  });

  it('submitProperty flips status to queued', async () => {
    const r = await submitProperty('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(r).toEqual({ ok: true });
    expect(db.update).toHaveBeenCalled();
  });
});

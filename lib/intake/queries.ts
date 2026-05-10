// lib/intake/queries.ts
import { desc } from 'drizzle-orm';
import { db, properties } from '@/lib/db';

export async function listEditorProperties() {
  return db.select().from(properties).orderBy(desc(properties.createdAt)).limit(50);
}

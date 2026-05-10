import { test, expect } from '@playwright/test';
import { neon } from '@neondatabase/serverless';

test('schema: required tables exist', async () => {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const rows = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  const names = rows.map((r: { tablename: string }) => r.tablename);
  expect(names).toEqual(expect.arrayContaining(['editors', 'photos', 'properties']));
});

test('schema: properties.magic_link_token is unique', async () => {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const rows = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'properties' AND indexdef LIKE '%magic_link_token%' AND indexdef LIKE '%UNIQUE%'
  `;
  expect(rows.length).toBeGreaterThan(0);
});

test('schema: editors.clerk_user_id is unique', async () => {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
  const rows = await sql`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'editors' AND indexdef LIKE '%clerk_user_id%' AND indexdef LIKE '%UNIQUE%'
  `;
  expect(rows.length).toBeGreaterThan(0);
});

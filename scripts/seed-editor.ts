import { db, editors } from '../lib/db';

async function main() {
  const clerkUserId = process.argv[2];
  const email = process.argv[3];
  const role = (process.argv[4] || 'admin') as 'admin' | 'editor';

  if (!clerkUserId || !email) {
    console.error('Usage: tsx scripts/seed-editor.ts <clerkUserId> <email> [role]');
    process.exit(1);
  }

  const existing = await db.query.editors.findFirst({
    where: (t, { eq }) => eq(t.clerkUserId, clerkUserId),
  });

  if (existing) {
    console.log(`Editor already exists: ${existing.email} (${existing.role})`);
    process.exit(0);
  }

  const [created] = await db.insert(editors).values({ clerkUserId, email, role }).returning();
  console.log(`Created editor: ${created.email} (${created.role}, id ${created.id})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

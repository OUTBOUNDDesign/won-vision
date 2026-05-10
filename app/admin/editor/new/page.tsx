// app/admin/editor/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { Intake } from './Intake';
import { STYLE_PRESETS } from '@/lib/styles';

export default async function NewProperty() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) redirect('/admin');

  return (
    <section>
      <div style={{ marginBottom: '2rem' }}>
        <p className="eyebrow" style={{ marginBottom: '8px' }}>New property</p>
        <p style={{ fontSize: '13px', color: '#737373' }}>
          Fill in the property details, upload photos, and tag each one before submitting.
        </p>
      </div>
      <Intake stylePresets={STYLE_PRESETS} />
    </section>
  );
}

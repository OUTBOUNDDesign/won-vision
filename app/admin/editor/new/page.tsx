// app/admin/editor/new/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { Stepper } from './Stepper';
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
        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: '#000',
          letterSpacing: '-0.01em',
          marginBottom: '4px',
        }}>
          New property intake
        </h1>
        <p style={{ fontSize: '13px', color: '#888' }}>
          Complete all four steps to submit a property for editing.
        </p>
      </div>
      <Stepper stylePresets={STYLE_PRESETS} />
    </section>
  );
}

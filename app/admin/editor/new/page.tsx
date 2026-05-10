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
      <h1>New property intake</h1>
      <Stepper stylePresets={STYLE_PRESETS} />
    </section>
  );
}

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });

  if (!editor) {
    const user = await currentUser();
    return (
      <section style={{ maxWidth: '480px' }}>
        <p className="eyebrow" style={{ marginBottom: '12px' }}>Access denied</p>
        <p style={{ fontSize: '14px', color: '#404040', lineHeight: 1.6 }}>
          Your account ({user?.primaryEmailAddress?.emailAddress}) is signed in but is not authorized as an editor.
        </p>
        <p style={{ fontSize: '14px', color: '#737373', marginTop: '8px' }}>
          Ask the administrator to add you to the editors table.
        </p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: '480px' }}>
      <p className="eyebrow" style={{ marginBottom: '12px' }}>Won Vision</p>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#000', marginBottom: '4px', letterSpacing: '-0.01em' }}>
        {editor.email}
      </h1>
      <p style={{ fontSize: '13px', color: '#737373', marginBottom: '32px', textTransform: 'capitalize' }}>
        {editor.role}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li>Photographer shoots — coming soon</li>
      </ul>
    </section>
  );
}

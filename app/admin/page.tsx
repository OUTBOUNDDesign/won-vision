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
      <section>
        <h1>Access denied</h1>
        <p>Your account ({user?.primaryEmailAddress?.emailAddress}) is signed in, but is not authorized as an editor.</p>
        <p>Ask the administrator to add you to the editors table.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Welcome, {editor.email}</h1>
      <p>Role: {editor.role}</p>
      <p>This is the placeholder editor dashboard. The review queue ships in Phase 5.</p>
    </section>
  );
}

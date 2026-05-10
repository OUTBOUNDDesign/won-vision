// app/admin/editor/page.tsx
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { listEditorProperties } from '@/lib/intake/queries';

export default async function EditorIndex() {
  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');

  const editor = await db.query.editors.findFirst({
    where: eq(editors.clerkUserId, userId),
  });
  if (!editor) redirect('/admin');

  const rows = await listEditorProperties();

  return (
    <section>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Editor intake</h1>
        <Link href="/admin/editor/new">+ New property</Link>
      </header>
      {rows.length === 0 ? (
        <p>No properties yet. Start one with &quot;New property&quot;.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Tier</th>
              <th>Photos</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/editor/${r.id}`}>{r.address}</Link>
                </td>
                <td>{r.tier}</td>
                <td>{r.photoCount}</td>
                <td>{r.status}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// app/admin/editor/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors, properties, photos } from '@/lib/db';

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const editor = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!editor) redirect('/admin');

  const property = await db.query.properties.findFirst({ where: eq(properties.id, id) });
  if (!property) notFound();

  const rows = await db.select().from(photos).where(eq(photos.propertyId, id));

  return (
    <section>
      <h1>{property.address}</h1>
      <p>Status: <strong>{property.status}</strong> · Tier {property.tier} · {rows.length} photos</p>
      <p>Contact: {property.contactEmail}</p>
      {property.status === 'queued' && <p>Queued for the AI pipeline (Phase 4 picks this up).</p>}
      <table>
        <thead><tr><th>File</th><th>Service</th><th>Style</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.filename}</td>
              <td>{p.service}</td>
              <td>{p.style ?? '—'}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// app/admin/editor/page.tsx
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { listEditorProperties } from '@/lib/intake/queries';

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; textDecoration?: string }> = {
  draft:      { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5' },
  intake:     { bg: '#fff',    color: '#404040', border: '1px solid #999999' },
  queued:     { bg: '#000',    color: '#fff',    border: '1px solid #000' },
  processing: { bg: '#F5F5F5', color: '#404040', border: '1px solid #999999' },
  review:     { bg: '#fff',    color: '#000',    border: '1px solid #000' },
  approved:   { bg: '#000',    color: '#fff',    border: '1px solid #000' },
  delivered:  { bg: '#fff',    color: '#000',    border: '1px solid #000' },
  cancelled:  { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5', textDecoration: 'line-through' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#F5F5F5', color: '#737373', border: '1px solid #E5E5E5' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 0,
      fontSize: '10px',
      fontWeight: 500,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      border: s.border,
      textDecoration: s.textDecoration,
    }}>
      {status}
    </span>
  );
}

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: '6px' }}>Property intake</p>
          <p style={{ fontSize: '13px', color: '#737373' }}>
            {rows.length === 0 ? 'No properties yet' : `${rows.length} propert${rows.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        <Link href="/admin/editor/new" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#000',
          color: '#fff',
          padding: '9px 18px',
          borderRadius: 0,
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          + New property
        </Link>
      </div>

      {rows.length === 0 ? (
        <div style={{
          border: '1px dashed #000',
          borderRadius: 0,
          padding: '60px 32px',
          textAlign: 'center',
          color: '#737373',
        }}>
          <p style={{ fontSize: '14px', marginBottom: '8px', color: '#404040' }}>No properties yet.</p>
          <p style={{ fontSize: '13px' }}>Start with &ldquo;New property&rdquo; above.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 0, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 80px 120px 160px',
            padding: '10px 20px',
            borderBottom: '1px solid #E5E5E5',
            background: '#F5F5F5',
          }}>
            {['Address', 'Tier', 'Photos', 'Status', 'Created'].map((h) => (
              <span key={h} style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#737373' }}>{h}</span>
            ))}
          </div>

          {rows.map((r, idx) => (
            <div key={r.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 80px 120px 160px',
              padding: '14px 20px',
              alignItems: 'center',
              borderBottom: idx < rows.length - 1 ? '1px solid #F5F5F5' : 'none',
            }}>
              <Link href={`/admin/editor/${r.id}`} style={{ fontSize: '14px', fontWeight: 500, color: '#000', textDecoration: 'none' }}>
                {r.address}
              </Link>
              <span style={{ fontSize: '13px', color: '#404040', textTransform: 'capitalize' }}>{r.tier}</span>
              <span style={{ fontSize: '13px', color: '#404040' }}>{r.photoCount}</span>
              <span><StatusPill status={r.status} /></span>
              <span style={{ fontSize: '12px', color: '#737373' }}>
                {new Date(r.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// app/admin/editor/page.tsx
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, editors } from '@/lib/db';
import { listEditorProperties } from '@/lib/intake/queries';

const STATUS_STYLES: Record<string, { bg: string; color: string; border?: string; textDecoration?: string }> = {
  draft:      { bg: '#f5f5f5',  color: '#666' },
  queued:     { bg: '#002FA7',  color: '#fff' },
  processing: { bg: '#fef3c7', color: '#92400e' },
  review:     { bg: '#f3e8ff', color: '#7e22ce' },
  approved:   { bg: '#dcfce7', color: '#166534' },
  delivered:  { bg: '#fff',    color: '#166534', border: '1px solid #166534' },
  cancelled:  { bg: '#f5f5f5', color: '#aaa', textDecoration: 'line-through' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#f5f5f5', color: '#666' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      border: s.border ?? '1px solid transparent',
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
      {/* Page header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 600,
            color: '#000',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}>
            Property intake
          </h1>
          <p style={{ fontSize: '13px', color: '#888' }}>
            {rows.length === 0 ? 'No properties yet' : `${rows.length} propert${rows.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        <Link href="/admin/editor/new" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#002FA7',
          color: '#fff',
          padding: '9px 18px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.02em',
          textDecoration: 'none',
        }}>
          + New property
        </Link>
      </div>

      {rows.length === 0 ? (
        <div style={{
          border: '1px dashed #ddd',
          borderRadius: '10px',
          padding: '60px 32px',
          textAlign: 'center',
          color: '#aaa',
        }}>
          <p style={{ fontSize: '15px', marginBottom: '8px', color: '#666' }}>No properties yet.</p>
          <p style={{ fontSize: '13px' }}>Start with &ldquo;New property&rdquo; above.</p>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 80px 120px 160px',
            padding: '10px 20px',
            borderBottom: '1px solid #e5e5e5',
            background: '#fafafa',
          }}>
            {['Address', 'Tier', 'Photos', 'Status', 'Created'].map((h) => (
              <span key={h} style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#999',
              }}>{h}</span>
            ))}
          </div>

          {/* Table rows */}
          {rows.map((r, idx) => (
            <div key={r.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 80px 120px 160px',
              padding: '14px 20px',
              alignItems: 'center',
              borderBottom: idx < rows.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}>
              <Link href={`/admin/editor/${r.id}`} style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#002FA7',
                textDecoration: 'none',
              }}>
                {r.address}
              </Link>
              <span style={{ fontSize: '13px', color: '#555', textTransform: 'capitalize' }}>{r.tier}</span>
              <span style={{ fontSize: '13px', color: '#555' }}>{r.photoCount}</span>
              <span><StatusPill status={r.status} /></span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {new Date(r.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

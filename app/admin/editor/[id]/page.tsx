// app/admin/editor/[id]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors, properties, photos } from '@/lib/db';

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
      padding: '3px 12px',
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
      {/* Back nav */}
      <Link href="/admin/editor" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#888',
        marginBottom: '1.5rem',
        textDecoration: 'none',
      }}>
        ← All properties
      </Link>

      {/* Property header card */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '10px',
        padding: '24px',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#000',
            letterSpacing: '-0.01em',
          }}>
            {property.address}
          </h1>
          <StatusPill status={property.status} />
        </div>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Contact', value: property.contactEmail },
            { label: 'Tier', value: property.tier.charAt(0).toUpperCase() + property.tier.slice(1) },
            { label: 'Photos', value: `${rows.length}` },
            { label: 'Submitted', value: new Date(property.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', marginBottom: '2px' }}>{label}</p>
              <p style={{ fontSize: '14px', color: '#333' }}>{value}</p>
            </div>
          ))}
        </div>
        {property.status === 'queued' && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: '#f0f4ff',
            border: '1px solid #c7d5f5',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#002FA7',
          }}>
            This property is queued for the AI editing pipeline.
          </div>
        )}
      </div>

      {/* Photos */}
      <div style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: '10px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e5e5e5',
          background: '#fafafa',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Photos</span>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
            No photos attached.
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 140px 140px 120px',
              padding: '10px 20px',
              borderBottom: '1px solid #e5e5e5',
            }}>
              {['', 'File', 'Service', 'Style', 'Status'].map((h) => (
                <span key={h} style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#bbb',
                }}>{h}</span>
              ))}
            </div>

            {rows.map((p, idx) => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 140px 140px 120px',
                padding: '12px 20px',
                alignItems: 'center',
                borderBottom: idx < rows.length - 1 ? '1px solid #f0f0f0' : 'none',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                  flexShrink: 0,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.originalBlobUrl ?? ''}
                    alt={p.filename ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ fontSize: '13px', color: '#333', wordBreak: 'break-all', paddingRight: '12px' }}>{p.filename}</span>
                <span style={{ fontSize: '13px', color: '#555', textTransform: 'capitalize' }}>{p.service.replace(/-/g, ' ')}</span>
                <span style={{ fontSize: '13px', color: '#555' }}>{p.style ?? '—'}</span>
                <span><StatusPill status={p.status} /></span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

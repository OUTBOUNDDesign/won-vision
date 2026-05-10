// app/admin/editor/[id]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors, properties, photos } from '@/lib/db';

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; textDecoration?: string }> = {
  draft:      { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5' },
  intake:     { bg: '#fff',    color: '#404040', border: '1px solid #999999' },
  queued:     { bg: '#000',    color: '#fff',    border: '1px solid #000' },
  processing: { bg: '#F5F5F5', color: '#404040', border: '1px solid #999999' },
  review:     { bg: '#fff',    color: '#000',    border: '1px solid #000' },
  approved:   { bg: '#000',    color: '#fff',    border: '1px solid #000' },
  delivered:  { bg: '#fff',    color: '#000',    border: '1px solid #000' },
  cancelled:  { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5', textDecoration: 'line-through' },
  // photo statuses
  pending:    { bg: '#F5F5F5', color: '#737373', border: '1px solid #E5E5E5' },
  rejected:   { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5', textDecoration: 'line-through' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#F5F5F5', color: '#737373', border: '1px solid #E5E5E5' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
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
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#737373',
        marginBottom: '1.5rem',
        textDecoration: 'none',
      }}>
        ← All properties
      </Link>

      {/* Property header card */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 0, padding: '24px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#000', letterSpacing: '-0.01em' }}>
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
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#737373', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontSize: '14px', color: '#000' }}>{value}</p>
            </div>
          ))}
        </div>
        {property.status === 'queued' && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: '#F5F5F5',
            border: '1px solid #000',
            borderRadius: 0,
            fontSize: '13px',
            color: '#000',
          }}>
            This property is queued for the AI editing pipeline.
          </div>
        )}
      </div>

      {/* Photos table */}
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E5E5', background: '#F5F5F5' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#737373' }}>Photos</span>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#737373', fontSize: '14px' }}>
            No photos attached.
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 160px 140px 120px',
              padding: '10px 20px',
              borderBottom: '1px solid #E5E5E5',
            }}>
              {['', 'File', 'Services', 'Style', 'Status'].map((h) => (
                <span key={h} style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#737373' }}>{h}</span>
              ))}
            </div>

            {rows.map((p, idx) => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 160px 140px 120px',
                padding: '12px 20px',
                alignItems: 'center',
                borderBottom: idx < rows.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}>
                <div style={{ width: '44px', height: '44px', overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.originalBlobUrl ?? ''} alt={p.filename ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '13px', color: '#000', wordBreak: 'break-all', paddingRight: '12px' }}>{p.filename}</span>
                <span style={{ fontSize: '13px', color: '#404040' }}>
                  {Array.isArray(p.services) && p.services.length > 0 ? p.services.join(' + ') : '—'}
                </span>
                <span style={{ fontSize: '13px', color: '#404040' }}>{p.style ?? '—'}</span>
                <span><StatusPill status={p.status} /></span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

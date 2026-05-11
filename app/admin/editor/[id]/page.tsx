// app/admin/editor/[id]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, editors, properties, photos } from '@/lib/db';

// ─── Status pill styles ──────────────────────────────────────────────────────
// B&W brand rules:
//   queued / processing / review  → filled black, white text
//   pending / approved            → outlined black (white bg)
//   delivered                     → outlined black bold
//   rejected                      → grey, strikethrough
//   draft / intake / cancelled    → muted grey outline

const STATUS_STYLES: Record<string, {
  bg: string;
  color: string;
  border: string;
  fontWeight?: number;
  textDecoration?: string;
}> = {
  // property statuses
  draft:      { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5' },
  intake:     { bg: '#fff',    color: '#404040', border: '1px solid #999999' },
  queued:     { bg: '#000',    color: '#fff',    border: '1px solid #000' },
  processing: { bg: '#000',    color: '#fff',    border: '1px solid #000' },
  review:     { bg: '#fff',    color: '#000',    border: '1px solid #000' },
  approved:   { bg: '#fff',    color: '#000',    border: '1px solid #000' },
  delivered:  { bg: '#fff',    color: '#000',    border: '1px solid #000', fontWeight: 700 },
  cancelled:  { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5', textDecoration: 'line-through' },
  // photo-only statuses
  pending:    { bg: '#fff',    color: '#737373', border: '1px solid #E5E5E5' },
  rejected:   { bg: '#F5F5F5', color: '#737373', border: '1px solid #E5E5E5', textDecoration: 'line-through' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#F5F5F5', color: '#737373', border: '1px solid #E5E5E5' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 0,
      fontSize: '10px',
      fontWeight: s.fontWeight ?? 500,
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

/** Return just the filename portion of a Dropbox path, or '—' if absent. */
function pathBasename(p: string | null | undefined): string {
  if (!p) return '—';
  return p.split('/').pop() ?? p;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect('/admin/sign-in');
  const editor = await db.query.editors.findFirst({ where: eq(editors.clerkUserId, userId) });
  if (!editor) redirect('/admin');

  const property = await db.query.properties.findFirst({ where: eq(properties.id, id) });
  if (!property) notFound();

  const rows = await db.select().from(photos).where(eq(photos.propertyId, id));

  // Processing banner counts
  const completeStatuses = new Set(['review', 'approved', 'rejected']);
  const completeCount = rows.filter((p) => completeStatuses.has(p.status)).length;
  const totalCount = rows.length;

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

      {/* Processing banner — shown only while the pipeline is running */}
      {property.status === 'processing' && (
        <div style={{
          border: '1px solid #000',
          background: '#fff',
          padding: '16px 20px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#737373',
            flexShrink: 0,
          }}>
            Pipeline
          </span>
          <span style={{ fontSize: '13px', color: '#000' }}>
            Processing — {completeCount}/{totalCount} photo{totalCount !== 1 ? 's' : ''} complete
          </span>
        </div>
      )}

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
            {/* Header row — 8 columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 160px 120px 80px 80px 160px 160px',
              padding: '10px 20px',
              borderBottom: '1px solid #E5E5E5',
              overflowX: 'auto',
            }}>
              {['', 'File', 'Services', 'Style', 'Status', 'QA', 'Variant 1', 'Variant 2'].map((h) => (
                <span key={h} style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#737373' }}>{h}</span>
              ))}
            </div>

            {rows.map((p, idx) => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 160px 120px 80px 80px 160px 160px',
                padding: '12px 20px',
                alignItems: 'center',
                borderBottom: idx < rows.length - 1 ? '1px solid #F5F5F5' : 'none',
                overflowX: 'auto',
              }}>
                {/* Thumbnail */}
                <div style={{ width: '44px', height: '44px', overflow: 'hidden', background: '#F5F5F5', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.originalBlobUrl ?? ''}
                    alt={p.filename ?? ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Filename */}
                <span style={{ fontSize: '13px', color: '#000', wordBreak: 'break-all', paddingRight: '12px' }}>
                  {p.filename}
                </span>

                {/* Services */}
                <span style={{ fontSize: '13px', color: '#404040' }}>
                  {Array.isArray(p.services) && p.services.length > 0 ? p.services.join(' + ') : '—'}
                </span>

                {/* Style */}
                <span style={{ fontSize: '13px', color: '#404040' }}>{p.style ?? '—'}</span>

                {/* Status pill */}
                <span><StatusPill status={p.status} /></span>

                {/* QA score */}
                <span style={{ fontSize: '13px', color: '#000', fontVariantNumeric: 'tabular-nums' }}>
                  {p.qaScore != null ? `${p.qaScore}/10` : '—'}
                </span>

                {/* Variant 1 path (filename only) */}
                <span style={{
                  fontSize: '12px',
                  color: p.variant1Path ? '#000' : '#737373',
                  wordBreak: 'break-all',
                  paddingRight: '8px',
                }}>
                  {pathBasename(p.variant1Path)}
                </span>

                {/* Variant 2 path (filename only) */}
                <span style={{
                  fontSize: '12px',
                  color: p.variant2Path ? '#000' : '#737373',
                  wordBreak: 'break-all',
                }}>
                  {pathBasename(p.variant2Path)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

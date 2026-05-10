'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { attachPhoto, submitProperty } from '@/lib/intake/actions';
import type { StylePresetId } from '@/lib/styles';
import type { StylePreset } from './types';
import type { IntakeState } from './Intake';

const SERVICES = {
  declutter: 'Declutter',
  stage: 'Virtual staging',
  dusk: 'Day-to-dusk',
} as const;

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#000',
  color: '#fff',
  padding: '11px 26px',
  borderRadius: 0,
  fontSize: '11px',
  fontWeight: 500,
  fontFamily: 'inherit',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
};

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#fff',
  color: '#000',
  padding: '11px 26px',
  borderRadius: 0,
  fontSize: '11px',
  fontWeight: 500,
  fontFamily: 'inherit',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  border: '1px solid #000',
  cursor: 'pointer',
};

const disabledBtn: React.CSSProperties = { opacity: 0.35, cursor: 'not-allowed' };

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5E5E5',
  borderRadius: 0,
  padding: '28px',
  maxWidth: '700px',
};

function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 16px',
      background: '#fff',
      border: '1px solid #000',
      marginBottom: '20px',
    }}>
      <span style={{ fontSize: '14px', flexShrink: 0 }}>!</span>
      <p style={{ fontSize: '13px', color: '#000', lineHeight: 1.5, margin: 0 }}>{message}</p>
    </div>
  );
}

export function ReviewScreen({
  state,
  stylePresets,
  onEdit,
}: {
  state: IntakeState;
  stylePresets: readonly StylePreset[];
  onEdit: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      for (const p of state.photos) {
        await attachPhoto({
          propertyId: state.propertyId,
          blobUrl: p.blobUrl,
          filename: p.filename,
          services: p.services,
          style: p.style as StylePresetId | undefined,
        });
      }
      await submitProperty(state.propertyId);
      router.push(`/admin/editor/${state.propertyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      {error && <ErrorAlert message={error} />}

      {/* ── Summary ── */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#000', marginBottom: '24px' }}>
          Review & submit
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Address', value: state.address },
            { label: 'Contact', value: state.contactEmail },
            { label: 'Photos', value: `${state.photos.length} uploaded` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#737373', marginBottom: '4px' }}>
                {label}
              </p>
              <p style={{ fontSize: '14px', color: '#000', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Photo list ── */}
      <div style={{ ...card, marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#737373', marginBottom: '14px' }}>
          Photos ({state.photos.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {state.photos.map((p, i) => {
            const serviceLabel = p.services.length === 0
              ? 'Skip'
              : p.services.map((s) => SERVICES[s]).join(' + ');
            const styleLabel = p.style
              ? stylePresets.find((sp) => sp.id === p.style)?.label ?? p.style
              : null;

            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr',
                gap: '12px',
                alignItems: 'center',
                padding: '10px 14px',
                background: '#F5F5F5',
                border: '1px solid #E5E5E5',
                borderRadius: 0,
              }}>
                <div style={{ width: '44px', height: '44px', overflow: 'hidden', background: '#E5E5E5' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.previewUrl ?? p.blobUrl} alt={p.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.filename}
                  </span>
                  <span style={{ fontSize: '12px', color: '#737373', flexShrink: 0 }}>
                    {serviceLabel}{styleLabel ? ` · ${styleLabel}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          style={{ ...secondaryBtn, ...(busy ? disabledBtn : {}) }}
        >
          ← Edit
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          style={{ ...primaryBtn, ...(busy ? disabledBtn : {}) }}
        >
          {busy ? 'Submitting…' : 'Submit & queue →'}
        </button>
      </div>
    </div>
  );
}

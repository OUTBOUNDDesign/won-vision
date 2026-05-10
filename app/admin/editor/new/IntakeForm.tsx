'use client';

import { useState, useRef, useCallback } from 'react';
import { upload } from '@vercel/blob/client';
import { createDraft } from '@/lib/intake/actions';
import { AddressField, formatAddress } from './AddressField';
import type { StylePreset } from './types';
import type { IntakeState, ServiceId, UploadedPhoto } from './Intake';

/* ─── Brand tokens (inline — no Tailwind) ─── */
const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #000',
  borderRadius: 0,
  fontSize: '14px',
  color: '#000',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#000',
  marginBottom: '6px',
};

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

const disabledBtn: React.CSSProperties = { opacity: 0.35, cursor: 'not-allowed' };

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5E5E5',
  borderRadius: 0,
  padding: '28px',
  maxWidth: '700px',
};

const SERVICES: { id: ServiceId; label: string }[] = [
  { id: 'declutter', label: 'Declutter' },
  { id: 'stage', label: 'Virtual staging' },
  { id: 'dusk', label: 'Day-to-dusk' },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Sub-components ─── */
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

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ width: '100%', height: '2px', background: '#E5E5E5', overflow: 'hidden', marginTop: '4px' }}>
      <div style={{ width: `${progress}%`, height: '100%', background: '#000', transition: 'width 0.2s ease' }} />
    </div>
  );
}

function ServiceChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 0,
        fontSize: '11px',
        fontWeight: 500,
        fontFamily: 'inherit',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        border: '1px solid #000',
        background: active ? '#000' : '#fff',
        color: active ? '#fff' : '#000',
        transition: 'background 0.1s, color 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function PhotoRow({
  photo, index, stylePresets,
  onToggleService, onStyleChange, onRemove,
}: {
  photo: UploadedPhoto;
  index: number;
  stylePresets: readonly StylePreset[];
  onToggleService: (idx: number, svc: ServiceId) => void;
  onStyleChange: (idx: number, style: string | undefined) => void;
  onRemove: (idx: number) => void;
}) {
  const showStyle = photo.services.includes('stage');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '52px 1fr',
      gap: '12px',
      alignItems: 'start',
      padding: '14px 16px',
      background: '#F5F5F5',
      border: '1px solid #E5E5E5',
      borderRadius: 0,
    }}>
      <div style={{ width: '44px', height: '44px', overflow: 'hidden', background: '#E5E5E5', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.previewUrl ?? photo.blobUrl} alt={photo.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#000', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
            {photo.filename}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: '#737373' }}>{formatBytes(photo.size)}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737373', fontSize: '18px', lineHeight: 1, padding: '0 2px', fontFamily: 'inherit' }}
              aria-label="Remove photo"
            >×</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: showStyle ? '10px' : '0' }}>
          {SERVICES.map((s) => (
            <ServiceChip
              key={s.id}
              label={s.label}
              active={photo.services.includes(s.id)}
              onClick={() => onToggleService(index, s.id)}
            />
          ))}
        </div>

        {showStyle && (
          <div style={{ marginTop: '10px' }}>
            <label style={{ ...labelStyle, marginBottom: '4px' }}>Style</label>
            <select
              value={photo.style ?? ''}
              onChange={(e) => onStyleChange(index, e.target.value || undefined)}
              style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px', width: 'auto', minWidth: '200px' }}
            >
              <option value="">— No style —</option>
              {stylePresets.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── IntakeForm ─── */
export function IntakeForm({
  stylePresets,
  initial,
  onContinue,
}: {
  stylePresets: readonly StylePreset[];
  initial?: IntakeState;
  onContinue: (state: IntakeState) => void;
}) {
  const [unit, setUnit] = useState('');
  const [addressBase, setAddressBase] = useState(initial?.address ?? '');
  const address = formatAddress(unit, addressBase);
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '');
  const [propertyId, setPropertyId] = useState<string | null>(initial?.propertyId ?? null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState<{ filename: string; size: number; progress: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addressOk = addressBase.trim().length >= 5;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());
  const photosWithService = photos.filter((p) => p.services.length > 0);
  const canContinue = addressOk && emailOk && photos.length > 0 && photosWithService.length > 0 && !busy;

  async function ensureDraft(): Promise<string> {
    if (propertyId) return propertyId;
    const r = await createDraft({ address: address.trim(), contactEmail: contactEmail.trim() });
    setPropertyId(r.propertyId);
    return r.propertyId;
  }

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);

    let pid: string;
    try {
      pid = await ensureDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
      return;
    }

    const trackers = files.map((f) => ({ filename: f.name, size: f.size, progress: 0 }));
    setUploading(trackers);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);

        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: `/api/admin/blob-token?propertyId=${pid}`,
          onUploadProgress: ({ percentage }) => {
            setUploading((prev) =>
              prev.map((t, idx) => (idx === i ? { ...t, progress: percentage } : t))
            );
          },
        });

        setPhotos((prev) => [
          ...prev,
          { blobUrl: blob.url, filename: file.name, size: file.size, services: [], previewUrl },
        ]);
        setUploading((prev) => prev.filter((_, idx) => idx !== i));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setUploading([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, address, contactEmail]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/heic', 'image/webp'].includes(f.type)
    );
    uploadFiles(files);
  }

  function toggleService(idx: number, svc: ServiceId) {
    setPhotos((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const has = p.services.includes(svc);
        const services = has ? p.services.filter((s) => s !== svc) : [...p.services, svc];
        const style = services.includes('stage') ? p.style : undefined;
        return { ...p, services, style };
      })
    );
  }

  function setStyle(idx: number, style: string | undefined) {
    setPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, style } : p)));
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  async function handleContinue() {
    if (!canContinue) return;
    setBusy(true);
    setError(null);
    try {
      const pid = await ensureDraft();
      onContinue({
        propertyId: pid,
        address: address.trim(),
        contactEmail: contactEmail.trim(),
        photos,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      {error && <ErrorAlert message={error} />}

      {/* ── Property details ── */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#000', marginBottom: '24px' }}>
          Property details
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="address">Address</label>
          {/* Unit + address row — flex row, stacks below 560px */}
          <style>{`
            .wv-address-row { display:flex; flex-direction:row; gap:12px; align-items:flex-start; }
            .wv-unit-col    { flex:0 0 120px; min-width:120px; }
            .wv-addr-col    { flex:1 1 240px; min-width:200px; }
            @media (max-width:559px) {
              .wv-address-row { flex-direction:column; }
              .wv-unit-col, .wv-addr-col { flex:1 1 auto; min-width:0; }
            }
          `}</style>
          <div className="wv-address-row">
            {/* Unit / Apt — narrow, optional */}
            <div className="wv-unit-col">
              <input
                id="unit"
                type="text"
                maxLength={20}
                placeholder="Unit / Apt"
                value={unit}
                autoComplete="off"
                onChange={(e) => setUnit(e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.border = '2px solid #000';
                  e.currentTarget.style.padding = '9px 11px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid #000';
                  e.currentTarget.style.padding = '10px 12px';
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #000',
                  borderRadius: 0,
                  fontSize: '14px',
                  color: '#000',
                  background: '#fff',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {/* Address autocomplete — takes remaining width */}
            <div className="wv-addr-col">
              <AddressField
                value={addressBase}
                onChange={(addr) => setAddressBase(addr)}
              />
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="email">Contact email</label>
          <input
            id="email"
            required
            type="email"
            placeholder="agent@example.com.au"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.border = '2px solid #000'; e.target.style.padding = '9px 11px'; }}
            onBlur={(e) => { e.target.style.border = '1px solid #000'; e.target.style.padding = '10px 12px'; }}
          />
        </div>
      </div>

      {/* ── Upload ── */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#000', marginBottom: '8px' }}>
          Upload photos
        </h2>
        <p style={{ fontSize: '13px', color: '#737373', marginBottom: '20px' }}>
          JPEG · PNG · HEIC · WebP — max 50 MB per file
        </p>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          style={{
            border: isDragOver ? '1px solid #000' : '1px dashed #000',
            borderRadius: 0,
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragOver ? '#F5F5F5' : '#fff',
            transition: 'background 0.1s',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>↑</div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#000', marginBottom: '4px' }}>
            Drop files here, or click to browse
          </p>
          <p style={{ fontSize: '11px', color: '#737373', letterSpacing: '0.1em' }}>JPEG · PNG · HEIC · WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/heic,image/webp"
            onChange={onFileChange}
            disabled={busy}
            style={{ display: 'none' }}
          />
        </div>

        {uploading.map((u, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', color: '#404040' }}>{u.filename}</span>
              <span style={{ fontSize: '12px', color: '#737373' }}>{u.progress}%</span>
            </div>
            <ProgressBar progress={u.progress} />
          </div>
        ))}
      </div>

      {/* ── Per-photo tagging ── */}
      {photos.length > 0 && (
        <div style={{ ...card, marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#000', marginBottom: '6px' }}>
            Tag photos
            <span style={{ fontSize: '11px', fontWeight: 400, color: '#737373', marginLeft: '8px', letterSpacing: '0.06em' }}>
              {photos.length} uploaded
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: '#737373', marginBottom: '18px' }}>
            Select services for each photo. Style only shows when Virtual staging is chosen.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {photos.map((p, i) => (
              <PhotoRow
                key={p.blobUrl}
                photo={p}
                index={i}
                stylePresets={stylePresets}
                onToggleService={toggleService}
                onStyleChange={setStyle}
                onRemove={removePhoto}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Continue ── */}
      <div>
        {!canContinue && photos.length > 0 && photosWithService.length === 0 && (
          <p style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '10px' }}>
            Select at least one service on at least one photo to continue.
          </p>
        )}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          style={{ ...primaryBtn, ...(!canContinue ? disabledBtn : {}) }}
        >
          {busy ? 'Saving…' : 'Continue to review →'}
        </button>
      </div>
    </div>
  );
}

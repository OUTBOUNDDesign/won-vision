'use client';

import { useState, useRef, useCallback } from 'react';
import { upload } from '@vercel/blob/client';
import { createDraft } from '@/lib/intake/actions';
import type { StylePreset } from './types';
import type { IntakeState, ServiceId, UploadedPhoto } from './Intake';

/* ─────────────────── shared styles ─────────────────── */
const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  color: '#111',
  background: '#fff',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '6px',
};

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#002FA7',
  color: '#fff',
  padding: '11px 26px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.02em',
};

const disabledBtn: React.CSSProperties = { opacity: 0.4, cursor: 'not-allowed' };

const SERVICES: { id: ServiceId; label: string }[] = [
  { id: 'declutter', label: 'Declutter' },
  { id: 'stage', label: 'Virtual staging' },
  { id: 'dusk', label: 'Day-to-dusk' },
];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─────────────────── sub-components ─────────────────── */
function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '12px 16px', background: '#fef2f2',
      border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '20px',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠</span>
      <p style={{ fontSize: '13px', color: '#b91c1c', lineHeight: 1.5, margin: 0 }}>{message}</p>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ width: '100%', height: '4px', background: '#e5e5e5', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
      <div style={{ width: `${progress}%`, height: '100%', background: '#002FA7', borderRadius: '2px', transition: 'width 0.2s ease' }} />
    </div>
  );
}

function ServiceChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: '99px',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        border: active ? 'none' : '1.5px solid #d0d0d0',
        background: active ? '#002FA7' : '#fff',
        color: active ? '#fff' : '#666',
        letterSpacing: '0.02em',
        transition: 'all 0.12s',
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
      background: '#fafafa',
      border: '1px solid #ebebeb',
      borderRadius: '8px',
    }}>
      {/* Thumbnail */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '4px',
        overflow: 'hidden', background: '#e5e5e5', flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.previewUrl ?? photo.blobUrl}
          alt={photo.filename}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div>
        {/* Filename + remove */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
            {photo.filename}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', color: '#aaa' }}>{formatBytes(photo.size)}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}
              aria-label="Remove photo"
            >×</button>
          </div>
        </div>

        {/* Service chips */}
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

        {/* Style select — only when staging is selected */}
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

/* ─────────────────── IntakeForm ─────────────────── */
export function IntakeForm({
  stylePresets,
  initial,
  onContinue,
}: {
  stylePresets: readonly StylePreset[];
  initial?: IntakeState;
  onContinue: (state: IntakeState) => void;
}) {
  const [address, setAddress] = useState(initial?.address ?? '');
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '');
  const [propertyId, setPropertyId] = useState<string | null>(initial?.propertyId ?? null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState<{ filename: string; size: number; progress: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation
  const addressOk = address.trim().length >= 5;
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

    // Need a propertyId before uploading
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
        // Clear style if staging removed
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

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    padding: '28px',
    maxWidth: '700px',
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      {error && <ErrorAlert message={error} />}

      {/* ── Property details ── */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#000', marginBottom: '20px' }}>Property details</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="address">Address</label>
          <input
            id="address"
            required
            placeholder="123 Collins St, Melbourne VIC 3000"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#002FA7'; e.target.style.boxShadow = '0 0 0 3px rgba(0,47,167,0.08)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
          />
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
            onFocus={(e) => { e.target.style.borderColor = '#002FA7'; e.target.style.boxShadow = '0 0 0 3px rgba(0,47,167,0.08)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* ── Upload ── */}
      <div style={{ ...card, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Upload photos</h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
          JPEG · PNG · HEIC · WebP — max 50 MB per file
        </p>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${isDragOver ? '#002FA7' : '#d0d0d0'}`,
            borderRadius: '8px',
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragOver ? 'rgba(0,47,167,0.03)' : '#fafafa',
            transition: 'all 0.15s',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⬆</div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: isDragOver ? '#002FA7' : '#333', marginBottom: '4px' }}>
            Drop files here, or click to browse
          </p>
          <p style={{ fontSize: '12px', color: '#aaa' }}>JPEG · PNG · HEIC · WebP</p>
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

        {/* Upload progress */}
        {uploading.map((u, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', color: '#555' }}>{u.filename}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>{u.progress}%</span>
            </div>
            <ProgressBar progress={u.progress} />
          </div>
        ))}
      </div>

      {/* ── Per-photo tagging (appears as photos upload) ── */}
      {photos.length > 0 && (
        <div style={{ ...card, marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#000', marginBottom: '6px' }}>
            Tag photos
            <span style={{ fontSize: '12px', fontWeight: 400, color: '#aaa', marginLeft: '8px' }}>
              {photos.length} uploaded
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '18px' }}>
            Select services for each photo. Leave all unselected to skip a photo. Style only shows when Virtual staging is chosen.
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

      {/* ── Continue button ── */}
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

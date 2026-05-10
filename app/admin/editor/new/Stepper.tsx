'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { createDraft, attachPhoto, submitProperty } from '@/lib/intake/actions';
import type { StylePresetId } from '@/lib/styles';

type Tier = 'small' | 'standard' | 'large';
type Service = 'declutter' | 'stage' | 'dusk' | 'declutter-stage';
type StylePreset = { id: string; label: string; blurb: string };

type UploadedPhoto = {
  blobUrl: string;
  filename: string;
  size: number;
  service: Service;
  style?: StylePresetId;
  previewUrl?: string;
};

type UploadingPhoto = {
  filename: string;
  size: number;
  progress: number;
};

const SERVICES: { id: Service; label: string }[] = [
  { id: 'declutter', label: 'Declutter' },
  { id: 'stage', label: 'Virtual stage' },
  { id: 'dusk', label: 'Day → dusk' },
  { id: 'declutter-stage', label: 'Declutter + stage' },
];

const STEPS = ['Details', 'Upload', 'Tag', 'Review'] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Shared input style ── */
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

const fieldStyle: React.CSSProperties = { marginBottom: '20px' };

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#002FA7',
  color: '#fff',
  padding: '10px 22px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.02em',
};

const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#fff',
  color: '#002FA7',
  padding: '10px 22px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
  border: '1.5px solid #002FA7',
  cursor: 'pointer',
  fontFamily: 'inherit',
  letterSpacing: '0.02em',
};

const disabledBtn: React.CSSProperties = {
  opacity: 0.45,
  cursor: 'not-allowed',
};

/* ── Step indicator ── */
function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '36px',
    }}>
      {STEPS.map((label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone = step > num;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                background: isDone ? '#002FA7' : isActive ? '#002FA7' : '#f0f0f0',
                color: isDone || isActive ? '#fff' : '#aaa',
                border: 'none',
                transition: 'all 0.2s',
              }}>
                {isDone ? '✓' : num}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#002FA7' : isDone ? '#555' : '#bbb',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: '60px',
                height: '2px',
                background: isDone ? '#002FA7' : '#e5e5e5',
                margin: '0 8px',
                marginBottom: '18px',
                transition: 'background 0.2s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Error alert ── */
function ErrorAlert({ message }: { message: string }) {
  return (
    <div role="alert" style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 16px',
      background: '#fef2f2',
      border: '1px solid #fca5a5',
      borderRadius: '8px',
      marginBottom: '20px',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠</span>
      <p style={{ fontSize: '13px', color: '#b91c1c', lineHeight: 1.5, margin: 0 }}>{message}</p>
    </div>
  );
}

/* ── File chip ── */
function FileChip({ filename, size, onRemove }: { filename: string; size: number; onRemove?: () => void }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: '#f0f4ff',
      border: '1px solid #c7d5f5',
      borderRadius: '6px',
      padding: '5px 10px',
      fontSize: '12px',
      color: '#002FA7',
      maxWidth: '100%',
    }}>
      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{filename}</span>
      <span style={{ color: '#7ba0e0', flexShrink: 0 }}>{formatBytes(size)}</span>
      {onRemove && (
        <button onClick={onRemove} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#7ba0e0',
          padding: '0 2px',
          fontSize: '14px',
          lineHeight: 1,
          flexShrink: 0,
        }}>×</button>
      )}
    </div>
  );
}

/* ── Upload progress bar ── */
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{
      width: '100%',
      height: '4px',
      background: '#e5e5e5',
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: '4px',
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        background: '#002FA7',
        borderRadius: '2px',
        transition: 'width 0.2s ease',
      }} />
    </div>
  );
}

/* ── Main Stepper component ── */
export function Stepper({ stylePresets }: { stylePresets: readonly StylePreset[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [tier, setTier] = useState<Tier>('standard');
  const [photoCount, setPhotoCount] = useState(10);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState<UploadingPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await createDraft({ address, contactEmail, tier, photoCount });
      setPropertyId(r.propertyId);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!propertyId || files.length === 0) return;
    setBusy(true); setError(null);

    // Initialise progress trackers
    const trackers: UploadingPhoto[] = files.map((f) => ({
      filename: f.name, size: f.size, progress: 0,
    }));
    setUploading(trackers);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);

        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: `/api/admin/blob-token?propertyId=${propertyId}`,
          onUploadProgress: ({ percentage }) => {
            setUploading((prev) =>
              prev.map((t, idx) => idx === i ? { ...t, progress: percentage } : t)
            );
          },
        });

        setPhotos((prev) => [...prev, {
          blobUrl: blob.url,
          filename: file.name,
          size: file.size,
          service: 'stage',
          previewUrl,
        }]);

        // Remove from uploading list once done
        setUploading((prev) => prev.filter((_, idx) => idx !== i));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setUploading([]);
    }
  }, [propertyId]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ['image/jpeg', 'image/png', 'image/heic', 'image/webp'].includes(f.type)
    );
    uploadFiles(files);
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  function updatePhoto(idx: number, patch: Partial<UploadedPhoto>) {
    setPhotos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  async function onSubmit() {
    if (!propertyId) return;
    setBusy(true); setError(null);
    try {
      for (const p of photos) {
        await attachPhoto({
          propertyId,
          blobUrl: p.blobUrl,
          filename: p.filename,
          service: p.service,
          style: p.style,
        });
      }
      await submitProperty(propertyId);
      router.push(`/admin/editor/${propertyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '10px',
    padding: '28px',
    maxWidth: '640px',
  };

  return (
    <div>
      <StepIndicator step={step} />

      {error && <div style={{ maxWidth: '640px' }}><ErrorAlert message={error} /></div>}

      {/* ── Step 1: Details ── */}
      {step === 1 && (
        <div style={card}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '24px' }}>Property details</h2>
          <form onSubmit={onCreateDraft}>
            <div style={fieldStyle}>
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

            <div style={fieldStyle}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle} htmlFor="tier">Tier</label>
                <select
                  id="tier"
                  value={tier}
                  onChange={(e) => setTier(e.target.value as Tier)}
                  style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px' }}
                >
                  <option value="small">Small (≤10)</option>
                  <option value="standard">Standard (≤25)</option>
                  <option value="large">Large (≤50)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle} htmlFor="photoCount">Photo count</label>
                <input
                  id="photoCount"
                  type="number"
                  min={1}
                  max={200}
                  value={photoCount}
                  onChange={(e) => setPhotoCount(Number(e.target.value))}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#002FA7'; e.target.style.boxShadow = '0 0 0 3px rgba(0,47,167,0.08)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button
              disabled={busy}
              type="submit"
              style={{ ...primaryBtn, ...(busy ? disabledBtn : {}) }}
            >
              {busy ? 'Creating…' : 'Create draft & continue →'}
            </button>
          </form>
        </div>
      )}

      {/* ── Step 2: Upload ── */}
      {step === 2 && (
        <div style={card}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Upload photos</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            JPEG, PNG, HEIC or WebP · max 50 MB per file · uploads go directly to secure blob storage.
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
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragOver ? 'rgba(0,47,167,0.03)' : '#fafafa',
              transition: 'all 0.15s',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⬆</div>
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

          {/* Uploading in-progress */}
          {uploading.map((u, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', color: '#555' }}>{u.filename}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{u.progress}%</span>
              </div>
              <ProgressBar progress={u.progress} />
            </div>
          ))}

          {/* Uploaded chips */}
          {photos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {photos.map((p, i) => (
                <FileChip
                  key={i}
                  filename={p.filename}
                  size={p.size}
                  onRemove={() => removePhoto(i)}
                />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(1)} style={secondaryBtn}>← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={busy || photos.length === 0}
              style={{ ...primaryBtn, ...(busy || photos.length === 0 ? disabledBtn : {}) }}
            >
              Next: tag photos →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Tag ── */}
      {step === 3 && (
        <div style={{ ...card, maxWidth: '900px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>Tag photos</h2>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            Choose a service for each photo. Style is only required for staging services.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {photos.map((p, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr 180px 180px',
                gap: '12px',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#fafafa',
                border: '1px solid #ebebeb',
                borderRadius: '8px',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#e5e5e5',
                  flexShrink: 0,
                }}>
                  {p.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.previewUrl} alt={p.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.blobUrl} alt={p.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Filename */}
                <span style={{ fontSize: '13px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.filename}
                </span>

                {/* Service */}
                <select
                  value={p.service}
                  onChange={(e) => updatePhoto(i, { service: e.target.value as Service })}
                  style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }}
                >
                  {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                {/* Style */}
                <select
                  value={p.style ?? ''}
                  onChange={(e) => updatePhoto(i, { style: (e.target.value || undefined) as StylePresetId | undefined })}
                  style={{ ...inputStyle, fontSize: '13px', padding: '8px 10px' }}
                  disabled={!['stage', 'declutter-stage'].includes(p.service)}
                >
                  <option value="">— No style —</option>
                  {stylePresets.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(2)} style={secondaryBtn}>← Back</button>
            <button onClick={() => setStep(4)} style={primaryBtn}>Next: review →</button>
          </div>
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === 4 && (
        <div style={card}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#000', marginBottom: '24px' }}>Review & submit</h2>

          {/* Summary */}
          <div style={{
            padding: '16px',
            background: '#fafafa',
            border: '1px solid #ebebeb',
            borderRadius: '8px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Address', value: address },
                { label: 'Contact', value: contactEmail },
                { label: 'Tier', value: tier.charAt(0).toUpperCase() + tier.slice(1) },
                { label: 'Photos', value: `${photos.length} uploaded` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#bbb', marginBottom: '2px' }}>{label}</p>
                  <p style={{ fontSize: '14px', color: '#222' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo summary list */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#bbb', marginBottom: '10px' }}>
              Photos ({photos.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {photos.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f9f9f9',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}>
                  <span style={{ color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{p.filename}</span>
                  <span style={{ color: '#888', flexShrink: 0 }}>
                    {SERVICES.find((s) => s.id === p.service)?.label}
                    {p.style ? ` · ${p.style}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(3)} style={secondaryBtn} disabled={busy}>← Back</button>
            <button
              onClick={onSubmit}
              disabled={busy}
              style={{ ...primaryBtn, ...(busy ? disabledBtn : {}) }}
            >
              {busy ? 'Submitting…' : 'Submit & queue →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

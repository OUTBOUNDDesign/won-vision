'use client';

import { useState } from 'react';
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
  service: Service;
  style?: StylePresetId;
};

const SERVICES: { id: Service; label: string }[] = [
  { id: 'declutter', label: 'Declutter' },
  { id: 'stage', label: 'Virtual stage' },
  { id: 'dusk', label: 'Day → dusk' },
  { id: 'declutter-stage', label: 'Declutter + stage' },
];

export function Stepper({ stylePresets }: { stylePresets: readonly StylePreset[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [tier, setTier] = useState<Tier>('standard');
  const [photoCount, setPhotoCount] = useState(10);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function onUpload(files: FileList | null) {
    if (!files || !propertyId) return;
    setBusy(true); setError(null);
    try {
      for (const file of Array.from(files)) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: `/api/admin/blob-token?propertyId=${propertyId}`,
        });
        setPhotos((prev) => [...prev, {
          blobUrl: blob.url,
          filename: file.name,
          service: 'stage',
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
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

  return (
    <div>
      <ol style={{ display: 'flex', gap: '1rem', listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
        {['Details', 'Upload', 'Tag', 'Review'].map((label, i) => (
          <li key={label} style={{ fontWeight: step === i + 1 ? 700 : 400 }}>{i + 1}. {label}</li>
        ))}
      </ol>

      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}

      {step === 1 && (
        <form onSubmit={onCreateDraft}>
          <label>Address<input required value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <label>Contact email<input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></label>
          <label>Tier
            <select value={tier} onChange={(e) => setTier(e.target.value as Tier)}>
              <option value="small">Small (≤10)</option>
              <option value="standard">Standard (≤25)</option>
              <option value="large">Large (≤50)</option>
            </select>
          </label>
          <label>Photo count<input type="number" min={1} max={200} value={photoCount} onChange={(e) => setPhotoCount(Number(e.target.value))} /></label>
          <button disabled={busy} type="submit">{busy ? '…' : 'Create draft & continue'}</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <p>Drag in originals. Each upload goes straight to Vercel Blob.</p>
          <input type="file" multiple accept="image/jpeg,image/png,image/heic,image/webp" onChange={(e) => onUpload(e.target.files)} disabled={busy} />
          <ul>
            {photos.map((p, i) => <li key={i}>{p.filename}</li>)}
          </ul>
          <button onClick={() => setStep(3)} disabled={busy || photos.length === 0}>Next: tag photos</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Pick a service for each photo. Style only matters for staging services.</p>
          <table>
            <thead><tr><th>File</th><th>Service</th><th>Style</th></tr></thead>
            <tbody>
              {photos.map((p, i) => (
                <tr key={i}>
                  <td>{p.filename}</td>
                  <td>
                    <select value={p.service} onChange={(e) => updatePhoto(i, { service: e.target.value as Service })}>
                      {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={p.style ?? ''} onChange={(e) => updatePhoto(i, { style: (e.target.value || undefined) as StylePresetId | undefined })}>
                      <option value="">—</option>
                      {stylePresets.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setStep(4)}>Next: review</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Review</h2>
          <p><strong>{address}</strong> — {contactEmail} — {tier} — {photos.length} photos</p>
          <button onClick={onSubmit} disabled={busy}>{busy ? 'Submitting…' : 'Submit & queue'}</button>
        </div>
      )}
    </div>
  );
}

// lib/styles.ts
export const STYLE_PRESETS = [
  { id: 'modern',       label: 'Modern',       blurb: 'Clean lines, neutral palette, minimal clutter.' },
  { id: 'scandinavian', label: 'Scandinavian', blurb: 'Warm woods, soft whites, cozy textures.' },
  { id: 'coastal',      label: 'Coastal',      blurb: 'Light blues, sandy tones, breezy linens.' },
  { id: 'mid-century',  label: 'Mid-Century',  blurb: 'Walnut + tan leather, geometric accents.' },
] as const;

export type StylePresetId = (typeof STYLE_PRESETS)[number]['id'];

export function isStylePreset(value: string): value is StylePresetId {
  return STYLE_PRESETS.some((p) => p.id === value);
}

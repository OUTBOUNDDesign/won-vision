// lib/editor/staging-styles.ts
export type StagingStyleId = 'modern' | 'scandinavian' | 'coastal' | 'mid-century' | 'industrial-loft' | 'japandi';

export const STAGING_STYLES: { id: StagingStyleId; label: string; blurb: string }[] = [
  { id: 'modern',          label: 'Modern',          blurb: 'Greige textiles, oak, brushed black accents.' },
  { id: 'scandinavian',    label: 'Scandinavian',    blurb: 'Soft whites, pale ash, hygge texture.' },
  { id: 'coastal',         label: 'Coastal',         blurb: 'Whitewashed timber, linen, weathered driftwood.' },
  { id: 'mid-century',     label: 'Mid-Century',     blurb: 'Walnut + tan leather, brass + mustard accents.' },
  { id: 'industrial-loft', label: 'Industrial Loft', blurb: 'Black metal, exposed brick, Edison bulbs, leather.' },
  { id: 'japandi',         label: 'Japandi',         blurb: 'Japanese-Scandi minimalism, low-profile, sage + ivory.' },
];

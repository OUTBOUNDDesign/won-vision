import { describe, it, expect } from 'vitest';
import { STYLE_PRESETS, isStylePreset } from '@/lib/styles';

describe('STYLE_PRESETS', () => {
  it('lists exactly the 4 launch presets', () => {
    expect(STYLE_PRESETS.map((p) => p.id)).toEqual([
      'modern',
      'scandinavian',
      'coastal',
      'mid-century',
    ]);
  });

  it('isStylePreset accepts known ids and rejects others', () => {
    expect(isStylePreset('modern')).toBe(true);
    expect(isStylePreset('art-deco')).toBe(false);
  });
});

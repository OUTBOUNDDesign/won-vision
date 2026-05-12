// tests/editor-presets.test.ts
import { describe, it, expect } from 'vitest';
import { HDR_PRESETS, getPreset } from '@/lib/editor/presets';

describe('HDR_PRESETS', () => {
  it('contains exactly 6 named presets', () => {
    expect(HDR_PRESETS.map(p => p.id)).toEqual([
      'standard', 'natural', 'warm', 'cool', 'bright-airy', 'moody',
    ]);
  });

  it('getPreset returns the matching preset', () => {
    expect(getPreset('warm')?.label).toBe('Warm');
    expect(getPreset('nope' as any)).toBeUndefined();
  });

  it('every preset has all 12 adjustment keys', () => {
    for (const p of HDR_PRESETS) {
      const keys = Object.keys(p.adjustments).sort();
      expect(keys).toEqual([
        'blacks', 'clarity', 'contrast', 'dehaze', 'exposure', 'highlights',
        'saturation', 'shadows', 'sharpening', 'temperature', 'tint', 'whites',
      ]);
    }
  });
});

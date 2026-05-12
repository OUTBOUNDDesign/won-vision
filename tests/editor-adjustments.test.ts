// tests/editor-adjustments.test.ts
import { describe, it, expect } from 'vitest';
import { adjustmentsSchema, DEFAULT_ADJUSTMENTS, type Adjustments } from '@/lib/editor/adjustments';

describe('adjustments', () => {
  it('DEFAULT_ADJUSTMENTS has every required slider at neutral', () => {
    expect(DEFAULT_ADJUSTMENTS).toEqual({
      exposure: 0, contrast: 0, temperature: 0, tint: 0,
      saturation: 0, highlights: 0, shadows: 0, whites: 0,
      blacks: 0, sharpening: 0, clarity: 0, dehaze: 0,
    });
  });

  it('schema accepts default values', () => {
    expect(() => adjustmentsSchema.parse(DEFAULT_ADJUSTMENTS)).not.toThrow();
  });

  it('schema rejects values outside the ±100 range', () => {
    expect(() => adjustmentsSchema.parse({ ...DEFAULT_ADJUSTMENTS, exposure: 200 })).toThrow();
    expect(() => adjustmentsSchema.parse({ ...DEFAULT_ADJUSTMENTS, exposure: -200 })).toThrow();
  });

  it('schema accepts partial inputs and fills defaults via parse', () => {
    const out = adjustmentsSchema.parse({ exposure: 25 });
    expect(out.exposure).toBe(25);
    expect(out.contrast).toBe(0);
  });
});

// tests/editor-variations.test.ts
import { describe, it, expect } from 'vitest';
import { DUSK_VARIATIONS, buildDuskPrompt } from '@/lib/editor/dusk-variations';
import { SKY_VARIATIONS, buildSkyPrompt } from '@/lib/editor/sky-variations';
import { STAGING_STYLES } from '@/lib/editor/staging-styles';

describe('DUSK_VARIATIONS', () => {
  it('has exactly 3 variations', () => {
    expect(DUSK_VARIATIONS.map(v => v.id)).toEqual(['golden-hour', 'blue-hour', 'late-twilight']);
  });
  it('buildDuskPrompt embeds the variation description', () => {
    expect(buildDuskPrompt('golden-hour')).toMatch(/warm orange/i);
    expect(buildDuskPrompt('blue-hour')).toMatch(/cobalt|deep blue/i);
    expect(buildDuskPrompt('late-twilight')).toMatch(/indigo|near-dark/i);
  });
});

describe('SKY_VARIATIONS', () => {
  it('has exactly 4 variations', () => {
    expect(SKY_VARIATIONS.map(v => v.id)).toEqual(['clear-blue', 'soft-cloudy', 'dramatic', 'sunset']);
  });
  it('buildSkyPrompt embeds variation copy', () => {
    expect(buildSkyPrompt('clear-blue')).toMatch(/cloudless/i);
    expect(buildSkyPrompt('dramatic')).toMatch(/cumulus|dramatic/i);
  });
});

describe('STAGING_STYLES', () => {
  it('has exactly 6 styles', () => {
    expect(STAGING_STYLES.map(s => s.id)).toEqual([
      'modern', 'scandinavian', 'coastal', 'mid-century', 'industrial-loft', 'japandi',
    ]);
  });
});

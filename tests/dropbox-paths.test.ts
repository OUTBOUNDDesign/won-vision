// tests/dropbox-paths.test.ts
import { describe, it, expect } from 'vitest';
import { slugifyAddress, buildIntakePath, buildProcessingPath, buildReviewPath } from '@/lib/dropbox/paths';

describe('dropbox paths', () => {
  it('slugifies AU addresses into folder-safe names', () => {
    expect(slugifyAddress('4/12 Smith St, Brunswick VIC 3056')).toBe('4-12-smith-st-brunswick-vic-3056');
    expect(slugifyAddress('Unit 3, 88 King Rd')).toBe('unit-3-88-king-rd');
  });

  it('builds intake/processing/review paths', () => {
    const addr = '12 Smith St';
    expect(buildIntakePath(addr)).toBe('/Virtual Editing/00 INTAKE/12-smith-st');
    expect(buildProcessingPath(addr)).toBe('/Virtual Editing/01 AI PROCESSING/12-smith-st');
    expect(buildReviewPath(addr)).toBe('/Virtual Editing/02 EDITOR REVIEW/12-smith-st');
  });
});

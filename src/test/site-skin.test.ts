import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_SKIN, parseSiteSkin } from '@/lib/site-skin';

describe('parseSiteSkin', () => {
  it('accepts the saved YouTube-inspired skin', () => {
    expect(parseSiteSkin({ skin: 'youtube' })).toBe('youtube');
  });

  it('accepts the saved Joulecorp skin', () => {
    expect(parseSiteSkin({ skin: 'joulecorp' })).toBe('joulecorp');
  });

  it('falls back to the Joulecorp skin for missing or unsupported values', () => {
    expect(parseSiteSkin(null)).toBe(DEFAULT_SITE_SKIN);
    expect(parseSiteSkin({ skin: 'unknown' })).toBe(DEFAULT_SITE_SKIN);
  });
});
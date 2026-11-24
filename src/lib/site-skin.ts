export type SiteSkin = 'joulecorp' | 'youtube';

export const DEFAULT_SITE_SKIN: SiteSkin = 'joulecorp';

export function parseSiteSkin(value: unknown): SiteSkin {
  if (typeof value !== 'object' || value === null || !('skin' in value)) {
    return DEFAULT_SITE_SKIN;
  }

  const skin = (value as { skin?: unknown }).skin;
  return skin === 'youtube' || skin === 'joulecorp' ? skin : DEFAULT_SITE_SKIN;
}
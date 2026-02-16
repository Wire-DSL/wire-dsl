export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const DEFAULT_LEVEL: HeadingLevel = 'h2';

const LEVEL_SCALE: Record<HeadingLevel, number> = {
  h1: 1.4,
  h2: 1,
  h3: 0.85,
  h4: 0.75,
  h5: 0.65,
  h6: 0.55,
};

const LEVEL_WEIGHT: Record<HeadingLevel, number> = {
  h1: 700,
  h2: 650,
  h3: 620,
  h4: 600,
  h5: 600,
  h6: 600,
};

export interface HeadingTypography {
  level: HeadingLevel;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

export function normalizeHeadingLevel(level: unknown, fallback: HeadingLevel = DEFAULT_LEVEL): HeadingLevel {
  if (typeof level !== 'string') return fallback;
  const normalized = level.trim().toLowerCase();
  if (normalized === 'h1') return 'h1';
  if (normalized === 'h2') return 'h2';
  if (normalized === 'h3') return 'h3';
  if (normalized === 'h4') return 'h4';
  if (normalized === 'h5') return 'h5';
  if (normalized === 'h6') return 'h6';
  return fallback;
}

export function resolveHeadingTypography(
  baseFontSize: number,
  baseFontWeight: number,
  level: unknown
): HeadingTypography {
  const normalizedLevel = normalizeHeadingLevel(level);
  const scale = LEVEL_SCALE[normalizedLevel];
  const weight = LEVEL_WEIGHT[normalizedLevel];

  return {
    level: normalizedLevel,
    fontSize: Math.max(10, Math.round(baseFontSize * scale)),
    fontWeight: Math.max(baseFontWeight, weight),
    lineHeight: 1.25,
  };
}

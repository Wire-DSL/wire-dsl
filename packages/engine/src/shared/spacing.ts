export const SPACING_VALUES: Record<string, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export type DensityLevel = 'compact' | 'normal' | 'comfortable';

const DENSITY_FACTORS: Record<DensityLevel, number> = {
  compact: 0.8,
  normal: 1,
  comfortable: 1.25,
};

export function resolveSpacingToken(
  spacing?: string,
  fallback: string = 'md',
  density: DensityLevel = 'normal',
  densityAware: boolean = false
): number {
  if (!spacing) {
    const base = SPACING_VALUES[fallback] ?? SPACING_VALUES.md;
    return densityAware ? Math.round(base * DENSITY_FACTORS[density]) : base;
  }
  const value = SPACING_VALUES[spacing];
  const base = value !== undefined ? value : (SPACING_VALUES[fallback] ?? SPACING_VALUES.md);
  return densityAware ? Math.round(base * DENSITY_FACTORS[density]) : base;
}

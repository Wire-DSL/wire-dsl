import type { DensityLevel } from './spacing';

const ICON_SIZES_BY_DENSITY: Record<DensityLevel, Record<string, number>> = {
  compact: { xs: 10, sm: 12, md: 16, lg: 20, xl: 28 },
  normal: { xs: 12, sm: 14, md: 18, lg: 24, xl: 32 },
  comfortable: { xs: 14, sm: 16, md: 20, lg: 28, xl: 36 },
};

const ICON_BUTTON_SIZES_BY_DENSITY: Record<DensityLevel, Record<string, number>> = {
  compact: { sm: 24, md: 28, lg: 32 },
  normal: { sm: 28, md: 32, lg: 40 },
  comfortable: { sm: 32, md: 40, lg: 48 },
};

export function resolveIconSize(size?: string, density: DensityLevel = 'normal'): number {
  const map = ICON_SIZES_BY_DENSITY[density] || ICON_SIZES_BY_DENSITY.normal;
  return map[size || 'md'] || map.md;
}

export function resolveIconButtonSize(size?: string, density: DensityLevel = 'normal'): number {
  const map = ICON_BUTTON_SIZES_BY_DENSITY[density] || ICON_BUTTON_SIZES_BY_DENSITY.normal;
  return map[size || 'md'] || map.md;
}

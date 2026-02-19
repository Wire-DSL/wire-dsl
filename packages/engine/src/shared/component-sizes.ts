import type { DensityLevel } from './spacing';

const ICON_SIZES_BY_DENSITY: Record<DensityLevel, Record<string, number>> = {
  compact: { xs: 10, sm: 12, md: 16, lg: 20, xl: 28 },
  normal: { xs: 12, sm: 14, md: 18, lg: 24, xl: 32 },
  comfortable: { xs: 14, sm: 16, md: 20, lg: 28, xl: 36 },
};

const ICON_BUTTON_SIZES_BY_DENSITY: Record<DensityLevel, Record<string, number>> = {
  compact: { sm: 28, md: 32, lg: 36 },
  normal: { sm: 36, md: 40, lg: 48 },
  comfortable: { sm: 40, md: 48, lg: 56 },
};

const CONTROL_HEIGHTS_BY_DENSITY: Record<DensityLevel, Record<string, number>> = {
  compact: { sm: 28, md: 32, lg: 36 },
  normal: { sm: 36, md: 40, lg: 48 },
  comfortable: { sm: 40, md: 48, lg: 56 },
};

const CONTROL_PADDING_BY_DENSITY: Record<DensityLevel, Record<string, number>> = {
  compact: { none: 0, xs: 4, sm: 8, md: 10, lg: 14, xl: 18 },
  normal: { none: 0, xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
  comfortable: { none: 0, xs: 8, sm: 12, md: 16, lg: 22, xl: 28 },
};

export function resolveIconSize(size?: string, density: DensityLevel = 'normal'): number {
  const map = ICON_SIZES_BY_DENSITY[density] || ICON_SIZES_BY_DENSITY.normal;
  return map[size || 'md'] || map.md;
}

export function resolveIconButtonSize(size?: string, density: DensityLevel = 'normal'): number {
  const map = ICON_BUTTON_SIZES_BY_DENSITY[density] || ICON_BUTTON_SIZES_BY_DENSITY.normal;
  return map[size || 'md'] || map.md;
}

export function resolveControlHeight(size?: string, density: DensityLevel = 'normal'): number {
  const map = CONTROL_HEIGHTS_BY_DENSITY[density] || CONTROL_HEIGHTS_BY_DENSITY.normal;
  return map[size || 'md'] || map.md;
}

export function resolveControlHorizontalPadding(
  padding?: string,
  density: DensityLevel = 'normal'
): number {
  const map = CONTROL_PADDING_BY_DENSITY[density] || CONTROL_PADDING_BY_DENSITY.normal;
  return map[padding || 'md'] ?? map.md;
}

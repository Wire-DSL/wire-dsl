import { SPACING_VALUES, resolveSpacingToken, type DensityLevel } from './spacing';

/**
 * Resolves optional Heading vertical spacing.
 *
 * Returns `null` when the property is not provided so callers can keep
 * legacy/default behavior unchanged.
 */
export function resolveHeadingVerticalPadding(
  spacing: unknown,
  density: DensityLevel
): number | null {
  if (spacing === undefined || spacing === null || spacing === '') {
    return null;
  }

  if (typeof spacing === 'number' && Number.isFinite(spacing)) {
    return Math.max(0, spacing);
  }

  if (typeof spacing !== 'string') {
    return null;
  }

  const normalized = spacing.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const asNumber = Number(normalized);
  if (!Number.isNaN(asNumber) && Number.isFinite(asNumber)) {
    return Math.max(0, asNumber);
  }

  if (!(normalized in SPACING_VALUES)) {
    return null;
  }

  return resolveSpacingToken(normalized, 'sm', density, true);
}

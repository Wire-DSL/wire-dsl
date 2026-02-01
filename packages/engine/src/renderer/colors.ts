/**
 * Color Resolver
 *
 * Resolves color references from project colors, named colors, or hex values
 */

export class ColorResolver {
  private customColors: Record<string, string> = {};

  // Named colors palette
  private namedColors: Record<string, string> = {
    // Grayscale
    white: '#FFFFFF',
    black: '#000000',
    gray: '#6B7280',
    slate: '#64748B',
    zinc: '#71717A',

    // Colors
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#EAB308',
    lime: '#84CC16',
    green: '#22C55E',
    emerald: '#10B981',
    teal: '#14B8A6',
    cyan: '#06B6D4',
    blue: '#3B82F6',
    indigo: '#6366F1',
    violet: '#8B5CF6',
    purple: '#A855F7',
    fuchsia: '#D946EF',
    pink: '#EC4899',
    rose: '#F43F5E',

    // Light variants
    'red-light': '#FEE2E2',
    'blue-light': '#DBEAFE',
    'green-light': '#DCFCE7',
  };

  /**
   * Set custom colors from project definition
   */
  setCustomColors(colors: Record<string, string>): void {
    this.customColors = colors || {};
  }

  /**
   * Resolve a color reference to a hex value
   * Priority: custom colors > named colors > hex validation > default
   */
  resolveColor(colorRef: string, defaultColor: string = '#000000'): string {
    if (!colorRef) return defaultColor;

    // Check custom colors first
    if (this.customColors[colorRef]) {
      return this.validateHex(this.customColors[colorRef]) || defaultColor;
    }

    // Check named colors
    if (this.namedColors[colorRef]) {
      return this.namedColors[colorRef];
    }

    // Check if it's a valid hex color
    if (this.isValidHex(colorRef)) {
      return colorRef;
    }

    // Return default if nothing matches
    return defaultColor;
  }

  /**
   * Validate hex color (6-character hex code)
   */
  private isValidHex(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  /**
   * Validate and return hex, or undefined if invalid
   */
  private validateHex(color: string): string | undefined {
    return this.isValidHex(color) ? color : undefined;
  }
}

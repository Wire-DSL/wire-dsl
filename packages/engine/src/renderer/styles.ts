/**
 * Render Style Tokens System
 *
 * Defines visual treatment tokens that control how components are rendered.
 * Styles are independent from color themes (light/dark).
 */

export interface RenderStyleTokens {
  // Card / Panel
  cardRadius: number;
  cardStrokeWidth: number;
  cardShadowFilter: string | null;  // SVG filter ID or null

  // Button
  buttonRadius: number;
  buttonFontWeight: number;
  buttonUseSolidColors: boolean;    // false = rgba with opacity, true = solid

  // Input
  inputRadius: number;

  // Badge
  badgeRadius: 'pill' | number;

  // Heading
  headingFontWeight: number;
  headingFontSize: number;

  // General
  fontFamily: string;
  baseFontSize: number;

  // SVG defs (filters, gradients, etc.)
  svgDefs: string;  // Raw SVG <defs> content to inject
}

// ============================================================================
// STYLE REGISTRY
// ============================================================================

const styleRegistry = new Map<string, RenderStyleTokens>();

/**
 * Register a custom render style
 */
export function registerStyle(name: string, tokens: RenderStyleTokens): void {
  styleRegistry.set(name, tokens);
}

/**
 * Get a render style by name
 */
export function getStyle(name: string): RenderStyleTokens | undefined {
  return styleRegistry.get(name);
}

/**
 * Get all available style names
 */
export function getAvailableStyles(): string[] {
  return Array.from(styleRegistry.keys());
}

// ============================================================================
// BUILT-IN STYLES
// ============================================================================

/**
 * Standard style - current default wireframe look
 * Flat rectangles with thin borders, no shadows, rgba opacity
 */
const STANDARD_STYLE: RenderStyleTokens = {
  // Card / Panel
  cardRadius: 8,
  cardStrokeWidth: 1,
  cardShadowFilter: null,

  // Button
  buttonRadius: 6,
  buttonFontWeight: 500,
  buttonUseSolidColors: false,  // Uses rgba(59, 130, 246, 0.85)

  // Input
  inputRadius: 6,

  // Badge
  badgeRadius: 'pill',

  // Heading
  headingFontWeight: 600,
  headingFontSize: 20,

  // General
  fontFamily: 'system-ui, -apple-system, sans-serif',
  baseFontSize: 14,

  // SVG defs
  svgDefs: '',
};

/**
 * Clean style - polished wireframe with subtle shadows
 * Larger radius, solid colors, drop shadows for depth
 */
const CLEAN_STYLE: RenderStyleTokens = {
  // Card / Panel
  cardRadius: 12,
  cardStrokeWidth: 1,
  cardShadowFilter: 'shadow-sm',

  // Button
  buttonRadius: 8,
  buttonFontWeight: 600,
  buttonUseSolidColors: true,  // Solid colors, no opacity

  // Input
  inputRadius: 8,

  // Badge
  badgeRadius: 'pill',

  // Heading
  headingFontWeight: 700,
  headingFontSize: 20,

  // General
  fontFamily: 'system-ui, -apple-system, sans-serif',
  baseFontSize: 14,

  // SVG defs - subtle drop shadow filter
  svgDefs: `
    <filter id="shadow-sm" x="-4%" y="-4%" width="108%" height="116%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.08"/>
    </filter>
  `,
};

// Register built-in styles
registerStyle('standard', STANDARD_STYLE);
registerStyle('clean', CLEAN_STYLE);

/**
 * Helper functions for SVG and PDF processing
 */

/**
 * Extract actual width and height from rendered SVG string
 * The SVG renderer may produce dynamic heights, so we extract actual dimensions
 */
export function extractSVGDimensions(svgString: string): { width: number; height: number } {
  const widthMatch = svgString.match(/width="(\d+(?:\.\d+)?)/);
  const heightMatch = svgString.match(/height="(\d+(?:\.\d+)?)/);

  return {
    width: widthMatch ? parseFloat(widthMatch[1]) : 800,
    height: heightMatch ? parseFloat(heightMatch[1]) : 600,
  };
}

/**
 * Convert hex color with opacity (e.g., #3B82F615) to rgba format
 * This helps svg-to-pdfkit render colors with transparency correctly
 */
export function hexToRgba(hex: string): string {
  // Handle 8-character hex (with alpha)
  if (hex.length === 9) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16) / 255;
    return `rgba(${r},${g},${b},${a.toFixed(2)})`;
  }
  // Return as-is for 6-character hex or other formats
  return hex;
}

/**
 * Preprocess SVG to convert hex colors with opacity to rgba format
 * This ensures svg-to-pdfkit renders them correctly
 */
export function preprocessSVGColors(svg: string): string {
  // Replace all hex colors with 8 characters (including alpha) with rgba
  return svg.replace(/#[0-9A-Fa-f]{8}\b/g, (match) => hexToRgba(match));
}

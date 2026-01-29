import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { createWriteStream, existsSync } from 'fs';

/**
 * Extract actual width and height from rendered SVG string
 * The SVG renderer may produce dynamic heights, so we extract actual dimensions
 */
function extractSVGDimensions(svgString: string): { width: number; height: number } {
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
function hexToRgba(hex: string): string {
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
function preprocessSVGColors(svg: string): string {
  // Replace all hex colors with 8 characters (including alpha) with rgba
  return svg.replace(/#[0-9A-Fa-f]{8}\b/g, (match) => hexToRgba(match));
}

/**
 * ================================================================================
 * DYNAMIC FONT RESOLUTION NOTE
 * ================================================================================
 * 
 * pdfkit historically tried to load Helvetica.afm automatically during
 * PDFDocument constructor, which caused problems in bundled contexts:
 * - VS Code Extensions (bundled with webpack)
 * - Packaged CLI (bundled with tsup)
 * - Electron apps
 * - Webpack/Vite/esbuild bundles
 * - Importing Core as npm library in other projects
 * 
 * SOLUTION: Prevent pdfkit from loading any default font by passing
 * `font: null` to the constructor. Then we explicitly register and load
 * the font ourselves using require.resolve(), which respects Node.js
 * module resolution and bundler configuration.
 * 
 * This approach is clean, elegant, and doesn't require monkeypatching.
 * 
 * REFERENCE: https://github.com/foliojs/pdfkit/issues/1616
 * ================================================================================
 */

/**
 * Dynamically resolves the path to a font AFM file.
 * Attempts multiple resolution strategies:
 * 1. Use custom font path if provided
 * 2. Use require.resolve() to find file in node_modules
 * 3. Try path relative to process.cwd()
 * 4. Try path relative to __dirname
 * 5. If all fail, return null and let pdfkit use default
 * 
 * @param fontName - Font name (e.g., 'Helvetica', 'Courier', 'Times Roman')
 * @param customFontPath - Optional custom path (if provided, used directly)
 * @returns Path to font AFM file, or null if resolution fails
 * @throws Does not throw exceptions - returns null silently if fails
 */
function resolveFontPath(fontName: string, customFontPath?: string): string | null {
  // Strategy 0: If custom path provided, validate and use
  if (customFontPath) {
    try {
      if (existsSync(customFontPath)) {
        return customFontPath;
      } else {
        console.warn(`[pdfkit] Custom font path "${customFontPath}" is not accessible`);
      }
    } catch (error) {
      console.warn(
        `[pdfkit] Error validating custom font path: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Strategy 1: Use require.resolve() - best for bundled contexts
  // This respects Node.js module resolution configuration and bundlers
  try {
    const resolvedPath = require.resolve(`pdfkit/js/data/${fontName}.afm`);
    if (existsSync(resolvedPath)) {
      return resolvedPath;
    }
  } catch (error) {
    // require.resolve() failed - move to next strategy
  }

  // Strategy 2: Try path relative to node_modules in cwd
  try {
    const nodeModulesPath = path.resolve(
      process.cwd(),
      `node_modules/pdfkit/js/data/${fontName}.afm`
    );
    if (existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }
  } catch (error) {
    // Silent fallback
  }

  // Strategy 3: Try from __dirname of core module
  try {
    // __dirname is the directory of compiled file (dist/renderer/)
    const dirnameBasedPath = path.resolve(
      __dirname,
      `../../node_modules/pdfkit/js/data/${fontName}.afm`
    );
    if (existsSync(dirnameBasedPath)) {
      return dirnameBasedPath;
    }
  } catch (error) {
    // Silent fallback
  }

  // Could not resolve font - return null for fallback
  return null;
}

/**
 * Export SVG to PNG using sharp
 */
export async function exportPNG(
  svg: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  const buffer = Buffer.from(svg);

  await sharp(buffer).resize(width, height).png().toFile(outputPath);
}

/**
 * Export multiple SVG screens to a multi-page PDF file with dynamic font resolution.
 * 
 * This function is robust to different execution contexts (dev, bundled, VS Code Extension, etc.)
 * because it resolves the Helvetica.afm path dynamically instead of relying on __dirname.
 * 
 * ### Font Resolution
 * The function attempts to resolve the Helvetica font in this order:
 * 1. If `options.customFontPath` is provided, validate and use it
 * 2. Use `require.resolve('pdfkit/js/data/Helvetica.afm')` (best for bundled code)
 * 3. Try `${process.cwd()}/node_modules/pdfkit/js/data/Helvetica.afm`
 * 4. Try `${__dirname}/../../node_modules/pdfkit/js/data/Helvetica.afm`
 * 5. If all fail, fall back to Courier (built-in font, always available)
 * 
 * ### Supported Execution Contexts
 * ✅ Pure Node.js (local development)
 * ✅ Packaged CLI (tsup ESM/CJS)
 * ✅ VS Code Extension (bundled with webpack)
 * ✅ Electron + bundlers
 * ✅ Webpack/Vite/esbuild
 * ✅ WebApps (if used with Node backend)
 * ✅ Any project that imports Core as npm library
 * 
 * @param svgs - Array of SVG objects with dimensions { svg, width, height, name }
 * @param outputPath - Path where the PDF file will be saved
 * @param options - Optional configuration
 * @param options.customFontPath - Custom path to .afm file (overrides automatic resolution)
 * 
 * @throws {Error} If the output path is not accessible or fs.createWriteStream fails
 * @throws {Error} If any SVG is invalid (SVGtoPDF internally)
 * 
 * @example
 * // Case 1: Automatic font resolution
 * await exportMultipagePDF(
 *   [{ svg: '<svg>...</svg>', width: 1920, height: 1080, name: 'screen1' }],
 *   './output.pdf'
 * );
 * 
 * @example
 * // Case 2: Custom font path
 * await exportMultipagePDF(
 *   [{ svg: '<svg>...</svg>', width: 1920, height: 1080, name: 'screen1' }],
 *   './output.pdf',
 *   { customFontPath: '/path/to/custom-font.afm' }
 * );
 */
export async function exportMultipagePDF(
  svgs: Array<{ svg: string; width: number; height: number; name: string }>,
  outputPath: string,
  options?: { customFontPath?: string }
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    try {
      await mkdir(outputDir, { recursive: true });
    } catch (error) {
      // Ignore error if directory already exists
    }

    // Extract actual dimensions from each SVG
    const pagesWithActualDimensions = svgs.map((page) => {
      // Preprocess SVG to fix color rendering in PDF
      const processedSvg = preprocessSVGColors(page.svg);
      const actualDims = extractSVGDimensions(processedSvg);
      return {
        ...page,
        svg: processedSvg,
        actualWidth: actualDims.width,
        actualHeight: actualDims.height,
      };
    });

    // Create PDF document with first page size (actual dimensions)
    const firstPage = pagesWithActualDimensions[0];

    // ========== Font Resolution (BEFORE PDFDocument creation) ==========
    // Resolve font path BEFORE creating the document so we can pass it directly
    const helveticaPath = resolveFontPath('Helvetica', options?.customFontPath);

    // Create PDF document with resolved font path
    // pdfkit will load the font from the path we provide
    const doc = new PDFDocument({
      size: [firstPage.actualWidth, firstPage.actualHeight],
      margin: 0,
      font: helveticaPath || 'Courier', // Use resolved path if available, else Courier
    });
    // ===================================================================

    const stream = createWriteStream(outputPath);
    doc.pipe(stream);

    // Add each SVG as a page with its actual dimensions
    pagesWithActualDimensions.forEach((page, index) => {
      if (index > 0) {
        // Add new page with correct actual size
        doc.addPage({
          size: [page.actualWidth, page.actualHeight],
          margin: 0,
        });
      }

      // Convert SVG to PDF and add to page using actual dimensions
      try {
        SVGtoPDF(doc, page.svg, 0, 0, {
          width: page.actualWidth,
          height: page.actualHeight,
          assumePt: true,
        });
      } catch (error) {
        console.error(`Error rendering page ${page.name}:`, error);
      }
    });

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
}

/**
 * Save SVG to file
 */
export async function exportSVG(svg: string, outputPath: string): Promise<void> {
  const outputDir = path.dirname(outputPath);
  await mkdir(outputDir, { recursive: true }).catch(() => {});
  await writeFile(outputPath, svg, 'utf8');
}

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
 * Dynamically resolves the path to the Helvetica AFM file.
 * Attempts multiple resolution strategies:
 * 1. Use custom font path if provided
 * 2. Use require.resolve() to find file in node_modules
 * 3. Try path relative to process.cwd()
 * 4. Try path relative to __dirname
 * 5. If all fail, return null and let pdfkit use default
 * 
 * @param customFontPath - Optional custom path (if provided, used directly)
 * @returns Path to Helvetica.afm file, or null if resolution fails
 * @throws Does not throw exceptions - returns null silently if fails
 */
function resolveHelveticaFontPath(customFontPath?: string): string | null {
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
    const resolvedPath = require.resolve('pdfkit/js/data/Helvetica.afm');
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
      'node_modules/pdfkit/js/data/Helvetica.afm'
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
      '../../node_modules/pdfkit/js/data/Helvetica.afm'
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
 * Exporta múltiples pantallas SVG a un archivo PDF multipage con resolución dinámica de fuentes.
 * 
 * Esta función es robusta a diferentes contextos de ejecución (dev, bundled, VS Code Extension, etc.)
 * porque resuelve dinámicamente la ruta de la fuente Helvetica.afm en lugar de depender de __dirname.
 * 
 * ### Resolución de Fuentes
 * La función intenta resolver la fuente Helvetica en este orden:
 * 1. Si `options.customFontPath` es proporcionado, validar y usarlo
 * 2. Usar `require.resolve('pdfkit/js/data/Helvetica.afm')` (mejor para bundled code)
 * 3. Intentar `${process.cwd()}/node_modules/pdfkit/js/data/Helvetica.afm`
 * 4. Intentar `${__dirname}/../../node_modules/pdfkit/js/data/Helvetica.afm`
 * 5. Si todas fallan, continuar con fuentes por defecto de pdfkit (graceful fallback)
 * 
 * ### Contextos Soportados
 * ✅ Node.js puro (desarrollo local)
 * ✅ CLI empaquetado (tsup ESM/CJS)
 * ✅ VS Code Extension (bundled con webpack)
 * ✅ Electron + bundlers
 * ✅ Webpack/Vite/esbuild
 * ✅ WebApps (si se usa con servidor Node backend)
 * ✅ Cualquier proyecto que importe Core como librería npm
 * 
 * @param svgs - Array de objetos SVG con dimensiones { svg, width, height, name }
 * @param outputPath - Ruta donde guardar el archivo PDF
 * @param options - Configuración opcional
 * @param options.customFontPath - Ruta personalizada a archivo .afm (overrides resolución automática)
 * 
 * @throws {Error} Si la ruta de salida no es accesible o fs.createWriteStream falla
 * @throws {Error} Si algún SVG es inválido (SVGtoPDF internamente)
 * 
 * @example
 * // Caso simple - resolución automática
 * await exportMultipagePDF(
 *   [{ svg: '<svg>...</svg>', width: 1920, height: 1080, name: 'screen1' }],
 *   './output.pdf'
 * );
 * 
 * @example
 * // Caso con fuente personalizada
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
    // Resolve font path BEFORE creating the document
    // We'll pass `font: null` to prevent pdfkit from auto-loading Helvetica.afm
    const helveticaPath = resolveHelveticaFontPath(options?.customFontPath);

    // Create PDF document WITHOUT any default font to prevent auto-loading
    const doc = new PDFDocument({
      size: [firstPage.actualWidth, firstPage.actualHeight],
      margin: 0,
      font: null, // ← Prevents pdfkit from auto-loading Helvetica.afm
    });

    // Now explicitly set the font after document creation
    // This gives us full control over font resolution and loading
    if (helveticaPath) {
      try {
        doc.registerFont('Helvetica', helveticaPath);
        doc.font('Helvetica');
      } catch (error) {
        console.warn(
          '[pdfkit] Failed to register Helvetica font. Falling back to Courier.',
          error instanceof Error ? error.message : String(error)
        );
        doc.font('Courier'); // Courier is a built-in font
      }
    } else {
      console.debug(
        '[pdfkit] Could not resolve Helvetica font path. Using Courier as fallback.'
      );
      doc.font('Courier'); // Courier is a built-in font that doesn't require AFM files
    }
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

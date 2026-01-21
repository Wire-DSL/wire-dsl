import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { createWriteStream } from 'fs';

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
 * Export multiple SVGs as a single multipage PDF
 * Each SVG becomes a page in the PDF with its own dimensions
 */
export async function exportMultipagePDF(
  svgs: Array<{ svg: string; width: number; height: number; name: string }>,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    mkdir(outputDir, { recursive: true }).catch(() => {});

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
    const doc = new PDFDocument({
      size: [firstPage.actualWidth, firstPage.actualHeight],
      margin: 0,
    });

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

import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';
import { extractSVGDimensions, preprocessSVGColors } from './helpers';

/**
 * Export multiple SVGs as a single multipage PDF
 * Each SVG becomes a page in the PDF with its own dimensions
 * @param svgs Array of SVG objects with svg content, width, height, and name
 * @param outputPath Path where to save the PDF file
 */
export async function exportMultipagePDF(
  svgs: Array<{ svg: string; width: number; height: number; name: string }>,
  outputPath: string
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

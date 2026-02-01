import { writeFile, mkdir } from 'fs/promises';

/**
 * Save SVG string to file
 * @param svg SVG string content
 * @param outputPath Path where to save the file
 */
export async function exportSVG(svg: string, outputPath: string): Promise<void> {
  const path = require('path');
  const outputDir = path.dirname(outputPath);
  await mkdir(outputDir, { recursive: true }).catch(() => {});
  await writeFile(outputPath, svg, 'utf8');
}

import sharp from 'sharp';

/**
 * Export SVG to PNG using sharp
 * @param svg SVG string content
 * @param outputPath Path where to save the PNG file
 * @param width Optional image width (defaults from SVG if not provided)
 * @param height Optional image height (defaults from SVG if not provided)
 */
export async function exportPNG(
  svg: string,
  outputPath: string,
  width?: number,
  height?: number
): Promise<void> {
  const buffer = Buffer.from(svg);

  let operation = sharp(buffer);

  // Only resize if dimensions are provided
  if (width && height) {
    operation = operation.resize(width, height);
  }

  await operation.png().toFile(outputPath);
}

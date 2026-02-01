// @wire-dsl/exporters - File I/O functions for SVG, PNG, PDF export
// Node.js only - requires sharp, pdfkit, svg-to-pdfkit

export { exportSVG } from './svg';
export { exportPNG } from './png';
export { exportMultipagePDF } from './pdf';

// Helper exports for advanced usage
export {
  extractSVGDimensions,
  hexToRgba,
  preprocessSVGColors,
} from './helpers';

export const version = '0.1.6';

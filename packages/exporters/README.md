# @wire-dsl/exporters

Node.js exporters for Wire-DSL. Provides file I/O functions to export wireframes as SVG, PNG, and PDF files. **Node.js only - depends on sharp, pdfkit.**

## Installation

```bash
npm install @wire-dsl/exporters @wire-dsl/engine
```

## Quick Start

```typescript
import { exportSVG, exportPNG, exportMultipagePDF } from '@wire-dsl/exporters';
import { parseWire, generateIR, computeLayout } from '@wire-dsl/engine';

// Parse and layout your wireframe
const wireCode = `
  project "MyWireframe" {
    theme { density: "normal" spacing: "md" radius: "md" stroke: "normal" font: "base" }
    screen Home {
      layout stack { component Heading text: "Welcome" }
    }
  }
`;

const ast = parseWire(wireCode);
const ir = generateIR(ast);
const layout = computeLayout(ir);

// Export to file
await exportSVG(ir, layout, 'output.svg');
await exportPNG(ir, layout, 'output.png');
await exportMultipagePDF(ir, layout, 'output.pdf');
```

## Functions

### exportSVG(ir, layout, outputPath)
Export wireframe as SVG file.

```typescript
import { exportSVG } from '@wire-dsl/exporters';

await exportSVG(ir, layout, 'wireframe.svg');
// → wireframe.svg (scalable vector)
```

### exportPNG(ir, layout, outputPath)
Export wireframe as PNG image (uses sharp).

```typescript
import { exportPNG } from '@wire-dsl/exporters';

await exportPNG(ir, layout, 'wireframe.png');
// → wireframe.png (1920x1080 PNG)
```

### exportMultipagePDF(ir, layout, outputPath)
Export all screens as multipage PDF document (uses pdfkit).

```typescript
import { exportMultipagePDF } from '@wire-dsl/exporters';

await exportMultipagePDF(ir, layout, 'wireframe.pdf');
// → wireframe.pdf (one page per screen)
```

## Dependencies

- `@wire-dsl/engine` - Core parsing and layout
- `pdfkit` - PDF file generation
- `sharp` - PNG image processing (native bindings)
- `svg-to-pdfkit` - SVG to PDF rendering

## Configuration

All export functions use sensible defaults:

- **SVG**: Preserve colors, no optimization
- **PNG**: 1920x1080, 72 DPI (web standard)
- **PDF**: A4 size, embedded fonts, multipage

## License

MIT

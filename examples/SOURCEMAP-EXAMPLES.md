# SourceMap Examples

This directory contains examples demonstrating SourceMap capabilities for bidirectional code ↔ canvas mapping.

## Quick Start

### Basic Usage

```typescript
import { parseWireDSLWithSourceMap } from '@wire-dsl/engine';
import { SourceMapResolver } from '@wire-dsl/engine/sourcemap';

// Parse with SourceMap
const { ast, sourceMap } = parseWireDSLWithSourceMap(wireCode);

// Build resolver for efficient queries
const resolver = new SourceMapResolver(sourceMap);

// Find node at cursor position
const node = resolver.getNodeByPosition(10, 5);
console.log(node?.nodeId); // "component-button-0"
```

### Code → Canvas (Editor Click)

```typescript
// User clicks in editor at line 25
const node = resolver.getNodeByPosition(25, 8);

// Find corresponding canvas element
const ir = generateIR(ast);
const layout = calculateLayout(ir);
const position = layout[node.nodeId];  // { x, y, width, height }
```

### Canvas → Code (Canvas Click)

```typescript
// User clicks on SVG element with data-node-id="component-button-0"
const nodeId = clickedElement.getAttribute('data-node-id');

// Find in SourceMap
const node = resolver.getNodeById(nodeId);

// Jump to code
editor.revealRange(node.range);  // line 25:8 - 27:10
```

## Examples

### [sourcemap-usage-example.ts](./sourcemap-usage-example.ts)

**Comprehensive demonstration** of SourceMap capabilities:
- ✅ Parsing with SourceMap generation
- ✅ Building SourceMapResolver for queries
- ✅ Code ↔ Canvas bidirectional mapping
- ✅ Property-level source tracking
- ✅ Hierarchy navigation
- ✅ Complete pipeline (Parse → IR → Layout → Render)
- ✅ Round-trip verification

**Run with:**
```bash
tsx examples/sourcemap-usage-example.ts
```

**Output:**
- 8 interactive examples
- Statistics and metrics
- Round-trip verification
- Complete pipeline walkthrough

## API Reference

### Core Functions

```typescript
// Parse with SourceMap
parseWireDSLWithSourceMap(code: string, filePath?: string): ParseResult

// Build resolver
new SourceMapResolver(sourceMap: SourceMapEntry[])

// Queries
resolver.getNodeById(id: string): SourceMapEntry | null
resolver.getNodeByPosition(line: number, column: number): SourceMapEntry | null
resolver.getNodesByType(type: string, subtype?: string): SourceMapEntry[]
resolver.getChildren(nodeId: string): SourceMapEntry[]
resolver.getParent(nodeId: string): SourceMapEntry | null
resolver.getSiblings(nodeId: string): SourceMapEntry[]
resolver.getPath(nodeId: string): SourceMapEntry[]
resolver.getStats(): SourceMapStats
```

### Integration

```typescript
// Complete pipeline
const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
const ir = generateIR(ast);
const layout = calculateLayout(ir);
const svg = renderToSVG(ir, layout);

// SVG elements have data-node-id attributes
// <g data-node-id="component-button-0">...</g>
```

## Use Cases

1. **Visual Editors** - Wire Studio, live preview with selection
2. **Code Navigation** - Click canvas → jump to code
3. **Error Reporting** - Precise source locations for validation errors
4. **Component Inspection** - Property-level source tracking
5. **Refactoring** - Safe renames with source awareness

## Documentation

- 📘 **API Reference**: [packages/engine/src/sourcemap/README.md](../packages/engine/src/sourcemap/README.md)
- 🔧 **Integration Guide**: [docs/SOURCEMAP-INTEGRATION.md](../docs/SOURCEMAP-INTEGRATION.md)
- 📋 **Implementation**: [packages/engine/SOURCEMAP-IMPLEMENTATION.md](../packages/engine/SOURCEMAP-IMPLEMENTATION.md)

## Performance

- **Parsing**: < 200ms for medium projects (50-100 components)
- **Resolver**: O(1) lookups via Map indexes
- **Query**: < 0.1ms for getNodeById, < 5ms for getNodesByType
- **Memory**: < 200% overhead (includes property tracking)

See [performance benchmarks](../packages/engine/src/sourcemap/performance.test.ts) for details.

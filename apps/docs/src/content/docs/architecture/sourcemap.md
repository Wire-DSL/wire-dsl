---
title: SourceMap System
description: Bidirectional code-to-canvas selection with SourceMap
---

Complete documentation for Wire-DSL's SourceMap system enabling bidirectional code↔canvas selection.

## Overview

The **SourceMap system** provides precise mapping between source code positions and rendered elements, enabling features like:

- **Click in code editor** → Highlight element in canvas
- **Click on canvas element** → Jump to code definition
- **Property-level precision** - Select specific properties like `text: "Click me"`
- **AST preservation** - Track nodes through entire pipeline

The system maintains stable, semantic node IDs that survive re-parsing and enable reliable element tracking.

---

## Architecture

```
parseWireDSLWithSourceMap()
  ↓
[1. Parser + SourceMapBuilder] → AST + SourceMap
  ↓                                   ↓
[2. IR Generator]                  [Keep nodeId in metadata]
  ↓                                   ↓
[3. Layout Engine]                 [Preserve nodeId]
  ↓                                   ↓
[4. SVG Renderer]                  [Inject data-node-id attributes]
  ↓                                   ↓
SVG Output                         [SourceMapResolver API]
                                      ↓
                              Bidirectional Queries
```

### Key Components

| Component | Purpose | Output |
|-----------|---------|--------|
| **SourceMapBuilder** | Track nodes during parsing | `SourceMapEntry[]` |
| **PropertySourceMap** | Property-level ranges | `nameRange`, `valueRange` |
| **SourceMapResolver** | Query API | Bidirectional lookup |
| **Data Attributes** | SVG integration | `data-node-id` attributes |

---

## Semantic Node IDs

Each element gets a **stable, semantic ID** with format `{type}-{subtype}-{counter}`:

```typescript
// Examples:
"project"              // Root project (singleton)
"screen-0"             // First screen
"screen-1"             // Second screen
"layout-stack-0"       // First stack layout
"layout-grid-1"        // Second grid layout
"component-button-0"   // First button
"component-button-1"   // Second button
// User-defined instances:
"component-mycomp-0"   // Call-site of first `component MyComp ...` usage
// Internal scoped IDs (inside expanded definitions):
"layout-stack-0@component-mycomp-0"    // layout-stack-0 inside first MyComp instance
"component-heading-0@component-mycomp-0"  // heading inside first MyComp instance
```

**Benefits**:
- ✅ **Stable across re-parses** - Same ID for same element
- ✅ **Human-readable** - Easy to debug
- ✅ **Sequential** - Predictable ordering
- ✅ **Type-informative** - Know what element is without lookup
- ✅ **Instance-scoped** - Internal nodes of user-defined components are unique per instance

### User-Defined Component and Layout Instance Nodes

When a `define Component` or `define Layout` is used at a call site, the SourceMap records the **call-site node** (e.g. `component-mycomp-0`). The IR generator wraps the expansion in an `IRInstanceNode`, and the SVG renderer emits a wrapper `<g>` with just `data-node-id` — no extra attributes. The SVG is not a metadata store.

```xml
<g data-node-id="component-mycomp-0">
  <rect fill="transparent" pointer-events="all" .../>
  <g data-node-id="layout-stack-0@component-mycomp-0"> ... </g>
</g>
```

The canvas resolves everything from the SourceMap using the `nodeId` as the key:

| Operation | How | SourceMap lookup |
|---|---|---|
| **Select instance** | Click on `data-node-id` | `sourceMap["component-mycomp-0"].range` → call-site line |
| **Edit invocation props** | `nodeId` → SourceMap | `.properties.text` → value ranges |
| **Navigate to definition** | `nodeId` → `.componentType` → find `define-MyComp` | Definition body range |
| **Drill-in (internal edit)** | Click scoped child `layout-stack-0@component-mycomp-0` | Definition body nodes |

---

## SourceMap Entry Schema

Each entry captures complete location information:

```typescript
interface SourceMapEntry {
  nodeId: string;           // Semantic ID: "component-button-0"
  type: SourceMapNodeType;  // "project" | "screen" | "layout" | "component" | "cell"
  
  // Type-specific metadata
  layoutType?: string;      // "stack" | "grid" | "split" | "panel" | "card"
  componentType?: string;   // "Button" | "Input" | "Heading" | etc.
  
  // Location in source code
  range: CodeRange;         // start/end position
  filePath?: string;        // File path (when provided)
  
  // Hierarchy
  parentId?: string;        // Parent node ID
  
  // Metadata
  name?: string;            // Project/screen/component name
  
  // Property-level tracking (PropertySourceMap)
  properties?: {
    [key: string]: {
      nameRange: CodeRange;   // Position of "text:"
      valueRange: CodeRange;  // Position of "Click me"
      value: unknown;         // Parsed value
    }
  };
}
```

### CodeRange Format

```typescript
interface CodeRange {
  start: { line: number; column: number };  // 1-indexed
  end: { line: number; column: number };    // 1-indexed
}
```

Example:
```wire
component Button text: "Submit"
^                ^^^^   ^^^^^^^^
|                |      └─ valueRange: { start: {4, 24}, end: {4, 32} }
|                └─ nameRange: { start: {4, 18}, end: {4, 22} }
└─ range: { start: {4, 1}, end: {4, 32} }
```

---

## Usage Examples

### Basic Parsing with SourceMap

```typescript
import { parseWireDSLWithSourceMap } from '@wire-dsl/engine';

const code = `
  project "My App" {
    screen Home {
      layout stack {
        component Button text: "Click me"
      }
    }
  }
`;

const { ast, sourceMap } = parseWireDSLWithSourceMap(code);

console.log(sourceMap);
// [
//   { nodeId: "project", type: "project", name: "My App", ... },
//   { nodeId: "screen-0", type: "screen", name: "Home", ... },
//   { nodeId: "layout-stack-0", type: "layout", layoutType: "stack", ... },
//   { nodeId: "component-button-0", type: "component", componentType: "Button", ... }
// ]
```

### Click in Editor → Highlight Canvas

```typescript
import { SourceMapResolver } from '@wire-dsl/engine';

const resolver = new SourceMapResolver(sourceMap);

// User clicks at line 5, column 18
function onEditorClick(line: number, column: number) {
  const node = resolver.getNodeByPosition(line, column);
  
  if (node) {
    console.log(`Clicked on: ${node.componentType || node.layoutType || node.type}`);
    console.log(`Node ID: ${node.nodeId}`);
    
    // Highlight element in canvas
    const element = document.querySelector(`[data-node-id="${node.nodeId}"]`);
    element?.classList.add('selected');
  }
}
```

### Click on Canvas → Jump to Code

```typescript
// User clicks SVG element with data-node-id="component-button-0"
function onCanvasClick(event: MouseEvent) {
  const target = event.target as SVGElement;
  const nodeId = target.getAttribute('data-node-id');
  
  if (nodeId) {
    const node = resolver.getNodeById(nodeId);
    
    if (node) {
      // Jump to code position
      editor.revealRange({
        startLine: node.range.start.line,
        startColumn: node.range.start.column,
        endLine: node.range.end.line,
        endColumn: node.range.end.column
      });
    }
  }
}
```

### Property-Level Selection

```typescript
// Find which property was clicked
const node = resolver.getNodeByPosition(5, 30); // Inside "Click me"

if (node?.properties?.text) {
  const textProp = node.properties.text;
  
  console.log('Property name range:', textProp.nameRange);   // "text:"
  console.log('Property value range:', textProp.valueRange); // "Click me"
  console.log('Property value:', textProp.value);            // "Click me"
  
  // Select just the value in editor
  editor.setSelection(
    textProp.valueRange.start,
    textProp.valueRange.end
  );
}
```

---

## SourceMapResolver API

The `SourceMapResolver` class provides efficient queries over the SourceMap.

### Core Selection Methods

#### `getNodeById(nodeId: string)`

Find node by semantic ID (Canvas → Code).

```typescript
const button = resolver.getNodeById('component-button-0');
// Returns: SourceMapEntry | null
```

**Complexity**: O(1) - Uses Map index  
**Use Case**: Click on canvas element with `data-node-id`

#### `getNodeByPosition(line: number, column: number)`

Find node at code position (Code → Canvas). Returns **deepest matching node**.

```typescript
const node = resolver.getNodeByPosition(15, 10);
// Returns: SourceMapEntry | null
```

**Complexity**: O(n) - Filters then sorts by depth  
**Use Case**: Click in code editor, cursor position change

**Depth Selection Example**:
```wire
layout stack {              // depth: 2
  component Button         // depth: 3 ← Returns this (deepest)
    text: "Click"
}
```

Clicking on line with `text: "Click"` returns the Button (depth 3), not the layout (depth 2).

### Navigation Methods

#### `getChildren(nodeId: string)`

Get direct child nodes.

```typescript
const children = resolver.getChildren('layout-stack-0');
// Returns: SourceMapEntry[] - All components inside stack
```

#### `getParent(nodeId: string)`

Get parent node.

```typescript
const parent = resolver.getParent('component-button-0');
// Returns: SourceMapEntry | null - The containing layout
```

#### `getSiblings(nodeId: string)`

Get sibling nodes (same parent, excluding self).

```typescript
const siblings = resolver.getSiblings('component-button-0');
// Returns: SourceMapEntry[] - Other components in same layout
```

#### `getPath(nodeId: string)`

Get path from root to node (breadcrumb trail).

```typescript
const path = resolver.getPath('component-button-0');
// Returns: SourceMapEntry[]
// [project, screen-0, layout-stack-0, component-button-0]
```

### Query Methods

#### `getNodesByType(type, subtype?)`

Filter nodes by type.

```typescript
// All components
const allComponents = resolver.getNodesByType('component');

// Only buttons
const buttons = resolver.getNodesByType('component', 'Button');

// All stack layouts
const stacks = resolver.getNodesByType('layout', 'stack');
```

#### `getAllNodes()`

Get complete SourceMap.

```typescript
const allNodes = resolver.getAllNodes();
// Returns: SourceMapEntry[] - Complete SourceMap
```

#### `getStats()`

Get SourceMap statistics.

```typescript
const stats = resolver.getStats();
// Returns:
// {
//   totalNodes: 42,
//   byType: {
//     project: 1,
//     screen: 3,
//     layout: 8,
//     component: 30
//   },
//   maxDepth: 5
// }
```

---

## SVG Integration

All rendered SVG elements include `data-node-id` attributes when parsed with SourceMap:

```xml
<svg>
  <g data-node-id="layout-stack-0">
    <rect data-node-id="component-button-0" .../>
    <text data-node-id="component-button-0">Submit</text>
  </g>
</svg>
```

**Coverage**: All components types + all container types

**Backward Compatibility**: When using `parseWireDSL()` (without SourceMap), no `data-node-id` attributes are added.

---

## Performance

Optimized for interactive editor scenarios:

| Operation | Complexity | Benchmark (500 components) |
|-----------|------------|----------------------------|
| **Parse with SourceMap** | O(n) | ~200ms |
| **getNodeById()** | O(1) | < 0.1ms |
| **getNodeByPosition()** | O(n) | < 1ms |
| **Memory Overhead** | ~3KB per 100 nodes | < 5% of source code size |

---

## Best Practices

### Always Use SourceMapResolver

Don't manually search through SourceMap arrays:

```typescript
// ❌ Bad: Manual search (O(n))
const button = sourceMap.find(e => e.nodeId === 'component-button-0');

// ✅ Good: Use resolver (O(1))
const button = resolver.getNodeById('component-button-0');
```

### Cache Resolver Instance

Create resolver once, reuse for multiple queries:

```typescript
// ✅ Good: Single resolver
const resolver = new SourceMapResolver(sourceMap);

for (const click of userClicks) {
  const node = resolver.getNodeByPosition(click.line, click.col);
  // ... handle click
}
```

### Handle Null Returns

All query methods can return `null`:

```typescript
const node = resolver.getNodeById(nodeId);

if (node) {
  // Safe to use
  editor.revealRange(node.range);
} else {
  console.warn(`Node not found: ${nodeId}`);
}
```

### Use Type Guards

TypeScript narrowing for component/layout types:

```typescript
const node = resolver.getNodeByPosition(line, col);

if (node?.type === 'component') {
  console.log(`Component: ${node.componentType}`);
} else if (node?.type === 'layout') {
  console.log(`Layout: ${node.layoutType}`);
}
```

---

## Backward Compatibility

The SourceMap system is **opt-in** and maintains full backward compatibility:

```typescript
// Without SourceMap (existing code unchanged)
const { ast } = parseWireDSL(code);
const svg = renderToSVG(ir, layout); // No data-node-id attributes

// With SourceMap (new feature)
const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
const svg = renderToSVG(ir, layout); // Has data-node-id attributes
```

No breaking changes for existing users.

---

## Real-World Integration

### Wire Studio (Web Editor)

```typescript
class WireStudioEditor {
  private resolver: SourceMapResolver;
  
  onCodeChange(code: string) {
    const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
    this.resolver = new SourceMapResolver(sourceMap);
    
    // Re-render canvas
    this.renderCanvas(ast);
  }
  
  onEditorClick(line: number, column: number) {
    const node = this.resolver.getNodeByPosition(line, column);
    if (node) {
      this.highlightCanvasElement(node.nodeId);
      this.showPropertiesPanel(node);
    }
  }
  
  onCanvasClick(nodeId: string) {
    const node = this.resolver.getNodeById(nodeId);
    if (node) {
      this.editor.revealRange(node.range);
      this.editor.setSelection(node.range);
    }
  }
}
```

### VS Code Extension

```typescript
import * as vscode from 'vscode';
import { parseWireDSLWithSourceMap, SourceMapResolver } from '@wire-dsl/engine';

export function activate(context: vscode.ExtensionContext) {
  const preview = vscode.commands.registerCommand('wire.showPreview', () => {
    const editor = vscode.window.activeTextEditor;
    const code = editor.document.getText();
    
    const { sourceMap } = parseWireDSLWithSourceMap(code);
    const resolver = new SourceMapResolver(sourceMap);
    
    // Show preview panel with click handlers
    showPreviewPanel(resolver);
  });
  
  context.subscriptions.push(preview);
}
```

---

## Related Documentation

- [Architecture Overview](/architecture/overview) - System architecture
- [IR Format](/architecture/ir-format) - Intermediate Representation
- [Layout Engine](/architecture/layout-engine) - Layout calculations
- [Validation](/architecture/validation) - Validation rules

---

## API Reference

Full TypeScript API documentation:

```typescript
// Main exports
export { parseWireDSLWithSourceMap } from './parser';
export { SourceMapResolver } from './sourcemap';
export type { 
  SourceMapEntry,
  PropertySourceMap,
  CodeRange,
  Position,
  SourceMapNodeType 
} from './sourcemap';
```

See [packages/engine/src/sourcemap/](https://github.com/wire-dsl/wire-dsl/tree/main/packages/engine/src/sourcemap) for implementation.

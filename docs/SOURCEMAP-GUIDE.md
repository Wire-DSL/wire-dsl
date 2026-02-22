# SourceMap Developer Guide

Complete guide for using Wire-DSL's SourceMap system for bidirectional code↔canvas selection.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Performance](#performance)
- [Integration Patterns](#integration-patterns)

---

## Quick Start

### Installation

```bash
npm install @wire-dsl/engine
```

### Basic Usage

```typescript
import { parseWireDSLWithSourceMap, SourceMapResolver } from '@wire-dsl/engine';

// Parse with SourceMap
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
const resolver = new SourceMapResolver(sourceMap);

// Code → Canvas: Click in editor
const node = resolver.getNodeByPosition(5, 18);
console.log(node?.nodeId); // "component-button-0"

// Canvas → Code: Click on element
const button = resolver.getNodeById('component-button-0');
console.log(button?.range); // { start: { line: 5, column: 9 }, end: { ... } }
```

---

## Core Concepts

### Semantic Node IDs

Each element receives a stable, human-readable ID:

```
Format: {type}-{subtype}-{counter}

Examples:
  - "project" (singleton)
  - "screen-0", "screen-1"
  - "layout-stack-0", "layout-grid-1"
  - "component-button-0", "component-input-1"
```

**Benefits:**
- Stable across re-parses
- Sequential and predictable
- Easy to debug

### SourceMap Entry

Each entry contains:

```typescript
{
  nodeId: string;           // "component-button-0"
  type: SourceMapNodeType;  // "component"
  componentType?: string;   // "Button"
  range: CodeRange;         // Code position
  parentId?: string;        // Parent node ID
  properties?: {            // Property-level tracking
    text: {
      nameRange: {...},     // Position of "text:"
      valueRange: {...},    // Position of "Click me"
      value: "Click me"
    }
  }
}
```

### Data Attributes

Rendered SVG includes `data-node-id` on all elements:

```xml
<rect data-node-id="component-button-0" .../>
```

Enables click handling on canvas elements.

### User-Defined Component and Layout Instances

When a `define Component` or `define Layout` is used, the renderer emits a wrapper `<g data-node-id="...">` — identical in structure to any other node. The SVG carries **no extra metadata**: the canvas resolves the definition name, invocation props, and source ranges via the SourceMap using the `nodeId` as the key.

```xml
<!-- component MyComp text: "Hello" -->
<g data-node-id="component-mycomp-0">
  <rect x="0" y="0" width="375" height="40"
        fill="transparent" stroke="none" pointer-events="all"/>
  <!-- internal nodes use scoped IDs: definitionNodeId@callSiteNodeId -->
  <g data-node-id="layout-stack-0@component-mycomp-0"> ... </g>
</g>

<!-- component MyComp text: "World" -->
<g data-node-id="component-mycomp-1">
  <g data-node-id="layout-stack-0@component-mycomp-1"> ... </g>
</g>
```

**Canvas interaction model** — all data comes from the SourceMap, not the SVG:

| Action | nodeId resolution | SourceMap lookup |
|---|---|---|
| Click on instance | `component-mycomp-0` | `sourceMap["component-mycomp-0"].range` → call-site line |
| Show property panel | `component-mycomp-0` | `.properties.text.value` → `"Hello"` |
| Navigate to definition | `component-mycomp-0` | `.componentType` → `"MyComp"` → find `define-MyComp` entry |
| Drill-in (internal edit) | `layout-stack-0@component-mycomp-0` | Scoped ID resolves to definition body |

---

## API Reference

### SourceMapResolver

#### Constructor

```typescript
new SourceMapResolver(sourceMap: SourceMapEntry[])
```

Creates resolver with optimized indexes for fast lookups.

#### Core Selection

##### `getNodeById(nodeId: string): SourceMapEntry | null`

Find node by ID (Canvas → Code). **O(1)**.

```typescript
const button = resolver.getNodeById('component-button-0');
```

##### `getNodeByPosition(line: number, column: number): SourceMapEntry | null`

Find deepest node at position (Code → Canvas). **O(n)**.

```typescript
const node = resolver.getNodeByPosition(15, 10);
```

Returns most specific (deepest) matching node.

#### Navigation

##### `getChildren(nodeId: string): SourceMapEntry[]`

Get direct child nodes.

```typescript
const children = resolver.getChildren('layout-stack-0');
// Returns all components inside stack
```

##### `getParent(nodeId: string): SourceMapEntry | null`

Get parent node.

```typescript
const parent = resolver.getParent('component-button-0');
// Returns containing layout
```

##### `getSiblings(nodeId: string): SourceMapEntry[]`

Get sibling nodes (excludes self).

```typescript
const siblings = resolver.getSiblings('component-button-0');
// Returns other components in same layout
```

##### `getPath(nodeId: string): SourceMapEntry[]`

Get path from root (breadcrumb trail).

```typescript
const path = resolver.getPath('component-button-0');
// [project, screen-0, layout-stack-0, component-button-0]
```

#### Queries

##### `getNodesByType(type: string, subtype?: string): SourceMapEntry[]`

Filter by type.

```typescript
// All components
const components = resolver.getNodesByType('component');

// Only buttons
const buttons = resolver.getNodesByType('component', 'Button');

// All stacks
const stacks = resolver.getNodesByType('layout', 'stack');
```

##### `getAllNodes(): SourceMapEntry[]`

Get complete SourceMap.

##### `getStats(): object`

Get statistics.

```typescript
const stats = resolver.getStats();
// {
//   totalNodes: 42,
//   byType: { project: 1, screen: 3, layout: 8, component: 30 },
//   maxDepth: 5
// }
```

---

## Usage Examples

### Example 1: Click in Editor → Highlight Canvas

```typescript
function onEditorClick(line: number, column: number) {
  const node = resolver.getNodeByPosition(line, column);
  
  if (node) {
    // Highlight element in canvas
    const element = document.querySelector(`[data-node-id="${node.nodeId}"]`);
    element?.classList.add('selected');
    
    // Show breadcrumb
    const path = resolver.getPath(node.nodeId);
    showBreadcrumb(path.map(n => n.nodeId));
  }
}
```

### Example 2: Click on Canvas → Jump to Code

```typescript
function onCanvasClick(event: MouseEvent) {
  const target = event.target as SVGElement;
  const nodeId = target.getAttribute('data-node-id');
  
  if (nodeId) {
    const node = resolver.getNodeById(nodeId);
    
    if (node) {
      // Jump to code
      editor.revealRange({
        startLine: node.range.start.line,
        startColumn: node.range.start.column,
        endLine: node.range.end.line,
        endColumn: node.range.end.column
      });
      
      // Select full node
      editor.setSelection(node.range);
    }
  }
}
```

### Example 3: Property-Level Selection

```typescript
const node = resolver.getNodeByPosition(5, 30); // Inside "Click me"

if (node?.properties?.text) {
  const textProp = node.properties.text;
  
  // Select just the property value
  editor.setSelection(
    textProp.valueRange.start,
    textProp.valueRange.end
  );
  
  // Show property editor
  showPropertyEditor('text', textProp.value);
}
```

### Example 4: Show Component Hierarchy

```typescript
function showComponentHierarchy(nodeId: string) {
  const path = resolver.getPath(nodeId);
  
  return path.map(node => ({
    id: node.nodeId,
    label: node.componentType || node.layoutType || node.type,
    name: node.name
  }));
}

// Usage:
const hierarchy = showComponentHierarchy('component-button-0');
// [
//   { id: "project", label: "project", name: "My App" },
//   { id: "screen-0", label: "screen", name: "Home" },
//   { id: "layout-stack-0", label: "stack", name: undefined },
//   { id: "component-button-0", label: "Button", name: undefined }
// ]
```

### Example 5: Find All Buttons

```typescript
const buttons = resolver.getNodesByType('component', 'Button');

buttons.forEach(button => {
  console.log(`Button at line ${button.range.start.line}`);
  
  if (button.properties?.text) {
    console.log(`  Text: ${button.properties.text.value}`);
  }
});
```

---

## Best Practices

### ✅ DO: Use Resolver for All Queries

```typescript
// ✅ Good: O(1) lookup
const button = resolver.getNodeById('component-button-0');

// ❌ Bad: O(n) manual search
const button = sourceMap.find(e => e.nodeId === 'component-button-0');
```

### ✅ DO: Cache Resolver Instance

```typescript
// ✅ Good: Create once, reuse
const resolver = new SourceMapResolver(sourceMap);

for (const click of clicks) {
  const node = resolver.getNodeByPosition(click.line, click.col);
}

// ❌ Bad: Creating resolver repeatedly
clicks.forEach(click => {
  const resolver = new SourceMapResolver(sourceMap); // Wasteful!
  const node = resolver.getNodeByPosition(click.line, click.col);
});
```

### ✅ DO: Handle Null Returns

```typescript
// ✅ Good: Safe null checks
const node = resolver.getNodeById(nodeId);
if (node) {
  editor.revealRange(node.range);
}

// ❌ Bad: Assuming non-null
const node = resolver.getNodeById(nodeId);
editor.revealRange(node.range); // May crash if null!
```

### ✅ DO: Use TypeScript Type Guards

```typescript
// ✅ Good: Type narrowing
const node = resolver.getNodeByPosition(line, col);

if (node?.type === 'component') {
  console.log(`Component: ${node.componentType}`); // TS knows this exists
} else if (node?.type === 'layout') {
  console.log(`Layout: ${node.layoutType}`); // TS knows this exists
}
```

### ❌ DON'T: Parse Without SourceMap for Features

```typescript
// ❌ Bad: Can't do code↔canvas selection
const { ast } = parseWireDSL(code);
// No SourceMap available!

// ✅ Good: Parse with SourceMap
const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
const resolver = new SourceMapResolver(sourceMap);
```

---

## Performance

| Operation | Complexity | Time (500 components) |
|-----------|------------|-----------------------|
| `parseWireDSLWithSourceMap()` | O(n) | ~200ms |
| `new SourceMapResolver()` | O(n) | ~10ms |
| `getNodeById()` | O(1) | < 0.1ms |
| `getNodeByPosition()` | O(n) | < 1ms |
| `getChildren()` | O(1) | < 0.1ms |
| `getParent()` | O(1) | < 0.1ms |

**Memory Overhead**: ~3KB per 100 nodes (< 5% of source code size)

**Optimization Tips**:
- Cache `SourceMapResolver` instance
- Use `getNodeById()` when you have the ID (O(1))
- Batch position lookups when possible

---

## Integration Patterns

### Pattern 1: Web Editor

```typescript
class WireEditor {
  private resolver: SourceMapResolver;
  private selectedNodeId?: string;
  
  updateCode(code: string) {
    const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
    this.resolver = new SourceMapResolver(sourceMap);
    this.render(ast);
  }
  
  onEditorClick(line: number, col: number) {
    const node = this.resolver.getNodeByPosition(line, col);
    if (node) {
      this.selectNode(node.nodeId);
    }
  }
  
  onCanvasClick(nodeId: string) {
    this.selectNode(nodeId);
    
    const node = this.resolver.getNodeById(nodeId);
    if (node) {
      this.editor.revealRange(node.range);
    }
  }
  
  selectNode(nodeId: string) {
    // Unhighlight previous
    if (this.selectedNodeId) {
      this.unhighlightElement(this.selectedNodeId);
    }
    
    // Highlight new
    this.highlightElement(nodeId);
    this.selectedNodeId = nodeId;
    
    // Update UI
    const node = this.resolver.getNodeById(nodeId);
    if (node) {
      this.showPropertiesPanel(node);
      this.showBreadcrumb(this.resolver.getPath(nodeId));
    }
  }
}
```

### Pattern 2: VS Code Extension

```typescript
import * as vscode from 'vscode';
import { parseWireDSLWithSourceMap, SourceMapResolver } from '@wire-dsl/engine';

export function activate(context: vscode.ExtensionContext) {
  let currentResolver: SourceMapResolver | null = null;
  
  // Update on document change
  vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.languageId === 'wire') {
      const code = event.document.getText();
      const { sourceMap } = parseWireDSLWithSourceMap(code);
      currentResolver = new SourceMapResolver(sourceMap);
      
      // Update preview
      updatePreview(sourceMap);
    }
  });
  
  // Handle preview clicks
  context.subscriptions.push(
    vscode.commands.registerCommand('wire.jumpToNode', (nodeId: string) => {
      if (!currentResolver) return;
      
      const node = currentResolver.getNodeById(nodeId);
      if (node) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const range = new vscode.Range(
            new vscode.Position(node.range.start.line - 1, node.range.start.column - 1),
            new vscode.Position(node.range.end.line - 1, node.range.end.column - 1)
          );
          
          editor.revealRange(range);
          editor.selection = new vscode.Selection(range.start, range.end);
        }
      }
    })
  );
}
```

### Pattern 3: CLI Tool

```typescript
import { parseWireDSLWithSourceMap, SourceMapResolver } from '@wire-dsl/engine';
import fs from 'fs';

// Analyze wireframe structure
const code = fs.readFileSync('wireframe.wire', 'utf-8');
const { sourceMap } = parseWireDSLWithSourceMap(code);
const resolver = new SourceMapResolver(sourceMap);

// Print statistics
const stats = resolver.getStats();
console.log('Wireframe Statistics:');
console.log(`  Total nodes: ${stats.totalNodes}`);
console.log(`  Screens: ${stats.byType.screen || 0}`);
console.log(`  Layouts: ${stats.byType.layout || 0}`);
console.log(`  Components: ${stats.byType.component || 0}`);
console.log(`  Max depth: ${stats.maxDepth}`);

// Find all buttons
const buttons = resolver.getNodesByType('component', 'Button');
console.log(`\nButtons (${buttons.length}):`);
buttons.forEach(btn => {
  const text = btn.properties?.text?.value || '(no text)';
  console.log(`  Line ${btn.range.start.line}: ${text}`);
});
```

---

## Advanced Features

### Property-Level Tracking

Access exact positions of property names and values:

```typescript
const node = resolver.getNodeById('component-button-0');

if (node.properties?.text) {
  const prop = node.properties.text;
  
  console.log('Property name:', prop.nameRange);   // "text:"
  console.log('Property value:', prop.valueRange); // "Click me"
  console.log('Parsed value:', prop.value);        // "Click me"
}
```

Use cases:
- Inline property editing
- Autocomplete at cursor position
- Validation error highlighting

### Depth-Based Selection

`getNodeByPosition()` returns the **deepest** (most specific) node:

```wire
layout stack {              // depth: 2
  layout grid {             // depth: 3
    component Button {      // depth: 4 ← Returns this
      text: "Click"
    }
  }
}
```

Clicking on "Click" returns the Button (depth 4), not grid or stack.

### Stable IDs Across Parses

Same code produces same IDs:

```typescript
const { sourceMap: map1 } = parseWireDSLWithSourceMap(code);
const { sourceMap: map2 } = parseWireDSLWithSourceMap(code);

// IDs are identical
map1[0].nodeId === map2[0].nodeId; // true
```

Enables:
- Preserving selection across edits
- Undo/redo with element tracking
- Multi-user collaboration

---

## Troubleshooting

### Q: `getNodeByPosition()` returns wrong node

**A:** Check if position is 1-indexed (not 0-indexed):

```typescript
// ✅ Correct: Line 1 = first line
resolver.getNodeByPosition(1, 1);

// ❌ Wrong: Line 0 doesn't exist
resolver.getNodeByPosition(0, 0);
```

### Q: No `data-node-id` in SVG

**A:** Ensure using `parseWireDSLWithSourceMap()`:

```typescript
// ❌ Wrong: No SourceMap
const { ast } = parseWireDSL(code);

// ✅ Correct: With SourceMap
const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
```

### Q: `getNodeById()` returns null

**A:** Check if nodeId exists in SourceMap:

```typescript
const allNodes = resolver.getAllNodes();
console.log(allNodes.map(n => n.nodeId)); // List all IDs

const node = resolver.getNodeById('component-button-99');
if (!node) {
  console.log('Node not found - check ID spelling');
}
```

### Q: Performance issues with large files

**A:** Profile and optimize:

```typescript
console.time('parse');
const { sourceMap } = parseWireDSLWithSourceMap(largeCode);
console.timeEnd('parse');

console.time('resolve');
const resolver = new SourceMapResolver(sourceMap);
console.timeEnd('resolve');

console.time('query');
const node = resolver.getNodeByPosition(100, 10);
console.timeEnd('query');
```

Expected: Parse ~200ms, Resolve ~10ms, Query < 1ms for 500 components.

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System design
- [DSL Syntax](./DSL-SYNTAX.md) - Wire DSL language guide
- [Components Reference](./COMPONENTS-REFERENCE.md) - All components
- [Containers Reference](./CONTAINERS-REFERENCE.md) - Layout system

---

## Contributing

Found a bug or want to improve SourceMap? See [Contributing Guide](../CONTRIBUTING.md).

---

**Last Updated**: February 8, 2026  
**Version**: 0.0.3  
**Status**: Production-ready (Phases 1, 4, 5 complete)

---
title: Architecture Overview
description: Wire-DSL system architecture and design
---

Complete system architecture and design documentation for Wire-DSL.

## System Overview

Wire-DSL follows a layered pipeline architecture that transforms declarative DSL code into rendered wireframes through several processing stages:

```
Input (.wire files)
  ↓
[1. Parser (Chevrotain)] → AST
  ↓
[2. IR Generator] → IR (normalized format)
  ↓
[3. Layout Engine] → Positioned components
  ↓
[4. SVG Renderer] → SVG output
  ↓
[5. Exporters] → SVG / PNG / PDF / JSON
  ↓
Output (Images, Files)
```

---

## Layer 1: Parser

**Component**: `@wire-dsl/engine/parser`

Transforms raw `.wire` text into an Abstract Syntax Tree (AST).

**Responsibilities**:
- Tokenization (lexical analysis)
- Syntax validation
- Error reporting with line numbers
- AST generation preserving source locations

**Technology**: Chevrotain (TypeScript-based parser generator)

**Input**: Plain text `.wire` file
**Output**: AST with node locations

---

## Layer 2: IR Generator

**Component**: `@wire-dsl/engine/ir`

Converts AST to an Intermediate Representation (IR) - the normalized, validated format.

**Responsibilities**:
- Apply theme tokens and defaults
- Semantic validation using Zod schemas
- Component composition expansion
- Cycle detection in custom components
- Normalize sizing and spacing values

**Input**: AST
**Output**: IR (JSON-serializable structure)

**IR Features**:
- Stable, version-controlled schema
- Complete information for rendering
- Validation errors with helpful messages
- Theme values applied throughout

---

## Layer 3: Layout Engine

**Component**: `@wire-dsl/engine/layout`

Calculates final positions, sizes, and bounding boxes for all components.

**Responsibilities**:
- Resolve layout types (Stack, Grid, Split, Panel, Card)
- Calculate available space from constraints
- Apply spacing and padding
- Position components with concrete (x, y, width, height)
- Handle responsive sizing modes

**Layout Types Supported**:
- **Stack**: Linear vertical/horizontal arrangements
- **Grid**: 12-column responsive grid system
- **Split**: Sidebar (fixed) + main content (flexible)
- **Panel**: Single-child bordered container
- **Card**: Multi-child flexible card container

**Input**: IR
**Output**: Render tree with computed positions

---

## Layer 4: SVG Renderer

**Component**: `@wire-dsl/engine/renderer`

Converts positioned layout into SVG graphics.

**Responsibilities**:
- Render components as SVG shapes
- Apply component styling (colors, borders, typography)
- Optimize SVG output
- Generate accessible markup

**Features**:
- Wireframe styling (low-fidelity, gray tones)
- Scalable vector output
- DOM-independent (can run in Node.js)
- Icon rendering (Feather Icons)

**Input**: Render tree from layout engine
**Output**: SVG string

---

## Layer 5: Exporters

**Component**: `@wire-dsl/exporters`

Converts SVG and IR to various output formats.

**Supported Formats**:
- **SVG**: Vector export (scalable, optimized)
- **PNG**: Raster export (via Sharp)
- **PDF**: Multi-page PDF (via PDFKit)
- **JSON**: IR export (for further processing)

**Input**: SVG string or IR
**Output**: File in selected format

---

## Core Packages

### @wire-dsl/engine

The main processing pipeline.

**Modules**:
- `parser/` – Chevrotain-based parser
- `ir/` – IR schema definitions and validation
- `layout/` – Layout engine and position calculations
- `renderer/` – SVG rendering
- `index.ts` – Public API exports

**Public API**:
```typescript
export { parseWireDSL, type WireAST };
export { generateIR, type WireIR };
export { resolveLayout, type LayoutTree };
export { renderToSVG };
```

### @wire-dsl/exporters

Export functionality.

**Modules**:
- `svg.ts` – SVG file export
- `png.ts` – PNG export via Sharp
- `pdf.ts` – PDF export via PDFKit
- `helpers.ts` – Color/dimension utilities

### @wire-dsl/cli

Command-line interface.

**Commands**:
```bash
wire validate <file>           # Validate syntax and semantics
wire render <file> -o output   # Render to SVG (default)
wire render <file> -pdf        # Render to PDF
wire render <file> -png        # Render to PNG
```

### @wire-dsl/web

Interactive web editor.

**Technologies**:
- React + TypeScript
- Monaco Editor (code editor)
- Real-time rendering
- Project management UI

---

## Data Flow Example

Here's how a simple login form flows through the system:

### 1. Input DSL
```wire
project "Login" {
  theme { density: "normal", spacing: "md", ... }
  screen LoginScreen {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Sign In"
      component Input label: "Email"
      component Button text: "Login" variant: primary
    }
  }
}
```

### 2. Parser Output (AST)
```typescript
{
  type: "Project",
  name: "Login",
  theme: { density: "normal", ... },
  screens: [{
    type: "Screen",
    name: "LoginScreen",
    layout: {
      type: "Stack",
      direction: "vertical",
      gap: "md",
      children: [
        { type: "Component", name: "Heading", ... },
        { type: "Component", name: "Input", ... },
        { type: "Component", name: "Button", ... }
      ]
    }
  }]
}
```

### 3. IR Generator Output
```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_login",
    "name": "Login",
    "theme": {
      "density": "normal",
      "spacing": 16,
      "radius": 4,
      ...
    },
    "screens": [{
      "id": "screen_loginscreen",
      "nodes": {
        "root": { "type": "Stack", "width": 800, "height": 600, ... },
        "heading": { "type": "Heading", "text": "Sign In", ... },
        "input": { "type": "Input", "label": "Email", ... },
        "button": { "type": "Button", "text": "Login", ... }
      }
    }]
  }
}
```

### 4. Layout Engine Output (with positions)
```json
{
  "nodes": {
    "root": { "x": 0, "y": 0, "width": 800, "height": 600, "children": [...] },
    "heading": { "x": 16, "y": 16, "width": 768, "height": 32, ... },
    "input": { "x": 16, "y": 64, "width": 768, "height": 44, ... },
    "button": { "x": 16, "y": 120, "width": 768, "height": 44, ... }
  }
}
```

### 5. SVG Renderer Output
```svg
<svg width="800" height="600">
  <text x="16" y="32" font-size="24" font-weight="bold">Sign In</text>
  <g class="input-field">
    <rect x="16" y="64" width="768" height="44" fill="white" stroke="gray" />
    <text x="24" y="52" font-size="12">Email</text>
  </g>
  <g class="button">
    <rect x="16" y="120" width="768" height="44" fill="blue" rx="4" />
    <text x="200" y="147" font-size="16" fill="white">Login</text>
  </g>
</svg>
```

### 6. Exporters Output
- **SVG file**: `login.svg` (scalable vector)
- **PNG file**: `login.png` (raster, 800×600)
- **PDF file**: `login.pdf` (printable)

---

## Design Principles

### 1. Separation of Concerns

Each layer has a single responsibility:
- Parser: Syntax analysis
- IR Generator: Normalization and validation
- Layout Engine: Position calculation
- Renderer: Visual representation
- Exporters: Format conversion

### 2. Schema Validation

All data structures validated with Zod:
- Parser output conforms to AST schema
- IR conforms to IR schema
- Validation errors are detailed and helpful

### 3. Immutability

Each layer produces new data without modifying inputs:
- Parser doesn't modify original text
- IR Generator doesn't modify AST
- Layout Engine doesn't modify IR

### 4. Error Reporting

Errors include:
- Location (line, column) in source
- Severity (error, warning)
- Detailed message with suggestions
- Context (lines of code around error)

### 5. Composability

Components can be composed:
- Custom components via `define Component`
- Nested layouts arbitrarily deep
- Reusable patterns

---

## Future Extensions

### Planned Layers

1. **Type System**: Stricter typing for components
2. **CSS Layer**: Direct CSS generation
3. **React Generation**: Convert IR to React components
4. **Figma Export**: Direct Figma plugin integration
5. **Interactive Layer**: Event handling and state management

### Extension Points

- **Custom Exporters**: Add new export formats
- **Custom Renderers**: Add rendering engines
- **Plugin System**: Extend DSL with new components

---

## Performance Characteristics

- **Parser**: O(n) where n = file size
- **IR Generation**: O(n)  where n = AST nodes
- **Layout Engine**: O(n·d) where d = max layout depth
- **Rendering**: O(c) where c = component count
- **Overall**: Linear complexity, suitable for files up to 10,000+ components

---

## Next Steps

- [Layout Engine Specification](./layout-engine.md)
- [IR Format Specification](./ir-format.md)
- [Validation Rules](./validation.md)

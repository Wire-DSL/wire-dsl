# Wire-DSL Architecture

Complete system architecture and design documentation for Wire-DSL.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        WireDSL Ecosystem                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ User Interfaces (Input)                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Web Editor     │  │   CLI Tool       │  │ Future: VS   │  │
│  │  (React + Monaco)│  │ (Commander.js)   │  │ Code Ext     │  │
│  │ - Live preview   │  │ - render         │  │              │  │
│  │ - AI generation  │  │ - validate       │  │              │  │
│  │ - Code editor    │  │ - init           │  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────────────┘  │
│           │                     │                               │
└───────────┼─────────────────────┼───────────────────────────────┘
            │                     │
            └─────────────┬───────┘
                          │
                  Input: .wire files
                          │
            ┌─────────────▼──────────────────────────────────┐
            │     @wire-dsl/engine                           │
            ├────────────────────────────────────────────────┤
            │                                                │
            │  ┌──────────────────────────────────────────┐  │
            │  │ 1. PARSER (Chevrotain)                   │  │
            │  │   Input:  .wire (text)                   │  │
            │  │   Output: AST (tokens) + SourceMap       │  │
            │  │   - SourceMap tracks code positions      │  │
            │  │   - Semantic stable IDs                  │  │
            │  └──────────────┬───────────────────────────┘  │
            │                 │                              │
            │  ┌──────────────▼───────────────────────────┐  │
            │  │ 2. IR GENERATOR                          │  │
            │  │   Input:  AST                            │  │
            │  │   Output: IR Contract (JSON)             │  │
            │  │   - Validates schema with Zod            │  │
            │  └──────────────┬───────────────────────────┘  │
            │                 │                              │
            │  ┌──────────────▼───────────────────────────┐  │
            │  │ 3. LAYOUT ENGINE                         │  │
            │  │   Input:  IR                             │  │
            │  │   Output: Positioned components          │  │
            │  │   - CSS Grid resolver                    │  │
            │  │   - Calculates x, y, width, height       │  │
            │  └──────────────┬───────────────────────────┘  │
            │                 │                              │
            │  ┌──────────────▼───────────────────────────┐  │
            │  │ 4. SVG RENDERER                          │  │
            │  │   Input:  Layout + IR                    │  │
            │  │   Output: SVG (DOM-independent)          │  │
            │  │   - Accessible, optimized                │  │
            │  │   - Exportable, scalable                 │  │
            │  │   - data-node-id attributes (SourceMap)  │  │
            │  └──────────────┬───────────────────────────┘  │
            │                 │                              │
            └─────────────────┼──────────────────────────────┘
                              │
                    Output: SVG / IR / AST
                              │
            ┌─────────────────┴───────────────────────────────┐
            │                                                 │
    ┌───────▼──────────┐                          ┌───────────▼───┐
    │  Preview/Export  │                          │ Further Uses  │
    │  - SVG file      │                          │ - Figma       │
    │  - PNG file      │                          │ - Code gen    │
    │  - PDF file      │                          │ - Prototyping │
    └──────────────────┘                          └───────────────┘
```

---

## Logical Architecture (Layers)

### Layer A — DSL (Declarative Language)

Wire-DSL provides a human-readable, structured format inspired by Mermaid.

**Requirements**:
- Easy to read and write
- Easy to parse
- Easy to generate by AI

**Strategy**: Hybrid DSL (blocks + `key: value` properties)

**Example**:
```wire
project "Dashboard" {
  style {
    density: "normal"
    spacing: "md"
  }
  
  screen Dashboard {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Welcome"
      component Button text: "Start"
    }
  }
}
```

---

### Layer B — Parser + AST

- Parser transforms DSL into an **AST** (what the user wrote)
- Preserves locations (line/column) for error reporting and tooling
- AST is direct representation of source code
- Parses both `define Component` and `define Layout` declarations
- Emits semantic diagnostics for naming, `Children` slot rules, and definition usage arity

**Implementation**: Chevrotain (TypeScript grammar-based parser)

---

### Layer C — IR (Normalized Internal Representation)

AST is converted to **stable IR**, applying:
- Defaults from style tokens
- Normalization (spacing, sizing)
- Semantic validations
- Schema validation with Zod
- Expansion of custom definitions:
  - `define Component` expansion
  - `define Layout` expansion to built-in layout tree
  - `prop_*` dynamic binding substitution
- Warning/error policy for missing/unused dynamic arguments

IR is the **technical source of truth** for rendering.

**Example IR structure**:
```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_dashboard",
    "name": "Dashboard",
    "style": { ... },
    "screens": [ ... ],
    "nodes": { ... }
  }
}
```

---

### Layer D — Layout Engine

Responsible for calculating final positions and sizes from declarative constraints.

**Supported Layouts** (core):
- **Stack** (vertical/horizontal) - Linear layouts
- **Grid** (12-column) - Multi-column grid
- **Split** (sidebar + main) - Two-pane layouts
- **Panel** (bordered box) - Grouped content
- **Card** (flexible box) - Self-contained items

Layout engine operates on IR and produces **Render Tree** with concrete bounding boxes.

Custom layouts are fully expanded before this layer. At layout-engine time, container types are only built-in (`stack`, `grid`, `split`, `panel`, `card`).

**Algorithm**:
1. Traverse IR nodes top-down
2. Calculate available space from parent
3. Resolve child dimensions (fixed, fill, content)
4. Apply gaps and padding
5. Generate (x, y, width, height) for each node

---

### Layer E — Renderer

Main implementation: **SVG Renderer** (DOM-independent)

**Rendering modes**:
- **Wireframe** (gray, low-fidelity) - Default wireframing
- **Interactive** (click → navigation) - Future: interactive prototyping

**Output formats**:
- SVG (scalable, optimized)
- PNG (raster export)
- PDF (print-friendly)

---

### Layer F — Interaction Layer

Declarative interactions:
- Navigation between screens
- Event handling (onClick, onRowClick)
- State management for interactive previews

*(Currently: Events removed from DSL per v1.0 scope. Future: Re-add for interactive prototypes)*

---

### Layer G — Exporters

Export IR/rendered output to various formats:
- JSON (IR export)
- SVG (diagrams)
- PNG/PDF (static exports)
- Future: HTML, React code, Figma

---

### Layer H — SourceMap System

**Purpose**: Enable bidirectional code↔canvas selection

**Components**:
- **SourceMapBuilder** - Tracks nodes during parsing
- **PropertySourceMap** - Property-level precision (nameRange, valueRange)
- **SourceMapResolver** - Query API for bidirectional selection
- **SVG Integration** - `data-node-id` attributes in rendered output

**Features**:
- Click in code editor → Highlight element in canvas
- Click on canvas element → Jump to code definition  
- Property-level selection and editing
- Stable, semantic node IDs (`component-button-0`, `layout-stack-1`)
- O(1) lookup by ID, O(n) lookup by position

**Use Cases**:
- Interactive web editor (Wire Studio)
- VS Code extension
- Developer tools and debugging
- Code navigation and refactoring

See [SourceMap Guide](./SOURCEMAP-GUIDE.md) for complete documentation.

---

## Technical Architecture (Packages)

### `@wire-dsl/engine`

**Responsibility**: Domain types and business logic

Components:
- **Parser** (Chevrotain) - Tokenization and parsing
- **SourceMap Builder** - Code↔canvas mapping during parsing
- **IR Generator** - AST → IR transformation with Zod validation
- **Layout Engine** - Position and size calculation
- **SVG Renderer** - Render tree to SVG with `data-node-id` attributes
- **SourceMap Resolver** - Query API for bidirectional selection
- **IR types** - TypeScript interfaces for IR schema
- **Validations** - Semantic and structural validation

**Key APIs**:
```typescript
// Standard parsing
const { ast } = parseWireDSL(code);

// Parsing with SourceMap
const { ast, sourceMap } = parseWireDSLWithSourceMap(code);
const resolver = new SourceMapResolver(sourceMap);

// Bidirectional selection
const node = resolver.getNodeByPosition(line, col);  // Code → Canvas
const node = resolver.getNodeById('component-button-0'); // Canvas → Code
```

---

### `@wire-dsl/cli` (Command Line Tool)

**Responsibility**: CLI interface and file operations

Commands:
```bash
wire validate <file.wire>              # Validate syntax and semantics
wire render <file.wire> --svg          # Render to SVG
wire render <file.wire> --pdf          # Render to PDF
wire init <project-name>               # Initialize new project
```

Dependencies: Commander.js, Chalk, Ora, Sharp

---

### `@wire-dsl/web` (Web Editor)

**Responsibility**: Interactive web-based editor

Features:
- Live code editor (Monaco)
- Real-time preview
- AI-assisted generation
- Project management
- Export functionality

Technologies:
- React 18 + Vite
- Monaco Editor
- Zustand (state management)
- Tailwind CSS + Radix UI

---

## Data Flow

### Basic Rendering Pipeline

```
.wire file (text)
    │
    ▼
PARSER (Chevrotain)
    │
    ▼
AST (Tokens)
    │
    ▼
IR GENERATOR
    │
    ▼
IR Contract (JSON)
    │
    ▼
LAYOUT ENGINE
    │
    ▼
Layout Positions (x, y, width, height)
    │
    ├────────────────┐
    │                │
    ▼                ▼
SVG Renderer    Code Generator
    │                │
    ▼                ▼
SVG File       React/Vue Code
```

---

## Package Dependencies

```
@wire-dsl/web (React App)
    ├─ @wire-dsl/engine
    ├─ monaco-editor
    ├─ react 18
    ├─ zustand
    └─ tailwindcss

@wire-dsl/cli (CLI Tool)
    ├─ @wire-dsl/engine
    ├─ @wire-dsl/exporters
    ├─ commander
    ├─ chalk
    ├─ ora
    └─ sharp

@wire-dsl/engine (Engine)
    ├─ chevrotain (parser)
    └─ zod (validation)

```

---

## Deployment Architecture

```
GitHub (main branch)
    │
    ├──────────────────┬──────────────┬──────────────┐
    │                  │              │              │
    ▼                  ▼              ▼              ▼
Build & Test      Publish NPM   Deploy Web
(GitHub Actions)  (@wire-dsl/*)  (Cloudflare Pages)
    │                  │              │
    └──────────────────┼──────────────┘
                       │              │
                ┌──────▼────┐  ┌──────▼──────┐
                │ NPM Reg   │  │ Cloudflare  │
                │           │  │ Pages/CDN   │
                │@wire-dsl/ │  │             │
                │ core      │  │wire-dsl.org │
                │@wire-dsl/ │  │(web editor) │
                │ cli       │  │             │
                │@wire-dsl/ │  │             │
                │ web       │  │             │
                └───────────┘  └─────────────┘
```

---

## Technology Stack

### Core Engine

- **Parser**: Chevrotain 11.x (TypeScript grammar-based)
- **Validation**: Zod 3.x (schema validation)
- **Build**: tsup (TypeScript bundler)

### Web Editor

- **Framework**: React 18 + Vite
- **Code Editor**: Monaco Editor
- **State Management**: Zustand
- **Styling**: Tailwind CSS + PostCSS
- **Components**: Radix UI

### CLI Tool

- **CLI Framework**: Commander.js
- **Output Formats**: SVG, PNG, PDF (via Sharp)
- **Colors**: Chalk
- **Progress**: Ora spinner

### DevOps & Build

- **Build Orchestration**: Turborepo
- **Package Manager**: pnpm
- **Testing**: Vitest + Chai
- **Linting**: ESLint
- **Formatting**: Prettier
- **Release**: Changesets
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages

---

## Design Principles

### 1. Immutability

The IR is immutable once generated, ensuring predictability and enabling caching.

### 2. Early Validation

Errors detected during parsing/normalization phases, not during rendering.

Examples:
- invalid `define Layout` names
- invalid `Children` slot usage/count
- missing required `prop_*` bindings
- circular references across component/layout definitions

### 3. Separation of Concerns

Each layer has single responsibility:
- Parser: Syntax
- IR Generator: Validation + Normalization
- Layout Engine: Position calculation
- Renderer: Visual output

### 4. Testability

Each layer independently testable with isolated unit tests.

### 5. Extensibility

New components and layouts added via:
- Component registry system
- Plugin architecture (future)
- Custom validators

### 6. AI-Friendly

Structure designed for LLM comprehension and generation:
- Regular, predictable syntax
- Comprehensive prompt guides
- Clear component catalogs
- Deterministic output

---

## Development Guidelines

### Adding a New Component

1. Define component type in `ir/index.ts`
2. Add Zod schema for validation
3. Implement renderer in `renderer/index.ts`
4. Add tests in `renderer/index.test.ts`
5. Document in component catalog

### Adding a New Layout

1. Define layout structure in IR
2. Implement layout algorithm in `layout/index.ts`
3. Add dimension calculation logic
4. Implement renderer support
5. Add comprehensive tests

### Making Breaking Changes

Use IR versioning:
- Bump `irVersion` field
- Provide migration function
- Maintain backward compatibility where possible
- Document migration path

---

## Performance Considerations

### Parsing
- Target: <100ms for typical files
- Chevrotain grammar optimized
- Error recovery enabled

### Layout Calculation
- O(n) tree traversal algorithm
- Memoization for repeated calculations
- Batch calculations where possible

### Rendering
- SVG output is DOM-independent
- Optimized for small file sizes
- CSS classes reused across components

### Memory
- Target: <50MB for large projects
- Immutable IR reduces copies
- Streaming exports for large files

---

## Future Enhancements

### Phase 2: Exporters
- HTML semantic export
- React component generation
- Figma integration
- Code generation

### Phase 3: Advanced Features
- Conditional rendering
- Data binding
- Custom validations
- Plugin system

---

**Last Updated**: January 23, 2026  
**Status**: ✅ Complete Architecture Definition

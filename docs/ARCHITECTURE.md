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
            ┌─────────────▼─────────────────────────────────────┐
            │     @wire-dsl/core (Engine)                      │
            ├──────────────────────────────────────────────────┤
            │                                                   │
            │  ┌──────────────────────────────────────────┐    │
            │  │ 1. PARSER (Chevrotain)                  │    │
            │  │   Input:  .wire (text)                  │    │
            │  │   Output: AST (tokens)                  │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            │  ┌──────────────▼───────────────────────────┐    │
            │  │ 2. IR GENERATOR                         │    │
            │  │   Input:  AST                           │    │
            │  │   Output: IR Contract (JSON)            │    │
            │  │   - Validates schema with Zod           │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            │  ┌──────────────▼───────────────────────────┐    │
            │  │ 3. LAYOUT ENGINE                        │    │
            │  │   Input:  IR                            │    │
            │  │   Output: Positioned components         │    │
            │  │   - CSS Grid resolver                   │    │
            │  │   - Calculates x, y, width, height      │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            │  ┌──────────────▼───────────────────────────┐    │
            │  │ 4. SVG RENDERER                         │    │
            │  │   Input:  Layout + IR                   │    │
            │  │   Output: SVG (DOM-independent)         │    │
            │  │   - Accessible, optimized               │    │
            │  │   - Exportable, scalable                │    │
            │  └──────────────┬───────────────────────────┘    │
            │                 │                                 │
            └─────────────────┼──────────────────────────────────┘
                              │
                    Output: SVG / IR / AST
                              │
            ┌─────────────────┴───────────────────────────────┐
            │                                                 │
    ┌───────▼──────────┐                          ┌──────────▼────┐
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
  theme {
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

**Implementation**: Chevrotain (TypeScript grammar-based parser)

---

### Layer C — IR (Normalized Internal Representation)

AST is converted to **stable IR**, applying:
- Defaults from theme tokens
- Normalization (spacing, sizing)
- Semantic validations
- Schema validation with Zod

IR is the **technical source of truth** for rendering.

**Example IR structure**:
```json
{
  "irVersion": "1.0",
  "project": {
    "id": "proj_dashboard",
    "name": "Dashboard",
    "theme": { ... },
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

## Technical Architecture (Packages)

### `@wire-dsl/core` (Engine)

**Responsibility**: Domain types and business logic

Components:
- **Parser** (Chevrotain) - Tokenization and parsing
- **IR Generator** - AST → IR transformation with Zod validation
- **Layout Engine** - Position and size calculation
- **SVG Renderer** - Render tree to SVG
- **IR types** - TypeScript interfaces for IR schema
- **Validations** - Semantic and structural validation

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

### `@wire-dsl/ai-backend` (AI Service)

**Responsibility**: AI-powered wireframe generation

Deployment: Cloudflare Workers

Features:
- LLM integration (Claude Haiku)
- Rate limiting
- Usage tracking via Cloudflare KV
- Free tier support (user-provided API keys)
- Pro tier (pooled backend API keys)

---

### `@wire-dsl/studio` (Future)

**Responsibility**: Visual wireframe designer

Planned features:
- Canvas-based design (Konva.js)
- Drag-and-drop components
- Visual property editor
- Real-time preview
- Undo/redo system

---

## Data Flow

### Basic Rendering Pipeline

```
.wire file (text)
    │
    ├─────────────────────────────────────────────┐
    │                                             │
    ▼                                             ▼
PARSER (Chevrotain)                       Raw Text
    │                                             │
    ▼                                             │
AST (Tokens)                                      │
    │                                             │
    ├──────────────────┐                          │
    │                  │                          │
    ▼                  │                          │
IR GENERATOR           │                          │
    │                  │                          │
    ▼                  │                          │
IR Contract (JSON)     │                          ▼
    │                  │                     AI LLM Service
    │                  │                          │
    │                  │                          ▼
    │                  │                     Raw WireDSL
    │                  │                          │
    │                  └──────────┬───────────────┘
    │                             │
    ├─────────────────────────────┘
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

### AI Generation Flow

```
User Input: "Create a login form"
    │
    ▼
User Prompt → Cloudflare Worker
    │
    ▼
Claude Haiku API (rate-limited, tracked)
    │
    ▼
Raw WireDSL Text
    │
    ▼
Wire-DSL Validator
    │
    ├─ Syntax check
    ├─ Component validation
    └─ Fix invalid syntax
    │
    ▼
Valid WireDSL → Parser
    │
    ▼
Render Preview → Show in Editor
    │
    ▼
User Can Adjust/Refine
```

---

## Package Dependencies

```
@wire-dsl/web (React App)
    ├─ @wire-dsl/core
    ├─ monaco-editor
    ├─ react 18
    ├─ zustand
    └─ tailwindcss

@wire-dsl/cli (CLI Tool)
    ├─ @wire-dsl/core
    ├─ commander
    ├─ chalk
    ├─ ora
    └─ sharp

@wire-dsl/core (Engine)
    ├─ chevrotain (parser)
    └─ zod (validation)

@wire-dsl/ai-backend (Workers)
    ├─ hono
    ├─ zod
    └─ @cloudflare/workers-types

@wire-dsl/studio (Roadmap)
    └─ @wire-dsl/core
       ├─ konva.js (canvas)
       ├─ dnd-kit (drag-drop)
       ├─ react-hook-form (forms)
       └─ immer (undo/redo)
```

---

## Deployment Architecture

```
GitHub (main branch)
    │
    ├────────────────────┬──────────────┬────────────────┐
    │                    │              │                │
    ▼                    ▼              ▼                ▼
Build & Test         Publish NPM   Deploy Web       Deploy AI
(GitHub Actions)  (@wire-dsl/*)  (Cloudflare)    (Workers)
    │                    │              │                │
    └────────────────────┼──────────────┼────────────────┘
                         │              │                │
                  ┌──────▼────┐  ┌─────▼─────┐   ┌──────▼────┐
                  │ NPM Reg   │  │ Cloudflare│   │ Workers  │
                  │           │  │ Pages/CDN │   │ KV Store │
                  │@wire-dsl/ │  │           │   │          │
                  │ core      │  │wire-dsl   │   │ AI Svc   │
                  │@wire-dsl/ │  │.dev       │   │ Rate Lim │
                  │ cli       │  │           │   │ Usage    │
                  │@wire-dsl/ │  │           │   │Tracking  │
                  │ web       │  │           │   │          │
                  └───────────┘  └───────────┘   └──────────┘
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

### AI Backend

- **Framework**: Hono (Cloudflare Workers)
- **Hosting**: Cloudflare Workers
- **Storage**: Cloudflare KV
- **LLM**: Anthropic Claude (primary provider)

### DevOps & Build

- **Build Orchestration**: Turborepo
- **Package Manager**: pnpm
- **Testing**: Vitest + Chai
- **Linting**: ESLint
- **Formatting**: Prettier
- **Release**: Changesets
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages / Workers

---

## Design Principles

### 1. Immutability

The IR is immutable once generated, ensuring predictability and enabling caching.

### 2. Early Validation

Errors detected during parsing/normalization phases, not during rendering.

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

### Phase 4: Studio
- Visual wireframe designer
- Canvas-based editing
- Real-time collaboration (planned)
- Component library management

---

**Last Updated**: January 23, 2026  
**Status**: ✅ Complete Architecture Definition

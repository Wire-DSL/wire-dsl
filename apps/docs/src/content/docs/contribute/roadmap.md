---
title: Development Roadmap
description: Wire-DSL feature roadmap and development phases
---

This document outlines the development phases of Wire-DSL from MVP through advanced features.

---

## Vision

Wire-DSL is actively maintained with a clear evolution path. This roadmap describes planned features and the project's direction.

---

## Phase 1: Core MVP

**Status**: Completed ✅

**Goal**: Create functional base with DSL parser, IR generation, layout engine, and renderer.

**Status**: Fully implemented and stable.

### Deliverables

**DSL + Parser**
- ✅ Lexer for tokenization
- ✅ Parser for blocks: `project`, `screen`, `layout`, `component`, `define Component`
- ✅ AST generation with error locations
- ✅ Descriptive parse-time error messages

**IR (Intermediate Representation)**
- ✅ JSON schema for IR
- ✅ AST → IR conversion with normalization
- ✅ Default value application
- ✅ Semantic validation
- ✅ JSON serialization/deserialization

**Layout Engine**
- ✅ Stack layout (vertical/horizontal)
- ✅ Grid layout (12 columns)
- ✅ Split layout (sidebar + main)
- ✅ Panel and Card containers
- ✅ Bounding box calculations
- ✅ Size mode resolution

**Core Components**
- ✅ 23 built-in components:
  - Text: Heading, Text, Paragraph, Label
  - Input: Input, Textarea, Select, Checkbox, Radio, Toggle
  - Buttons: Button, IconButton
  - Navigation: Topbar, SidebarMenu, Breadcrumbs, Tabs
  - Data: Table, List
  - Media: Image, Icon, Avatar
  - Display: Divider, Badge, Link, Alert
  - Info: StatCard, Code, ChartPlaceholder
  - Feedback: Modal, Spinner

**Renderer**
- ✅ SVG/PDF rendering
- ✅ Wireframe styling (low-fidelity)
- ✅ Layout rendering with proper spacing
- ✅ Static rendering (no interactivity)

**Export & CLI**
- ✅ IR to JSON export
- ✅ SVG output
- ✅ PDF output
- ✅ `wire validate <file>` – Syntax and semantic validation
- ✅ `wire render <file>` – Generate SVG/PDF output

**Component Composition**
- ✅ `define Component "Name" { ... }` syntax
- ✅ Component expansion at compile-time
- ✅ Hoisting support (use before/after definition)
- ✅ Cycle detection (parse-time validation)
- ✅ Undefined component detection (IR-time validation)

---

## Phase 2: Theme System & Design Tokens

**Status**: Completed ✅

**Goal**: Implement theme tokens for visual consistency.

**Status**: Fully implemented and integrated.

### Deliverables

**Theme System**
- ✅ Theme block configuration
- ✅ Theme properties: density, spacing, radius, stroke, font
- ✅ Component styling based on theme
- ✅ Theme inheritance and defaults

**Design System Presets**
- ✅ Modern Minimalist
- ✅ Friendly & Accessible
- ✅ Data-Intensive
- ✅ Professional Enterprise

**Documentation & Examples**
- ✅ Theme configuration guide
- ✅ Complete component library reference
- ✅ 18+ example wireframes
- ✅ Component catalog showcase

---

## Phase 3: VS Code Extension

**Status**: Completed ✅

**Goal**: Professional IDE support for Wire-DSL development.

**Status**: Fully implemented and published on VS Code Marketplace.

### Delivered Features

**Core IDE Features**
- ✅ Syntax highlighting with proper tokenization
- ✅ Real-time error detection and reporting
- ✅ Component intellisense and autocomplete
- ✅ Document formatting and beautification
- ✅ File icons for `.wire` files
- ✅ Live preview pane in editor

**Installation**
- 🔗 [GitHub Repository](https://github.com/Wire-DSL/vscode-extension)
- 🔗 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=wire-dsl.wire-dsl)

---

## Phase 4: Source Maps & Debugging

**Status**: In Progress

**Goal**: Advanced debugging and source map support for development and production.

**Current Status**: In progress

### Planned Features

**Source Maps**
- [ ] Generate source maps (`.wire.map`) for compiled output
- [ ] Map rendered SVG elements back to source DSL code
- [ ] Bidirectional tracing (source ↔ output)

**Debugging Support**
- [ ] Debug information in IR output
- [ ] Enhanced error messages with line/column precision
- [ ] Variable inspection tools

**LSP (Language Server Protocol)**
- [ ] Full LSP implementation for universal editor support
- [ ] Go-to-definition navigation
- [ ] Symbol renaming support
- [ ] Find all references functionality

---

## Future Features Pipeline

The following features are planned and will be prioritized based on community feedback:

- **Advanced Exporters**: HTML, React, Vue, and Figma component generation
- **AI-Assisted Wireframing**: Natural language to `.wire` code generation
- **Code Generation**: Auto-generate React/Vue components from wireframes
- **Real-time Collaboration**: Multi-user editing and commenting
- **Figma Import/Export**: Bidirectional design sync
- **Plugin System**: Community extensions and custom components
- **Performance Optimizations**: Faster rendering for complex wireframes
- **Additional Features**: Lots more exciting improvements coming! 🎉

---

## Current Implementation Status

### What Works Now
- ✅ DSL parsing and validation
- ✅ Layout calculations (stack, grid, split, panel, card)
- ✅ SVG/PDF rendering
- ✅ Component composition (define/reuse)
- ✅ Theme system with design tokens
- ✅ 23 built-in components
- ✅ Component validation (cycles, undefined references)
- ✅ CLI with render/validate commands
- ✅ VS Code syntax highlighting and live preview
- ✅ Web editor with real-time preview

### What's Next
- [ ] Source maps and advanced debugging
- [ ] LSP support for all editors
- [ ] Advanced exporters (HTML, React, Vue, Figma)
- [ ] AI-assisted generation
- [ ] Community feedback integration

---

## Quality Metrics

| Aspect | Target | Current |
|--------|--------|---------|
| Test Coverage | >85% | ✅ 85%+ |
| Parser Error Recovery | >90% | ✅ Excellent |
| Render Accuracy | 100% | ✅ Complete |
| Documentation | Comprehensive | ✅ Complete |
| Performance | <500ms render | ✅ <500ms |

---

## Contributing to the Roadmap

Wire-DSL welcomes community contributions. Want to help?

1. **Review the [Development Guide](./development.md)**
2. **Check [existing issues](https://github.com/wire-dsl/wire-dsl/issues)**
3. **Look for [good first issues](https://github.com/wire-dsl/wire-dsl/issues?q=label%3A%22good+first+issue%22)**
4. **Join the discussion** on planned features

---

**Last Updated**: February 6, 2026  
**Maintenance Status**: Active  
**Current Phase**: Phase 4 - Source Maps & Debugging

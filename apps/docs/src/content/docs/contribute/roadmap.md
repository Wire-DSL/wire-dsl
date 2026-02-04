---
title: Development Roadmap
description: Wire-DSL feature roadmap and development phases
---

This document outlines the development phases of Wire-DSL from MVP through advanced features.

---

## Vision

Wire-DSL is actively maintained with a clear evolution path. This roadmap describes planned features and the project's direction.

---

## Phase 1: Core MVP ✅ COMPLETE

**Goal**: Create functional base with DSL parser, IR generation, layout engine, and renderer.

**Status**: Fully implemented and stable.

### Deliverables ✅

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

## Phase 2: Theme System & Design Tokens ✅ COMPLETE

**Goal**: Implement theme tokens for visual consistency.

**Status**: Fully implemented and integrated.

### Deliverables ✅

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

## Phase 3: Advanced Exporters 🚀 PLANNED

**Goal**: Generate code and designs in multiple formats.

### Deliverables

**HTML Exporter**
- [ ] Semantic HTML generation
- [ ] CSS layout styling
- [ ] Accessibility (ARIA) support
- [ ] Responsive design output

**React Exporter**
- [ ] React component generation
- [ ] Props interface generation
- [ ] Component composition preservation
- [ ] Styled components or CSS-in-JS output

**Vue Exporter**
- [ ] Vue component generation
- [ ] Template structure preservation
- [ ] Component binding patterns

**Figma Exporter**
- [ ] Convert to Figma components
- [ ] Design system structure
- [ ] Layout fidelity preservation

---

## Phase 4: AI-Assisted Wireframing 🚀 PLANNED

**Goal**: LLM integration for automatic wireframe generation.

### Deliverables

**LLM Integration**
- [ ] OpenAI/Claude API integration
- [ ] Prompt optimization for wire-dsl output
- [ ] Iterative refinement workflow

**AI Studio Interface**
- [ ] Web-based UI for AI wireframing
- [ ] Real-time preview during generation
- [ ] Design system constraint checking

**Context-Aware Generation**
- [ ] Learn from existing wireframes
- [ ] Component reuse suggestions
- [ ] Design pattern recommendations

---

## Phase 5: VS Code Extension 🎯 ACTIVE

**Goal**: Professional IDE support for Wire-DSL development.

### Implemented Features ✅
- ✅ Syntax highlighting
- ✅ Real-time error detection
- ✅ Component intellisense
- ✅ Document formatting
- ✅ File icons

### Planned Enhancements 🔄
- [ ] Code snippet library
- [ ] Go-to-definition navigation
- [ ] Auto-complete for component properties
- [ ] Live preview pane
- [ ] Refactoring tools
- [ ] Performance metrics

---

## Phase 6: Advanced Language Features 🚀 PLANNED

**Goal**: Support dynamic and interactive wireframing.

### Features

**Component Parameters**
- [ ] Props/parameters for custom components
- [ ] Default parameter values
- [ ] Type system for parameters

**Conditional Rendering**
- [ ] If/else block support
- [ ] Dynamic property values
- [ ] State management basics

**Data Binding**
- [ ] Template variables
- [ ] Data source integration
- [ ] Dynamic list rendering

**Event Handling**
- [ ] Click event support
- [ ] Form submission handling
- [ ] State transitions

---

## Phase 7: Plugin System 🚀 FUTURE

**Goal**: Allow community extensions and custom components.

### Features

**Component Plugins**
- [ ] Custom component registration
- [ ] Plugin lifecycle hooks
- [ ] Plugin marketplace/registry

**Exporter Plugins**
- [ ] Custom exporter development
- [ ] Third-party tool integrations

**Language Extensions**
- [ ] Custom DSL extensions
- [ ] Domain-specific plugins

---

## Phase 8: v1.0 Release 🎉 TARGET

**Goal**: Production-ready Wire-DSL with comprehensive tooling.

### Release Criteria
- [ ] All core features polished and tested
- [ ] Documentation complete (English)
- [ ] Community feedback integration
- [ ] Performance optimizations
- [ ] Backwards compatibility guarantee
- [ ] Security review complete
- [ ] CLI stability guaranteed

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
- ✅ VS Code syntax highlighting

### What's Next
- 🔄 Advanced HTML/React exporters
- 🔄 AI-assisted generation
- 🔄 Enhanced VS Code extension
- 🔄 Community testing and feedback

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

**Last Updated**: January 2026  
**Maintenance Status**: Active  
**Next Milestone**: Advanced Exporters (HTML, React, Vue, Figma)

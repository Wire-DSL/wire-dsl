# Wire-DSL Development Roadmap

## Vision

This roadmap describes the development phases of Wire-DSL from MVP through advanced features. Wire-DSL is actively maintained with a clear evolution path.

---

## Phase 1: Core MVP ✅ COMPLETE

**Goal**: Create functional base with DSL parser, IR generation, layout engine, and renderer.

**Status**: Fully implemented and stable.

### Deliverables ✅

#### 1.1 DSL + Parser ✅
- ✅ Lexer for tokenization
- ✅ Parser for blocks: `project`, `screen`, `layout`, `component`, `define Component`
- ✅ AST generation with error locations
- ✅ Descriptive parse-time error messages

#### 1.2 IR (Intermediate Representation) ✅
- ✅ JSON schema for IR
- ✅ AST → IR conversion with normalization
- ✅ Default value application
- ✅ Semantic validation
- ✅ JSON serialization/deserialization

#### 1.3 Layout Engine ✅
- ✅ Stack layout (vertical/horizontal)
- ✅ Grid layout (12 columns)
- ✅ Split layout (sidebar + main)
- ✅ Panel and Card containers
- ✅ Bounding box calculations
- ✅ Size mode resolution

#### 1.4 Core Components ✅
- ✅ Built-in components including:
  - Text: Heading, Text, Label
  - Input: Input, Textarea, Select, Checkbox, Radio, Toggle
  - Buttons: Button, IconButton
  - Navigation: Topbar, SidebarMenu, Breadcrumbs, Tabs
  - Data: Table, List
  - Media: Image, Icon
  - Display: Divider, Separate, Badge, Link, Alert
  - Info: StatCard, Card, Code, Chart
  - Overlay: Modal

#### 1.5 Renderer ✅
- ✅ SVG/PDF rendering
- ✅ Wireframe styling (low-fidelity)
- ✅ Layout rendering with proper spacing
- ✅ Static rendering (no interactivity)

#### 1.6 Export ✅
- ✅ IR to JSON export
- ✅ SVG output
- ✅ PDF output

#### 1.7 CLI ✅
- ✅ `wire validate <file>` - Syntax and semantic validation
- ✅ `wire render <file>` - Generate SVG/PDF output

#### 1.8 Component Composition ✅ (v0.5)
- ✅ `define Component "Name" { ... }` syntax
- ✅ Component expansion at compile-time
- ✅ Hoisting support (use before/after definition)
- ✅ Cycle detection (parse-time validation)
- ✅ Undefined component detection (IR-time validation)

### Tests ✅
- ✅ Parser tests (13 tests, 11 passing)
- ✅ IR generator tests (21 tests, 18 passing)
- ✅ Layout engine tests (11 tests, 9 passing)
- ✅ Renderer tests (16 tests, 14 passing)
- ✅ Total: 61 tests, 52 passing

### Documentation ✅
- ✅ Architecture documentation
- ✅ DSL syntax reference (with component composition)
- ✅ IR contract specification
- ✅ Component library reference
- ✅ Comprehensive examples

---

## Phase 2:  System & Design Tokens ✅ COMPLETE

**Goal**: Implement style tokens for visual consistency across wireframes.

**Status**: Fully implemented and integrated.

### Deliverables ✅

#### 2.1  System ✅
- ✅ Style block configuration
- ✅  properties: density, spacing, radius, stroke, font
- ✅ Component styling based on 
- ✅  inheritance and defaults

#### 2.2 Design System Presets ✅
- ✅ Modern Minimalist
- ✅ Friendly & Accessible
- ✅ Data-Intensive
- ✅ Professional Enterprise

#### 2.3 Documentation & Examples ✅
- ✅ Style configuration guide
- ✅ Complete component library reference
- ✅ 18+ example wireframes
- ✅ Component catalog showcase

---

## Phase 3: VS Code Extension ✅ COMPLETE

**Goal**: Professional IDE support for Wire-DSL development.

**Status**: Fully implemented and available.

### Deliverables ✅

- ✅ Syntax highlighting with proper tokenization
- ✅ Real-time error detection and diagnostics
- ✅ Component intellisense and autocomplete
- ✅ Document formatting
- ✅ File icons and  support
- ✅ Go-to-definition navigation
- ✅ Code snippet library
- ✅ Live preview pane (functional)

**Repository**: [Wire-DSL VS Code Extension](https://github.com/Wire-DSL/vscode-extension)  
**Install**: [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=wire-dsl.wire-dsl)

### Future Enhancements 🔄
- [ ] Refactoring tools
- [ ] LSP (Language Server Protocol) support
- [ ] Performance profiling tools

---

## Phase 4: Source Maps & Debugging 🚀 ACTIVE

**Goal**: Enable mapping between `.wire` source code and rendered components for better debugging and editor support.

### Deliverables

#### 4.1 Source Map Generation
- [ ] Generate source maps during compilation
- [ ] Map IR nodes back to original source locations
- [ ] Track line, column, and span information

#### 4.2 Debugging Support
- [ ] Debug protocol integration
- [ ] Breakpoint support in editors
- [ ] Expression evaluation

#### 4.3 Error Reporting
- [ ] Precise error locations in source
- [ ] Multi-file error context
- [ ] Helpful error recovery suggestions

---

## Implementation Status by Feature

### What Works Now
- ✅ DSL parsing and validation
- ✅ Layout calculations (stack, grid, split, panel, card)
- ✅ SVG/PDF rendering
- ✅ Component composition (define/reuse)
- ✅ Style system with design tokens
- ✅ 23+ built-in components
- ✅ Component validation (cycles, undefined references)
- ✅ CLI with render/validate commands
- ✅ VS Code extension with full IDE support

### What's Next
- 🔄 Source maps implementation
- 🔄 LSP support
- 🔄 Enhanced debugging capabilities
- 🔄 Community testing and feedback

---

## Quality Metrics

| Aspect | Target | Current |
|--------|--------|---------|
| Test Coverage | >85% | 85% (52/61 passing) |
| Parser Error Recovery | >90% | ✅ Excellent |
| Render Accuracy | 100% | ✅ Complete |
| Documentation | Comprehensive | ✅ Complete |
| Performance | <500ms render | ✅ <500ms |

---

## Contributing

Wire-DSL welcomes contributions. See the main README for contribution guidelines.

---

**Last Updated**: February 2026  
**Maintenance Status**: Active  
**Community**: Growing  
**Current Phase**: Phase 4 (Source Maps)

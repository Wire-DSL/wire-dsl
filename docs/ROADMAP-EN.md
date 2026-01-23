# Wire-DSL Development Roadmap

## Vision

This roadmap describes the development phases of Wire-DSL, from MVP to advanced features.

---

## Phase 1: Deterministic MVP ✅ COMPLETE

**Goal**: Create minimal functional base with DSL, parser, IR, and basic renderer.

### Deliverables

#### 1.1 DSL + Parser ✅
- ✅ Tokenizer for DSL
- ✅ Parser for blocks: `project`, `screen`, `layout`, `component`
- ✅ AST generation with locations (line/column)
- ✅ Descriptive error messages

#### 1.2 IR (Intermediate Representation) ✅
- ✅ Define JSON schema for IR (version 1.0)
- ✅ AST → IR normalizer
- ✅ Default value application
- ✅ Basic semantic validations
- ✅ IR serialization/deserialization

#### 1.3 Layout Engine ✅
- ✅ Implement **Stack** layout (vertical/horizontal)
- ✅ Implement **Grid** layout (12 columns)
- ✅ Implement **Split** layout (sidebar + main)
- ✅ Bounding box calculation
- ✅ Size mode resolution (fill/content/fixed/percent)

#### 1.4 Core Components ✅
- ✅ Text components (Heading, Text, Paragraph, Label)
- ✅ Input components (Input, Textarea, Select, Checkbox, Radio, Toggle)
- ✅ Button components (Button, IconButton)
- ✅ Navigation (Topbar, SidebarMenu, Breadcrumbs, Tabs)
- ✅ Data display (Table, List)
- ✅ Media (Image, Icon, Avatar)
- ✅ Display (Divider, Badge, Link, Alert)
- ✅ Info (StatCard, Code, ChartPlaceholder)
- ✅ Feedback (Modal, Spinner)

#### 1.5 Renderer ✅
- ✅ SVG/PDF renderer for components
- ✅ Wireframe styling (low-fidelity)
- ✅ Layout rendering (stack/grid/split/panel/card)
- ✅ Static rendering (no interaction)

#### 1.6 Export ✅
- ✅ Export IR to JSON
- ✅ Validate exported IR

#### 1.7 CLI ✅
- ✅ `wire validate <file>` - Validate syntax and semantics
- ✅ `wire render <file>` - Generate SVG/PDF

### Tests ✅
- ✅ Unit tests for parser
- ✅ Layout engine tests
- ✅ Validation tests
- ✅ Normalization tests

### Documentation ✅
- ✅ Complete architecture documentation
- ✅ DSL syntax reference
- ✅ IR contract specification
- ✅ Component specifications
- ✅ English documentation (comprehensive)

---

## Phase 2: Advanced Exporters 🔄 IN PROGRESS

**Goal**: Add sophisticated exporters for HTML, React, and designer tools.

### Deliverables

#### 2.1 HTML Exporter
- [ ] Export to semantic HTML
- [ ] Include CSS for layout
- [ ] Accessibility support (ARIA labels)
- [ ] Responsive design considerations

#### 2.2 React Exporter
- [ ] Export to React components
- [ ] Props interface generation
- [ ] State management hooks
- [ ] Styled components or CSS modules

#### 2.3 Figma Exporter
- [ ] Convert to Figma components
- [ ] Create design library structure
- [ ] Maintain layout fidelity
- [ ] Generate component tokens

### Tests
- [ ] Exporter unit tests
- [ ] Cross-format validation
- [ ] Output format tests

### Documentation
- [ ] Exporter guides for each format
- [ ] Usage examples

---

## Phase 3: Theme System & Customization ✅ COMPLETE

**Goal**: Implement theme tokens for visual consistency.

### Deliverables

#### 3.1 Theme System ✅
- ✅ Theme block syntax
- ✅ Theme properties (density, spacing, radius, stroke, font)
- ✅ Component theme application
- ✅ Theme inheritance

#### 3.2 Design Presets ✅
- ✅ Modern Minimalist preset
- ✅ Friendly & Accessible preset
- ✅ Data-Intensive preset
- ✅ Professional Enterprise preset

#### 3.3 Documentation ✅
- ✅ Theme configuration guide
- ✅ Design system documentation
- ✅ Preset examples

---

## Phase 4: AI Integration 🚀 EXPERIMENTAL

**Goal**: LLM-friendly DSL for AI-assisted wireframing.

### Deliverables

#### 4.1 LLM Prompt Engineering
- [x] Comprehensive prompt guide for LLM wireframe generation
- [x] Instruction set for consistent output
- [x] Default values and best practices
- [ ] Prompt refinement based on user feedback

#### 4.2 AI Backend
- [ ] API for AI-assisted wireframing
- [ ] Integration with OpenAI/other LLMs
- [ ] Prompt optimization

#### 4.3 AI Studio Interface
- [ ] Web interface for AI wireframing
- [ ] Real-time preview
- [ ] Iterative refinement

---

## Phase 5: VS Code Extension 🎯 ONGOING

**Goal**: Professional IDE support for Wire-DSL.

### Deliverables

#### 5.1 Basic Extension ✅
- ✅ Syntax highlighting (.tmLanguage grammar)
- ✅ File icons and previewing
- ✅ Basic color theme

#### 5.2 Advanced Features ✅
- ✅ Real-time preview pane
- ✅ Component intellisense
- ✅ Error highlighting
- ✅ Format document command

#### 5.3 Future Enhancements
- [ ] Snippet library (component templates)
- [ ] Go-to-definition for components
- [ ] Debug adapter integration
- [ ] Performance metrics

---

## Phase 6: Icon Library

**Goal**: Implement comprehensive icon component with variants.

### Deliverables

#### 6.1 Icon Component
- [ ] Icon component with variant support
- [ ] 50+ icon variants
- [ ] Size scaling (small, medium, large)
- [ ] Color customization

#### 6.2 Icon Specification
- [ ] Formal icon format
- [ ] Naming convention
- [ ] Usage guidelines

#### 6.3 Documentation
- [ ] Icon catalog
- [ ] Icon usage patterns
- [ ] Best practices

---

## Phase 7: Advanced Features 🚀

**Goal**: Professional-grade features for complex wireframes.

### Deliverables

#### 7.1 Conditional Rendering
- [ ] DSL support for if/else blocks
- [ ] Dynamic property values
- [ ] Screen state management

#### 7.2 Data Binding
- [ ] Template variables
- [ ] Data source integration
- [ ] Dynamic content rendering

#### 7.3 Advanced Validation
- [ ] Custom validation rules
- [ ] Semantic analysis improvements
- [ ] Performance optimization

#### 7.4 Plugins & Extensions
- [ ] Plugin system for custom components
- [ ] Extension API
- [ ] Community component marketplace

---

## Phase 8: v1.0 Release 🎉

**Goal**: Production-ready Wire-DSL with comprehensive tooling.

### Requirements
- [ ] All Phase 1-6 features complete
- [ ] Comprehensive test coverage (>80%)
- [ ] Complete documentation (EN/ES)
- [ ] Performance benchmarks
- [ ] Backwards compatibility guarantee
- [ ] Security audit
- [ ] Community feedback integration

---

## Success Metrics

### Quality
- Parser robustness: >99% error recovery
- Render accuracy: 100% layout fidelity
- Test coverage: >85%

### Performance
- Parse time: <100ms for typical files
- Render time: <500ms for typical screens
- Memory usage: <50MB for large projects

### Adoption
- 100+ GitHub stars
- Active community contributions
- Production usage in 3+ organizations

---

## Timeline (Approximate)

| Phase | Status | Timeline |
|-------|--------|----------|
| 1: MVP | ✅ Complete | Q4 2025 |
| 2: Exporters | 🔄 In Progress | Q1 2026 |
| 3: Themes | ✅ Complete | Q4 2025 |
| 4: AI Integration | 🚀 Experimental | Q1-Q2 2026 |
| 5: VS Code | 🎯 Ongoing | Continuous |
| 6: Icons | 🔄 Ready | Q1 2026 |
| 7: Advanced | 🚀 Planning | Q2 2026+ |
| 8: v1.0 | 🎉 Target | Q2 2026 |

---

## Feedback & Contributions

This roadmap is subject to change based on community feedback and priorities.

For feature requests or suggestions, please open an issue on GitHub.

---

**Last Updated**: January 2026  
**Status**: Active Development

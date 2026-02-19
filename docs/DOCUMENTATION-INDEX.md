# Wire-DSL Documentation Index

Welcome to the comprehensive English documentation for Wire-DSL. This guide covers all aspects of the domain-specific language for creating interactive wireframes.

---

## Quick Start

New to Wire-DSL? Start here:

1. **[DSL Syntax Guide](DSL-SYNTAX.md)** - Learn the basic syntax and structure
2. **[Components Reference](COMPONENTS-REFERENCE.md)** - Explore all available components
3. **[Icons Guide](ICONS-GUIDE.md)** - Use Feather Icons in your wireframes
4. **[Containers Reference](CONTAINERS-REFERENCE.md)** - Understand layout containers
5. **[Config Guide](CONFIG-GUIDE.md)** - Configure visual consistency

---

## Core Documentation

### [DSL Syntax Guide](DSL-SYNTAX.md)
The authoritative reference for Wire-DSL syntax, including:
- Project structure
- Screen definition
- Layout syntax
- Component declarations
- Style configuration
- Complete examples
- Validation rules

**Best for**: Understanding the language structure and grammar

---

### [Components Reference](COMPONENTS-REFERENCE.md)
Complete catalog of all component types with:
- **Text Components**: Heading, Text, Label
- **Input Components**: Input, Textarea, Select, Checkbox, Radio, Toggle
- **Button Components**: Button, IconButton
- **Navigation**: Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs
- **Data Display**: Table, List
- **Media**: Image, Icon
- **Display Elements**: Divider, Separate, Badge, Link, Alert
- **Information**: StatCard, Card, Code, Chart
- **Overlay**: Modal

Each component includes:
- Property definitions
- Usage examples
- Rendering specifications
- Best practices

**Best for**: Finding the right component and learning its usage

---

### [Icons Guide](ICONS-GUIDE.md)
Comprehensive guide to using Feather Icons in Wire-DSL:
- `Icon` component for displaying icons
- `IconButton` component for interactive icon buttons
- Complete list of 287 available icons (Feather Icons v4.29.0)
- Usage examples and best practices
- Icon variants and customization
- Styling and configuration

**Best for**: Integrating professional icons and creating icon-based UI

---

### [Containers Reference](CONTAINERS-REFERENCE.md)
Complete guide to layout containers (Stack, Grid, Split, Panel, Card):
- Purpose and use cases
- Property definitions
- Real-world examples
- Common patterns
- Best practices
- Performance considerations

Each container type includes:
- Detailed syntax
- Property specifications
- Multiple examples
- Important notes

**Best for**: Building complex layouts and understanding composition

---

### [Config Guide](CONFIG-GUIDE.md)
Complete style system documentation:
- Style block syntax
- Style properties (density, spacing, radius, stroke, font)
- Impact on components
- Design presets
- Real-world examples
- Migration guide
- Troubleshooting

**Best for**: Establishing visual consistency and choosing design direction

---

### [SourceMap Guide](SOURCEMAP-GUIDE.md)
Complete guide to the SourceMap system for bidirectional code↔canvas selection:
- Quick start and basic usage
- Semantic node IDs
- SourceMapResolver API reference
- Click in editor → highlight canvas
- Click on canvas → jump to code
- Property-level selection
- Navigation and queries
- Performance optimization
- Integration patterns (Web editor, VS Code)
- Best practices and troubleshooting

**Best for**: Building interactive editors with code-to-canvas synchronization

---

## Architecture

### Project Structure
```
project "Name" {
  style { ... }          // Visual consistency tokens
  
  screen Screen1 { ... } // Page/view definition
  screen Screen2 { ... }
}
```

### Layout Hierarchy
```
Project
├── Style block (global design tokens)
└── Screens
    ├── Stack/Grid/Split/Panel/Card
    │   ├── Components
    │   └── Nested layouts
    └── ...
```

---

## Component Categories

### By Type

| Category | Components | Use Case |
|----------|-----------|----------|
| **Text** | Heading, Text, Label | Content display |
| **Input** | Input, Textarea, Select, Checkbox, Radio, Toggle | Form inputs |
| **Button** | Button, IconButton | Actions |
| **Navigation** | Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs | Navigation |
| **Data** | Table, List | Data display |
| **Media** | Image, Icon | Visual content |
| **Display** | Divider, Separate, Badge, Link, Alert | Visual elements |
| **Overlay** | Modal | Dialog overlays |
| **Info** | StatCard, Card, Code, Chart | Information placeholders |

### Total: 30 Components

---

## Layout Containers

| Container | Structure | Use Case |
|-----------|-----------|----------|
| **Stack** | Linear (V/H) | Sequential layout |
| **Grid** | 12-column | Responsive grid |
| **Split** | 2-panel | Sidebar + content |
| **Panel** | Bordered box | Grouped content |
| **Card** | Flexible box | Self-contained items |

---

## Key Concepts

### Style System
Defines visual consistency through tokens:
- `density`: UI compactness (compact, normal, comfortable)
- `spacing`: Default gaps (xs, sm, md, lg, xl)
- `radius`: Border roundness (none, sm, md, lg, full)
- `stroke`: Border width (thin, normal, thick)
- `font`: Typography scale (sm, base, lg)

### Component Properties
Standard property types:
- **String**: Text values (`"title"`, `"primary"`)
- **Number**: Numeric values (4, 200, 12)
- **Boolean**: True/false values
- **CSV List**: Comma-separated values

### Layout Properties
Common properties across containers:
- `gap`: Spacing between children
- `padding`: Internal spacing
- `direction`: Layout direction (horizontal/vertical)
- `span`: Column span in grid
- `align`: Content alignment

### Custom Definitions
- `define Component "PascalCaseName"` for reusable components
- `define Layout "lower_case_name"` for reusable layout shells with one `Children` slot
- `prop_*` values inside definitions become dynamic bindings resolved from invocation args
- Missing required bindings are errors; missing optional bindings are warnings

---

## Syntax Quick Reference

### Project Definition
```
project "Name" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  screen ScreenName { ... }
}
```

### Layout Syntax
```
layout stack(direction: vertical, gap: md, padding: lg) { ... }
layout grid(columns: 12, gap: md) { ... }
layout split(sidebar: 260, gap: md) { ... }
layout panel(padding: md) { ... }
layout card(padding: lg, gap: md, radius: md) { ... }
```

### Component Syntax
```
component Button text: "Save" variant: primary
component Input label: "Email" placeholder: "you@example.com"
component Table columns: "Name,Email,Status" rows: 8
```

### Custom Definition Syntax
```
define Component "MyMenu" {
  component SidebarMenu
    active: prop_active
}

define Layout "screen_default" {
  layout split(sidebar: prop_sidebar) {
    component Children
  }
}
```

---

## Common Patterns

### Form Layout
```
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Form Title"
  component Input label: "Field 1"
  component Input label: "Field 2"
  layout stack(direction: horizontal, gap: md) {
    component Button text: "Submit" variant: primary
    component Button text: "Cancel" variant: secondary
  }
}
```

### Dashboard
```
layout split(sidebar: 260, gap: md) {
  // Sidebar
  layout stack { ... }
  // Main content
  layout stack {
    layout grid(columns: 12, gap: md) { ... }
    component Table { ... }
  }
}
```

### Card Grid
```
layout grid(columns: 12, gap: md) {
  cell span: 4 {
    layout card { ... }
  }
  // Repeat for each card
}
```

---

## Design Principles

### 1. Wireframing First
Focus on structure and layout, not aesthetic details.

### 2. Composability
Build complex interfaces from simple, reusable elements.

### 3. Consistency
Use style tokens to ensure visual consistency across the project.

### 4. Simplicity
Minimal syntax with maximum expressiveness.

### 5. Clarity
Property names match common UI terminology.

---

## Validation & Constraints

**Required Elements**:
- Every project must have at least one screen
- Every screen must have exactly one root layout
- Style block is optional at project level (defaults are applied when omitted)

**Layout Rules**:
- Stack: Multiple children
- Grid: Multiple cells
- Split: Exactly 2 children
- Panel: Single child
- Card: Multiple children
- Defined layout: Exactly 1 `component Children` placeholder and exactly 1 child at invocation

**Naming Constraints**:
- Screen names must be unique
- identifiers are case-sensitive
- No special characters in names
- `define Layout` names must match `^[a-z][a-z0-9_]*$`

---

## Code Examples

### Complete Dashboard Example
See [DSL-SYNTAX.md - Complete Example](DSL-SYNTAX.md#complete-example)

### Product Card Example
See [CONTAINERS-REFERENCE.md - Card Container Examples](CONTAINERS-REFERENCE.md#examples-5)

### Form Pattern
See [COMPONENTS-REFERENCE.md - Usage Patterns](COMPONENTS-REFERENCE.md#usage-patterns)

---

## Glossary

**Component**: Individual wireframe element (Button, Input, Table, etc.)

**Container**: Layout structure organizing child elements (Stack, Grid, Card, etc.)

**Property**: Configuration attribute of a component or container

**Style block**: Collection of design tokens defining visual consistency

**Screen**: Complete page/view in the wireframe

**Layout**: Structural container organizing elements

**Cell**: Column unit in a Grid layout

**Gap**: Spacing between child elements

**Padding**: Internal spacing within a container

---

## Troubleshooting & FAQ

### Syntax Issues

**Q: Getting parse errors?**  
A: Check for missing colons between property names and values. Use quotes around all string values.

**Q: Properties not recognized?**  
A: Ensure you're using correct property names. See [Components Reference](COMPONENTS-REFERENCE.md) for valid properties.

**Q: Layout not displaying?**  
A: Every screen must have exactly one root layout. Check nesting.

### Styling Issues

**Q: Style block not being applied?**  
A: Ensure style block is at project level, not inside a screen.

**Q: Spacing looks wrong?**  
A: `style.spacing` defines default spacing. Explicit layout properties override it.

**Q: Colors not showing?**  
A: Wire-DSL uses standard color tokens. See [Config Guide](CONFIG-GUIDE.md).

---

## File Organization

Key documentation files:

```
docs/
├── DSL-SYNTAX.md           # Main syntax reference
├── COMPONENTS-REFERENCE.md    # All components
├── CONTAINERS-REFERENCE.md    # All 5 container types
├── CONFIG-GUIDE.md       # Style system
├── DOCUMENTATION-INDEX.md     # This file
└── examples/                  # Example files
    └── *.wire                 # Sample wireframes
```

---

## Next Steps

1. **Read** [DSL-SYNTAX.md](DSL-SYNTAX.md) for language syntax
2. **Explore** [COMPONENTS-REFERENCE.md](COMPONENTS-REFERENCE.md) for available components
3. **Learn** [CONTAINERS-REFERENCE.md](CONTAINERS-REFERENCE.md) for layout patterns
4. **Discover** [CONFIG-GUIDE.md](CONFIG-GUIDE.md) for design consistency
5. **Create** your own wireframes!

---

## Getting Help

- Check the relevant reference document for your topic
- Review examples in the corresponding documentation
- Look at example `.wire` files in the examples folder
- Verify syntax follows the patterns shown in this index

---

## Document Version

**Language**: English  
**Last Updated**: January 2026  
**Status**: Complete & Comprehensive

---

## Additional Resources

- **Parser Grammar**: See `packages/engine/src/parser/index.ts`
- **IR Specification**: See `packages/engine/src/ir/index.ts`
- **Renderer Logic**: See `packages/engine/src/renderer/index.ts`
- **VS Code Extension**: See `packages/language-support/`

---

**Welcome to Wire-DSL! Happy wireframing! 🎨**

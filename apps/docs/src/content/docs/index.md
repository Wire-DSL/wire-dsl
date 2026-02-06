---
title: Wire-DSL Documentation
description: Complete guide to the Wire-DSL declarative wireframing language
template: splash
hero:
  tagline: Build wireframes with code, not clicks
  actions:
    - text: Get Started
      link: /getting-started/installation/
      icon: right-arrow
    - text: Learn the Language
      link: /language/syntax/
      variant: minimal
      icon: open-book
    - text: Preview Online
      link: https://live.wire-dsl.org
      variant: minimal
      icon: external
---

## What is Wire-DSL?

Wire-DSL is a **declarative, block-based domain-specific language (DSL)** for creating interactive wireframes using code instead of visual tools.

Instead of dragging components in a design tool, you write clean, readable code:

<!-- wire-preview:start -->
```wire
project "Login App" {
  theme { density: "comfortable" }
  
  screen LoginScreen {
    layout card(padding: lg, gap: md, radius: md, border: true) {
      component Heading text: "Welcome"
      component Input label: "Email"
      component Input label: "Password"
      component Button text: "Sign In" variant: primary
    }
  }
}
```
<!-- wire-preview:end -->

Render it instantly to SVG, PNG, or PDF.

---

## Why Wire-DSL?

- **Code-First Workflow** – Version control, diff, and collaborate like code
- **28 Built-In Components** – Buttons, forms, tables, navigation, more
- **5 Layout Types** – Stack, Grid, Split, Panel, Card with intelligent spacing
- **Design Tokens** – Consistent theming across wireframes
- **Instant Rendering** – SVG, PNG, PDF exports
- **AI-Friendly** – Generate wireframes from natural language
- **Accessible** – Built-in accessibility best practices

---

## Quick Start

### Installation (30 seconds)
```bash
npm install -g @wire-dsl/cli
wire render myfile.wire output.svg
```

### Your First Wireframe
```wire
project "Hello" {
  theme { density: "normal" spacing: "md" }
  
  screen Home {
    layout stack(padding: lg) {
      component Heading text: "Hello World"
    }
  }
}
```

**→ [Complete Getting Started Guide](./getting-started/installation)**

---

## Core Sections

### 🚀 [Getting Started](./getting-started/installation)
- Installation and setup
- Your first wireframe
- Web editor preview
- Common patterns

### 📚 [Language Guide](./language/syntax)
- Complete DSL syntax
- All components
- Layout containers
- Theme system
- Icons & styling

### 🏗️ [Architecture](./architecture/overview)
- System design (7-layer pipeline)
- IR format specification
- Layout engine algorithms
- Validation rules

### 💡 [Examples](./examples/)
- 20+ example files
- Dashboard, forms, cards
- Learning paths

### 🛠️ [Tooling](./tooling/cli)
- CLI reference
- Web editor
- LLM prompting guide

### 🤝 [Contributing](./contribute/development)
- Development setup
- Code quality standards
- Contribution workflow
- Project roadmap

---

## 28 Components

| Category | Components |
|----------|------------|
| **Text** | Heading, Text, Label |
| **Input** | Input, Textarea, Select, Checkbox, Radio, Toggle |
| **Buttons** | Button, IconButton |
| **Navigation** | Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs |
| **Data** | Table, List |
| **Media** | Image, Icon |
| **Display** | Divider, Badge, Alert |
| **Information** | StatCard, Code, ChartPlaceholder |
| **Modal & Overlay** | Modal |
| **Loading & Feedback** | Spinner |

---

## 5 Layout Containers

- **Stack** – Linear vertical/horizontal arrangement
- **Grid** – 12-column responsive grid
- **Split** – Sidebar + main content layout
- **Panel** – Bordered container with padding
- **Card** – Self-contained grouped content

---

## Popular Use Cases

### 📊 Dashboards
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 { component StatCard title: "Users" value: "1,234" }
  cell span: 8 { component Table columns: "ID,Name,Status" rows: 5 }
}
```

### 📋 Forms
```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Heading text: "Signup Form"
  component Input label: "Name" placeholder: "John Doe"
  component Select label: "Country" items: "USA,Canada,Mexico"
  component Checkbox label: "I agree to terms"
  component Button text: "Submit" variant: primary
}
```

### 🎨 Design Systems
```wire
theme {
  density: "comfortable"
  spacing: "lg"
  radius: "lg"
  stroke: "thin"
  font: "base"
}
```

---

## Rendering Options

### Web Editor
- Live preview while coding
- Component reference
- Theme editor
- No installation needed

### CLI
```bash
wire render dashboard.wire output.svg
wire render dashboard.wire output.pdf
wire validate dashboard.wire
```

### Programmatic
```typescript
import { Parser, IRGenerator, SVGRenderer } from '@wire-dsl/engine';

const ir = new Parser(code).parse();
const svg = new SVGRenderer(ir).render();
```

---

## File Format

Wire-DSL files use the `.wire` extension:
```
project-name.wire
screens/
  ├── login.wire
  ├── dashboard.wire
  └── settings.wire
```

---

## Design Philosophy

1. **Declarative** – Describe what, not how
2. **Human-Readable** – Clear syntax, no complexity
3. **Composable** – Build complex UIs from simple blocks
4. **Themeable** – Consistent design across wireframes
5. **Accessible** – Built-in best practices
6. **Fast** – Instant rendering
7. **Versionable** – Works with Git, diff-friendly
8. **AI-Powered** – Generate from natural language with predictable, LLM-friendly syntax

---

## Learning Path

### Beginner (1 hour)
1. [Installation](./getting-started/installation) – 5 min
2. [First Wireframe](./getting-started/first-wire) – 15 min
3. [Web Preview](./getting-started/web-preview) – 10 min
4. [DSL Syntax](./language/syntax) – 20 min

### Intermediate (2-3 hours)
1. [Components Reference](./language/components) – 1 hour
2. [Containers Guide](./language/containers) – 45 min
3. [Theming](./language/theming) – 45 min
4. [Examples](./examples) – 1 hour

### Advanced (3-5 hours)
1. [Architecture Overview](./architecture/overview) – 1 hour
2. [IR Format](./architecture/ir-format) – 45 min
3. [Layout Engine](./architecture/layout-engine) – 1 hour
4. [Validation Rules](./architecture/validation) – 45 min

---

## Tools & Integration

- **CLI** – Command-line tool for rendering
- **Web Editor** – Browser-based code editor  
- **VS Code Extension** – Syntax highlighting, intellisense
- **LLM Prompting** – Generate from natural language
- **GitHub Integration** – Version control ready

**→ [Tools Documentation](./tooling/cli) | [Web Editor Guide](./tooling/web-editor)**

---

## Community & Support

- 📖 [Documentation Index](https://wire-dsl.org)
- 🐛 [Issues & Bug Reports](https://github.com/wire-dsl/wire-dsl/issues)
- 💬 [Discussions](https://github.com/wire-dsl/wire-dsl/discussions)
- 🤝 [Contributing Guide](./contribute/development)

---

## Next Steps

**Choose your path:**

- **Want to learn?** → [Getting Started](./getting-started/installation)
- **Need reference?** → [Language Guide](./language/syntax)
- **Building something?** → [Examples](./examples)
- **Contributing?** → [Development Guide](./contribute/development)
- **Curious about internals?** → [Architecture](./architecture/overview)

---

## Roadmap

Wire-DSL is actively developed. Current status:

- ✅ Phase 1: Core DSL and rendering (complete)
- ✅ Phase 2: Theme system and design tokens (complete)
- ✅ Phase 3: VS Code Extension (complete)
- 🚀 Phase 4: Source Maps & Debugging (in progress)

**Planned Features**:
- Advanced exporters (HTML, React, Vue, Figma)
- AI-assisted wireframing
- LSP support for universal editor integration

**→ [Full Development Roadmap](./contribute/roadmap)**

---

## License

Wire-DSL is open source. See LICENSE for details.

---

**Last Updated**: January 2026  
**Status**: Active Development  
**Version**: 0.5.0

---
title: Examples
description: Wire-DSL example projects
---

Explore complete, working Wire-DSL examples. All examples are available in the `examples/` folder of the repository.

## Available Examples

### Quick Start

- **[Login Form](../../examples/simple-dashboard.wire)** - Simple login wireframe
- **[Simple Dashboard](../../examples/simple-dashboard.wire)** - Basic dashboard layout

### Dashboards

- **[Admin Dashboard](../../examples/admin-dashboard.wire)** - Full admin interface with sidebar and grid
- **[Analytics Dashboard](../../examples/analytics-dashboard.wire)** - Analytics with charts and metrics
- **[CRM Dashboard](../../examples/crm-dashboard.wire)** - Customer relationship management interface
- **[Simple Multi-Screen](../../examples/simple-multi-screen.wire)** - Multiple screens in one project

### Forms

- **[Form Example](../../examples/form-example.wire)** - Basic form with inputs and buttons
- **[Form 2-Column](../../examples/form-2col-example.wire)** - Two-column form layout

### Components

- **[Card & Stat Demo](../../examples/card-and-stat-card-demo.wire)** - Card container examples
- **[Component Composition Demo](../../examples/component-composition-demo.wire)** - Custom component usage
- **[Components Catalog](../../examples/components-catalog.wire)** - All components displayed
- **[Icon Demo](../../examples/icon-demo-simple.wire)** - Icon and IconButton examples
- **[Icons Demo](../../examples/icons-demo.wire)** - Extended icon examples

### Layouts

- **[Stack Alignment Demo](../../examples/stack-alignment-demo.wire)** - Stack layout alignment options
- **[Panel Example](../../examples/panel-example.wire)** - Panel container examples
- **[Panel Colors Example](../../examples/panel-colors-example.wire)** - Panel styling variations

### Themes

- **[ Test](../../examples/-test.wire)** -  token variations
- **[Topbar Test](../../examples/topbar-test.wire)** - Topbar component styling
- **[Token Background Demo](../../examples/token-background-demo.wire)** -  token effects
- **[Screen Background Demo](../../examples/screen-background-demo.wire)** - Background styling

### Advanced

- **[Admin Dashboard Improved](../../examples/admin-dashboard-improved.wire)** - Enhanced admin dashboard
- **[Admin Dashboard with Icons](../../examples/admin-dashboard-with-icons.wire)** - Dashboard with icon buttons

---

## How to Use Examples

### 1. In the Web Editor

1. Open the web editor: `cd apps/web && pnpm dev`
2. Copy the example code from the file
3. Paste it into the editor
4. See live preview on the right

### 2. With the CLI

Render an example to SVG:
```bash
cd packages/cli
pnpm build
node dist/index.js render ../../examples/admin-dashboard.wire -o dashboard.svg
```

### 3. As a Starting Point

1. Copy an example file
2. Modify it for your needs
3. Use it as a template

---

## Common Patterns

### Dashboard Layout
```wire
layout split(sidebar: 260, gap: md) {
  layout stack(gap: lg, padding: lg) {
    component Topbar title: "Dashboard"
    component SidebarMenu items: "..."
  }
  
  layout stack(gap: md, padding: lg) {
    layout grid(columns: 12, gap: md) {
      cell span: 3 { component StatCard ... }
      cell span: 3 { component StatCard ... }
    }
    
    component Table columns: "..." rows: 10
  }
}
```

### Form Layout
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Form Title"
  
  component Input label: "Field 1"
  component Input label: "Field 2"
  component Textarea label: "Comments" rows: 4
  
  layout stack(direction: horizontal, gap: md, align: "right") {
    component Button text: "Cancel" variant: secondary
    component Button text: "Submit" variant: primary
  }
}
```

### Card Grid
```wire
layout grid(columns: 12, gap: lg, padding: lg) {
  cell span: 4 {
    layout card(padding: lg, gap: md, radius: md) {
      component Image placeholder: "square" height: 200
      component Heading text: "Item"
      component Text content: "Description"
      component Button text: "Action" variant: primary
    }
  }
  // ... repeat for 3 columns
}
```

---

## Learning Path

**New to Wire-DSL?** Follow this learning path:

1. **Start**: [Installation](../getting-started/installation.md)
2. **First Wireframe**: [Create Your First Wireframe](../getting-started/first-wire.md)
3. **Explore**: [Web Editor Guide](../getting-started/web-preview.md)
4. **Learn Syntax**: [DSL Syntax Reference](../language/syntax.md)
5. **Learn Components**: [All 21 Components](../language/components.md)
6. **Master Layouts**: [Containers & Layouts](../language/containers.md)
7. **Study Examples**: The examples in this section
8. **Build Your Own**: Create your own wireframes

---

## Contributing Examples

Have a cool example? Contribute it to the project:

1. Create a `.wire` file with your example
2. Add it to the `examples/` folder
3. Submit a pull request

See [Contributing](../contribute/development.md) for more details.

---

## Example Structure

All examples follow this structure:

```wire
project "Example Name" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ScreenName {
    layout ... {
      // Content here
    }
  }
}
```

This ensures:
- ✅ Valid Wire-DSL syntax
- ✅ Complete style configuration
- ✅ Clear, readable code
- ✅ Useful patterns and practices

---

## Tips for Using Examples

- **Copy & Customize**: Take an example and modify it
- **Mix & Match**: Combine patterns from different examples
- ** Variations**: Try different  values
- **Test Layouts**: Experiment with different layout types
- **Learn Components**: See how components are used in context

---

## Next Steps

- [Components Reference](../language/components.md)
- [Containers & Layouts](../language/containers.md)
- [Configuration](../language/configuration.md)
- [Web Editor Guide](../getting-started/web-preview.md)

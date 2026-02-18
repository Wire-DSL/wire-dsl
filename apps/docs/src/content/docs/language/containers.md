---
title: Containers & Layouts
description: Complete guide to layout containers in Wire-DSL
---

Complete guide to container types (layouts) for organizing content in Wire-DSL wireframes.

---

## Overview

Containers are structural elements that organize and position child components. Wire-DSL provides 5 main container types, each with specific use cases and properties.

| Container | Purpose | Children | Use Case |
|-----------|---------|----------|----------|
| **Stack** | Linear arrangement | Multiple | Vertical/horizontal lists |
| **Grid** | Multi-column layout | Cells | Responsive layouts |
| **Split** | Two-panel layout | Two stacks | Sidebar + content |
| **Panel** | Single bordered container | Single | Grouped content sections |
| **Card** | Flexible content box | Multiple | Product cards, profiles |

---

## Stack Container

Linear layout that stacks children in a single direction with consistent spacing.

### Purpose

Arrange elements vertically or horizontally with uniform spacing. The most common container for building layouts.

### Syntax

```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Text content: "Content"
  component Button text: "Action"
}
```

### Properties

| Property | Type | Options | Default | Description |
|----------|------|---------|---------|-------------|
| `direction` | string | `vertical`, `horizontal` | `vertical` | Stack direction |
| `gap` | string | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Spacing between children |
| `padding` | string | `xs`, `sm`, `md`, `lg`, `xl` | none | Internal padding |
| `align` | string | `justify`, `left`, `center`, `right` | `justify` | Horizontal alignment (horizontal stacks only) |

### Spacing Values

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

### Examples

**Vertical Stack (Default)**:
<!-- wire-preview:start -->
```wire
layout stack(direction: vertical, gap: md) {
  component Heading text: "Form"
  component Input label: "Name"
  component Input label: "Email"
  component Button text: "Submit" variant: primary
}
```
<!-- wire-preview:end -->

**Horizontal Stack with Equal Width (Default)**:
<!-- wire-preview:start -->
```wire
layout stack(direction: horizontal, gap: md, padding: md) {
  component Button text: "Save" variant: primary
  component Button text: "Cancel" variant: secondary
  component Button text: "Delete" variant: danger
}
```
<!-- wire-preview:end -->
All buttons divide the width equally, filling 100% of the container.

**Horizontal Stack - Left Aligned**:
<!-- wire-preview:start -->
```wire
layout stack(direction: horizontal, gap: md, align: "left") {
  component Button text: "Save" variant: primary
  component Button text: "Cancel"
  component Button text: "Reset"
}
```
<!-- wire-preview:end -->
Buttons group on the left with their natural width, useful for left-aligned action bars.

**Horizontal Stack - Center Aligned**:
<!-- wire-preview:start -->
```wire
layout stack(direction: horizontal, gap: md, align: "center") {
  component Button text: "Agree" variant: primary
  component Button text: "Disagree"
}
```
<!-- wire-preview:end -->
Buttons group in the center with their natural width, ideal for dialogs or confirmations.

**Horizontal Stack - Right Aligned**:
<!-- wire-preview:start -->
```wire
layout stack(direction: horizontal, gap: md, align: "right") {
  component Button text: "Back"
  component Button text: "Next" variant: primary
}
```
<!-- wire-preview:end -->
Buttons group on the right with their natural width, typical pattern for form navigation or dialog actions.

### Horizontal Stack Alignment

The `align` property controls how children are distributed horizontally in `direction: horizontal` stacks:

| Value | Behavior | Use Case |
|-------|----------|----------|
| `justify` (default) | Equal width, fills 100% | Standard layouts, button groups |
| `left` | Natural widths, grouped left | Left-aligned action bars |
| `center` | Natural widths, centered | Dialogs, centered confirmations |
| `right` | Natural widths, grouped right | Form navigation, right-aligned actions |

### Important Notes

⚠️ **Padding Inheritance**: Stacks without explicit padding have **0px padding by default** (no inheritance from project style)

⚠️ **Align in Horizontal Stacks Only**: The `align` property only affects `direction: horizontal` stacks.

⚠️ **Nesting**: Avoid excessive nesting of the same layout type; use Grid for multi-column layouts instead

---

## Grid Container

12-column responsive grid system for flexible multi-column layouts.

### Purpose

Create responsive column-based layouts. Ideal for dashboards, data tables, and flexible content arrangements.

### Syntax

```wire
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    component Input label: "Search"
  }
  cell span: 4 align: end {
    component Button text: "Create"
  }
}
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `columns` | number | 12 | Number of columns in grid |
| `gap` | string | `md` | Spacing between cells |

### Cell Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `span` | number | 12 | Columns the cell occupies |
| `align` | string | `start` | Cell alignment (`start`, `center`, `end`) |

### Examples

**Responsive Dashboard**:
<!-- wire-preview:start -->
```wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component StatCard title: "Total Users" value: "1,234"
  }
  cell span: 3 {
    component StatCard title: "Active" value: "890"
  }
  cell span: 3 {
    component StatCard title: "Inactive" value: "344"
  }
  cell span: 3 {
    component StatCard title: "Pending" value: "100"
  }
}
```
<!-- wire-preview:end -->

**Sidebar + Content**:
<!-- wire-preview:start -->
```wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component SidebarMenu items: "Dashboard,Users,Settings"
  }
  cell span: 9 {
    layout stack(gap: md) {
      component Heading text: "Main Content"
      component Text content: "Dashboard content goes here"
    }
  }
}
```
<!-- wire-preview:end -->

**Search + Results**:
<!-- wire-preview:start -->
```wire
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    component Input label: "Search" placeholder: "Search users..."
  }
  cell span: 4 align: end {
    component Select label: "Status" items: "All,Active,Inactive"
  }
}

component Table columns: "Name,Email,Status,Role" rows: 10
```
<!-- wire-preview:end -->

### Important Notes

⚠️ **12-Column System**: All spans reference a 12-column grid for consistency

⚠️ **Gap vs Padding**: Grid `gap` handles spacing between cells; cells have 0px padding by default

⚠️ **Wrapping**: Cells don't wrap automatically; plan your layout accordingly

---

## Split Container

Two-panel layout with fixed sidebar and flexible main content area.

### Purpose

Create sidebar navigation layouts. Ideal for admin dashboards and application shells.

### Syntax

```wire
layout split(sidebar: 260, gap: md) {
  layout stack {
    component SidebarMenu items: "Home,Users,Settings"
  }

  layout stack {
    // Main content here
  }
}
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sidebar` | number | required | Width of left panel (px) |
| `gap` | string | `md` | Spacing between panels |

### Child Structure

Split **requires exactly 2 children**, both typically `stack` layouts:
1. **Left panel**: Usually sidebar navigation
2. **Right panel**: Main content area

### Examples

**Admin Dashboard**:
<!-- wire-preview:start -->
```wire
layout split(sidebar: 260, gap: md) {
  layout stack(padding: lg) {
    component Topbar title: "Dashboard"
    component SidebarMenu items: "Dashboard,Users,Products,Analytics" active: 0
  }

  layout stack(padding: lg) {
    component Heading text: "Dashboard"
    layout grid(columns: 12, gap: md) {
      cell span: 6 {
        component StatCard title: "Total Users" value: "1,234"
      }
      cell span: 6 {
        component StatCard title: "Revenue" value: "$89,012"
      }
    }
  }
}
```
<!-- wire-preview:end -->

**Content Management System**:
<!-- wire-preview:start -->
```wire
layout split(sidebar: 280, gap: lg) {
  layout stack(gap: md, padding: md) {
    component Heading text: "CMS"
    component SidebarMenu items: "Pages,Posts,Media,Settings" active: 1
  }

  layout stack(gap: md, padding: lg) {
    component Breadcrumbs items: "Content,Posts"
    component Table columns: "Title,Author,Date,Status" rows: 8
  }
}
```
<!-- wire-preview:end -->

### Important Notes

⚠️ **Exactly 2 Children**: Split requires exactly 2 child layouts

⚠️ **Fixed Sidebar**: Left panel has fixed width; right panel is flexible

⚠️ **Width Values**: Use pixel values for `sidebar` property (e.g., `260`, `300`, `280`)

---

## Panel Container

Single-child container with automatic padding and border styling.

### Purpose

Group related content with visual separation. Ideal for creating sectioned content areas.

### Syntax

```wire
layout panel(padding: md) {
  component Text content: "Panel content"
}
```

Or with nested stack:

```wire
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Panel Title"
    component Text content: "Panel content"
  }
}
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `padding` | string | `md` | Internal padding |
| `background` | string | white | Background color |

### Examples

**Single Component Panel**:
<!-- wire-preview:start -->
```wire
layout panel(padding: md) {
  component Text content: "Important information goes here"
}
```
<!-- wire-preview:end -->

**Grouped Content**:
<!-- wire-preview:start -->
```wire
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "User Information"
    component Text content: "Name: John Doe"
    component Text content: "Email: john@example.com"
    component Text content: "Role: Administrator"
  }
}
```
<!-- wire-preview:end -->

**Form Section**:
<!-- wire-preview:start -->
```wire
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Contact Details"
    component Input label: "Email"
    component Input label: "Phone"
    component Input label: "Address"
  }
}
```
<!-- wire-preview:end -->

### Important Notes

⚠️ **Single Child Only**: Panel accepts only one child element (stack, grid, component, or card)

⚠️ **Auto Border**: Panel automatically renders with gray border and background

---

## Card Container

Flexible vertical container for grouping related content with automatic styling.

### Purpose

Create self-contained content cards. Ideal for product displays, user profiles, and article previews.

### Syntax

```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image placeholder: "square" height: 250
  component Heading text: "Card Title"
  component Text content: "Card description"
  component Button text: "Action"
}
```

### Properties

| Property | Type | Options | Default | Description |
|----------|------|---------|---------|-------------|
| `padding` | string | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Internal padding |
| `gap` | string | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Spacing between children |
| `radius` | string | `none`, `sm`, `md`, `lg` | `md` | Corner radius |
| `border` | boolean | `true`, `false` | `true` | Show border |

### Radius Values

- `none`: 0px
- `sm`: 2px
- `md`: 4px
- `lg`: 8px

### Examples

**Product Card**:
<!-- wire-preview:start -->
```wire
layout card(padding: md, gap: md, radius: lg, border: true) {
  component Image placeholder: "square" height: 200
  component Heading text: "Premium Laptop"
  component Text content: "High-performance with latest specs"
  component Badge text: "In Stock" variant: success
  layout stack(direction: horizontal, gap: sm, align: justify) {
    component Button text: "Buy" variant: primary block: true
    component Button text: "Details" variant: secondary
  }
}
```
<!-- wire-preview:end -->

**User Profile Card**:
<!-- wire-preview:start -->
```wire
layout card(padding: lg, gap: md, radius: md) {
  component Heading text: "John Doe"
  component Text content: "Senior Software Engineer"
  component Text content: "john@example.com"
  component Divider
  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Message"
    component Button text: "Connect"
  }
}
```
<!-- wire-preview:end -->

**Blog Post Card**:
<!-- wire-preview:start -->
```wire
layout card(padding: md, gap: md, radius: md, border: true) {
  component Image placeholder: "landscape" height: 180
  component Heading text: "Getting Started with Wire-DSL"
  component Text content: "Learn how to create interactive wireframes with Wire-DSL in 5 minutes"
  component Badge text: "Tutorial"
  component Button text: "Read More" block: true
}
```
<!-- wire-preview:end -->

### Important Notes

⚠️ **Automatic Stacking**: Children stack vertically automatically

⚠️ **Dynamic Height**: Card height adjusts based on content

⚠️ **Image Aspect Ratio**: Images within cards maintain proper aspect ratios

---

## User-Defined Layouts

In addition to built-in containers, you can define reusable layout shells:

```wire
define Layout "screen_default" {
  layout split(sidebar: prop_sidebar) {
    component SidebarMenu
      items: "Home,Users,Reports"
      active: prop_active
    component Children
  }
}
```

Usage:

```wire
screen Main {
  layout screen_default(sidebar: 220, active: 1) {
    layout stack(gap: md) {
      component Heading text: "Dashboard"
    }
  }
}
```

Rules:
- `define Layout` name must match `^[a-z][a-z0-9_]*$`
- body must contain a single root `layout`
- body must contain exactly one `component Children`
- each invocation must provide exactly one child block
- `component Children` is invalid outside `define Layout`

`prop_*` bindings in layout params/properties are resolved from invocation args. Missing required args are semantic errors; missing optional args are omitted with warnings.

---

## Best Practices

### Do's

✅ Use Stack for sequential content  
✅ Use Grid for responsive multi-column layouts  
✅ Use Split for navigation + content pattern  
✅ Use Panel for grouped content sections  
✅ Use Card for self-contained items  
✅ Limit nesting depth to 3-4 levels  
✅ Use consistent spacing with style tokens  

### Don'ts

❌ Don't nest the same layout type excessively  
❌ Don't leave containers empty  
❌ Don't use absolute positioning  
❌ Don't mix text and components at same level  
❌ Don't ignore responsive design patterns  

---

## Next Steps

- [All Components](./components.md)
- [Configuration](./configuration.md)
- [DSL Syntax](./syntax.md)

# Containers & Layouts Reference

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

```
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Text text: "Content"
  component Button text: "Action"
}
```

### Properties

| Property | Type | Options | Default | Description |
|----------|------|---------|---------|-------------|
| `direction` | string | `vertical`, `horizontal` | `vertical` | Stack direction |
| `gap` | string | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Spacing between children |
| `padding` | string | `xs`, `sm`, `md`, `lg`, `xl` | none | Internal padding |
| `justify` | string | `stretch`, `start`, `center`, `end`, `spaceBetween`, `spaceAround` | `stretch` | Main-axis distribution (horizontal stacks only) |
| `align` | string | `start`, `center`, `end` | `start` | Cross-axis alignment per child (horizontal stacks only) |

### Spacing Values

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

### Examples

**Vertical Stack (Default)**:
```
layout stack(direction: vertical, gap: md) {
  component Heading text: "Form"
  component Input label: "Name"
  component Input label: "Email"
  component Button text: "Submit" variant: primary
}
```

**Horizontal Stack with Equal Width (Default)**:
```
layout stack(direction: horizontal, gap: md, padding: md) {
  component Button text: "Save" variant: primary
  component Button text: "Cancel" variant: secondary
  component Button text: "Delete" variant: danger
}
```
All buttons divide the width equally, filling 100% of the container.

**Horizontal Stack - Start Aligned**:
```
layout stack(direction: horizontal, gap: md, justify: start) {
  component Button text: "Save" variant: primary
  component Button text: "Cancel"
  component Button text: "Reset"
}
```
Buttons group on the left with their natural width, useful for left-aligned action bars.

**Horizontal Stack - Center Aligned**:
```
layout stack(direction: horizontal, gap: md, justify: center) {
  component Button text: "Agree" variant: primary
  component Button text: "Disagree"
}
```
Buttons group in the center with their natural width, ideal for dialogs or confirmations.

**Horizontal Stack - End Aligned**:
```
layout stack(direction: horizontal, gap: md, justify: end) {
  component Button text: "Back"
  component Button text: "Next" variant: primary
}
```
Buttons group on the right with their natural width, typical pattern for form navigation or dialog actions.

**Horizontal Stack - Space Between**:
```
layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
  component Heading text: "Users"
  component Button text: "New user" variant: primary
}
```
First child is flush left, last child is flush right — the classic toolbar/header pattern.

**Horizontal Stack - Space Around**:
```
layout stack(direction: horizontal, gap: md, justify: spaceAround) {
  component Button text: "Home"
  component Button text: "Profile"
  component Button text: "Settings"
}
```
Equal space wraps each child, commonly used for navigation bars.

**Cross-axis (vertical) alignment with `align`**:
```
layout stack(direction: horizontal, gap: md, justify: spaceBetween, align: center) {
  component Heading text: "Dashboard"
  component Button text: "Settings" icon: "settings"
}
```
Children are vertically centered within the row.

**Icon Alignment Examples**:
```
layout stack(direction: horizontal, gap: 8, justify: start) {
  component Icon icon: "home"
  component Icon icon: "search"
  component Icon icon: "settings"
}

layout stack(direction: horizontal, gap: 8, justify: center) {
  component Icon icon: "heart"
  component Icon icon: "star"
}

layout stack(direction: horizontal, gap: 8, justify: end) {
  component Icon icon: "download"
  component Icon icon: "share"
}
```

**Vertical Stack with Centered Content**:
```
layout stack(direction: vertical, gap: lg, padding: xl) {
  component Heading text: "Welcome"
  component Text text: "Get started with our platform"
  component Button text: "Sign Up" variant: primary
}
```

### Horizontal Stack Layout Control

Two properties control child distribution in `direction: horizontal` stacks, following the CSS Flexbox model:

#### `justify` — Main Axis (horizontal distribution)

| Value | Behavior | Use Case |
|-------|----------|----------|
| `stretch` (default) | Equal width, fills 100% | Button groups, equal columns |
| `start` | Natural widths, grouped left | Left-aligned action bars |
| `center` | Natural widths, centered | Dialogs, centered confirmations |
| `end` | Natural widths, grouped right | Form navigation, right actions |
| `spaceBetween` | First left, last right, space distributed | Toolbar with title + action |
| `spaceAround` | Equal space wraps each child | Navigation bars |

#### `align` — Cross Axis (vertical alignment of children)

| Value | Behavior |
|-------|----------|
| `start` (default) | Children aligned to top of row |
| `center` | Children vertically centered in row |
| `end` | Children aligned to bottom of row |

**Key Behaviors**:
- **`stretch`**: All children get equal width (100% / n). The default "fill container" behavior.
- **`start`, `center`, `end`, `spaceBetween`, `spaceAround`**: Children use their natural intrinsic width. Containers without a calculable width (cards, vertical stacks, panels) act as flex-grow items, sharing the remaining space equally.
- **`align`**: Adjusts the vertical offset of each child within the row height. Requires children to have different heights to be visually noticeable.
- **Gap**: Always applied between children in all `justify` modes.

### Important Notes

⚠️ **Padding Inheritance**: Stacks without explicit padding have **0px padding by default** (no inheritance from project style)

⚠️ **`justify` and `align` in Horizontal Stacks Only**: Both properties only affect `direction: horizontal` stacks. For vertical stacks, use nested containers for alignment needs.

⚠️ **Nesting**: Avoid excessive nesting of the same layout type; use Grid for multi-column layouts instead

⚠️ **Natural Width Calculation**: For `justify` values other than `stretch`, component widths are calculated based on component type and content (e.g., Button text length, Icon size). Explicit `width` properties on components override these calculations. Containers without a calculable intrinsic width (cards, panels, vertical stacks) share the remaining space equally.

---

## Grid Container

12-column responsive grid system for flexible multi-column layouts.

### Purpose

Create responsive column-based layouts. Ideal for dashboards, data tables, and flexible content arrangements.

### Syntax

```
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
```
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component Stat title: "Total Users" value: "1,234"
  }
  cell span: 3 {
    component Stat title: "Active" value: "890"
  }
  cell span: 3 {
    component Stat title: "Inactive" value: "344"
  }
  cell span: 3 {
    component Stat title: "Pending" value: "100"
  }
}
```

**Sidebar + Content**:
```
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component SidebarMenu items: "Dashboard,Users,Settings"
  }
  cell span: 9 {
    layout stack(gap: md) {
      component Heading text: "Main Content"
      component Text text: "Dashboard content goes here"
    }
  }
}
```

**Search + Results**:
```
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

```
layout split(sidebar: 260, gap: md) {
  layout stack {
    component SidebarMenu items: ["Home", "Users", "Settings"]
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
```
layout split(sidebar: 260, gap: md) {
  layout stack(padding: lg) {
    component Topbar title: "Dashboard"
    component SidebarMenu items: "Dashboard,Users,Products,Analytics" active: 0
  }

  layout stack(padding: lg) {
    component Heading text: "Dashboard"
    layout grid(columns: 12, gap: md) {
      cell span: 6 {
        component Stat title: "Total Users" value: "1,234"
      }
      cell span: 6 {
        component Stat title: "Revenue" value: "$89,012"
      }
    }
  }
}
```

**Content Management System**:
```
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

```
layout panel(padding: md) {
  component Text text: "Panel content"
}
```

Or with nested stack:

```
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Panel Title"
    component Text text: "Panel content"
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
```
layout panel(padding: md) {
  component Text text: "Important information goes here"
}
```

**Grouped Content**:
```
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "User Information"
    component Text text: "Name: John Doe"
    component Text text: "Email: john@example.com"
    component Text text: "Role: Administrator"
  }
}
```

**Form Section**:
```
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Contact Details"
    component Input label: "Email"
    component Input label: "Phone"
    component Input label: "Address"
  }
}
```

### Important Notes

⚠️ **Single Child Only**: Panel accepts only one child element (stack, grid, component, or card)

⚠️ **Auto Border**: Panel automatically renders with gray border and background

⚠️ **Content Centering**: Content is centered within the panel

---

## Card Container

Flexible vertical container for grouping related content with automatic styling.

### Purpose

Create self-contained content cards. Ideal for product displays, user profiles, and article previews.

### Syntax

```
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image type: square height: 250
  component Heading text: "Card Title"
  component Text text: "Card description"
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
```
layout card(padding: md, gap: md, radius: lg, border: true) {
  component Image type: square height: 200
  component Heading text: "Premium Laptop"
  component Text text: "High-performance with latest specs"
  component Badge text: "In Stock" variant: success
  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Buy" variant: primary
    component Button text: "Details" variant: secondary
  }
}
```

**User Profile Card**:
```
layout card(padding: lg, gap: md, radius: md) {
  component Image type: square
  component Heading text: "John Doe"
  component Text text: "Senior Software Engineer"
  component Text text: "john@example.com"
  component Divider
  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Message"
    component Button text: "Connect"
  }
}
```

**Blog Post Card**:
```
layout card(padding: md, gap: md, radius: md, border: true) {
  component Image type: landscape height: 180
  component Heading text: "Getting Started with Wire-DSL"
  component Text text: "Learn how to create interactive wireframes with Wire-DSL in 5 minutes"
  component Badge text: "Tutorial"
  component Link text: "Read More"
}
```

**Feature Showcase**:
```
layout card(padding: lg, gap: lg, radius: lg, border: false) {
  component Icon icon: "star"
  component Heading text: "Premium Features"
  component Text text: "Access all premium features with unlimited usage"
  component List items: "Unlimited projects,Team collaboration,Advanced exports,Priority support"
  component Button text: "Upgrade Now" variant: primary
}
```

### Important Notes

⚠️ **Automatic Stacking**: Children stack vertically automatically

⚠️ **Dynamic Height**: Card height adjusts based on content

⚠️ **Image Aspect Ratio**: Images within cards maintain proper aspect ratios

---

## Layout Composition Guide

### Common Patterns

**Full-Width Section**:
```
layout stack(direction: vertical, gap: lg, padding: lg) {
  component Heading text: "Section"
  // Content here
}
```

**Sidebar Navigation**:
```
layout split(sidebar: 260, gap: md) {
  layout stack(gap: md, padding: md) {
    component SidebarMenu items: "..."
  }
  layout stack(gap: md, padding: lg) {
    // Main content
  }
}
```

**Card Grid**:
```
layout grid(columns: 12, gap: md, padding: lg) {
  cell span: 4 {
    layout card { ... }
  }
  cell span: 4 {
    layout card { ... }
  }
  cell span: 4 {
    layout card { ... }
  }
}
```

**Form Layout**:
```
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Form"
    component Input label: "Name"
    component Input label: "Email"
    layout stack(direction: horizontal, gap: md) {
      component Button text: "Submit" variant: primary
      component Button text: "Cancel"
    }
  }
}
```

---

## User-Defined Layouts

Besides built-in containers (`stack`, `grid`, `split`, `panel`, `card`), you can define reusable layouts:

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
- definition body must be one root `layout`
- definition must contain exactly one `component Children`
- each layout invocation must include exactly one child block
- `component Children` cannot be used outside `define Layout`

`prop_*` bindings in layout params/properties are resolved from invocation args. Missing required args produce semantic errors; missing optional args are omitted with warnings.

---

## Best Practices

### Do's ✅

✅ Use Stack for sequential content  
✅ Use Grid for responsive multi-column layouts  
✅ Use Split for navigation + content pattern  
✅ Use Panel for grouped content sections  
✅ Use Card for self-contained items  
✅ Limit nesting depth to 3-4 levels  
✅ Use consistent spacing with style tokens  

### Don'ts ❌

❌ Don't nest the same layout type excessively  
❌ Don't leave containers empty  
❌ Don't use absolute positioning  
❌ Don't mix text and components at same level  
❌ Don't ignore responsive design patterns  
❌ Don't create containers with single empty child  

---

## Migration Guide: Old vs New Syntax

### Stack Layout
```
// Old
layout stack spacing: md gap: lg

// New
layout stack(gap: lg, padding: md)
```

### Grid Layout
```
// Old
layout grid cols: 12 spacing: md

// New
layout grid(columns: 12, gap: md)
```

### Split Layout
```
// Old
layout split left: 260 spacing: md

// New
layout split(sidebar: 260, gap: md)
```

---

## Performance Considerations

- **Nesting Limit**: Keep layout nesting ≤ 5 levels deep
- **Grid Columns**: 12-column system ensures optimal performance
- **Card Sizing**: Cards scale automatically based on content
- **Memory**: Large tables (>50 rows) use mock data efficiently

---

## Next Steps

- [DSL-SYNTAX.md](DSL-SYNTAX.md) - Complete syntax reference
- [COMPONENTS-REFERENCE.md](COMPONENTS-REFERENCE.md) - All component types
- [CONFIG-GUIDE.md](CONFIG-GUIDE.md) - Style configuration

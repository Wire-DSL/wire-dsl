---
title: DSL Syntax
description: Complete Wire-DSL syntax reference
---

Wire-DSL is a declarative language for describing wireframes using a simple block-based syntax. This guide covers all syntax elements and rules.

## File Structure

Every `.wire` file has this basic structure:

```wire
project "Project Name" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  colors {
    primary: #3B82F6
    accent: #3B82F6
    control: #3B82F6
    chart: #3B82F6
  }

  screen ScreenName {
    layout stack {
      // content
    }
  }
}
```

## Main Blocks

### Project

Defines the complete wireframe project.

```wire
project "Admin Dashboard" {
  style { ... }
  colors { ... }
  screen UsersList { ... }
  screen UserDetail { ... }
}
```

**Properties**:
- `name`: Project name (string, required)
- `style`: Design tokens configuration (highly recommended)

---

### Style Block

Configures design tokens for visual consistency across the entire project.

```wire
project "App" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  ...
}
```

**Style Properties**:

| Property | Options | Default | Impact |
|----------|---------|---------|--------|
| `density` | `"compact"`, `"normal"`, `"comfortable"` | `"normal"` | UI element sizing |
| `spacing` | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` | `"md"` | Default layout gaps |
| `radius` | `"none"`, `"sm"`, `"md"`, `"lg"`, `"full"` | `"md"` | Border radius |
| `stroke` | `"thin"`, `"normal"`, `"thick"` | `"normal"` | Border width |
| `font` | `"sm"`, `"base"`, `"lg"` | `"base"` | Typography scale |

**Spacing Values**:
- `"xs"`: 4px
- `"sm"`: 8px
- `"md"`: 16px (default)
- `"lg"`: 24px
- `"xl"`: 32px

**Density Levels**:
- `"compact"`: Condensed, space-efficient
- `"normal"`: Standard, balanced (recommended)
- `"comfortable"`: Spacious, easy-to-use

---

### Colors Block

Defines project-level color tokens.

```wire
project "App" {
  colors {
    primary: #3B82F6
    danger: #EF4444
    accent: #2563EB
    control: #16A34A
    chart: #F97316
    brand: primary
  }
}
```

**Rules**:
- Block name is `colors` (plural)
- Entries are `key: value`
- `value` can be:
  - a hex color (`#RRGGBB`)
  - another color key (alias/chaining), e.g. `brand: primary`
  - a named color identifier (e.g. `blue`, `red`, `green`)

**Built-in variant keys (for `variant` props)**:
- `primary`, `secondary`, `success`, `warning`, `danger`, `info` (and `error`)

You can override any of them in `colors`.

**Semantic keys**:
- `accent`: used by `Topbar` icon/actions, active `Tabs`, `StatCard` highlighted value/icon, selected `SidebarMenu` item
- `control`: used by selected/enabled states in `Checkbox`, `Radio`, `Toggle`
- `chart`: used by `Chart` types `line`, `area`, and `bar`

**Note**:
- `Chart` type `pie` keeps a fixed multi-color palette and does not use `chart` as single fill.

---

### Screen

Defines a screen/page in the wireframe.

```wire
screen UsersList {
  layout split(sidebar: 260, gap: md) {
    layout stack { ... }  // sidebar
    layout stack { ... }  // main content
  }
}
```

**Properties**:
- `id`: Unique identifier (derived from screen name)
- Must contain exactly one root layout

**Screen names** must be in `CamelCase` and unique within the project.

---

## Layouts

Containers for organizing components hierarchically. There are 5 layout types.

### Stack Layout

Linear arrangement of elements vertically or horizontally.

```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

**Properties**:
- `direction`: `vertical` (default) | `horizontal`
- `gap`: spacing between children (`xs`/`sm`/`md`/`lg`/`xl`)
- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`; default: none)
- `align`: horizontal alignment for `direction: horizontal` only
  - `justify` (default): Equal width, fills 100%
  - `left`: Natural width, grouped left
  - `center`: Natural width, centered
  - `right`: Natural width, grouped right

**Examples**:

Horizontal stack with equal width (default):
<!-- wire-preview:start -->
```wire
layout stack(direction: horizontal, gap: md) {
  component Button text: "Save"
  component Button text: "Cancel"
  component Button text: "Delete"
}
```
<!-- wire-preview:end -->

Horizontal stack with right-aligned buttons:
<!-- wire-preview:start -->
```wire
layout stack(direction: horizontal, gap: md, align: "right") {
  component Button text: "Back"
  component Button text: "Next" variant: primary
}
```
<!-- wire-preview:end -->

⚠️ **Note**: Layouts without explicit padding default to **0px** (no inheritance from project style).

---

### Grid Layout

12-column flexible grid system for responsive layouts.

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

**Properties**:
- `columns`: number of columns (default: 12)
- `gap`: spacing between cells

**Cell Properties**:
- `span`: column span (default: 12)
- `align`: alignment within cell (`start`/`center`/`end`)

---

### Split Layout

Two-panel layout (sidebar + main content).

```wire
layout split(sidebar: 260, gap: md) {
  layout stack {
    component SidebarMenu items: "Home,Users,Settings"
  }

  layout stack {
    // main content here
  }
}
```

**Properties**:
- `sidebar`: width of left panel in pixels
- `gap`: spacing between panels

---

### Panel Container

Specialized container with automatic padding and border styling.

```wire
layout panel(padding: md, background: white) {
  component Text content: "Panel content"
}
```

**Properties**:
- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`)
- `background`: background color (color name or hex)

---

### Card Container

Flexible vertical container for grouping related content.

```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image placeholder: "landscape"
  component Heading text: "Product Title"
  component Text content: "Product description"
  component Button text: "Learn More"
}
```

**Properties**:
- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`; default: `md`)
- `gap`: spacing between children (`xs`/`sm`/`md`/`lg`/`xl`; default: `md`)
- `radius`: corner radius (`xs`/`sm`/`md`/`lg`/`xl`; default: `md`)
- `border`: show border (`true`/`false`; default: `true`)

---

## Comments

Wire-DSL supports two types of comments:

### Line Comments

```wire
// This is a line comment
project "My App" {
  // Comments can appear anywhere
  style { ... }
}
```

### Block Comments

```wire
/* Multi-line block comment
   can span multiple lines
   and are useful for longer explanations */
project "My App" { ... }
```

Both comment types are removed from the compiled output.

---

## Custom Components

Define reusable custom components to avoid repetition.

### Syntax

```wire
define Component "ComponentName" {
  // Content: layout or component reference
}
```

### Documentation

Add documentation using block comments:

```wire
/**
 * Displays a group of action buttons
 * Useful for form submissions and dialogs
 */
define Component "ButtonGroup" {
  layout stack(direction: horizontal, gap: md) {
    component Button text: "OK" variant: primary
    component Button text: "Cancel" variant: secondary
  }
}
```

### Example

<!-- wire-preview:start -->
```wire
project "Form App" {
  style {
    device: "mobile-min"
  }

  define Component "ButtonGroup" {
    layout stack(direction: horizontal, gap: md) {
      component Button text: "OK" variant: primary
      component Button text: "Cancel" variant: secondary
    }
  }

  screen LoginScreen {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Login"
      component Input label: "Email" placeholder: "user@example.com"
      component Input label: "Password" placeholder: "••••••••"
      component ButtonGroup
    }
  }
}
```
<!-- wire-preview:end -->

### Usage Rules

1. **Definitions inside project** - Place `define Component` inside the project block
2. **Define before use** - Highly recommended to define before first use (hoisting supported)
3. **Can reference other components** - Both built-in and custom
4. **Can nest layouts** - Define complex patterns once, reuse everywhere
5. **No parameters** - Components are templates, not functions

---

## Components

Individual wireframe elements that appear in layouts.

### Syntax

```wire
component <Type> <properties>
```

Example:

```wire
component Button text: "Click me" variant: primary
```

### Component Properties

Properties use `key: value` syntax:
- String values use double quotes: `text: "Hello"`
- Numeric values without quotes: `height: 200`
- Boolean values without quotes: `checked: true`
- Enum values without quotes: `variant: primary`

---

## Complete Example

<!-- wire-preview:start -->
```wire
project "Admin Dashboard" {
  style {
    device: "desktop"
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen UsersList {
    layout split(sidebar: 260, gap: md) {
      layout stack(gap: lg, padding: lg) {
        component Topbar title: "Dashboard"
        component SidebarMenu items: "Users,Roles,Permissions,Audit" active: 0
      }

      layout stack(gap: md, padding: lg) {
        component Heading text: "Users"

        layout grid(columns: 12, gap: md) {
          cell span: 8 {
            component Input label: "Search" placeholder: "name, email..."
          }
          cell span: 4 align: end {
            component Button text: "Create User" variant: primary
          }
        }

        component Table columns: "Name,Email,Status,Role" rows: 8
      }
    }
  }

  screen UserDetail {
    layout stack(gap: md, padding: lg) {
      component Breadcrumbs items: "Users,User Detail"

      layout grid(columns: 12, gap: md) {
        cell span: 8 {
          layout card(padding: lg, gap: md) {
            component Heading text: "User Profile"
            component Text content: "Name: John Doe"
            component Text content: "Email: john@example.com"
            component Text content: "Role: Administrator"
          }
        }
        cell span: 4 {
          layout panel(padding: lg) {
            component Heading text: "Actions"
            component Button text: "Edit" variant: primary
            component Button text: "Delete" variant: secondary
          }
        }
      }

      component Tabs items: "Permissions,Sessions,Activity" active: 0
    }
  }
}
```
<!-- wire-preview:end -->

---

## Validation Rules

1. A `project` must have at least one `screen`
2. Each `screen` must have exactly one root layout
3. `grid` layouts require `columns` property
4. `split` layouts require `sidebar` property
5. `Table` components require `columns` property
6. All identifiers must be unique within project scope
7. Property values must match their defined types
8. No absolute positioning allowed

---

## Design Principles

1. **Wireframing First**: Focus on structure and layout, not aesthetics
2. **Composability**: Build complex layouts from simple, reusable containers
3. **Consistency**: Use style tokens for unified appearance
4. **Simplicity**: Minimal syntax with maximum expressiveness
5. **Clarity**: Property names match common UI terminology

---

## Next Steps

- [All Component Types](./components.md)
- [Containers & Layouts](./containers.md)
- [Configuration](./configuration.md)

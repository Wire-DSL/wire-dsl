# Wire-DSL Syntax Guide

## Overview

```
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
    layout <type> {
      // content
    }
  }
}
```

## Main Blocks

### Project

Defines the complete project.

```
project "Admin Dashboard" {
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

  screen UsersList { ... }
  screen UserDetail { ... }
}
```

**Properties**:

- `name`: Project name (string, required)
- `style`: Design tokens configuration (highly recommended)

---

### Config Block

Configures design tokens for visual consistency across the entire project.

```
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

- `density`: Visual compactness (`"compact"` | `"normal"` | `"comfortable"`)
- `spacing`: Default spacing unit (`"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"`)
- `radius`: Border radius default (`"none"` | `"sm"` | `"md"` | `"lg"` | `"full"`)
- `stroke`: Border width (`"thin"` | `"normal"` | `"thick"`)
- `font`: Typography scale (`"sm"` | `"base"` | `"lg"`)

**Spacing Values**:
- `"xs"`: 4px
- `"sm"`: 8px
- `"md"`: 16px (default)
- `"lg"`: 24px
- `"xl"`: 32px

**Radius Values**:
- `"none"`: 0px
- `"sm"`: 2px
- `"md"`: 4px
- `"lg"`: 8px

**Density Levels**:
- `"compact"`: Condensed UI
- `"normal"`: Standard (recommended)
- `"comfortable"`: Spacious

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

- `accent`: used by `Topbar` icon/actions, active `Tabs`, `Stat` highlighted value/icon, selected `SidebarMenu` item
- `control`: used by selected/enabled states in `Checkbox`, `Radio`, `Toggle`
- `chart`: used by `Chart` types `line`, `area`, and `bar`
- `text`: default text color fallback (`#000000` light, `#FFFFFF` dark)
- `muted`: default muted text color fallback (`#64748B` light, `#94A3B8` dark)

**Note**:

- `Chart` type `pie` keeps a fixed multi-color palette and does not use `chart` as single fill.

---

### Screen

Defines a screen/page in the prototype.

```
screen UsersList {
  layout split(left: 260, gap: md) {
    layout stack { ... }  // fixed panel
    layout stack { ... }  // flexible panel
  }
}
```

**Properties**:

- `id`: Unique identifier (derived from name)
- Must contain exactly one root layout

---

## Layouts

Containers for organizing components hierarchically.

### Stack Layout

Stacks elements vertically or horizontally with configurable spacing and alignment.

```
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

**Properties**:

- `direction`: `vertical` (default) | `horizontal`
- `gap`: spacing between children (`xs`=4px, `sm`=8px, `md`=16px, `lg`=24px, `xl`=32px)
- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`; default: none)
- `justify`: main-axis distribution for `direction: horizontal` only
  - `stretch` (default): Equal width, fills 100%
  - `start`: Natural width, grouped left
  - `center`: Natural width, centered
  - `end`: Natural width, grouped right
  - `spaceBetween`: First child left, last child right, space distributed between
  - `spaceAround`: Equal space wraps each child
- `align`: cross-axis (vertical) alignment for `direction: horizontal` only
  - `start` (default): Children aligned to top of row
  - `center`: Children vertically centered in row
  - `end`: Children aligned to bottom of row

**Examples**:

Horizontal stack with equal width (default):
```
layout stack(direction: horizontal, gap: md) {
  component Button text: "Save"
  component Button text: "Cancel"
  component Button text: "Delete"
}
```

Horizontal stack with end-aligned buttons:
```
layout stack(direction: horizontal, gap: md, justify: end) {
  component Button text: "Back"
  component Button text: "Next" variant: primary
}
```

Horizontal stack with centered content:
```
layout stack(direction: horizontal, gap: md, justify: center) {
  component Button text: "Agree"
  component Button text: "Disagree"
}
```

Toolbar with space between + vertical centering:
```
layout stack(direction: horizontal, gap: md, justify: spaceBetween, align: center) {
  component Heading text: "Users"
  component Button text: "New user" variant: primary icon: "plus"
}
```

**⚠️ Important**: Layouts without explicit padding default to **0px** (no inheritance from project style).

---

### Grid Layout

12-column flexible grid system.

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

**Properties**:

- `columns`: number of columns (default: 12)
- `gap`: spacing between cells
- **Cell properties**:
  - `span`: column span (default: 12)
  - `align`: alignment within cell (`start`/`center`/`end`)

---

### Split Layout

Two-panel layout with one fixed side and one flexible side.

```
layout split(left: 260, gap: md) {
  layout stack {
    component SidebarMenu items: ["Home", "Users", "Settings"]
  }

  layout stack {
    // main content here
  }
}
```

**Properties**:

- `left`: fixed width for left panel (pixels)
- `right`: fixed width for right panel (pixels)
- `background`: color token/variant/hex applied to the fixed panel
- `border`: `true` adds vertical divider between panels
- `gap`: spacing between panels
- `padding`: inner padding

Rules:
- provide exactly one of `left` or `right`
- `split` requires exactly 2 children
- legacy `sidebar` parameter is deprecated and reported as semantic error

---

### Panel Container

Specialized container with automatic padding and border styling.

```
layout panel(padding: md, background: white) {
  component Text text: "Panel content"
}
```

Or with nested stack:

```
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Panel Title"
    component Text text: "Panel body"
  }
}
```

**Properties**:

- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`)
- `background`: background color (color name or hex)

**Rendering**: Rendered as rectangle with:
- Gray border
- Specified background color
- Content with applied padding

---

### Card Container

Flexible vertical container for grouping related content.

```
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image placeholder: "landscape"
  component Heading text: "Product Title"
  component Text text: "Product description"
  component Button text: "Learn More"
}
```

**Properties**:

- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`; default: `md`)
- `gap`: spacing between children (`xs`/`sm`/`md`/`lg`/`xl`; default: `md`)
- `radius`: corner radius (`xs`/`sm`/`md`/`lg`/`xl`; default: `md`)
- `border`: show border (`true`/`false`; default: `true`)

**Features**:

- Children stack vertically automatically
- Height calculated dynamically based on content
- Ideal for product cards, user profiles, advertisements
- Maintains aspect ratio for responsive images

**Example - Product Card**:

```
layout card(padding: md, gap: md, radius: lg, border: true) {
  component Image placeholder: "square" height: 250
  component Heading text: "Premium Item"
  component Text text: "High-quality product with excellent reviews"
  layout stack(direction: horizontal, gap: sm) {
    component Button text: "View Details"
    component Button text: "Add to Cart"
  }
}
```

**Example - User Profile Card**:

```
layout card(padding: lg, gap: md) {
  component Image placeholder: "avatar" height: 120
  component Heading text: "John Doe"
  component Text text: "john@example.com"
  component Divider
  component Text text: "Senior Software Engineer"
  component Button text: "Follow"
}
```

---

---

## Comments

Wire DSL supports two types of comments:

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

/**
 * Documentation-style block comments
 * are perfect for documenting components
 */
define Component "MyComponent" { ... }
```

Both comment types are ignored by the compiler and removed from the IR output.

---

## Custom Definitions

Use definitions to reuse UI patterns and app shells.

### Define Component

```wire
define Component "MyMenu" {
  component SidebarMenu
    items: "Home,Users,Permissions"
    active: 0
}
```

A defined component body can be:
- one `component`
- one `layout`

### Dynamic Properties with `prop_`

Inside a definition, any value that starts with `prop_` is treated as a binding key.

```wire
define Component "MyMenu" {
  component SidebarMenu
    items: "Home,Users,Permissions"
    active: prop_active
}

screen Main {
  layout stack {
    component MyMenu active: 1
  }
}
```

Binding behavior:
- if the argument is provided, the value is substituted
- if the argument is missing and target field is optional, the field is omitted and a warning is emitted
- if the argument is missing and target field is required, semantic error
- extra arguments that are not used by the definition emit a warning

`prop_` is reserved in definition bodies for dynamic binding semantics.

### Define Layout (User-Defined Layout Containers)

```wire
define Layout "screen_default" {
  layout split(left: prop_left) {
    component SidebarMenu
      items: "Home,Users,Permissions"
      active: prop_active
    component Children
  }
}
```

Use it like any other layout:

```wire
screen Main {
  layout screen_default(left: 220, active: 1) {
    layout stack(gap: md) {
      component Heading text: "Main Screen"
    }
  }
}
```

Rules:
- `define Layout` body must be exactly one root `layout`
- each defined layout must contain exactly one `component Children`
- `component Children` is reserved and only valid inside `define Layout`
- each invocation of a defined layout must provide exactly one child block

### Naming Rules

- `define Component "Name"`: PascalCase is recommended (`warning` if not)
- `define Layout "name"`: must match `^[a-z][a-z0-9_]*$` (`error` if not)
- names with keyword prefixes like `screen_default`, `layout_shell`, `component_grid` are valid identifiers

### Definition Docs

You can document a custom definition with block comments (`/* ... */`) right above it:

```wire
/**
 * Reusable actions row for forms
 */
define Component "FormActions" {
  layout stack(direction: horizontal, gap: md) {
    component Button text: "Save" variant: primary
    component Button text: "Cancel"
  }
}
```

### Notes

- definitions are expanded at compile-time (no runtime custom container type)
- circular references across components and layouts are detected as errors
- unresolved components/layouts are reported by semantic diagnostics

---

## Components

Individual wireframe elements.

### Syntax

```
component <Type> <properties>
```

Example:

```
component Button text: "Click me" variant: primary
```

---

## Available Components

### Text Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Heading` | `text`, `level`, `spacing`, `variant` | `component Heading text: "Page Title" level: h2 variant: primary` |
| `Text` | `content` (string) | `component Text text: "Body text"` |
| `Label` | `text` (string) | `component Label text: "Field label"` |

### Input Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Input` | `label`, `placeholder`, `size` | `component Input label: "Email" placeholder: "your@email.com" size: md` |
| `Textarea` | `label`, `placeholder`, `rows` | `component Textarea label: "Message" rows: 4` |
| `Select` | `label`, `items`, `size` | `component Select label: "Role" items: "Admin,User" size: md` |
| `Checkbox` | `label`, `checked` | `component Checkbox label: "Agree" checked: true` |
| `Radio` | `label`, `checked` | `component Radio label: "Option" checked: false` |
| `Toggle` | `label`, `enabled` | `component Toggle label: "Enable feature" enabled: false` |

### Button Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Button` | `text`, `variant`, `size`, `labelSpace`, `padding`, `block` | `component Button text: "Save" variant: primary size: md labelSpace: true` |
| `IconButton` | `icon`, `variant`, `size`, `labelSpace`, `padding`, `disabled` | `component IconButton icon: "search" variant: default size: md` |

**Button Variants**: `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info`

### Navigation Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Topbar` | `title`, `subtitle`, `icon`, `actions`, `user`, `avatar`, `variant`, `border`, `background`, `radius` | `component Topbar title: "Dashboard" variant: primary border: true background: true radius: md` |
| `SidebarMenu` | `items`, `active` | `component SidebarMenu items: "Home,Users,Settings" active: 0` |
| `Breadcrumbs` | `items` | `component Breadcrumbs items: "Home,Users,Detail"` |
| `Tabs` | `items`, `active` | `component Tabs items: "Profile,Settings" active: 0` |

### Data Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Table` | `columns`, `rows`, `pagination`, `paginationAlign`, `actions`, `caption`, `captionAlign`, `border`, `background` | `component Table columns: "Name,Email,Status" rows: 8 actions: "eye,edit" border: true background: true` |
| `List` | `items` | `component List items: "Item 1,Item 2,Item 3"` |

### Media Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Image` | `placeholder`, `height` | `component Image placeholder: "square" height: 200` |
| `Icon` | `type`, `size`, `variant` | `component Icon icon: "search" size: md variant: primary` |

### Other Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Divider` | - | `component Divider` |
| `Badge` | `text`, `variant` | `component Badge text: "New" variant: primary` |
| `Link` | `text`, `variant`, `size` | `component Link text: "Click here" variant: primary size: lg` |
| `Chart` | `type`, `height` | `component Chart type: "bar" height: 200` |
| `Alert` | `variant`, `title`, `text` | `component Alert variant: "danger" title: "Error" text: "Something went wrong"` |
| `Stat` | `title`, `value`, `caption`, `icon` | `component Stat title: "Total Users" value: "1,234" icon: "users"` |
| `Separate` | `size` | `component Separate size: md` |
| `Code` | `code` | `component Code code: "const x = 10;"` |
| `Modal` | `title`, `visible` | `component Modal title: "Confirm?" visible: false` |

---

## Complete Example

```
project "Admin Dashboard" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen UsersList {
    layout split(left: 260, gap: md) {
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
            component Text text: "Name: John Doe"
            component Text text: "Email: john@example.com"
            component Text text: "Role: Administrator"
          }
        }
        cell span: 4 {
          layout panel(padding: lg) {
            component Heading text: "Actions"
            component Button text: "Edit" variant: primary
            component Button text: "Delete" variant: secondary
            component Button text: "Deactivate" variant: danger
          }
        }
      }

      component Tabs items: "Permissions,Sessions,Activity" active: 0
    }
  }
}
```

---

## Validation Rules

1. A `project` must have at least one `screen`
2. Each `screen` must have exactly one root layout
3. `grid` layouts require `columns` property
4. `split` layouts require exactly one of `left` or `right` and exactly 2 children
5. `Table` components require `columns` property
6. All identifiers must be unique within project scope
7. Property values must match their defined types
8. `define Layout` names must match `^[a-z][a-z0-9_]*$`
9. `component Children` is only valid inside `define Layout`
10. Defined layout declarations and invocations require exactly one `Children` child slot
11. `prop_*` bindings require matching invocation args when target field is required
12. No absolute positioning allowed

---

## Design Principles

1. **Wireframing First**: Focus on structure and layout, not aesthetics
2. **Composability**: Build complex layouts from simple, reusable containers
3. **Consistency**: Use style tokens for unified appearance
4. **Simplicity**: Minimal syntax with maximum expressiveness
5. **Clarity**: Property names match common UI terminology

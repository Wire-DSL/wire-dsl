# Wire-DSL Syntax Guide

## Overview

```
project "Project Name" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
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
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen UsersList { ... }
  screen UserDetail { ... }
}
```

**Properties**:

- `name`: Project name (string, required)
- `theme`: Design tokens configuration (required)

---

### Theme Block

Configures design tokens for visual consistency across the entire project.

```
project "App" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  ...
}
```

**Theme Properties**:

- `density`: Visual compactness (`"compact"` | `"normal"` | `"comfortable"`)
- `spacing`: Default spacing unit (`"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"`)
- `radius`: Border radius default (`"none"` | `"sm"` | `"md"` | `"lg"`)
- `stroke`: Border width (`"thin"` | `"normal"`)
- `font`: Typography base (`"base"` | `"title"` | `"mono"`)

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

### Screen

Defines a screen/page in the prototype.

```
screen UsersList {
  layout split(sidebar: 260, gap: md) {
    layout stack { ... }  // sidebar
    layout stack { ... }  // main content
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

Stacks elements vertically or horizontally with configurable spacing.

```
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading title: "Title"
  component Button text: "Action"
}
```

**Properties**:

- `direction`: `vertical` (default) | `horizontal`
- `gap`: spacing between children (`xs`=4px, `sm`=8px, `md`=16px, `lg`=24px, `xl`=32px)
- `padding`: internal padding (`xs`/`sm`/`md`/`lg`/`xl`; default: none)
- `align`: alignment (`start`/`center`/`end`)

**⚠️ Important**: Layouts without explicit padding default to **0px** (no inheritance from project theme).

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

Two-panel layout (sidebar + main content).

```
layout split(sidebar: 260, gap: md) {
  layout stack {
    component SidebarMenu items: ["Home", "Users", "Settings"]
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

```
layout panel(padding: md, background: white) {
  component Text content: "Panel content"
}
```

Or with nested stack:

```
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading title: "Panel Title"
    component Text content: "Panel body"
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
  component Heading title: "Product Title"
  component Text content: "Product description"
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
  component Heading title: "Premium Item"
  component Text content: "High-quality product with excellent reviews"
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
  component Heading title: "John Doe"
  component Text content: "john@example.com"
  component Divider
  component Text content: "Senior Software Engineer"
  component Button text: "Follow"
}
```

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
| `Heading` | `title` (string) | `component Heading title: "Page Title"` |
| `Text` | `content` (string) | `component Text content: "Body text"` |
| `Paragraph` | `content` (string) | `component Paragraph content: "Long text"` |
| `Label` | `text` (string) | `component Label text: "Field label"` |

### Input Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Input` | `label`, `placeholder` | `component Input label: "Email" placeholder: "your@email.com"` |
| `Textarea` | `label`, `placeholder`, `rows` | `component Textarea label: "Message" rows: 4` |
| `Select` | `label`, `items` | `component Select label: "Role" items: "Admin,User"` |
| `Checkbox` | `label` | `component Checkbox label: "Agree"` |
| `Radio` | `label` | `component Radio label: "Option"` |
| `Toggle` | `label` | `component Toggle label: "Enable feature"` |

### Button Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Button` | `text`, `variant` | `component Button text: "Save" variant: primary` |
| `IconButton` | `icon` | `component IconButton icon: "search"` |

**Button Variants**: `primary` | `secondary` | `ghost`

### Navigation Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Topbar` | `title`, `subtitle` | `component Topbar title: "Dashboard"` |
| `SidebarMenu` | `items`, `active` | `component SidebarMenu items: "Home,Users,Settings" active: 0` |
| `Breadcrumbs` | `items` | `component Breadcrumbs items: "Home,Users,Detail"` |
| `Tabs` | `items`, `activeIndex` | `component Tabs items: "Profile,Settings" activeIndex: 0` |

### Data Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Table` | `columns`, `rows` | `component Table columns: "Name,Email,Status" rows: 8` |
| `List` | `items` | `component List items: "Item 1,Item 2,Item 3"` |

### Media Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Image` | `placeholder`, `height` | `component Image placeholder: "square" height: 200` |
| `Icon` | `name` | `component Icon name: "search"` |
| `Avatar` | `placeholder` | `component Avatar placeholder: "avatar"` |

### Other Components

| Component | Properties | Example |
|-----------|-----------|---------|
| `Divider` | - | `component Divider` |
| `Badge` | `text`, `variant` | `component Badge text: "New" variant: primary` |
| `Link` | `text` | `component Link text: "Click here"` |
| `ChartPlaceholder` | `type`, `height` | `component ChartPlaceholder type: "bar" height: 200` |
| `Alert` | `title`, `content` | `component Alert title: "Error" content: "Something went wrong"` |
| `StatCard` | `label`, `value` | `component StatCard label: "Total Users" value: "1,234"` |
| `Code` | `content` | `component Code content: "const x = 10;"` |
| `Spinner` | - | `component Spinner` |
| `Modal` | `title`, `content` | `component Modal title: "Confirm?" content: "Are you sure?"` |

---

## Complete Example

```
project "Admin Dashboard" {
  theme {
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
        component Heading title: "Users"

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
            component Heading title: "User Profile"
            component Text content: "Name: John Doe"
            component Text content: "Email: john@example.com"
            component Text content: "Role: Administrator"
          }
        }
        cell span: 4 {
          layout panel(padding: lg) {
            component Heading title: "Actions"
            component Button text: "Edit" variant: primary
            component Button text: "Delete" variant: secondary
            component Button text: "Deactivate" variant: ghost
          }
        }
      }

      component Tabs items: "Permissions,Sessions,Activity" activeIndex: 0
    }
  }
}
```

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
3. **Consistency**: Use theme tokens for unified appearance
4. **Simplicity**: Minimal syntax with maximum expressiveness
5. **Clarity**: Property names match common UI terminology

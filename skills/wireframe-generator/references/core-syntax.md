---
name: Core Syntax Reference
description: Complete syntax rules, grammar, and property formats for Wire DSL
---

# Wire DSL Core Syntax

This reference covers the fundamental syntax rules and grammar for writing valid Wire DSL code.

## File Structure

Every `.wire` file follows this hierarchical structure:

```wire
project "ProjectName" {
  // style block is optional (defaults apply when omitted)
  style {
    // each property is also optional
  }

  screen ScreenName {
    layout <type> {
      // components and nested layouts
    }
  }

  screen AnotherScreen {
    // another screen
  }
}
```

**Key Points:**
- One `project` block per file
- Zero or one `style` block per project (optional; defaults apply when omitted)
- One or more `screen` blocks
- Each screen contains exactly one root layout
- Layouts can contain components and nested layouts

## Top-Level Keywords

The following keywords are valid at the project level:

| Keyword | Purpose |
|---------|---------|
| `project` | Root wrapper for the entire file |
| `style` | Global style tokens (optional; density, spacing, radius, stroke, font) |
| `colors` | Project color tokens (variants and semantic tokens) |
| `mocks` | Mock data definitions for components |
| `define` | Reusable custom component definitions |

## Property Syntax

Properties use the `key: value` format with specific quoting rules:

### String Values (MUST be quoted)

```wire
text: "Hello World"
label: "Email Address"
placeholder: "Enter text here"
title: "Dashboard"
```

### Numeric Values (NO quotes)

```wire
height: 200
width: 400
rows: 5
columns: 12
span: 6
left: 260
```

### Boolean Values (NO quotes)

```wire
checked: true
enabled: false
border: true
disabled: true
```

### Enum Values (NO quotes)

```wire
variant: primary
direction: vertical
gap: md
type: bar
```

**Valid Enum Values:**
- **Spacing:** `none`, `xs`, `sm`, `md`, `lg`, `xl`
- **Variants (semantic):** `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`
- **Variants (Material Design):** `red`, `pink`, `purple`, `deep_purple`, `indigo`, `blue`, `light_blue`, `cyan`, `teal`, `green`, `light_green`, `lime`, `yellow`, `amber`, `orange`, `deep_orange`, `brown`, `grey`, `blue_grey`
- **Direction:** `vertical`, `horizontal`
- **Justify:** `stretch`, `start`, `center`, `end`, `spaceBetween`, `spaceAround`
- **Align (layout):** `start`, `center`, `end`
- **Align (component):** `left`, `center`, `right`
- **Density:** `compact`, `normal`, `comfortable`
- **Radius:** `none`, `sm`, `md`, `lg`
- **Stroke:** `thin`, `normal`
- **Font:** `base`, `title`, `mono`
- **Image type:** `landscape`, `portrait`, `square`, `icon`, `avatar`
- **Chart types:** `bar`, `line`, `pie`, `area`
- **Heading level:** `h1`, `h2`, `h3`, `h4`, `h5`, `h6`

### CSV Lists (Quoted strings with commas)

```wire
items: "Home,Users,Settings,Analytics"
columns: "Name,Email,Status,Role"
actions: "Edit,Delete,View"
icons: "home,users,settings"
```

## Naming Conventions

### Project Names
- Use quoted strings
- Can include spaces and special characters
- Example: `project "My Admin Dashboard"`

### Screen Names
- Use CamelCase (PascalCase)
- No spaces or special characters
- Must be unique within the project
- Examples: `Dashboard`, `UsersList`, `ProductDetail`, `SettingsPage`

### Component Names
- Use exact PascalCase matching
- Case-sensitive (must match exactly)
- Examples: `Button`, `Input`, `Heading`, `Stat`, `SidebarMenu`
- Wrong: `button`, `INPUT`, `heading`, `sidebarMenu`

### Property Names
- Use camelCase
- Examples: `gap`, `padding`, `placeholder`, `iconLeft`, `iconAlign`, `labelSpace`

## Comments

### Line Comments
```wire
// This is a single-line comment
component Heading text: "Title" // inline comment
```

### Block Comments
```wire
/*
  This is a multi-line comment
  Spanning multiple lines
*/
component Button text: "Submit"
```

## Layout Syntax

Layouts are containers that organize components and other layouts.

### Basic Layout Declaration

```wire
layout <type> {
  // children
}
```

### Layout with Properties

```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Text text: "Body"
}
```

**Property Format:**
- Properties are enclosed in parentheses after the layout type
- Multiple properties separated by commas
- Format: `key: value`

## Component Syntax

Components are UI elements that render visual content.

### Single-Line Components

```wire
component Heading text: "Page Title"
component Divider
component Separate size: md
```

### Multi-Property Components

```wire
component Input label: "Email" placeholder: "your@email.com" iconLeft: "mail"
component Image type: square height: 250
component Button text: "Submit" variant: primary icon: "check"
```

**Component Format:**
- Always starts with `component` keyword
- Followed by component name (PascalCase)
- Properties separated by spaces
- Each property: `key: value`

## Style Configuration

The style block configures global visual settings. Both the block itself and each individual property are **optional**. Omitted properties use their defaults.

```wire
style {
  density: "normal"      // compact | normal | comfortable  (default: "normal")
  spacing: "md"          // xs | sm | md | lg | xl          (default: "md")
  radius: "md"           // none | sm | md | lg | full      (default: "md")
  stroke: "normal"       // thin | normal | thick            (default: "normal")
  font: "base"           // sm | base | lg                   (default: "base")
  background: "#f0f0f0"  // optional CSS color
  theme: "light"         // light | dark                     (optional)
  device: "mobile"       // mobile | tablet | desktop | print | a4  (optional)
}
```

**Key Points:**
- The `style` block is optional (defaults apply when omitted)
- Each property inside `style` is also optional (individual defaults apply)
- Values must be from valid enum sets
- String values must be quoted

## Nesting Rules

### Layouts can contain:
- Components
- Other layouts (nested)
- Cells (for grid layouts only)

### Components cannot contain:
- Other components
- Layouts
- They are leaf nodes

### Example of Valid Nesting

```wire
layout stack(direction: vertical, gap: md) {
  component Heading text: "Section"

  layout grid(columns: 12, gap: md) {
    cell span: 6 {
      component Input label: "First Name"
    }
    cell span: 6 {
      component Input label: "Last Name"
    }
  }

  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Save"
    component Button text: "Cancel"
  }
}
```

## Special Container Rules

### Split Layout
- Must have **exactly 2** children
- First child is left panel, second is right/main content
- Both children are typically stacks
- Use `left` or `right` to set fixed-width side (in pixels)

```wire
layout split(left: 260, gap: md) {
  layout stack { /* left panel */ }
  layout stack { /* main content */ }
}
```

### Panel Layout
- Must have **exactly 1** child
- Used for bordered/highlighted sections

```wire
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Panel Title"
    component Text text: "Content"
  }
}
```

### Grid Layout
- Contains `cell` elements (not direct components)
- Each cell has a `span` value (1-12)

```wire
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    component Input label: "Search"
  }
  cell span: 4 {
    component Button text: "Search"
  }
}
```

## Custom Components

Define reusable components:

```wire
define Component "CustomCard" {
  layout card(padding: md, gap: sm) {
    component Heading text: "Title"
    component Text text: "Description"
  }
}
```

**Usage:**
```wire
screen MyScreen {
  layout stack {
    component "CustomCard"
    component "CustomCard"
  }
}
```

## Whitespace and Formatting

Wire DSL is whitespace-insensitive (like CSS/JavaScript):

```wire
// All valid and equivalent
component Button text: "Submit"
component Button text:"Submit"
component Button text : "Submit"

// Multi-line formatting is allowed
component Input
  label: "Email"
  placeholder: "your@email.com"
```

**Best Practice:** Use consistent indentation (2 or 4 spaces) for readability.

## Complete Example

```wire
project "E-Commerce App" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ProductList {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      // Header section
      component Heading text: "Products"

      // Search and filter
      layout grid(columns: 12, gap: md) {
        cell span: 9 {
          component Input label: "Search" placeholder: "Product name..." iconLeft: "search"
        }
        cell span: 3 {
          layout stack(direction: horizontal, justify: end) {
            component Button text: "Filter" variant: secondary icon: "filter"
          }
        }
      }

      // Product grid
      layout grid(columns: 12, gap: lg) {
        cell span: 4 {
          layout card(padding: md, gap: sm) {
            component Image type: square height: 200
            component Heading text: "Product 1"
            component Text text: "$99.99"
            component Button text: "Add to Cart" variant: primary
          }
        }
        cell span: 4 {
          layout card(padding: md, gap: sm) {
            component Image type: square height: 200
            component Heading text: "Product 2"
            component Text text: "$79.99"
            component Button text: "Add to Cart" variant: primary
          }
        }
        cell span: 4 {
          layout card(padding: md, gap: sm) {
            component Image type: square height: 200
            component Heading text: "Product 3"
            component Text text: "$129.99"
            component Button text: "Add to Cart" variant: primary
          }
        }
      }
    }
  }
}
```

## Validation Checklist

Before outputting Wire DSL code, verify:

**Structure:**
- File starts with `project` block
- Project may contain one `style` block (optional)
- Project contains at least one `screen` block
- Each screen has exactly one root layout

**Syntax:**
- All string values are quoted
- Numbers, booleans, enums are NOT quoted
- All opening braces `{` have matching closing braces `}`
- Properties use `key: value` format
- CSV lists are comma-separated, no spaces after commas

**Naming:**
- Screen names are CamelCase
- Component names match exactly (case-sensitive)
- Property names use camelCase

**Special Rules:**
- Split layouts have exactly 2 children
- Panel layouts have exactly 1 child
- Grid cells have `span` values 1-12
- Grid cells are inside grid layouts only

<!-- Source: @wire-dsl/language-support components.ts, engine parser/index.ts -->

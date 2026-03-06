---
name: wireframe-generator
description: Generate Wire DSL code for wireframes and UI prototypes
---

# Wire DSL Code Generator

Generate syntactically correct Wire DSL code for creating wireframes and UI prototypes. Wire DSL is a block-declarative language similar to Mermaid, but specifically designed for UI wireframing.

## What This Skill Does

This skill enables LLMs to generate valid Wire DSL code by providing:
- Complete syntax reference and grammar rules
- Catalog of all 31 available components
- Layout container patterns (Stack, Grid, Split, Panel, Card)
- Best practices for code generation
- Common UI patterns and examples

## When to Use This Skill

Use this skill when you need to:
- Generate `.wire` files for wireframe prototypes
- Create UI mockups using declarative syntax
- Build multi-screen application wireframes
- Design forms, dashboards, product catalogs, or admin interfaces
- Convert UI requirements into Wire DSL code

## Core Concepts

**Structure:** Every Wire DSL file follows this hierarchy:
```
project -> [style] -> screen -> layout -> components  (style is optional)
```

**Syntax Style:** Block-declarative with curly braces, similar to CSS/HCL:
```wire
project "App Name" {
  style { ... }
  screen ScreenName {
    layout <type> { ... }
  }
}
```

**Key Rules:**
- String values MUST be quoted: `text: "Hello"`
- Numbers, booleans, enums are NOT quoted: `height: 200`, `checked: true`, `variant: primary`
- Property format: `key: value`
- Comments: `//` for line, `/* */` for block

## Instructions for Code Generation

### Step 1: Start with Project Structure

Begin with the project wrapper. The `style` block is **optional** — if omitted, defaults apply (density: "normal", spacing: "md", radius: "md", stroke: "normal", font: "base"). Each property inside `style` is also optional; only specify what you want to override:

```wire
project "Project Name" {
  // style block is optional; include only to override defaults
  style {
    density: "compact"   // compact | normal | comfortable
    radius: "lg"         // none | sm | md | lg | full
  }

  // screens go here
}
```

### Step 2: Create Screens

Each screen represents a unique view in the application:

```wire
screen ScreenName {
  layout <type> {
    // content
  }
}
```

**Naming:** Use CamelCase for screen names (e.g., `UsersList`, `ProductDetail`, `Dashboard`)

### Step 3: Choose Layout Container

Select the appropriate layout based on the UI structure:

| Layout | Use Case | Children | Example |
|--------|----------|----------|---------|
| **stack** | Linear arrangement | Multiple | Forms, lists, vertical/horizontal sections |
| **grid** | Multi-column (12-col) | cells | Dashboards, product grids, responsive layouts |
| **split** | Two-column area | Exactly 2 | Admin panels, navigation + content |
| **panel** | Bordered container | Exactly 1 | Highlighted sections, form groups |
| **card** | Content cards | Multiple | Product cards, user profiles, info boxes |

### Step 4: Add Components

Choose from 31 available components organized in 8 categories:

**Text:** Heading, Text, Label, Paragraph, Code
**Input:** Input, Textarea, Select, Checkbox, Radio, Toggle
**Action:** Button, IconButton, Link
**Navigation:** Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs
**Data:** Table, List, Stat, Chart
**Media:** Image, Icon
**Layout:** Card, Divider, Separate
**Feedback:** Badge, Alert, Modal

### Step 5: Validate Syntax

Before outputting, check:
- All strings are quoted
- Numbers/booleans/enums are NOT quoted
- All braces are closed
- Required properties are present
- Component names match exactly (case-sensitive)
- Split has 2 children, Panel has 1 child
- Grid cells have valid `span` values (1-12)

## Reference Files

| File | Purpose |
|------|---------|
| [core-syntax.md](references/core-syntax.md) | Complete syntax rules, property formats, naming conventions |
| [components-catalog.md](references/components-catalog.md) | All 31 components with properties and examples |
| [layouts-guide.md](references/layouts-guide.md) | Layout containers (Stack, Grid, Split, Panel, Card) with patterns |
| [best-practices.md](references/best-practices.md) | Validation checklist, common mistakes, gotchas |
| [common-patterns.md](references/common-patterns.md) | Reusable patterns for forms, dashboards, navigation, cards |

## Examples

### Example 1: Simple Login Form

```wire
project "Login App" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Login {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Sign In"
      component Input label: "Email" placeholder: "your@email.com"
      component Input label: "Password" placeholder: "Enter password"
      component Checkbox label: "Remember me" checked: false
      component Button text: "Sign In" variant: primary
      component Link text: "Forgot password?"
    }
  }
}
```

### Example 2: Dashboard with Sidebar

```wire
project "Admin Dashboard" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout split(left: 260, gap: md) {
      layout stack(direction: vertical, gap: md, padding: md) {
        component Heading text: "Menu"
        component SidebarMenu items: "Dashboard,Users,Settings,Analytics" icons: "home,users,settings,bar-chart-2" active: 0
      }

      layout stack(direction: vertical, gap: lg, padding: lg) {
        component Heading text: "Dashboard Overview"

        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            component Stat title: "Total Users" value: "2,543" icon: "users"
          }
          cell span: 3 {
            component Stat title: "Revenue" value: "$45,230" icon: "dollar-sign"
          }
          cell span: 3 {
            component Stat title: "Growth" value: "+12.5%" icon: "trending-up"
          }
          cell span: 3 {
            component Stat title: "Active Now" value: "892" icon: "activity"
          }
        }

        component Chart type: line height: 300
        component Table columns: "User,Email,Status,Role" rows: 8
      }
    }
  }
}
```

### Example 3: Product Grid (E-Commerce)

```wire
project "Product Catalog" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "thin"
    font: "base"
  }

  screen Products {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      layout grid(columns: 12, gap: md) {
        cell span: 8 {
          component Heading text: "Featured Products"
        }
        cell span: 4 {
          layout stack(direction: horizontal, justify: end) {
            component Button text: "View All" variant: primary
          }
        }
      }

      layout grid(columns: 12, gap: lg) {
        cell span: 4 {
          layout card(padding: md, gap: md, radius: lg, border: true) {
            component Image type: square height: 220
            component Heading text: "Wireless Headphones"
            component Text text: "Premium sound quality"
            component Badge text: "New" variant: primary
            layout stack(direction: horizontal, gap: sm) {
              component Text text: "$129.99"
              component Button text: "Add to Cart" variant: primary
            }
          }
        }

        cell span: 4 {
          layout card(padding: md, gap: md, radius: lg, border: true) {
            component Image type: square height: 220
            component Heading text: "Smart Watch"
            component Text text: "Track your fitness"
            component Badge text: "Sale" variant: success
            layout stack(direction: horizontal, gap: sm) {
              component Text text: "$199.99"
              component Button text: "Add to Cart" variant: primary
            }
          }
        }

        cell span: 4 {
          layout card(padding: md, gap: md, radius: lg, border: true) {
            component Image type: square height: 220
            component Heading text: "Laptop Stand"
            component Text text: "Ergonomic design"
            component Badge text: "Popular" variant: info
            layout stack(direction: horizontal, gap: sm) {
              component Text text: "$49.99"
              component Button text: "Add to Cart" variant: primary
            }
          }
        }
      }
    }
  }
}
```

## Quick Tips

**Spacing:** Use `gap` and `padding` with tokens: `none`, `xs`, `sm`, `md`, `lg`, `xl`
**Padding Default:** Layouts have 0px padding by default - always specify when needed
**Grid System:** 12-column grid, cells can span 1-12 columns
**Icons:** Use Feather Icons names: `search`, `settings`, `menu`, `user`, `star`, `heart`, etc.
**CSV Lists:** Comma-separated strings for items: `items: "Home,About,Contact"`
**Button + Input alignment:** When a Button sits next to an Input on the same row, give both the same `size` and use `labelSpace: true` on the Button so heights match
**Variants:** Semantic: `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`. Material Design: `red`, `pink`, `purple`, `deep_purple`, `indigo`, `blue`, `light_blue`, `cyan`, `teal`, `green`, `light_green`, `lime`, `yellow`, `amber`, `orange`, `deep_orange`, `brown`, `grey`, `blue_grey`

## Common Mistakes to Avoid

- Forgetting quotes on strings: `text: Hello` -> `text: "Hello"`
- Adding quotes to numbers: `height: "200"` -> `height: 200`
- Wrong component case: `button` -> `Button`
- Using kebab-case for screens: `user-list` -> `UserList`
- Forgetting padding: Layouts default to 0px, not style spacing
- Using `theme` instead of `style` for the style block (and remember: the style block itself is optional)
- Split with 3 children -> Must have exactly 2
- Panel with multiple children -> Must have exactly 1
- Invalid grid span: `span: 15` -> Must be 1-12
- Using deprecated `sidebar` param on split -> Use `left` or `right`
- Using `error` variant -> Use `danger`
- Using `content` property on Text -> Use `text`
- Using `name` property on Icon -> Use `icon`
- Using `activeIndex` on Tabs -> Use `active`

## Output Guidelines

When generating Wire DSL code:

1. **Always validate syntax** before outputting
2. **Include complete, runnable examples** - not partial snippets
3. **Use realistic content** - "John Doe", "john@example.com", actual values
4. **Follow naming conventions** - CamelCase screens, exact component names
5. **Add proper spacing** - Use `gap` and `padding` appropriately
6. **Structure logically** - Group related components, nest layouts properly
7. **Comment when helpful** - Explain complex structures with `//` comments

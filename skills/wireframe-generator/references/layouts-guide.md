---
name: Layouts Guide
description: Complete guide to layout containers (Stack, Grid, Split, Panel, Card) with patterns
---

# Wire DSL Layouts Guide

Layouts are containers that organize components and other layouts. Wire DSL provides 5 layout types, each optimized for different UI patterns.

## Layout Overview

| Layout | Purpose | Children | Common Use Cases |
|--------|---------|----------|------------------|
| **Stack** | Linear arrangement | Multiple | Forms, lists, vertical/horizontal sections |
| **Grid** | Multi-column layout | Cells (span 1-12) | Dashboards, product grids, responsive layouts |
| **Split** | Sidebar + main area | Exactly 2 | Admin panels, navigation + content |
| **Panel** | Bordered section | Exactly 1 | Highlighted sections, form groups |
| **Card** | Content card | Multiple | Product cards, user profiles, info boxes |

---

## Stack Layout

Linear arrangement of children (vertical or horizontal).

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| `direction` | enum | `vertical`, `horizontal` | `vertical` | Stack direction |
| `gap` | enum | `xs`, `sm`, `md`, `lg`, `xl` | - | Space between children |
| `padding` | enum | `xs`, `sm`, `md`, `lg`, `xl` | `0px` | Inner padding |
| `align` | enum | `justify`, `left`, `center`, `right` | `justify` | Horizontal alignment (horizontal stacks only) |

**Spacing Values:**
- `xs` = 4px
- `sm` = 8px
- `md` = 16px
- `lg` = 24px
- `xl` = 32px

### Syntax

```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // children
}
```

### Vertical Stack Examples

**Basic Vertical Stack:**
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "User Profile"
  component Text content: "Personal information"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "email@example.com"
  component Button text: "Save" variant: primary
}
```

**Form with Sections:**
```wire
layout stack(direction: vertical, gap: xl, padding: lg) {
  // Header section
  component Heading text: "Registration Form"
  component Divider

  // Personal info section
  component Label text: "Personal Information"
  layout stack(direction: vertical, gap: md) {
    component Input label: "First Name"
    component Input label: "Last Name"
    component Input label: "Email"
  }

  component Divider

  // Account section
  component Label text: "Account Details"
  layout stack(direction: vertical, gap: md) {
    component Input label: "Username"
    component Input label: "Password"
    component Checkbox label: "I agree to terms"
  }

  // Actions
  layout stack(direction: horizontal, gap: md) {
    component Button text: "Create Account" variant: primary
    component Button text: "Cancel"
  }
}
```

### Horizontal Stack Examples

**Alignment Options:**

```wire
// justify: equal width, fills 100% (default)
layout stack(direction: horizontal, gap: md, align: justify) {
  component Button text: "Option A"
  component Button text: "Option B"
  component Button text: "Option C"
}

// left: natural width, grouped left
layout stack(direction: horizontal, gap: sm, align: left) {
  component Button text: "Edit"
  component Button text: "Delete"
}

// center: natural width, centered
layout stack(direction: horizontal, gap: sm, align: center) {
  component Button text: "Submit" variant: primary
}

// right: natural width, grouped right
layout stack(direction: horizontal, gap: sm, align: right) {
  component IconButton icon: "settings"
  component IconButton icon: "bell"
  component IconButton icon: "user"
}
```

**Action Buttons:**
```wire
layout stack(direction: horizontal, gap: md, align: right) {
  component Button text: "Cancel" variant: secondary
  component Button text: "Save" variant: primary
}
```

**Toolbar:**
```wire
layout stack(direction: horizontal, gap: sm, padding: md, align: justify) {
  component IconButton icon: "menu"
  component Input label: "Search" placeholder: "Search..."
  component IconButton icon: "settings"
  component Image placeholder: "square"
}
```

### Critical Rules

⚠️ **Padding Default:** Stack layouts have **0px padding by default**. Always specify `padding` when needed.

❌ Wrong (no padding):
```wire
layout stack(direction: vertical, gap: md) {
  // content touches edges
}
```

✅ Correct (with padding):
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // content has breathing room
}
```

⚠️ **Align Property:** Only works with `direction: horizontal`. Ignored on vertical stacks.

---

## Grid Layout

12-column responsive grid system for multi-column layouts.

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| `columns` | number | 1-12 | 12 | Total columns in grid |
| `gap` | enum | `xs`, `sm`, `md`, `lg`, `xl` | - | Space between cells |

### Cell Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| `span` | number | 1-12 | 12 | Number of columns to span |
| `align` | enum | `start`, `center`, `end` | - | Vertical alignment within cell |

### Syntax

```wire
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    // takes 8 columns
  }
  cell span: 4 align: end {
    // takes 4 columns, aligned to end
  }
}
```

### Grid Examples

**Two-Column Layout:**
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 6 {
    component Input label: "First Name"
  }
  cell span: 6 {
    component Input label: "Last Name"
  }
}
```

**Dashboard Stats (4 columns):**
```wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component Stat title: "Total Users" value: "2,543"
  }
  cell span: 3 {
    component Stat title: "Revenue" value: "$45,230"
  }
  cell span: 3 {
    component Stat title: "Active" value: "892"
  }
  cell span: 3 {
    component Stat title: "Growth" value: "+12.5%"
  }
}
```

**Product Grid (3 columns):**
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image placeholder: "square" height: 200
      component Heading text: "Product 1"
      component Text content: "$99.99"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image placeholder: "square" height: 200
      component Heading text: "Product 2"
      component Text content: "$79.99"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image placeholder: "square" height: 200
      component Heading text: "Product 3"
      component Text content: "$129.99"
      component Button text: "Buy Now" variant: primary
    }
  }
}
```

**Search Bar with Button:**
```wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Enter keywords..."
  }
  cell span: 3 align: end {
    component Button text: "Search" variant: primary
  }
}
```

**Responsive Layout (8-4 split):**
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 8 {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Main Content"
      component Text content: "This is the main content area..."
      component Chart type: "line" height: 300
    }
  }
  cell span: 4 {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Sidebar"
      component List items: "Item 1,Item 2,Item 3"
      component Button text: "View More"
    }
  }
}
```

---

## Split Layout

Two-column layout with fixed-width sidebar and flexible main area.

### Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `sidebar` | number | pixels | Width of sidebar in pixels |
| `gap` | enum | `xs`, `sm`, `md`, `lg`, `xl` | Space between sidebar and main |

### Syntax

```wire
layout split(sidebar: 260, gap: md) {
  layout stack { /* sidebar */ }
  layout stack { /* main content */ }
}
```

### Critical Rules

⚠️ **Exactly 2 Children:** Split layout must have exactly 2 children (no more, no less).

### Split Examples

**Admin Dashboard:**
```wire
layout split(sidebar: 240, gap: md) {
  // Sidebar (first child)
  layout stack(direction: vertical, gap: md, padding: md) {
    component Heading text: "Admin Panel"
    component SidebarMenu items: "Dashboard,Users,Settings,Reports" active: 0
    component Divider
    component Button text: "Logout" variant: ghost
  }

  // Main content (second child)
  layout stack(direction: vertical, gap: lg, padding: lg) {
    component Topbar title: "Dashboard" user: "admin@example.com"
    component Heading text: "Overview"

    layout grid(columns: 12, gap: md) {
      cell span: 3 {
        component Stat title: "Users" value: "1,234"
      }
      cell span: 3 {
        component Stat title: "Revenue" value: "$45K"
      }
      cell span: 3 {
        component Stat title: "Orders" value: "892"
      }
      cell span: 3 {
        component Stat title: "Growth" value: "+12%"
      }
    }

    component Table columns: "Name,Email,Status,Role" rows: 8
  }
}
```

**Documentation Layout:**
```wire
layout split(sidebar: 280, gap: lg) {
  // Navigation sidebar
  layout stack(direction: vertical, gap: sm, padding: lg) {
    component Heading text: "Documentation"
    component Input label: "Search" placeholder: "Search docs..."
    component SidebarMenu items: "Getting Started,Components,Layouts,Examples" active: 1
  }

  // Content area
  layout stack(direction: vertical, gap: md, padding: xl) {
    component Breadcrumbs items: "Home,Documentation,Components"
    component Heading text: "Components Guide"
    component Text content: "Learn about all available UI components..."
    component Code code: "component Button text: 'Click me'"
  }
}
```

**Common Sidebar Widths:**
- Small sidebar: `200-240px`
- Medium sidebar: `260-280px`
- Wide sidebar: `300-320px`

---

## Panel Layout

Bordered/highlighted container for a single child layout.

### Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `padding` | enum | `xs`, `sm`, `md`, `lg`, `xl` | Inner padding |
| `background` | string | color name or hex | Background color |

### Syntax

```wire
layout panel(padding: md, background: white) {
  // exactly one child layout
}
```

### Critical Rules

⚠️ **Exactly 1 Child:** Panel layout must contain exactly one child.

### Panel Examples

**Form Section:**
```wire
layout panel(padding: lg) {
  layout stack(direction: vertical, gap: md) {
    component Heading text: "Account Settings"
    component Input label: "Username"
    component Input label: "Email"
    component Button text: "Update" variant: primary
  }
}
```

**Highlighted Info Box:**
```wire
layout stack(direction: vertical, gap: lg, padding: lg) {
  component Heading text: "User Profile"

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: sm) {
      component Label text: "Personal Information"
      component Text content: "Name: John Doe"
      component Text content: "Email: john@example.com"
      component Text content: "Role: Administrator"
    }
  }

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: sm) {
      component Label text: "Account Status"
      component Badge text: "Active" variant: success
      component Text content: "Member since: January 2024"
    }
  }
}
```

---

## Card Layout

Content card container with multiple children, border, and rounded corners.

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| `padding` | enum | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Inner padding |
| `gap` | enum | `xs`, `sm`, `md`, `lg`, `xl` | `md` | Space between children |
| `radius` | enum | `none`, `sm`, `md`, `lg` | `md` | Corner radius |
| `border` | boolean | `true`, `false` | `true` | Show border |

**Radius Values:**
- `none` = 0px
- `sm` = 2px
- `md` = 4px
- `lg` = 8px

### Syntax

```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  // multiple children
}
```

### Card Examples

**Product Card:**
```wire
layout card(padding: md, gap: md, radius: lg, border: true) {
  component Image placeholder: "square" height: 250
  component Heading text: "Wireless Headphones"
  component Text content: "Premium sound quality with noise cancellation"
  component Badge text: "New Arrival" variant: primary
  layout stack(direction: horizontal, gap: sm, align: justify) {
    component Text content: "$129.99"
    component Button text: "Add to Cart" variant: primary
  }
}
```

**User Profile Card:**
```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image placeholder: "square"
  component Heading text: "John Doe"
  component Text content: "Senior Developer"
  component Divider
  layout stack(direction: vertical, gap: sm) {
    component Text content: "Email: john@example.com"
    component Text content: "Location: San Francisco, CA"
    component Text content: "Member since: 2020"
  }
  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Message" variant: primary
    component Button text: "View Profile"
  }
}
```

**Stats Card:**
```wire
layout card(padding: lg, gap: sm, radius: md, border: true) {
  component Icon name: "users"
  component Heading text: "Total Users"
  component Text content: "2,543 active users"
  component Badge text: "+12% this month" variant: success
}
```

**Pricing Card:**
```wire
layout card(padding: xl, gap: lg, radius: lg, border: true) {
  component Badge text: "Popular" variant: primary
  component Heading text: "Pro Plan"
  component Stat title: "Price" value: "$29/month"
  component Divider
  layout stack(direction: vertical, gap: xs) {
    component Text content: "✓ Unlimited projects"
    component Text content: "✓ 100GB storage"
    component Text content: "✓ Priority support"
    component Text content: "✓ Advanced analytics"
  }
  component Button text: "Choose Plan" variant: primary
}
```

---

## Layout Nesting Patterns

### Pattern 1: Stack in Grid

```wire
layout grid(columns: 12, gap: lg) {
  cell span: 6 {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Heading text: "Section A"
      component Text content: "Content here"
    }
  }
  cell span: 6 {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Heading text: "Section B"
      component Text content: "Content here"
    }
  }
}
```

### Pattern 2: Grid in Stack

```wire
layout stack(direction: vertical, gap: xl, padding: lg) {
  component Heading text: "Dashboard"

  layout grid(columns: 12, gap: md) {
    cell span: 3 {
      component Stat title: "Metric 1" value: "100"
    }
    cell span: 3 {
      component Stat title: "Metric 2" value: "200"
    }
  }

  component Table columns: "Name,Value" rows: 5
}
```

### Pattern 3: Card in Grid

```wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 {
    layout card(padding: md, gap: sm) {
      component Image placeholder: "square" height: 200
      component Heading text: "Card 1"
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: sm) {
      component Image placeholder: "square" height: 200
      component Heading text: "Card 2"
    }
  }
}
```

### Pattern 4: Panel in Stack

```wire
layout stack(direction: vertical, gap: lg, padding: lg) {
  component Heading text: "Settings"

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: md) {
      component Label text: "Notifications"
      component Toggle label: "Email notifications"
      component Toggle label: "Push notifications"
    }
  }

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: md) {
      component Label text: "Privacy"
      component Checkbox label: "Make profile public"
      component Checkbox label: "Show activity status"
    }
  }
}
```

---

## Layout Selection Guide

**Use Stack when:**
- Creating forms (vertical stack)
- Creating toolbars/action bars (horizontal stack)
- Building simple linear layouts
- Stacking sections vertically

**Use Grid when:**
- Creating multi-column layouts
- Building dashboards with metrics
- Creating product grids
- Need responsive column-based layouts

**Use Split when:**
- Building admin interfaces
- Creating documentation layouts
- Need persistent sidebar navigation
- Sidebar + main content pattern

**Use Panel when:**
- Highlighting a specific section
- Grouping related form fields
- Creating bordered containers
- Need visual separation

**Use Card when:**
- Creating product cards
- Building user profile cards
- Creating pricing cards
- Need self-contained content boxes with styling

<!-- Source: docs/LAYOUT-ENGINE.md, .ai/AI-INSTRUCTIONS-MAIN.md, specs/LAYOUT-ENGINE.md -->

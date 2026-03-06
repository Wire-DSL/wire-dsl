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
| **Split** | Two-column area | Exactly 2 | Admin panels, navigation + content |
| **Panel** | Bordered section | Exactly 1 | Highlighted sections, form groups |
| **Card** | Content card | Multiple | Product cards, user profiles, info boxes |

---

## Stack Layout

Linear arrangement of children (vertical or horizontal).

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| `direction` | enum | `vertical`, `horizontal` | required | Stack direction |
| `justify` | enum | `stretch`, `start`, `center`, `end`, `spaceBetween`, `spaceAround` | `stretch` | Distribution along main axis |
| `align` | enum | `start`, `center`, `end` | - | Cross-axis alignment |
| `gap` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | - | Space between children |
| `padding` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | `0px` | Inner padding |

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
  component Text text: "Personal information"
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
  layout stack(direction: horizontal, gap: md, justify: end) {
    component Button text: "Cancel"
    component Button text: "Create Account" variant: primary
  }
}
```

### Horizontal Stack Examples

**Using justify for distribution:**

```wire
// stretch: children fill available space equally (default)
layout stack(direction: horizontal, gap: md, justify: stretch) {
  component Button text: "Option A"
  component Button text: "Option B"
  component Button text: "Option C"
}

// start: children grouped at start
layout stack(direction: horizontal, gap: sm, justify: start) {
  component Button text: "Edit"
  component Button text: "Delete"
}

// center: children centered
layout stack(direction: horizontal, gap: sm, justify: center) {
  component Button text: "Submit" variant: primary
}

// end: children grouped at end
layout stack(direction: horizontal, gap: sm, justify: end) {
  component IconButton icon: "settings"
  component IconButton icon: "bell"
  component IconButton icon: "user"
}

// spaceBetween: equal space between children
layout stack(direction: horizontal, gap: sm, justify: spaceBetween) {
  component Text text: "Left content"
  component Text text: "Right content"
}
```

**Action Buttons:**
```wire
layout stack(direction: horizontal, gap: md, justify: end) {
  component Button text: "Cancel" variant: secondary
  component Button text: "Save" variant: primary
}
```

**Toolbar:**
```wire
layout stack(direction: horizontal, gap: sm, padding: md) {
  component IconButton icon: "menu"
  component Input label: "Search" placeholder: "Search..." iconLeft: "search"
  component IconButton icon: "settings"
  component Image type: avatar
}
```

### Critical Rules

**Padding Default:** Stack layouts have **0px padding by default**. Always specify `padding` when needed.

Wrong (no padding):
```wire
layout stack(direction: vertical, gap: md) {
  // content touches edges
}
```

Correct (with padding):
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // content has breathing room
}
```

---

## Grid Layout

12-column responsive grid system for multi-column layouts.

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| `columns` | number | 1-12 | required | Total columns in grid |
| `gap` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | - | Space between cells |
| `justify` | enum | `stretch`, `start`, `center`, `end`, `spaceBetween`, `spaceAround` | - | Cell distribution |
| `padding` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | - | Inner padding |

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
    component Stat title: "Total Users" value: "2,543" icon: "users"
  }
  cell span: 3 {
    component Stat title: "Revenue" value: "$45,230" icon: "dollar-sign"
  }
  cell span: 3 {
    component Stat title: "Active" value: "892" icon: "activity"
  }
  cell span: 3 {
    component Stat title: "Growth" value: "+12.5%" icon: "trending-up"
  }
}
```

**Product Grid (3 columns):**
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image type: square height: 200
      component Heading text: "Product 1"
      component Text text: "$99.99"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image type: square height: 200
      component Heading text: "Product 2"
      component Text text: "$79.99"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image type: square height: 200
      component Heading text: "Product 3"
      component Text text: "$129.99"
      component Button text: "Buy Now" variant: primary
    }
  }
}
```

**Search Bar with Button:**
```wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Enter keywords..." iconLeft: "search"
  }
  cell span: 3 {
    layout stack(direction: horizontal, justify: end) {
      component Button text: "Search" variant: primary
    }
  }
}
```

**Responsive Layout (8-4 split):**
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 8 {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Main Content"
      component Text text: "This is the main content area..."
      component Chart type: line height: 300
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

Two-column layout with fixed-width side and flexible main area.

### Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `left` | number | pixels | Width of left panel in pixels |
| `right` | number | pixels | Width of right panel in pixels |
| `background` | string | color | Background color |
| `border` | boolean | `true`, `false` | Show border between panels |
| `gap` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | Space between panels |
| `padding` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | Inner padding |

Use either `left` or `right` to specify which panel has a fixed width. The other panel fills remaining space.

### Syntax

```wire
layout split(left: 260, gap: md, border: true) {
  layout stack { /* left panel */ }
  layout stack { /* main content */ }
}
```

### Critical Rules

**Exactly 2 Children:** Split layout must have exactly 2 children (no more, no less).

**Deprecated:** The `sidebar` parameter was removed. Use `left` or `right` instead.

### Split Examples

**Admin Dashboard:**
```wire
layout split(left: 240, gap: md) {
  // Left panel (first child)
  layout stack(direction: vertical, gap: md, padding: md) {
    component Heading text: "Admin Panel"
    component SidebarMenu items: "Dashboard,Users,Settings,Reports" icons: "home,users,settings,file-text" active: 0
    component Divider
    component Button text: "Logout" variant: secondary
  }

  // Main content (second child)
  layout stack(direction: vertical, gap: lg, padding: lg) {
    component Topbar title: "Dashboard" user: "admin@example.com"
    component Heading text: "Overview"

    layout grid(columns: 12, gap: md) {
      cell span: 3 {
        component Stat title: "Users" value: "1,234" icon: "users"
      }
      cell span: 3 {
        component Stat title: "Revenue" value: "$45K" icon: "dollar-sign"
      }
      cell span: 3 {
        component Stat title: "Orders" value: "892" icon: "shopping-cart"
      }
      cell span: 3 {
        component Stat title: "Growth" value: "+12%" icon: "trending-up"
      }
    }

    component Table columns: "Name,Email,Status,Role" rows: 8
  }
}
```

**Documentation Layout:**
```wire
layout split(left: 280, gap: lg, border: true) {
  // Navigation left panel
  layout stack(direction: vertical, gap: sm, padding: lg) {
    component Heading text: "Documentation"
    component Input label: "Search" placeholder: "Search docs..." iconLeft: "search"
    component SidebarMenu items: "Getting Started,Components,Layouts,Examples" active: 1
  }

  // Content area
  layout stack(direction: vertical, gap: md, padding: xl) {
    component Breadcrumbs items: "Home,Documentation,Components"
    component Heading text: "Components Guide"
    component Text text: "Learn about all available UI components..."
    component Code code: "component Button text: 'Click me'"
  }
}
```

**Common Fixed-Width Sizes:**
- Small panel: `200-240px`
- Medium panel: `260-280px`
- Wide panel: `300-320px`

---

## Panel Layout

Bordered/highlighted container for a single child layout.

### Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `padding` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | Inner padding |
| `gap` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | Space between children |
| `background` | string | color name or hex | Background color |

### Syntax

```wire
layout panel(padding: md) {
  // exactly one child layout
}
```

### Critical Rules

**Exactly 1 Child:** Panel layout must contain exactly one child.

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
      component Text text: "Name: John Doe"
      component Text text: "Email: john@example.com"
      component Text text: "Role: Administrator"
    }
  }

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: sm) {
      component Label text: "Account Status"
      component Badge text: "Active" variant: success
      component Text text: "Member since: January 2024"
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
| `padding` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | `md` | Inner padding |
| `gap` | enum | `none`, `xs`, `sm`, `md`, `lg`, `xl` | `md` | Space between children |
| `radius` | enum | `none`, `sm`, `md`, `lg` | `md` | Corner radius |
| `border` | boolean | `true`, `false` | `true` | Show border |
| `background` | string | color name or hex | - | Background color |

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
  component Image type: square height: 250
  component Heading text: "Wireless Headphones"
  component Text text: "Premium sound quality with noise cancellation"
  component Badge text: "New Arrival" variant: primary
  layout stack(direction: horizontal, gap: sm, justify: spaceBetween) {
    component Text text: "$129.99"
    component Button text: "Add to Cart" variant: primary
  }
}
```

**User Profile Card:**
```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image type: avatar circle: true
  component Heading text: "John Doe"
  component Text text: "Senior Developer"
  component Divider
  layout stack(direction: vertical, gap: sm) {
    component Text text: "Email: john@example.com"
    component Text text: "Location: San Francisco, CA"
    component Text text: "Member since: 2020"
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
  component Icon icon: "users" variant: primary
  component Heading text: "Total Users"
  component Text text: "2,543 active users"
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
    component Text text: "Unlimited projects"
    component Text text: "100GB storage"
    component Text text: "Priority support"
    component Text text: "Advanced analytics"
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
      component Text text: "Content here"
    }
  }
  cell span: 6 {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Heading text: "Section B"
      component Text text: "Content here"
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
      component Image type: square height: 200
      component Heading text: "Card 1"
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: sm) {
      component Image type: square height: 200
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
- Left panel + main content pattern

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

<!-- Source: @wire-dsl/language-support components.ts LAYOUTS -->

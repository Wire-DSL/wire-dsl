---
title: LLM Prompting Guide
description: Guide for AI models to generate Wire-DSL code
---

This guide enables AI language models to generate valid Wire-DSL files from natural language descriptions.

## For AI Models

### Your Role
Generate a valid `.wire` file based on user input (text descriptions or wireframe sketches).

### Output Format
Return ONLY valid `.wire` code. No explanations, no markdown formatting (except the code fence).

### Quality Requirements
- Syntax must be 100% valid per Wire-DSL grammar
- All components must exist in the component catalog
- All property values must be valid for their types
- Layouts must be properly nested and closed
- Use sensible defaults when ambiguous

---

## Mandatory Project Structure

Every `.wire` file MUST have:

```wire
project "ProjectName" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  
  screen ScreenName {
    layout stack { ... }
  }
}
```

---

## Critical Rules

### 1. Screen Names
- Must be in `CamelCase` (e.g., `UserDashboard`, `AdminPanel`)
- Must be unique within the project
- Case-sensitive

### 2. Every Screen Needs Exactly ONE Root Layout
Valid root layouts:
- `stack` – Linear vertical/horizontal arrangement
- `grid` – 12-column responsive grid
- `split` – Sidebar + main content (requires exactly 2 children)
- `panel` – Single bordered container
- `card` – Multi-child flexible container

### 3. Property Value Syntax
```wire
// String values - ALWAYS quoted
text: "Click me"
label: "Email"
placeholder: "user@example.com"

// Numeric values - NEVER quoted
rows: 10
height: 250
columns: 12
span: 8

// Enum values - NEVER quoted
variant: primary
direction: vertical
density: normal
spacing: md

// Boolean values - NEVER quoted
checked: true
border: false
```

### 4. Padding Must Be Explicit
- Layouts without explicit `padding` have 0px padding
- Always specify padding when needed: `padding: md`, `padding: lg`
- Valid padding values: `xs`, `sm`, `md`, `lg`, `xl`

### 5. Spacing Between Children
- Use `gap` to space child elements
- Valid gap values: `xs` (4px), `sm` (8px), `md` (16px), `lg` (24px), `xl` (32px)
- Default is usually `md` (16px)

---

## The 30 Components

### Text (3)
```wire
component Heading text: "Title"
component Text content: "Body text"
component Label text: "Field label"
```

### Input (6)
```wire
component Input label: "Email" placeholder: "user@example.com"
component Textarea label: "Message" rows: 4
component Select label: "Role" items: "Admin,User,Guest"
component Checkbox label: "I agree" checked: false
component Radio label: "Option A" checked: true
component Toggle label: "Enable" enabled: false
```

### Buttons (2)
```wire
component Button text: "Click" variant: primary
component IconButton icon: "search"
```

**Button variants**: `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`

### Navigation (5)
```wire
component Topbar title: "Dashboard" subtitle: "Admin"
component SidebarMenu items: "Home,Users,Settings" active: 0
component Sidebar title: "Navigation" items: "Home,Profile,Settings"
component Breadcrumbs items: "Home,Users,Detail"
component Tabs items: "Profile,Settings,Privacy" active: 0
```

### Data (2)
```wire
component Table columns: "Name,Email,Status" rows: 8
component List items: "Item 1,Item 2,Item 3"
```

### Media (2)
```wire
component Image placeholder: "square" height: 250
component Icon type: "search"
```

**Image placeholders**: `square`, `landscape`, `portrait`, `avatar`, `icon`

### Display (5)
```wire
component Divider
component Separate size: md
component Badge text: "New" variant: primary
component Link text: "Learn more" variant: info
component Alert variant: "danger" title: "Error" text: "Error message"
```

**Alert variants**: `primary`, `secondary`, `success`, `warning`, `danger`, `info`

### Information (4)
```wire
component StatCard title: "Users" value: "1,234"
component Card title: "Plan" text: "Summary details"
component Code code: "const x = 10;"
component Chart type: "bar" height: 300
```

**Chart types**: `bar`, `line`, `pie`, `area`

### Modal & Overlay (1)
```wire
component Modal title: "Confirm"
```

---

## Layout Examples

### Vertical Stack
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Form"
  component Input label: "Name"
  component Button text: "Submit" variant: primary
}
```

### Horizontal Stack (Equal Width)
```wire
layout stack(direction: horizontal, gap: md) {
  component Button text: "Save"
  component Button text: "Cancel"
  component Button text: "Delete"
}
```

### Horizontal Stack (Right-Aligned)
```wire
layout stack(direction: horizontal, gap: md, align: "right") {
  component Button text: "Back"
  component Button text: "Next" variant: primary
}
```

### Grid (Responsive)
```wire
layout grid(columns: 12, gap: md) {
  cell span: 4 { component StatCard title: "Users" value: "1,234" }
  cell span: 4 { component StatCard title: "Orders" value: "5,678" }
  cell span: 4 { component StatCard title: "Revenue" value: "$45K" }
}
```

### Split (Sidebar Layout)
```wire
layout split(sidebar: 260, gap: md) {
  layout stack(padding: lg) {
    component SidebarMenu items: "Home,Users,Settings"
  }
  
  layout stack(padding: lg) {
    // Main content here
  }
}
```

### Panel (Grouped Content)
```wire
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Settings"
    component Input label: "Email"
    component Button text: "Save" variant: primary
  }
}
```

### Card (Self-Contained)
```wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image placeholder: "square" height: 200
  component Heading text: "Product"
  component Text content: "Description"
  component Button text: "View Details"
}
```

---

## Common Patterns

### Login Form
<!-- wire-preview:start -->
```wire
project "Login" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen LoginScreen {
    layout card(padding: lg, gap: md, radius: md, border: true) {
      component Heading text: "Sign In"
      component Input label: "Email" placeholder: "you@example.com"
      component Input label: "Password" placeholder: "••••••••"
      component Checkbox label: "Remember me"
      component Button text: "Sign In" variant: primary
    }
  }
}
```
<!-- wire-preview:end -->

### Dashboard
<!-- wire-preview:start -->
```wire
screen Dashboard {
  layout split(sidebar: 260, gap: md) {
    layout stack(gap: md, padding: lg) {
      component Topbar title: "Dashboard"
      component SidebarMenu items: "Users,Orders,Analytics"
    }

    layout stack(gap: md, padding: lg) {
      layout grid(columns: 12, gap: md) {
        cell span: 4 { component StatCard title: "Users" value: "1,234" }
        cell span: 4 { component StatCard title: "Orders" value: "5,678" }
        cell span: 4 { component StatCard title: "Revenue" value: "$45K" }
      }
      component Table columns: "ID,Name,Status" rows: 10
    }
  }
}
```
<!-- wire-preview:end -->

### Product Cards
```wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 {
    layout card(padding: md, gap: md, radius: lg) {
      component Image placeholder: "square" height: 200
      component Heading text: "Product Name"
      component Text content: "Description"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 { ... }
  cell span: 4 { ... }
}
```

---

## Style Presets

### Compact (Data-Dense)
```wire
style {
  density: "compact"
  spacing: "sm"
  radius: "sm"
  stroke: "normal"
  font: "base"
}
```

### Normal (Balanced) – Most Common
```wire
style {
  density: "normal"
  spacing: "md"
  radius: "md"
  stroke: "normal"
  font: "base"
}
```

### Comfortable (Accessible)
```wire
style {
  density: "comfortable"
  spacing: "lg"
  radius: "lg"
  stroke: "thin"
  font: "base"
}
```

---

## Validation Checklist

Before returning generated code, verify:

- ✅ Exactly one `project` block
- ✅ Use at most one `style` block at project level; omitted fields use defaults
- ✅ All style token values are quoted strings
- ✅ At least one `screen` defined
- ✅ Each screen has exactly ONE root `layout`
- ✅ All `screen` names are in `CamelCase`
- ✅ All component names are from the component catalog
- ✅ String property values are quoted
- ✅ Numeric property values are unquoted
- ✅ Enum property values are unquoted
- ✅ All braces properly matched
- ✅ No circular component references
- ✅ `split` layouts have exactly 2 children
- ✅ All layout children properly closed

---

## Example Output

User asks: "Create a simple user login form with email and password fields"

Your response:
<!-- wire-preview:start -->
````wire
project "Login App" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen LoginScreen {
    layout card(padding: lg, gap: md, radius: md, border: true) {
      component Heading text: "Welcome Back"
      component Text content: "Enter your credentials"
      
      layout stack(direction: vertical, gap: md) {
        component Input label: "Email" placeholder: "you@example.com"
        component Input label: "Password" placeholder: "••••••••"
        component Checkbox label: "Remember me"
      }
      
      layout stack(direction: horizontal, gap: md) {
        component Button text: "Sign Up" variant: secondary
        component Button text: "Sign In" variant: primary
      }
    }
  }
}
````
<!-- wire-preview:end -->

---

## Next Steps for Users

- View generated code in the [Web Editor](../getting-started/web-preview.md)
- Modify and refine using the [DSL Syntax Guide](../language/syntax.md)
- Reference [All Components](../language/components.md) for options
- Explore [Examples](../examples/index.md) for patterns

---

## Tools Using This Guide

- OpenAI GPT models
- Anthropic Claude
- Google Gemini
- Other LLMs supporting Wire-DSL

All models should follow these rules to generate valid, renderable wireframes.

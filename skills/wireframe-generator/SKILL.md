---
name: wireframe-generator
description: Generate Wire DSL code for wireframes and UI prototypes
---

# Wire DSL Code Generator

Generate syntactically correct Wire DSL code for wireframes and interactive UI prototypes.

## What This Skill Does

This skill enables LLMs to generate valid, current Wire DSL by providing:
- Complete syntax reference and grammar rules
- Catalog of all 30 available components
- Layout container patterns (stack, grid, split, panel, card, tabs, modal)
- Best practices for code generation
- Event and interactivity rules used by play test

## Branch-Synced Changes

This skill is updated for the changes in `feature/add-event-system`, including:
- Event system with component and layout event handlers
- New actions: `enable(id)` and `disable(id)` (plus `navigate`, `show`, `hide`, `toggle`, `setTab`)
- New layouts: `layout tabs(...)` and `layout modal(...)`
- `component Modal` replaced by `layout modal(...)`
- `component Tabs` now supports `initialActive` and `tabsId`
- `layout card(...)` supports `onClick`
- `Checkbox`, `Radio`, and `Toggle` support `clickable: false` for non-interactive rendering

## When to Use This Skill

Use this skill when you need to:
- Generate `.wire` files for wireframe prototypes
- Create UI mockups using declarative syntax
- Add clickable interactions for play test flows
- Build multi-screen application wireframes
- Design forms, dashboards, product catalogs, or admin interfaces
- Convert UI requirements into Wire DSL code

## Core Concepts

**Structure:** Every Wire DSL file follows this hierarchy:
```
project -> [style|colors|mocks|define] -> screen -> layout -> children
```

**Syntax Style:** Block-declarative with curly braces, similar to CSS/HCL:
```wire
project "App Name" {
  style { ... } // optional
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

Begin with the project wrapper. The `style` block is optional. If omitted, defaults apply (`density: "normal"`, `spacing: "md"`, `radius: "md"`, `stroke: "normal"`, `font: "base"`).

```wire
project "Project Name" {
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

**Naming:** Use CamelCase for screen names (for example: `UsersList`, `ProductDetail`, `Dashboard`).

### Step 3: Choose a Layout Container

Select the appropriate layout based on UI structure:

| Layout | Use Case | Children | Example |
|--------|----------|----------|---------|
| **stack** | Linear arrangement | Multiple | Forms, lists, vertical/horizontal sections |
| **grid** | Multi-column (12-col) | cells | Dashboards, product grids, responsive layouts |
| **split** | Two-column area | Exactly 2 | Admin panels, navigation + content |
| **panel** | Bordered container | Exactly 1 | Highlighted sections, form groups |
| **card** | Content cards | Multiple | Product cards, user profiles, info boxes |
| **tabs** | Tabbed content panels | `tab` blocks | Settings pages, profile tabs, step flows |
| **modal** | Overlay dialog | Multiple (or `body` / `footer`) | Confirmation and form dialogs |

### Step 4: Add Components

Choose from 30 available components organized in 8 categories:

**Text:** Heading, Text, Label, Paragraph, Code  
**Input:** Input, Textarea, Select, Checkbox, Radio, Toggle  
**Action:** Button, IconButton, Link  
**Navigation:** Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs  
**Data:** Table, List, Stat, Chart  
**Media:** Image, Icon  
**Layout:** Card, Divider, Separate  
**Feedback:** Badge, Alert

### Step 5: Add Events and Actions (When Needed)

Events are metadata for play test interactions.

**Supported event props:**
- `onClick`: Button, IconButton, Link, and `layout card(...)`
- `onChange` or `onActive` + `onInactive`: Toggle, Checkbox, Radio
- `onItemsClick`: SidebarMenu
- `onItemClick`: List
- `onRowClick`: Table
- `onClose`: `layout modal(...)`

**Supported actions:**
- `navigate(ScreenName)`
- `show(id)` / `hide(id)` / `toggle(id)`
- `enable(id)` / `disable(id)`
- `setTab(tabsId, index)`
- Use `self` for self-targeting: `hide(self)`, `show(self)`, `toggle(self)`, `enable(self)`, `disable(self)`

**Action chaining:**
```wire
component Button text: "Delete"
  onClick: hide(listModal) & show(confirmModal) & disable(submitBtn)
```

### Step 6: Validate Before Output

Before outputting, check:
- All strings are quoted
- Numbers/booleans/enums are NOT quoted
- All braces are closed
- Required properties are present
- Component names match exactly (case-sensitive)
- Split has 2 children, Panel has 1 child
- Grid cells have valid `span` values (1-12)
- `tabsId` points to an existing `layout tabs(id: ...)` in the same screen
- `show` / `hide` / `toggle` / `enable` / `disable` targets exist on the same screen (or use `self`)
- `onChange` is not combined with `onActive`/`onInactive`
- `layout modal(...)` does not mix `body`/`footer` sections with direct children

## Reference Files

| File | Purpose |
|------|---------|
| [../../docs/DSL-SYNTAX.md](../../docs/DSL-SYNTAX.md) | Current language syntax and event rules |
| [../../docs/COMPONENTS-REFERENCE.md](../../docs/COMPONENTS-REFERENCE.md) | Current component properties and event support |
| [../../docs/CONTAINERS-REFERENCE.md](../../docs/CONTAINERS-REFERENCE.md) | Current layout/container rules (`tabs`, `modal`, `card onClick`) |
| [../../specs/VALIDATION-RULES.md](../../specs/VALIDATION-RULES.md) | Event, modal, and semantic validation rules |
| [core-syntax.md](references/core-syntax.md) | Skill-local syntax summary |
| [components-catalog.md](references/components-catalog.md) | Skill-local component catalog |
| [layouts-guide.md](references/layouts-guide.md) | Skill-local layout guide |
| [best-practices.md](references/best-practices.md) | Validation checklist, common mistakes, gotchas |
| [common-patterns.md](references/common-patterns.md) | Reusable patterns for forms, dashboards, navigation, cards |

## Examples

### Example 1: Interactive Modal + Enable/Disable

```wire
project "Confirm Action" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Main {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Input id: reasonInput label: "Reason" disabled: true
      component Checkbox label: "I understand the consequences"
        onActive: enable(reasonInput) & enable(deleteBtn)
        onInactive: disable(reasonInput) & disable(deleteBtn)

      component Button id: deleteBtn text: "Delete Item" variant: danger disabled: true
        onClick: show(confirmDelete)

      layout modal(id: confirmDelete, title: "Delete item?", visible: false, onClose: hide(self)) {
        body {
          component Text text: "This action cannot be undone."
        }
        footer {
          component Button text: "Cancel" variant: secondary onClick: hide(self)
          component Button text: "Confirm Delete" variant: danger onClick: hide(self)
        }
      }
    }
  }
}
```

### Example 2: Tabs Linked to Tabs Layout

```wire
project "Profile Settings" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Settings {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Tabs items: "Profile,Security,Billing" initialActive: 0 tabsId: settingsTabs

      layout tabs(id: settingsTabs) {
        tab {
          component Heading text: "Profile"
          component Input label: "Full name"
          component Input label: "Email"
        }
        tab {
          component Heading text: "Security"
          component Toggle label: "Two-factor auth"
          component Button text: "Go Billing" onClick: setTab(settingsTabs, 2)
        }
        tab {
          component Heading text: "Billing"
          component Table columns: "Date,Amount,Status" rows: 4
        }
      }
    }
  }
}
```

### Example 3: Clickable Card + Sidebar Navigation

```wire
project "Admin" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  define Component "MainMenu" {
    layout stack(direction: vertical, gap: md, padding: md) {
        component SidebarMenu items: "Dashboard,Users,Settings"
          onItemsClick: "DashboardScreen,UsersScreen,SettingsScreen"
          active: prop_active
      }
  }

  screen DashboardScreen {
    layout split(left: 260, gap: md) {
      component MainMenu active: 0

      layout grid(columns: 12, gap: md, padding: md) {
        cell span: 6 {
          layout card(padding: md, gap: md, onClick: navigate(UsersScreen)) {
            component Heading text: "Users"
            component Text text: "Open users section"
          }
        }
      }
    }
  }

  screen UsersScreen {
    layout split(left: 260, gap: md) {
      component MainMenu active: 1
      layout stack(direction: vertical, gap: md, padding: lg) {
        component Heading text: "Users"
      }
    }
  }

  screen SettingsScreen {
  layout split(left: 260, gap: md) {
      component MainMenu active: 2
      layout stack(direction: vertical, gap: md, padding: lg) {
        component Heading text: "Settings"
      }
    }
  }
}
```

## Quick Tips

**Padding default:** Layouts have `0px` padding by default. Add `padding` explicitly.  
**Grid system:** 12-column grid. `cell span` must be `1-12`.  
**IDs:** Use valid identifiers: `[a-zA-Z_][a-zA-Z0-9_]*`.  
**CSV lists:** Use quoted comma-separated strings: `items: "Home,Users,Settings"`.  
**Tabs linking:** `component Tabs tabsId: X` must match `layout tabs(id: X)` in same screen.  
**Modal model:** Use `layout modal(...)`, not `component Modal`.  
**Boolean controls:** `Checkbox`, `Radio`, `Toggle` support `clickable: false` when needed.

## Common Mistakes to Avoid

- Forgetting quotes on strings: `text: Hello` -> `text: "Hello"`
- Adding quotes to numbers/enums: `rows: "8"` -> `rows: 8`
- Wrong component case: `button` -> `Button`
- Using `component Modal` -> use `layout modal(...)`
- Missing `tabsId` and matching `layout tabs(id: ...)`
- Using `active` as design-time default on Tabs -> prefer `initialActive`
- Mixing `onChange` with `onActive`/`onInactive` on same control
- Referencing unknown IDs in `show/hide/toggle/enable/disable`
- Split with 3 children -> must be exactly 2
- Panel with multiple children -> must be exactly 1
- Mixing modal `body`/`footer` with direct children in the same modal

## Output Guidelines

When generating Wire DSL code:

1. Always validate syntax before outputting
2. Return complete, runnable `.wire` files (not partial snippets)
3. Use realistic names and data
4. Keep component names and property names exact
5. Add explicit layout spacing (`gap`, `padding`)
6. For interactive flows, wire IDs and events consistently
7. Use comments only when they clarify non-obvious structures

## Interactive Example Snippet

```wire
layout stack(direction: vertical, gap: md, padding: md) {
  component Input id: nameInput label: "Name" disabled: true
  component Button text: "Unlock" onClick: enable(nameInput)
  component Button text: "Lock" onClick: disable(nameInput)
  component Button text: "Open confirm" onClick: show(confirmModal)

  layout modal(id: confirmModal, title: "Confirm?", visible: false, onClose: hide(confirmModal)) {
    body {
      layout stack(direction: vertical, padding: sm) {
        component Text text: "Proceed?"
      }
    }
    footer {
      layout stack(direction: vertical, padding: sm) {
        component Button text: "Close" onClick: hide(confirmModal)
      }
    }
  }
}
```

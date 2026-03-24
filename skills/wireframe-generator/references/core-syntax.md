---
name: Core Syntax Reference
description: Complete syntax rules, grammar, and property formats for Wire DSL
---

# Wire DSL Core Syntax

This reference summarizes the current Wire DSL syntax used by the generator skill.

## File Structure

Every `.wire` file uses this hierarchy:

```wire
project "ProjectName" {
  style {
    // optional style overrides
  }

  screen ScreenName {
    layout <type>(...) {
      // components, nested layouts, and section blocks
    }
  }
}
```

Key rules:
- Exactly one `project` block per file.
- `style` is optional.
- At least one `screen` is required.
- Each screen has exactly one root layout.

## Top-Level Keywords

| Keyword | Purpose |
|---------|---------|
| `project` | Root wrapper |
| `style` | Global visual tokens |
| `colors` | Color token definitions |
| `mocks` | Mock data definitions |
| `define` | Reusable component/layout definitions |

## Property Value Syntax

- String values are quoted: `text: "Hello"`
- Numbers are not quoted: `rows: 8`
- Booleans are not quoted: `checked: true`
- Enum values are not quoted: `variant: primary`
- CSV lists are quoted strings: `items: "Home,Users,Settings"`

## Layout Keywords

Supported layout containers:
- `stack`
- `grid`
- `split`
- `panel`
- `card`
- `tabs`
- `modal`

Special section keywords:
- `cell` (only inside `layout grid`)
- `tab` (only inside `layout tabs`)
- `body` / `footer` (only inside `layout modal` explicit mode)

## Component Syntax

Components are leaf nodes:

```wire
component Heading text: "Title"
component Input label: "Email" placeholder: "you@example.com"
component Button text: "Save" variant: primary
```

Component names are case-sensitive and use PascalCase.

## Style Block

`style` is optional. Omitted properties use defaults.

```wire
style {
  density: "normal"   // compact | normal | comfortable
  spacing: "md"       // xs | sm | md | lg | xl
  radius: "md"        // none | sm | md | lg | full
  stroke: "normal"    // thin | normal | thick
  font: "base"        // sm | base | lg
}
```

## Events and Interactivity

Events are declarative metadata for play test interactions.

### IDs

Interactive targets use identifiers:

```wire
component Button id: saveBtn text: "Save"
layout modal(id: confirmModal, title: "Confirm?") { ... }
```

ID format: `[a-zA-Z_][a-zA-Z0-9_]*`

### Event Props

Examples:

```wire
component Button text: "Open" onClick: show(confirmModal)
component Table columns: "Name,Role" rows: 8 onRowClick: navigate(UserDetail)
component Toggle label: "Advanced" onChange: toggle(advancedPanel)
component SidebarMenu items: "Dashboard,Users" onItemsClick: "DashboardScreen,UsersScreen"
layout modal(id: confirmModal, title: "Confirm", onClose: hide(self)) { ... }
```

### Actions

Supported action calls:
- `navigate(ScreenName)`
- `show(id)`
- `hide(id)`
- `toggle(id)`
- `enable(id)`
- `disable(id)`
- `setTab(tabsId, index)`

Chain actions with `&`:

```wire
component Button text: "Delete"
  onClick: hide(listModal) & show(confirmModal) & disable(submitBtn)
```

Use `self` for self-targeting when valid:

```wire
layout modal(id: confirmModal, title: "Confirm", onClose: hide(self)) { ... }
```

## Container-Specific Rules

- `split` must have exactly 2 children.
- `panel` must have exactly 1 child.
- `grid` children must be `cell` blocks with `span: 1..12`.
- `tabs` requires `id`, and children must be `tab` blocks.
- `modal` supports:
  - implicit mode: direct children
  - explicit mode: `body`/`footer`
  - do not mix implicit and explicit mode in the same modal.

## Quick Validation Checklist

Before output:
- Balanced braces and valid `key: value` syntax.
- Strings quoted; numbers/booleans/enums unquoted.
- Valid component and layout names.
- Valid child-count constraints (`split`, `panel`).
- Valid tab/modal section usage.
- Event targets and screen references are valid.

<!-- Sources: docs/DSL-SYNTAX.md, docs/CONTAINERS-REFERENCE.md, packages/engine/src/parser/index.ts -->

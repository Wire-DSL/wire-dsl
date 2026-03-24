---
name: Best Practices
description: Validation rules, common mistakes, gotchas, and quality guidelines
---

# Wire DSL Best Practices

Use this checklist before returning generated DSL.

## Validation Checklist

### Structure
- [ ] Exactly one `project` block.
- [ ] At least one `screen` block.
- [ ] Each screen has exactly one root layout.
- [ ] `split` has exactly 2 children.
- [ ] `panel` has exactly 1 child.
- [ ] `grid` children are `cell` blocks.
- [ ] `tabs` children are `tab` blocks.

### Syntax
- [ ] Strings quoted.
- [ ] Numbers/booleans/enums unquoted.
- [ ] Valid `key: value` format.
- [ ] Braces balanced.
- [ ] CSV values are quoted lists (for example: `items: "A,B,C"`).

### Naming
- [ ] Screen names use CamelCase/PascalCase.
- [ ] Component names use exact PascalCase (`Button`, not `button`).
- [ ] IDs match `[a-zA-Z_][a-zA-Z0-9_]*`.

### Events
- [ ] Event is supported by component/layout type.
- [ ] `show/hide/toggle/enable/disable` targets exist in same screen.
- [ ] `self` is only used in valid contexts (`show/hide/toggle`).
- [ ] `navigate(ScreenName)` points to a declared screen.
- [ ] `tabsId` references `layout tabs(id: ...)` in same screen.
- [ ] `onChange` is not combined with `onActive`/`onInactive`.
- [ ] `onItemsClick` count matches `items` count.

## Common Mistakes

### Mistake 1: Using `component Modal` Instead of `layout modal(...)`

Wrong:
```wire
component Modal title: "Confirm?"
```

Correct:
```wire
layout modal(id: confirmModal, title: "Confirm?") {
  body { component Text text: "Are you sure?" }
}
```

### Mistake 2: Tabs Without Matching `layout tabs(id: ...)`

Wrong:
```wire
component Tabs items: "A,B,C" tabsId: mainTabs
// missing layout tabs(id: mainTabs)
```

Correct:
```wire
component Tabs items: "A,B,C" initialActive: 0 tabsId: mainTabs
layout tabs(id: mainTabs) {
  tab { component Heading text: "A" }
  tab { component Heading text: "B" }
  tab { component Heading text: "C" }
}
```

### Mistake 3: Using Legacy `activeIndex` on Tabs

Wrong:
```wire
component Tabs items: "Profile,Settings" activeIndex: 0
```

Correct:
```wire
component Tabs items: "Profile,Settings" initialActive: 0
```

### Mistake 4: Mixing `onChange` With `onActive`/`onInactive`

Wrong:
```wire
component Toggle label: "Mode"
  onChange: toggle(advancedPanel)
  onActive: show(advancedPanel)
```

Correct (option A):
```wire
component Toggle label: "Mode" onChange: toggle(advancedPanel)
```

Correct (option B):
```wire
component Toggle label: "Mode"
  onActive: show(advancedPanel)
  onInactive: hide(advancedPanel)
```

### Mistake 5: Event on Unsupported Component Type

Wrong:
```wire
component Heading text: "Dashboard" onClick: navigate(Home)
```

Correct:
```wire
component Button text: "Go Home" onClick: navigate(Home)
```

### Mistake 6: Invalid or Missing Event Target IDs

Wrong:
```wire
component Button text: "Open" onClick: show(confirmModal)
// no node with id: confirmModal in this screen
```

Correct:
```wire
layout modal(id: confirmModal, title: "Confirm?", visible: false) {
  body { component Text text: "..." }
}
component Button text: "Open" onClick: show(confirmModal)
```

### Mistake 7: Invalid Use of `self`

Wrong:
```wire
component Button text: "Next" onClick: navigate(self)
component Button text: "Tab 2" onClick: setTab(self, 1)
```

Correct:
```wire
layout modal(id: confirmModal, title: "Confirm", onClose: hide(self)) {
  footer { component Button text: "Close" onClick: hide(self) }
}
```

### Mistake 8: Mixing Modal Direct Children With `body/footer`

Wrong:
```wire
layout modal(id: m1, title: "Confirm") {
  component Text text: "Direct child"
  body { component Text text: "Body child" }
}
```

Correct (implicit mode):
```wire
layout modal(id: m1, title: "Confirm") {
  component Text text: "Direct child only"
}
```

Correct (explicit mode):
```wire
layout modal(id: m1, title: "Confirm") {
  body { component Text text: "Body child" }
  footer { component Button text: "OK" onClick: hide(self) }
}
```

### Mistake 9: Using Deprecated `sidebar` in `split`

Wrong:
```wire
layout split(sidebar: 260, gap: md) { ... }
```

Correct:
```wire
layout split(left: 260, gap: md) { ... }
```

### Mistake 10: Incorrect Property Names (`content`, `name`, `error`)

Wrong:
```wire
component Text content: "Hello"
component Icon name: "user"
component Alert variant: error text: "Failed"
```

Correct:
```wire
component Text text: "Hello"
component Icon icon: "user"
component Alert variant: danger text: "Failed"
```

## Gotchas

### 1) Modal Modes
Use either:
- implicit mode (direct children), or
- explicit mode (`body` / `footer`).

Do not mix both in one modal.

### 2) Tabs Linking
`component Tabs tabsId: mainTabs` must pair with:

```wire
layout tabs(id: mainTabs) { ... }
```

### 3) Boolean Controls and Interactivity
`Checkbox`, `Radio`, and `Toggle` can be made non-interactive with `clickable: false`.

### 4) Event Chains
You can chain actions with `&`, but each target must remain valid.

```wire
component Button text: "Continue"
  onClick: hide(step1) & show(step2) & enable(nextInput)
```

## Quality Guidelines

- Prefer realistic labels and data (`john@example.com`, `Dashboard`, `UserDetail`).
- Use consistent spacing tokens (`md` and `lg` are strong defaults).
- Keep nesting readable (avoid unnecessary deep trees).
- Group related fields in `panel` or nested `stack` blocks.
- Use comments only for non-obvious structure.

## Pre-Output Sanity Pass

1. Parse mentally for syntax.
2. Verify required properties.
3. Verify child-count constraints.
4. Verify event target references.
5. Verify tabs and modal structure.

<!-- Sources: specs/VALIDATION-RULES.md, docs/DSL-SYNTAX.md -->

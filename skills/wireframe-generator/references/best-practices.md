---
name: Best Practices
description: Validation rules, common mistakes, gotchas, and quality guidelines
---

# Wire DSL Best Practices

This guide covers validation rules, common mistakes, gotchas, and quality guidelines for generating valid Wire DSL code.

## Validation Checklist

Use this checklist before outputting Wire DSL code to ensure validity.

### Structure Validation

- [ ] File starts with `project` block
- [ ] If using a `style` block, use `style` (not `theme`)
- [ ] Project has at least one `screen` block
- [ ] Each screen has exactly one root layout
- [ ] All opening braces `{` have matching closing braces `}`
- [ ] Split layouts have exactly 2 children
- [ ] Panel layouts have exactly 1 child
- [ ] Grid cells are inside grid layouts only

### Syntax Validation

- [ ] All string values are quoted: `text: "Hello"`
- [ ] Numbers are NOT quoted: `height: 200`
- [ ] Booleans are NOT quoted: `checked: true`
- [ ] Enums are NOT quoted: `variant: primary`
- [ ] Properties use `key: value` format
- [ ] CSV lists use comma-separated strings: `items: "A,B,C"`
- [ ] No trailing commas or semicolons

### Naming Validation

- [ ] Screen names use CamelCase: `UsersList`, `Dashboard`
- [ ] Component names match exactly (case-sensitive): `Button`, `Input`
- [ ] Property names use camelCase: `gap`, `padding`, `iconLeft`
- [ ] Screen names are unique within the project

### Properties Validation

- [ ] All required properties are present
- [ ] Property values match valid options/enums
- [ ] Icon names are valid Feather Icons
- [ ] Grid cell `span` values are 1-12
- [ ] Chart types are: `bar`, `line`, `pie`, `area`
- [ ] Image `type` values are: `landscape`, `portrait`, `square`, `icon`, `avatar`
- [ ] Variants use `danger` (not `error`) and `default` (not `ghost`)

### Layout Validation

- [ ] `padding` specified when needed (default is 0px)
- [ ] `justify` and `align` used correctly (not interchanged)
- [ ] `columns` specified for grid layouts
- [ ] Split uses `left` or `right` (not deprecated `sidebar`)
- [ ] Spacing tokens are valid: `none`, `xs`, `sm`, `md`, `lg`, `xl`

---

## Common Mistakes

### Mistake #1: Using `theme` Instead of `style`

Wrong:
```wire
project "My App" {
  theme {
    density: "normal"
  }
}
```

Correct:
```wire
project "My App" {
  style {
    density: "normal"
  }
}
```

**Rule:** The style block keyword is `style`, not `theme`. Both the block and its properties are optional.

---

### Mistake #2: Forgetting Quotes on Strings

Wrong:
```wire
component Heading text: Hello World
component Input label: Email
```

Correct:
```wire
component Heading text: "Hello World"
component Input label: "Email"
```

**Rule:** All string values MUST be quoted.

---

### Mistake #3: Adding Quotes to Numbers/Booleans

Wrong:
```wire
component Image height: "200"
component Checkbox checked: "true"
component Table rows: "8"
```

Correct:
```wire
component Image height: 200
component Checkbox checked: true
component Table rows: 8
```

**Rule:** Numbers, booleans, and enums are NOT quoted.

---

### Mistake #4: Wrong Component Case

Wrong:
```wire
component button text: "Click"
component INPUT label: "Name"
component heading text: "Title"
```

Correct:
```wire
component Button text: "Click"
component Input label: "Name"
component Heading text: "Title"
```

**Rule:** Component names are case-sensitive and use PascalCase.

---

### Mistake #5: Wrong Screen Naming

Wrong:
```wire
screen user-list { }
screen Users_List { }
screen userslist { }
```

Correct:
```wire
screen UsersList { }
screen UsersListPage { }
screen DashboardView { }
```

**Rule:** Screen names use CamelCase (PascalCase).

---

### Mistake #6: Using `content` Instead of `text` on Text Component

Wrong:
```wire
component Text content: "Hello world"
```

Correct:
```wire
component Text text: "Hello world"
```

**Rule:** The Text component property is `text`, not `content`.

---

### Mistake #7: Using `name` Instead of `icon` on Icon Component

Wrong:
```wire
component Icon name: "star"
```

Correct:
```wire
component Icon icon: "star"
```

**Rule:** The Icon component property is `icon`, not `name`.

---

### Mistake #8: Using `activeIndex` Instead of `active` on Tabs

Wrong:
```wire
component Tabs items: "A,B,C" activeIndex: 0
```

Correct:
```wire
component Tabs items: "A,B,C" active: 0
```

**Rule:** The Tabs property is `active`, not `activeIndex`.

---

### Mistake #9: Using `error` Variant Instead of `danger`

Wrong:
```wire
component Badge text: "Error" variant: error
component Alert type: "error" message: "Failed"
```

Correct:
```wire
component Badge text: "Error" variant: danger
component Alert variant: danger text: "Failed"
```

**Rule:** Use `danger`, not `error`. Alert uses `variant`/`title`/`text` properties.

---

### Mistake #10: Using Deprecated `sidebar` on Split

Wrong:
```wire
layout split(sidebar: 260, gap: md) {
  layout stack { }
  layout stack { }
}
```

Correct:
```wire
layout split(left: 260, gap: md) {
  layout stack { }
  layout stack { }
}
```

**Rule:** `sidebar` was removed. Use `left` or `right` instead.

---

### Mistake #11: Missing Padding

Wrong (content touches edges):
```wire
layout stack(direction: vertical, gap: md) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

Correct (with padding):
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

**Rule:** Layouts default to 0px padding. Always specify `padding` when needed.

---

### Mistake #12: Confusing `justify` and `align` on Stacks

Wrong:
```wire
layout stack(direction: horizontal, gap: md, align: justify) {
  component Button text: "Left"
  component Button text: "Right"
}
```

Correct:
```wire
layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
  component Button text: "Left"
  component Button text: "Right"
}
```

**Rule:** `justify` controls distribution along main axis (`stretch`, `start`, `center`, `end`, `spaceBetween`, `spaceAround`). `align` controls cross-axis alignment (`start`, `center`, `end`).

---

### Mistake #13: Wrong Number of Children

Wrong (Split needs exactly 2):
```wire
layout split(left: 260, gap: md) {
  layout stack { }
  layout stack { }
  layout stack { }  // Too many!
}
```

Wrong (Panel needs exactly 1):
```wire
layout panel(padding: md) {
  component Heading text: "Title"
  component Text text: "Body"  // Too many!
}
```

Correct:
```wire
layout split(left: 260, gap: md) {
  layout stack { }
  layout stack { }
}

layout panel(padding: md) {
  layout stack(gap: md) {
    component Heading text: "Title"
    component Text text: "Body"
  }
}
```

**Rule:** Split requires exactly 2 children, Panel requires exactly 1.

---

### Mistake #14: Invalid Grid Span

Wrong:
```wire
layout grid(columns: 12, gap: md) {
  cell span: 15 {  // Max is 12
    component Input label: "Name"
  }
  cell span: 0 {   // Min is 1
    component Button text: "Submit"
  }
}
```

Correct:
```wire
layout grid(columns: 12, gap: md) {
  cell span: 12 {
    component Input label: "Name"
  }
  cell span: 3 {
    component Button text: "Submit"
  }
}
```

**Rule:** Grid cell `span` values must be 1-12.

---

### Mistake #15: Using `theme` Instead of `style` for the Style Block

Wrong:
```wire
project "My App" {
  theme {
    density: "normal"
  }
}
```

Correct:
```wire
project "My App" {
  style {
    density: "normal"
  }

  screen Home {
    layout stack { }
  }
}
```

**Rule:** The style block keyword is `style`, not `theme`. The style block itself is optional — if omitted, all tokens use their defaults (density: "normal", spacing: "md", radius: "md", stroke: "normal", font: "base").

---

## Critical Gotchas

### Gotcha #1: Padding Defaults to 0px

**Issue:** Layouts do NOT inherit padding from style. Default is 0px.

**Impact:** Content touches edges without explicit padding.

**Solution:** Always specify `padding` when you want spacing:

```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // now has breathing room
}
```

---

### Gotcha #2: `justify` vs `align` on Stacks

**Issue:** These are two separate properties with different purposes.

- `justify` = distribution along main axis (stretch, start, center, end, spaceBetween, spaceAround)
- `align` = cross-axis alignment (start, center, end)

**Impact:** Using wrong values or wrong property name.

**Solution:**
```wire
// Push buttons to the right
layout stack(direction: horizontal, gap: md, justify: end) {
  component Button text: "Cancel"
  component Button text: "Save" variant: primary
}

// Center children on cross axis
layout stack(direction: horizontal, gap: md, align: center) {
  component Icon icon: "info" size: lg
  component Text text: "Small text" size: sm
}
```

---

### Gotcha #3: Split and Panel Child Count

**Issue:** Split requires exactly 2 children, Panel requires exactly 1.

**Impact:** Parser errors if wrong number of children.

**Solution:** Wrap multiple children in a stack for Panel:

```wire
layout panel(padding: md) {
  layout stack(gap: md) {
    component Heading text: "Title"
    component Text text: "Body"
    component Button text: "Action"
  }
}
```

---

### Gotcha #4: Grid Cells Are Not Optional

**Issue:** Components cannot be direct children of grid layouts.

**Impact:** Parser errors.

**Solution:** Always wrap grid content in cells:

```wire
// Wrong
layout grid(columns: 12, gap: md) {
  component Input label: "Name"
}

// Correct
layout grid(columns: 12, gap: md) {
  cell span: 12 {
    component Input label: "Name"
  }
}
```

---

### Gotcha #5: Style Block and Properties Are Optional

**Issue:** The `style` block and each of its properties are optional. Omitted properties use defaults.

**Defaults:** `density: "normal"`, `spacing: "md"`, `radius: "md"`, `stroke: "normal"`, `font: "base"`

**Solution:** Only specify properties you want to override:

```wire
// Override just what you need
style {
  density: "compact"
  radius: "lg"
}

// Or omit the style block entirely for all defaults
```

**Valid values:**
- `density`: `"compact"` | `"normal"` | `"comfortable"`
- `spacing`: `"xs"` | `"sm"` | `"md"` | `"lg"` | `"xl"`
- `radius`: `"none"` | `"sm"` | `"md"` | `"lg"` | `"full"`
- `stroke`: `"thin"` | `"normal"` | `"thick"`
- `font`: `"sm"` | `"base"` | `"lg"`
- `background`: any CSS color string (optional)
- `theme`: `"light"` | `"dark"` (optional)
- `device`: `"mobile"` | `"tablet"` | `"desktop"` | `"print"` | `"a4"` (optional)

---

## Quality Guidelines

### 1. Use Realistic Content

Generic:
```wire
component Input label: "Input 1"
component Button text: "Button"
component Heading text: "Heading"
```

Realistic:
```wire
component Input label: "Email Address" placeholder: "john@example.com" iconLeft: "mail"
component Button text: "Create Account" variant: primary
component Heading text: "User Registration"
```

### 2. Appropriate Spacing

```wire
// Forms: md-lg padding, md gap
layout stack(gap: md, padding: lg)

// Dashboards: lg padding, md-lg gap
layout stack(gap: lg, padding: lg)

// Compact lists: sm gap, md padding
layout stack(gap: sm, padding: md)
```

### 3. Logical Grouping

Good Grouping:
```wire
layout stack(gap: xl, padding: lg) {
  // Header
  component Heading text: "Registration Form"
  component Divider

  // Section 1: Personal Info
  layout stack(gap: md) {
    component Label text: "Personal Information"
    component Input label: "Name"
    component Input label: "Email"
  }

  component Divider

  // Actions
  layout stack(direction: horizontal, gap: md, justify: end) {
    component Button text: "Submit" variant: primary
    component Button text: "Cancel"
  }
}
```

### 4. Consistent Naming

Consistent:
```wire
screen UsersList { }
screen ProductDetails { }
screen SettingsPage { }
```

### 5. Proper Nesting Depth

Balanced:
```wire
screen Dashboard {
  layout stack(gap: lg, padding: lg) {
    component Heading text: "Dashboard"

    layout grid(columns: 12, gap: md) {
      cell span: 3 {
        component Stat title: "Users" value: "100" icon: "users"
      }
      cell span: 3 {
        component Stat title: "Revenue" value: "$5K" icon: "dollar-sign"
      }
    }

    component Chart type: line height: 300
  }
}
```

---

## Pre-Output Validation Script

Before outputting Wire DSL code, mentally run through this validation:

1. **Syntax Check:**
   - Strings quoted?
   - Numbers/booleans NOT quoted?
   - Braces balanced?

2. **Structure Check:**
   - Has project, screen? (style is optional)
   - Split has 2 children?
   - Panel has 1 child?

3. **Naming Check:**
   - Screens CamelCase?
   - Components PascalCase exact?

4. **Properties Check:**
   - Required props present?
   - Values from valid enums?
   - Grid spans 1-12?
   - Uses `text` not `content` for Text?
   - Uses `icon` not `name` for Icon?
   - Uses `active` not `activeIndex` for Tabs?
   - Uses `variant`/`title`/`text` for Alert (not `type`/`message`)?
   - Uses `danger` not `error`?

5. **Layout Check:**
   - Uses `style` not `theme`?
   - Uses `left`/`right` not `sidebar` on split?
   - Padding specified?
   - `justify` and `align` used correctly?

6. **Content Check:**
   - Realistic values?
   - Logical grouping?
   - Appropriate spacing?

---

## Alignment Tips

### Buttons Next to Inputs Should Match Size

When a Button or IconButton sits on the same row as an Input or Select, give both the same `size` so their heights match:

Wrong (mismatched heights):
```wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Type..."
  }
  cell span: 3 {
    component Button text: "Search" variant: primary
  }
}
```

Correct (matching size):
```wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Type..." size: md
  }
  cell span: 3 {
    component Button text: "Search" variant: primary size: md labelSpace: true
  }
}
```

Use `labelSpace: true` on the Button so it reserves the same vertical space as the Input's label, keeping baselines aligned.

---

## Error Prevention Tips

1. **Always validate before output** - Run through the checklist
2. **Use realistic content** - Not "text", "button", etc.
3. **Check child counts** - Split (2), Panel (1)
4. **Verify quotes** - Strings yes, numbers/bools no
5. **Test nesting depth** - Not too shallow, not too deep
6. **Consistent naming** - CamelCase screens, PascalCase components
7. **Specify padding** - Don't rely on defaults (0px)
8. **Logical grouping** - Related items together
9. **Appropriate spacing** - md-lg for most cases
10. **Complete examples** - Full runnable code, not snippets

<!-- Source: @wire-dsl/language-support components.ts, engine parser/index.ts -->

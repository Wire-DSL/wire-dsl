---
name: Best Practices
description: Validation rules, common mistakes, gotchas, and quality guidelines
---

# Wire DSL Best Practices

This guide covers validation rules, common mistakes, gotchas, and quality guidelines for generating valid Wire DSL code.

## Validation Checklist

Use this checklist before outputting Wire DSL code to ensure validity.

### ✅ Structure Validation

- [ ] File starts with `project` block
- [ ] Project has exactly one `theme` block
- [ ] Project has at least one `screen` block
- [ ] Each screen has exactly one root layout
- [ ] All opening braces `{` have matching closing braces `}`
- [ ] Split layouts have exactly 2 children
- [ ] Panel layouts have exactly 1 child
- [ ] Grid cells are inside grid layouts only

### ✅ Syntax Validation

- [ ] All string values are quoted: `text: "Hello"`
- [ ] Numbers are NOT quoted: `height: 200`
- [ ] Booleans are NOT quoted: `checked: true`
- [ ] Enums are NOT quoted: `variant: primary`
- [ ] Properties use `key: value` format
- [ ] CSV lists use comma-separated strings: `items: "A,B,C"`
- [ ] No trailing commas or semicolons

### ✅ Naming Validation

- [ ] Screen names use CamelCase: `UsersList`, `Dashboard`
- [ ] Component names match exactly (case-sensitive): `Button`, `Input`
- [ ] Property names are lowercase: `gap`, `padding`, `placeholder`
- [ ] Screen names are unique within the project

### ✅ Properties Validation

- [ ] All required properties are present
- [ ] Property values match valid options/enums
- [ ] Icon names are valid Feather Icons
- [ ] Grid cell `span` values are 1-12
- [ ] Sidebar widths are reasonable (200-320px)
- [ ] Chart types are: `bar`, `line`, `pie`, `area`
- [ ] Image placeholders are: `square`, `landscape`, `portrait`, `avatar`

### ✅ Layout Validation

- [ ] `padding` specified when needed (default is 0px)
- [ ] `align` only used in horizontal stacks
- [ ] `columns` specified for grid layouts
- [ ] `sidebar` specified for split layouts
- [ ] Spacing tokens are valid: `xs`, `sm`, `md`, `lg`, `xl`

---

## Common Mistakes

### Mistake #1: Forgetting Quotes on Strings

❌ **Wrong:**
```wire
component Heading text: Hello World
component Input label: Email
```

✅ **Correct:**
```wire
component Heading text: "Hello World"
component Input label: "Email"
```

**Rule:** All string values MUST be quoted.

---

### Mistake #2: Adding Quotes to Numbers/Booleans

❌ **Wrong:**
```wire
component Image height: "200"
component Checkbox checked: "true"
component Table rows: "8"
```

✅ **Correct:**
```wire
component Image height: 200
component Checkbox checked: true
component Table rows: 8
```

**Rule:** Numbers, booleans, and enums are NOT quoted.

---

### Mistake #3: Wrong Component Case

❌ **Wrong:**
```wire
component button text: "Click"
component INPUT label: "Name"
component heading text: "Title"
```

✅ **Correct:**
```wire
component Button text: "Click"
component Input label: "Name"
component Heading text: "Title"
```

**Rule:** Component names are case-sensitive and use PascalCase.

---

### Mistake #4: Wrong Screen Naming

❌ **Wrong:**
```wire
screen user-list { }
screen Users_List { }
screen userslist { }
```

✅ **Correct:**
```wire
screen UsersList { }
screen UsersListPage { }
screen DashboardView { }
```

**Rule:** Screen names use CamelCase (PascalCase).

---

### Mistake #5: Missing Padding

❌ **Wrong (content touches edges):**
```wire
layout stack(direction: vertical, gap: md) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

✅ **Correct (with padding):**
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Button text: "Action"
}
```

**Rule:** Layouts default to 0px padding. Always specify `padding` when needed.

---

### Mistake #6: Wrong Number of Children

❌ **Wrong (Split needs exactly 2):**
```wire
layout split(sidebar: 260, gap: md) {
  layout stack { }
  layout stack { }
  layout stack { }  // ❌ Too many!
}
```

❌ **Wrong (Panel needs exactly 1):**
```wire
layout panel(padding: md) {
  component Heading text: "Title"
  component Text content: "Body"  // ❌ Too many!
}
```

✅ **Correct:**
```wire
layout split(sidebar: 260, gap: md) {
  layout stack { }
  layout stack { }
}

layout panel(padding: md) {
  layout stack(gap: md) {
    component Heading text: "Title"
    component Text content: "Body"
  }
}
```

**Rule:** Split requires exactly 2 children, Panel requires exactly 1.

---

### Mistake #7: Using Align on Vertical Stacks

❌ **Wrong (align ignored):**
```wire
layout stack(direction: vertical, gap: md, align: center) {
  component Button text: "Click"
}
```

✅ **Correct:**
```wire
// Only use align with horizontal stacks
layout stack(direction: horizontal, gap: md, align: center) {
  component Button text: "Click"
}
```

**Rule:** `align` property only works on `direction: horizontal` stacks.

---

### Mistake #8: Invalid Grid Span

❌ **Wrong:**
```wire
layout grid(columns: 12, gap: md) {
  cell span: 15 {  // ❌ Max is 12
    component Input label: "Name"
  }
  cell span: 0 {   // ❌ Min is 1
    component Button text: "Submit"
  }
}
```

✅ **Correct:**
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

### Mistake #9: CSV Lists with Spaces

❌ **Wrong:**
```wire
component Select items: "Admin, User, Guest"  // ❌ Spaces!
component Tabs items: "Home , About , Contact"
```

✅ **Correct:**
```wire
component Select items: "Admin,User,Guest"
component Tabs items: "Home,About,Contact"
```

**Rule:** CSV lists use commas with NO spaces.

---

### Mistake #10: Missing Theme Block

❌ **Wrong:**
```wire
project "My App" {
  screen Home {
    layout stack { }
  }
}
```

✅ **Correct:**
```wire
project "My App" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Home {
    layout stack { }
  }
}
```

**Rule:** Theme block is required in every project.

---

## Critical Gotchas

### Gotcha #1: Padding Defaults to 0px

**Issue:** Layouts do NOT inherit padding from theme. Default is 0px.

**Impact:** Content touches edges without explicit padding.

**Solution:** Always specify `padding` when you want spacing:

```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // now has breathing room
}
```

---

### Gotcha #2: Align Only Works on Horizontal Stacks

**Issue:** `align` property is ignored on `direction: vertical` stacks.

**Impact:** Alignment won't work as expected.

**Solution:** Only use `align` with `direction: horizontal`:

```wire
// This works
layout stack(direction: horizontal, gap: md, align: center) {
  component Button text: "Click"
}

// This doesn't work (align ignored)
layout stack(direction: vertical, gap: md, align: center) {
  component Button text: "Click"
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
    component Text content: "Body"
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
// ❌ Wrong
layout grid(columns: 12, gap: md) {
  component Input label: "Name"
}

// ✅ Correct
layout grid(columns: 12, gap: md) {
  cell span: 12 {
    component Input label: "Name"
  }
}
```

---

### Gotcha #5: Theme Properties Are Required

**Issue:** All theme properties must be specified.

**Impact:** Missing any theme property causes validation errors.

**Solution:** Always include all 5 theme properties:

```wire
theme {
  density: "normal"   // required
  spacing: "md"       // required
  radius: "md"        // required
  stroke: "normal"    // required
  font: "base"        // required
}
```

---

## Quality Guidelines

### 1. Use Realistic Content

❌ **Generic:**
```wire
component Input label: "Input 1"
component Button text: "Button"
component Heading text: "Heading"
```

✅ **Realistic:**
```wire
component Input label: "Email Address" placeholder: "john@example.com"
component Button text: "Create Account" variant: primary
component Heading text: "User Registration"
```

### 2. Appropriate Spacing

**Too Tight:**
```wire
layout stack(gap: xs, padding: xs)
```

**Too Loose:**
```wire
layout stack(gap: xl, padding: xl)
```

**Balanced:**
```wire
// Forms: md-lg padding, md gap
layout stack(gap: md, padding: lg)

// Dashboards: lg padding, md-lg gap
layout stack(gap: lg, padding: lg)

// Compact lists: sm gap, md padding
layout stack(gap: sm, padding: md)
```

### 3. Logical Grouping

**Poor Grouping:**
```wire
layout stack(gap: md, padding: lg) {
  component Heading text: "Form"
  component Input label: "Name"
  component Heading text: "Section 2"
  component Input label: "Email"
  component Button text: "Submit"
}
```

**Good Grouping:**
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
  layout stack(direction: horizontal, gap: md) {
    component Button text: "Submit" variant: primary
    component Button text: "Cancel"
  }
}
```

### 4. Consistent Naming

**Inconsistent:**
```wire
screen userlist { }
screen ProductDetails { }
screen settings_page { }
```

**Consistent:**
```wire
screen UsersList { }
screen ProductDetails { }
screen SettingsPage { }
```

### 5. Proper Nesting Depth

**Too Shallow (repetitive):**
```wire
screen Dashboard {
  layout stack {
    component Stat title: "Users" value: "100"
  }
}
screen Analytics {
  layout stack {
    component Stat title: "Revenue" value: "$5K"
  }
}
```

**Too Deep (over-nested):**
```wire
layout stack {
  layout stack {
    layout stack {
      layout stack {
        component Button text: "Click"
      }
    }
  }
}
```

**Balanced:**
```wire
screen Dashboard {
  layout stack(gap: lg, padding: lg) {
    component Heading text: "Dashboard"

    layout grid(columns: 12, gap: md) {
      cell span: 3 {
        component Stat title: "Users" value: "100"
      }
      cell span: 3 {
        component Stat title: "Revenue" value: "$5K"
      }
    }

    component Chart type: "line" height: 300
  }
}
```

---

## Pre-Output Validation Script

Before outputting Wire DSL code, mentally run through this validation:

1. **Syntax Check:**
   - Strings quoted? ✅
   - Numbers/booleans NOT quoted? ✅
   - Braces balanced? ✅

2. **Structure Check:**
   - Has project, theme, screen? ✅
   - Split has 2 children? ✅
   - Panel has 1 child? ✅

3. **Naming Check:**
   - Screens CamelCase? ✅
   - Components PascalCase exact? ✅

4. **Properties Check:**
   - Required props present? ✅
   - Values from valid enums? ✅
   - Grid spans 1-12? ✅

5. **Layout Check:**
   - Padding specified? ✅
   - Align only on horizontal? ✅

6. **Content Check:**
   - Realistic values? ✅
   - Logical grouping? ✅
   - Appropriate spacing? ✅

---

## Common Valid Patterns

### Pattern: Form
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Contact Form"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "you@example.com"
  component Textarea label: "Message" rows: 5
  component Button text: "Send" variant: primary
}
```

### Pattern: Dashboard Stats
```wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component Stat title: "Users" value: "2,543"
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
```

### Pattern: Product Card
```wire
layout card(padding: md, gap: md, radius: lg, border: true) {
  component Image placeholder: "square" height: 220
  component Heading text: "Product Name"
  component Text content: "Product description"
  component Badge text: "In Stock" variant: success
  layout stack(direction: horizontal, gap: sm) {
    component Text content: "$99.99"
    component Button text: "Buy" variant: primary
  }
}
```

### Pattern: Sidebar Layout
```wire
layout split(sidebar: 260, gap: md) {
  layout stack(gap: md, padding: md) {
    component Heading text: "Menu"
    component SidebarMenu items: "Home,Products,Settings" active: 0
  }
  layout stack(gap: lg, padding: lg) {
    component Topbar title: "Dashboard"
    // main content
  }
}
```

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

<!-- Source: specs/VALIDATION-RULES.md, .ai/AI-INSTRUCTIONS-MAIN.md, docs/TROUBLESHOOTING.md -->

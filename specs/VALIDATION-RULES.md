# Validation Rules

## Overview

Validation ensures that Wire-DSL files are **unambiguous** and **renderable**. Validations occur in two phases:

1. **Syntax Validation**: During parsing (structure of DSL)
2. **Semantic Validation**: During normalization (logic and consistency)

---

## Syntax Validations

Performed by the **Parser** during tokenization and parsing phases.

### Project Structure

- ✅ A `project` block must have at least one `screen`
- ✅ A `screen` block must have exactly one root layout
- ✅ Layout blocks must be properly closed with braces
- ✅ All properties must follow the `key: value` format

**Invalid Example**:
```wire
project "App" {
  // ERROR: no screens defined
}
```

**Valid Example**:
```wire
project "App" {
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

### Property Syntax

- ✅ Properties must use format `key: value`
- ✅ All string values must be quoted: `"value"`
- ✅ Numeric values must be unquoted: `12`
- ✅ Enum values must be unquoted: `primary`, `vertical`, `md`
- ✅ No special characters in identifiers

**Valid**:
```wire
component Button text: "Click me" variant: primary size: medium
component Input label: "Email" placeholder: "your@email.com"
```

**Invalid**:
```wire
component Button "Click me"                    // ❌ Missing `text:` key
component Button text: Click me                // ❌ String not quoted
component Input label: "Email" placeholder: @  // ❌ Invalid character
```

### Component Properties

- ✅ Component names must exist in the catalog
- ✅ Property names must be valid for that component
- ✅ Property values must match expected types

**Valid**:
```wire
component Heading title: "Dashboard" level: 1
component Button text: "Submit" variant: primary
component Badge label: "New" color: "success"
```

**Invalid**:
```wire
component FakeComponent { ... }          // ❌ Component doesn't exist
component Button unknownProp: "value"    // ❌ Invalid property
component Input text: 123                // ❌ Expected string, got number
```

### Layout Nesting

- ✅ Layouts must contain at least one child (component or nested layout)
- ✅ `split` layout must have exactly 2 children
- ✅ `grid` layout must have at least one cell
- ✅ All braces must be properly matched

**Valid**:
```wire
layout stack {
  component Button text: "Click"
  layout card {
    component Text text: "Content"
  }
}
```

**Invalid**:
```wire
layout stack { }                    // ❌ Empty layout
layout split {
  component Button text: "A"        // ❌ Split requires 2 children
}
```

---

## Semantic Validations

Performed during **Normalization** phase (IR generation).

### Required Fields

These fields must be present for the document to be valid:

- ✅ `project.name` must not be empty
- ✅ `theme.density` must be specified
- ✅ `screen.name` must be unique and non-empty
- ✅ Each layout must have a valid type

**Example**:
```wire
project "" { ... }  // ❌ Empty project name

// vs.

project "MyApp" { ... }  // ✅ Valid
```

### Theme Validation

- ✅ Theme block must appear at project level (not in screens)
- ✅ All theme values must match valid token values

**Valid theme properties**:
```
density: "normal" | "compact" | "comfortable"
spacing: "xs" | "sm" | "md" | "lg" | "xl" | "none"
radius: "none" | "sm" | "md" | "lg"
stroke: "thin" | "normal"
font: "base" | "title" | "mono"
```

**Invalid**:
```wire
project "App" {
  screen Home {
    theme { density: "normal" }  // ❌ Theme must be at project level
  }
}
```

### Component Property Validation

Each component has specific required and optional properties.

#### Component: Button
- **Required**: `text`
- **Optional**: `variant` (primary|secondary|ghost), `size` (small|medium|large)

**Valid**:
```wire
component Button text: "Submit"
component Button text: "Cancel" variant: secondary size: large
```

**Invalid**:
```wire
component Button                    // ❌ Missing required `text`
component Button text: "OK" size: xs  // ❌ Invalid size value
```

#### Component: Input
- **Required**: (none)
- **Optional**: `label`, `placeholder`, `type` (text|password|email|number)

**Valid**:
```wire
component Input
component Input label: "Email" placeholder: "you@example.com"
component Input type: "password" label: "Password"
```

#### Component: Table
- **Required**: `columns` (CSV list)
- **Optional**: `rows` (number)

**Valid**:
```wire
component Table columns: "Name,Email,Status"
component Table columns: "ID,Title,Date" rows: 10
```

**Invalid**:
```wire
component Table                          // ❌ Missing `columns`
component Table columns: ["A", "B"]      // ❌ Should be CSV, not array
```

#### Component: List
- **Optional**: `items` (CSV list), `type` (ordered|unordered)

**Valid**:
```wire
component List items: "Apple,Banana,Orange"
component List type: "ordered" items: "First,Second,Third"
```

### Layout Property Validation

#### Stack Layout
- **Optional**: `direction` (vertical|horizontal, default: vertical)
- **Optional**: `gap` (spacing token)
- **Optional**: `padding` (spacing token)
- **Optional**: `align` (left|center|right|justify)

**Valid**:
```wire
layout stack { }
layout stack(direction: horizontal, gap: md, padding: lg) { }
layout stack(direction: vertical, gap: sm) { }
```

**Invalid**:
```wire
layout stack(direction: diagonal) { }     // ❌ Invalid direction
layout stack(gap: "extra-large") { }      // ❌ Invalid gap value
```

#### Grid Layout
- **Required**: `columns` (number 1-12)
- **Optional**: `gap` (spacing token)

**Valid**:
```wire
layout grid(columns: 12) { }
layout grid(columns: 12, gap: md) { }
layout grid(columns: 6) { }
```

**Invalid**:
```wire
layout grid { }                    // ❌ Missing `columns`
layout grid(columns: 24) { }       // ❌ Too many columns (max 12)
layout grid(columns: 0) { }        // ❌ Invalid column count
```

#### Grid Cell (inside grid)
- **Optional**: `span` (1-12, default: 1)

**Valid**:
```wire
layout grid(columns: 12) {
  cell span: 4 { ... }
  cell span: 4 { ... }
  cell span: 4 { ... }
}
```

**Invalid**:
```wire
layout grid(columns: 12) {
  cell span: 15 { ... }  // ❌ Span exceeds column count
}
```

#### Split Layout
- **Required**: `sidebar` (number in pixels)
- **Optional**: `gap` (spacing token)
- **Structure**: Must have exactly 2 children

**Valid**:
```wire
layout split(sidebar: 240) { ... } // 2 children
layout split(sidebar: 300, gap: lg) { ... }
```

**Invalid**:
```wire
layout split { }                         // ❌ Missing sidebar width
layout split(sidebar: "200") { }         // ❌ Sidebar should be number
layout split(sidebar: 240) {
  component Button text: "A"             // ❌ Only 1 child
}
```

#### Panel Layout
- **Optional**: `padding` (spacing token)
- **Structure**: Exactly 1 child

**Valid**:
```wire
layout panel { component Text text: "Content" }
layout panel(padding: md) { ... }
```

**Invalid**:
```wire
layout panel { }  // ❌ Empty (no child)
```

#### Card Layout
- **Optional**: `padding` (spacing token)
- **Optional**: `gap` (spacing token)
- **Optional**: `radius` (token)

**Valid**:
```wire
layout card { ... }
layout card(padding: md, gap: sm, radius: md) { ... }
```

---

## Naming Validations

### Screen Names
- ✅ Must be unique within the project
- ✅ Must be in `CamelCase` (recommended)
- ✅ Must be non-empty
- ✅ Case-sensitive

**Valid**:
```wire
screen Dashboard { ... }
screen UserSettings { ... }
screen AdminPanel { ... }
```

**Invalid**:
```wire
screen dashboard { ... }   // ⚠️ Not CamelCase (works but not recommended)
screen Home { ... }
screen Home { ... }        // ❌ Duplicate name
```

### Component Names
- ✅ Must be from the official component catalog
- ✅ Case-sensitive (exact match required)

**Valid**:
```wire
component Button { ... }
component Table { ... }
component Image { ... }
```

**Invalid**:
```wire
component button { ... }     // ❌ Wrong case
component CustomButton { ... }  // ❌ Not in catalog
```

---

## Consistency Validations

### Theme Consistency
- ✅ All spacing values must use valid tokens
- ✅ Colors must be from the standard palette
- ✅ Font names must be supported

### Reference Validation
- ✅ All component references must exist
- ✅ All layout types must be valid
- ✅ No circular dependencies

---

## Error Messages

The validator provides descriptive error messages including:
- Error type
- Location (line and column)
- Expected vs. actual value
- Suggestions for correction

**Example Error**:
```
Error at line 5, column 12:
  Expected `gap` value to be one of: xs, sm, md, lg, xl
  Got: "extra-large"
  
  Suggestion: Use standard spacing tokens (xs|sm|md|lg|xl)
```

---

## Validation Levels

### Level 1: Syntax (Critical)
Must pass or file cannot be parsed.

### Level 2: Semantic (Critical)
Must pass or file cannot be rendered.

### Level 3: Warnings (Informational)
File is valid but may have issues:
- Unused components
- Non-standard naming
- Potential rendering issues

### Level 4: Style (Suggestions)
- Consistency with best practices
- Performance recommendations
- Maintainability suggestions

---

## Testing Validation

Users can validate their files using:

```bash
wire validate myfile.wire              # Full validation
wire validate myfile.wire --strict     # Strict mode (no warnings)
wire render myfile.wire --check        # Parse and check only
```

---

## Migration & Compatibility

When Wire-DSL versions change:
- Old valid files remain valid (backward compatibility)
- New features are opt-in
- Deprecation warnings appear for legacy syntax

---

**Last Updated**: January 2026  
**Status**: Complete Reference

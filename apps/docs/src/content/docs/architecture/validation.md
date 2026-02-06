---
title: Validation Rules
description: Wire-DSL validation rules and requirements
---

Validation ensures that Wire-DSL files are **unambiguous** and **renderable**. Validations occur in multiple phases during processing.

## Validation Phases

### Phase 1: Syntax Validation (Parser)
Checks the structure of the DSL itself during parsing.

### Phase 2: Semantic Validation (IR Generator)
Checks the logic and consistency after parsing.

### Phase 3: Layout Validation (Layout Engine)
Checks constraints and sizing validity during layout calculation.

---

## Syntax Validations

Performed by the **Parser** during tokenization and parsing.

### Project Structure

- ✅ A `project` block must have exactly one `theme` block
- ✅ A `project` block must have at least one `screen`
- ✅ A `screen` block must have exactly one root layout
- ✅ All layout blocks must be properly closed with braces
- ✅ All properties must follow the `key: value` format

**Invalid Example**:
```wire
project "App" {
  // ERROR: no theme block
  screen Home { layout stack { } }
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

- ✅ All properties must use format `key: value`
- ✅ String values must be quoted: `"value"`
- ✅ Numeric values must be unquoted: `12`
- ✅ Enum values must be unquoted: `primary`, `vertical`, `md`
- ✅ Boolean values must be unquoted: `true`, `false`

**Valid**:
```wire
component Button text: "Click me" variant: primary checked: true
component Input label: "Email" placeholder: "your@email.com"
component Spinner
```

**Invalid**:
```wire
component Button "Click me"               // ❌ Missing `text:` key
component Button text: Click              // ❌ String not quoted
component Input label: "Email" placeholder: @  // ❌ Invalid character
```

### Component Properties

- ✅ Component names must exist in the catalog (23 built-in types)
- ✅ Property names must be valid for that component
- ✅ Property values must match expected types

**Valid**:
```wire
component Heading text: "Dashboard"
component Button text: "Submit" variant: primary
component Badge text: "New" variant: success
```

**Invalid**:
```wire
component FakeComponent { ... }        // ❌ Component doesn't exist
component Button unknownProp: "val"    // ❌ Invalid property
component Input text: 123              // ❌ Expected string, got number
```

### Layout Nesting

- ✅ Layouts must contain at least one child (component or nested layout)
- ✅ `split` layout must have exactly 2 children
- ✅ `grid` layout must have at least one `cell`
- ✅ All braces must be properly matched
- ✅ Layout nesting depth recommended ≤ 5 levels

**Invalid**:
```wire
layout split(sidebar: 260) {
  layout stack { }
  // ERROR: split requires exactly 2 children
}
```

**Valid**:
```wire
layout split(sidebar: 260, gap: md) {
  layout stack { }  // Child 1: sidebar
  layout stack { }  // Child 2: content
}
```

### Identifiers

- ✅ Screen names must be in `CamelCase`
- ✅ All identifiers must be unique within project scope
- ✅ Names cannot contain special characters or spaces

**Valid**:
```wire
screen UserDashboard { ... }
screen AdminPanel { ... }
```

**Invalid**:
```wire
screen user-dashboard { ... }      // ❌ Should be CamelCase
screen User Dashboard { ... }      // ❌ Spaces not allowed
screen UserDashboard { ... }
screen UserDashboard { ... }       // ❌ Duplicate name
```

---

## Semantic Validations

Performed by the **IR Generator** after parsing.

### Component Composition

- ✅ Custom components (`define Component`) must be defined before use
- ✅ No circular references in component definitions
- ✅ All referenced components (built-in or custom) must exist

**Invalid**:
```wire
project "App" {
  theme { ... }
  
  screen Home {
    layout stack {
      component CustomButton  // ERROR: not defined
    }
  }
}
```

**Valid**:
```wire
project "App" {
  theme { ... }
  
  define Component "CustomButton" {
    layout stack(direction: horizontal, gap: md) {
      component Icon type: "star"
      component Button text: "Action" variant: primary
    }
  }
  
  screen Home {
    layout stack {
      component CustomButton  // OK: defined above
    }
  }
}
```

### Theme Properties

- ✅ Theme block is optional but highly recommended
- ✅ When included, theme values must be valid strings with quotes
- ✅ If omitted, sensible defaults are applied

**Minimal (theme optional)**:
```wire
project "App" {
  // Theme omitted - defaults will be applied
  screen Home {
    layout stack {
      component Heading text: "Hello"
    }
  }
}
```

**With Theme (recommended)**:
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
    layout stack {
      component Heading text: "Hello"
    }
  }
}
```
```

### Layout Constraints

- ✅ Layout properties must be valid for that layout type
- ✅ `gap` must be valid spacing value: `xs`, `sm`, `md`, `lg`, `xl`
- ✅ `padding` must be valid spacing value
- ✅ `grid` layout requires `columns` property
- ✅ `split` layout requires `sidebar` property (numeric pixel value)

**Invalid**:
```wire
layout stack(direction: invalid) { }  // ❌ Invalid direction
layout grid { }                       // ❌ Missing columns property
layout split(gap: md) { }             // ❌ Missing sidebar property
```

**Valid**:
```wire
layout stack(direction: vertical, gap: md)
layout grid(columns: 12, gap: md)
layout split(sidebar: 260, gap: md)
```

### Component Properties

All components validate their specific properties:

| Component | Required Props | Optional Props |
|-----------|---|---|
| Heading | `text` | - |
| Button | `text` | `variant` |
| Input | `label` | `placeholder` |
| Table | `columns` | `rows` |
| Image | `placeholder` | `height` |
| Icon | - | `type` |
| And 17 more... | - | - |

See [Components Reference](../language/components.md) for complete property list.

---

## Sizing Validations

Performed by the **Layout Engine** during layout calculation.

### Container Sizing

- ✅ Container width/height must be positive integers
- ✅ Padding values must be valid spacing units
- ✅ Gap values must be valid spacing units

### Child Sizing

- ✅ Children sized based on constraints
- ✅ Overflow is handled (clipping or scrolling)
- ✅ Negative margins/padding not allowed

### Grid Cell Sizing

- ✅ Cell `span` must be between 1 and 12
- ✅ Cell `align` must be valid: `start`, `center`, `end`
- ✅ Total span doesn't need to equal columns (wrapping not supported)

---

## Error Reporting

All validation errors include:

- **Message**: What went wrong
- **Location**: Line and column number (where applicable)
- **Severity**: Error or warning
- **Context**: Surrounding code snippet
- **Suggestion**: How to fix (when applicable)

**Example Error Output**:
```
Error: Unknown component "CustomButton"
  at line 12, column 20
  
    layout stack {
      component CustomButton  ← Unknown component
    }

Suggestion: Define the component first with:
  define Component "CustomButton" { ... }

Or use one of the 23 built-in components:
  Heading, Text, Button, Input, ...
```

---

## Validation Best Practices

### Do's ✅

✅ Validate files before rendering  
✅ Fix syntax errors first  
✅ Check component property names against reference  
✅ Ensure unique screen names  
✅ Define custom components before use  
✅ Use valid theme values  

### Don'ts ❌

❌ Use unquoted string values  
❌ Reference undefined components  
❌ Use invalid spacing units  
❌ Leave containers empty  
❌ Skip theme block  
❌ Use duplicate screen names  

---

## Validation Tools

### CLI Validation

```bash
wire validate myfile.wire
```

Shows all errors and warnings with detailed messages.

### Web Editor Validation

The web editor validates in real-time as you type, showing:
- Syntax errors in red
- Error location with line number
- Helpful suggestions

### Programmatic Validation

```typescript
import { parseWireDSL, generateIR } from '@wire-dsl/engine';

const content = `...wire file content...`;

try {
  const ast = parseWireDSL(content);
  const ir = generateIR(ast);
  console.log('Valid!', ir);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

---

## Full Specification

For complete technical specification including all validation rules, see:
- [specs/VALIDATION-RULES.md](../../specs/VALIDATION-RULES.md) in the repository

## Next Steps

- [IR Format Specification](./ir-format.md)
- [Layout Engine Specification](./layout-engine.md)
- [Architecture Overview](./overview.md)

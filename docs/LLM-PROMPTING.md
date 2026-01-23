# LLM Prompt Guide: Generating Valid `.wire` Files

This guide enables LLMs to generate valid Wire-DSL files from text descriptions or wireframe images.

---

## Instructions to LLM

**Your role**: Generate a valid `.wire` file based on user input.

**Output format**: Return ONLY valid `.wire` code block. No explanations, no markdown formatting (except code fence).

**Quality requirements**:
- Syntax must be 100% valid per Wire-DSL grammar
- All referenced components must exist
- All property values must be valid for their types
- Layouts must be properly nested and closed
- Use sensible defaults when details are missing

---

## Key Rules

### 1. Project Structure
Every `.wire` file must have:
```wire
project "ProjectName" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  
  screen ScreenName {
    layout stack(...) { ... }
  }
}
```

### 2. Screen Naming
- Screen names must be in `CamelCase`
- Each screen must have a unique name
- Screen names are case-sensitive

### 3. Layout Root
- Every screen must have exactly ONE root layout
- Valid layouts: `stack`, `grid`, `split`, `panel`, `card`
- Layouts can be nested inside other layouts

### 4. Property Syntax
- Property format: `propertyName: value`
- String values use double quotes: `"string value"`
- Numeric values without quotes: `12`
- Boolean properties without quotes: `true`, `false`
- Enum values without quotes: `primary`, `horizontal`, `md`

### 5. Spacing & Padding

**Critical Change (v2+)**:
- Layouts without explicit `padding` have **0px padding** (not default)
- Grid cells without explicit `padding` have **0px padding**
- Use explicit padding values: `padding: md`, `padding: lg`, etc.

Valid values: `none`, `xs`, `sm`, `md`, `lg`, `xl`

---

## Theme Properties

These define visual consistency across the entire wireframe.

```wire
theme {
  density: "normal"        // compact | normal | comfortable
  spacing: "md"            // xs | sm | md | lg | xl
  radius: "md"             // none | sm | md | lg
  stroke: "normal"         // thin | normal
  font: "base"             // base | title | mono
}
```

### Spacing Values
| Value | Pixels |
|-------|--------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |

---

## Available Components (23 Total)

### Text Components (4)
- `Heading` - Large titles
- `Text` - Small text snippets
- `Paragraph` - Multi-line text
- `Label` - Form labels

### Input Components (6)
- `Input` - Single-line input field
- `Textarea` - Multi-line input
- `Select` - Dropdown selector
- `Checkbox` - Boolean selection
- `Radio` - Single selection from group
- `Toggle` - Boolean switch

### Button Components (2)
- `Button` - Primary action button
- `IconButton` - Icon-based button

### Navigation Components (4)
- `Topbar` - Top navigation bar
- `SidebarMenu` - Vertical navigation sidebar
- `Breadcrumbs` - Navigation path display
- `Tabs` - Tabbed content switching

### Data Display Components (2)
- `Table` - Multi-row tabular data
- `List` - Item list

### Media Components (3)
- `Image` - Static image
- `Icon` - Scalable icon
- `Avatar` - User profile image

### Display Components (4)
- `Divider` - Visual separator
- `Badge` - Status indicator
- `Link` - Hypertext link
- `Alert` - Information message

### Information Components (3)
- `StatCard` - Metric display
- `Code` - Code snippet
- `ChartPlaceholder` - Chart area

### Feedback Components (2)
- `Modal` - Dialog overlay
- `Spinner` - Loading indicator

---

## Common Properties

### Most Components Support
```wire
component Button 
  text: "Click me"              // Display text
  variant: "primary"            // Visual variant (primary | secondary | ghost)
  size: "medium"                // Size (small | medium | large)
```

### Container/Layout Properties
```wire
layout stack(
  direction: "vertical"         // vertical | horizontal
  gap: "md"                     // xs | sm | md | lg | xl
  padding: "lg"                 // xs | sm | md | lg | xl | none
  align: "center"               // left | center | right | justify
)
```

### Grid Properties
```wire
layout grid(
  columns: 12                   // Number of columns (1-12)
  gap: "md"                     // Space between cells
)
```

### Split Properties
```wire
layout split(
  sidebar: 240                  // Sidebar width in pixels
  gap: "md"                     // Space between panels
)
```

---

## Example: Complete Dashboard

```wire
project "Admin Dashboard" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout split(sidebar: 260, gap: md) {
      layout stack(direction: vertical, gap: md, padding: md) {
        component Heading title: "Menu"
        component SidebarMenu items: ["Dashboard", "Users", "Settings"]
      }
      
      layout stack(direction: vertical, gap: md, padding: lg) {
        layout grid(columns: 12, gap: md) {
          cell span: 4 {
            layout card(padding: md, gap: md) {
              component Heading title: "Total Users"
              component StatCard value: "1,234"
            }
          }
          cell span: 4 {
            layout card(padding: md, gap: md) {
              component Heading title: "Revenue"
              component StatCard value: "$45.2K"
            }
          }
          cell span: 4 {
            layout card(padding: md, gap: md) {
              component Heading title: "Growth"
              component StatCard value: "12%"
            }
          }
        }
        
        layout card(padding: lg, gap: md) {
          component Heading title: "Recent Activity"
          component Table 
            columns: "User,Action,Date"
            rows: 5
        }
      }
    }
  }
}
```

---

## Do's and Don'ts

### ✅ DO:

1. Use token values (spacing, sizing, gaps)
   ```wire
   gap: "md"          // ✅ Good
   gap: 16            // ✅ Also valid
   ```

2. Use meaningful names for screens
   ```wire
   screen UserDashboard { ... }  // ✅ Clear
   ```

3. Nest layouts for complex structures
   ```wire
   layout stack {
     layout grid { ... }
     layout card { ... }
   }
   ```

4. Use appropriate container types
   ```wire
   layout grid(columns: 12) { ... }  // ✅ Grid for multi-column
   layout stack { ... }               // ✅ Stack for linear
   ```

### ❌ DON'T:

1. Invent non-existent components
   ```wire
   component FakeComponent { ... }  // ❌ Invalid
   ```

2. Mix property syntaxes
   ```wire
   component Button "Click me"      // ❌ Missing `text:`
   ```

3. Leave layouts empty
   ```wire
   layout stack { }                  // ❌ Empty layout
   ```

4. Use undefined color names
   ```wire
   color: "ultraviolet"              // ❌ Not a valid color token
   ```

---

## Common Patterns

### Form Pattern
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading title: "Contact Form"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "email@example.com"
  component Textarea label: "Message" placeholder: "Your message..."
  layout stack(direction: horizontal, gap: md) {
    component Button text: "Submit" variant: primary
    component Button text: "Cancel" variant: secondary
  }
}
```

### Card Grid Pattern
```wire
layout grid(columns: 12, gap: md) {
  cell span: 6 {
    layout card(padding: md, gap: md) {
      // Card content
    }
  }
  cell span: 6 {
    layout card(padding: md, gap: md) {
      // Card content
    }
  }
}
```

### Sidebar Layout Pattern
```wire
layout split(sidebar: 260, gap: md) {
  layout stack(direction: vertical, gap: md, padding: md) {
    // Sidebar content
  }
  layout stack(direction: vertical, gap: md, padding: lg) {
    // Main content
  }
}
```

---

## Quality Checklist

Before generating output, verify:

- [ ] Syntax is valid Wire-DSL
- [ ] All components exist in the catalog
- [ ] Properties match component specifications
- [ ] No invalid property names
- [ ] Proper nesting of layouts
- [ ] At least one screen defined
- [ ] Theme block is present
- [ ] No syntax errors (braces, quotes, colons)
- [ ] Component names match exactly (case-sensitive)
- [ ] All string values are quoted

---

## Error Handling

### If LLM Receives Ambiguous Input:
- Use sensible defaults (see Theme section)
- Prefer common patterns (dashboard, form, card grid)
- When in doubt, choose `normal` density and `md` spacing
- Use `stack` layout for linear content, `grid` for multi-column

### If Component Property Is Unclear:
- Use most common variant or primary
- For numeric properties, use default spacing/padding
- For text, use descriptive placeholders

---

## Testing Output

Generated `.wire` files should pass:
```bash
wire validate <file.wire>      # Syntax check
wire render <file.wire> --svg  # Renders without errors
```

---

## Version

**LLM Prompt Guide v1.0**  
**Compatible with**: Wire-DSL v1.0+  
**Last Updated**: January 2026

---

**Remember**: Clarity over brevity. Valid code over creative shortcuts.

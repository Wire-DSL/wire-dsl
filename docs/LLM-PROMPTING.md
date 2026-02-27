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
  style {
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

**Layout Purposes**:
- `stack` - Linear vertical or horizontal stacking of elements
- `grid` - Multi-column responsive layout (12-column system)
- `split` - Two-panel layout with one fixed side + one flexible side
- `panel` - Container with automatic border, padding, and background
- `card` - Vertical container ideal for product/profile cards with rounded corners

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

## Style Properties

These define visual consistency across the entire wireframe.

```wire
style {
  density: "normal"        // compact | normal | comfortable
  spacing: "md"            // xs | sm | md | lg | xl
  radius: "md"             // none | sm | md | lg | full
  stroke: "normal"         // thin | normal | thick
  font: "base"             // sm | base | lg
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

## Component Properties Reference

### Text Components Details
| Component | Required Props | Optional Props | Example |
|---|---|---|---|
| `Heading` | `text` | `level`, `spacing`, `variant` | `component Heading text: "Page Title" level: h2 variant: primary` |
| `Text` | `content` | - | `component Text text: "Body text"` |
| `Label` | `text` | - | `component Label text: "Field label"` |

### Input Components Details
| Component | Key Properties | Example |
|---|---|---|
| `Input` | `label`, `placeholder`, `size` | `component Input label: "Email" placeholder: "your@email.com" size: md` |
| `Textarea` | `label`, `placeholder`, `rows` | `component Textarea label: "Message" rows: 4 placeholder: "Your message..."` |
| `Select` | `label`, `items`, `size` | `component Select label: "Role" items: "Admin,User,Guest" size: md` |
| `Checkbox` | `label`, `checked` | `component Checkbox label: "I agree to terms" checked: false` |
| `Radio` | `label`, `checked` | `component Radio label: "Option A" checked: true` |
| `Toggle` | `label`, `enabled` | `component Toggle label: "Enable notifications" enabled: false` |

### Media Components Details
| Component | Key Properties | Valid Placeholders | Example |
|---|---|---|---|
| `Image` | `type`, `height` | `"landscape"`, `"square"`, `"portrait"`, `"avatar"`, `"icon"` | `component Image type: square height: 250` |
| `Icon` | `type` | `size`, `variant` | `component Icon icon: "search" size: md variant: primary` |

### Navigation Components Details
| Component | Key Properties | Example |
|---|---|---|
| `SidebarMenu` | `items`, `active` | `component SidebarMenu items: "Home,Users,Settings" active: 0` |
| `Tabs` | `items`, `active` | `component Tabs items: "Profile,Settings,Activity" active: 0` |
| `Breadcrumbs` | `items` | `component Breadcrumbs items: "Home,Users,Detail"` |
| `Topbar` | `title`, `subtitle` | `icon`, `actions`, `user`, `avatar`, `variant` | `component Topbar title: "Dashboard" icon: "menu" actions: "Save" variant: primary` |

### Data Components Details
| Component | Key Properties | Example |
|---|---|---|
| `Table` | `columns`, `rows` | `actions`, `caption`, `pagination`, `paginationAlign`, `captionAlign` | `component Table columns: "Name,Email,Status" rows: 8 actions: "eye,edit"` |
| `Stat` | `title`, `value` | `component Stat title: "Total Users" value: "1,234"` |
| `List` | `items`, `title` | `component List items: "Item 1,Item 2,Item 3"` |

---

## Available Components (30 Total)

### Text Components (3)
- `Heading` - Large titles
- `Text` - Body text (short or multi-line)
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

### Navigation Components (5)
- `Topbar` - Top navigation bar
- `SidebarMenu` - Vertical navigation sidebar
- `Sidebar` - Side navigation panel
- `Breadcrumbs` - Navigation path display
- `Tabs` - Tabbed content switching

### Data Display Components (2)
- `Table` - Multi-row tabular data
- `List` - Item list

### Media Components (2)
- `Image` - Static image
- `Icon` - Scalable icon

### Display Components (5)
- `Divider` - Visual separator
- `Separate` - Invisible spacer
- `Badge` - Status indicator
- `Link` - Hypertext link
- `Alert` - Information message

### Information Components (4)
- `Stat` - Metric display
- `Card` - Generic content card
- `Code` - Code snippet
- `Chart` - Chart area

### Feedback Components (1)
- `Modal` - Dialog overlay

---

## Common Properties

### Most Components Support
```wire
component Button 
  text: "Click me"              // Display text
  variant: "primary"            // Visual variant (default | primary | secondary | success | warning | danger | info)
  size: "md"                    // Size (sm | md | lg)
  labelSpace: true              // Optional control alignment helper
  padding: "md"                 // Optional horizontal inset (none | xs | sm | md | lg | xl)
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

// Grid cells support:
cell span: 8 align: "end" { ... }  // span: 1-12, align: start|center|end
```

### Panel Properties
```wire
layout panel(
  padding: "md"                 // xs | sm | md | lg | xl
  background: "white"          // Background color
)
```

### Card Properties
```wire
layout card(
  padding: "md"                 // xs | sm | md | lg | xl (default: md)
  gap: "md"                     // xs | sm | md | lg | xl (default: md)
  radius: "md"                  // xs | sm | md | lg (default: md)
  border: true                  // true | false (default: true)
)
```

### Split Properties
```wire
layout split(
  left: 260                     // Fixed left panel width (or use right: <number>)
  background: "accent"          // Optional fixed-panel background color
  border: true                  // Optional vertical divider
  gap: "md"                     // Space between panels
  padding: "md"                 // Optional inner padding
)
```

---

## Example: Complete Dashboard

```wire
project "Admin Dashboard" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout split(left: 260, gap: md) {
      layout stack(direction: vertical, gap: md, padding: md) {
        component Heading text: "Menu"
        component SidebarMenu items: ["Dashboard", "Users", "Settings"]
      }
      
      layout stack(direction: vertical, gap: md, padding: lg) {
        layout grid(columns: 12, gap: md) {
          cell span: 4 {
            layout card(padding: md, gap: md) {
              component Heading text: "Total Users"
              component Stat value: "1,234"
            }
          }
          cell span: 4 {
            layout card(padding: md, gap: md) {
              component Heading text: "Revenue"
              component Stat value: "$45.2K"
            }
          }
          cell span: 4 {
            layout card(padding: md, gap: md) {
              component Heading text: "Growth"
              component Stat value: "12%"
            }
          }
        }
        
        layout card(padding: lg, gap: md) {
          component Heading text: "Recent Activity"
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

## Advanced Layout Nesting Examples

### Nested Stack within Card (Horizontal Buttons)
```wire
layout card(padding: lg, gap: md, radius: lg, border: true) {
  component Image type: square height: 250
  component Heading text: "Product Title"
  component Text text: "Product description"
  layout stack(direction: horizontal, gap: md) {
    component Button text: "View Details" variant: primary
    component Button text: "Add to Cart" variant: secondary
  }
}
```

### Grid within Stack (Dashboard Cards)
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Dashboard Overview"
  
  layout grid(columns: 12, gap: md) {
    cell span: 4 {
      layout card(padding: md, gap: md) {
        component Heading text: "Users"
        component Stat title: "Total" value: "1,234"
      }
    }
    cell span: 4 {
      layout card(padding: md, gap: md) {
        component Heading text: "Revenue"
        component Stat title: "Monthly" value: "$45.2K"
      }
    }
    cell span: 4 {
      layout card(padding: md, gap: md) {
        component Heading text: "Growth"
        component Stat title: "YoY" value: "12%"
      }
    }
  }
}
```

### Panel within Grid (Sidebar Control Panel)
```wire
layout split(left: 260, gap: md) {
  layout stack(direction: vertical, gap: md, padding: md) {
    component Heading text: "Menu"
    component SidebarMenu items: "Dashboard,Users,Settings"
  }
  
  layout grid(columns: 12, gap: md, padding: lg) {
    cell span: 8 {
      component Heading text: "Main Content"
      component Table columns: "Name,Email,Status" rows: 5
    }
    
    cell span: 4 {
      layout panel(padding: md, background: "white") {
        layout stack(direction: vertical, gap: md) {
          component Heading text: "Filters"
          component Input label: "Search" placeholder: "Filter..."
          component Select label: "Status" items: "Active,Inactive"
          component Button text: "Apply" variant: primary
        }
      }
    }
  }
}
```

### Card within Split Layout (Profile)
```wire
layout split(left: 280, gap: md) {
  layout stack(direction: vertical, gap: md, padding: lg) {
    component Heading text: "Profile"
    component SidebarMenu items: "General,Security,Privacy" active: 0
  }
  
  layout stack(direction: vertical, gap: lg, padding: lg) {
    layout card(padding: lg, gap: md, radius: lg, border: true) {
      component Image type: square
      component Heading text: "John Doe"
      component Text text: "john@example.com"
      component Divider
      component Text text: "Senior Software Engineer"
      layout stack(direction: horizontal, gap: md) {
        component Button text: "Edit Profile" variant: primary
        component Button text: "Change Password" variant: secondary
      }
    }
  }
}
```

---

## Common Patterns

### Form Pattern (within Panel)
```wire
layout panel(padding: lg, background: "white") {
  layout stack(direction: vertical, gap: md) {
    component Heading text: "Contact Form"
    component Input label: "Name" placeholder: "Full name"
    component Input label: "Email" placeholder: "email@example.com"
    component Textarea label: "Message" rows: 4 placeholder: "Your message..."
    component Checkbox label: "Subscribe to newsletter"
    layout stack(direction: horizontal, gap: md) {
      component Button text: "Submit" variant: primary
      component Button text: "Cancel" variant: secondary
    }
  }
}
```

### Card Grid Pattern (Product Showcase)
```wire
layout grid(columns: 12, gap: md, padding: lg) {
  cell span: 6 {
    layout card(padding: md, gap: md, radius: lg, border: true) {
      component Image type: square height: 200
      component Heading text: "Premium Item"
      component Text text: "High-quality product"
      component Stat title: "Price" value: "$99.99"
      component Button text: "Add to Cart" variant: primary
    }
  }
  cell span: 6 {
    layout card(padding: md, gap: md, radius: lg, border: true) {
      component Image type: square height: 200
      component Heading text: "Standard Item"
      component Text text: "Good value option"
      component Stat title: "Price" value: "$49.99"
      component Button text: "Add to Cart" variant: primary
    }
  }
}
```

### Sidebar Layout Pattern (Admin Interface)
```wire
layout split(left: 280, gap: md) {
  layout stack(direction: vertical, gap: md, padding: md) {
    component Topbar title: "Admin Panel"
    component SidebarMenu items: "Dashboard,Users,Reports,Settings" active: 0
    component Divider
    component Text text: "Settings"
    component Link text: "Profile"
    component Link text: "Logout"
  }
  
  layout stack(direction: vertical, gap: md, padding: lg) {
    component Heading text: "Dashboard"
    component Breadcrumbs items: "Home,Dashboard"
    layout grid(columns: 12, gap: md) {
      cell span: 12 {
        layout card(padding: lg, gap: md) {
          component Heading text: "Recent Activity"
          component Table columns: "User,Action,Timestamp" rows: 5
        }
      }
    }
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
- [ ] Style block is present
- [ ] No syntax errors (braces, quotes, colons)
- [ ] Component names match exactly (case-sensitive)
- [ ] All string values are quoted
- [ ] All layouts have explicit `padding` when needed
- [ ] Image `type` uses valid values: "landscape", "square", "portrait"
- [ ] Use `Image` for profile pictures when needed
- [ ] Grid cells have `span` values between 1-12
- [ ] Split fixed side width (`left` or `right`) is between 200-400 pixels
- [ ] Card/Panel radius values are: "none", "sm", "md", "lg"
- [ ] Button variants are: "default", "primary", "secondary", "success", "warning", "danger", "info"
- [ ] Nested layouts are properly closed with braces

---

## Error Handling

### If LLM Receives Ambiguous Input:
- Use sensible defaults (see  section)
- Prefer common patterns (dashboard, form, card grid)
- When in doubt, choose `normal` density and `md` spacing
- Use `stack` layout for linear content, `grid` for multi-column
- Default card/panel padding to `md`, radius to `md`

### If Component Property Is Unclear:
- Use most common variant: `primary` for buttons, `md` for spacing
- For numeric properties, use default spacing/padding
- For text, use descriptive placeholders
- For `Image type`, use `"square"` as safe default
- For lists/arrays, use comma-separated values in quotes

### If Layout Properties Are Missing:
- Always include explicit `padding` for readability
- Default `gap` to `md` if spacing not specified
- Default `columns` to `12` for grids
- Default `direction` to `vertical` for stacks
- Default split fixed panel to `left: 260` when no side is specified by the user

---

## Testing Output

Generated `.wire` files should pass:
```bash
wire validate <file.wire>      # Syntax check
wire render <file.wire> --svg  # Renders without errors
```

---

## Important Notes

### Complementary Documentation
This guide is designed to work alongside the **DSL-SYNTAX.md** document. For detailed component specifications, layout properties, and comprehensive examples, refer to the syntax guide.

### Padding Critical Behavior
⚠️ **Important**: Layouts without explicit `padding` render with **0px internal padding**. Always specify `padding: xs`, `padding: sm`, `padding: md`, `padding: lg`, or `padding: xl` when spacing is needed inside containers.

### Array/List Format
When components require multiple items (like `items`, `columns`), use comma-separated strings:
```wire
component SidebarMenu items: "Home,Users,Settings"      // ✅ Correct
component Table columns: "Name,Email,Status"            // ✅ Correct
component Tabs items: "Profile,Settings,Activity"       // ✅ Correct
```

---

## Version

**LLM Prompt Guide v2.0**  
**Compatible with**: Wire-DSL v1.0+  
**Last Updated**: January 2026  
**Status**: Enhanced with advanced nesting examples and detailed property specifications

---

**Remember**: Clarity over brevity. Valid code over creative shortcuts.

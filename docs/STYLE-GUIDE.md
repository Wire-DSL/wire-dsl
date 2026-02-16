# Style Configuration Guide

Complete guide to the Wire-DSL style system for establishing visual consistency across wireframes.

---

## What is Style?

The style system defines design tokens that control the visual appearance of your entire project. Instead of hardcoding values, use style tokens to ensure consistency and make global style changes easily.

---

## Style Block Syntax

The `style` block is defined at the project level:

```
project "MyApp" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  colors {
    primary: #3B82F6
    accent: #3B82F6
    control: #3B82F6
    chart: #3B82F6
  }

  screen Dashboard { ... }
}
```

### Style Properties

Style properties are optional. When provided, values must be quoted strings; omitted values use engine defaults.

| Property | Type | Options | Default | Impact |
|----------|------|---------|---------|--------|
| `density` | string | `"compact"`, `"normal"`, `"comfortable"` | `"normal"` | UI element sizing & spacing |
| `spacing` | string | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` | `"md"` | Default gaps in layouts |
| `radius` | string | `"none"`, `"sm"`, `"md"`, `"lg"`, `"full"` | `"md"` | Border radius on components |
| `stroke` | string | `"thin"`, `"normal"`, `"thick"` | `"normal"` | Border thickness |
| `font` | string | `"sm"`, `"base"`, `"lg"` | `"base"` | Typography scale |

---

## Colors Block (Project Level)

Alongside `style`, you can define a `colors` block at project root to customize variants and semantic color tokens used by renderers.

```wire
project "ThemedApp" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  colors {
    primary: #2563EB
    secondary: #64748B
    success: #10B981
    warning: #F59E0B
    danger: #EF4444
    info: #0EA5E9

    accent: #2563EB
    control: #16A34A
    chart: #F97316
  }
}
```

### What `colors` affects

- Variant-driven components (`Button`, `Badge`, `Link`, `Alert`, `IconButton`, etc.) through `primary`, `secondary`, `success`, `warning`, `danger`, `info` (and `error`)
- Semantic renderer tokens:
  - `accent`: Topbar icon/actions, active Tabs, StatCard highlighted value/icon, selected SidebarMenu item
  - `control`: selected/enabled states for Checkbox, Radio, Toggle
  - `chart`: Chart types line/area/bar

### Value formats

- Hex: `#RRGGBB`
- Alias to another key: `brand: primary`
- Named color identifier: `blue`, `red`, `green`, etc.

**Note**: Pie charts use a fixed multi-color palette and do not use `chart` as a single color.

---

## Density

Controls the overall visual compactness of the UI.

### Levels

**`"compact"`**: Condensed, space-efficient UI
- Smaller buttons and inputs
- Tighter spacing
- Best for: Complex dashboards, data-heavy interfaces

**`"normal"`**: Standard, balanced UI (recommended)
- Medium-sized components
- Comfortable spacing
- Best for: General applications

**`"comfortable"`**: Spacious, easy-to-use UI
- Larger buttons and inputs
- Generous spacing
- Best for: Mobile-first, accessibility-focused

### Example Impact

```
// Compact version
project "CompactApp" {
  style {
    density: "compact"
    spacing: "sm"
    // UI elements are smaller, tighter
  }
  ...
}

// Comfortable version
project "ComfortableApp" {
  style {
    density: "comfortable"
    spacing: "lg"
    // UI elements are larger, more spacious
  }
  ...
}
```

---

## Spacing

Defines the default spacing unit used throughout layouts.

### Pixel Values

- `"xs"`: 4px
- `"sm"`: 8px
- `"md"`: 16px (standard)
- `"lg"`: 24px
- `"xl"`: 32px

### How It Works

When you specify `spacing: "md"` in the `style` block, default gap/padding values are derived from that token. Containers can override with explicit values:

```
project "MyApp" {
  style {
    spacing: "md"  // Default to 16px gaps
  }

  screen Dashboard {
    layout stack(direction: vertical, gap: lg) {  // Explicitly use 24px instead
      component Heading text: "Title"
      component Text content: "Content"
    }
  }
}
```

### Usage Guidelines

- **Tight UI**: Use `"xs"` or `"sm"`
- **Standard UI**: Use `"md"` (recommended)
- **Spacious UI**: Use `"lg"` or `"xl"`

---

## Radius (Border Radius)

Controls the roundness of corners on cards, buttons, and containers.

### Levels

- `"none"`: Sharp corners (0px)
- `"sm"`: Slightly rounded (2px)
- `"md"`: Moderately rounded (4px) (recommended)
- `"lg"`: Very rounded (8px)

### Visual Effect

```
"none"  → [Button with sharp corners]
"sm"    → (Button with slightly rounded corners)
"md"    → (Button with moderately rounded corners)
"lg"    → (Button with very rounded corners)
```

### Design Implications

- **`"none"`**: Modern, geometric aesthetic
- **`"sm"`**: Professional, subtle
- **`"md"`**: Friendly, balanced (most common)
- **`"lg"`**: Playful, rounded aesthetic

### Example

```
// Geometric Design
project "ModernApp" {
  style {
    radius: "none"
    stroke: "normal"
    // Sharp, angular appearance
  }
}

// Friendly Design
project "FriendlyApp" {
  style {
    radius: "lg"
    spacing: "lg"
    density: "comfortable"
    // Warm, accessible appearance
  }
}
```

---

## Stroke (Border Width)

Controls the thickness of borders on components and containers.

### Levels

- `"thin"`: 1px borders (minimal emphasis)
- `"normal"`: 2px borders (standard)

### Design Implications

- **`"thin"`**: Subtle, minimal visual weight
- **`"normal"`**: Clear visual hierarchy

### Example

```
// Minimal Design
project "MinimalApp" {
  style {
    stroke: "thin"
    // Subtle borders, high contrast
  }
}

// Strong Design
project "StrongApp" {
  style {
    stroke: "normal"
    // Clear borders, defined sections
  }
}
```

---

## Font (Typography)

Controls the typographic style used throughout.

### Styles

- `"sm"`: Smaller typography scale
- `"base"`: Default balanced typography scale (recommended)
- `"lg"`: Larger typography scale

### Application

Typography affects all text components:
- Heading sizes and weights
- Body text sizes and line heights
- Code block styling

### Example

```
// Professional Design
project "LawFirmApp" {
  style {
    font: "lg"
    // Larger typography scale
  }
}

// Technical Design
project "DeveloperTools" {
  style {
    font: "sm"
    // Smaller typography scale
  }
}
```

---

## Style Presets

Common style configurations for different design approaches:

### Preset: Modern Minimalist
```
project "ModernApp" {
  style {
    density: "normal"
    spacing: "md"
    radius: "none"
    stroke: "thin"
    font: "base"
  }
  ...
}
```

**Characteristics**: Sharp corners, thin borders, geometric aesthetic

### Preset: Friendly & Accessible
```
project "FriendlyApp" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "normal"
    font: "base"
  }
  ...
}
```

**Characteristics**: Rounded corners, generous spacing, approachable feel

### Preset: Data-Intensive Dashboard
```
project "DashboardApp" {
  style {
    density: "compact"
    spacing: "sm"
    radius: "sm"
    stroke: "normal"
    font: "base"
  }
  ...
}
```

**Characteristics**: Compact layout, efficient spacing, professional look

### Preset: Professional Enterprise
```
project "EnterpriseApp" {
  style {
    density: "normal"
    spacing: "md"
    radius: "sm"
    stroke: "normal"
    font: "lg"
  }
  ...
}
```

**Characteristics**: Serif fonts, subtle rounding, formal appearance

---

## Style Impact Matrix

How each style property affects components:

| Property | Button | Card | Input | Panel | Table |
|----------|--------|------|-------|-------|-------|
| `density` | Size | Padding | Height | Content | Row height |
| `spacing` | Gap | Gap | Margin | Internal | Cell gap |
| `radius` | Corners | Corners | Corners | Corners | N/A |
| `stroke` | Border | Border | Border | Border | Separator |
| `font` | Label | Title | Placeholder | Title | Header |

---

## Real-World Examples

### Admin Dashboard 

```
project "AdminPortal" {
  style {
    density: "compact"
    spacing: "md"
    radius: "sm"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout split(sidebar: 260, gap: md) {
      layout stack(gap: lg, padding: lg) {
        component Topbar title: "Admin Dashboard"
        component SidebarMenu items: "Users,Products,Analytics,Settings"
      }

      layout stack(gap: md, padding: lg) {
        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            component StatCard title: "Users" value: "1,234"
          }
          cell span: 3 {
            component StatCard title: "Orders" value: "5,678"
          }
          cell span: 3 {
            component StatCard title: "Revenue" value: "$45K"
          }
          cell span: 3 {
            component StatCard title: "Growth" value: "+12%"
          }
        }
        
        component Table columns: "ID,User,Status,Date,Action" rows: 15
      }
    }
  }
}
```

### E-Commerce Product Page 

```
project "ECommerceStore" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "thin"
    font: "base"
  }

  screen ProductListing {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Our Products"
      
      layout grid(columns: 12, gap: lg) {
        cell span: 4 {
          layout card(padding: lg, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading text: "Product 1"
            component Text content: "High quality product"
            component Button text: "View Details"
          }
        }
        cell span: 4 {
          layout card(padding: lg, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading text: "Product 2"
            component Text content: "Best seller"
            component Button text: "View Details"
          }
        }
        cell span: 4 {
          layout card(padding: lg, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading text: "Product 3"
            component Text content: "New arrival"
            component Button text: "View Details"
          }
        }
      }
    }
  }
}
```

---

## Best Practices

### Do's ✅

✅ Choose one preset that matches your design vision  
✅ Keep style configuration consistent throughout the project  
✅ Use style token values consistently in layouts and components  
✅ Test different density settings with your content  
✅ Consider accessibility when choosing spacing  

### Don'ts ❌

❌ Don't change style configuration mid-project (use screens instead)  
❌ Don't ignore style token values in layouts  
❌ Don't mix contradictory style properties  
❌ Don't use style token values inconsistently  

---

## Style Modifications

### Global Changes

Changing the `style` block at project level affects the entire wireframe:

```
project "MyApp" {
  style {
    density: "normal"  // Change this line
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
  // All screens automatically updated
  ...
}
```

### Local Overrides

Individual layouts can override style defaults:

```
layout stack(gap: lg, padding: xl) {  // Explicitly use lg spacing instead of style default
  component Heading text: "Special Section"
}
```

---

## Migration from Old Syntax

### Old Format (Deprecated)

```
project "App" {
  tokens density: normal
  tokens spacing: md
  tokens radius: md
  tokens stroke: normal
  tokens font: base
}
```

### New Format (Current)

```
project "App" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
}
```

**Key Changes**:
- Block syntax: `style { ... }` instead of individual `tokens` statements
- String values: All values use quotes (e.g., `"normal"`)

---

## Troubleshooting

### Problem: style not applied

**Solution**: Ensure style block is at project root level (not inside screen)

```
// ❌ Wrong
project "App" {
  screen Dashboard {
    style { ... }  // Incorrect location
  }
}

// ✅ Correct
project "App" {
  style { ... }  // Correct location
  screen Dashboard { ... }
}
```

### Problem: Values not recognized

**Solution**: Use string values with quotes

```
// ❌ Wrong
style {
  density: normal  // Missing quotes
}

// ✅ Correct
style {
  density: "normal"  // With quotes
}
```

### Problem: Spacing not consistent

**Solution**: Don't override with explicit values unless necessary

```
// ❌ Overriding too much
layout stack(gap: lg) {
  layout stack(gap: md) {
    layout stack(gap: sm) {
      // Multiple different spacings
    }
  }
}

// ✅ Using style tokens consistently
layout stack(gap: md) {
  layout stack(gap: md) {
    // Consistent spacing throughout
  }
}
```

---

## Next Steps

- [DSL-SYNTAX.md](DSL-SYNTAX.md) - Complete syntax reference
- [CONTAINERS-REFERENCE.md](CONTAINERS-REFERENCE.md) - Layout containers
- [COMPONENTS-REFERENCE.md](COMPONENTS-REFERENCE.md) - Component catalog

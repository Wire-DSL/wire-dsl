# Theme Configuration Guide

Complete guide to the Wire-DSL theme system for establishing visual consistency across wireframes.

---

## What is Theme?

The theme system defines design tokens that control the visual appearance of your entire project. Instead of hardcoding values, use theme tokens to ensure consistency and make global style changes easily.

---

## Theme Block Syntax

The theme is defined as a block at the project level:

```
project "MyApp" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard { ... }
}
```

### Theme Properties

All theme properties are **required** and must use **string values with quotes**.

| Property | Type | Options | Default | Impact |
|----------|------|---------|---------|--------|
| `density` | string | `"compact"`, `"normal"`, `"comfortable"` | `"normal"` | UI element sizing & spacing |
| `spacing` | string | `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` | `"md"` | Default gaps in layouts |
| `radius` | string | `"none"`, `"sm"`, `"md"`, `"lg"` | `"md"` | Border radius on components |
| `stroke` | string | `"thin"`, `"normal"` | `"normal"` | Border thickness |
| `font` | string | `"base"`, `"title"`, `"mono"` | `"base"` | Typography style |

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
  theme {
    density: "compact"
    spacing: "sm"
    // UI elements are smaller, tighter
  }
  ...
}

// Comfortable version
project "ComfortableApp" {
  theme {
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

When you specify `spacing: "md"` in theme, the default gap/padding values in layouts are set to 16px. Containers can override with explicit values:

```
project "MyApp" {
  theme {
    spacing: "md"  // Default to 16px gaps
  }

  screen Dashboard {
    layout stack(direction: vertical, gap: lg) {  // Explicitly use 24px instead
      component Heading title: "Title"
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
  theme {
    radius: "none"
    stroke: "normal"
    // Sharp, angular appearance
  }
}

// Friendly Design
project "FriendlyApp" {
  theme {
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
  theme {
    stroke: "thin"
    // Subtle borders, high contrast
  }
}

// Strong Design
project "StrongApp" {
  theme {
    stroke: "normal"
    // Clear borders, defined sections
  }
}
```

---

## Font (Typography)

Controls the typographic style used throughout.

### Styles

- `"base"`: Clean, sans-serif system fonts (recommended)
- `"title"`: Serif fonts for formal contexts
- `"mono"`: Monospace for code/technical content

### Application

Typography affects all text components:
- Heading sizes and weights
- Body text sizes and line heights
- Code block styling

### Example

```
// Professional Design
project "LawFirmApp" {
  theme {
    font: "title"
    // Uses serif fonts for formal appearance
  }
}

// Technical Design
project "DeveloperTools" {
  theme {
    font: "mono"
    // Uses monospace fonts
  }
}
```

---

## Theme Presets

Common theme configurations for different design approaches:

### Preset: Modern Minimalist
```
project "ModernApp" {
  theme {
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
  theme {
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
  theme {
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
  theme {
    density: "normal"
    spacing: "md"
    radius: "sm"
    stroke: "normal"
    font: "title"
  }
  ...
}
```

**Characteristics**: Serif fonts, subtle rounding, formal appearance

---

## Theme Impact Matrix

How each theme property affects components:

| Property | Button | Card | Input | Panel | Table |
|----------|--------|------|-------|-------|-------|
| `density` | Size | Padding | Height | Content | Row height |
| `spacing` | Gap | Gap | Margin | Internal | Cell gap |
| `radius` | Corners | Corners | Corners | Corners | N/A |
| `stroke` | Border | Border | Border | Border | Separator |
| `font` | Label | Title | Placeholder | Title | Header |

---

## Real-World Examples

### Admin Dashboard Theme

```
project "AdminPortal" {
  theme {
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
            component StatCard label: "Users" value: "1,234"
          }
          cell span: 3 {
            component StatCard label: "Orders" value: "5,678"
          }
          cell span: 3 {
            component StatCard label: "Revenue" value: "$45K"
          }
          cell span: 3 {
            component StatCard label: "Growth" value: "+12%"
          }
        }
        
        component Table columns: "ID,User,Status,Date,Action" rows: 15
      }
    }
  }
}
```

### E-Commerce Product Page Theme

```
project "ECommerceStore" {
  theme {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "thin"
    font: "base"
  }

  screen ProductListing {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading title: "Our Products"
      
      layout grid(columns: 12, gap: lg) {
        cell span: 4 {
          layout card(padding: lg, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading title: "Product 1"
            component Text content: "High quality product"
            component Button text: "View Details"
          }
        }
        cell span: 4 {
          layout card(padding: lg, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading title: "Product 2"
            component Text content: "Best seller"
            component Button text: "View Details"
          }
        }
        cell span: 4 {
          layout card(padding: lg, gap: md, radius: lg, border: true) {
            component Image placeholder: "square" height: 250
            component Heading title: "Product 3"
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
✅ Keep theme consistent throughout entire project  
✅ Use theme values in all layouts and components  
✅ Test different density settings with your content  
✅ Consider accessibility when choosing spacing  

### Don'ts ❌

❌ Don't change theme mid-project (use screens instead)  
❌ Don't ignore theme values in layouts  
❌ Don't mix contradictory theme properties  
❌ Don't use theme values inconsistently  

---

## Theme Modifications

### Global Changes

Changing the theme at project level affects the entire wireframe:

```
project "MyApp" {
  theme {
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

Individual layouts can override theme defaults:

```
layout stack(gap: lg, padding: xl) {  // Explicitly use lg spacing instead of theme default
  component Heading title: "Special Section"
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
  theme {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }
}
```

**Key Changes**:
- Block syntax: `theme { ... }` instead of individual `tokens` statements
- String values: All values use quotes (e.g., `"normal"`)

---

## Troubleshooting

### Problem: Theme not applied

**Solution**: Ensure theme block is at project root level (not inside screen)

```
// ❌ Wrong
project "App" {
  screen Dashboard {
    theme { ... }  // Incorrect location
  }
}

// ✅ Correct
project "App" {
  theme { ... }  // Correct location
  screen Dashboard { ... }
}
```

### Problem: Values not recognized

**Solution**: Use string values with quotes

```
// ❌ Wrong
theme {
  density: normal  // Missing quotes
}

// ✅ Correct
theme {
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

// ✅ Using theme consistently
layout stack(gap: md) {
  layout stack(gap: md) {
    // Consistent spacing throughout
  }
}
```

---

## Next Steps

- [DSL-SYNTAX](DSL-SYNTAX) - Complete syntax reference
- [CONTAINERS-REFERENCE.md](CONTAINERS-REFERENCE.md) - Layout containers
- [COMPONENTS-REFERENCE.md](COMPONENTS-REFERENCE.md) - Component catalog

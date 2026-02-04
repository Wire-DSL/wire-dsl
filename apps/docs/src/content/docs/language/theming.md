---
title: Theme Configuration
description: Guide to Wire-DSL theme system and design tokens
---

Complete guide to the Wire-DSL theme system for establishing visual consistency across wireframes.

---

## What is Theme?

The theme system defines design tokens that control the visual appearance of your entire project. Instead of hardcoding values, use theme tokens to ensure consistency and make global style changes easily.

---

## Theme Block Syntax

The theme is defined as a block at the project level:

```wire
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

When a theme block is included (highly recommended), all theme properties must use **string values with quotes**. If a property is omitted, a sensible default is applied.

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

### Example

```wire
// Compact version
project "CompactApp" {
  theme {
    density: "compact"
    spacing: "sm"
  }
  ...
}

// Comfortable version
project "ComfortableApp" {
  theme {
    density: "comfortable"
    spacing: "lg"
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

```wire
project "MyApp" {
  theme {
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

---

## Radius (Border Radius)

Controls the roundness of corners on cards, buttons, and containers.

### Levels

- `"none"`: Sharp corners (0px)
- `"sm"`: Slightly rounded (2px)
- `"md"`: Moderately rounded (4px) (recommended)
- `"lg"`: Very rounded (8px)

### Design Implications

- **`"none"`**: Modern, geometric aesthetic
- **`"sm"`**: Professional, subtle
- **`"md"`**: Friendly, balanced (most common)
- **`"lg"`**: Playful, rounded aesthetic

### Example

```wire
// Geometric Design
project "ModernApp" {
  theme {
    radius: "none"
    stroke: "normal"
  }
}

// Friendly Design
project "FriendlyApp" {
  theme {
    radius: "lg"
    spacing: "lg"
    density: "comfortable"
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

```wire
// Minimal Design
project "MinimalApp" {
  theme {
    stroke: "thin"
  }
}

// Strong Design
project "StrongApp" {
  theme {
    stroke: "normal"
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

```wire
// Professional Design
project "LawFirmApp" {
  theme {
    font: "title"
  }
}

// Technical Design
project "DeveloperTools" {
  theme {
    font: "mono"
  }
}
```

---

## Theme Presets

Common theme configurations for different design approaches:

### Modern Minimalist
```wire
project "ModernApp" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "none"
    stroke: "thin"
    font: "base"
  }
}
```

**Characteristics**: Sharp corners, thin borders, geometric aesthetic

### Friendly & Accessible
```wire
project "FriendlyApp" {
  theme {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "normal"
    font: "base"
  }
}
```

**Characteristics**: Rounded corners, generous spacing, approachable feel

### Data-Intensive Dashboard
```wire
project "DashboardApp" {
  theme {
    density: "compact"
    spacing: "sm"
    radius: "sm"
    stroke: "normal"
    font: "base"
  }
}
```

**Characteristics**: Compact layout, efficient spacing, professional look

### Professional Enterprise
```wire
project "EnterpriseApp" {
  theme {
    density: "normal"
    spacing: "md"
    radius: "sm"
    stroke: "normal"
    font: "title"
  }
}
```

**Characteristics**: Serif fonts, subtle rounding, formal appearance

---

## Real-World Examples

### Admin Dashboard Theme

<!-- wire-preview:start -->
```wire
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
<!-- wire-preview:end -->

### E-Commerce Product Page Theme

<!-- wire-preview:start -->
```wire
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
<!-- wire-preview:end -->

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

## Troubleshooting

### Problem: Theme not applied

**Solution**: Ensure theme block is at project root level (not inside screen)

```wire
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

```wire
// ❌ Wrong
theme {
  density: normal  // Missing quotes
}

// ✅ Correct
theme {
  density: "normal"  // With quotes
}
```

---

## Next Steps

- [Containers & Layouts](./containers.md)
- [All Components](./components.md)
- [DSL Syntax](./syntax.md)

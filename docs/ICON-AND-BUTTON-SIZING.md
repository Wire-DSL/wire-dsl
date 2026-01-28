# Icon and Button Sizing Guide

## Overview

Wire-DSL now supports flexible sizing for both Icon and IconButton components, matching the approach used by other design system components like Heading. All components now feature improved color palettes with reduced opacity and more subtle gray tones for better visual balance.

## Icon Component

### Properties

- `type` (string, required): The icon name (e.g., "home", "user", "settings")
- `size` (string, optional): Icon size - `sm` | `md` | `lg` (default: `md`)

### Size Reference

| Size | Pixel Value | Use Case |
|------|-------------|----------|
| `sm` | 14px | Navigation items, sidebar menus, compact layouts |
| `md` | 18px | Stat cards, regular data displays |
| `lg` | 24px | Prominent displays, section headers, hero areas |

### Examples

```wire
// Small icon - navigation
layout stack(direction: horizontal, gap: 8) {
  component Icon type: "home" size: "sm"
  component Text content: "Dashboard"
}

// Medium icon - data card
layout stack(direction: horizontal, gap: 12) {
  layout stack(direction: vertical) {
    component Label text: "Users"
    component Heading text: "2,543"
  }
  component Icon type: "user" size: "md"
}

// Large icon - prominent display
layout card(padding: 24) {
  component Icon type: "star" size: "lg"
  component Heading text: "Premium Feature"
}
```

### Color System

Icons use a grayish tone with controlled opacity:
- Color: `rgba(30, 41, 59, 0.75)` - Subtle, non-intrusive
- Perfect for neutral elements and supporting visual hierarchy
- Complements other UI elements without overwhelming

---

## IconButton Component

### Properties

- `icon` (string, required): The icon name
- `variant` (string, optional): Button style - `default` | `primary` | `danger` (default: `default`)
- `size` (string, optional): Button size - `sm` | `md` | `lg` (default: `md`)
- `disabled` (boolean, optional): Disable button state (default: false)

### Size Reference

| Size | Pixel Value | Use Case |
|------|-------------|----------|
| `sm` | 28px | Compact toolbars, list actions, dense layouts |
| `md` | 32px | Standard buttons, common actions |
| `lg` | 40px | Prominent actions, hero sections, primary CTAs |

### Variants

#### Default Variant
- Background: Light gray with opacity `rgba(226, 232, 240, 0.9)`
- Icon: Gray tone `rgba(30, 41, 59, 0.75)`
- Border: Muted gray `rgba(100, 116, 139, 0.4)`
- Use for: Secondary actions, non-critical operations

#### Primary Variant
- Background: Blue with opacity `rgba(59, 130, 246, 0.85)`
- Icon: White
- Border: Blue `rgba(59, 130, 246, 0.7)`
- Use for: Main actions, affirmative operations

#### Danger Variant
- Background: Red with opacity `rgba(239, 68, 68, 0.85)`
- Icon: White
- Border: Red `rgba(239, 68, 68, 0.7)`
- Use for: Destructive actions, warnings

### Examples

```wire
// Small default buttons in toolbar
layout stack(direction: horizontal, gap: 8) {
  component IconButton icon: "search" variant: "default" size: "sm"
  component IconButton icon: "filter" variant: "default" size: "sm"
  component IconButton icon: "settings" variant: "default" size: "sm"
}

// Medium primary action
component IconButton icon: "plus" variant: "primary" size: "md"

// Large danger button
component IconButton icon: "trash-2" variant: "danger" size: "lg"

// Disabled state
component IconButton icon: "download" variant: "primary" size: "md" disabled: true
```

---

## Button Component

Buttons now also support sizing options:

### Properties

- `text` (string, required): Button label
- `variant` (string, optional): Style - `primary` | `secondary` | `ghost` (default: `secondary`)
- `size` (string, optional): Button size - `sm` | `md` | `lg` (default: `md`)

### Size Reference

| Size | Font Size | Use Case |
|------|-----------|----------|
| `sm` | 12px | Compact interfaces, secondary actions |
| `md` | 14px | Standard buttons, most use cases |
| `lg` | 16px | Prominent actions, hero CTAs |

### Color Improvements

All Button variants now feature reduced opacity for subtle, professional appearance:

**Primary Variant**
- Background: `rgba(59, 130, 246, 0.85)` - Blue with slight transparency
- Text: White
- Border: `rgba(59, 130, 246, 0.7)` - Softer blue border

**Default Variant**
- Background: `rgba(226, 232, 240, 0.9)` - Light gray with transparency
- Text: `rgba(30, 41, 59, 0.85)` - Subdued text color
- Border: `rgba(100, 116, 139, 0.4)` - Very muted gray border

### Examples

```wire
// Small secondary button
component Button text: "Cancel" variant: "secondary" size: "sm"

// Medium primary button
component Button text: "Create User" variant: "primary" size: "md"

// Large call-to-action
component Button text: "Get Started" variant: "primary" size: "lg"
```

---

## SidebarMenu with Icons

The SidebarMenu component now supports icon display:

### Properties

- `items` (string, required): Comma-separated menu item labels
- `icons` (string, optional): Comma-separated icon names matching items order
- `active` (number, optional): Index of active item (default: 0)

### Icon Integration

When icons are provided, they appear:
- Before the menu item text
- Automatically scaled to 16px
- Color: Subtle gray `rgba(30, 41, 59, 0.6)`
- With 8px spacing between icon and text

### Examples

```wire
// SidebarMenu without icons
component SidebarMenu items: "Dashboard,Users,Settings" active: 0

// SidebarMenu with icons - new feature!
component SidebarMenu 
  items: "Dashboard,Users,Reports,Settings" 
  icons: "home,user,bar-chart-2,settings" 
  active: 0
```

### Available Icons for SidebarMenu

Most Feather Icons work great in sidebars. Common choices:
- Navigation: `home`, `menu`, `arrow-left`, `arrow-right`, `chevron-*`
- User Management: `user`, `users`, `key`, `shield`
- Data: `database`, `bar-chart-2`, `line-chart`, `pie-chart`
- Settings: `settings`, `tool`, `sliders`, `zap`
- Content: `file`, `folder`, `inbox`, `inbox-in`, `mail`
- Actions: `plus`, `minus`, `edit`, `trash`, `download`, `upload`

---

## Complete Admin Dashboard Example

The `admin-dashboard-improved.wire` example demonstrates:

✅ Icon sizes (sm/md/lg) in different contexts
✅ IconButton variants with appropriate sizes
✅ SidebarMenu with integrated icons
✅ Button sizing options
✅ Improved, subtle color palette across all components
✅ Professional, balanced visual hierarchy

Render with:
```bash
node packages/cli/dist/cli.js render examples/admin-dashboard-improved.wire --svg examples/output/
```

---

## Color Philosophy

All color improvements follow these principles:

1. **Reduced Opacity**: Colors use `rgba()` with controlled opacity for subtlety
2. **Grayed Tones**: Neutral palette that doesn't overwhelm the UI
3. **Visual Hierarchy**: Primary actions stand out through color intensity
4. **Professional Look**: Softer borders and backgrounds for elegance
5. **Accessible**: Sufficient contrast maintained for readability

### Color Palette Reference

| Purpose | Color | Usage |
|---------|-------|-------|
| Primary Action | `rgba(59, 130, 246, 0.85)` | Primary buttons, active states |
| Danger Action | `rgba(239, 68, 68, 0.85)` | Destructive buttons, errors |
| Text | `rgba(30, 41, 59, 0.85)` | Primary text, button labels |
| Icon | `rgba(30, 41, 59, 0.75)` | Neutral icons, supporting visuals |
| Border | `rgba(100, 116, 139, 0.4)` | Subtle borders, dividers |
| Background | `rgba(226, 232, 240, 0.9)` | Soft backgrounds, default buttons |

---

## Migration Guide

If you have existing Wire files with icons and buttons:

**Before (no sizing):**
```wire
component Icon type: "home"
component IconButton icon: "plus" variant: "primary"
component Button text: "Submit" variant: "primary"
```

**After (with sizing):**
```wire
component Icon type: "home" size: "sm"
component IconButton icon: "plus" variant: "primary" size: "md"
component Button text: "Submit" variant: "primary" size: "md"
```

All existing files continue to work (using `md` as default), but adding explicit sizes enables better control over your design.

---

## Best Practices

1. **Use appropriate sizes**: `sm` for dense layouts, `lg` for emphasis
2. **Match icon sizes**: Keep related icons at the same size for consistency
3. **Color variants**: Use primary for main actions, default for secondary
4. **SidebarMenu icons**: Always include icons for navigation menus
5. **IconButton combinations**: Use size `sm` for multiple buttons in a row
6. **Accessibility**: Maintain sufficient contrast (all defaults meet WCAG AA)

---

## Related Resources

- [Icon Demo](../examples/icon-demo-simple.wire) - Basic icon usage
- [Admin Dashboard Improved](../examples/admin-dashboard-improved.wire) - Complete example with sizing
- [Components Reference](./COMPONENTS-REFERENCE.md) - Full component documentation
- [Feather Icons](https://feathericons.com/) - All available icons and library

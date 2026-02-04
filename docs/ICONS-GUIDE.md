# Icon Components Guide

Wire-DSL includes two icon components powered by **Feather Icons** (MIT License): `Icon` and `IconButton`.

## Overview

Both components use the official Feather Icons library naming convention. All icons are scalable SVG graphics that automatically adapt to their container size and theme colors.

## Component: Icon

The `Icon` component renders a simple icon display.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | `help-circle` | Icon name from Feather Icons library |
| `color` | string | (theme text color) | SVG stroke color |

### Usage

```wire
component Icon type: "home"
component Icon type: "search"
component Icon type: "wifi"
component Icon type: "trash-2"
```

### Example with Layout

```wire
layout stack(direction: horizontal, gap: 12) {
  component Icon type: "arrow-left"
  component Icon type: "arrow-right"
  component Icon type: "arrow-up"
  component Icon type: "arrow-down"
}
```

## Component: IconButton

The `IconButton` component renders a clickable icon button with background and border styling.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | string | `help-circle` | Icon name from Feather Icons library |
| `variant` | string | `default` | Button style: `default`, `primary`, or `danger` |
| `disabled` | string | `false` | Disable the button: `true` or `false` |

### Variants

- **default**: White background with border
- **primary**: Blue background with white icon
- **danger**: Red background with white icon

### Usage

```wire
component IconButton icon: "home" variant: "default"
component IconButton icon: "download" variant: "primary"
component IconButton icon: "trash-2" variant: "danger"
component IconButton icon: "settings" variant: "default" disabled: "true"
```

### Disabled Buttons

```wire
layout stack(direction: horizontal, gap: 8) {
  component IconButton icon: "lock" variant: "default" disabled: "true"
  component IconButton icon: "eye-off" variant: "default" disabled: "true"
}
```

## Available Icons (50+)

All icons from Feather Icons are available. Here are the most common ones:

### UI Navigation
- `home`, `menu`, `x`, `chevron-right`, `chevron-left`, `chevron-up`, `chevron-down`

### Arrows & Navigation
- `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`

### Search & Input
- `search`, `filter`

### Edit & Actions
- `edit`, `edit-2`, `trash`, `trash-2`, `copy`, `download`, `upload`, `plus`, `minus`, `check`

### Notifications & Feedback
- `bell`, `alert-circle`, `alert-triangle`, `info`

### User & Account
- `user`, `user-check`, `user-x`, `settings`, `log-out`, `log-in`

### Communication
- `mail`, `phone`, `share`, `share-2`

### Data & Information
- `calendar`, `clock`, `map-pin`, `wifi`, `wifi-off`

### Media & Visuals
- `eye`, `eye-off`, `image`

### Feedback & Social
- `heart`, `star`

### Loading & Misc
- `loader`, `help-circle`, `lock`

### Complete List

For a full reference of all available icons, see the `iconLibrary.ts` file in the source code or view the online [Feather Icons Gallery](https://feathericons.com).

## Complete Example

```wire
project "Icon Demo" {
  screen Dashboard {
    layout stack(direction: vertical, gap: 16, padding: 16) {
      component Heading text: "Dashboard Controls"

      // Icons in a horizontal layout
      layout stack(direction: horizontal, gap: 12) {
        component Icon type: "home"
        component Icon type: "search"
        component Icon type: "settings"
        component Icon type: "user"
      }

      // Icon buttons for actions
      component Heading text: "Actions"
      layout stack(direction: horizontal, gap: 8) {
        component IconButton icon: "download" variant: "primary"
        component IconButton icon: "trash-2" variant: "danger"
        component IconButton icon: "check" variant: "primary"
        component IconButton icon: "x" variant: "danger"
      }

      // Disabled buttons
      layout stack(direction: horizontal, gap: 8) {
        component IconButton icon: "lock" variant: "default" disabled: "true"
        component IconButton icon: "settings" variant: "primary" disabled: "true"
      }
    }
  }
}
```

## Styling Notes

- **Icons** scale to fit their container while maintaining aspect ratio
- **IconButtons** are square buttons (equal width and height)
- Colors are determined by:
  - For `Icon`: the theme's text color (or explicit `color` property)
  - For `IconButton`: the variant selected (default/primary/danger)
- **Disabled** state reduces opacity to 0.5 (visual feedback)

## Icon Sources

All icons are from [Feather Icons](https://feathericons.com) by Cole Bemis and contributors, licensed under the MIT License.

See [ICONS-LICENSE.md](../../../packages/engine/src/renderer/icons/ICONS-LICENSE.md) for full attribution details.

## Rendering

- Icons are rendered as **inline SVG** in the output
- They scale seamlessly from low-resolution wireframes to high-DPI displays
- All icons use **stroke-based** rendering (not fill) for consistent appearance with the `stroke: currentColor` attribute
- The stroke width is fixed at 2px for consistency across sizes

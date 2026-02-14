---
title: Icons Guide
description: Using Feather Icons in Wire-DSL
---

Wire-DSL includes two icon components powered by **Feather Icons** (MIT License): `Icon` and `IconButton`.

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

---

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

---

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

For a full reference of all available icons, visit the [Feather Icons Gallery](https://feathericons.com).

---

## Complete Example

<!-- wire-preview:start -->
```wire
project "Icon Gallery" {
  config {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen IconGallery {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      component Heading text: "Feather Icons Gallery"
      component Text content: "Complete collection of available icons organized by category"

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "UI Navigation"
        layout grid(columns: 12, gap: md) {
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "home"
              component Label text: "home"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "menu"
              component Label text: "menu"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "x"
              component Label text: "x"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "chevron-right"
              component Label text: "chevron-right"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "chevron-left"
              component Label text: "chevron-left"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "chevron-up"
              component Label text: "chevron-up"
            }
          }
        }
        layout grid(columns: 12, gap: md) {
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "chevron-down"
              component Label text: "chevron-down"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Arrows & Navigation"
        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "arrow-left"
              component Label text: "arrow-left"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "arrow-right"
              component Label text: "arrow-right"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "arrow-up"
              component Label text: "arrow-up"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "arrow-down"
              component Label text: "arrow-down"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Search & Input"
        layout grid(columns: 12, gap: md) {
          cell span: 6 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "search"
              component Label text: "search"
            }
          }
          cell span: 6 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "filter"
              component Label text: "filter"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Edit & Actions"
        layout grid(columns: 12, gap: md) {
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "edit"
              component Label text: "edit"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "edit-2"
              component Label text: "edit-2"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "trash"
              component Label text: "trash"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "trash-2"
              component Label text: "trash-2"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "copy"
              component Label text: "copy"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "download"
              component Label text: "download"
            }
          }
        }
        layout grid(columns: 12, gap: md) {
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "upload"
              component Label text: "upload"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "plus"
              component Label text: "plus"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "minus"
              component Label text: "minus"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "check"
              component Label text: "check"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Notifications & Feedback"
        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "bell"
              component Label text: "bell"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "alert-circle"
              component Label text: "alert-circle"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "alert-triangle"
              component Label text: "alert-triangle"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "info"
              component Label text: "info"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "User & Account"
        layout grid(columns: 12, gap: md) {
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "user"
              component Label text: "user"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "user-check"
              component Label text: "user-check"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "user-x"
              component Label text: "user-x"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "settings"
              component Label text: "settings"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "log-out"
              component Label text: "log-out"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "log-in"
              component Label text: "log-in"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Communication"
        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "mail"
              component Label text: "mail"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "phone"
              component Label text: "phone"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "share"
              component Label text: "share"
            }
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "share-2"
              component Label text: "share-2"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Data & Information"
        layout grid(columns: 12, gap: md) {
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "calendar"
              component Label text: "calendar"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "clock"
              component Label text: "clock"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "map-pin"
              component Label text: "map-pin"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "wifi"
              component Label text: "wifi"
            }
          }
          cell span: 2 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "wifi-off"
              component Label text: "wifi-off"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Media & Visuals"
        layout grid(columns: 12, gap: md) {
          cell span: 4 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "eye"
              component Label text: "eye"
            }
          }
          cell span: 4 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "eye-off"
              component Label text: "eye-off"
            }
          }
          cell span: 4 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "image"
              component Label text: "image"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Feedback & Social"
        layout grid(columns: 12, gap: md) {
          cell span: 6 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "heart"
              component Label text: "heart"
            }
          }
          cell span: 6 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "star"
              component Label text: "star"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Loading & Misc"
        layout grid(columns: 12, gap: md) {
          cell span: 4 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "loader"
              component Label text: "loader"
            }
          }
          cell span: 4 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "help-circle"
              component Label text: "help-circle"
            }
          }
          cell span: 4 {
            layout stack(direction: vertical, gap: sm, padding: md) {
              component Icon type: "lock"
              component Label text: "lock"
            }
          }
        }
      }

      layout card(padding: lg, gap: md, radius: md, border: true) {
        component Heading text: "Icon Buttons"
        component Text content: "IconButton variants and states"

        layout stack(direction: vertical, gap: md) {
          component Heading text: "Default Variant"
          layout stack(direction: horizontal, gap: sm) {
            component IconButton icon: "download" variant: "default"
            component IconButton icon: "upload" variant: "default"
            component IconButton icon: "settings" variant: "default"
            component IconButton icon: "menu" variant: "default"
          }

          component Heading text: "Primary Variant"
          layout stack(direction: horizontal, gap: sm) {
            component IconButton icon: "check" variant: "primary"
            component IconButton icon: "plus" variant: "primary"
            component IconButton icon: "download" variant: "primary"
            component IconButton icon: "share" variant: "primary"
          }

          component Heading text: "Danger Variant"
          layout stack(direction: horizontal, gap: sm) {
            component IconButton icon: "trash-2" variant: "danger"
            component IconButton icon: "x" variant: "danger"
            component IconButton icon: "alert-circle" variant: "danger"
            component IconButton icon: "lock" variant: "danger"
          }

          component Heading text: "Disabled State"
          layout stack(direction: horizontal, gap: sm) {
            component IconButton icon: "download" variant: "default" disabled: "true"
            component IconButton icon: "settings" variant: "primary" disabled: "true"
            component IconButton icon: "trash" variant: "danger" disabled: "true"
          }
        }
      }
    }
  }
}
```
<!-- wire-preview:end -->

---

## Styling Notes

- **Icons** scale to fit their container while maintaining aspect ratio
- **IconButtons** are square buttons (equal width and height)
- Colors are determined by:
  - For `Icon`: the theme's text color (or explicit `color` property)
  - For `IconButton`: the variant selected (default/primary/danger)
- **Disabled** state reduces opacity to 0.5 (visual feedback)

---

## Icon Attribution

All icons are from [Feather Icons](https://feathericons.com) by Cole Bemis and contributors, licensed under the MIT License.

---

## Rendering

- Icons are rendered as **inline SVG** in the output
- They scale seamlessly from low-resolution wireframes to high-DPI displays
- All icons use **stroke-based** rendering (not fill) for consistent appearance
- The stroke width is fixed at 2px for consistency across sizes

---

## Next Steps

- [All Components](./components.md)
- [Containers & Layouts](./containers.md)
- [DSL Syntax](./syntax.md)

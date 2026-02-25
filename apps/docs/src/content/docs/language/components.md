---
title: Components Reference
description: Complete reference for all Wire-DSL components
---

Complete reference for all available components with detailed specifications, properties, and examples.

---

## Dynamic Custom Component Bindings

Built-in components use static properties. Dynamic `prop_*` bindings apply when a component is inside `define Component` or `define Layout`.

```wire
define Component "MyMenu" {
  component SidebarMenu
    items: "Home,Users,Settings"
    active: prop_active
}

screen Main {
  layout stack {
    component MyMenu active: 1
  }
}
```

If a binding argument is missing:
- required target field: semantic error
- optional target field: omitted + warning

---

## Text Components

### Heading

Large, bold text for page titles and section headers.

**Properties**:
- `text` (string): The heading text
- `level` (enum): Visual heading level - `h1` | `h2` | `h3` | `h4` | `h5` | `h6` (default: `h2`)
- `spacing` (enum): Vertical inner spacing around heading text - `none` | `xs` | `sm` | `md` | `lg` | `xl` (optional)
- `variant` (string): Color variant - `default` | built-ins (`primary`, `danger`, etc.) | custom key in `colors`

**Example**:
```wire
component Heading text: "Dashboard" level: h1
component Heading text: "User Management" level: h2
component Heading text: "Section title" level: h3
component Heading text: "Card Title" level: h4 spacing: none
component Heading text: "Brand Title" variant: primary
```

**Rendering**: Bold text with size based on `level`

---

### Text

Standard body text for content and descriptions.

**Properties**:
- `text` (string): The text content
- `size` (enum, optional): Font size — `xs` | `sm` | `md` | `lg` | `xl` (default: `md`, ~14px)
- `bold` (boolean, optional): Render text in bold (default: `false`)
- `italic` (boolean, optional): Render text in italic (default: `false`)

**Example**:
```wire
component Text text: "This is body text"
component Text text: "Important notice" bold: true
component Text text: "Side note" size: sm italic: true
```

**Rendering**: Regular text at the specified size, with optional bold and italic styling

---

### Paragraph

Multi-line body text block with alignment control. Suitable for longer prose content.

**Properties**:
- `text` (string): The text content (may wrap across multiple lines)
- `align` (enum, optional): Text alignment — `left` | `center` | `right` (default: `left`)
- `size` (enum, optional): Font size — `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `bold` (boolean, optional): Render text in bold (default: `false`)
- `italic` (boolean, optional): Render text in italic (default: `false`)

**Example**:
```wire
component Paragraph text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
component Paragraph text: "Centered caption" align: center size: sm
component Paragraph text: "Quote text" italic: true align: center
```

**Rendering**: Wrapped text block respecting alignment and font styling options

---

### Label

Small, often bold text used for form field labels.

**Properties**:
- `text` (string): Label text

**Example**:
```wire
component Label text: "Email Address"
component Label text: "Password"
```

**Rendering**: Small bold text at 12-14px font size

---

## Input Components

### Input

Single-line text input field.

**Properties**:
- `label` (string): Field label
- `placeholder` (string): Placeholder text
- `size` (enum): Control size - `sm` | `md` | `lg` (default: `md`)
- `iconLeft` (enum, optional): Icon name rendered on the left side of the field (e.g., `search`, `mail`)
- `iconRight` (enum, optional): Icon name rendered on the right side of the field (e.g., `eye`, `x`)

> Both `iconLeft` and `iconRight` can be active simultaneously.

**Example**:
```wire
component Input label: "Email" placeholder: "you@example.com"
component Input label: "Search" placeholder: "Type to search..." iconLeft: "search"
component Input label: "Password" placeholder: "••••••••" iconLeft: "lock" iconRight: "eye"
component Input label: "Compact" placeholder: "..." size: sm
```

**Rendering**: Rectangular input box with border and optional label above

---

### Textarea

Multi-line text input field.

**Properties**:
- `label` (string): Field label
- `placeholder` (string): Placeholder text
- `rows` (number): Number of visible rows (default: 4)

**Example**:
```wire
component Textarea label: "Comments" rows: 5
component Textarea label: "Message" placeholder: "Type your message here" rows: 3
```

**Rendering**: Tall rectangular input box with scrolling capability

---

### Select

Dropdown selection field.

**Properties**:
- `label` (string): Field label
- `items` (string, CSV): Comma-separated list of options
- `size` (enum): Control size - `sm` | `md` | `lg` (default: `md`)
- `iconLeft` (enum, optional): Icon name rendered on the left side of the field
- `iconRight` (enum, optional): Icon name rendered to the left of the chevron, on the right side

> Both `iconLeft` and `iconRight` can be active simultaneously.

**Example**:
```wire
component Select label: "Role" items: "Admin,User,Guest"
component Select label: "Status" items: "Active,Inactive,Pending"
component Select label: "Country" iconLeft: "globe" items: "Spain,France,Germany"
component Select label: "Category" iconLeft: "tag" iconRight: "filter" items: "A,B,C"
component Select label: "Size" items: "S,M,L" size: lg
```

**Rendering**: Dropdown button with list of options

---

### Checkbox

Boolean checkbox input.

**Properties**:
- `label` (string): Checkbox label
- `checked` (boolean, optional): Whether checkbox is checked (default: false)

**Example**:
```wire
component Checkbox label: "I agree to terms" checked: true
component Checkbox label: "Subscribe to newsletter"
component Checkbox label: "Remember me" checked: false
```

**Rendering**: Small square checkbox with label text

---

### Radio

Single-select radio button (typically used in groups).

**Properties**:
- `label` (string): Radio button label
- `checked` (boolean, optional): Whether radio is selected (default: false)

**Example**:
```wire
component Radio label: "Option A" checked: true
component Radio label: "Option B"
component Radio label: "Personal" checked: false
```

**Rendering**: Circular radio button with label text

---

### Toggle

Boolean toggle switch.

**Properties**:
- `label` (string): Toggle label
- `enabled` (boolean, optional): Whether toggle is enabled (default: false)

**Example**:
```wire
component Toggle label: "Dark Mode" enabled: true
component Toggle label: "Enable notifications"
component Toggle label: "Auto-save" enabled: false
```

**Rendering**: Sliding toggle switch with label

---

## Button Components

### Button

Clickable action button.

**Properties**:
- `text` (string): Button label
- `variant` (string): Visual style - `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `default`)
- `size` (enum): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `icon` (enum, optional): Icon name to render alongside the text (e.g., `check`, `trash-2`, `plus`)
- `iconAlign` (enum, optional): Icon placement - `left` | `right` (default: `left`)
- `labelSpace` (boolean): Adds top offset to align with labeled `Input`/`Select` controls
- `padding` (enum): Horizontal inset - `none` | `xs` | `sm` | `md` | `lg` | `xl`
- `block` (boolean): Expands button width in compatible horizontal layouts

**Variants**:
- `default`: Neutral button style
- `primary`: Prominent filled button (usually blue)
- `secondary`: Neutral action
- `success`: Positive action
- `warning`: Caution action
- `danger`: Destructive action
- `info`: Informational action

**Example**:
```wire
component Button text: "Save" variant: primary
component Button text: "Cancel" variant: secondary
component Button text: "Delete" variant: danger
component Button text: "Confirm" variant: success icon: "check"
component Button text: "Remove" variant: danger icon: "trash-2" iconAlign: right
component Button text: "Add Item" icon: "plus"
component Button text: "Tiny" size: xs
component Button text: "Aligned" size: md labelSpace: true padding: md
component Button text: "Wide" size: xl
```

**Rendering**: Rectangular button with text (and optional leading/trailing icon), styled according to variant
Size note: `xs`/`xl` extend the scale below/above the standard `sm`–`lg` range. For action controls, `lg` aligns with the base `Input`/`Select` height.

---

### IconButton

Button with icon instead of text.

**Properties**:
- `icon` (enum): Icon name (from built-in icon catalog)
- `size` (enum): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `variant` (enum): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info`
- `disabled` (boolean): disabled state (`true` | `false`, default: `false`)
- `labelSpace` (boolean): Adds top offset to align with labeled form controls
- `padding` (enum): Horizontal inset - `none` | `xs` | `sm` | `md` | `lg` | `xl`

**Example**:
```wire
component IconButton icon: "search" size: xs variant: default
component IconButton icon: "search" size: sm variant: default
component IconButton icon: "menu" size: md variant: primary
component IconButton icon: "settings" size: lg variant: info disabled: true
component IconButton icon: "check" size: xl variant: primary
component IconButton icon: "check" size: md labelSpace: true padding: md
```

**Rendering**: Square button containing icon symbol
Size note: `xs`/`xl` extend the scale below/above the standard `sm`–`lg` range. Uses the same action size scale as `Button` and `Link`.

---

## Navigation Components

### Topbar

Top navigation bar/header.

**Properties**:
- `title` (string): Main title
- `subtitle` (string, optional): Secondary subtitle
- `size` (enum, optional): Bar height - `sm` (44 px) | `md` (56 px) | `lg` (72 px) (default: `md`)
- `icon` (string, optional): Left icon name (e.g., `menu`, `search`)
- `avatar` (boolean, optional): Show avatar circle on the right (`true`/`false`)
- `user` (string, optional): User name or identifier for badge
- `actions` (string, optional): Action items (comma-separated)
- `variant` (string, optional): Accent color variant for left icon/actions (`default` or custom/built-in key)
- `border` (boolean, optional): Draws container border (default: `false`)
- `background` (color, optional): Background fill. Accepts `true` (card background), a hex value (e.g., `#1565C0`), a Material color name (e.g., `indigo`), or omit/`false` for transparent.
- `radius` (enum, optional): Corner radius - `none` | `sm` | `md` | `lg` | `xl` (default: `md`)

**Example**:
```wire
component Topbar title: "Dashboard"
component Topbar title: "Dashboard" subtitle: "Welcome back" size: sm
component Topbar title: "Settings" user: "john_doe" size: lg
component Topbar title: "Admin" actions: "Help,Logout"
component Topbar title: "Workspace" subtitle: "Overview" icon: "menu" actions: "Help,Logout" user: "john_doe" avatar: true
component Topbar title: "Workspace" icon: "menu" actions: "Save,Export" variant: primary
component Topbar title: "Styled" background: "indigo" border: true radius: lg
component Topbar title: "Hex BG" background: "#FF5722"
```

**Rendering**: Horizontal bar at top of screen with optional left icon, title/subtitle, right actions, user badge, and avatar. When `user` is present, `actions` are shifted left to avoid overlap. `background` accepts boolean legacy values as well as any color string.

---

### SidebarMenu

Vertical menu for navigation.

**Properties**:
- `items` (string, CSV): Menu item labels
- `active` (number): Index of active item (default: 0)
- `icons` (string, CSV, optional): Icon names per menu item (same order as `items`)
- `variant` (string, optional): Color applied to the active item and its icon. If omitted, falls back to the `accent` color. Accepts semantic variants (`primary`, `success`, etc.) or custom color names from the `colors` block.

> When `icons` are set, the active item's icon is automatically colored using the same active color as the text.

**Example**:
```wire
component SidebarMenu items: "Home,Users,Settings,Help" active: 0
component SidebarMenu items: "Dashboard,Analytics,Reports,Admin" active: 1
component SidebarMenu items: "Dashboard,Users,Settings" icons: "home,users,settings" active: 0
component SidebarMenu items: "Dashboard,Users,Settings" icons: "home,users,settings" active: 1 variant: primary
```

**Rendering**: Vertical list of menu items with one highlighted as active; icons (if provided) match the active color for the selected item

---

### Sidebar

Side navigation panel.

**Properties**:
- `title` (string): Sidebar title
- `items` (string, CSV): Navigation item labels

**Example**:
```wire
component Sidebar title: "Navigation" items: "Home,Profile,Settings"
component Sidebar title: "Dashboard" items: "Overview,Users,Reports,Logs"
```

**Rendering**: Vertical panel with title and navigation items

---

### Breadcrumbs

Navigation hierarchy showing current page location.

**Properties**:
- `items` (string, CSV): Breadcrumb labels (required)
- `separator` (string, optional): Separator character between items (default: "/")

**Example**:
```wire
component Breadcrumbs items: "Home,Users,Detail"
component Breadcrumbs items: "Dashboard,Products,Electronics,Laptops" separator: ">"
component Breadcrumbs items: "Admin,Settings,Preferences" separator: " > "
```

**Rendering**: Horizontal path showing navigation hierarchy

---

### Tabs

Tabbed interface with multiple panels.

**Properties**:
- `items` (string, CSV): Tab labels
- `active` (number): Index of active tab (default: 0)
- `variant` (string, optional): Active tab color - `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `default`)
- `size` (enum, optional): Tab bar height - `sm` (32 px) | `md` (44 px) | `lg` (52 px) (default: `md`)
- `radius` (enum, optional): Active tab corner radius - `none` | `sm` | `md` | `lg` | `full` (default: `md`)
- `icons` (string, CSV, optional): Icon names per tab in the same order as `items` (e.g., `"home,users,settings"`)
- `flat` (boolean, optional): Removes filled tab backgrounds; active tab is indicated by a colored underline only (default: `false`)

**Example**:
```wire
component Tabs items: "Overview,Details,Comments" active: 0
component Tabs items: "Profile,Settings,Privacy,Security" active: 1
component Tabs items: "Dashboard,Analytics,Reports" active: 0 variant: primary
component Tabs items: "Home,Users,Settings" active: 0 icons: "home,users,settings"
component Tabs items: "Home,Profile,Settings" active: 1 flat: true
component Tabs items: "Overview,Details" active: 0 size: sm radius: full
```

**Rendering**: Horizontal tabs with one highlighted as active. `flat: true` replaces filled active background with a slim underline indicator. `icons` embeds SVG icon symbols next to each tab label.

---

## Data Components

### Table

Data table with rows and columns.

**Properties**:
- `columns` (string, CSV): Column headers (required)
- `rows` (number): Number of rows to display (default: 5)
- `rowsMock` (number): Alias for `rows`
- `mock` (string, CSV): Mock type by column position (for example: `"name,city,amount"`)
- `random` (boolean): If `true`, mock values vary on each render (default: deterministic)
- `pagination` (boolean): Enables pager controls
- `pages` (number): Total page count when `pagination` is enabled
- `paginationAlign` (enum): `left` | `center` | `right` (default: `right`)
- `actions` (string, CSV): Action icon names (e.g. `"eye,edit,trash"`) rendered in right action column
- `caption` (string): Footer caption text
- `captionAlign` (enum): `left` | `center` | `right` (auto-default based on pagination alignment)
- `border` (boolean): Draws the outer table border (default: `false`)
- `background` (boolean): Draws outer table background fill (default: `false`)

**Example**:
```wire
component Table columns: "Name,Email,Status" rows: 8
component Table columns: "ID,Name,Email,Role" rows: 10
component Table columns: "Date,Amount,Status,Notes" rows: 15
component Table columns: "User,City,Amount" rows: 6 mock: "name,city,amount"
component Table columns: "User,City,Amount" rows: 6 random: true
component Table columns: "User,Status" rows: 5 actions: "eye,edit,trash" caption: "Show 1 - 5 of 20" pagination: true
component Table columns: "User,Status" rows: 5 border: true background: true
```

**Rendering**: Grid table with header row and mock data rows

Footer behavior:
- `caption` and `pagination` can render together
- if `captionAlign` and `paginationAlign` resolve to the same side, both render (stacked) and a semantic warning is emitted
- when `caption` or `pagination` is enabled, extra bottom spacing is reserved so footer content is not glued to the table edge
- `actions` adds a right-aligned action column with icon buttons and empty header text

---

### List

Simple list of items.

**Properties**:
- `items` (string, CSV): List item labels
- `title` (string, optional): List title/header
- `itemsMock` (number, optional): Number of mock items to generate
- `mock` (string, optional): Mock type used when `items` is not provided
- `random` (boolean): If `true`, mock values vary on each render (default: deterministic)

**Example**:
```wire
component List items: "JavaScript,TypeScript,Python,Java"
component List items: "Feature 1,Feature 2,Feature 3,Feature 4"
component List title: "Recent Activity" items: "Login,Purchase,Invite,Export"
component List title: "Cities" itemsMock: 5 mock: "city"
component List title: "Cities" itemsMock: 5 mock: "city" random: true
```

**Rendering**: Vertical list with bullet points or numbers

---

## Media Components

### Image

Placeholder for image content.

**Properties**:
- `placeholder` (string): Shape - `square` | `landscape` | `portrait` | `avatar` | `icon`
- `icon` (enum, optional): Icon name used when `placeholder: "icon"`. The icon fills the component area directly, without an inner border box.
- `variant` (string, optional): When `placeholder: icon`, tints the background and icon with the specified color (e.g., `primary`, `success`, `danger`, or a custom key from `colors`). Behaves similarly to `IconButton` variants.
- `height` (number, optional): Explicit height in pixels. When set, the placeholder is rendered in **cover mode** — the image fills the entire area and is clipped to the bounding box via `<clipPath>`.
- `circle` (boolean, optional): Clips the image into a circle shape using a circular `<clipPath>`. Useful for avatars. Implies cover mode (default: `false`)

> The background color adapts to the active theme — light gray in `light` mode, dark gray in `dark` mode.

**Example**:
```wire
component Image placeholder: "square" height: 250
component Image placeholder: "landscape" height: 300
component Image placeholder: "avatar" height: 100 circle: true
component Image placeholder: "avatar" height: 80 circle: true
component Image placeholder: "icon" icon: "image" height: 120
component Image placeholder: "icon" icon: "user" variant: primary height: 80
component Image placeholder: "icon" icon: "shield" variant: success height: 80
```

**Rendering**: Rectangular placeholder with appropriate aspect ratio. When `height` is set, the placeholder uses cover-mode clipping. When `circle: true`, the image is clipped to a circle; when `placeholder: icon`, the specified icon is centered and fills the available space.

---

### Icon

Icon symbol.

**Properties**:
- `type` (enum): Icon identifier (built-in icon catalog)
- `size` (enum): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `variant` (string): Color variant (`default`, built-ins, or custom key in `colors`)
- `circle` (boolean, optional): Renders the icon inside a tinted circular background badge (default: `false`)

**Example**:
```wire
component Icon type: "search"
component Icon type: "settings"
component Icon type: "download"
component Icon type: "home" variant: primary
component Icon type: "user" size: lg circle: true variant: primary
component Icon type: "bell" size: xl circle: true variant: warning
```

**Rendering**: Small icon symbol inline with text. When `circle: true`, the icon is displayed inside a colored circular badge matching the variant tint.

---

## Display Components

### Divider

Horizontal or vertical separator line.

**Properties**:
- None required

**Example**:
```wire
component Divider
```

**Rendering**: Thin horizontal line for visual separation

---

### Separate

Invisible spacer used to separate nearby elements without drawing a line.

**Properties**:
- `size` (enum): Space token - `none` | `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)

**Example**:
```wire
component Separate size: sm
component Separate size: lg
```

**Rendering**: Adds vertical/horizontal blank space only

---

### Badge

Small label/tag for status or categorization.

**Properties**:
- `text` (string): Badge label
- `variant` (string): Style - `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `default`)
- `size` (enum, optional): Badge size — `xs` (16 px) | `sm` (20 px) | `md` (22 px) | `lg` (26 px) | `xl` (32 px) (default: `md`)
- `padding` (number, optional): Custom horizontal padding in pixels, overriding the size-derived default

**Example**:
```wire
component Badge text: "New" variant: primary
component Badge text: "Active" variant: success
component Badge text: "Alert" variant: warning
component Badge text: "xs" variant: info size: xs
component Badge text: "Large" variant: danger size: xl
component Badge text: "Wide" variant: primary padding: 20
```

**Rendering**: Small rounded label with colored background. `size` controls the overall height and font scale. `padding` overrides horizontal inset when fine-tuning label width.

---

### Link

Hyperlink text.

**Properties**:
- `text` (string): Link text
- `variant` (string): Link color variant - `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `primary`)
- `size` (enum): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)

**Example**:
```wire
component Link text: "Click here" variant: primary
component Link text: "Learn more" variant: info
component Link text: "Read docs" variant: primary size: lg
component Link text: "Tiny link" variant: secondary size: xs
```

**Rendering**: Underlined text using the selected variant color
Size note: `xs`/`xl` extend the scale below/above the standard `sm`–`lg` range. Uses the same action size scale as `Button` and `IconButton`.

---

### Alert

Alert/notification message box.

**Properties**:
- `variant` (string): Visual variant - `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `info`)
- `title` (string, optional): Bold title shown above text
- `text` (string): Alert body message

**Example**:
```wire
component Alert variant: "success" title: "Saved" text: "Changes saved successfully"
component Alert variant: "danger" title: "Error" text: "Something went wrong"
component Alert variant: "warning" title: "Warning" text: "This action cannot be undone"
component Alert variant: "info" title: "Info" text: "New updates available"
```

**Rendering**: Colored box with icon, title, and message

---

## Information Display

### Stat

Statistics card displaying metric and value.

**Properties**:
- `title` (string): Metric label/title
- `value` (string): Metric value to display
- `caption` (string, optional): Secondary text shown below value
- `icon` (string, optional): Icon name rendered in the top-right badge

**Example**:
```wire
component Stat title: "Total Users" value: "1,234"
component Stat title: "Revenue" value: "$45,678" caption: "vs last month"
component Stat title: "Growth" value: "+12.5%" icon: "trending-up"
```

**Rendering**: Card with large value and small label below

---

### Card

Generic content card placeholder component.

**Properties**:
- `title` (string): Card title
- `text` (string): Card text content

**Example**:
```wire
component Card title: "Plan" text: "Summary details"
component Card title: "Profile" text: "Account information"
```

**Rendering**: Generic bordered placeholder block

---

### Code

Code block display.

**Properties**:
- `code` (string): Code content to display

**Example**:
```wire
component Code code: "const x = 10; console.log(x);"
component Code code: "function sum(a, b) { return a + b; }"
component Code code: "SELECT * FROM users WHERE active = true;"
```

**Rendering**: Monospace text in gray background box

---

### Chart

Placeholder for various chart types.

**Properties**:
- `type` (string): Chart type - `bar` | `line` | `pie` | `area` (default: `bar`)
- `height` (number): Height in pixels (default: 200)
**Example**:
```wire
component Chart type: "bar" height: 250
component Chart type: "line" height: 300
component Chart type: "pie" height: 200
```

**Rendering**: Deterministic chart placeholders with upward trend and subtle fluctuations

---

## Modal & Overlay

### Modal

Modal dialog box.

**Properties**:
- `title` (string): Modal title
- `visible` (boolean): Show/hide modal overlay (default: `true`)

**Example**:
```wire
component Modal title: "Confirm Action"
component Modal title: "Delete User"
component Modal title: "Delete User" visible: false
```

**Rendering**: Centered overlay dialog with title and generic content placeholder

---

## Component Summary

| Component | Type | Use Case |
|-----------|------|----------|
| Heading | Text | Page titles |
| Text | Text | Body content |
| Label | Text | Form labels |
| Input | Input | Single-line input |
| Textarea | Input | Multi-line input |
| Select | Input | Dropdown choice |
| Checkbox | Input | Multiple choice |
| Radio | Input | Single choice |
| Toggle | Input | Boolean toggle |
| Button | Button | Clickable action |
| IconButton | Button | Icon-based action |
| Topbar | Navigation | Header bar |
| SidebarMenu | Navigation | Vertical menu |
| Sidebar | Navigation | Side panel |
| Breadcrumbs | Navigation | Navigation path |
| Tabs | Navigation | Tabbed content |
| Table | Data | Data grid |
| List | Data | Item list |
| Image | Media | Image placeholder |
| Icon | Media | Icon symbol |
| Divider | Display | Visual separator |
| Separate | Display | Invisible spacer |
| Badge | Display | Status label |
| Link | Display | Underlined action |
| Alert | Display | Alert message |
| Stat | Info | Metric display |
| Card | Info | Generic content card |
| Code | Info | Code block |
| Chart | Info | Chart area |
| Modal | Overlay | Dialog box |

**Total: 30 Components**

---

## Next Steps

- [Containers & Layouts](./containers.md)
- [Configuration](./configuration.md)
- [DSL Syntax](./syntax.md)

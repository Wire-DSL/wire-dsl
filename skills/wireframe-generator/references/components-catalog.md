---
name: Components Catalog
description: Complete reference of all 31 Wire DSL components with properties and examples
---

# Wire DSL Components Catalog

Wire DSL provides 31 UI components organized into 8 categories. This reference lists all components with their properties and usage examples.

## Text Components (5)

### Heading
Large heading text with level-based typography.

**Properties:**
- `text` (string, required): The heading text
- `level` (enum, optional): `h1` | `h2` | `h3` | `h4` | `h5` | `h6`
- `spacing` (enum, optional): `none` | `xs` | `sm` | `md` | `lg` | `xl`
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors

**Example:**
```wire
component Heading text: "Users" level: h2 spacing: sm
component Heading text: "Welcome to Dashboard"
```

---

### Text
Body text content.

**Properties:**
- `text` (string, required): The text content
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `bold` (boolean, optional): Bold weight (default: `false`)
- `italic` (boolean, optional): Italic style (default: `false`)

**Example:**
```wire
component Text text: "This is regular body text"
component Text text: "Important notice" bold: true
component Text text: "Side note" size: sm italic: true
```

---

### Paragraph
Full-width text block with alignment, size, and formatting options.

**Properties:**
- `text` (string, required): The text content (wraps automatically)
- `align` (enum, optional): `left` | `center` | `right` (default: `left`)
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `bold` (boolean, optional): Bold weight (default: `false`)
- `italic` (boolean, optional): Italic style (default: `false`)

**Example:**
```wire
component Paragraph text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
component Paragraph text: "Centered caption" align: center size: sm
component Paragraph text: "Quoted text" italic: true align: center
```

---

### Label
Small label text (typically for form fields).

**Properties:**
- `text` (string, required): The label text

**Example:**
```wire
component Label text: "Email Address"
component Label text: "Password"
```

---

### Code
Code snippet display.

**Properties:**
- `code` (string, required): The code snippet

**Example:**
```wire
component Code code: "const x = 42;"
component Code code: "function add(a, b) { return a + b; }"
```

---

## Input Components (6)

### Input
Single-line text input field.

**Properties:**
- `label` (string, optional): Field label
- `placeholder` (string, optional): Placeholder text
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl`
- `iconLeft` (string, optional): Left icon name (Feather Icons)
- `iconRight` (string, optional): Right icon name (Feather Icons)
- `disabled` (boolean, optional): Dims the component (default: `false`)

**Example:**
```wire
component Input label: "Email" placeholder: "you@example.com"
component Input label: "Search" placeholder: "Type..." iconLeft: "search"
component Input label: "Password" iconRight: "eye-off" disabled: false
```

---

### Textarea
Multi-line text input field.

**Properties:**
- `label` (string, optional): Field label
- `placeholder` (string, optional): Placeholder text
- `rows` (number, optional): Number of visible rows (default: 3)

**Example:**
```wire
component Textarea label: "Message" placeholder: "Enter your message" rows: 5
component Textarea label: "Bio" rows: 8
component Textarea label: "Comments" placeholder: "Your feedback"
```

---

### Select
Dropdown selection field.

**Properties:**
- `label` (string, optional): Field label
- `placeholder` (string, optional): Placeholder text
- `items` (string, optional): Comma-separated list of options
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl`
- `iconLeft` (string, optional): Left icon name (Feather Icons)
- `iconRight` (string, optional): Right icon name (Feather Icons)
- `disabled` (boolean, optional): Dims the component (default: `false`)

**Example:**
```wire
component Select label: "Country" items: "USA,Canada,Mexico,UK"
component Select label: "Country" iconLeft: "globe" items: "Spain,France,Germany"
component Select label: "Role" items: "Admin,User,Guest"
```

---

### Checkbox
Checkbox input with label.

**Properties:**
- `label` (string, required): Checkbox label
- `checked` (boolean, optional): Initial checked state (default: `false`)
- `disabled` (boolean, optional): Dims the component (default: `false`)

**Example:**
```wire
component Checkbox label: "I agree to terms and conditions" checked: false
component Checkbox label: "Subscribe to newsletter" checked: true
component Checkbox label: "Remember me"
```

---

### Radio
Radio button input with label.

**Properties:**
- `label` (string, required): Radio label
- `checked` (boolean, optional): Initial checked state (default: `false`)
- `disabled` (boolean, optional): Dims the component (default: `false`)

**Example:**
```wire
component Radio label: "Option A" checked: true
component Radio label: "Option B" checked: false
component Radio label: "Monthly Plan"
```

**Note:** For radio button groups, use multiple Radio components:
```wire
layout stack(direction: vertical, gap: sm) {
  component Label text: "Select Plan"
  component Radio label: "Free Plan" checked: true
  component Radio label: "Pro Plan" checked: false
  component Radio label: "Enterprise Plan" checked: false
}
```

---

### Toggle
Toggle switch input.

**Properties:**
- `label` (string, required): Toggle label
- `enabled` (boolean, optional): Initial enabled state (default: `false`)
- `disabled` (boolean, optional): Dims the component (default: `false`)

**Example:**
```wire
component Toggle label: "Dark Mode" enabled: false
component Toggle label: "Enable Notifications" enabled: true
component Toggle label: "Auto-save"
```

---

## Action Components (3)

### Button
Clickable action button.

**Properties:**
- `text` (string, required): Button text
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors (default: `default`)
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl`
- `icon` (string, optional): Icon name rendered beside text (Feather Icons)
- `iconAlign` (enum, optional): `left` | `right` (default: `left`)
- `align` (enum, optional): `left` | `center` | `right`
- `labelSpace` (boolean, optional): Reserve label space above button
- `padding` (enum, optional): `none` | `xs` | `sm` | `md` | `lg` | `xl`
- `block` (boolean, optional): Full-width button
- `disabled` (boolean, optional): Dims the button (default: `false`)

**Example:**
```wire
component Button text: "Submit" variant: primary
component Button text: "Delete" variant: danger icon: "trash-2"
component Button text: "Confirm" variant: primary icon: "check" iconAlign: left
component Button text: "Save" variant: teal
```

---

### IconButton
Button that renders only an icon (no text).

**Properties:**
- `icon` (string, required): Icon name (Feather Icons)
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl`
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `disabled` (boolean, optional): Dims the button
- `labelSpace` (boolean, optional): Reserve label space above button
- `padding` (enum, optional): `none` | `xs` | `sm` | `md` | `lg` | `xl`

**Common Icon Names:**
`search`, `settings`, `menu`, `close`, `x`, `home`, `star`, `heart`, `download`, `upload`, `trash`, `trash-2`, `edit`, `edit-2`, `user`, `users`, `bell`, `mail`, `calendar`, `lock`, `unlock`, `check`, `plus`, `minus`, `chevron-right`, `chevron-left`, `chevron-up`, `chevron-down`, `arrow-left`, `arrow-right`, `more-vertical`, `more-horizontal`, `filter`, `refresh-cw`, `eye`, `eye-off`

**Example:**
```wire
component IconButton icon: "search" variant: default size: md
component IconButton icon: "settings"
component IconButton icon: "trash-2" variant: danger
```

---

### Link
Underlined text action without button background.

**Properties:**
- `text` (string, required): Link text
- `variant` (enum, optional): `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl`

**Example:**
```wire
component Link text: "Learn more" variant: info
component Link text: "Forgot password?"
component Link text: "View all products"
```

---

## Navigation Components (5)

### Topbar
Top navigation/header bar.

**Properties:**
- `title` (string, required): Main title
- `subtitle` (string, optional): Subtitle text
- `icon` (string, optional): Icon name (Feather Icons)
- `avatar` (boolean, optional): Show avatar display
- `actions` (string, optional): Comma-separated action labels
- `user` (string, optional): User name/email
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `border` (boolean, optional): Show bottom border
- `background` (color, optional): Background color (`true` = card bg, hex or named Material color)
- `radius` (enum, optional): `none` | `sm` | `md` | `lg` | `xl`
- `size` (enum, optional): `sm` | `md` | `lg` (default: `md`)
- `color` (color, optional): Text color for title

**Example:**
```wire
component Topbar title: "Dashboard" subtitle: "Overview" icon: "menu" user: "john_doe" avatar: true
component Topbar title: "Admin Panel" actions: "Settings,Profile,Logout"
component Topbar title: "My App" variant: primary
```

---

### SidebarMenu
Vertical sidebar navigation menu.

**Properties:**
- `items` (string, required): Comma-separated menu items
- `icons` (string, optional): Comma-separated icon names aligned to each item
- `active` (number, optional): Active item index (0-based, default: 0)
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors

**Example:**
```wire
component SidebarMenu items: "Dashboard,Users,Settings" icons: "home,users,settings" active: 0 variant: primary
component SidebarMenu items: "Home,Products,Orders,Customers" active: 1
```

---

### Sidebar
Sidebar panel with title and items.

**Properties:**
- `title` (string, optional): Sidebar title
- `items` (string, required): Comma-separated sidebar items
- `active` (string, optional): Active item name
- `itemsMock` (number, optional): Number of mock items to generate

**Example:**
```wire
component Sidebar title: "Menu" items: "Home,Reports,Settings"
component Sidebar items: "Dashboard,Analytics,Users" active: "Dashboard"
```

---

### Breadcrumbs
Breadcrumb navigation trail.

**Properties:**
- `items` (string, required): Comma-separated breadcrumb items
- `separator` (string, optional): Separator character (default: `/`)

**Example:**
```wire
component Breadcrumbs items: "Home,Users,John Doe"
component Breadcrumbs items: "Products,Electronics,Laptops" separator: ">"
```

---

### Tabs
Horizontal tab navigation.

**Properties:**
- `items` (string, required): Comma-separated tab labels
- `active` (number, optional): Active tab index (0-based, default: 0)
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `radius` (enum, optional): `none` | `sm` | `md` | `lg` | `full` (default: `md`)
- `size` (enum, optional): `sm` | `md` | `lg` (default: `md`)
- `icons` (string, optional): Comma-separated icon names aligned to each tab
- `flat` (boolean, optional): Underline indicator style without filled background (default: `false`)
- `border` (boolean, optional): Show/hide borders (default: `true`)
- `color` (color, optional): Text color for tab labels

**Example:**
```wire
component Tabs items: "Profile,Settings,Notifications" active: 0
component Tabs items: "Overview,Details,Reviews" active: 1 flat: true
component Tabs items: "All,Active,Completed" icons: "list,check-circle,archive"
```

---

## Data Components (4)

### Table
Tabular data placeholder.

**Properties:**
- `columns` (string, required): Comma-separated column headers
- `title` (string, optional): Table title
- `rows` (number, optional): Number of data rows to show
- `rowsMock` (number, optional): Number of mock rows to generate
- `mock` (string, optional): Comma-separated mock data types (e.g., `"name,city,amount"`)
- `random` (boolean, optional): Randomize mock data
- `pagination` (boolean, optional): Show pagination controls
- `pages` (number, optional): Number of pages
- `paginationAlign` (enum, optional): `left` | `center` | `right`
- `actions` (string, optional): Comma-separated row action labels
- `caption` (string, optional): Table caption text
- `captionAlign` (enum, optional): `left` | `center` | `right`
- `border` (boolean, optional): Show outer border
- `innerBorder` (boolean, optional): Show inner cell borders
- `background` (boolean, optional): Show background

**Example:**
```wire
component Table columns: "User,City,Amount" rows: 8 mock: "name,city,amount"
component Table columns: "Name,Email,Status,Role" rows: 10 pagination: true
component Table columns: "ID,Date,Amount" rows: 5 actions: "Edit,Delete"
```

---

### List
Vertical list component.

**Properties:**
- `title` (string, optional): List title
- `items` (string, optional): Comma-separated list items
- `itemsMock` (number, optional): Number of mock items to generate
- `mock` (string, optional): Mock data type (e.g., `"city"`, `"name"`)
- `random` (boolean, optional): Randomize mock data

**Example:**
```wire
component List items: "Item 1,Item 2,Item 3,Item 4"
component List title: "Cities" itemsMock: 6 mock: "city"
component List items: "Todo: Fix bug,Todo: Add feature" title: "Tasks"
```

---

### Stat
Metric card with optional caption, icon, and variant color.

**Properties:**
- `title` (string, required): Stat label
- `value` (string, required): Stat value
- `caption` (string, optional): Additional caption text
- `icon` (string, optional): Icon name (Feather Icons)
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors

**Example:**
```wire
component Stat title: "Users" value: "1,234" icon: "users" variant: primary
component Stat title: "Revenue" value: "$45,230" caption: "+8% vs last month"
component Stat title: "Growth Rate" value: "+12.5%"
```

---

### Chart
Chart placeholder with deterministic trend data.

**Properties:**
- `type` (enum, required): `bar` | `line` | `pie` | `area`
- `height` (number, optional): Chart height in pixels

**Example:**
```wire
component Chart type: bar height: 250
component Chart type: line height: 400
component Chart type: pie height: 300
component Chart type: area height: 350
```

---

## Media Components (2)

### Image
Image placeholder block.

**Properties:**
- `type` (enum, optional): `landscape` | `portrait` | `square` | `icon` | `avatar`
- `icon` (string, optional): Icon name for icon-type images (Feather Icons)
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `height` (number, optional): Fixed height in pixels
- `circle` (boolean, optional): Clips image to circle (default: `false`)

**Example:**
```wire
component Image type: square height: 250
component Image type: icon icon: "user" variant: primary height: 120
component Image type: avatar circle: true
component Image type: landscape height: 400
```

---

### Icon
Standalone icon component (Feather Icons).

**Properties:**
- `icon` (string, required): Icon name
- `size` (enum, optional): `sm` | `md` | `lg`
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `circle` (boolean, optional): Render inside circular background (default: `false`)
- `padding` (number, optional): Inset padding in pixels

**Example:**
```wire
component Icon icon: "home" size: md
component Icon icon: "star" variant: primary circle: true
component Icon icon: "check-circle" size: lg
```

---

## Layout Components (3)

### Card
Generic content card placeholder (component version, not layout).

**Properties:**
- `title` (string, optional): Card title
- `text` (string, optional): Card content text

**Example:**
```wire
component Card title: "Summary" text: "Card content"
component Card title: "Quick Stats"
```

---

### Divider
Horizontal separator line.

**Properties:** None

**Example:**
```wire
component Divider
```

---

### Separate
Invisible spacing separator.

**Properties:**
- `size` (enum, optional): `none` | `xs` | `sm` | `md` | `lg` | `xl`

**Example:**
```wire
component Separate size: md
component Separate size: xl
```

---

## Feedback Components (3)

### Badge
Small status label.

**Properties:**
- `text` (string, required): Badge text
- `variant` (enum, optional): `default` | `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors (default: `default`)
- `size` (enum, optional): `xs` | `sm` | `md` | `lg` | `xl` (default: `md`)
- `padding` (number, optional): Custom horizontal padding in px

**Example:**
```wire
component Badge text: "Active" variant: success size: md
component Badge text: "New" variant: primary
component Badge text: "Low Stock" variant: warning
component Badge text: "Sold Out" variant: danger
```

---

### Alert
Alert/message box.

**Properties:**
- `variant` (enum, optional): `primary` | `secondary` | `success` | `warning` | `danger` | `info` | Material Design colors
- `title` (string, optional): Alert title
- `text` (string, optional): Alert message

**Example:**
```wire
component Alert variant: warning title: "Warning" text: "Review this action"
component Alert variant: success title: "Success" text: "Your changes have been saved"
component Alert variant: danger text: "Failed to connect to server"
component Alert variant: info text: "New updates are available"
```

---

### Modal
Modal overlay container.

**Properties:**
- `title` (string, required): Modal title
- `visible` (boolean, optional): Show/hide modal (default: `true`)

**Example:**
```wire
component Modal title: "Confirm action" visible: true
component Modal title: "Welcome" visible: false
```

---

## Component Categories Summary

| Category | Components | Count |
|----------|------------|-------|
| **Text** | Heading, Text, Paragraph, Label, Code | 5 |
| **Input** | Input, Textarea, Select, Checkbox, Radio, Toggle | 6 |
| **Action** | Button, IconButton, Link | 3 |
| **Navigation** | Topbar, SidebarMenu, Sidebar, Breadcrumbs, Tabs | 5 |
| **Data** | Table, List, Stat, Chart | 4 |
| **Media** | Image, Icon | 2 |
| **Layout** | Card, Divider, Separate | 3 |
| **Feedback** | Badge, Alert, Modal | 3 |
| **TOTAL** | | **31** |

## Usage Patterns

### Form Components Group
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Contact Form"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "you@example.com" iconLeft: "mail"
  component Textarea label: "Message" rows: 5
  component Checkbox label: "Subscribe to updates"
  component Button text: "Send" variant: primary
}
```

### Dashboard Stats Row
```wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component Stat title: "Total Sales" value: "$45,230" icon: "dollar-sign"
  }
  cell span: 3 {
    component Stat title: "Orders" value: "1,234" icon: "shopping-cart"
  }
  cell span: 3 {
    component Stat title: "Customers" value: "892" icon: "users"
  }
  cell span: 3 {
    component Stat title: "Growth" value: "+12.5%" icon: "trending-up"
  }
}
```

### Navigation with Sidebar
```wire
layout split(left: 240, gap: md) {
  layout stack(direction: vertical, gap: sm, padding: md) {
    component Heading text: "Menu"
    component SidebarMenu items: "Home,Products,Orders,Settings" icons: "home,box,shopping-cart,settings" active: 0
  }
  layout stack(direction: vertical, gap: lg, padding: lg) {
    component Topbar title: "Dashboard" user: "admin@example.com"
    // main content
  }
}
```

<!-- Source: @wire-dsl/language-support components.ts -->

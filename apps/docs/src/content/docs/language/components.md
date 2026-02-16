---
title: Components Reference
description: Complete reference for all Wire-DSL components
---

Complete reference for all available components with detailed specifications, properties, and examples.

---

## Text Components

### Heading

Large, bold text for page titles and section headers.

**Properties**:
- `text` (string): The heading text
- `level` (enum): Visual heading level - `h1` | `h2` | `h3` | `h4` | `h5` | `h6` (default: `h2`)

**Example**:
```wire
component Heading text: "Dashboard" level: h1
component Heading text: "User Management" level: h2
component Heading text: "Section title" level: h3
```

**Rendering**: Bold text with size based on `level`

---

### Text

Standard body text for content and descriptions.

**Properties**:
- `content` (string): The text content

**Example**:
```wire
component Text content: "This is body text"
component Text content: "User profile information goes here"
```

**Rendering**: Regular text at 14-16px font size

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

**Example**:
```wire
component Input label: "Email" placeholder: "you@example.com"
component Input label: "Search" placeholder: "Type to search..."
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

**Example**:
```wire
component Select label: "Role" items: "Admin,User,Guest"
component Select label: "Status" items: "Active,Inactive,Pending"
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
- `variant` (string): Visual style - `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `primary`)

**Variants**:
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
```

**Rendering**: Rectangular button with text, styled according to variant

---

### IconButton

Button with icon instead of text.

**Properties**:
- `icon` (string): Icon name (e.g., "search", "menu", "close")

**Example**:
```wire
component IconButton icon: "search"
component IconButton icon: "menu"
component IconButton icon: "settings"
```

**Rendering**: Square button containing icon symbol

---

## Navigation Components

### Topbar

Top navigation bar/header.

**Properties**:
- `title` (string): Main title
- `subtitle` (string, optional): Secondary subtitle
- `user` (string, optional): User name or identifier for badge
- `actions` (string, optional): Action items (comma-separated)

**Example**:
```wire
component Topbar title: "Dashboard"
component Topbar title: "Dashboard" subtitle: "Welcome back"
component Topbar title: "Settings" user: "john_doe"
component Topbar title: "Admin" actions: "Help,Logout"
```

**Rendering**: Horizontal bar at top of screen with logo/title and optional user menu

---

### SidebarMenu

Vertical menu for navigation.

**Properties**:
- `items` (string, CSV): Menu item labels
- `active` (number): Index of active item (default: 0)

**Example**:
```wire
component SidebarMenu items: "Home,Users,Settings,Help" active: 0
component SidebarMenu items: "Dashboard,Analytics,Reports,Admin" active: 1
```

**Rendering**: Vertical list of menu items, with one highlighted as active

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
- `activeIndex` (number): Index of active tab (default: 0)

**Example**:
```wire
component Tabs items: "Overview,Details,Comments" activeIndex: 0
component Tabs items: "Profile,Settings,Privacy,Security" activeIndex: 1
```

**Rendering**: Horizontal tabs with one highlighted as active

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

**Example**:
```wire
component Table columns: "Name,Email,Status" rows: 8
component Table columns: "ID,Name,Email,Role" rows: 10
component Table columns: "Date,Amount,Status,Notes" rows: 15
component Table columns: "User,City,Amount" rows: 6 mock: "name,city,amount"
component Table columns: "User,City,Amount" rows: 6 random: true
```

**Rendering**: Grid table with header row and mock data rows

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
- `placeholder` (string): Shape - `square` | `landscape` | `portrait` | `avatar` | `circle`
- `height` (number, optional): Height in pixels (default: 200)
- `src` (string, optional): Image source URL

**Example**:
```wire
component Image placeholder: "square" height: 250
component Image placeholder: "landscape" height: 300
component Image placeholder: "avatar" height: 100
```

**Rendering**: Rectangular placeholder image with appropriate aspect ratio

---

### Icon

Icon symbol.

**Properties**:
- `name` (string): Icon identifier (e.g., "search", "star", "heart")

**Example**:
```wire
component Icon name: "search"
component Icon name: "settings"
component Icon name: "download"
```

**Rendering**: Small icon symbol inline with text

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
- `variant` (string): Style - `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `primary`)

**Example**:
```wire
component Badge text: "New" variant: primary
component Badge text: "Active" variant: success
component Badge text: "Alert" variant: warning
```

**Rendering**: Small rounded label with colored background

---

### Link

Hyperlink text.

**Properties**:
- `text` (string): Link text
- `variant` (string): Link color variant - `primary` | `secondary` | `success` | `warning` | `danger` | `info` (default: `primary`)

**Example**:
```wire
component Link text: "Click here" variant: primary
component Link text: "Learn more" variant: info
```

**Rendering**: Underlined text using the selected variant color

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

### StatCard

Statistics card displaying metric and value.

**Properties**:
- `title` (string): Metric label/title
- `value` (string): Metric value to display
- `caption` (string, optional): Secondary text shown below value
- `icon` (string, optional): Icon name rendered in the top-right badge

**Example**:
```wire
component StatCard title: "Total Users" value: "1,234"
component StatCard title: "Revenue" value: "$45,678" caption: "vs last month"
component StatCard title: "Growth" value: "+12.5%" icon: "trending-up"
```

**Rendering**: Card with large value and small label below

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
- `content` (string): Modal content

**Example**:
```wire
component Modal title: "Confirm Action" content: "Are you sure you want to continue?"
component Modal title: "Delete User" content: "This action cannot be undone"
```

**Rendering**: Centered overlay dialog with title and content

---

## Loading & Feedback

### Spinner

Loading spinner animation.

**Properties**:
- None required

**Example**:
```wire
component Spinner
```

**Rendering**: Animated circular loading indicator

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
| StatCard | Info | Metric display |
| Code | Info | Code block |
| Chart | Info | Chart area |
| Modal | Overlay | Dialog box |
| Spinner | Feedback | Loading indicator |

**Total: 30 Components**

---

## Next Steps

- [Containers & Layouts](./containers.md)
- [Theme Configuration](./theming.md)
- [DSL Syntax](./syntax.md)

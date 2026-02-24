---
name: Components Catalog
description: Complete reference of all 21 Wire DSL components with properties and examples
---

# Wire DSL Components Catalog

Wire DSL provides 21 UI components organized into 8 categories. This reference lists all components with their properties and usage examples.

## Text Components (3)

### Heading
Renders a large heading/title text.

**Properties:**
- `text` (string, required): The heading text

**Example:**
```wire
component Heading text: "Welcome to Dashboard"
component Heading text: "User Profile"
```

---

### Text
Renders standard body text.

**Properties:**
- `content` (string, required): The text content

**Example:**
```wire
component Text content: "This is regular Text text"
component Text content: "Description of the product"
component Text content: "Long text wraps automatically into multiple lines"
```

---

### Label
Renders a small label text (typically for form fields).

**Properties:**
- `text` (string, required): The label text

**Example:**
```wire
component Label text: "Email Address"
component Label text: "Password"
```

---

## Input Components (6)

### Input
Single-line text input field.

**Properties:**
- `label` (string, required): Field label
- `placeholder` (string, optional): Placeholder text

**Example:**
```wire
component Input label: "Email" placeholder: "you@example.com"
component Input label: "First Name" placeholder: "John"
component Input label: "Search"
```

---

### Textarea
Multi-line text input field.

**Properties:**
- `label` (string, required): Field label
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
- `label` (string, required): Field label
- `items` (string, required): Comma-separated list of options

**Example:**
```wire
component Select label: "Country" items: "USA,Canada,Mexico,UK"
component Select label: "Role" items: "Admin,User,Guest"
component Select label: "Category" items: "Electronics,Clothing,Books,Home"
```

---

### Checkbox
Checkbox input with label.

**Properties:**
- `label` (string, required): Checkbox label
- `checked` (boolean, optional): Initial checked state (default: false)

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
- `checked` (boolean, optional): Initial checked state (default: false)

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
- `enabled` (boolean, optional): Initial enabled state (default: false)

**Example:**
```wire
component Toggle label: "Dark Mode" enabled: false
component Toggle label: "Enable Notifications" enabled: true
component Toggle label: "Auto-save"
```

---

## Button Components (2)

### Button
Standard clickable button.

**Properties:**
- `text` (string, required): Button text
- `variant` (enum, optional): Visual style (default: primary)
  - Values: `primary`, `secondary`, `ghost`

**Example:**
```wire
component Button text: "Submit" variant: primary
component Button text: "Cancel" variant: secondary
component Button text: "Delete" variant: ghost
component Button text: "Save"
```

---

### IconButton
Button with only an icon (no text).

**Properties:**
- `icon` (string, required): Icon name (Feather Icons)

**Common Icon Names:**
`search`, `settings`, `menu`, `close`, `x`, `home`, `star`, `heart`, `download`, `upload`, `trash`, `trash-2`, `edit`, `edit-2`, `user`, `users`, `bell`, `mail`, `calendar`, `lock`, `unlock`, `check`, `plus`, `minus`, `chevron-right`, `chevron-left`, `chevron-up`, `chevron-down`, `arrow-left`, `arrow-right`, `more-vertical`, `more-horizontal`, `filter`, `refresh-cw`, `eye`, `eye-off`

**Example:**
```wire
component IconButton icon: "search"
component IconButton icon: "settings"
component IconButton icon: "menu"
component IconButton icon: "trash"
```

---

## Navigation Components (4)

### Topbar
Top navigation bar with title and actions.

**Properties:**
- `title` (string, required): Main title
- `subtitle` (string, optional): Subtitle text
- `user` (string, optional): User name/email
- `actions` (string, optional): Comma-separated action labels

**Example:**
```wire
component Topbar title: "Dashboard" subtitle: "Welcome back" user: "john@example.com"
component Topbar title: "Admin Panel" actions: "Settings,Profile,Logout"
component Topbar title: "My App"
```

---

### SidebarMenu
Vertical sidebar navigation menu.

**Properties:**
- `items` (string, required): Comma-separated menu items
- `active` (number, optional): Active item index (0-based, default: 0)

**Example:**
```wire
component SidebarMenu items: "Dashboard,Users,Settings,Analytics" active: 0
component SidebarMenu items: "Home,Products,Orders,Customers" active: 1
component SidebarMenu items: "Overview,Reports,Logs"
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
component Breadcrumbs items: "Dashboard,Reports,Monthly"
```

---

### Tabs
Horizontal tab navigation.

**Properties:**
- `items` (string, required): Comma-separated tab labels
- `activeIndex` (number, optional): Active tab index (0-based, default: 0)

**Example:**
```wire
component Tabs items: "Profile,Settings,Notifications" activeIndex: 0
component Tabs items: "Overview,Details,Reviews,Shipping" activeIndex: 1
component Tabs items: "All,Active,Completed"
```

---

## Data Display Components (2)

### Table
Data table with columns and rows.

**Properties:**
- `columns` (string, required): Comma-separated column headers
- `rows` (number, required): Number of data rows to show

**Example:**
```wire
component Table columns: "Name,Email,Status,Role" rows: 8
component Table columns: "Product,Price,Stock,Category" rows: 12
component Table columns: "ID,Date,Amount,Status" rows: 5
```

---

### List
Vertical list of items.

**Properties:**
- `items` (string, required): Comma-separated list items
- `title` (string, optional): List title

**Example:**
```wire
component List items: "Item 1,Item 2,Item 3,Item 4"
component List items: "Todo: Fix bug,Todo: Add feature,Todo: Update docs" title: "Tasks"
component List items: "Apple,Banana,Cherry,Date"
```

---

## Media Components (2)

### Image
Image placeholder with aspect ratio.

**Properties:**
- `placeholder` (enum, required): Aspect ratio type
  - Values: `square`, `landscape`, `portrait`, `avatar`
- `height` (number, optional): Fixed height in pixels

**Example:**
```wire
component Image placeholder: "square" height: 250
component Image placeholder: "landscape" height: 400
component Image placeholder: "portrait" height: 600
component Image placeholder: "avatar"
```

---

### Icon
Standalone icon (Feather Icons).

**Properties:**
- `name` (string, required): Icon name

**Example:**
```wire
component Icon name: "star"
component Icon name: "heart"
component Icon name: "check-circle"
component Icon name: "alert-triangle"
```

---


## Display Components (4)

### Divider
Horizontal separator line.

**Properties:** None

**Example:**
```wire
component Divider
```

---

### Badge
Small label badge (tags, status indicators).

**Properties:**
- `text` (string, required): Badge text
- `variant` (enum, optional): Visual style (default: primary)
  - Values: `primary`, `secondary`, `success`, `warning`, `error`, `info`

**Example:**
```wire
component Badge text: "New" variant: primary
component Badge text: "In Stock" variant: success
component Badge text: "Low Stock" variant: warning
component Badge text: "Out of Stock" variant: error
component Badge text: "Beta" variant: info
```

---

### Link
Clickable hyperlink.

**Properties:**
- `text` (string, required): Link text

**Example:**
```wire
component Link text: "Learn more"
component Link text: "Forgot password?"
component Link text: "View all products"
```

---

### Alert
Alert/notification message box.

**Properties:**
- `type` (enum, required): Alert type
  - Values: `success`, `warning`, `error`, `info`
- `message` (string, required): Alert message

**Example:**
```wire
component Alert type: "success" message: "Your changes have been saved successfully"
component Alert type: "warning" message: "Your session will expire in 5 minutes"
component Alert type: "error" message: "Failed to connect to server"
component Alert type: "info" message: "New updates are available"
```

---

## Information Display Components (3)

### Stat
Statistics card with title and value.

**Properties:**
- `title` (string, required): Stat label
- `value` (string, required): Stat value

**Example:**
```wire
component Stat title: "Total Users" value: "2,543"
component Stat title: "Revenue" value: "$45,230"
component Stat title: "Growth Rate" value: "+12.5%"
component Stat title: "Active Now" value: "892"
```

---

### Code
Code block with syntax highlighting placeholder.

**Properties:**
- `code` (string, required): Code snippet

**Example:**
```wire
component Code code: "const greeting = 'Hello World';"
component Code code: "function add(a, b) { return a + b; }"
component Code code: "SELECT * FROM users WHERE active = true;"
```

---

### ChartPlaceholder
Chart visualization placeholder.

**Properties:**
- `type` (enum, required): Chart type
  - Values: `bar`, `line`, `pie`, `area`
- `height` (number, optional): Chart height in pixels (default: 300)

**Example:**
```wire
component ChartPlaceholder type: "bar" height: 250
component ChartPlaceholder type: "line" height: 400
component ChartPlaceholder type: "pie" height: 300
component ChartPlaceholder type: "area" height: 350
```

---

## Modal & Feedback Components (2)

### Modal
Modal dialog overlay.

**Properties:**
- `title` (string, required): Modal title
- `content` (string, required): Modal content/message

**Example:**
```wire
component Modal title: "Confirm Action" content: "Are you sure you want to delete this item?"
component Modal title: "Welcome" content: "Thanks for signing up!"
component Modal title: "Error" content: "Something went wrong. Please try again."
```

---

### Spinner
Loading spinner animation.

**Properties:** None

**Example:**
```wire
component Spinner
```

---

## Component Categories Summary

| Category | Components | Count |
|----------|------------|-------|
| **Text** | Heading, Text, Label | 3 |
| **Input** | Input, Textarea, Select, Checkbox, Radio, Toggle | 6 |
| **Buttons** | Button, IconButton | 2 |
| **Navigation** | Topbar, SidebarMenu, Breadcrumbs, Tabs | 4 |
| **Data** | Table, List | 2 |
| **Media** | Image, Icon | 2 |
| **Display** | Divider, Badge, Link, Alert | 4 |
| **Info** | Stat, Code, ChartPlaceholder | 3 |
| **Modal** | Modal, Spinner | 2 |
| **TOTAL** | | **21** |

## Usage Patterns

### Form Components Group
```wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Contact Form"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "you@example.com"
  component Textarea label: "Message" rows: 5
  component Checkbox label: "Subscribe to updates"
  component Button text: "Send" variant: primary
}
```

### Dashboard Stats Row
```wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component Stat title: "Total Sales" value: "$45,230"
  }
  cell span: 3 {
    component Stat title: "Orders" value: "1,234"
  }
  cell span: 3 {
    component Stat title: "Customers" value: "892"
  }
  cell span: 3 {
    component Stat title: "Growth" value: "+12.5%"
  }
}
```

### Navigation with Sidebar
```wire
layout split(sidebar: 240, gap: md) {
  layout stack(direction: vertical, gap: sm, padding: md) {
    component Heading text: "Menu"
    component SidebarMenu items: "Home,Products,Orders,Settings" active: 0
  }
  layout stack(direction: vertical, gap: lg, padding: lg) {
    component Topbar title: "Dashboard" user: "admin@example.com"
    // main content
  }
}
```

<!-- Source: docs/COMPONENTS-REFERENCE.md, .ai/AI-INSTRUCTIONS-MAIN.md, specs/IR-CONTRACT.md -->

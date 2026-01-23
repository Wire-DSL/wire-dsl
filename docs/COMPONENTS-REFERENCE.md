# Wire-DSL Components Reference

Complete reference for all available components with detailed specifications, properties, and examples.

---

## Text Components

### Heading

Large, bold text for page titles and section headers.

**Properties**:
- `title` (string): The heading text

**Example**:
```
component Heading title: "Dashboard"
component Heading title: "User Management"
```

**Rendering**: Bold text at 24-28px font size

---

### Text

Standard body text for content and descriptions.

**Properties**:
- `content` (string): The text content

**Example**:
```
component Text content: "This is body text"
component Text content: "User profile information goes here"
```

**Rendering**: Regular text at 14-16px font size

---

### Paragraph

Multi-line paragraph text with word wrapping.

**Properties**:
- `content` (string): Paragraph content

**Example**:
```
component Paragraph content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
```

**Rendering**: Regular text with automatic line wrapping

---

### Label

Small, often bold text used for form field labels.

**Properties**:
- `text` (string): Label text

**Example**:
```
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
```
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
```
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
```
component Select label: "Role" items: "Admin,User,Guest"
component Select label: "Status" items: "Active,Inactive,Pending"
```

**Rendering**: Dropdown button with list of options

---

### Checkbox

Boolean checkbox input.

**Properties**:
- `label` (string): Checkbox label

**Example**:
```
component Checkbox label: "I agree to terms"
component Checkbox label: "Subscribe to newsletter"
```

**Rendering**: Small square checkbox with label text

---

### Radio

Single-select radio button (typically used in groups).

**Properties**:
- `label` (string): Radio button label

**Example**:
```
component Radio label: "Option A"
component Radio label: "Option B"
```

**Rendering**: Circular radio button with label text

---

### Toggle

Boolean toggle switch.

**Properties**:
- `label` (string): Toggle label

**Example**:
```
component Toggle label: "Dark Mode"
component Toggle label: "Enable notifications"
```

**Rendering**: Sliding toggle switch with label

---

## Button Components

### Button

Clickable action button.

**Properties**:
- `text` (string): Button label
- `variant` (string): Visual style - `primary` | `secondary` | `ghost` (default: `secondary`)

**Variants**:
- `primary`: Prominent filled button (usually blue)
- `secondary`: Medium emphasis button (gray)
- `ghost`: Low emphasis button (outline only)

**Example**:
```
component Button text: "Save" variant: primary
component Button text: "Cancel" variant: secondary
component Button text: "Learn More" variant: ghost
```

**Rendering**: Rectangular button with text, styled according to variant

---

### IconButton

Button with icon instead of text.

**Properties**:
- `icon` (string): Icon name (e.g., "search", "menu", "close")

**Example**:
```
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
- `subtitle` (string, optional): Secondary title
- `user` (string, optional): User info or avatar placeholder
- `actions` (string, optional): Action items (comma-separated)

**Example**:
```
component Topbar title: "Dashboard" subtitle: "Welcome back" user: "John Doe"
component Topbar title: "Settings" actions: "Help,Logout"
```

**Rendering**: Horizontal bar at top of screen with logo/title and optional user menu

---

### SidebarMenu

Vertical menu for navigation.

**Properties**:
- `items` (string, CSV): Menu item labels
- `active` (number): Index of active item (default: 0)

**Example**:
```
component SidebarMenu items: "Home,Users,Settings,Help" active: 0
component SidebarMenu items: "Dashboard,Analytics,Reports,Admin" active: 1
```

**Rendering**: Vertical list of menu items, with one highlighted as active

---

### Breadcrumbs

Navigation hierarchy showing current page location.

**Properties**:
- `items` (string, CSV): Breadcrumb labels
- `separator` (string, optional): Separator character (default: "/")

**Example**:
```
component Breadcrumbs items: "Home,Users,User Detail"
component Breadcrumbs items: "Dashboard,Products,Electronics,Laptops" separator: ">"
```

**Rendering**: Horizontal path showing navigation hierarchy

---

### Tabs

Tabbed interface with multiple panels.

**Properties**:
- `items` (string, CSV): Tab labels
- `activeIndex` (number): Index of active tab (default: 0)

**Example**:
```
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
- `rows` (number): Number of mock rows (default: 5)
- `pagination` (boolean): Show pagination controls (default: false)
- `pages` (number): Number of pages if pagination enabled

**Example**:
```
component Table columns: "Name,Email,Status" rows: 8
component Table columns: "ID,Name,Email,Role,Actions" rows: 10 pagination: true pages: 5
component Table columns: "Date,Amount,Status" rows: 15
```

**Rendering**: Grid table with header row and mock data rows

---

### List

Simple list of items.

**Properties**:
- `items` (string, CSV): List item labels

**Example**:
```
component List items: "JavaScript,TypeScript,Python,Java"
component List items: "Feature 1,Feature 2,Feature 3,Feature 4"
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
```
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
```
component Icon name: "search"
component Icon name: "settings"
component Icon name: "download"
```

**Rendering**: Small icon symbol inline with text

---

### Avatar

Circular avatar/profile picture placeholder.

**Properties**:
- `placeholder` (string): Avatar type - `avatar` | `initials` | `color`

**Example**:
```
component Avatar placeholder: "avatar"
component Avatar placeholder: "initials"
```

**Rendering**: Circular placeholder for profile image

---

## Display Components

### Divider

Horizontal or vertical separator line.

**Properties**:
- None required

**Example**:
```
component Divider
```

**Rendering**: Thin horizontal line for visual separation

---

### Badge

Small label/tag for status or categorization.

**Properties**:
- `text` (string): Badge label
- `variant` (string): Style - `primary` | `secondary` | `success` | `warning` | `error` | `info` (default: `primary`)

**Example**:
```
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

**Example**:
```
component Link text: "Click here"
component Link text: "Learn more"
```

**Rendering**: Blue underlined text

---

### Alert

Alert/notification message box.

**Properties**:
- `title` (string): Alert title
- `content` (string): Alert message
- `variant` (string): Type - `info` | `success` | `warning` | `error` (default: `info`)

**Example**:
```
component Alert title: "Success" content: "Changes saved successfully" variant: success
component Alert title: "Error" content: "Something went wrong" variant: error
component Alert title: "Info" content: "New updates available" variant: info
```

**Rendering**: Colored box with icon, title, and message

---

## Information Display

### StatCard

Statistics card displaying metric and value.

**Properties**:
- `label` (string): Metric label
- `value` (string): Metric value

**Example**:
```
component StatCard label: "Total Users" value: "1,234"
component StatCard label: "Revenue" value: "$45,678"
component StatCard label: "Growth" value: "+12.5%"
```

**Rendering**: Card with large value and small label below

---

### Code

Code block display.

**Properties**:
- `content` (string): Code content

**Example**:
```
component Code content: "const x = 10; console.log(x);"
```

**Rendering**: Monospace text in gray background box

---

### ChartPlaceholder

Placeholder for various chart types.

**Properties**:
- `type` (string): Chart type - `bar` | `line` | `pie` | `area` (default: `bar`)
- `height` (number): Height in pixels (default: 200)

**Example**:
```
component ChartPlaceholder type: "bar" height: 250
component ChartPlaceholder type: "line" height: 300
component ChartPlaceholder type: "pie" height: 200
```

**Rendering**: Chart area with placeholder bars/lines/segments

---

## Modal & Overlay

### Modal

Modal dialog box.

**Properties**:
- `title` (string): Modal title
- `content` (string): Modal content

**Example**:
```
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
```
component Spinner
```

**Rendering**: Animated circular loading indicator

---

## Usage Patterns

### Form Example

```
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading title: "User Registration"
  
  component Input label: "Full Name" placeholder: "John Doe"
  component Input label: "Email" placeholder: "john@example.com"
  component Input label: "Password" placeholder: "••••••••"
  
  layout stack(direction: horizontal, gap: md) {
    component Checkbox label: "I agree to terms"
  }
  
  layout stack(direction: horizontal, gap: md) {
    component Button text: "Register" variant: primary
    component Button text: "Cancel" variant: secondary
  }
}
```

### Dashboard Example

```
layout stack(direction: vertical, gap: lg, padding: lg) {
  component Heading title: "Dashboard"
  
  layout grid(columns: 12, gap: md) {
    cell span: 3 {
      component StatCard label: "Total Users" value: "1,234"
    }
    cell span: 3 {
      component StatCard label: "Active Sessions" value: "567"
    }
    cell span: 3 {
      component StatCard label: "Revenue" value: "$89,012"
    }
    cell span: 3 {
      component StatCard label: "Growth Rate" value: "+12.5%"
    }
  }
  
  layout grid(columns: 12, gap: md) {
    cell span: 6 {
      component ChartPlaceholder type: "line" height: 300
    }
    cell span: 6 {
      component ChartPlaceholder type: "pie" height: 300
    }
  }
  
  component Table columns: "User,Status,Date,Action" rows: 8
}
```

---

## Component Guidelines

### Do's

✅ Use semantic component names that match their purpose  
✅ Keep property values descriptive and consistent  
✅ Group related components within containers  
✅ Use grid layout for responsive designs  
✅ Apply consistent spacing using theme tokens  

### Don'ts

❌ Don't mix components and raw text at same level  
❌ Don't use absolute positioning  
❌ Don't create empty components  
❌ Don't nest the same layout type excessively  
❌ Don't ignore responsive design patterns  

---

## Complete Component List

**Text**: Heading, Text, Paragraph, Label  
**Input**: Input, Textarea, Select, Checkbox, Radio, Toggle  
**Button**: Button, IconButton  
**Navigation**: Topbar, SidebarMenu, Breadcrumbs, Tabs  
**Data**: Table, List  
**Media**: Image, Icon, Avatar  
**Display**: Divider, Badge, Link, Alert  
**Info**: StatCard, Code, ChartPlaceholder  
**Modal**: Modal  
**Feedback**: Spinner  

**Total: 23 Components**

---

## Next Steps

For container/layout documentation, see [CONTAINERS-REFERENCE.md](CONTAINERS-REFERENCE.md)  
For theme configuration, see [THEME-GUIDE.md](THEME-GUIDE.md)  
For syntax details, see [DSL-SYNTAX-EN.md](DSL-SYNTAX-EN.md)

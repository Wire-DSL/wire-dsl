// AUTO-GENERATED — do not edit by hand.
// Sources:
//   skills/wireframe-generator/references/  (DSL language reference)
//   packages/mcp-server/docs/               (MCP-specific docs)
// Regenerate with: node scripts/sync-mcp-docs.js

export const DOCS_SYNTAX = `
# Wire DSL Core Syntax

This reference covers the fundamental syntax rules and grammar for writing valid Wire DSL code.

## File Structure

Every \`.wire\` file follows this hierarchical structure:

\`\`\`wire
project "ProjectName" {
  // style block is optional (defaults apply when omitted)
  style {
    // each property is also optional
  }

  screen ScreenName {
    layout <type> {
      // components and nested layouts
    }
  }

  screen AnotherScreen {
    // another screen
  }
}
\`\`\`

**Key Points:**
- One \`project\` block per file
- Zero or one \`style\` block per project (optional; defaults apply when omitted)
- One or more \`screen\` blocks
- Each screen contains exactly one root layout
- Layouts can contain components and nested layouts

## Top-Level Keywords

The following keywords are valid at the project level:

| Keyword | Purpose |
|---------|---------|
| \`project\` | Root wrapper for the entire file |
| \`style\` | Global style tokens (optional; density, spacing, radius, stroke, font) |
| \`colors\` | Project color tokens (variants and semantic tokens) |
| \`mocks\` | Mock data definitions for components |
| \`define\` | Reusable custom component definitions |

## Property Syntax

Properties use the \`key: value\` format with specific quoting rules:

### String Values (MUST be quoted)

\`\`\`wire
text: "Hello World"
label: "Email Address"
placeholder: "Enter text here"
title: "Dashboard"
\`\`\`

### Numeric Values (NO quotes)

\`\`\`wire
height: 200
width: 400
rows: 5
columns: 12
span: 6
left: 260
\`\`\`

### Boolean Values (NO quotes)

\`\`\`wire
checked: true
enabled: false
border: true
disabled: true
\`\`\`

### Enum Values (NO quotes)

\`\`\`wire
variant: primary
direction: vertical
gap: md
type: bar
\`\`\`

**Valid Enum Values:**
- **Spacing:** \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\`
- **Variants (semantic):** \`default\`, \`primary\`, \`secondary\`, \`success\`, \`warning\`, \`danger\`, \`info\`
- **Variants (Material Design):** \`red\`, \`pink\`, \`purple\`, \`deep_purple\`, \`indigo\`, \`blue\`, \`light_blue\`, \`cyan\`, \`teal\`, \`green\`, \`light_green\`, \`lime\`, \`yellow\`, \`amber\`, \`orange\`, \`deep_orange\`, \`brown\`, \`grey\`, \`blue_grey\`
- **Direction:** \`vertical\`, \`horizontal\`
- **Justify:** \`stretch\`, \`start\`, \`center\`, \`end\`, \`spaceBetween\`, \`spaceAround\`
- **Align (layout):** \`start\`, \`center\`, \`end\`
- **Align (component):** \`left\`, \`center\`, \`right\`
- **Density:** \`compact\`, \`normal\`, \`comfortable\`
- **Radius:** \`none\`, \`sm\`, \`md\`, \`lg\`
- **Stroke:** \`thin\`, \`normal\`
- **Font:** \`base\`, \`title\`, \`mono\`
- **Image type:** \`landscape\`, \`portrait\`, \`square\`, \`icon\`, \`avatar\`
- **Chart types:** \`bar\`, \`line\`, \`pie\`, \`area\`
- **Heading level:** \`h1\`, \`h2\`, \`h3\`, \`h4\`, \`h5\`, \`h6\`

### CSV Lists (Quoted strings with commas)

\`\`\`wire
items: "Home,Users,Settings,Analytics"
columns: "Name,Email,Status,Role"
actions: "Edit,Delete,View"
icons: "home,users,settings"
\`\`\`

## Naming Conventions

### Project Names
- Use quoted strings
- Can include spaces and special characters
- Example: \`project "My Admin Dashboard"\`

### Screen Names
- Use CamelCase (PascalCase)
- No spaces or special characters
- Must be unique within the project
- Examples: \`Dashboard\`, \`UsersList\`, \`ProductDetail\`, \`SettingsPage\`

### Component Names
- Use exact PascalCase matching
- Case-sensitive (must match exactly)
- Examples: \`Button\`, \`Input\`, \`Heading\`, \`Stat\`, \`SidebarMenu\`
- Wrong: \`button\`, \`INPUT\`, \`heading\`, \`sidebarMenu\`

### Property Names
- Use camelCase
- Examples: \`gap\`, \`padding\`, \`placeholder\`, \`iconLeft\`, \`iconAlign\`, \`labelSpace\`

## Comments

### Line Comments
\`\`\`wire
// This is a single-line comment
component Heading text: "Title" // inline comment
\`\`\`

### Block Comments
\`\`\`wire
/*
  This is a multi-line comment
  Spanning multiple lines
*/
component Button text: "Submit"
\`\`\`

## Layout Syntax

Layouts are containers that organize components and other layouts.

### Basic Layout Declaration

\`\`\`wire
layout <type> {
  // children
}
\`\`\`

### Layout with Properties

\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Text text: "Body"
}
\`\`\`

**Property Format:**
- Properties are enclosed in parentheses after the layout type
- Multiple properties separated by commas
- Format: \`key: value\`

## Component Syntax

Components are UI elements that render visual content.

### Single-Line Components

\`\`\`wire
component Heading text: "Page Title"
component Divider
component Separate size: md
\`\`\`

### Multi-Property Components

\`\`\`wire
component Input label: "Email" placeholder: "your@email.com" iconLeft: "mail"
component Image type: square height: 250
component Button text: "Submit" variant: primary icon: "check"
\`\`\`

**Component Format:**
- Always starts with \`component\` keyword
- Followed by component name (PascalCase)
- Properties separated by spaces
- Each property: \`key: value\`

## Style Configuration

The style block configures global visual settings. Both the block itself and each individual property are **optional**. Omitted properties use their defaults.

\`\`\`wire
style {
  density: "normal"      // compact | normal | comfortable  (default: "normal")
  spacing: "md"          // xs | sm | md | lg | xl          (default: "md")
  radius: "md"           // none | sm | md | lg | full      (default: "md")
  stroke: "normal"       // thin | normal | thick            (default: "normal")
  font: "base"           // sm | base | lg                   (default: "base")
  background: "#f0f0f0"  // optional CSS color
  theme: "light"         // light | dark                     (optional)
  device: "mobile"       // mobile | tablet | desktop | print | a4  (optional)
}
\`\`\`

**Key Points:**
- The \`style\` block is optional (defaults apply when omitted)
- Each property inside \`style\` is also optional (individual defaults apply)
- Values must be from valid enum sets
- String values must be quoted

## Nesting Rules

### Layouts can contain:
- Components
- Other layouts (nested)
- Cells (for grid layouts only)

### Components cannot contain:
- Other components
- Layouts
- They are leaf nodes

### Example of Valid Nesting

\`\`\`wire
layout stack(direction: vertical, gap: md) {
  component Heading text: "Section"

  layout grid(columns: 12, gap: md) {
    cell span: 6 {
      component Input label: "First Name"
    }
    cell span: 6 {
      component Input label: "Last Name"
    }
  }

  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Save"
    component Button text: "Cancel"
  }
}
\`\`\`

## Special Container Rules

### Split Layout
- Must have **exactly 2** children
- First child is left panel, second is right/main content
- Both children are typically stacks
- Use \`left\` or \`right\` to set fixed-width side (in pixels)

\`\`\`wire
layout split(left: 260, gap: md) {
  layout stack { /* left panel */ }
  layout stack { /* main content */ }
}
\`\`\`

### Panel Layout
- Must have **exactly 1** child
- Used for bordered/highlighted sections

\`\`\`wire
layout panel(padding: lg) {
  layout stack(gap: md) {
    component Heading text: "Panel Title"
    component Text text: "Content"
  }
}
\`\`\`

### Grid Layout
- Contains \`cell\` elements (not direct components)
- Each cell has a \`span\` value (1-12)

\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    component Input label: "Search"
  }
  cell span: 4 {
    component Button text: "Search"
  }
}
\`\`\`

## Custom Components

Define reusable components:

\`\`\`wire
define Component "CustomCard" {
  layout card(padding: md, gap: sm) {
    component Heading text: "Title"
    component Text text: "Description"
  }
}
\`\`\`

**Usage:**
\`\`\`wire
screen MyScreen {
  layout stack {
    component "CustomCard"
    component "CustomCard"
  }
}
\`\`\`

## Whitespace and Formatting

Wire DSL is whitespace-insensitive (like CSS/JavaScript):

\`\`\`wire
// All valid and equivalent
component Button text: "Submit"
component Button text:"Submit"
component Button text : "Submit"

// Multi-line formatting is allowed
component Input
  label: "Email"
  placeholder: "your@email.com"
\`\`\`

**Best Practice:** Use consistent indentation (2 or 4 spaces) for readability.

## Complete Example

\`\`\`wire
project "E-Commerce App" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ProductList {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      // Header section
      component Heading text: "Products"

      // Search and filter
      layout grid(columns: 12, gap: md) {
        cell span: 9 {
          component Input label: "Search" placeholder: "Product name..." iconLeft: "search"
        }
        cell span: 3 {
          layout stack(direction: horizontal, justify: end) {
            component Button text: "Filter" variant: secondary icon: "filter"
          }
        }
      }

      // Product grid
      layout grid(columns: 12, gap: lg) {
        cell span: 4 {
          layout card(padding: md, gap: sm) {
            component Image type: square height: 200
            component Heading text: "Product 1"
            component Text text: "$99.99"
            component Button text: "Add to Cart" variant: primary
          }
        }
        cell span: 4 {
          layout card(padding: md, gap: sm) {
            component Image type: square height: 200
            component Heading text: "Product 2"
            component Text text: "$79.99"
            component Button text: "Add to Cart" variant: primary
          }
        }
        cell span: 4 {
          layout card(padding: md, gap: sm) {
            component Image type: square height: 200
            component Heading text: "Product 3"
            component Text text: "$129.99"
            component Button text: "Add to Cart" variant: primary
          }
        }
      }
    }
  }
}
\`\`\`

## Validation Checklist

Before outputting Wire DSL code, verify:

**Structure:**
- File starts with \`project\` block
- Project may contain one \`style\` block (optional)
- Project contains at least one \`screen\` block
- Each screen has exactly one root layout

**Syntax:**
- All string values are quoted
- Numbers, booleans, enums are NOT quoted
- All opening braces \`{\` have matching closing braces \`}\`
- Properties use \`key: value\` format
- CSV lists are comma-separated, no spaces after commas

**Naming:**
- Screen names are CamelCase
- Component names match exactly (case-sensitive)
- Property names use camelCase

**Special Rules:**
- Split layouts have exactly 2 children
- Panel layouts have exactly 1 child
- Grid cells have \`span\` values 1-12
- Grid cells are inside grid layouts only

<!-- Source: @wire-dsl/language-support components.ts, engine parser/index.ts -->
`;

export const DOCS_COMPONENTS = `
# Wire DSL Components Catalog

Wire DSL provides 31 UI components organized into 8 categories. This reference lists all components with their properties and usage examples.

## Text Components (5)

### Heading
Large heading text with level-based typography.

**Properties:**
- \`text\` (string, required): The heading text
- \`level\` (enum, optional): \`h1\` | \`h2\` | \`h3\` | \`h4\` | \`h5\` | \`h6\`
- \`spacing\` (enum, optional): \`none\` | \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors

**Example:**
\`\`\`wire
component Heading text: "Users" level: h2 spacing: sm
component Heading text: "Welcome to Dashboard"
\`\`\`

---

### Text
Body text content.

**Properties:**
- \`text\` (string, required): The text content
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\` (default: \`md\`)
- \`bold\` (boolean, optional): Bold weight (default: \`false\`)
- \`italic\` (boolean, optional): Italic style (default: \`false\`)

**Example:**
\`\`\`wire
component Text text: "This is regular body text"
component Text text: "Important notice" bold: true
component Text text: "Side note" size: sm italic: true
\`\`\`

---

### Paragraph
Full-width text block with alignment, size, and formatting options.

**Properties:**
- \`text\` (string, required): The text content (wraps automatically)
- \`align\` (enum, optional): \`left\` | \`center\` | \`right\` (default: \`left\`)
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\` (default: \`md\`)
- \`bold\` (boolean, optional): Bold weight (default: \`false\`)
- \`italic\` (boolean, optional): Italic style (default: \`false\`)

**Example:**
\`\`\`wire
component Paragraph text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
component Paragraph text: "Centered caption" align: center size: sm
component Paragraph text: "Quoted text" italic: true align: center
\`\`\`

---

### Label
Small label text (typically for form fields).

**Properties:**
- \`text\` (string, required): The label text

**Example:**
\`\`\`wire
component Label text: "Email Address"
component Label text: "Password"
\`\`\`

---

### Code
Code snippet display.

**Properties:**
- \`code\` (string, required): The code snippet

**Example:**
\`\`\`wire
component Code code: "const x = 42;"
component Code code: "function add(a, b) { return a + b; }"
\`\`\`

---

## Input Components (6)

### Input
Single-line text input field.

**Properties:**
- \`label\` (string, optional): Field label
- \`placeholder\` (string, optional): Placeholder text
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`iconLeft\` (string, optional): Left icon name (Feather Icons)
- \`iconRight\` (string, optional): Right icon name (Feather Icons)
- \`disabled\` (boolean, optional): Dims the component (default: \`false\`)

**Example:**
\`\`\`wire
component Input label: "Email" placeholder: "you@example.com"
component Input label: "Search" placeholder: "Type..." iconLeft: "search"
component Input label: "Password" iconRight: "eye-off" disabled: false
\`\`\`

---

### Textarea
Multi-line text input field.

**Properties:**
- \`label\` (string, optional): Field label
- \`placeholder\` (string, optional): Placeholder text
- \`rows\` (number, optional): Number of visible rows (default: 3)

**Example:**
\`\`\`wire
component Textarea label: "Message" placeholder: "Enter your message" rows: 5
component Textarea label: "Bio" rows: 8
component Textarea label: "Comments" placeholder: "Your feedback"
\`\`\`

---

### Select
Dropdown selection field.

**Properties:**
- \`label\` (string, optional): Field label
- \`placeholder\` (string, optional): Placeholder text
- \`items\` (string, optional): Comma-separated list of options
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`iconLeft\` (string, optional): Left icon name (Feather Icons)
- \`iconRight\` (string, optional): Right icon name (Feather Icons)
- \`disabled\` (boolean, optional): Dims the component (default: \`false\`)

**Example:**
\`\`\`wire
component Select label: "Country" items: "USA,Canada,Mexico,UK"
component Select label: "Country" iconLeft: "globe" items: "Spain,France,Germany"
component Select label: "Role" items: "Admin,User,Guest"
\`\`\`

---

### Checkbox
Checkbox input with label.

**Properties:**
- \`label\` (string, required): Checkbox label
- \`checked\` (boolean, optional): Initial checked state (default: \`false\`)
- \`disabled\` (boolean, optional): Dims the component (default: \`false\`)

**Example:**
\`\`\`wire
component Checkbox label: "I agree to terms and conditions" checked: false
component Checkbox label: "Subscribe to newsletter" checked: true
component Checkbox label: "Remember me"
\`\`\`

---

### Radio
Radio button input with label.

**Properties:**
- \`label\` (string, required): Radio label
- \`checked\` (boolean, optional): Initial checked state (default: \`false\`)
- \`disabled\` (boolean, optional): Dims the component (default: \`false\`)

**Example:**
\`\`\`wire
component Radio label: "Option A" checked: true
component Radio label: "Option B" checked: false
component Radio label: "Monthly Plan"
\`\`\`

**Note:** For radio button groups, use multiple Radio components:
\`\`\`wire
layout stack(direction: vertical, gap: sm) {
  component Label text: "Select Plan"
  component Radio label: "Free Plan" checked: true
  component Radio label: "Pro Plan" checked: false
  component Radio label: "Enterprise Plan" checked: false
}
\`\`\`

---

### Toggle
Toggle switch input.

**Properties:**
- \`label\` (string, required): Toggle label
- \`enabled\` (boolean, optional): Initial enabled state (default: \`false\`)
- \`disabled\` (boolean, optional): Dims the component (default: \`false\`)

**Example:**
\`\`\`wire
component Toggle label: "Dark Mode" enabled: false
component Toggle label: "Enable Notifications" enabled: true
component Toggle label: "Auto-save"
\`\`\`

---

## Action Components (3)

### Button
Clickable action button.

**Properties:**
- \`text\` (string, required): Button text
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors (default: \`default\`)
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`icon\` (string, optional): Icon name rendered beside text (Feather Icons)
- \`iconAlign\` (enum, optional): \`left\` | \`right\` (default: \`left\`)
- \`align\` (enum, optional): \`left\` | \`center\` | \`right\`
- \`labelSpace\` (boolean, optional): Reserve label space above button
- \`padding\` (enum, optional): \`none\` | \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`block\` (boolean, optional): Full-width button
- \`disabled\` (boolean, optional): Dims the button (default: \`false\`)

**Example:**
\`\`\`wire
component Button text: "Submit" variant: primary
component Button text: "Delete" variant: danger icon: "trash-2"
component Button text: "Confirm" variant: primary icon: "check" iconAlign: left
component Button text: "Save" variant: teal
\`\`\`

---

### IconButton
Button that renders only an icon (no text).

**Properties:**
- \`icon\` (string, required): Icon name (Feather Icons)
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`disabled\` (boolean, optional): Dims the button
- \`labelSpace\` (boolean, optional): Reserve label space above button
- \`padding\` (enum, optional): \`none\` | \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`

**Common Icon Names:**
\`search\`, \`settings\`, \`menu\`, \`close\`, \`x\`, \`home\`, \`star\`, \`heart\`, \`download\`, \`upload\`, \`trash\`, \`trash-2\`, \`edit\`, \`edit-2\`, \`user\`, \`users\`, \`bell\`, \`mail\`, \`calendar\`, \`lock\`, \`unlock\`, \`check\`, \`plus\`, \`minus\`, \`chevron-right\`, \`chevron-left\`, \`chevron-up\`, \`chevron-down\`, \`arrow-left\`, \`arrow-right\`, \`more-vertical\`, \`more-horizontal\`, \`filter\`, \`refresh-cw\`, \`eye\`, \`eye-off\`

**Example:**
\`\`\`wire
component IconButton icon: "search" variant: default size: md
component IconButton icon: "settings"
component IconButton icon: "trash-2" variant: danger
\`\`\`

---

### Link
Underlined text action without button background.

**Properties:**
- \`text\` (string, required): Link text
- \`variant\` (enum, optional): \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`

**Example:**
\`\`\`wire
component Link text: "Learn more" variant: info
component Link text: "Forgot password?"
component Link text: "View all products"
\`\`\`

---

## Navigation Components (5)

### Topbar
Top navigation/header bar.

**Properties:**
- \`title\` (string, required): Main title
- \`subtitle\` (string, optional): Subtitle text
- \`icon\` (string, optional): Icon name (Feather Icons)
- \`avatar\` (boolean, optional): Show avatar display
- \`actions\` (string, optional): Comma-separated action labels
- \`user\` (string, optional): User name/email
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`border\` (boolean, optional): Show bottom border
- \`background\` (color, optional): Background color (\`true\` = card bg, hex or named Material color)
- \`radius\` (enum, optional): \`none\` | \`sm\` | \`md\` | \`lg\` | \`xl\`
- \`size\` (enum, optional): \`sm\` | \`md\` | \`lg\` (default: \`md\`)
- \`color\` (color, optional): Text color for title

**Example:**
\`\`\`wire
component Topbar title: "Dashboard" subtitle: "Overview" icon: "menu" user: "john_doe" avatar: true
component Topbar title: "Admin Panel" actions: "Settings,Profile,Logout"
component Topbar title: "My App" variant: primary
\`\`\`

---

### SidebarMenu
Vertical sidebar navigation menu.

**Properties:**
- \`items\` (string, required): Comma-separated menu items
- \`icons\` (string, optional): Comma-separated icon names aligned to each item
- \`active\` (number, optional): Active item index (0-based, default: 0)
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors

**Example:**
\`\`\`wire
component SidebarMenu items: "Dashboard,Users,Settings" icons: "home,users,settings" active: 0 variant: primary
component SidebarMenu items: "Home,Products,Orders,Customers" active: 1
\`\`\`

---

### Sidebar
Sidebar panel with title and items.

**Properties:**
- \`title\` (string, optional): Sidebar title
- \`items\` (string, required): Comma-separated sidebar items
- \`active\` (string, optional): Active item name
- \`itemsMock\` (number, optional): Number of mock items to generate

**Example:**
\`\`\`wire
component Sidebar title: "Menu" items: "Home,Reports,Settings"
component Sidebar items: "Dashboard,Analytics,Users" active: "Dashboard"
\`\`\`

---

### Breadcrumbs
Breadcrumb navigation trail.

**Properties:**
- \`items\` (string, required): Comma-separated breadcrumb items
- \`separator\` (string, optional): Separator character (default: \`/\`)

**Example:**
\`\`\`wire
component Breadcrumbs items: "Home,Users,John Doe"
component Breadcrumbs items: "Products,Electronics,Laptops" separator: ">"
\`\`\`

---

### Tabs
Horizontal tab navigation.

**Properties:**
- \`items\` (string, required): Comma-separated tab labels
- \`active\` (number, optional): Active tab index (0-based, default: 0)
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`radius\` (enum, optional): \`none\` | \`sm\` | \`md\` | \`lg\` | \`full\` (default: \`md\`)
- \`size\` (enum, optional): \`sm\` | \`md\` | \`lg\` (default: \`md\`)
- \`icons\` (string, optional): Comma-separated icon names aligned to each tab
- \`flat\` (boolean, optional): Underline indicator style without filled background (default: \`false\`)
- \`border\` (boolean, optional): Show/hide borders (default: \`true\`)
- \`color\` (color, optional): Text color for tab labels

**Example:**
\`\`\`wire
component Tabs items: "Profile,Settings,Notifications" active: 0
component Tabs items: "Overview,Details,Reviews" active: 1 flat: true
component Tabs items: "All,Active,Completed" icons: "list,check-circle,archive"
\`\`\`

---

## Data Components (4)

### Table
Tabular data placeholder.

**Properties:**
- \`columns\` (string, required): Comma-separated column headers
- \`title\` (string, optional): Table title
- \`rows\` (number, optional): Number of data rows to show
- \`rowsMock\` (number, optional): Number of mock rows to generate
- \`mock\` (string, optional): Comma-separated mock data types (e.g., \`"name,city,amount"\`)
- \`random\` (boolean, optional): Randomize mock data
- \`pagination\` (boolean, optional): Show pagination controls
- \`pages\` (number, optional): Number of pages
- \`paginationAlign\` (enum, optional): \`left\` | \`center\` | \`right\`
- \`actions\` (string, optional): Comma-separated row action labels
- \`caption\` (string, optional): Table caption text
- \`captionAlign\` (enum, optional): \`left\` | \`center\` | \`right\`
- \`border\` (boolean, optional): Show outer border
- \`innerBorder\` (boolean, optional): Show inner cell borders
- \`background\` (boolean, optional): Show background

**Example:**
\`\`\`wire
component Table columns: "User,City,Amount" rows: 8 mock: "name,city,amount"
component Table columns: "Name,Email,Status,Role" rows: 10 pagination: true
component Table columns: "ID,Date,Amount" rows: 5 actions: "Edit,Delete"
\`\`\`

---

### List
Vertical list component.

**Properties:**
- \`title\` (string, optional): List title
- \`items\` (string, optional): Comma-separated list items
- \`itemsMock\` (number, optional): Number of mock items to generate
- \`mock\` (string, optional): Mock data type (e.g., \`"city"\`, \`"name"\`)
- \`random\` (boolean, optional): Randomize mock data

**Example:**
\`\`\`wire
component List items: "Item 1,Item 2,Item 3,Item 4"
component List title: "Cities" itemsMock: 6 mock: "city"
component List items: "Todo: Fix bug,Todo: Add feature" title: "Tasks"
\`\`\`

---

### Stat
Metric card with optional caption, icon, and variant color.

**Properties:**
- \`title\` (string, required): Stat label
- \`value\` (string, required): Stat value
- \`caption\` (string, optional): Additional caption text
- \`icon\` (string, optional): Icon name (Feather Icons)
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors

**Example:**
\`\`\`wire
component Stat title: "Users" value: "1,234" icon: "users" variant: primary
component Stat title: "Revenue" value: "$45,230" caption: "+8% vs last month"
component Stat title: "Growth Rate" value: "+12.5%"
\`\`\`

---

### Chart
Chart placeholder with deterministic trend data.

**Properties:**
- \`type\` (enum, required): \`bar\` | \`line\` | \`pie\` | \`area\`
- \`height\` (number, optional): Chart height in pixels

**Example:**
\`\`\`wire
component Chart type: bar height: 250
component Chart type: line height: 400
component Chart type: pie height: 300
component Chart type: area height: 350
\`\`\`

---

## Media Components (2)

### Image
Image placeholder block.

**Properties:**
- \`type\` (enum, optional): \`landscape\` | \`portrait\` | \`square\` | \`icon\` | \`avatar\`
- \`icon\` (string, optional): Icon name for icon-type images (Feather Icons)
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`height\` (number, optional): Fixed height in pixels
- \`circle\` (boolean, optional): Clips image to circle (default: \`false\`)

**Example:**
\`\`\`wire
component Image type: square height: 250
component Image type: icon icon: "user" variant: primary height: 120
component Image type: avatar circle: true
component Image type: landscape height: 400
\`\`\`

---

### Icon
Standalone icon component (Feather Icons).

**Properties:**
- \`icon\` (string, required): Icon name
- \`size\` (enum, optional): \`sm\` | \`md\` | \`lg\`
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`circle\` (boolean, optional): Render inside circular background (default: \`false\`)
- \`padding\` (number, optional): Inset padding in pixels

**Example:**
\`\`\`wire
component Icon icon: "home" size: md
component Icon icon: "star" variant: primary circle: true
component Icon icon: "check-circle" size: lg
\`\`\`

---

## Layout Components (3)

### Card
Generic content card placeholder (component version, not layout).

**Properties:**
- \`title\` (string, optional): Card title
- \`text\` (string, optional): Card content text

**Example:**
\`\`\`wire
component Card title: "Summary" text: "Card content"
component Card title: "Quick Stats"
\`\`\`

---

### Divider
Horizontal separator line.

**Properties:** None

**Example:**
\`\`\`wire
component Divider
\`\`\`

---

### Separate
Invisible spacing separator.

**Properties:**
- \`size\` (enum, optional): \`none\` | \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\`

**Example:**
\`\`\`wire
component Separate size: md
component Separate size: xl
\`\`\`

---

## Feedback Components (3)

### Badge
Small status label.

**Properties:**
- \`text\` (string, required): Badge text
- \`variant\` (enum, optional): \`default\` | \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors (default: \`default\`)
- \`size\` (enum, optional): \`xs\` | \`sm\` | \`md\` | \`lg\` | \`xl\` (default: \`md\`)
- \`padding\` (number, optional): Custom horizontal padding in px

**Example:**
\`\`\`wire
component Badge text: "Active" variant: success size: md
component Badge text: "New" variant: primary
component Badge text: "Low Stock" variant: warning
component Badge text: "Sold Out" variant: danger
\`\`\`

---

### Alert
Alert/message box.

**Properties:**
- \`variant\` (enum, optional): \`primary\` | \`secondary\` | \`success\` | \`warning\` | \`danger\` | \`info\` | Material Design colors
- \`title\` (string, optional): Alert title
- \`text\` (string, optional): Alert message

**Example:**
\`\`\`wire
component Alert variant: warning title: "Warning" text: "Review this action"
component Alert variant: success title: "Success" text: "Your changes have been saved"
component Alert variant: danger text: "Failed to connect to server"
component Alert variant: info text: "New updates are available"
\`\`\`

---

### Modal
Modal overlay container.

**Properties:**
- \`title\` (string, required): Modal title
- \`visible\` (boolean, optional): Show/hide modal (default: \`true\`)

**Example:**
\`\`\`wire
component Modal title: "Confirm action" visible: true
component Modal title: "Welcome" visible: false
\`\`\`

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
\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Contact Form"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "you@example.com" iconLeft: "mail"
  component Textarea label: "Message" rows: 5
  component Checkbox label: "Subscribe to updates"
  component Button text: "Send" variant: primary
}
\`\`\`

### Dashboard Stats Row
\`\`\`wire
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
\`\`\`

### Navigation with Sidebar
\`\`\`wire
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
\`\`\`

<!-- Source: @wire-dsl/language-support components.ts -->
`;

export const DOCS_CONTAINERS = `
# Wire DSL Layouts Guide

Layouts are containers that organize components and other layouts. Wire DSL provides 5 layout types, each optimized for different UI patterns.

## Layout Overview

| Layout | Purpose | Children | Common Use Cases |
|--------|---------|----------|------------------|
| **Stack** | Linear arrangement | Multiple | Forms, lists, vertical/horizontal sections |
| **Grid** | Multi-column layout | Cells (span 1-12) | Dashboards, product grids, responsive layouts |
| **Split** | Two-column area | Exactly 2 | Admin panels, navigation + content |
| **Panel** | Bordered section | Exactly 1 | Highlighted sections, form groups |
| **Card** | Content card | Multiple | Product cards, user profiles, info boxes |

---

## Stack Layout

Linear arrangement of children (vertical or horizontal).

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| \`direction\` | enum | \`vertical\`, \`horizontal\` | required | Stack direction |
| \`justify\` | enum | \`stretch\`, \`start\`, \`center\`, \`end\`, \`spaceBetween\`, \`spaceAround\` | \`stretch\` | Distribution along main axis |
| \`align\` | enum | \`start\`, \`center\`, \`end\` | - | Cross-axis alignment |
| \`gap\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | - | Space between children |
| \`padding\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | \`0px\` | Inner padding |

**Spacing Values:**
- \`xs\` = 4px
- \`sm\` = 8px
- \`md\` = 16px
- \`lg\` = 24px
- \`xl\` = 32px

### Syntax

\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // children
}
\`\`\`

### Vertical Stack Examples

**Basic Vertical Stack:**
\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "User Profile"
  component Text text: "Personal information"
  component Input label: "Name" placeholder: "Full name"
  component Input label: "Email" placeholder: "email@example.com"
  component Button text: "Save" variant: primary
}
\`\`\`

**Form with Sections:**
\`\`\`wire
layout stack(direction: vertical, gap: xl, padding: lg) {
  // Header section
  component Heading text: "Registration Form"
  component Divider

  // Personal info section
  component Label text: "Personal Information"
  layout stack(direction: vertical, gap: md) {
    component Input label: "First Name"
    component Input label: "Last Name"
    component Input label: "Email"
  }

  component Divider

  // Account section
  component Label text: "Account Details"
  layout stack(direction: vertical, gap: md) {
    component Input label: "Username"
    component Input label: "Password"
    component Checkbox label: "I agree to terms"
  }

  // Actions
  layout stack(direction: horizontal, gap: md, justify: end) {
    component Button text: "Cancel"
    component Button text: "Create Account" variant: primary
  }
}
\`\`\`

### Horizontal Stack Examples

**Using justify for distribution:**

\`\`\`wire
// stretch: children fill available space equally (default)
layout stack(direction: horizontal, gap: md, justify: stretch) {
  component Button text: "Option A"
  component Button text: "Option B"
  component Button text: "Option C"
}

// start: children grouped at start
layout stack(direction: horizontal, gap: sm, justify: start) {
  component Button text: "Edit"
  component Button text: "Delete"
}

// center: children centered
layout stack(direction: horizontal, gap: sm, justify: center) {
  component Button text: "Submit" variant: primary
}

// end: children grouped at end
layout stack(direction: horizontal, gap: sm, justify: end) {
  component IconButton icon: "settings"
  component IconButton icon: "bell"
  component IconButton icon: "user"
}

// spaceBetween: equal space between children
layout stack(direction: horizontal, gap: sm, justify: spaceBetween) {
  component Text text: "Left content"
  component Text text: "Right content"
}
\`\`\`

**Action Buttons:**
\`\`\`wire
layout stack(direction: horizontal, gap: md, justify: end) {
  component Button text: "Cancel" variant: secondary
  component Button text: "Save" variant: primary
}
\`\`\`

**Toolbar:**
\`\`\`wire
layout stack(direction: horizontal, gap: sm, padding: md) {
  component IconButton icon: "menu"
  component Input label: "Search" placeholder: "Search..." iconLeft: "search"
  component IconButton icon: "settings"
  component Image type: avatar
}
\`\`\`

### Critical Rules

**Padding Default:** Stack layouts have **0px padding by default**. Always specify \`padding\` when needed.

Wrong (no padding):
\`\`\`wire
layout stack(direction: vertical, gap: md) {
  // content touches edges
}
\`\`\`

Correct (with padding):
\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // content has breathing room
}
\`\`\`

---

## Grid Layout

12-column responsive grid system for multi-column layouts.

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| \`columns\` | number | 1-12 | required | Total columns in grid |
| \`gap\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | - | Space between cells |
| \`justify\` | enum | \`stretch\`, \`start\`, \`center\`, \`end\`, \`spaceBetween\`, \`spaceAround\` | - | Cell distribution |
| \`padding\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | - | Inner padding |

### Cell Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| \`span\` | number | 1-12 | 12 | Number of columns to span |
| \`align\` | enum | \`start\`, \`center\`, \`end\` | - | Vertical alignment within cell |

### Syntax

\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 8 {
    // takes 8 columns
  }
  cell span: 4 align: end {
    // takes 4 columns, aligned to end
  }
}
\`\`\`

### Grid Examples

**Two-Column Layout:**
\`\`\`wire
layout grid(columns: 12, gap: lg) {
  cell span: 6 {
    component Input label: "First Name"
  }
  cell span: 6 {
    component Input label: "Last Name"
  }
}
\`\`\`

**Dashboard Stats (4 columns):**
\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 3 {
    component Stat title: "Total Users" value: "2,543" icon: "users"
  }
  cell span: 3 {
    component Stat title: "Revenue" value: "$45,230" icon: "dollar-sign"
  }
  cell span: 3 {
    component Stat title: "Active" value: "892" icon: "activity"
  }
  cell span: 3 {
    component Stat title: "Growth" value: "+12.5%" icon: "trending-up"
  }
}
\`\`\`

**Product Grid (3 columns):**
\`\`\`wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image type: square height: 200
      component Heading text: "Product 1"
      component Text text: "$99.99"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image type: square height: 200
      component Heading text: "Product 2"
      component Text text: "$79.99"
      component Button text: "Buy Now" variant: primary
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: md) {
      component Image type: square height: 200
      component Heading text: "Product 3"
      component Text text: "$129.99"
      component Button text: "Buy Now" variant: primary
    }
  }
}
\`\`\`

**Search Bar with Button:**
\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Enter keywords..." iconLeft: "search"
  }
  cell span: 3 {
    layout stack(direction: horizontal, justify: end) {
      component Button text: "Search" variant: primary
    }
  }
}
\`\`\`

**Responsive Layout (8-4 split):**
\`\`\`wire
layout grid(columns: 12, gap: lg) {
  cell span: 8 {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Main Content"
      component Text text: "This is the main content area..."
      component Chart type: line height: 300
    }
  }
  cell span: 4 {
    layout stack(direction: vertical, gap: md) {
      component Heading text: "Sidebar"
      component List items: "Item 1,Item 2,Item 3"
      component Button text: "View More"
    }
  }
}
\`\`\`

---

## Split Layout

Two-column layout with fixed-width side and flexible main area.

### Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| \`left\` | number | pixels | Width of left panel in pixels |
| \`right\` | number | pixels | Width of right panel in pixels |
| \`background\` | string | color | Background color |
| \`border\` | boolean | \`true\`, \`false\` | Show border between panels |
| \`gap\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | Space between panels |
| \`padding\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | Inner padding |

Use either \`left\` or \`right\` to specify which panel has a fixed width. The other panel fills remaining space.

### Syntax

\`\`\`wire
layout split(left: 260, gap: md, border: true) {
  layout stack { /* left panel */ }
  layout stack { /* main content */ }
}
\`\`\`

### Critical Rules

**Exactly 2 Children:** Split layout must have exactly 2 children (no more, no less).

**Deprecated:** The \`sidebar\` parameter was removed. Use \`left\` or \`right\` instead.

### Split Examples

**Admin Dashboard:**
\`\`\`wire
layout split(left: 240, gap: md) {
  // Left panel (first child)
  layout stack(direction: vertical, gap: md, padding: md) {
    component Heading text: "Admin Panel"
    component SidebarMenu items: "Dashboard,Users,Settings,Reports" icons: "home,users,settings,file-text" active: 0
    component Divider
    component Button text: "Logout" variant: secondary
  }

  // Main content (second child)
  layout stack(direction: vertical, gap: lg, padding: lg) {
    component Topbar title: "Dashboard" user: "admin@example.com"
    component Heading text: "Overview"

    layout grid(columns: 12, gap: md) {
      cell span: 3 {
        component Stat title: "Users" value: "1,234" icon: "users"
      }
      cell span: 3 {
        component Stat title: "Revenue" value: "$45K" icon: "dollar-sign"
      }
      cell span: 3 {
        component Stat title: "Orders" value: "892" icon: "shopping-cart"
      }
      cell span: 3 {
        component Stat title: "Growth" value: "+12%" icon: "trending-up"
      }
    }

    component Table columns: "Name,Email,Status,Role" rows: 8
  }
}
\`\`\`

**Documentation Layout:**
\`\`\`wire
layout split(left: 280, gap: lg, border: true) {
  // Navigation left panel
  layout stack(direction: vertical, gap: sm, padding: lg) {
    component Heading text: "Documentation"
    component Input label: "Search" placeholder: "Search docs..." iconLeft: "search"
    component SidebarMenu items: "Getting Started,Components,Layouts,Examples" active: 1
  }

  // Content area
  layout stack(direction: vertical, gap: md, padding: xl) {
    component Breadcrumbs items: "Home,Documentation,Components"
    component Heading text: "Components Guide"
    component Text text: "Learn about all available UI components..."
    component Code code: "component Button text: 'Click me'"
  }
}
\`\`\`

**Common Fixed-Width Sizes:**
- Small panel: \`200-240px\`
- Medium panel: \`260-280px\`
- Wide panel: \`300-320px\`

---

## Panel Layout

Bordered/highlighted container for a single child layout.

### Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| \`padding\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | Inner padding |
| \`gap\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | Space between children |
| \`background\` | string | color name or hex | Background color |

### Syntax

\`\`\`wire
layout panel(padding: md) {
  // exactly one child layout
}
\`\`\`

### Critical Rules

**Exactly 1 Child:** Panel layout must contain exactly one child.

### Panel Examples

**Form Section:**
\`\`\`wire
layout panel(padding: lg) {
  layout stack(direction: vertical, gap: md) {
    component Heading text: "Account Settings"
    component Input label: "Username"
    component Input label: "Email"
    component Button text: "Update" variant: primary
  }
}
\`\`\`

**Highlighted Info Box:**
\`\`\`wire
layout stack(direction: vertical, gap: lg, padding: lg) {
  component Heading text: "User Profile"

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: sm) {
      component Label text: "Personal Information"
      component Text text: "Name: John Doe"
      component Text text: "Email: john@example.com"
      component Text text: "Role: Administrator"
    }
  }

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: sm) {
      component Label text: "Account Status"
      component Badge text: "Active" variant: success
      component Text text: "Member since: January 2024"
    }
  }
}
\`\`\`

---

## Card Layout

Content card container with multiple children, border, and rounded corners.

### Properties

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|
| \`padding\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | \`md\` | Inner padding |
| \`gap\` | enum | \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\` | \`md\` | Space between children |
| \`radius\` | enum | \`none\`, \`sm\`, \`md\`, \`lg\` | \`md\` | Corner radius |
| \`border\` | boolean | \`true\`, \`false\` | \`true\` | Show border |
| \`background\` | string | color name or hex | - | Background color |

**Radius Values:**
- \`none\` = 0px
- \`sm\` = 2px
- \`md\` = 4px
- \`lg\` = 8px

### Syntax

\`\`\`wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  // multiple children
}
\`\`\`

### Card Examples

**Product Card:**
\`\`\`wire
layout card(padding: md, gap: md, radius: lg, border: true) {
  component Image type: square height: 250
  component Heading text: "Wireless Headphones"
  component Text text: "Premium sound quality with noise cancellation"
  component Badge text: "New Arrival" variant: primary
  layout stack(direction: horizontal, gap: sm, justify: spaceBetween) {
    component Text text: "$129.99"
    component Button text: "Add to Cart" variant: primary
  }
}
\`\`\`

**User Profile Card:**
\`\`\`wire
layout card(padding: lg, gap: md, radius: md, border: true) {
  component Image type: avatar circle: true
  component Heading text: "John Doe"
  component Text text: "Senior Developer"
  component Divider
  layout stack(direction: vertical, gap: sm) {
    component Text text: "Email: john@example.com"
    component Text text: "Location: San Francisco, CA"
    component Text text: "Member since: 2020"
  }
  layout stack(direction: horizontal, gap: sm) {
    component Button text: "Message" variant: primary
    component Button text: "View Profile"
  }
}
\`\`\`

**Stats Card:**
\`\`\`wire
layout card(padding: lg, gap: sm, radius: md, border: true) {
  component Icon icon: "users" variant: primary
  component Heading text: "Total Users"
  component Text text: "2,543 active users"
  component Badge text: "+12% this month" variant: success
}
\`\`\`

**Pricing Card:**
\`\`\`wire
layout card(padding: xl, gap: lg, radius: lg, border: true) {
  component Badge text: "Popular" variant: primary
  component Heading text: "Pro Plan"
  component Stat title: "Price" value: "$29/month"
  component Divider
  layout stack(direction: vertical, gap: xs) {
    component Text text: "Unlimited projects"
    component Text text: "100GB storage"
    component Text text: "Priority support"
    component Text text: "Advanced analytics"
  }
  component Button text: "Choose Plan" variant: primary
}
\`\`\`

---

## Layout Nesting Patterns

### Pattern 1: Stack in Grid

\`\`\`wire
layout grid(columns: 12, gap: lg) {
  cell span: 6 {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Heading text: "Section A"
      component Text text: "Content here"
    }
  }
  cell span: 6 {
    layout stack(direction: vertical, gap: md, padding: lg) {
      component Heading text: "Section B"
      component Text text: "Content here"
    }
  }
}
\`\`\`

### Pattern 2: Grid in Stack

\`\`\`wire
layout stack(direction: vertical, gap: xl, padding: lg) {
  component Heading text: "Dashboard"

  layout grid(columns: 12, gap: md) {
    cell span: 3 {
      component Stat title: "Metric 1" value: "100"
    }
    cell span: 3 {
      component Stat title: "Metric 2" value: "200"
    }
  }

  component Table columns: "Name,Value" rows: 5
}
\`\`\`

### Pattern 3: Card in Grid

\`\`\`wire
layout grid(columns: 12, gap: lg) {
  cell span: 4 {
    layout card(padding: md, gap: sm) {
      component Image type: square height: 200
      component Heading text: "Card 1"
    }
  }
  cell span: 4 {
    layout card(padding: md, gap: sm) {
      component Image type: square height: 200
      component Heading text: "Card 2"
    }
  }
}
\`\`\`

### Pattern 4: Panel in Stack

\`\`\`wire
layout stack(direction: vertical, gap: lg, padding: lg) {
  component Heading text: "Settings"

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: md) {
      component Label text: "Notifications"
      component Toggle label: "Email notifications"
      component Toggle label: "Push notifications"
    }
  }

  layout panel(padding: md) {
    layout stack(direction: vertical, gap: md) {
      component Label text: "Privacy"
      component Checkbox label: "Make profile public"
      component Checkbox label: "Show activity status"
    }
  }
}
\`\`\`

---

## Layout Selection Guide

**Use Stack when:**
- Creating forms (vertical stack)
- Creating toolbars/action bars (horizontal stack)
- Building simple linear layouts
- Stacking sections vertically

**Use Grid when:**
- Creating multi-column layouts
- Building dashboards with metrics
- Creating product grids
- Need responsive column-based layouts

**Use Split when:**
- Building admin interfaces
- Creating documentation layouts
- Need persistent sidebar navigation
- Left panel + main content pattern

**Use Panel when:**
- Highlighting a specific section
- Grouping related form fields
- Creating bordered containers
- Need visual separation

**Use Card when:**
- Creating product cards
- Building user profile cards
- Creating pricing cards
- Need self-contained content boxes with styling

<!-- Source: @wire-dsl/language-support components.ts LAYOUTS -->
`;

export const DOCS_EXAMPLES = `
# Wire DSL Common Patterns

This reference provides reusable, copy-paste-ready patterns for common UI scenarios. All examples are complete and syntactically valid.

## Form Patterns

### Basic Contact Form

\`\`\`wire
project "Contact Form" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ContactForm {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Get in Touch"
      component Text text: "Fill out the form below and we'll get back to you soon."

      layout stack(direction: vertical, gap: md) {
        component Input label: "Name" placeholder: "John Doe"
        component Input label: "Email" placeholder: "john@example.com" iconLeft: "mail"
        component Input label: "Subject" placeholder: "How can we help?"
        component Textarea label: "Message" placeholder: "Your message here..." rows: 6
      }

      component Checkbox label: "I agree to the privacy policy"

      layout stack(direction: horizontal, gap: md, justify: end) {
        component Button text: "Cancel" variant: secondary
        component Button text: "Send Message" variant: primary icon: "send"
      }
    }
  }
}
\`\`\`

### Registration Form with Sections

\`\`\`wire
project "Registration" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Registration {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      component Heading text: "Create Your Account"
      component Divider

      // Personal Information
      component Label text: "Personal Information"
      layout stack(direction: vertical, gap: md) {
        layout grid(columns: 12, gap: md) {
          cell span: 6 {
            component Input label: "First Name" placeholder: "John"
          }
          cell span: 6 {
            component Input label: "Last Name" placeholder: "Doe"
          }
        }
        component Input label: "Email" placeholder: "john@example.com" iconLeft: "mail"
        component Input label: "Phone" placeholder: "+1 (555) 123-4567" iconLeft: "phone"
      }

      component Divider

      // Account Details
      component Label text: "Account Details"
      layout stack(direction: vertical, gap: md) {
        component Input label: "Username" placeholder: "johndoe" iconLeft: "user"
        component Input label: "Password" placeholder: "Enter password" iconRight: "eye-off"
        component Input label: "Confirm Password" placeholder: "Re-enter password" iconRight: "eye-off"
      }

      component Divider

      // Preferences
      component Label text: "Preferences"
      layout stack(direction: vertical, gap: sm) {
        component Checkbox label: "Subscribe to newsletter" checked: true
        component Checkbox label: "Enable email notifications"
        component Checkbox label: "Make profile public"
      }

      component Divider

      // Terms
      component Checkbox label: "I agree to the Terms of Service and Privacy Policy" checked: false

      // Actions
      layout stack(direction: horizontal, gap: md, justify: end) {
        component Button text: "Cancel" variant: secondary
        component Button text: "Create Account" variant: primary
      }
    }
  }
}
\`\`\`

### Login Form

\`\`\`wire
project "Login" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Login {
    layout stack(direction: vertical, gap: lg, padding: xl) {
      component Heading text: "Sign In"
      component Text text: "Enter your credentials to access your account"

      layout stack(direction: vertical, gap: md) {
        component Input label: "Email" placeholder: "your@email.com" iconLeft: "mail"
        component Input label: "Password" placeholder: "Enter password" iconRight: "eye-off"
      }

      layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
        component Checkbox label: "Remember me"
        component Link text: "Forgot password?"
      }

      component Button text: "Sign In" variant: primary

      layout stack(direction: horizontal, gap: sm, justify: center) {
        component Text text: "Don't have an account?"
        component Link text: "Sign up"
      }
    }
  }
}
\`\`\`

---

## Dashboard Patterns

### Admin Dashboard with Sidebar

\`\`\`wire
project "Admin Dashboard" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Dashboard {
    layout split(left: 260, gap: md) {
      // Left panel
      layout stack(direction: vertical, gap: md, padding: md) {
        component Heading text: "Admin Panel"
        component SidebarMenu items: "Dashboard,Users,Products,Orders,Analytics,Settings" icons: "home,users,box,shopping-cart,bar-chart-2,settings" active: 0
        component Divider
        layout grid(columns: 5, gap: sm) {
          cell span: 2 {
            component Image type: icon icon: "user" circle: true height: 65
          }
          cell span: 3 {
            layout stack(direction: vertical, gap: none) {
              component Heading text: "Admin User" level: h4
              component Badge text: "Online" variant: success size: xs
            }
          }
        }
      }

      // Main Content
      layout stack(direction: vertical, gap: lg) {
        component Topbar title: "Dashboard" subtitle: "Welcome back!" user: "admin@example.com" border: true background: true

        // Stats Grid
        layout grid(columns: 12, gap: md) {
          cell span: 3 {
            component Stat title: "Total Users" value: "2,543" icon: "users" variant: primary
          }
          cell span: 3 {
            component Stat title: "Revenue" value: "$45,230" icon: "dollar-sign" variant: success
          }
          cell span: 3 {
            component Stat title: "Active Orders" value: "892" icon: "shopping-cart" variant: info
          }
          cell span: 3 {
            component Stat title: "Growth" value: "+12.5%" icon: "trending-up" variant: success
          }
        }

        // Charts
        layout grid(columns: 12, gap: lg) {
          cell span: 8 {
            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "Revenue Overview"
                component Chart type: line height: 300
              }
            }
          }
          cell span: 4 {
            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "Traffic Sources"
                component Chart type: pie height: 300
              }
            }
          }
        }

        // Recent Activity
        component Heading text: "Recent Orders"
        component Table columns: "Order ID,Customer,Product,Amount,Status" rows: 8 pagination: true
      }
    }
  }
}
\`\`\`

### Metrics Dashboard

\`\`\`wire
project "Metrics Dashboard" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Metrics {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      // Header
      layout grid(columns: 12, gap: md) {
        cell span: 8 {
          component Heading text: "Performance Metrics"
        }
        cell span: 4 {
          layout stack(direction: horizontal, justify: end) {
            component Select label: "Time Period" items: "Last 7 days,Last 30 days,Last 90 days,This year"
          }
        }
      }

      // KPI Cards
      layout grid(columns: 12, gap: lg) {
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon icon: "users" variant: primary
            component Stat title: "Active Users" value: "1,234"
            component Badge text: "+15% vs last week" variant: success
          }
        }
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon icon: "dollar-sign" variant: success
            component Stat title: "Revenue" value: "$45,230"
            component Badge text: "+8% vs last week" variant: success
          }
        }
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon icon: "shopping-cart" variant: warning
            component Stat title: "Orders" value: "892"
            component Badge text: "-3% vs last week" variant: warning
          }
        }
        cell span: 3 {
          layout card(padding: lg, gap: sm) {
            component Icon icon: "trending-up" variant: info
            component Stat title: "Conversion" value: "3.2%"
            component Badge text: "+0.5% vs last week" variant: success
          }
        }
      }

      // Charts Row
      layout grid(columns: 12, gap: lg) {
        cell span: 8 {
          component Chart type: area height: 400
        }
        cell span: 4 {
          component Chart type: bar height: 400
        }
      }

      // Data Table
      component Heading text: "Recent Transactions"
      component Table columns: "Date,Transaction ID,Customer,Amount,Status" rows: 10 pagination: true
    }
  }
}
\`\`\`

---

## Product Grid Patterns

### E-Commerce Product Grid

Note: Using user-defined component.

\`\`\`wire
project "Product Catalog" {
  style {
    density: "comfortable"
    spacing: "lg"
    radius: "lg"
    stroke: "thin"
    font: "base"
  }

  define Component "ProductSample" {
    layout card(padding: md, gap: md, radius: lg, border: true) {
      component Image type: square height: 250
      component Heading text: "Smart Watch"
      component Text text: "Track fitness and health metrics"
      component Badge text: "Sale" variant: success
      layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
        component Heading text: "$199.99"
        component Button text: "Add to Cart" variant: primary
      }
    }
  }

  screen Products {
    layout stack(direction: vertical, gap: xl, padding: xl) {
      // Header with Search
      layout grid(columns: 12, gap: md) {
        cell span: 6 {
          component Heading text: "Featured Products"
        }
        cell span: 4 {
          component Input label: "Search" placeholder: "Search products..." iconLeft: "search"
        }
        cell span: 2 {
          layout stack(direction: horizontal, justify: end) {
            component Button text: "Filter" variant: secondary icon: "filter" labelSpace: true block: true size: md
          }
        }
      }

      // Product Grid
      layout grid(columns: 12, gap: xl) {
        cell span: 4 {
          layout card(padding: md, gap: md, radius: lg, border: true) {
            component Image type: square height: 250
            component Heading text: "Wireless Headphones"
            component Text text: "Premium noise-cancelling headphones"
            component Badge text: "New" variant: primary
            layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
              component Heading text: "$129.99"
              component Button text: "Add to Cart" variant: primary
            }
          }
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }

        cell span: 4 {
          component ProductSample
        }
      }

      component Divider

      // Pagination
      layout stack(direction: horizontal, gap: sm, justify: center) {
        component Button text: "Previous"
        component Text text: "Page 1 of 5"
        component Button text: "Next" variant: primary
      }
    }
  }
}
\`\`\`

### Product Detail Page

\`\`\`wire
project "Product Detail" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen ProductDetail {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      component Breadcrumbs items: "Home,Products,Electronics,Headphones"

      layout grid(columns: 12, gap: xl) {
        // Product Images
        cell span: 6 {
          layout stack(direction: vertical, gap: md) {
            component Image type: square height: 500
            layout grid(columns: 12, gap: sm) {
              cell span: 3 {
                component Image type: square height: 100
              }
              cell span: 3 {
                component Image type: square height: 100
              }
              cell span: 3 {
                component Image type: square height: 100
              }
              cell span: 3 {
                component Image type: square height: 100
              }
            }
          }
        }

        // Product Info
        cell span: 6 {
          layout stack(direction: vertical, gap: lg) {
            component Heading text: "Premium Wireless Headphones"
            component Badge text: "In Stock" variant: success

            component Stat title: "Price" value: "$129.99"

            component Paragraph text: "Experience superior sound quality with our premium wireless headphones featuring active noise cancellation and 30-hour battery life."

            component Divider

            // Options
            component Select label: "Color" items: "Black,White,Blue,Red"
            component Select label: "Quantity" items: "1,2,3,4,5"

            // Actions
            layout stack(direction: horizontal, gap: md, justify: start) {
              component Button text: "Add to Cart" variant: primary icon: "shopping-cart"
              component IconButton icon: "heart"
              component IconButton icon: "share-2"
            }

            component Divider

            // Features
            component Label text: "Features"
            layout stack(direction: vertical, gap: xs) {
              component Text text: "Active Noise Cancellation"
              component Text text: "30-hour battery life"
              component Text text: "Bluetooth 5.0"
              component Text text: "Premium materials"
              component Text text: "Foldable design"
            }
          }
        }
      }

      // Tabs for Details
      component Tabs items: "Description,Specifications,Reviews,Shipping" active: 0

      layout panel(padding: lg) {
        layout stack(direction: vertical, gap: md) {
          component Paragraph text: "These premium wireless headphones deliver exceptional sound quality with deep bass and crystal-clear highs. The active noise cancellation technology blocks out ambient noise, allowing you to focus on your music."
          component Paragraph text: "Designed for all-day comfort with soft ear cushions and an adjustable headband. The 30-hour battery life ensures you can enjoy your music for days without recharging."
        }
      }
    }
  }
}
\`\`\`

---

## User Profile Patterns

### User Profile with Tabs

\`\`\`wire
project "User Profile" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Profile {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      // Profile Header
      layout card(padding: lg, gap: md) {
        layout stack(direction: horizontal, gap: lg, justify: start) {
          component Image type: avatar circle: true
          layout stack(direction: vertical, gap: sm) {
            component Heading text: "John Doe"
            component Text text: "Senior Developer"
            component Text text: "john.doe@example.com"
            layout stack(direction: horizontal, gap: sm, justify: start) {
              component Badge text: "Pro Member" variant: primary
              component Badge text: "Verified" variant: success
            }
          }
        }
      }

      // Tabs
      component Tabs items: "Overview,Settings,Activity,Billing" active: 0

      // Tab Content
      layout grid(columns: 12, gap: lg) {
        // Left Column
        cell span: 8 {
          layout stack(direction: vertical, gap: md) {
            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "About"
                component Paragraph text: "Passionate developer with 10+ years of experience in full-stack development. Specializing in JavaScript, React, and Node.js."
              }
            }

            layout panel(padding: md) {
              layout stack(direction: vertical, gap: md) {
                component Heading text: "Recent Activity"
                component List items: "Completed project Alpha,Updated profile picture,Joined team Beta,Earned achievement badge"
              }
            }
          }
        }

        // Right Column
        cell span: 4 {
          layout stack(direction: vertical, gap: md) {
            layout card(padding: md, gap: sm) {
              component Heading text: "Stats"
              component Stat title: "Projects" value: "47" icon: "folder"
              component Stat title: "Contributions" value: "1,234" icon: "git-commit"
              component Stat title: "Followers" value: "892" icon: "users"
            }

            layout card(padding: md, gap: sm) {
              component Heading text: "Skills"
              layout stack(direction: horizontal, gap: xs, justify: start) {
                component Badge text: "JavaScript" variant: info
                component Badge text: "React" variant: info
                component Badge text: "Node.js" variant: info
              }
              layout stack(direction: horizontal, gap: xs, justify: start) {
                component Badge text: "TypeScript" variant: info
                component Badge text: "GraphQL" variant: info
              }
            }
          }
        }
      }
    }
  }
}
\`\`\`

---

## Settings Page Patterns

### Settings with Sidebar

\`\`\`wire
project "Settings" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen Settings {
    layout split(left: 240, gap: md) {
      // Settings Navigation
      layout stack(direction: vertical, gap: sm, padding: md) {
        component Heading text: "Settings"
        component SidebarMenu items: "Profile,Account,Privacy,Notifications,Billing,Security" icons: "user,settings,lock,bell,credit-card,shield" active: 0
      }

      // Settings Content
      layout stack(direction: vertical, gap: xl, padding: lg) {
        component Heading text: "Profile Settings"

        // Profile Photo
        layout card(padding: md) {
          component Label text: "Profile Photo"
          layout grid(columns: 5, gap: md) {
            component Image type: icon icon: "user" circle: true height: 100
            layout stack(direction: horizontal, gap: sm, justify: start) {
              component Button text: "Upload New" variant: primary icon: "upload"
              component Button text: "Remove" variant: secondary
            }
          }
        }

        // Basic Information
        layout panel(padding: md) {
          layout stack(direction: vertical, gap: md) {
            component Label text: "Basic Information"
            layout grid(columns: 12, gap: md) {
              cell span: 6 {
                component Input label: "First Name" placeholder: "John"
              }
              cell span: 6 {
                component Input label: "Last Name" placeholder: "Doe"
              }
            }
            component Input label: "Email" placeholder: "john@example.com" iconLeft: "mail"
            component Input label: "Phone" placeholder: "+1 (555) 123-4567" iconLeft: "phone"
            component Textarea label: "Bio" placeholder: "Tell us about yourself" rows: 4
          }
        }

        // Preferences
        layout panel(padding: md) {
          layout stack(direction: vertical, gap: md) {
            component Label text: "Preferences"
            component Select label: "Language" items: "English,Spanish,French,German" iconLeft: "globe"
            component Select label: "Timezone" items: "UTC-8,UTC-5,UTC,UTC+1,UTC+8" iconLeft: "clock"
            component Toggle label: "Dark Mode" enabled: false
            component Toggle label: "Email Notifications" enabled: true
          }
        }

        // Actions
        layout stack(direction: horizontal, gap: md, justify: end) {
          component Button text: "Cancel" variant: secondary
          component Button text: "Save Changes" variant: primary icon: "save"
        }
      }
    }
  }
}
\`\`\`

---

## Data Table Patterns

### Users List with Actions

\`\`\`wire
project "Users Management" {
  style {
    density: "normal"
    spacing: "md"
    radius: "md"
    stroke: "normal"
    font: "base"
  }

  screen UsersList {
    layout stack(direction: vertical, gap: lg, padding: lg) {
      // Header with Actions
      layout grid(columns: 12, gap: md) {
        cell span: 6 {
          component Heading text: "Users"
        }
        cell span: 4 {
          component Input label: "Search" placeholder: "Search by name or email..." iconLeft: "search"
        }
        cell span: 2 {
          layout stack(direction: horizontal, justify: end) {
            component Button text: "Add User" variant: primary icon: "plus" labelSpace: true block: true size: md
          }
        }
      }

      // Filters
      layout card(padding: lg) {
        layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
          component Select label: "Role" items: "All,Admin,User,Guest"
          component Select label: "Status" items: "All,Active,Inactive,Pending"
          component Button text: "Apply Filters" icon: "filter"
        }
      }

      // Users Table
      component Table columns: "Name,Email,Role,Status,Last Login,Actions" rows: 10 pagination: true actions: "Edit,Delete"
    }
  }
}
\`\`\`

---

## Quick Selection Guide

**Need a form?** -> Use Form Patterns
**Need a dashboard?** -> Use Dashboard Patterns
**Need product cards?** -> Use Product Grid Patterns
**Need user profile?** -> Use User Profile Patterns
**Need settings page?** -> Use Settings Page Patterns
**Need data table?** -> Use Data Table Patterns

All patterns are production-ready and can be customized by changing text, colors, and spacing values.

<!-- Source: @wire-dsl/language-support components.ts -->
`;

export const DOCS_BEST_PRACTICES = `
# Wire DSL Best Practices

This guide covers validation rules, common mistakes, gotchas, and quality guidelines for generating valid Wire DSL code.

## Validation Checklist

Use this checklist before outputting Wire DSL code to ensure validity.

### Structure Validation

- [ ] File starts with \`project\` block
- [ ] If using a \`style\` block, use \`style\` (not \`theme\`)
- [ ] Project has at least one \`screen\` block
- [ ] Each screen has exactly one root layout
- [ ] All opening braces \`{\` have matching closing braces \`}\`
- [ ] Split layouts have exactly 2 children
- [ ] Panel layouts have exactly 1 child
- [ ] Grid cells are inside grid layouts only

### Syntax Validation

- [ ] All string values are quoted: \`text: "Hello"\`
- [ ] Numbers are NOT quoted: \`height: 200\`
- [ ] Booleans are NOT quoted: \`checked: true\`
- [ ] Enums are NOT quoted: \`variant: primary\`
- [ ] Properties use \`key: value\` format
- [ ] CSV lists use comma-separated strings: \`items: "A,B,C"\`
- [ ] No trailing commas or semicolons

### Naming Validation

- [ ] Screen names use CamelCase: \`UsersList\`, \`Dashboard\`
- [ ] Component names match exactly (case-sensitive): \`Button\`, \`Input\`
- [ ] Property names use camelCase: \`gap\`, \`padding\`, \`iconLeft\`
- [ ] Screen names are unique within the project

### Properties Validation

- [ ] All required properties are present
- [ ] Property values match valid options/enums
- [ ] Icon names are valid Feather Icons
- [ ] Grid cell \`span\` values are 1-12
- [ ] Chart types are: \`bar\`, \`line\`, \`pie\`, \`area\`
- [ ] Image \`type\` values are: \`landscape\`, \`portrait\`, \`square\`, \`icon\`, \`avatar\`
- [ ] Variants use \`danger\` (not \`error\`) and \`default\` (not \`ghost\`)

### Layout Validation

- [ ] \`padding\` specified when needed (default is 0px)
- [ ] \`justify\` and \`align\` used correctly (not interchanged)
- [ ] \`columns\` specified for grid layouts
- [ ] Split uses \`left\` or \`right\` (not deprecated \`sidebar\`)
- [ ] Spacing tokens are valid: \`none\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\`

---

## Common Mistakes

### Mistake #1: Using \`theme\` Instead of \`style\`

Wrong:
\`\`\`wire
project "My App" {
  theme {
    density: "normal"
  }
}
\`\`\`

Correct:
\`\`\`wire
project "My App" {
  style {
    density: "normal"
  }
}
\`\`\`

**Rule:** The style block keyword is \`style\`, not \`theme\`. Both the block and its properties are optional.

---

### Mistake #2: Forgetting Quotes on Strings

Wrong:
\`\`\`wire
component Heading text: Hello World
component Input label: Email
\`\`\`

Correct:
\`\`\`wire
component Heading text: "Hello World"
component Input label: "Email"
\`\`\`

**Rule:** All string values MUST be quoted.

---

### Mistake #3: Adding Quotes to Numbers/Booleans

Wrong:
\`\`\`wire
component Image height: "200"
component Checkbox checked: "true"
component Table rows: "8"
\`\`\`

Correct:
\`\`\`wire
component Image height: 200
component Checkbox checked: true
component Table rows: 8
\`\`\`

**Rule:** Numbers, booleans, and enums are NOT quoted.

---

### Mistake #4: Wrong Component Case

Wrong:
\`\`\`wire
component button text: "Click"
component INPUT label: "Name"
component heading text: "Title"
\`\`\`

Correct:
\`\`\`wire
component Button text: "Click"
component Input label: "Name"
component Heading text: "Title"
\`\`\`

**Rule:** Component names are case-sensitive and use PascalCase.

---

### Mistake #5: Wrong Screen Naming

Wrong:
\`\`\`wire
screen user-list { }
screen Users_List { }
screen userslist { }
\`\`\`

Correct:
\`\`\`wire
screen UsersList { }
screen UsersListPage { }
screen DashboardView { }
\`\`\`

**Rule:** Screen names use CamelCase (PascalCase).

---

### Mistake #6: Using \`content\` Instead of \`text\` on Text Component

Wrong:
\`\`\`wire
component Text content: "Hello world"
\`\`\`

Correct:
\`\`\`wire
component Text text: "Hello world"
\`\`\`

**Rule:** The Text component property is \`text\`, not \`content\`.

---

### Mistake #7: Using \`name\` Instead of \`icon\` on Icon Component

Wrong:
\`\`\`wire
component Icon name: "star"
\`\`\`

Correct:
\`\`\`wire
component Icon icon: "star"
\`\`\`

**Rule:** The Icon component property is \`icon\`, not \`name\`.

---

### Mistake #8: Using \`activeIndex\` Instead of \`active\` on Tabs

Wrong:
\`\`\`wire
component Tabs items: "A,B,C" activeIndex: 0
\`\`\`

Correct:
\`\`\`wire
component Tabs items: "A,B,C" active: 0
\`\`\`

**Rule:** The Tabs property is \`active\`, not \`activeIndex\`.

---

### Mistake #9: Using \`error\` Variant Instead of \`danger\`

Wrong:
\`\`\`wire
component Badge text: "Error" variant: error
component Alert type: "error" message: "Failed"
\`\`\`

Correct:
\`\`\`wire
component Badge text: "Error" variant: danger
component Alert variant: danger text: "Failed"
\`\`\`

**Rule:** Use \`danger\`, not \`error\`. Alert uses \`variant\`/\`title\`/\`text\` properties.

---

### Mistake #10: Using Deprecated \`sidebar\` on Split

Wrong:
\`\`\`wire
layout split(sidebar: 260, gap: md) {
  layout stack { }
  layout stack { }
}
\`\`\`

Correct:
\`\`\`wire
layout split(left: 260, gap: md) {
  layout stack { }
  layout stack { }
}
\`\`\`

**Rule:** \`sidebar\` was removed. Use \`left\` or \`right\` instead.

---

### Mistake #11: Missing Padding

Wrong (content touches edges):
\`\`\`wire
layout stack(direction: vertical, gap: md) {
  component Heading text: "Title"
  component Button text: "Action"
}
\`\`\`

Correct (with padding):
\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  component Heading text: "Title"
  component Button text: "Action"
}
\`\`\`

**Rule:** Layouts default to 0px padding. Always specify \`padding\` when needed.

---

### Mistake #12: Confusing \`justify\` and \`align\` on Stacks

Wrong:
\`\`\`wire
layout stack(direction: horizontal, gap: md, align: justify) {
  component Button text: "Left"
  component Button text: "Right"
}
\`\`\`

Correct:
\`\`\`wire
layout stack(direction: horizontal, gap: md, justify: spaceBetween) {
  component Button text: "Left"
  component Button text: "Right"
}
\`\`\`

**Rule:** \`justify\` controls distribution along main axis (\`stretch\`, \`start\`, \`center\`, \`end\`, \`spaceBetween\`, \`spaceAround\`). \`align\` controls cross-axis alignment (\`start\`, \`center\`, \`end\`).

---

### Mistake #13: Wrong Number of Children

Wrong (Split needs exactly 2):
\`\`\`wire
layout split(left: 260, gap: md) {
  layout stack { }
  layout stack { }
  layout stack { }  // Too many!
}
\`\`\`

Wrong (Panel needs exactly 1):
\`\`\`wire
layout panel(padding: md) {
  component Heading text: "Title"
  component Text text: "Body"  // Too many!
}
\`\`\`

Correct:
\`\`\`wire
layout split(left: 260, gap: md) {
  layout stack { }
  layout stack { }
}

layout panel(padding: md) {
  layout stack(gap: md) {
    component Heading text: "Title"
    component Text text: "Body"
  }
}
\`\`\`

**Rule:** Split requires exactly 2 children, Panel requires exactly 1.

---

### Mistake #14: Invalid Grid Span

Wrong:
\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 15 {  // Max is 12
    component Input label: "Name"
  }
  cell span: 0 {   // Min is 1
    component Button text: "Submit"
  }
}
\`\`\`

Correct:
\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 12 {
    component Input label: "Name"
  }
  cell span: 3 {
    component Button text: "Submit"
  }
}
\`\`\`

**Rule:** Grid cell \`span\` values must be 1-12.

---

### Mistake #15: Using \`theme\` Instead of \`style\` for the Style Block

Wrong:
\`\`\`wire
project "My App" {
  theme {
    density: "normal"
  }
}
\`\`\`

Correct:
\`\`\`wire
project "My App" {
  style {
    density: "normal"
  }

  screen Home {
    layout stack { }
  }
}
\`\`\`

**Rule:** The style block keyword is \`style\`, not \`theme\`. The style block itself is optional — if omitted, all tokens use their defaults (density: "normal", spacing: "md", radius: "md", stroke: "normal", font: "base").

---

## Critical Gotchas

### Gotcha #1: Padding Defaults to 0px

**Issue:** Layouts do NOT inherit padding from style. Default is 0px.

**Impact:** Content touches edges without explicit padding.

**Solution:** Always specify \`padding\` when you want spacing:

\`\`\`wire
layout stack(direction: vertical, gap: md, padding: lg) {
  // now has breathing room
}
\`\`\`

---

### Gotcha #2: \`justify\` vs \`align\` on Stacks

**Issue:** These are two separate properties with different purposes.

- \`justify\` = distribution along main axis (stretch, start, center, end, spaceBetween, spaceAround)
- \`align\` = cross-axis alignment (start, center, end)

**Impact:** Using wrong values or wrong property name.

**Solution:**
\`\`\`wire
// Push buttons to the right
layout stack(direction: horizontal, gap: md, justify: end) {
  component Button text: "Cancel"
  component Button text: "Save" variant: primary
}

// Center children on cross axis
layout stack(direction: horizontal, gap: md, align: center) {
  component Icon icon: "info" size: lg
  component Text text: "Small text" size: sm
}
\`\`\`

---

### Gotcha #3: Split and Panel Child Count

**Issue:** Split requires exactly 2 children, Panel requires exactly 1.

**Impact:** Parser errors if wrong number of children.

**Solution:** Wrap multiple children in a stack for Panel:

\`\`\`wire
layout panel(padding: md) {
  layout stack(gap: md) {
    component Heading text: "Title"
    component Text text: "Body"
    component Button text: "Action"
  }
}
\`\`\`

---

### Gotcha #4: Grid Cells Are Not Optional

**Issue:** Components cannot be direct children of grid layouts.

**Impact:** Parser errors.

**Solution:** Always wrap grid content in cells:

\`\`\`wire
// Wrong
layout grid(columns: 12, gap: md) {
  component Input label: "Name"
}

// Correct
layout grid(columns: 12, gap: md) {
  cell span: 12 {
    component Input label: "Name"
  }
}
\`\`\`

---

### Gotcha #5: Style Block and Properties Are Optional

**Issue:** The \`style\` block and each of its properties are optional. Omitted properties use defaults.

**Defaults:** \`density: "normal"\`, \`spacing: "md"\`, \`radius: "md"\`, \`stroke: "normal"\`, \`font: "base"\`

**Solution:** Only specify properties you want to override:

\`\`\`wire
// Override just what you need
style {
  density: "compact"
  radius: "lg"
}

// Or omit the style block entirely for all defaults
\`\`\`

**Valid values:**
- \`density\`: \`"compact"\` | \`"normal"\` | \`"comfortable"\`
- \`spacing\`: \`"xs"\` | \`"sm"\` | \`"md"\` | \`"lg"\` | \`"xl"\`
- \`radius\`: \`"none"\` | \`"sm"\` | \`"md"\` | \`"lg"\` | \`"full"\`
- \`stroke\`: \`"thin"\` | \`"normal"\` | \`"thick"\`
- \`font\`: \`"sm"\` | \`"base"\` | \`"lg"\`
- \`background\`: any CSS color string (optional)
- \`theme\`: \`"light"\` | \`"dark"\` (optional)
- \`device\`: \`"mobile"\` | \`"tablet"\` | \`"desktop"\` | \`"print"\` | \`"a4"\` (optional)

---

## Quality Guidelines

### 1. Use Realistic Content

Generic:
\`\`\`wire
component Input label: "Input 1"
component Button text: "Button"
component Heading text: "Heading"
\`\`\`

Realistic:
\`\`\`wire
component Input label: "Email Address" placeholder: "john@example.com" iconLeft: "mail"
component Button text: "Create Account" variant: primary
component Heading text: "User Registration"
\`\`\`

### 2. Appropriate Spacing

\`\`\`wire
// Forms: md-lg padding, md gap
layout stack(gap: md, padding: lg)

// Dashboards: lg padding, md-lg gap
layout stack(gap: lg, padding: lg)

// Compact lists: sm gap, md padding
layout stack(gap: sm, padding: md)
\`\`\`

### 3. Logical Grouping

Good Grouping:
\`\`\`wire
layout stack(gap: xl, padding: lg) {
  // Header
  component Heading text: "Registration Form"
  component Divider

  // Section 1: Personal Info
  layout stack(gap: md) {
    component Label text: "Personal Information"
    component Input label: "Name"
    component Input label: "Email"
  }

  component Divider

  // Actions
  layout stack(direction: horizontal, gap: md, justify: end) {
    component Button text: "Submit" variant: primary
    component Button text: "Cancel"
  }
}
\`\`\`

### 4. Consistent Naming

Consistent:
\`\`\`wire
screen UsersList { }
screen ProductDetails { }
screen SettingsPage { }
\`\`\`

### 5. Proper Nesting Depth

Balanced:
\`\`\`wire
screen Dashboard {
  layout stack(gap: lg, padding: lg) {
    component Heading text: "Dashboard"

    layout grid(columns: 12, gap: md) {
      cell span: 3 {
        component Stat title: "Users" value: "100" icon: "users"
      }
      cell span: 3 {
        component Stat title: "Revenue" value: "$5K" icon: "dollar-sign"
      }
    }

    component Chart type: line height: 300
  }
}
\`\`\`

---

## Pre-Output Validation Script

Before outputting Wire DSL code, mentally run through this validation:

1. **Syntax Check:**
   - Strings quoted?
   - Numbers/booleans NOT quoted?
   - Braces balanced?

2. **Structure Check:**
   - Has project, screen? (style is optional)
   - Split has 2 children?
   - Panel has 1 child?

3. **Naming Check:**
   - Screens CamelCase?
   - Components PascalCase exact?

4. **Properties Check:**
   - Required props present?
   - Values from valid enums?
   - Grid spans 1-12?
   - Uses \`text\` not \`content\` for Text?
   - Uses \`icon\` not \`name\` for Icon?
   - Uses \`active\` not \`activeIndex\` for Tabs?
   - Uses \`variant\`/\`title\`/\`text\` for Alert (not \`type\`/\`message\`)?
   - Uses \`danger\` not \`error\`?

5. **Layout Check:**
   - Uses \`style\` not \`theme\`?
   - Uses \`left\`/\`right\` not \`sidebar\` on split?
   - Padding specified?
   - \`justify\` and \`align\` used correctly?

6. **Content Check:**
   - Realistic values?
   - Logical grouping?
   - Appropriate spacing?

---

## Alignment Tips

### Buttons Next to Inputs Should Match Size

When a Button or IconButton sits on the same row as an Input or Select, give both the same \`size\` so their heights match:

Wrong (mismatched heights):
\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Type..."
  }
  cell span: 3 {
    component Button text: "Search" variant: primary
  }
}
\`\`\`

Correct (matching size):
\`\`\`wire
layout grid(columns: 12, gap: md) {
  cell span: 9 {
    component Input label: "Search" placeholder: "Type..." size: md
  }
  cell span: 3 {
    component Button text: "Search" variant: primary size: md labelSpace: true
  }
}
\`\`\`

Use \`labelSpace: true\` on the Button so it reserves the same vertical space as the Input's label, keeping baselines aligned.

---

## Error Prevention Tips

1. **Always validate before output** - Run through the checklist
2. **Use realistic content** - Not "text", "button", etc.
3. **Check child counts** - Split (2), Panel (1)
4. **Verify quotes** - Strings yes, numbers/bools no
5. **Test nesting depth** - Not too shallow, not too deep
6. **Consistent naming** - CamelCase screens, PascalCase components
7. **Specify padding** - Don't rely on defaults (0px)
8. **Logical grouping** - Related items together
9. **Appropriate spacing** - md-lg for most cases
10. **Complete examples** - Full runnable code, not snippets

<!-- Source: @wire-dsl/language-support components.ts, engine parser/index.ts -->
`;

export const DOCS_MCP_RENDER = `
# render_wire Tool Parameters

When calling the \`render_wire\` MCP tool, these parameters control the output:

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| \`format\` | \`svg\` \| \`png\` | \`svg\` | \`png\` returns a base64 image visible in chat. \`svg\` returns raw markup for inspection. **Always use \`png\` when showing the wireframe to the user.** |
| \`device\` | \`mobile\` \| \`tablet\` \| \`desktop\` | DSL value or \`desktop\` | Overrides the viewport set in the DSL \`style\` block. Widths: mobile=375px, tablet=768px, desktop=1280px. |
| \`renderer\` | \`standard\` \| \`skeleton\` \| \`sketch\` | \`standard\` | \`skeleton\` renders grey loading-state placeholders. \`sketch\` renders a hand-drawn appearance. |
| \`theme\` | \`light\` \| \`dark\` | DSL value or \`light\` | Overrides the \`theme\` set in the DSL \`style\` block. |
| \`screen\` | screen name string | all screens | Render only a specific screen by its name. |

## Priority rules

- \`device\` tool param > \`style { device: ... }\` in DSL > \`desktop\`
- \`theme\` tool param > \`style { theme: ... }\` in DSL > \`light\`

## Usage examples

Show a mobile wireframe to the user:
\`\`\`
render_wire(wire_code: "...", format: "png", device: "mobile")
\`\`\`

Inspect SVG markup for a specific screen:
\`\`\`
render_wire(wire_code: "...", format: "svg", screen: "Dashboard")
\`\`\`

Render a skeleton loading state in dark mode:
\`\`\`
render_wire(wire_code: "...", format: "png", renderer: "skeleton", theme: "dark")
\`\`\`

Render a sketch-style wireframe for desktop:
\`\`\`
render_wire(wire_code: "...", format: "png", renderer: "sketch", device: "desktop")
\`\`\`
`;

// "theme": design tokens live in DOCS_SYNTAX (style block section)
// "all": all sections joined for initial LLM context
export const DOCS_ALL = [
  DOCS_SYNTAX,
  DOCS_COMPONENTS,
  DOCS_CONTAINERS,
  DOCS_EXAMPLES,
  DOCS_BEST_PRACTICES,
  DOCS_MCP_RENDER,
].join('\n\n---\n\n');

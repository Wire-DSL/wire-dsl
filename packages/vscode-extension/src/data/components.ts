/**
 * Wire DSL Component Metadata
 * Used for autocompletion and hover documentation
 */

export interface ComponentMetadata {
  name: string;
  description: string;
  properties: string[];
  propertyValues?: Record<string, string[]>;
  example: string;
}

export interface LayoutMetadata {
  name: string;
  description: string;
  properties: string[];
  example: string;
  requiredProperties: string[];
}

export const COMPONENTS: Record<string, ComponentMetadata> = {
  // Text Components
  Heading: {
    name: 'Heading',
    description: 'Large heading/title text',
    properties: ['text'],
    example: 'component Heading text: "Users"',
  },
  Text: {
    name: 'Text',
    description: 'Regular paragraph text',
    properties: ['content'],
    example: 'component Text content: "Lorem ipsum dolor sit amet..."',
  },
  Label: {
    name: 'Label',
    description: 'Small label text',
    properties: ['text'],
    example: 'component Label text: "Field label"',
  },
  Code: {
    name: 'Code',
    description: 'Code or monospace text',
    properties: ['content'],
    example: 'component Code content: "const x = 42;"',
  },

  // Input Components
  Input: {
    name: 'Input',
    description: 'Text input field',
    properties: ['label', 'placeholder'],
    example: 'component Input label: "Username" placeholder: "Enter name..."',
  },
  Textarea: {
    name: 'Textarea',
    description: 'Multi-line text input',
    properties: ['label', 'placeholder', 'rows'],
    example: 'component Textarea label: "Description" rows: 6',
  },
  Select: {
    name: 'Select',
    description: 'Dropdown selection list',
    properties: ['label', 'options', 'placeholder'],
    example: 'component Select label: "Role" options: ["Admin", "User", "Guest"]',
  },
  Checkbox: {
    name: 'Checkbox',
    description: 'Single checkbox input',
    properties: ['label'],
    example: 'component Checkbox label: "Remember me"',
  },
  Radio: {
    name: 'Radio',
    description: 'Single radio button',
    properties: ['label'],
    example: 'component Radio label: "Option"',
  },
  Toggle: {
    name: 'Toggle',
    description: 'Toggle switch input',
    properties: ['label'],
    example: 'component Toggle label: "Enable feature"',
  },

  // Button Components
  Button: {
    name: 'Button',
    description: 'Clickable button element',
    properties: ['text', 'variant'],
    propertyValues: {
      variant: ['primary', 'secondary', 'ghost'],
    },
    example: 'component Button text: "Save" variant: primary',
  },
  IconButton: {
    name: 'IconButton',
    description: 'Icon-only button',
    properties: ['icon'],
    example: 'component IconButton icon: "search"',
  },

  // Navigation Components
  SidebarMenu: {
    name: 'SidebarMenu',
    description: 'Vertical navigation menu',
    properties: ['items'],
    example: 'component SidebarMenu items: ["Users", "Roles", "Settings"]',
  },
  Topbar: {
    name: 'Topbar',
    description: 'Top navigation bar',
    properties: ['title'],
    example: 'component Topbar title: "Dashboard"',
  },
  Breadcrumbs: {
    name: 'Breadcrumbs',
    description: 'Breadcrumb navigation trail',
    properties: ['items'],
    example: 'component Breadcrumbs items: ["Home", "Users", "Detail"]',
  },
  Tabs: {
    name: 'Tabs',
    description: 'Tabbed content switcher',
    properties: ['items', 'activeIndex'],
    example: 'component Tabs items: ["Profile", "Settings", "Logs"]',
  },

  // Data Components
  Table: {
    name: 'Table',
    description: 'Data table with rows and columns',
    properties: ['columns', 'rowsMock', 'rowHeight'],
    example: 'component Table columns: ["Name", "Email", "Status", "Role"] rowsMock: 8',
  },
  List: {
    name: 'List',
    description: 'Vertical list of items',
    properties: ['items'],
    example: 'component List items: ["Item 1", "Item 2", "Item 3"]',
  },

  // Container Components
  Panel: {
    name: 'Panel',
    description: 'Container with border and padding',
    properties: ['title', 'height'],
    example: 'component Panel title: "User Info" height: 240',
  },
  Card: {
    name: 'Card',
    description: 'Card container for content grouping',
    properties: ['title'],
    example: 'component Card title: "Stats"',
  },
  Badge: {
    name: 'Badge',
    description: 'Small badge/tag element',
    properties: ['text', 'variant'],
    propertyValues: {
      variant: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
    example: 'component Badge text: "New" variant: primary',
  },
  Alert: {
    name: 'Alert',
    description: 'Alert message box',
    properties: ['text', 'variant'],
    propertyValues: {
      variant: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
    },
    example: 'component Alert text: "Warning message" variant: warning',
  },


  // Visual Components
  Divider: {
    name: 'Divider',
    description: 'Horizontal divider line',
    properties: [],
    example: 'component Divider',
  },
  Image: {
    name: 'Image',
    description: 'Image placeholder or actual image',
    properties: ['src', 'alt', 'height', 'placeholder'],
    propertyValues: {
      placeholder: ['square', 'landscape', 'avatar', 'icon'],
    },
    example: 'component Image placeholder: "landscape" height: 300',
  },

  ChartPlaceholder: {
    name: 'ChartPlaceholder',
    description: 'Chart visualization placeholder',
    properties: ['type', 'height'],
    propertyValues: {
      type: ['bar', 'line', 'pie'],
    },
    example: 'component ChartPlaceholder type: "bar" height: 200',
  },
  Sidebar: {
    name: 'Sidebar',
    description: 'Sidebar navigation panel',
    properties: ['title', 'items'],
    example: 'component Sidebar title: "Navigation" items: ["Dashboard", "Users"]',
  },
};

export const LAYOUTS: Record<string, LayoutMetadata> = {
  stack: {
    name: 'stack',
    description: 'Stack layout - arranges items in a row or column',
    properties: ['direction', 'gap', 'padding', 'align', 'justify'],
    example: 'layout stack(direction: vertical, gap: md, padding: lg) { ... }',
    requiredProperties: [],
  },
  grid: {
    name: 'grid',
    description: 'Grid layout - 12-column grid system',
    properties: ['columns', 'gap', 'align', 'padding'],
    example: 'layout grid(columns: 12, gap: md) { cell span: 6 { ... } }',
    requiredProperties: ['columns'],
  },
  split: {
    name: 'split',
    description: 'Split layout - sidebar + main content',
    properties: ['sidebar', 'gap', 'padding'],
    example: 'layout split(sidebar: 260, gap: md) { ... }',
    requiredProperties: ['sidebar'],
  },
  panel: {
    name: 'panel',
    description: 'Panel layout - container with border and padding',
    properties: ['padding', 'background', 'radius', 'border'],
    example: 'layout panel(padding: md, background: white) { ... }',
    requiredProperties: [],
  },
  card: {
    name: 'card',
    description: 'Card layout - flexible vertical container',
    properties: ['padding', 'gap', 'radius', 'border', 'background'],
    example: 'layout card(padding: md, gap: md, radius: md) { ... }',
    requiredProperties: [],
  },
};

// Property values for specific properties (layout-related)
export const PROPERTY_VALUES: Record<string, string[]> = {
  direction: ['vertical', 'horizontal'],
  gap: ['xs', 'sm', 'md', 'lg', 'xl'],
  padding: ['xs', 'sm', 'md', 'lg', 'xl'],
  align: ['start', 'center', 'end'],
  justify: ['start', 'center', 'end', 'space-between', 'space-around'],
  radius: ['xs', 'sm', 'md', 'lg', 'xl'],
  density: ['compact', 'normal', 'comfortable'],
  spacing: ['xs', 'sm', 'md', 'lg', 'xl'],
};

// Keywords
export const KEYWORDS = {
  topLevel: ['project', 'tokens', 'colors', 'mocks'],
  screen: ['screen'],
  layout: ['layout'],
  component: ['component'],
  cell: ['cell'],
  special: ['span', 'sidebar', 'columns', 'gap', 'padding', 'direction'],
};

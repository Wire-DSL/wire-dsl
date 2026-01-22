/**
 * Wire DSL Component Metadata
 * Used for autocompletion and hover documentation
 */

export interface ComponentMetadata {
  name: string;
  description: string;
  properties: string[];
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
    properties: ['text', 'level', 'color', 'align'],
    example: 'component Heading text: "Title" level: 1',
  },
  Text: {
    name: 'Text',
    description: 'Regular paragraph text',
    properties: ['content', 'color', 'align', 'fontSize'],
    example: 'component Text content: "Lorem ipsum..."',
  },
  Paragraph: {
    name: 'Paragraph',
    description: 'Long-form text content',
    properties: ['content', 'color', 'align'],
    example: 'component Paragraph content: "Long text..."',
  },
  Label: {
    name: 'Label',
    description: 'Small label text',
    properties: ['text', 'color', 'required'],
    example: 'component Label text: "Field label"',
  },

  // Input Components
  Input: {
    name: 'Input',
    description: 'Text input field',
    properties: ['label', 'placeholder', 'type', 'disabled', 'required', 'defaultValue'],
    example: 'component Input label: "Username" placeholder: "Enter name..."',
  },
  Textarea: {
    name: 'Textarea',
    description: 'Multi-line text input',
    properties: ['label', 'placeholder', 'rows', 'disabled', 'required'],
    example: 'component Textarea label: "Description" rows: 4',
  },
  Select: {
    name: 'Select',
    description: 'Dropdown selection list',
    properties: ['label', 'options', 'disabled', 'required', 'defaultValue'],
    example: 'component Select label: "Role" options: ["Admin", "User"]',
  },
  Checkbox: {
    name: 'Checkbox',
    description: 'Single checkbox input',
    properties: ['label', 'disabled', 'checked', 'required'],
    example: 'component Checkbox label: "Remember me"',
  },
  CheckboxGroup: {
    name: 'CheckboxGroup',
    description: 'Multiple checkbox options',
    properties: ['label', 'options', 'disabled', 'required'],
    example: 'component CheckboxGroup label: "Select items" options: ["Option 1", "Option 2"]',
  },
  Radio: {
    name: 'Radio',
    description: 'Single radio button',
    properties: ['label', 'disabled', 'checked'],
    example: 'component Radio label: "Option"',
  },
  RadioGroup: {
    name: 'RadioGroup',
    description: 'Multiple radio options',
    properties: ['label', 'options', 'disabled', 'required'],
    example: 'component RadioGroup label: "Choose one" options: ["A", "B", "C"]',
  },
  Toggle: {
    name: 'Toggle',
    description: 'Toggle switch input',
    properties: ['label', 'disabled', 'checked'],
    example: 'component Toggle label: "Enable feature"',
  },

  // Button Components
  Button: {
    name: 'Button',
    description: 'Clickable button element',
    properties: ['text', 'variant', 'disabled', 'onClick', 'size'],
    example: 'component Button text: "Save" variant: primary',
  },
  IconButton: {
    name: 'IconButton',
    description: 'Icon-only button',
    properties: ['icon', 'variant', 'disabled', 'onClick', 'size'],
    example: 'component IconButton icon: "search"',
  },

  // Navigation Components
  SidebarMenu: {
    name: 'SidebarMenu',
    description: 'Vertical navigation menu',
    properties: ['items', 'active', 'title', 'onItemClick'],
    example: 'component SidebarMenu items: ["Users", "Settings", "Roles"]',
  },
  Topbar: {
    name: 'Topbar',
    description: 'Top navigation bar',
    properties: ['title', 'subtitle', 'user', 'onUserClick'],
    example: 'component Topbar title: "Dashboard" subtitle: "Overview"',
  },
  Breadcrumbs: {
    name: 'Breadcrumbs',
    description: 'Breadcrumb navigation trail',
    properties: ['items', 'onItemClick'],
    example: 'component Breadcrumbs items: ["Home", "Users", "Detail"]',
  },
  Tabs: {
    name: 'Tabs',
    description: 'Tabbed content switcher',
    properties: ['items', 'active', 'onTabChange'],
    example: 'component Tabs items: ["Overview", "Settings", "Logs"]',
  },

  // Data Components
  Table: {
    name: 'Table',
    description: 'Data table with rows and columns',
    properties: ['columns', 'rows', 'mock', 'title', 'onRowClick', 'striped', 'hoverable'],
    example: 'component Table columns: ["Name", "Email", "Status"] rows: 10',
  },
  List: {
    name: 'List',
    description: 'Vertical list of items',
    properties: ['items', 'title', 'onItemClick', 'ordered'],
    example: 'component List items: ["Item 1", "Item 2", "Item 3"]',
  },

  // Container Components
  Panel: {
    name: 'Panel',
    description: 'Container with border and padding',
    properties: ['title', 'height', 'padding', 'background', 'collapsible'],
    example: 'component Panel title: "User Info" height: 240',
  },
  Card: {
    name: 'Card',
    description: 'Card container for content grouping',
    properties: ['padding', 'gap', 'radius', 'border', 'background'],
    example: 'layout card(padding: md, gap: md, radius: md)',
  },
  Badge: {
    name: 'Badge',
    description: 'Small badge/tag element',
    properties: ['text', 'variant', 'color', 'size'],
    example: 'component Badge text: "New" variant: primary',
  },
  Alert: {
    name: 'Alert',
    description: 'Alert message box',
    properties: ['text', 'variant', 'dismissible', 'icon'],
    example: 'component Alert text: "Warning message" variant: warning',
  },

  // Visual Components
  Divider: {
    name: 'Divider',
    description: 'Horizontal divider line',
    properties: ['color', 'thickness'],
    example: 'component Divider',
  },
  Image: {
    name: 'Image',
    description: 'Image placeholder or actual image',
    properties: ['src', 'alt', 'height', 'placeholder', 'fit', 'radius'],
    example: 'component Image placeholder: "landscape" height: 300',
  },
  Icon: {
    name: 'Icon',
    description: 'Icon graphic element',
    properties: ['name', 'size', 'color'],
    example: 'component Icon name: "home" size: 24',
  },
  ChartPlaceholder: {
    name: 'ChartPlaceholder',
    description: 'Chart visualization placeholder',
    properties: ['title', 'subtitle', 'type', 'height'],
    example: 'component ChartPlaceholder title: "Sales" type: "bar" height: 300',
  },

  // Other Components
  Sidebar: {
    name: 'Sidebar',
    description: 'Sidebar navigation panel',
    properties: ['title', 'items', 'active', 'onItemClick'],
    example: 'component Sidebar title: "Navigation" items: ["Dashboard", "Users"]',
  },
  Spinner: {
    name: 'Spinner',
    description: 'Loading spinner animation',
    properties: ['size', 'color'],
    example: 'component Spinner size: "md"',
  },
  Avatar: {
    name: 'Avatar',
    description: 'User avatar image',
    properties: ['src', 'alt', 'size', 'initials'],
    example: 'component Avatar src: "https://..." size: "lg"',
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

// Property values for specific properties
export const PROPERTY_VALUES: Record<string, string[]> = {
  direction: ['vertical', 'horizontal'],
  variant: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
  gap: ['xs', 'sm', 'md', 'lg', 'xl'],
  padding: ['xs', 'sm', 'md', 'lg', 'xl'],
  align: ['start', 'center', 'end'],
  justify: ['start', 'center', 'end', 'space-between', 'space-around'],
  radius: ['xs', 'sm', 'md', 'lg', 'xl'],
  density: ['compact', 'normal', 'comfortable'],
  spacing: ['xs', 'sm', 'md', 'lg', 'xl'],
  type: ['email', 'password', 'text', 'number', 'date'],
  placeholder: ['square', 'landscape', 'avatar', 'icon'],
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

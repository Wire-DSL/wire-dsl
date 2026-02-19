/**
 * Wire DSL Component Metadata
 * Used for autocompletion, validation, and code intelligence.
 *
 * Last synced: February 16, 2026
 */
import { ICON_NAME_OPTIONS } from './icon-names';

export interface PropertyMetadata {
  name: string;
  type: 'string' | 'enum' | 'boolean' | 'number' | 'color';
  description?: string;
  defaultValue?: any;
  required?: boolean;
  options?: string[]; // For enums
}

export interface ComponentMetadata {
  name: string;
  description: string;
  category: ComponentCategory;
  properties: Record<string, PropertyMetadata>;
  example: string;
}

export interface LayoutMetadata {
  name: string;
  description: string;
  properties: Record<string, PropertyMetadata>;
  example: string;
  requiredProperties?: string[];
}

export type ComponentCategory =
  | 'Text'
  | 'Action'
  | 'Input'
  | 'Navigation'
  | 'Data'
  | 'Media'
  | 'Layout'
  | 'Feedback';

// Reusable Enum Definitions
const sizeEnum: PropertyMetadata = { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'] };
const spacingEnum: PropertyMetadata = {
  name: 'spacing',
  type: 'enum',
  options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
};
const variantEnum: PropertyMetadata = {
  name: 'variant',
  type: 'enum',
  options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'],
};
const variantWithDefaultEnum: PropertyMetadata = {
  name: 'variant',
  type: 'enum',
  options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
};
const iconNameEnum: PropertyMetadata = {
  name: 'icon',
  type: 'enum',
  options: ICON_NAME_OPTIONS,
};
const controlSizeEnum: PropertyMetadata = {
  name: 'size',
  type: 'enum',
  options: ['sm', 'md', 'lg'],
};
const alignEnum: PropertyMetadata = {
  name: 'align',
  type: 'enum',
  options: ['left', 'center', 'right'],
};
const controlPaddingEnum: PropertyMetadata = {
  name: 'padding',
  type: 'enum',
  options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
};
const headingLevelEnum: PropertyMetadata = {
  name: 'level',
  type: 'enum',
  options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
};
const headingSpacingEnum: PropertyMetadata = {
  name: 'spacing',
  type: 'enum',
  options: spacingEnum.options,
};
const imagePlaceholderEnum: PropertyMetadata = {
  name: 'placeholder',
  type: 'enum',
  options: ['landscape', 'portrait', 'square', 'icon', 'avatar'],
};

export const COMPONENTS: Record<string, ComponentMetadata> = {
  Heading: {
    name: 'Heading',
    description: 'Large heading text with level-based typography.',
    category: 'Text',
    properties: {
      text: { name: 'text', type: 'string' },
      level: headingLevelEnum,
      spacing: headingSpacingEnum,
      variant: variantWithDefaultEnum,
    },
    example: 'component Heading text: "Users" level: h2 spacing: sm',
  },
  Text: {
    name: 'Text',
    description: 'Body text content.',
    category: 'Text',
    properties: {
      content: { name: 'content', type: 'string' },
    },
    example: 'component Text content: "Lorem ipsum dolor sit amet"',
  },
  Label: {
    name: 'Label',
    description: 'Small label text.',
    category: 'Text',
    properties: {
      text: { name: 'text', type: 'string' },
    },
    example: 'component Label text: "Field label"',
  },
  Button: {
    name: 'Button',
    description: 'Clickable action button.',
    category: 'Action',
    properties: {
      text: { name: 'text', type: 'string' },
      variant: variantWithDefaultEnum,
      size: controlSizeEnum,
      labelSpace: { name: 'labelSpace', type: 'boolean' },
      padding: controlPaddingEnum,
      block: { name: 'block', type: 'boolean' },
    },
    example: 'component Button text: "Save" variant: primary block: true',
  },
  Link: {
    name: 'Link',
    description: 'Underlined text action without button background.',
    category: 'Action',
    properties: {
      text: { name: 'text', type: 'string' },
      variant: variantEnum,
    },
    example: 'component Link text: "Learn more" variant: info',
  },
  Input: {
    name: 'Input',
    description: 'Single-line input field.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string' },
      placeholder: { name: 'placeholder', type: 'string' },
      size: controlSizeEnum,
    },
    example: 'component Input label: "Email" placeholder: "you@example.com"',
  },
  Textarea: {
    name: 'Textarea',
    description: 'Multi-line input field.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string' },
      placeholder: { name: 'placeholder', type: 'string' },
      rows: { name: 'rows', type: 'number' },
    },
    example: 'component Textarea label: "Notes" rows: 4',
  },
  Select: {
    name: 'Select',
    description: 'Select-style input control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string' },
      placeholder: { name: 'placeholder', type: 'string' },
      items: { name: 'items', type: 'string' },
      size: controlSizeEnum,
    },
    example: 'component Select label: "Role" items: "Admin,User,Guest"',
  },
  Checkbox: {
    name: 'Checkbox',
    description: 'Checkbox control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string' },
      checked: { name: 'checked', type: 'boolean' },
    },
    example: 'component Checkbox label: "I agree" checked: true',
  },
  Radio: {
    name: 'Radio',
    description: 'Radio control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string' },
      checked: { name: 'checked', type: 'boolean' },
    },
    example: 'component Radio label: "Option A" checked: true',
  },
  Toggle: {
    name: 'Toggle',
    description: 'Toggle switch control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string' },
      enabled: { name: 'enabled', type: 'boolean' },
    },
    example: 'component Toggle label: "Dark mode" enabled: true',
  },
  Topbar: {
    name: 'Topbar',
    description: 'Top navigation/header bar.',
    category: 'Navigation',
    properties: {
      title: { name: 'title', type: 'string' },
      subtitle: { name: 'subtitle', type: 'string' },
      icon: iconNameEnum,
      avatar: { name: 'avatar', type: 'boolean' },
      actions: { name: 'actions', type: 'string' },
      user: { name: 'user', type: 'string' },
      variant: variantWithDefaultEnum,
    },
    example: 'component Topbar title: "Dashboard" subtitle: "Overview" icon: "menu" user: "john_doe" avatar: true',
  },
  SidebarMenu: {
    name: 'SidebarMenu',
    description: 'Vertical menu list.',
    category: 'Navigation',
    properties: {
      items: { name: 'items', type: 'string' },
      icons: { name: 'icons', type: 'string' },
      active: { name: 'active', type: 'number' },
    },
    example: 'component SidebarMenu items: "Home,Users,Settings" active: 0',
  },
  Sidebar: {
    name: 'Sidebar',
    description: 'Sidebar panel with title and items.',
    category: 'Navigation',
    properties: {
      title: { name: 'title', type: 'string' },
      items: { name: 'items', type: 'string' },
      active: { name: 'active', type: 'string' },
      itemsMock: { name: 'itemsMock', type: 'number' },
    },
    example: 'component Sidebar title: "Menu" items: "Home,Reports,Settings"',
  },
  Breadcrumbs: {
    name: 'Breadcrumbs',
    description: 'Navigation path component.',
    category: 'Navigation',
    properties: {
      items: { name: 'items', type: 'string' },
      separator: { name: 'separator', type: 'string' },
    },
    example: 'component Breadcrumbs items: "Home,Users,Detail" separator: ">"',
  },
  Tabs: {
    name: 'Tabs',
    description: 'Tabbed navigation component.',
    category: 'Navigation',
    properties: {
      items: { name: 'items', type: 'string' },
      active: { name: 'active', type: 'number' },
    },
    example: 'component Tabs items: "Overview,Details,Activity" active: 1',
  },
  Table: {
    name: 'Table',
    description: 'Tabular data placeholder.',
    category: 'Data',
    properties: {
      title: { name: 'title', type: 'string' },
      columns: { name: 'columns', type: 'string' },
      rows: { name: 'rows', type: 'number' },
      rowsMock: { name: 'rowsMock', type: 'number' },
      mock: { name: 'mock', type: 'string' },
      random: { name: 'random', type: 'boolean' },
      pagination: { name: 'pagination', type: 'boolean' },
      pages: { name: 'pages', type: 'number' },
      paginationAlign: alignEnum,
      actions: { name: 'actions', type: 'string' },
      caption: { name: 'caption', type: 'string' },
      captionAlign: alignEnum,
      border: { name: 'border', type: 'boolean' },
      background: { name: 'background', type: 'boolean' },
      // Backward-compatible alias (common typo) accepted by parser/renderers.
      backround: { name: 'backround', type: 'boolean' },
    },
    example: 'component Table columns: "User,City,Amount" rows: 8 mock: "name,city,amount"',
  },
  List: {
    name: 'List',
    description: 'Vertical list component.',
    category: 'Data',
    properties: {
      title: { name: 'title', type: 'string' },
      items: { name: 'items', type: 'string' },
      itemsMock: { name: 'itemsMock', type: 'number' },
      mock: { name: 'mock', type: 'string' },
      random: { name: 'random', type: 'boolean' },
    },
    example: 'component List title: "Cities" itemsMock: 6 mock: "city"',
  },
  StatCard: {
    name: 'StatCard',
    description: 'Metric card with optional caption and icon.',
    category: 'Data',
    properties: {
      title: { name: 'title', type: 'string' },
      value: { name: 'value', type: 'string' },
      caption: { name: 'caption', type: 'string' },
      icon: iconNameEnum,
    },
    example: 'component StatCard title: "Users" value: "1,234" icon: "users"',
  },
  Card: {
    name: 'Card',
    description: 'Generic content card placeholder.',
    category: 'Layout',
    properties: {
      title: { name: 'title', type: 'string' },
      text: { name: 'text', type: 'string' },
    },
    example: 'component Card title: "Summary" text: "Card content"',
  },
  Chart: {
    name: 'Chart',
    description: 'Chart placeholder with deterministic trend data.',
    category: 'Data',
    properties: {
      type: { name: 'type', type: 'enum', options: ['bar', 'line', 'pie', 'area'] },
      height: { name: 'height', type: 'number' },
    },
    example: 'component Chart type: "line" height: 240',
  },
  ChartPlaceholder: {
    name: 'ChartPlaceholder',
    description: 'Backward-compatible alias of Chart.',
    category: 'Data',
    properties: {
      type: { name: 'type', type: 'enum', options: ['bar', 'line', 'pie', 'area'] },
      height: { name: 'height', type: 'number' },
    },
    example: 'component ChartPlaceholder type: "bar" height: 240',
  },
  Code: {
    name: 'Code',
    description: 'Code snippet display.',
    category: 'Text',
    properties: {
      code: { name: 'code', type: 'string' },
    },
    example: 'component Code code: "const x = 42;"',
  },
  Image: {
    name: 'Image',
    description: 'Image placeholder block.',
    category: 'Media',
    properties: {
      placeholder: imagePlaceholderEnum,
      icon: iconNameEnum,
      height: { name: 'height', type: 'number' },
    },
    example: 'component Image placeholder: "icon" icon: "search" height: 220',
  },
  Icon: {
    name: 'Icon',
    description: 'Standalone icon component.',
    category: 'Media',
    properties: {
      type: { name: 'type', type: 'enum', options: ICON_NAME_OPTIONS },
      size: sizeEnum,
      variant: variantWithDefaultEnum,
    },
    example: 'component Icon type: "home" size: md',
  },
  IconButton: {
    name: 'IconButton',
    description: 'Button that renders an icon.',
    category: 'Action',
    properties: {
      icon: iconNameEnum,
      size: controlSizeEnum,
      variant: variantWithDefaultEnum,
      disabled: { name: 'disabled', type: 'boolean' },
      labelSpace: { name: 'labelSpace', type: 'boolean' },
      padding: controlPaddingEnum,
    },
    example: 'component IconButton icon: "search" variant: default size: md',
  },
  Divider: {
    name: 'Divider',
    description: 'Horizontal separator line.',
    category: 'Layout',
    properties: {},
    example: 'component Divider',
  },
  Separate: {
    name: 'Separate',
    description: 'Invisible spacing separator.',
    category: 'Layout',
    properties: {
      size: { name: 'size', type: 'enum', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    },
    example: 'component Separate size: md',
  },
  Badge: {
    name: 'Badge',
    description: 'Small status label.',
    category: 'Feedback',
    properties: {
      text: { name: 'text', type: 'string' },
      variant: variantWithDefaultEnum,
    },
    example: 'component Badge text: "Active" variant: success',
  },
  Alert: {
    name: 'Alert',
    description: 'Alert/message box.',
    category: 'Feedback',
    properties: {
      variant: variantEnum,
      title: { name: 'title', type: 'string' },
      text: { name: 'text', type: 'string' },
    },
    example: 'component Alert variant: warning title: "Warning" text: "Review this action"',
  },
  Modal: {
    name: 'Modal',
    description: 'Modal overlay container.',
    category: 'Feedback',
    properties: {
      title: { name: 'title', type: 'string' },
      visible: { name: 'visible', type: 'boolean', defaultValue: true },
    },
    example: 'component Modal title: "Confirm action" visible: false',
  },
};

export const LAYOUTS: Record<string, LayoutMetadata> = {
  stack: {
    name: 'stack',
    description: 'Linear layout container.',
    properties: {
      direction: { name: 'direction', type: 'enum', options: ['horizontal', 'vertical'] },
      align: { name: 'align', type: 'enum', options: ['justify', 'left', 'center', 'right'] },
      gap: { name: 'gap', type: 'enum', options: spacingEnum.options },
      padding: { name: 'padding', type: 'enum', options: spacingEnum.options },
    },
    example: 'layout stack(direction: vertical, gap: md, padding: md) { ... }',
  },
  grid: {
    name: 'grid',
    description: 'Grid layout container.',
    properties: {
      columns: { name: 'columns', type: 'number' },
      gap: { name: 'gap', type: 'enum', options: spacingEnum.options },
      align: { name: 'align', type: 'enum', options: ['justify', 'left', 'center', 'right'] },
      padding: { name: 'padding', type: 'enum', options: spacingEnum.options },
    },
    requiredProperties: ['columns'],
    example: 'layout grid(columns: 12, gap: md) { ... }',
  },
  split: {
    name: 'split',
    description: 'Two-column split layout.',
    properties: {
      left: { name: 'left', type: 'number' },
      right: { name: 'right', type: 'number' },
      background: { name: 'background', type: 'string' },
      border: { name: 'border', type: 'boolean' },
      gap: { name: 'gap', type: 'enum', options: spacingEnum.options },
      padding: { name: 'padding', type: 'enum', options: spacingEnum.options },
    },
    example: 'layout split(left: 260, gap: md, border: true) { ... }',
  },
  panel: {
    name: 'panel',
    description: 'Panel container with border/background support.',
    properties: {
      padding: { name: 'padding', type: 'enum', options: spacingEnum.options },
      gap: { name: 'gap', type: 'enum', options: spacingEnum.options },
      background: { name: 'background', type: 'string' },
    },
    example: 'layout panel(padding: md) { ... }',
  },
  card: {
    name: 'card',
    description: 'Card container with spacing/radius options.',
    properties: {
      padding: { name: 'padding', type: 'enum', options: spacingEnum.options },
      gap: { name: 'gap', type: 'enum', options: spacingEnum.options },
      radius: { name: 'radius', type: 'enum', options: ['none', 'sm', 'md', 'lg'] },
      border: { name: 'border', type: 'boolean' },
      background: { name: 'background', type: 'string' },
    },
    example: 'layout card(padding: md, gap: md, radius: md, border: true) { ... }',
  },
};

export const PROPERTY_VALUES: Record<string, string[]> = {
  size: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
  variant: variantWithDefaultEnum.options!,
  align: ['justify', 'left', 'center', 'right'],
  padding: spacingEnum.options!,
  gap: spacingEnum.options!,
  direction: ['horizontal', 'vertical'],
  level: headingLevelEnum.options!,
  spacing: spacingEnum.options!,
};

export const KEYWORDS = {
  topLevel: ['project', 'style', 'colors', 'mocks', 'define'],
  screen: ['screen'],
  layout: ['layout'],
  component: ['component'],
  cell: ['cell'],
  special: ['span', 'columns', 'left', 'right', 'gap', 'padding', 'direction', 'background', 'border', 'Component'],
};

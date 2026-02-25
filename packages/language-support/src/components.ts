/**
 * Wire DSL Component Metadata
 * Used for autocompletion, validation, and code intelligence.
 *
 * Last synced: February 16, 2026
 */
import { ICON_NAME_OPTIONS } from './icon-names.js';

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
const textSizeEnum: PropertyMetadata = { name: 'size', type: 'enum', options: ['xs', 'sm', 'md', 'lg', 'xl'] };
const spacingEnum: PropertyMetadata = {
  name: 'spacing',
  type: 'enum',
  options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
};
const variantEnum: PropertyMetadata = {
  name: 'variant',
  type: 'enum',
  options: [
    'primary', 'secondary', 'success', 'warning', 'danger', 'info',
    // Material Design base families
    'red', 'pink', 'purple', 'deep_purple', 'indigo', 'blue', 'light_blue',
    'cyan', 'teal', 'green', 'light_green', 'lime', 'yellow', 'amber',
    'orange', 'deep_orange', 'brown', 'grey', 'blue_grey',
  ],
};
const variantWithDefaultEnum: PropertyMetadata = {
  name: 'variant',
  type: 'enum',
  options: [
    'default',
    'primary', 'secondary', 'success', 'warning', 'danger', 'info',
    // Material Design base families
    'red', 'pink', 'purple', 'deep_purple', 'indigo', 'blue', 'light_blue',
    'cyan', 'teal', 'green', 'light_green', 'lime', 'yellow', 'amber',
    'orange', 'deep_orange', 'brown', 'grey', 'blue_grey',
  ],
};
const iconNameEnum: PropertyMetadata = {
  name: 'icon',
  type: 'enum',
  options: ICON_NAME_OPTIONS,
};
const controlSizeEnum: PropertyMetadata = {
  name: 'size',
  type: 'enum',
  options: ['xs', 'sm', 'md', 'lg', 'xl'],
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
const disabledProp: PropertyMetadata = {
  name: 'disabled',
  type: 'boolean',
  description: 'Visually dims the component to indicate it is non-interactive.',
  defaultValue: false,
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
      text: { name: 'text', type: 'string', required: true },
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
      text: { name: 'text', type: 'string', required: true },
      size: textSizeEnum,
      bold: { name: 'bold', type: 'boolean', description: 'Applies bold weight to the text.' },
      italic: { name: 'italic', type: 'boolean', description: 'Applies italic style to the text.' },
    },
    example: 'component Text text: "Lorem ipsum dolor sit amet" bold: true',
  },
  Label: {
    name: 'Label',
    description: 'Small label text.',
    category: 'Text',
    properties: {
      text: { name: 'text', type: 'string', required: true },
    },
    example: 'component Label text: "Field label"',
  },
  Paragraph: {
    name: 'Paragraph',
    description: 'Full-width text block with alignment, size, and formatting options.',
    category: 'Text',
    properties: {
      text: { name: 'text', type: 'string', required: true },
      align: alignEnum,
      size: textSizeEnum,
      bold: { name: 'bold', type: 'boolean', description: 'Applies bold weight to the text.' },
      italic: { name: 'italic', type: 'boolean', description: 'Applies italic style to the text.' },
    },
    example: 'component Paragraph text: "Body copy goes here." align: left',
  },
  Button: {
    name: 'Button',
    description: 'Clickable action button.',
    category: 'Action',
    properties: {
      text: { name: 'text', type: 'string', required: true },
      variant: variantWithDefaultEnum,
      size: controlSizeEnum,
      icon: iconNameEnum,
      iconAlign: { name: 'iconAlign', type: 'enum', options: ['left', 'right'] },
      align: alignEnum,
      labelSpace: { name: 'labelSpace', type: 'boolean' },
      padding: controlPaddingEnum,
      block: { name: 'block', type: 'boolean' },
      disabled: disabledProp,
    },
    example: 'component Button text: "Confirm" variant: primary icon: "check" iconAlign: left',
  },
  Link: {
    name: 'Link',
    description: 'Underlined text action without button background.',
    category: 'Action',
    properties: {
      text: { name: 'text', type: 'string', required: true },
      variant: variantEnum,
      size: controlSizeEnum,
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
      iconLeft: { ...iconNameEnum, name: 'iconLeft' },
      iconRight: { ...iconNameEnum, name: 'iconRight' },
      disabled: disabledProp,
    },
    example: 'component Input label: "Search" placeholder: "Type..." iconLeft: "search"',
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
      iconLeft: { ...iconNameEnum, name: 'iconLeft' },
      iconRight: { ...iconNameEnum, name: 'iconRight' },
      disabled: disabledProp,
    },
    example: 'component Select label: "Country" iconLeft: "globe" items: "Spain,France,Germany"',
  },
  Checkbox: {
    name: 'Checkbox',
    description: 'Checkbox control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string', required: true },
      checked: { name: 'checked', type: 'boolean' },
      disabled: disabledProp,
    },
    example: 'component Checkbox label: "I agree" checked: true',
  },
  Radio: {
    name: 'Radio',
    description: 'Radio control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string', required: true },
      checked: { name: 'checked', type: 'boolean' },
      disabled: disabledProp,
    },
    example: 'component Radio label: "Option A" checked: true',
  },
  Toggle: {
    name: 'Toggle',
    description: 'Toggle switch control.',
    category: 'Input',
    properties: {
      label: { name: 'label', type: 'string', required: true },
      enabled: { name: 'enabled', type: 'boolean' },
      disabled: disabledProp,
    },
    example: 'component Toggle label: "Dark mode" enabled: true',
  },
  Topbar: {
    name: 'Topbar',
    description: 'Top navigation/header bar.',
    category: 'Navigation',
    properties: {
      title: { name: 'title', type: 'string', required: true },
      subtitle: { name: 'subtitle', type: 'string' },
      icon: iconNameEnum,
      avatar: { name: 'avatar', type: 'boolean' },
      actions: { name: 'actions', type: 'string' },
      user: { name: 'user', type: 'string' },
      variant: variantWithDefaultEnum,
      border: { name: 'border', type: 'boolean' },
      background: { name: 'background', type: 'color', description: '"true" = cardBg; hex or named Material color = custom; "false" or absent = none.' },
      radius: { name: 'radius', type: 'enum', options: ['none', 'sm', 'md', 'lg', 'xl'] },
      size: { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], defaultValue: 'md', description: 'Height of the topbar.' },
    },
    example: 'component Topbar title: "Dashboard" subtitle: "Overview" icon: "menu" user: "john_doe" avatar: true',
  },
  SidebarMenu: {
    name: 'SidebarMenu',
    description: 'Vertical menu list.',
    category: 'Navigation',
    properties: {
      items: { name: 'items', type: 'string', required: true },
      icons: { name: 'icons', type: 'string' },
      active: { name: 'active', type: 'number' },
      variant: variantWithDefaultEnum,
    },
    example: 'component SidebarMenu items: "Dashboard,Users,Settings" icons: "home,users,settings" active: 0 variant: primary',
  },
  Sidebar: {
    name: 'Sidebar',
    description: 'Sidebar panel with title and items.',
    category: 'Navigation',
    properties: {
      title: { name: 'title', type: 'string' },
      items: { name: 'items', type: 'string', required: true },
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
      items: { name: 'items', type: 'string', required: true },
      separator: { name: 'separator', type: 'string' },
    },
    example: 'component Breadcrumbs items: "Home,Users,Detail" separator: ">"',
  },
  Tabs: {
    name: 'Tabs',
    description: 'Tabbed navigation component.',
    category: 'Navigation',
    properties: {
      items: { name: 'items', type: 'string', required: true },
      active: { name: 'active', type: 'number' },
      variant: variantWithDefaultEnum,
      radius: { name: 'radius', type: 'enum', options: ['none', 'sm', 'md', 'lg', 'full'], defaultValue: 'md' },
      size: { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      icons: { name: 'icons', type: 'string', description: 'Comma-separated icon names aligned to each tab.' },
      flat: { name: 'flat', type: 'boolean', defaultValue: false, description: 'Flat style — underline indicator without filled background.' },
    },
    example: 'component Tabs items: "Overview,Details,Activity" active: 1',
  },
  Table: {
    name: 'Table',
    description: 'Tabular data placeholder.',
    category: 'Data',
    properties: {
      title: { name: 'title', type: 'string' },
      columns: { name: 'columns', type: 'string', required: true },
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
      innerBorder: { name: 'innerBorder', type: 'boolean' },
      background: { name: 'background', type: 'boolean' },
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
  Stat: {
    name: 'Stat',
    description: 'Metric card with optional caption, icon, and variant color.',
    category: 'Data',
    properties: {
      title: { name: 'title', type: 'string', required: true },
      value: { name: 'value', type: 'string', required: true },
      caption: { name: 'caption', type: 'string' },
      icon: iconNameEnum,
      variant: variantWithDefaultEnum,
    },
    example: 'component Stat title: "Users" value: "1,234" icon: "users" variant: primary',
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
      type: { name: 'type', type: 'enum', options: ['bar', 'line', 'pie', 'area'], required: true },
      height: { name: 'height', type: 'number' },
    },
    example: 'component Chart type: "line" height: 240',
  },
  Code: {
    name: 'Code',
    description: 'Code snippet display.',
    category: 'Text',
    properties: {
      code: { name: 'code', type: 'string', required: true },
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
      variant: variantWithDefaultEnum,
      height: { name: 'height', type: 'number' },
      circle: { name: 'circle', type: 'boolean', description: 'Clips the image to a circle (avatar style).', defaultValue: false },
    },
    example: 'component Image placeholder: "icon" icon: "user" variant: primary height: 120',
  },
  Icon: {
    name: 'Icon',
    description: 'Standalone icon component.',
    category: 'Media',
    properties: {
      icon: { name: 'icon', type: 'enum', options: ICON_NAME_OPTIONS, required: true },
      size: sizeEnum,
      variant: variantWithDefaultEnum,
      circle: { name: 'circle', type: 'boolean', description: 'Renders the icon inside a circular background.', defaultValue: false },
    },
    example: 'component Icon icon: "home" size: md',
  },
  IconButton: {
    name: 'IconButton',
    description: 'Button that renders an icon.',
    category: 'Action',
    properties: {
      icon: { name: 'icon', type: 'enum', options: ICON_NAME_OPTIONS, required: true },
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
      text: { name: 'text', type: 'string', required: true },
      variant: variantWithDefaultEnum,
      size: { name: 'size', type: 'enum', options: ['xs', 'sm', 'md', 'lg', 'xl'], defaultValue: 'md' },
      padding: { name: 'padding', type: 'number', description: 'Custom horizontal padding in px.' },
    },
    example: 'component Badge text: "Active" variant: success size: md',
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
      title: { name: 'title', type: 'string', required: true },
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
      direction: { name: 'direction', type: 'enum', options: ['horizontal', 'vertical'], required: true },
      justify: { name: 'justify', type: 'enum', options: ['stretch', 'start', 'center', 'end', 'spaceBetween', 'spaceAround'] },
      align: { name: 'align', type: 'enum', options: ['start', 'center', 'end'] },
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
      justify: { name: 'justify', type: 'enum', options: ['stretch', 'start', 'center', 'end', 'spaceBetween', 'spaceAround'] },
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
  // Note: specific Material shades (e.g. red_400, blue_A200) also work at runtime
  // via the color resolver even though they are not listed here.
  justify: ['stretch', 'start', 'center', 'end', 'spaceBetween', 'spaceAround'],
  align: ['start', 'center', 'end'],
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

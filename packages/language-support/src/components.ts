/**
 * Wire DSL Component Metadata
 * Used for autocompletion, validation, and code intelligence.
 *
 * Last synced: February 16, 2026
 */
import { ICON_NAME_OPTIONS } from './icon-names.js';

export interface PropertyMetadata {
  name: string;
  type: 'string' | 'enum' | 'boolean' | 'number' | 'color' | 'action';
  description?: string;
  defaultValue?: any;
  required?: boolean;
  options?: string[]; // For enums
}

export type EventName =
  | 'onClick'
  | 'onChange'
  | 'onActive'
  | 'onInactive'
  | 'onItemsClick'
  | 'onItemClick'
  | 'onRowClick'
  | 'onClose';

export interface ComponentMetadata {
  name: string;
  description: string;
  category: ComponentCategory;
  properties: Record<string, PropertyMetadata>;
  supportedEvents?: EventName[];
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
const idProp: PropertyMetadata = {
  name: 'id',
  type: 'string',
  description: 'Unique identifier for show/hide/toggle targeting. Format: [a-zA-Z_][a-zA-Z0-9_]*',
};

const visibleProp: PropertyMetadata = {
  name: 'visible',
  type: 'boolean',
  defaultValue: true,
  description: 'Controls element visibility. When false, the element is not rendered in the SVG.',
};

const disabledProp: PropertyMetadata = {
  name: 'disabled',
  type: 'boolean',
  description: 'Visually dims the component to indicate it is non-interactive.',
  defaultValue: false,
};
const imageTypeEnum: PropertyMetadata = {
  name: 'type',
  type: 'enum',
  options: ['landscape', 'portrait', 'square', 'icon', 'avatar'],
};

export const COMPONENTS: Record<string, ComponentMetadata> = {
  Heading: {
    name: 'Heading',
    description: 'Large heading text with level-based typography.',
    category: 'Text',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
      text: { name: 'text', type: 'string', required: true },
    },
    example: 'component Label text: "Field label"',
  },
  Paragraph: {
    name: 'Paragraph',
    description: 'Full-width text block with alignment, size, and formatting options.',
    category: 'Text',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
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
      onClick: { name: 'onClick', type: 'action', description: 'Action(s) triggered on click. Chain with &.' },
    },
    supportedEvents: ['onClick'],
    example: 'component Button text: "Confirm" variant: primary onClick: navigate(Home)',
  },
  Link: {
    name: 'Link',
    description: 'Underlined text action without button background.',
    category: 'Action',
    properties: {
      id: idProp,
      visible: visibleProp,
      text: { name: 'text', type: 'string', required: true },
      variant: variantEnum,
      size: controlSizeEnum,
      onClick: { name: 'onClick', type: 'action', description: 'Action(s) triggered on click. Chain with &.' },
    },
    supportedEvents: ['onClick'],
    example: 'component Link text: "Learn more" variant: info onClick: navigate(Home)',
  },
  Input: {
    name: 'Input',
    description: 'Single-line input field.',
    category: 'Input',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
      label: { name: 'label', type: 'string', required: true },
      checked: { name: 'checked', type: 'boolean' },
      disabled: disabledProp,
      onChange: { name: 'onChange', type: 'action', description: 'Action(s) triggered on any state change. Mutually exclusive with onActive/onInactive.' },
      onActive: { name: 'onActive', type: 'action', description: 'Action(s) triggered when checked. Mutually exclusive with onChange.' },
      onInactive: { name: 'onInactive', type: 'action', description: 'Action(s) triggered when unchecked. Mutually exclusive with onChange.' },
    },
    supportedEvents: ['onChange', 'onActive', 'onInactive'],
    example: 'component Checkbox label: "I agree" onChange: show(submitBtn)',
  },
  Radio: {
    name: 'Radio',
    description: 'Radio control.',
    category: 'Input',
    properties: {
      id: idProp,
      visible: visibleProp,
      label: { name: 'label', type: 'string', required: true },
      checked: { name: 'checked', type: 'boolean' },
      disabled: disabledProp,
      onChange: { name: 'onChange', type: 'action', description: 'Action(s) triggered on any state change. Mutually exclusive with onActive/onInactive.' },
      onActive: { name: 'onActive', type: 'action', description: 'Action(s) triggered when selected. Mutually exclusive with onChange.' },
      onInactive: { name: 'onInactive', type: 'action', description: 'Action(s) triggered when deselected. Mutually exclusive with onChange.' },
    },
    supportedEvents: ['onChange', 'onActive', 'onInactive'],
    example: 'component Radio label: "Option A" onChange: show(optionPanel)',
  },
  Toggle: {
    name: 'Toggle',
    description: 'Toggle switch control.',
    category: 'Input',
    properties: {
      id: idProp,
      visible: visibleProp,
      label: { name: 'label', type: 'string', required: true },
      enabled: { name: 'enabled', type: 'boolean' },
      disabled: disabledProp,
      onChange: { name: 'onChange', type: 'action', description: 'Action(s) triggered on any state change. Mutually exclusive with onActive/onInactive.' },
      onActive: { name: 'onActive', type: 'action', description: 'Action(s) triggered when enabled. Mutually exclusive with onChange.' },
      onInactive: { name: 'onInactive', type: 'action', description: 'Action(s) triggered when disabled. Mutually exclusive with onChange.' },
    },
    supportedEvents: ['onChange', 'onActive', 'onInactive'],
    example: 'component Toggle label: "Dark mode" onChange: toggle(darkPanel)',
  },
  Topbar: {
    name: 'Topbar',
    description: 'Top navigation/header bar.',
    category: 'Navigation',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      color: { name: 'color', type: 'color', description: 'Text color for title. Subtitle inherits this color at 65% opacity.' },
    },
    example: 'component Topbar title: "Dashboard" subtitle: "Overview" icon: "menu" user: "john_doe" avatar: true',
  },
  SidebarMenu: {
    name: 'SidebarMenu',
    description: 'Vertical menu list.',
    category: 'Navigation',
    properties: {
      id: idProp,
      visible: visibleProp,
      items: { name: 'items', type: 'string', required: true },
      icons: { name: 'icons', type: 'string' },
      active: { name: 'active', type: 'number' },
      variant: variantWithDefaultEnum,
      onItemsClick: { name: 'onItemsClick', type: 'string', description: 'Comma-separated screen names aligned by index with items. e.g. "HomeScreen,UsersScreen,SettingsScreen"' },
    },
    supportedEvents: ['onItemsClick'],
    example: 'component SidebarMenu items: "Dashboard,Users,Settings" onItemsClick: "DashboardScreen,UsersScreen,SettingsScreen"',
  },
  Sidebar: {
    name: 'Sidebar',
    description: 'Sidebar panel with title and items.',
    category: 'Navigation',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
      items: { name: 'items', type: 'string', required: true },
      separator: { name: 'separator', type: 'string' },
    },
    example: 'component Breadcrumbs items: "Home,Users,Detail" separator: ">"',
  },
  Tabs: {
    name: 'Tabs',
    description: 'Tabbed navigation component. Link to a layout tabs container via tabsId.',
    category: 'Navigation',
    properties: {
      id: idProp,
      visible: visibleProp,
      items: { name: 'items', type: 'string', required: true },
      active: { name: 'active', type: 'number', description: 'Current active tab index. Managed at runtime by setTab events.' },
      initialActive: { name: 'initialActive', type: 'number', description: 'Starting tab index when the wireframe first loads or resets. Editors and play testers use this as the default state.' },
      tabsId: { name: 'tabsId', type: 'string', description: 'ID of the layout tabs container this component controls.' },
      variant: variantWithDefaultEnum,
      radius: { name: 'radius', type: 'enum', options: ['none', 'sm', 'md', 'lg', 'full'], defaultValue: 'md' },
      size: { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      icons: { name: 'icons', type: 'string', description: 'Comma-separated icon names aligned to each tab.' },
      flat: { name: 'flat', type: 'boolean', defaultValue: false, description: 'Flat style — underline indicator without filled background.' },
      border: { name: 'border', type: 'boolean', defaultValue: true, description: 'Show/hide borders between tabs and around the container.' },
      color: { name: 'color', type: 'color', description: 'Text color for tab labels. Overrides default white (active) and muted (inactive).' },
    },
    example: 'component Tabs items: "Overview,Details,Activity" active: 1 tabsId: mainTabs',
  },
  Table: {
    name: 'Table',
    description: 'Tabular data placeholder.',
    category: 'Data',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      onRowClick: { name: 'onRowClick', type: 'action', description: 'Action triggered when a row is clicked.' },
    },
    supportedEvents: ['onRowClick'],
    example: 'component Table columns: "User,City,Amount" rows: 8 onRowClick: navigate(UserDetail)',
  },
  List: {
    name: 'List',
    description: 'Vertical list component.',
    category: 'Data',
    properties: {
      id: idProp,
      visible: visibleProp,
      title: { name: 'title', type: 'string' },
      items: { name: 'items', type: 'string' },
      itemsMock: { name: 'itemsMock', type: 'number' },
      mock: { name: 'mock', type: 'string' },
      random: { name: 'random', type: 'boolean' },
      onItemClick: { name: 'onItemClick', type: 'action', description: 'Action triggered when a list item is clicked.' },
    },
    supportedEvents: ['onItemClick'],
    example: 'component List title: "Cities" itemsMock: 6 onItemClick: navigate(CityDetail)',
  },
  Stat: {
    name: 'Stat',
    description: 'Metric card with optional caption, icon, and variant color.',
    category: 'Data',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
      code: { name: 'code', type: 'string', required: true },
    },
    example: 'component Code code: "const x = 42;"',
  },
  Image: {
    name: 'Image',
    description: 'Image placeholder block.',
    category: 'Media',
    properties: {
      id: idProp,
      visible: visibleProp,
      type: imageTypeEnum,
      icon: iconNameEnum,
      variant: variantWithDefaultEnum,
      height: { name: 'height', type: 'number' },
      circle: { name: 'circle', type: 'boolean', description: 'Clips the image to a circle (avatar style).', defaultValue: false },
    },
    example: 'component Image type: icon icon: "user" variant: primary height: 120',
  },
  Icon: {
    name: 'Icon',
    description: 'Standalone icon component.',
    category: 'Media',
    properties: {
      id: idProp,
      visible: visibleProp,
      icon: { name: 'icon', type: 'enum', options: ICON_NAME_OPTIONS, required: true },
      size: sizeEnum,
      variant: variantWithDefaultEnum,
      circle: { name: 'circle', type: 'boolean', description: 'Renders the icon inside a circular background.', defaultValue: false },
      padding: { name: 'padding', type: 'number', description: 'Inset padding in pixels between the icon and the element bounding box, reduces the rendered icon size.' },
    },
    example: 'component Icon icon: "home" size: md',
  },
  IconButton: {
    name: 'IconButton',
    description: 'Button that renders an icon.',
    category: 'Action',
    properties: {
      id: idProp,
      visible: visibleProp,
      icon: { name: 'icon', type: 'enum', options: ICON_NAME_OPTIONS, required: true },
      size: controlSizeEnum,
      variant: variantWithDefaultEnum,
      disabled: { name: 'disabled', type: 'boolean' },
      labelSpace: { name: 'labelSpace', type: 'boolean' },
      padding: controlPaddingEnum,
      onClick: { name: 'onClick', type: 'action', description: 'Action(s) triggered on click. Chain with &.' },
    },
    supportedEvents: ['onClick'],
    example: 'component IconButton icon: "search" variant: default onClick: show(searchPanel)',
  },
  Divider: {
    name: 'Divider',
    description: 'Horizontal separator line.',
    category: 'Layout',
    properties: { id: idProp, visible: visibleProp },
    example: 'component Divider',
  },
  Separate: {
    name: 'Separate',
    description: 'Invisible spacing separator.',
    category: 'Layout',
    properties: {
      id: idProp,
      visible: visibleProp,
      size: { name: 'size', type: 'enum', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    },
    example: 'component Separate size: md',
  },
  Badge: {
    name: 'Badge',
    description: 'Small status label.',
    category: 'Feedback',
    properties: {
      id: idProp,
      visible: visibleProp,
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
      id: idProp,
      visible: visibleProp,
      variant: variantEnum,
      title: { name: 'title', type: 'string' },
      text: { name: 'text', type: 'string' },
    },
    example: 'component Alert variant: warning title: "Warning" text: "Review this action"',
  },
};

export const LAYOUTS: Record<string, LayoutMetadata> = {
  stack: {
    name: 'stack',
    description: 'Linear layout container.',
    properties: {
      id:        { name: 'id',        type: 'string', description: 'Identifier for show/hide/toggle targeting. Format: [a-zA-Z_][a-zA-Z0-9_]*' },
      visible:   visibleProp,
      direction: { name: 'direction', type: 'enum', options: ['horizontal', 'vertical'], required: true },
      justify:   { name: 'justify',   type: 'enum', options: ['stretch', 'start', 'center', 'end', 'spaceBetween', 'spaceAround'] },
      align:     { name: 'align',     type: 'enum', options: ['start', 'center', 'end'] },
      gap:       { name: 'gap',       type: 'enum', options: spacingEnum.options },
      padding:   { name: 'padding',   type: 'enum', options: spacingEnum.options },
    },
    example: 'layout stack(direction: vertical, gap: md, padding: md) { ... }',
  },
  grid: {
    name: 'grid',
    description: 'Grid layout container.',
    properties: {
      id:      { name: 'id',      type: 'string', description: 'Identifier for show/hide/toggle targeting. Format: [a-zA-Z_][a-zA-Z0-9_]*' },
      visible: visibleProp,
      columns: { name: 'columns', type: 'number' },
      gap:     { name: 'gap',     type: 'enum', options: spacingEnum.options },
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
      id:         { name: 'id',         type: 'string', description: 'Identifier for show/hide/toggle targeting. Format: [a-zA-Z_][a-zA-Z0-9_]*' },
      visible:    visibleProp,
      left:       { name: 'left',       type: 'number' },
      right:      { name: 'right',      type: 'number' },
      background: { name: 'background', type: 'string' },
      border:     { name: 'border',     type: 'boolean' },
      gap:        { name: 'gap',        type: 'enum', options: spacingEnum.options },
      padding:    { name: 'padding',    type: 'enum', options: spacingEnum.options },
    },
    example: 'layout split(left: 260, gap: md, border: true) { ... }',
  },
  panel: {
    name: 'panel',
    description: 'Panel container with border/background support.',
    properties: {
      id:         { name: 'id',         type: 'string', description: 'Identifier for show/hide/toggle targeting. Format: [a-zA-Z_][a-zA-Z0-9_]*' },
      visible:    visibleProp,
      padding:    { name: 'padding',    type: 'enum', options: spacingEnum.options },
      gap:        { name: 'gap',        type: 'enum', options: spacingEnum.options },
      background: { name: 'background', type: 'string' },
    },
    example: 'layout panel(padding: md) { ... }',
  },
  card: {
    name: 'card',
    description: 'Card container with spacing/radius options. Supports onClick event.',
    properties: {
      id: idProp,
      visible: visibleProp,
      padding: { name: 'padding', type: 'enum', options: spacingEnum.options },
      gap: { name: 'gap', type: 'enum', options: spacingEnum.options },
      radius: { name: 'radius', type: 'enum', options: ['none', 'sm', 'md', 'lg'] },
      border: { name: 'border', type: 'boolean' },
      background: { name: 'background', type: 'string' },
      onClick: { name: 'onClick', type: 'action', description: 'Action(s) triggered when the card is clicked. Chain with &.' },
    },
    example: 'layout card(padding: md, onClick: navigate(Detail)) { ... }',
  },
  tabs: {
    name: 'tabs',
    description: 'Tab panel container. Children are tab blocks. Link to a component Tabs via matching id.',
    properties: {
      id: { name: 'id', type: 'string', description: 'Required. ID to link with a component Tabs tabsId. Format: [a-zA-Z_][a-zA-Z0-9_]*', required: true },
      visible: visibleProp,
      active: { name: 'active', type: 'number', description: 'Index of the initially active tab (0-based).' },
    },
    requiredProperties: ['id'],
    example: 'layout tabs(id: mainTabs) { tab { ... } tab { ... } }',
  },
  modal: {
    name: 'modal',
    description: 'Modal overlay. Optional title shows a header. Closable adds a close button (requires title). Use body/footer sections for structured content.',
    properties: {
      id:       { name: 'id',       type: 'string',  description: 'Identifier for show/hide/toggle targeting. Format: [a-zA-Z_][a-zA-Z0-9_]*' },
      title:    { name: 'title',    type: 'string',  description: 'Header text. Omit for a header-less modal.' },
      visible:  { name: 'visible',  type: 'boolean', defaultValue: true },
      closable: { name: 'closable', type: 'boolean', defaultValue: true, description: 'Show close button. Requires title.' },
      size:     { name: 'size',     type: 'enum',    options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      onClose:  { name: 'onClose',  type: 'action',  description: 'Action when close button is clicked.' },
    },
    example: 'layout modal(id: confirmModal, title: "Confirm?", visible: false, closable: true, onClose: hide(self)) { ... }',
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
  sections: ['cell', 'tab', 'body', 'footer'],
  special: ['span', 'columns', 'left', 'right', 'gap', 'padding', 'direction', 'background', 'border', 'Component'],
  events: ['navigate', 'show', 'hide', 'toggle', 'setTab', 'self'],
};

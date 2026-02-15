/**
 * Wire DSL Component Metadata
 * Used for autocompletion, validation, and code intelligence.
 *
 * Last synced: February 9, 2026
 */

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

// Reusable Enum Definitions
const sizeEnum: PropertyMetadata = { name: 'size', type: 'enum', options: ['sm', 'md', 'lg'] };
const colorEnum: PropertyMetadata = { name: 'color', type: 'color', options: ['primary', 'secondary', 'danger', 'warning', 'info'] };
const variantEnum: PropertyMetadata = { name: 'variant', type: 'enum', options: ['primary', 'secondary', 'danger', 'warning', 'info'] };
const orientationEnum: PropertyMetadata = { name: 'orientation', type: 'enum', options: ['horizontal', 'vertical'] };
const alignEnum: PropertyMetadata = { name: 'align', type: 'enum', options: ['justify', 'left', 'center', 'right'] };
const paddingEnum: PropertyMetadata = { name: 'padding', type: 'enum', options: ['sm', 'md', 'lg'] };
const gapEnum: PropertyMetadata = { name: 'gap', type: 'enum', options: ['sm', 'md', 'lg'] };

export const COMPONENTS: Record<string, ComponentMetadata> = {
  // Text Components
  Heading: {
    name: 'Heading',
    description: 'Large heading/title text',
    properties: {
      text: { name: 'text', type: 'string' },
    },
    example: 'component Heading text: "Users"',
  },
  Text: {
    name: 'Text',
    description: 'Regular paragraph text',
    properties: {
      content: { name: 'content', type: 'string' },
    },
    example: 'component Text content: "Lorem ipsum dolor sit amet..."',
  },
  Label: {
    name: 'Label',
    description: 'Small label text',
    properties: {
      text: { name: 'text', type: 'string' },
    },
    example: 'component Label text: "Field label"',
  },
  // Visual Components
  Icon: {
    name: 'Icon',
    description: 'Renders an icon from a specified set.',
    properties: {
      icon: { name: 'icon', type: 'string' }, // Treated as string as requested
      size: sizeEnum,
      color: colorEnum,
    },
    example: 'component Icon icon: "home" size: md color: primary',
  },
  Image: {
    name: 'Image',
    description: 'Displays an image.',
    properties: {
      src: { name: 'src', type: 'string' },
      alt: { name: 'alt', type: 'string' },
      width: { name: 'width', type: 'number' },
      height: { name: 'height', type: 'number' },
    },
    example: 'component Image src: "/path/to/image.png" alt: "An example image"',
  },
  Spinner: {
    name: 'Spinner',
    description: 'Indicates a loading state.',
    properties: {
      size: sizeEnum,
    },
    example: 'component Spinner size: lg',
  },
  Divider: {
    name: 'Divider',
    description: 'A horizontal or vertical line to separate content.',
    properties: {
      orientation: orientationEnum,
    },
    example: 'component Divider orientation: horizontal',
  },
  // Interactive Components
  Button: {
    name: 'Button',
    description: 'A clickable button.',
    properties: {
      text: { name: 'text', type: 'string' },
      variant: variantEnum,
      icon: { name: 'icon', type: 'string' }, // Treated as string
      onClick: { name: 'onClick', type: 'string' }, // Should be an action/event handler
    },
    example: 'component Button text: "Click me" variant: primary',
  },
  Link: {
    name: 'Link',
    description: 'A hyperlink.',
    properties: {
      text: { name: 'text', type: 'string' },
      href: { name: 'href', type: 'string' },
      target: { name: 'target', type: 'string' },
    },
    example: 'component Link text: "Go to Google" href: "https://google.com"',
  },
  TextInput: {
    name: 'TextInput',
    description: 'An input field for text.',
    properties: {
      placeholder: { name: 'placeholder', type: 'string' },
      value: { name: 'value', type: 'string' },
      label: { name: 'label', type: 'string' },
    },
    example: 'component TextInput label: "Name" placeholder: "Enter your name"',
  },
  Checkbox: {
    name: 'Checkbox',
    description: 'A checkbox input.',
    properties: {
      label: { name: 'label', type: 'string' },
      checked: { name: 'checked', type: 'boolean' },
    },
    example: 'component Checkbox label: "I agree" checked: true',
  },
  Switch: {
    name: 'Switch',
    description: 'A toggle switch.',
    properties: {
      checked: { name: 'checked', type: 'boolean' },
    },
    example: 'component Switch checked: false',
  },
  // Container Components
  Card: {
    name: 'Card',
    description: 'A container with a visual border, often with a title.',
    properties: {
      title: { name: 'title', type: 'string' },
      subtitle: { name: 'subtitle', type: 'string' },
    },
    example: 'component Card title: "My Card" { ... }',
  },
  Alert: {
    name: 'Alert',
    description: 'A message box to draw attention.',
    properties: {
      message: { name: 'message', type: 'string' },
      type: { name: 'type', type: 'color', options: colorEnum.options },
    },
    example: 'component Alert type: danger message: "An error occurred."',
  },
  Table: {
    name: 'Table',
    description: 'Displays data in a tabular format.',
    properties: {
      // Properties not defined as per user request
    },
    example: 'component Table data: [...] { ... }',
  },
};

export const LAYOUTS: Record<string, LayoutMetadata> = {
  stack: {
    name: 'stack',
    description: 'Lays out items in a single line (horizontal or vertical).',
    properties: {
      direction: { name: 'direction', type: 'enum', options: ['horizontal', 'vertical'] },
      align: alignEnum,
      padding: paddingEnum,
      gap: gapEnum,
    },
    example: 'layout stack(direction: horizontal, gap: md) { ... }',
  },
  grid: {
    name: 'grid',
    description: 'Lays out items in a grid.',
    properties: {
      columns: { name: 'columns', type: 'number' },
      gap: gapEnum,
      align: alignEnum,
    },
    example: 'layout grid(columns: 3, gap: lg) { ... }',
  },
};

export const PROPERTY_VALUES: Record<string, string[]> = {
  size: sizeEnum.options!,
  color: colorEnum.options!,
  variant: variantEnum.options!,
  orientation: orientationEnum.options!,
  align: alignEnum.options!,
  padding: paddingEnum.options!,
  gap: gapEnum.options!,
  direction: ['horizontal', 'vertical'],
};

export const KEYWORDS = {
  topLevel: ['project', 'theme', 'colors', 'mocks', 'define'],
  screen: ['screen'],
  layout: ['layout'],
  component: ['component'],
  cell: ['cell'],
  special: ['span', 'sidebar', 'columns', 'gap', 'padding', 'direction', 'Component'],
};

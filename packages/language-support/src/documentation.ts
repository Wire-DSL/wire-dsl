/**
 * Wire DSL Documentation Data
 * Provides detailed hover documentation for components, layouts, and properties
 */

import { COMPONENTS, LAYOUTS } from './components.js';

/**
 * Generate markdown documentation for a component
 */
export function getComponentDocumentation(componentName: string): string | null {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component) return null;

  let doc = `## ${component.name}\n\n`;
  doc += `${component.description}\n\n`;

  const properties = Object.values(component.properties);
  if (properties.length > 0) {
    doc += `**Properties:**\n`;
    properties.forEach((prop) => {
      const propDoc = getPropertyDocumentation(componentName, prop.name);
      const typeInfo = propDoc ? ` - ${propDoc}` : `(${prop.type})`;
      doc += `- \`${prop.name}\`${typeInfo}\n`;
    });
    doc += '\n';
  }

  doc += `**Example:**\n`;
  doc += `\`\`\`wire\n${component.example}\n\`\`\``;

  return doc;
}

/**
 * Generate markdown documentation for a layout
 */
export function getLayoutDocumentation(layoutName: string): string | null {
  const layout = LAYOUTS[layoutName as keyof typeof LAYOUTS];
  if (!layout) return null;

  let doc = `## ${layout.name.toUpperCase()} Layout\n\n`;
  doc += `${layout.description}\n\n`;

  const properties = Object.values(layout.properties);
  if (properties.length > 0) {
    doc += `**Properties:**\n`;
    properties.forEach((prop) => {
      const values = prop.options;
      const valuesInfo = values ? ` - Values: \`${values.join(' | ')}\`` : `(${prop.type})`;
      doc += `- \`${prop.name}\`${valuesInfo}\n`;
    });
    doc += '\n';
  }

  if (layout.requiredProperties && layout.requiredProperties.length > 0) {
    doc += `**Required:**\n`;
    doc += `${layout.requiredProperties.map((p) => `\`${p}\``).join(', ')}\n\n`;
  }

  doc += `**Example:**\n`;
  doc += `\`\`\`wire\n${layout.example}\n\`\`\``;

  return doc;
}

/**
 * Get documentation for a specific property of a component
 */
export function getPropertyDocumentation(componentName: string, propertyName: string): string | null {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component) return null;

  const propDef = component.properties[propertyName];
  if (!propDef) return null;

  // Check if property has enum values
  if (propDef.type === 'enum' && propDef.options) {
    return `Values: \`${propDef.options.join(' | ')}\``;
  }

  // Return generic property documentation based on name
  const propertyDocs: Record<string, string> = {
    text: 'Text content (string)',
    content: 'Text content (string)',
    title: 'Title text (string)',
    label: 'Label text (string)',
    placeholder: 'Placeholder text (string)',
    icon: 'Icon name (string)',
    avatar: 'Enable avatar display (`true`/`false`)',
    visible: 'Show/hide component (`true`/`false`)',
    type: 'Type identifier (string)',
    variant: 'Visual variant style',
    size: 'Component size',
    height: 'Height in pixels (number)',
    rows: 'Number of rows (number)',
    items: 'Comma-separated items (string)',
    columns: 'Table: CSV column names (string) / Grid: number of columns',
    gap: 'Spacing between items',
    padding: 'Internal padding',
    spacing: 'Spacing token (`none|xs|sm|md|lg|xl`)',
    value: 'Display value (string/number)',
  };

  return propertyDocs[propertyName] || null;
}

/**
 * Get documentation for a keyword
 */
export function getKeywordDocumentation(keyword: string): string | null {
  const keywordDocs: Record<string, string> = {
    project: 'Define a Wire DSL project with screens and design tokens',
    screen: 'Define a screen/page in the project',
    layout: 'Define a layout container (stack, grid, split, panel, card)',
    component: 'Place a UI component instance',
    cell: 'Define a cell within a grid layout',
    define: 'Define a reusable custom component (define Component "Name" { ... })',
    Component: 'Keyword for defining custom components',
    style: 'Configure global style tokens (density, spacing, radius, stroke, font, background, theme, device)',
    colors:
      'Define project color tokens (e.g. variants `primary`, `danger` and semantic tokens `accent`, `control`, `chart`)',
    mocks: 'Define mock data for components',
    stack: 'Stack layout - arrange items in row or column',
    grid: 'Grid layout - 12-column flexible grid',
    split: 'Split layout - sidebar + main content',
    panel: 'Panel layout - container with border and padding',
    card: 'Card layout - flexible vertical container',
  };

  return keywordDocs[keyword] || null;
}

/**
 * All documentation data indexed by type
 */
export const DOCUMENTATION = {
  getComponentDocumentation,
  getLayoutDocumentation,
  getPropertyDocumentation,
  getKeywordDocumentation,
};

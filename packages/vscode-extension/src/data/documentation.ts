/**
 * Wire DSL Documentation Data
 * Provides detailed hover documentation for components, layouts, and properties
 */

import { COMPONENTS, LAYOUTS, PROPERTY_VALUES } from './components';

/**
 * Generate markdown documentation for a component
 */
export function getComponentDocumentation(componentName: string): string | null {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component) return null;

  let doc = `## ${component.name}\n\n`;
  doc += `${component.description}\n\n`;

  if (component.properties.length > 0) {
    doc += `**Properties:**\n`;
    component.properties.forEach((prop) => {
      const propDoc = getPropertyDocumentation(componentName, prop);
      const typeInfo = propDoc ? ` - ${propDoc}` : '';
      doc += `- \`${prop}\`${typeInfo}\n`;
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

  if (layout.properties.length > 0) {
    doc += `**Properties:**\n`;
    layout.properties.forEach((prop) => {
      const values = PROPERTY_VALUES[prop as keyof typeof PROPERTY_VALUES];
      const valuesInfo = values ? ` - Values: \`${values.join(' | ')}\`` : '';
      doc += `- \`${prop}\`${valuesInfo}\n`;
    });
    doc += '\n';
  }

  if (layout.requiredProperties.length > 0) {
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

  if (!component.properties.includes(propertyName)) return null;

  // Check if property has enum values
  if (component.propertyValues && component.propertyValues[propertyName]) {
    const values = component.propertyValues[propertyName];
    return `Values: \`${values.join(' | ')}\``;
  }

  // Return generic property documentation based on name
  const propertyDocs: Record<string, string> = {
    text: 'Text content (string)',
    content: 'Text content (string)',
    title: 'Title text (string)',
    label: 'Label text (string)',
    placeholder: 'Placeholder text (string)',
    icon: 'Icon name (string)',
    type: 'Icon type (string)',
    variant: 'Visual variant style',
    size: 'Component size',
    height: 'Height in pixels (number)',
    rows: 'Number of rows (number)',
    items: 'List of items (array)',
    columns: 'Number of columns (number)',
    gap: 'Spacing between items',
    padding: 'Internal padding',
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
    theme: 'Configure design tokens (density, spacing, radius, stroke, font)',
    colors: 'Define custom color values',
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

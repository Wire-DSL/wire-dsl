/**
 * Autocomplete and IntelliSense Provider
 * Shared completion logic for Monaco, VS Code, and other editors
 */

import { COMPONENTS, LAYOUTS, PROPERTY_VALUES, PropertyMetadata } from './components';
import type { DocumentScope } from './context-detection';

export interface CompletionContext {
  line: string;
  position: number;
  word: string;
  lineText: string;
}

export interface CompletionItem {
  label: string;
  kind: 'Keyword' | 'Component' | 'Property' | 'Variable' | 'Value';
  detail?: string;
  documentation?: string;
  insertText?: string;
  range?: { startColumn: number; endColumn: number };
}

// Alias for compatibility
export type CompletionSuggestion = CompletionItem;

// Completion suggestions by context
export const KEYWORD_COMPLETIONS: CompletionItem[] = [
  {
    label: 'project',
    kind: 'Keyword',
    detail: 'Define a Wire project',
    documentation: 'project "My App" { ... }',
    insertText: 'project "',
  },
  {
    label: 'screen',
    kind: 'Keyword',
    detail: 'Define a screen/page',
    documentation: 'screen MyScreen { ... }',
    insertText: 'screen ',
  },
  {
    label: 'component',
    kind: 'Keyword',
    detail: 'Use a component',
    documentation: 'component Button label: "Click"',
    insertText: 'component ',
  },
  {
    label: 'layout',
    kind: 'Keyword',
    detail: 'Define a layout container',
    documentation: 'layout stack(direction: vertical) { ... }',
    insertText: 'layout ',
  },
];

export const CONTAINER_COMPLETIONS: CompletionItem[] = [
  {
    label: 'stack',
    kind: 'Component',
    detail: 'Vertical/horizontal layout',
    documentation: 'layout stack(direction: vertical, gap: md) { ... }',
    insertText: 'stack(',
  },
  {
    label: 'grid',
    kind: 'Component',
    detail: 'Grid layout container',
    documentation: 'layout grid(columns: 2, gap: md) { ... }',
    insertText: 'grid(',
  },
  {
    label: 'panel',
    kind: 'Component',
    detail: 'Panel with border',
    documentation: 'layout panel(padding: md) { ... }',
    insertText: 'panel(',
  },
  {
    label: 'card',
    kind: 'Component',
    detail: 'Card with shadow',
    documentation: 'layout card(padding: md) { ... }',
    insertText: 'card(',
  },
  {
    label: 'split',
    kind: 'Component',
    detail: 'Split pane layout',
    documentation: 'layout split() { ... }',
    insertText: 'split(',
  },
];

export const COMPONENT_COMPLETIONS: CompletionItem[] = [
  {
    label: 'button',
    kind: 'Component',
    detail: 'Interactive button',
    documentation: 'button { label: "Click me" }',
    insertText: 'button {\n\tid: "${1:btn}"\n\tlabel: "${2:Click}"\n\t$0\n}',
  },
  {
    label: 'text',
    kind: 'Component',
    detail: 'Text content',
    documentation: 'text { label: "Content" }',
    insertText: 'text {\n\tlabel: "${1:Content}"\n\t$0\n}',
  },
  {
    label: 'input',
    kind: 'Component',
    detail: 'Text input field',
    documentation: 'input { placeholder: "Enter..." }',
    insertText: 'input {\n\tid: "${1:input}"\n\tplaceholder: "${2:Enter...}"\n\t$0\n}',
  },
  {
    label: 'label',
    kind: 'Component',
    detail: 'Form label',
    documentation: 'label { label: "Name" }',
    insertText: 'label {\n\tlabel: "${1:Name}"\n\t$0\n}',
  },
  {
    label: 'select',
    kind: 'Component',
    detail: 'Dropdown select',
    documentation: 'select { ... }',
    insertText: 'select {\n\tid: "${1:select}"\n\t$0\n}',
  },
  {
    label: 'checkbox',
    kind: 'Component',
    detail: 'Checkbox input',
    documentation: 'checkbox { label: "Agree" }',
    insertText: 'checkbox {\n\tid: "${1:check}"\n\tlabel: "${2:Agree}"\n\t$0\n}',
  },
  {
    label: 'textarea',
    kind: 'Component',
    detail: 'Multi-line text area',
    documentation: 'textarea { ... }',
    insertText: 'textarea {\n\tid: "${1:textarea}"\n\tplaceholder: "${2:Enter text...}"\n\t$0\n}',
  },
  {
    label: 'table',
    kind: 'Component',
    detail: 'Data table',
    documentation: 'table { ... }',
    insertText: 'table {\n\tid: "${1:table}"\n\t$0\n}',
  },
  {
    label: 'form',
    kind: 'Component',
    detail: 'Form container',
    documentation: 'form { ... }',
    insertText: 'form {\n\tid: "${1:form}"\n\t$0\n}',
  },
];

export const PROPERTY_COMPLETIONS: CompletionItem[] = [
  {
    label: 'id',
    kind: 'Property',
    detail: 'Element identifier',
    documentation: 'id: "my-element"',
    insertText: 'id: "${1:element}"',
  },
  {
    label: 'label',
    kind: 'Property',
    detail: 'Display label/text',
    documentation: 'label: "Click me"',
    insertText: 'label: "${1:text}"',
  },
  {
    label: 'width',
    kind: 'Property',
    detail: 'Element width',
    documentation: 'width: 200px',
    insertText: 'width: ${1:100}${2:px|%|rem}',
  },
  {
    label: 'height',
    kind: 'Property',
    detail: 'Element height',
    documentation: 'height: 100px',
    insertText: 'height: ${1:100}${2:px|%|rem}',
  },
  {
    label: 'gap',
    kind: 'Property',
    detail: 'Space between children',
    documentation: 'gap: md',
    insertText: 'gap: ${1:md|sm|lg}',
  },
  {
    label: 'padding',
    kind: 'Property',
    detail: 'Internal spacing',
    documentation: 'padding: 16px',
    insertText: 'padding: ${1:16}px',
  },
  {
    label: 'color',
    kind: 'Property',
    detail: 'Text color',
    documentation: 'color: #000000',
    insertText: 'color: ${1:#000000}',
  },
  {
    label: 'background',
    kind: 'Property',
    detail: 'Background color',
    documentation: 'background: #ffffff',
    insertText: 'background: ${1:#ffffff}',
  },
  {
    label: 'border',
    kind: 'Property',
    detail: 'Border style',
    documentation: 'border: 1px solid #ccc',
    insertText: 'border: ${1:1px} solid ${2:#ccc}',
  },
  {
    label: 'variant',
    kind: 'Property',
    detail: 'Style variant',
    documentation: 'variant: primary|secondary',
    insertText: 'variant: ${1:primary|secondary}',
  },
];

/**
 * Detect if cursor is after 'component' keyword
 * Returns component name if found, null otherwise
 */
export function detectComponentKeyword(lineText: string): string | null {
  // Match "component ComponentName" where ComponentName starts with uppercase
  const match = lineText.match(/\bcomponent\s+([A-Z]\w*)/);
  return match ? match[1] : null;
}

/**
 * Detect if cursor is after ':' in a property context
 * Returns { propertyName, componentName } if in property value context
 */
export function detectPropertyValueContext(
  lineText: string
): { propertyName: string; componentName: string } | null {
  // Match "component ComponentName ... property: "
  const componentMatch = lineText.match(/\bcomponent\s+([A-Z]\w*)/);
  if (!componentMatch) return null;

  const componentName = componentMatch[1];
  const afterComponent = lineText.substring(componentMatch.index! + componentMatch[0].length);
  
  // Match "property: " at the end
  const propMatch = afterComponent.match(/(\w+)\s*:\s*$/);
  if (!propMatch) return null;

  return {
    propertyName: propMatch[1],
    componentName,
  };
}

/**
 * Determine if we're in a property context (after ':')
 */
export function isPropertyContext(lineText: string, position: number): boolean {
  const beforeCursor = lineText.substring(0, position);
  return /:\s*$/.test(beforeCursor);
}

/**
 * Get all available component names (built-in ones that start with uppercase)
 */
export function getAvailableComponents(): CompletionSuggestion[] {
  return Object.entries(COMPONENTS)
    .filter(([name]) => /^[A-Z]/.test(name))  // Only uppercase names
    .map(([name, meta]) => ({
      label: name,
      kind: 'Component' as const,
      detail: meta.description,
      documentation: meta.description,
      insertText: `${name} `,
    }));
}

/**
 * Get properties for a specific component
 */
export function getComponentProperties(componentName: string): CompletionSuggestion[] {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component || !component.properties) {
    return [];
  }

  return Object.values(component.properties)
    .map((prop: PropertyMetadata) => ({
      label: prop.name,
      kind: 'Property' as const,
      detail: prop.type,
      documentation: `Property: ${prop.name} (${prop.type})`,
      insertText: `${prop.name}: `,
    }));
}

/**
 * Get available properties for a component
 * Filters out properties already declared in current line
 */
export function getComponentPropertiesForCompletion(
  componentName: string,
  alreadyDeclaredProps: string[] = []
): CompletionSuggestion[] {
  const componentMeta = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!componentMeta) {
    return PROPERTY_COMPLETIONS;
  }

  const availableProps: CompletionSuggestion[] = Object.values(componentMeta.properties || {})
    .filter((prop) => !alreadyDeclaredProps.includes(prop.name))
    .map((prop) => ({
      label: prop.name,
      kind: 'Property',
      documentation: `Type: ${prop.type}`,
      insertText: `${prop.name}: `,
      detail: `${componentName} property`,
    }));

  return [...availableProps, ...PROPERTY_COMPLETIONS];
}

/**
 * Get property value suggestions for a given component property
 */
export function getPropertyValueSuggestions(
  componentName: string,
  propertyName: string
): CompletionSuggestion[] {
  const componentMeta = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!componentMeta) {
    return [];
  }

  const propDef = componentMeta.properties[propertyName];
  if (!propDef || propDef.type !== 'enum' || !propDef.options) {
    return [];
  }

  return (propDef.options).map((value) => ({
    label: value.toString(),
    kind: 'Value',
    documentation: `Value for ${propertyName}`,
  }));
}

/**
 * Get completions based on hierarchical scope
 * 
 * Hierarchy:
 * - empty-file: suggest 'project' to start
 * - inside-project: suggest project-level keywords (screen, theme, colors, mocks, define)
 * - inside-screen: suggest 'layout' keyword and containers (stack, grid, split, panel, card)
 * - inside-layout: suggest components and nested layouts
 */
export function getScopeBasedCompletions(
  scope: 'empty-file' | 'inside-project' | 'inside-screen' | 'inside-layout'
): CompletionSuggestion[] {
  switch (scope) {
    case 'empty-file':
      // Only suggest project keyword to start
      return KEYWORD_COMPLETIONS.filter(item => item.label === 'project');

    case 'inside-project': {
      // Suggest project-level keywords from KEYWORDS.topLevel
      // topLevel: ['project', 'theme', 'colors', 'mocks', 'define']
      const topLevelCompletions: CompletionSuggestion[] = [
        {
          label: 'screen',
          kind: 'Keyword',
          detail: 'Define a screen/page',
          documentation: 'screen MyScreen { ... }',
          insertText: 'screen ${1:MyScreen} {\n\t$0\n}',
        },
        {
          label: 'theme',
          kind: 'Keyword',
          detail: 'Define theme properties',
          documentation: 'theme { density: "comfortable" ... }',
          insertText: 'theme {\n\t$0\n}',
        },
        {
          label: 'colors',
          kind: 'Keyword',
          detail: 'Define color palette',
          documentation: 'colors { primary: "#007AFF" ... }',
          insertText: 'colors {\n\t$0\n}',
        },
        {
          label: 'mocks',
          kind: 'Keyword',
          detail: 'Define mock data',
          documentation: 'mocks { users: [...] ... }',
          insertText: 'mocks {\n\t$0\n}',
        },
        {
          label: 'define',
          kind: 'Keyword',
          detail: 'Define custom component',
          documentation: 'define Component "Name" { ... }',
          insertText: 'define Component "${1:CustomName}" {\n\t$0\n}',
        },
      ];
      return topLevelCompletions;
    }

    case 'inside-screen':
      // Suggest 'layout' keyword followed by container types
      const layoutCompletions: CompletionSuggestion[] = [
        {
          label: 'layout',
          kind: 'Keyword',
          detail: 'Define a layout container',
          documentation: 'layout stack(direction: vertical) { ... }',
          insertText: 'layout ${1:stack}(${2:direction: vertical}) {\n\t$0\n}',
        },
        ...CONTAINER_COMPLETIONS,
      ];
      return layoutCompletions;

    case 'inside-layout':
      // Suggest components, nested layouts, and cells
      return [
        ...CONTAINER_COMPLETIONS,  // Allow nested layouts
        {
          label: 'cell',
          kind: 'Keyword',
          detail: 'Grid cell within layout',
          documentation: 'cell span: 2 { ... }',
          insertText: 'cell span: ${1:1} {\n\t$0\n}',
        },
        ...COMPONENT_COMPLETIONS,
      ];

    default:
      return [];
  }
}

export default {
  KEYWORD_COMPLETIONS,
  CONTAINER_COMPLETIONS,
  COMPONENT_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  isPropertyContext,
  getComponentPropertiesForCompletion,
  getPropertyValueSuggestions,
  getScopeBasedCompletions,
  detectComponentKeyword,
  detectPropertyValueContext,
  getAvailableComponents,
  getComponentProperties,
};

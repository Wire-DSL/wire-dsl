/**
 * Autocomplete and IntelliSense Provider
 * Shared completion logic for Monaco, VS Code, and other editors
 */

import { COMPONENTS, LAYOUTS, PROPERTY_VALUES } from './components';

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
    insertText: 'project "${1:name}" {\n\t$0\n}',
  },
  {
    label: 'screen',
    kind: 'Keyword',
    detail: 'Define a screen/page',
    documentation: 'screen MyScreen { ... }',
    insertText: 'screen ${1:MyScreen} {\n\t$0\n}',
  },
  {
    label: 'component',
    kind: 'Keyword',
    detail: 'Define a reusable component',
    documentation: 'component MyComponent { ... }',
    insertText: 'component ${1:MyComponent} {\n\t$0\n}',
  },
  {
    label: 'state',
    kind: 'Keyword',
    detail: 'Declare state variable',
    documentation: 'state count: number = 0',
    insertText: 'state ${1:name}: ${2:type} = ${3:value}',
  },
];

export const CONTAINER_COMPLETIONS: CompletionItem[] = [
  {
    label: 'stack',
    kind: 'Component',
    detail: 'Vertical/horizontal layout',
    documentation: 'stack { ... }',
    insertText: 'stack {\n\t$0\n}',
  },
  {
    label: 'grid',
    kind: 'Component',
    detail: 'Grid layout container',
    documentation: 'grid { columns: 2 ... }',
    insertText: 'grid {\n\tcolumns: ${1:2}\n\t$0\n}',
  },
  {
    label: 'panel',
    kind: 'Component',
    detail: 'Panel with border',
    documentation: 'panel { ... }',
    insertText: 'panel {\n\t$0\n}',
  },
  {
    label: 'card',
    kind: 'Component',
    detail: 'Card with shadow',
    documentation: 'card { ... }',
    insertText: 'card {\n\t$0\n}',
  },
  {
    label: 'split',
    kind: 'Component',
    detail: 'Split pane layout',
    documentation: 'split { ... }',
    insertText: 'split {\n\t$0\n}',
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
 * Get completions based on context
 */
export function getContextualCompletions(
  lineText: string,
  word: string
): CompletionItem[] {
  const allCompletions = [
    ...KEYWORD_COMPLETIONS,
    ...CONTAINER_COMPLETIONS,
    ...COMPONENT_COMPLETIONS,
    ...PROPERTY_COMPLETIONS,
  ];

  // Filter by prefix
  const lowerWord = word.toLowerCase();
  return allCompletions.filter(item =>
    item.label.toLowerCase().startsWith(lowerWord)
  );
}

/**
 * Determine if we're in a property context (after ':')
 */
export function isPropertyContext(lineText: string, position: number): boolean {
  const beforeCursor = lineText.substring(0, position);
  return /:\s*$/.test(beforeCursor);
}

/**
 * Get the current word being typed
 */
export function getCurrentWord(lineText: string, position: number): string {
  const beforeCursor = lineText.substring(0, position);
  const match = beforeCursor.match(/\w+$/);
  return match ? match[0] : '';
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

  const availableProps: CompletionSuggestion[] = Object.entries(componentMeta.properties || {})
    .filter(([propName]) => !alreadyDeclaredProps.includes(propName))
    .map(([propName, propType]) => ({
      label: propName,
      kind: 'Property',
      documentation: `Type: ${propType}`,
      insertText: `${propName}: `,
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
  if (!componentMeta || !componentMeta.propertyValues) {
    return [];
  }

  const values = componentMeta.propertyValues[propertyName as keyof typeof componentMeta.propertyValues];
  if (!values) {
    return [];
  }

  return (Array.isArray(values) ? values : [values]).map((value) => ({
    label: value.toString(),
    kind: 'Value',
    documentation: `Value for ${propertyName}`,
  }));
}

export default {
  KEYWORD_COMPLETIONS,
  CONTAINER_COMPLETIONS,
  COMPONENT_COMPLETIONS,
  PROPERTY_COMPLETIONS,
  getContextualCompletions,
  isPropertyContext,
  getCurrentWord,
  getComponentPropertiesForCompletion,
  getPropertyValueSuggestions,
};

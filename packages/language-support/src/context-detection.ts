/**
 * Wire DSL Context Detection
 * Agnóstic logic for detecting document scope and completion context
 * Used by Monaco, VS Code, and other editors
 */

import { COMPONENTS } from './components';

export type DocumentScope = 'empty-file' | 'inside-project' | 'inside-screen' | 'inside-layout';

export interface CompletionContext {
  scope: DocumentScope;
  componentName?: string;
  lineText: string;
  word?: string;
}

/**
 * Determine document scope by analyzing text structure
 * Returns: empty-file | inside-project | inside-screen | inside-layout
 */
export function determineScope(textBeforeCursor: string): DocumentScope {
  const cleanText = textBeforeCursor.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  if (cleanText.trim().length === 0) {
    return 'empty-file';
  }

  // Count braces and track keywords
  let projectCount = 0;
  let screenCount = 0;
  let layoutCount = 0;
  let braceCount = 0;

  const lines = cleanText.split('\n');
  for (const line of lines) {
    if (line.match(/\bproject\s+/)) projectCount++;
    if (line.match(/\bscreen\s+/)) screenCount++;
    if (line.match(/\blayout\s+/)) layoutCount++;

    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;
  }

  if (projectCount === 0) {
    return 'empty-file';
  }

  // Inside project but haven't entered screen yet
  if (screenCount === 0 && braceCount > 0) {
    return 'inside-project';
  }

  // Inside a screen but no layout yet
  if (screenCount > 0 && layoutCount === 0 && braceCount > 0) {
    return 'inside-screen';
  }

  // Inside a layout
  if (layoutCount > 0 && braceCount > 0) {
    return 'inside-layout';
  }

  return 'inside-project';
}

/**
 * Detect if we're inside a component definition (after component keyword)
 * and return the component name if found.
 *
 * Examples:
 * - "component Button" → returns "Button"
 * - "component Button text:" → returns "Button"
 * - "component Button text: "Save"" → returns "Button"
 * - "component B" → returns null (still typing component name)
 */
export function detectComponentContext(lineText: string): string | null {
  // Match "component ComponentName" where ComponentName starts with uppercase
  // This ensures we have a complete, recognized component name
  const match = lineText.match(/component\s+([A-Z]\w*)/);
  if (!match) {
    return null;
  }

  const componentName = match[1];

  // Check if this is a valid component
  if (!COMPONENTS[componentName as keyof typeof COMPONENTS]) {
    return null;
  }

  // Get text after the component name
  const afterComponent = lineText.substring(match.index! + match[0].length);

  // If there's nothing after, or only spaces, we're at the end - show properties
  // Or if we have properties already (word followed by colon), show properties
  if (afterComponent.match(/^\s*$/) || afterComponent.match(/^\s+[\w-]+:/)) {
    return componentName;
  }

  return null;
}

/**
 * Get the current word being typed at the end of a line
 */
export function getCurrentWord(lineText: string): string {
  const match = lineText.match(/[\w-]*$/);
  return match ? match[0] : '';
}

/**
 * Get component properties available for completion
 * Filters out properties that are already declared
 */
export interface CompletionItem {
  label: string;
  kind: 'Keyword' | 'Component' | 'Property' | 'Value' | 'Variable';
  detail?: string;
  documentation?: string;
  insertText?: string;
}

export function getComponentPropertiesForCompletion(
  componentName: string,
  alreadyDeclared: Set<string> = new Set()
): CompletionItem[] {
  const component = COMPONENTS[componentName as keyof typeof COMPONENTS];
  if (!component) return [];

  const items: CompletionItem[] = [];
  const properties = component.properties || [];

  for (const propName of properties) {
    // Skip if this property is already declared
    if (alreadyDeclared.has(propName)) {
      continue;
    }

    const item: CompletionItem = {
      label: propName,
      kind: 'Property',
      detail: `Property of ${componentName}`,
      insertText: `${propName}: `,
    };

    // Add property values if available
    if (component.propertyValues && component.propertyValues[propName]) {
      const values = component.propertyValues[propName];
      item.insertText = `${propName}: ${values.length === 1 ? values[0] : ''}`;
    }

    items.push(item);
  }

  return items;
}

/**
 * Extract already-declared properties from a component line
 * Patterns: propertyName: or propertyName: value
 */
export function getAlreadyDeclaredProperties(lineText: string): Set<string> {
  const declaredProps = new Set<string>();
  const matches = lineText.matchAll(/(\w+):\s*/g);

  for (const match of matches) {
    declaredProps.add(match[1]);
  }

  return declaredProps;
}
